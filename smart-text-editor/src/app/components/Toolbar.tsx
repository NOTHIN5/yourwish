"use client";

import { cn } from "@/lib/utils";
import { Bold, Italic, Type } from "lucide-react";

export interface TextProperties {
    fontFamily: string;
    fontSize: number;
    fill: string;
    fontWeight: string | number;
    fontStyle: string;
}

interface ToolbarProps {
    properties: TextProperties;
    onChange: (key: keyof TextProperties, value: any) => void;
    disabled?: boolean;
}

const FONTS = [
    { label: "Arial", value: "Arial" },
    { label: "Times New Roman", value: "Times New Roman" },
    { label: "Courier New", value: "Courier New" },
    { label: "Impact", value: "Impact" },
    { label: "Handwriting (Caveat)", value: "var(--font-caveat), cursive" },
    { label: "Handwriting (Patrick)", value: "var(--font-patrick-hand), cursive" },
    { label: "Marker", value: "var(--font-permanent-marker), cursive" },
    { label: "Modern (Oswald)", value: "var(--font-oswald), sans-serif" },
    { label: "Elegant (Playfair)", value: "var(--font-playfair), serif" },
    { label: "Mono (Geist)", value: "var(--font-geist-mono), monospace" },
];

export function Toolbar({ properties, onChange, disabled }: ToolbarProps) {
    return (
        <div className="fixed bottom-8 left-1/2 -translate-x-1/2 bg-white dark:bg-gray-800 shadow-xl border border-gray-200 dark:border-gray-700 rounded-xl p-4 flex items-center gap-4 z-50 transition-all duration-300">
            {/* Font Family */}
            <div className="flex flex-col gap-1 w-40">
                <label className="text-xs font-medium text-gray-500 uppercase">Font</label>
                <select
                    disabled={disabled}
                    value={properties.fontFamily}
                    onChange={(e) => onChange("fontFamily", e.target.value)}
                    className="h-9 rounded-md border border-gray-300 bg-transparent px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
                >
                    {FONTS.map((font) => (
                        <option
                            key={font.value}
                            value={font.value}
                            style={{ fontFamily: font.value.includes('var') ? font.value : undefined }}
                        >
                            {font.label}
                        </option>
                    ))}
                </select>
            </div>

            <div className="w-px h-8 bg-gray-200 dark:bg-gray-700" />

            {/* Font Size */}
            <div className="flex flex-col gap-1 w-32">
                <label className="text-xs font-medium text-gray-500 uppercase flex justify-between">
                    Size <span>{properties.fontSize}px</span>
                </label>
                <input
                    type="range"
                    min="10"
                    max="200"
                    disabled={disabled}
                    value={properties.fontSize}
                    onChange={(e) => onChange("fontSize", parseInt(e.target.value))}
                    className="h-2 w-full cursor-pointer appearance-none rounded-lg bg-gray-200 dark:bg-gray-700 accent-blue-600 disabled:opacity-50"
                />
            </div>

            <div className="w-px h-8 bg-gray-200 dark:bg-gray-700" />

            {/* Style Toggles */}
            <div className="flex items-end gap-1 pb-0.5">
                <button
                    disabled={disabled}
                    onClick={() =>
                        onChange("fontWeight", properties.fontWeight === "bold" ? "normal" : "bold")
                    }
                    className={cn(
                        "p-2 rounded-md hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors disabled:opacity-50",
                        properties.fontWeight === "bold" && "bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400"
                    )}
                    title="Bold"
                >
                    <Bold className="w-4 h-4" />
                </button>
                <button
                    disabled={disabled}
                    onClick={() =>
                        onChange("fontStyle", properties.fontStyle === "italic" ? "normal" : "italic")
                    }
                    className={cn(
                        "p-2 rounded-md hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors disabled:opacity-50",
                        properties.fontStyle === "italic" && "bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400"
                    )}
                    title="Italic"
                >
                    <Italic className="w-4 h-4" />
                </button>
            </div>

            <div className="w-px h-8 bg-gray-200 dark:bg-gray-700" />

            {/* Color */}
            <div className="flex flex-col gap-1">
                <label className="text-xs font-medium text-gray-500 uppercase">Color</label>
                <div className="relative">
                    <input
                        type="color"
                        disabled={disabled}
                        value={properties.fill}
                        onChange={(e) => onChange("fill", e.target.value)}
                        className="h-9 w-12 cursor-pointer appearance-none rounded-md border border-gray-300 bg-transparent p-1 disabled:opacity-50"
                    />
                </div>
            </div>
        </div>
    );
}
