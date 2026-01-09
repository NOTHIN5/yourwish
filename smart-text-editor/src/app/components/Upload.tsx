"use client";

import { useState, useCallback } from "react";
import { cn } from "@/lib/utils";
import { UploadCloud } from "lucide-react";

interface UploadProps {
    onImageSelect: (file: File) => void;
}

export function Upload({ onImageSelect }: UploadProps) {
    const [isDragging, setIsDragging] = useState(false);

    const handleDrag = useCallback((e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
        if (e.type === "dragenter" || e.type === "dragover") {
            setIsDragging(true);
        } else if (e.type === "dragleave") {
            setIsDragging(false);
        }
    }, []);

    const handleDrop = useCallback(
        (e: React.DragEvent) => {
            e.preventDefault();
            e.stopPropagation();
            setIsDragging(false);

            if (e.dataTransfer.files && e.dataTransfer.files[0]) {
                onImageSelect(e.dataTransfer.files[0]);
            }
        },
        [onImageSelect]
    );

    const handleChange = useCallback(
        (e: React.ChangeEvent<HTMLInputElement>) => {
            if (e.target.files && e.target.files[0]) {
                onImageSelect(e.target.files[0]);
            }
        },
        [onImageSelect]
    );

    return (
        <div
            className={cn(
                "flex flex-col items-center justify-center w-full max-w-2xl mx-auto h-64 border-2 border-dashed rounded-lg cursor-pointer transition-colors duration-200 ease-in-out",
                isDragging
                    ? "border-blue-500 bg-blue-50 dark:bg-blue-950/20"
                    : "border-gray-300 dark:border-gray-700 hover:border-gray-400 dark:hover:border-gray-600",
                "bg-white dark:bg-gray-800"
            )}
            onDragEnter={handleDrag}
            onDragLeave={handleDrag}
            onDragOver={handleDrag}
            onDrop={handleDrop}
        >
            <label className="flex flex-col items-center justify-center w-full h-full cursor-pointer">
                <div className="flex flex-col items-center justify-center pt-5 pb-6">
                    <UploadCloud className="w-12 h-12 mb-4 text-gray-500 dark:text-gray-400" />
                    <p className="mb-2 text-sm text-gray-500 dark:text-gray-400">
                        <span className="font-semibold">Click to upload</span> or drag and drop
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                        PNG, JPG, JPEG (Max 10MB)
                    </p>
                </div>
                <input
                    type="file"
                    className="hidden"
                    accept="image/*"
                    onChange={handleChange}
                />
            </label>
        </div>
    );
}
