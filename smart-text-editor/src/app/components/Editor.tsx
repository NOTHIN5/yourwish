"use client";

import { useEffect, useRef, useState } from "react";
import { fabric } from "fabric";
import Tesseract from "tesseract.js";
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

    useEffect(() => {
        const addLog = (msg: string) => {
            logRef.current = [...logRef.current, msg].slice(-20); // Keep last 20
            setDebugLogs([...logRef.current]);
        };

        const originalLog = console.log;
        const originalError = console.error;

        console.log = (...args) => {
            // Simplified logging to avoid circular JSON failures
            const msg = args.map(a => {
                if (typeof a === 'object') return '[obj]';
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

        fabric.Image.fromURL(imageUrl, (img) => {
            if (!img || !canvasRef.current) return;

            // Max dimensions
            const maxWidth = window.innerWidth * 0.9;
            const maxHeight = window.innerHeight * 0.8;

            // Scaling logic
            const scale = Math.min(
                maxWidth / (img.width || 1),
                maxHeight / (img.height || 1),
                1 // Don't scale up up
            );

            img.set({
                scaleX: scale,
                scaleY: scale,
                selectable: false, // Background image shouldn't be movable
                evented: false,
            });

            canvas.setWidth((img.width || 0) * scale);
            canvas.setHeight((img.height || 0) * scale);
            canvas.setBackgroundImage(img, canvas.renderAll.bind(canvas));

            // Run OCR
            setIsProcessing(true);
            Tesseract.recognize(
                file,
                'eng',
                { logger: m => console.log(m) }
            ).then((result: any) => {
                const words = result.data.words;
                setIsProcessing(false);

                if (!words) {
                    setIsProcessing(false);
                    return;
                }

                words.forEach((word: any) => {
                    if (word.confidence < 50) return; // Filter bad results

                    // Tesseract bbox: x0, y0, x1, y1
                    const left = word.bbox.x0 * scale;
                    const top = word.bbox.y0 * scale;
                    const width = (word.bbox.x1 - word.bbox.x0) * scale;
                    const height = (word.bbox.y1 - word.bbox.y0) * scale;

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
                        // 1. Get average color for background (In-painting simple version)
                        // Accessing pixel data is complex in Fabric without context.
                        // Simplified: Use a common background color or nearby pixel logic?
                        // For now, we'll try to guess from the image or just White.
                        // BETTER APPROACH: Clone the image area nearby? 
                        // MVP: Fill with White (most documents) or let user pick?
                        // Let's sample the top-left pixel of the bbox from the canvas context.

                        const ctx = canvas.getContext();
                        const pixel = ctx.getImageData(left * window.devicePixelRatio, top * window.devicePixelRatio, 1, 1).data;
                        const bgColor = `rgb(${pixel[0]}, ${pixel[1]}, ${pixel[2]})`;

                        // 2. Create a "patch" to hide original text
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

                        // 3. Add Editable Text
                        const iText = new fabric.IText(word.text, {
                            left,
                            top,
                            fontSize: height * 0.8, // Approx size
                            fontFamily: 'Arial',
                            fill: 'black', // Default text color
                            selectable: true,
                        });

                        canvas.add(iText);
                        canvas.setActiveObject(iText);

                        // Remove the trigger box so it doesn't interfere
                        canvas.remove(box);

                        // Focus and Select all text
                        iText.enterEditing();
                        iText.selectAll();

                        setSelectedText(iText);
                        canvas.requestRenderAll();
                    });

                    canvas.add(box);
                });
            });
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

            {/* DEBUG OVERLAY */}
            <div className="fixed bottom-0 left-0 right-0 h-40 bg-black/90 text-green-400 p-2 font-mono text-xs overflow-y-auto z-[100] opacity-90 pointer-events-none">
                {debugLogs.map((l, i) => <div key={i} className="whitespace-pre-wrap border-b border-gray-800">{l}</div>)}
            </div>
        </div>
    );
}
