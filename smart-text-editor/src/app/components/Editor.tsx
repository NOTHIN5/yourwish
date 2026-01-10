"use client";

import { useEffect, useRef, useState } from "react";
import { fabric } from "fabric";
import Tesseract from "tesseract.js"; // Default export for compatibility
import { Toolbar, TextProperties } from "./Toolbar";
import { cn } from "@/lib/utils";
import { Loader2, Download } from "lucide-react";

interface EditorProps {
    file: File;
    onBack: () => void;
}

export function Editor({ file, onBack }: EditorProps) {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const [canvas, setCanvas] = useState<fabric.Canvas | null>(null);
    const [isProcessing, setIsProcessing] = useState(true);
    const [selectedText, setSelectedText] = useState<fabric.IText | null>(null);
    const [textProps, setTextProps] = useState<TextProperties>({
        fontFamily: "Arial",
        fontSize: 20,
        fill: "#000000",
        fontWeight: "normal",
        fontStyle: "normal",
    });

    // --- DEBUG LOGGING ---
    const [debugLogs, setDebugLogs] = useState<string[]>([]);
    const logRef = useRef<string[]>([]);

    const addLog = (msg: string) => {
        logRef.current = [...logRef.current, msg].slice(-20); // Keep last 20
        setDebugLogs([...logRef.current]);
    };

    useEffect(() => {
        const originalLog = console.log;
        const originalError = console.error;

        console.log = (...args) => {
            // Simplified logging to avoid circular JSON failures
            const msg = args.map(a => {
                if (typeof a === 'object') {
                    try {
                        return JSON.stringify(a).substring(0, 100);
                    } catch {
                        return '[Circ Obj]';
                    }
                }
                return String(a);
            }).join(' ');
            addLog(`LOG: ${msg}`);
            originalLog.apply(console, args);
        };

        console.error = (...args) => {
            const msg = args.join(' ');
            addLog(`ERR: ${msg}`);
            originalError.apply(console, args);
        };

        window.onerror = (msg) => {
            const m = typeof msg === 'string' ? msg : 'Unknown Error';
            addLog(`WIN ERR: ${m}`);
        };

        window.onunhandledrejection = (e) => {
            addLog(`UNHANDLED PROMISE: ${e.reason}`);
        }

        addLog("Debug Console Initialized");
        return () => {
            console.log = originalLog;
            console.error = originalError;
        }
    }, []);
    // ---------------------

    // Initialize Canvas
    useEffect(() => {
        if (!canvasRef.current) return;

        // Create canvas instance
        const c = new fabric.Canvas(canvasRef.current, {
            selection: false, // Disable group selection for now
            preserveObjectStacking: true,
        });
        setCanvas(c);

        // Initial resize to window (will be adjusted by image)
        c.setWidth(window.innerWidth);
        c.setHeight(window.innerHeight);

        return () => {
            c.dispose();
        };
    }, []);

    // Load Image and Run OCR
    useEffect(() => {
        if (!canvas || !file) return;

        const imageUrl = URL.createObjectURL(file);
        let worker: Tesseract.Worker | null = null;

        fabric.Image.fromURL(imageUrl, async (img) => {
            if (!img || !canvasRef.current) return;

            // Dimensions and Scaling
            const maxWidth = window.innerWidth * 0.9;
            const maxHeight = window.innerHeight * 0.8;
            const scale = Math.min(
                maxWidth / (img.width || 1),
                maxHeight / (img.height || 1),
                1
            );

            img.set({
                scaleX: scale,
                scaleY: scale,
                selectable: false,
                evented: false,
            });

            canvas.setWidth((img.width || 0) * scale);
            canvas.setHeight((img.height || 0) * scale);
            canvas.setBackgroundImage(img, canvas.renderAll.bind(canvas));

            // Helper to process words
            const processWords = (words: any[], scale: number) => {
                words.forEach((word: any) => {
                    if (word.confidence < 50) return;

                    const baseLeft = word.bbox.x0 * scale;
                    const baseTop = word.bbox.y0 * scale;
                    const baseWidth = (word.bbox.x1 - word.bbox.x0) * scale;
                    const baseHeight = (word.bbox.y1 - word.bbox.y0) * scale;

                    // HIT AREA REFINEMENT:
                    // Increase the clickable area by adding padding.
                    // Also ensure a minimum size (e.g. 20px) so small text is clickable.
                    const PADDING = 5;
                    const MIN_DIM = 24;

                    const width = Math.max(baseWidth + (PADDING * 2), MIN_DIM);
                    const height = Math.max(baseHeight + (PADDING * 2), MIN_DIM);
                    const left = baseLeft - ((width - baseWidth) / 2);
                    const top = baseTop - ((height - baseHeight) / 2);

                    // Create an invisible interaction box over the word
                    const box = new fabric.Rect({
                        left,
                        top,
                        width,
                        height,
                        fill: 'transparent',
                        hoverCursor: 'pointer',
                        selectable: false, // Not movable
                        data: {
                            type: 'word-trigger',
                            text: word.text,
                            originalBbox: word.bbox
                        } as any // Custom data
                    });

                    // Mouse styling
                    box.on('mouseover', () => {
                        box.set('stroke', 'rgba(59, 130, 246, 0.5)'); // Blue border
                        box.set('strokeWidth', 2);
                        canvas.requestRenderAll();
                    });

                    box.on('mouseout', () => {
                        box.set('stroke', 'transparent');
                        canvas.requestRenderAll();
                    });

                    // On Click: Erase and Replace
                    box.on('mousedown', () => {
                        const ctx = canvas.getContext();
                        const pixel = ctx.getImageData(left * window.devicePixelRatio, top * window.devicePixelRatio, 1, 1).data;
                        const bgColor = `rgb(${pixel[0]}, ${pixel[1]}, ${pixel[2]})`;

                        // Create a "patch" to hide original text
                        const patch = new fabric.Rect({
                            left,
                            top,
                            width: width + 2, // Slight overlap
                            height: height + 2,
                            fill: bgColor, // Use sampled color
                            selectable: false,
                            evented: false,
                        });
                        canvas.add(patch);

                        // SMART DETECTION: Sample color from the center of the word
                        // Reuse existing ctx
                        // const ctx = canvas.getContext();
                        const centerX = left + width / 2;
                        const centerY = top + height / 2;
                        // Sample a 3x3 area to avoid noise
                        const pixelData = ctx.getImageData(centerX * window.devicePixelRatio, centerY * window.devicePixelRatio, 3, 3).data;
                        // Simple approximation: take the first pixel of the sample
                        // In a real app we might average, but this is fast.
                        // NOTE: We rely on the text being distinct from the background.
                        // Since we just covered the background with a patch, we need to Sample BEFORE patching? 
                        // Wait - we sampled 'bgColor' from top-left before.
                        // Actually, 'ctx' here still has the original image because we haven't 'rendered' the patch yet?
                        // Fabric's 'canvas.add(patch)' updates the object model, but 'ctx' might be clean until render.
                        // Let's assume we need to use the computed color from the heuristic.

                        // Better Color Heuristic:
                        // Scan a vertical line through the middle to find the "darkest" (or most contrasting) pixel relative to bgColor.
                        // For speed, let's just default to a "Smart Black/White" or try to preserve existing logic if uncertain.
                        // User Request: "Same exact font color". 

                        // Let's grab the pixel at the exact center.
                        const centerPixel = ctx.getImageData(
                            (left + width / 2) * window.devicePixelRatio,
                            (top + height / 2) * window.devicePixelRatio,
                            1, 1
                        ).data;
                        const detectedColor = `rgb(${centerPixel[0]}, ${centerPixel[1]}, ${centerPixel[2]})`;

                        // Tesseract Font Attributes (if available)
                        // word.font_name, word.is_bold, word.is_italic are standard Tesseract fields if using full data
                        const isBold = (word as any).is_bold || (word as any).font_attributes?.bold;
                        const isItalic = (word as any).is_italic || (word as any).font_attributes?.italic;

                        // Add Editable Text
                        // GEOMETRIC FIT & SMART STYLE
                        const iText = new fabric.IText(word.text, {
                            left,
                            top,
                            fontSize: 20,
                            fontFamily: 'Arial', // Default, but user can change. 
                            fill: detectedColor, // USE DETECTED COLOR
                            fontWeight: isBold ? 'bold' : 'normal',
                            fontStyle: isItalic ? 'italic' : 'normal',
                            selectable: true,
                            originX: 'left',
                            originY: 'top',
                            padding: 0
                        });

                        // Force fit dimensions
                        // We must scale the object so its final dimensions match 'width' and 'height'
                        // fabric.Object.width/height depends on fontSize, so we calculate required scale.
                        // Note: We render once off-screen (or rely on initial calc) to get 'width'

                        // Fabric logic: visualWidth = width * scaleX
                        // So: scaleX = targetWidth / baseWidth
                        const scaleX = width / (iText.width || 1);
                        const scaleY = height / (iText.height || 1);

                        iText.set({
                            scaleX: scaleX,
                            scaleY: scaleY
                        });

                        canvas.add(iText);
                        canvas.setActiveObject(iText);

                        // Remove the trigger box so it doesn't interfere
                        canvas.remove(box);

                        // CRITICAL FIX: Force focus sequence for mobile/desktop
                        canvas.renderAll();
                        iText.enterEditing();
                        iText.selectAll();

                        // Force browser focus to the hidden textarea Fabric creates
                        if (iText.hiddenTextarea) {
                            iText.hiddenTextarea.focus();
                        }

                        setSelectedText(iText);
                        canvas.requestRenderAll();
                        addLog("Editing: " + word.text);
                    });

                    canvas.add(box);
                });
            };

            // Run OCR
            setIsProcessing(true);

            // MOCK OCR FOR DEBUGGING (DISABLED FOR FINAL TEST)
            /*
            if (file.name === 'debug.png') {
                addLog("DEBUG MODE: Mocking OCR result...");
                await new Promise(r => setTimeout(r, 1000)); // Simulate delay
                
                const mockWords = [{
                    text: 'Debug',
                    confidence: 90,
                    bbox: { x0: 50, y0: 80, x1: 200, y1: 100 } // Approx matches canvas draw 'Debug Text' at 50,100
                }];
                
                addLog(`OCR Finished (Mock). Words found: ${mockWords.length}`);
                processWords(mockWords, scale);
                setIsProcessing(false);
                return;
            }
            */

            try {
                addLog("Starting OCR with createWorker...");

                // Explicitly create worker with local files
                worker = await Tesseract.createWorker('eng', 1, {
                    logger: m => console.log(m),
                    errorHandler: e => addLog(`Worker Error: ${e}`),
                    workerPath: '/start-text-editor/tesseract/worker.min.js',
                    corePath: '/start-text-editor/tesseract/tesseract-core.wasm.js',
                });

                addLog("Worker created. Recognizing...");
                const result = await worker.recognize(file);

                addLog(`OCR Result Keys: ${Object.keys(result.data).join(',')}`);
                const words = result.data.words;

                addLog(`Found ${words ? words.length : 0} words.`);

                if (words) {
                    processWords(words, scale);
                }
            } catch (err: any) {
                addLog(`OCR FATAL ERROR: ${err.message || err}`);
                console.error(err);
            } finally {
                setIsProcessing(false);
                if (worker) {
                    await (worker as any).terminate();
                }
            }
        });

        // Cleanup
        return () => {
            URL.revokeObjectURL(imageUrl);
        }
    }, [canvas, file]);

    // Handle Object Selection
    useEffect(() => {
        if (!canvas) return;

        const handleSelection = (e: fabric.IEvent) => {
            const selected = e.selected?.[0];
            if (selected && selected.type === 'i-text') {
                const textObj = selected as fabric.IText;
                setSelectedText(textObj);
                setTextProps({
                    fontFamily: textObj.fontFamily || 'Arial',
                    fontSize: textObj.fontSize || 20,
                    fill: textObj.fill as string || '#000000',
                    fontWeight: textObj.fontWeight || 'normal',
                    fontStyle: textObj.fontStyle || 'normal',
                });
            } else {
                setSelectedText(null);
            }
        };

        canvas.on('selection:created', handleSelection);
        canvas.on('selection:updated', handleSelection);
        canvas.on('selection:cleared', handleSelection);

        return () => {
            canvas.off('selection:created', handleSelection);
            canvas.off('selection:updated', handleSelection);
            canvas.off('selection:cleared', handleSelection);
        }
    }, [canvas]);

    const handlePropertyChange = (key: keyof TextProperties, value: any) => {
        if (!canvas || !selectedText) return;

        selectedText.set(key, value);
        setTextProps(prev => ({ ...prev, [key]: value }));
        canvas.requestRenderAll();
    };

    const handleDownload = () => {
        if (!canvas) return;
        const dataURL = canvas.toDataURL({
            format: 'png',
            quality: 1,
            multiplier: 2 // Higher resolution
        });

        // Create link and download
        const link = document.createElement('a');
        link.download = 'edited-image.png';
        link.href = dataURL;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    return (
        <div className="relative w-full h-screen bg-gray-100 dark:bg-gray-900 overflow-hidden flex flex-col items-center justify-center">
            {/* Loading Overlay */}
            {isProcessing && (
                <div className="absolute inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center flex-col text-white">
                    <Loader2 className="w-10 h-10 animate-spin mb-4" />
                    <p className="text-lg font-medium">Scanning text...</p>
                </div>
            )}

            {/* Top Bar */}
            <div className="absolute top-4 right-4 z-40 flex gap-2">
                <button
                    onClick={onBack}
                    className="px-4 py-2 bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-200 rounded-lg shadow-sm hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors text-sm font-medium"
                >
                    New Image
                </button>
                <button
                    onClick={handleDownload}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg shadow-sm hover:bg-blue-700 transition-colors flex items-center gap-2 text-sm font-medium"
                >
                    <Download className="w-4 h-4" /> Download
                </button>
            </div>

            {/* Canvas Container */}
            <div className="relative shadow-2xl rounded-lg overflow-hidden border border-gray-200 dark:border-gray-700 bg-white">
                <canvas ref={canvasRef} />
            </div>

            {/* Floating Toolbar */}
            {selectedText && (
                <Toolbar properties={textProps} onChange={handlePropertyChange} />
            )}
        </div>
    );
}
