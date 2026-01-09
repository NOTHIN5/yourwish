"use client";

import { useState } from "react";
import dynamic from "next/dynamic";
import { Editor } from "./components/Editor";
import { Upload, Wand2, Download } from "lucide-react";

export default function Home() {
  const [file, setFile] = useState<File | null>(null);

  const handleUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
    }
  };

  return (
    <main className="min-h-screen bg-white dark:bg-gray-950 text-gray-900 dark:text-gray-100 font-sans selection:bg-blue-100 dark:selection:bg-blue-900">
      {!file ? (
        <div className="container mx-auto px-4 h-screen flex flex-col items-center justify-center max-w-4xl">
          <div className="mb-12 text-center space-y-4">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-blue-500 to-violet-600 mb-6 shadow-lg shadow-blue-500/20">
              <Wand2 className="w-8 h-8 text-white" />
            </div>
            <h1 className="text-5xl font-extrabold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-gray-900 via-gray-700 to-gray-900 dark:from-white dark:via-gray-200 dark:to-white">
              Smart Text Editor
            </h1>
            <p className="text-xl text-gray-500 dark:text-gray-400 max-w-lg mx-auto leading-relaxed">
              Upload an image. Click any text to edit it correctly. The future of image editing is here.
            </p>
          </div>

          <div className="w-full max-w-xl">
            <div className="flex flex-col items-center justify-center p-8 text-center border-2 border-dashed border-gray-300 dark:border-gray-700 rounded-xl bg-gray-50 dark:bg-gray-800 hover:bg-gray-100 dark:hover:bg-gray-750 transition-colors">
              <p className="text-gray-500 dark:text-gray-400 mb-4">
                Drag & Drop an image here, or click to select
              </p>
              <input
                type="file"
                accept="image/*"
                onChange={handleUpload}
                className="file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100 cursor-pointer"
              />
            </div>
          </div>

          <div className="mt-12 grid grid-cols-1 gap-8 sm:grid-cols-3 text-center">
            <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm border border-gray-100 dark:border-gray-800">
              <h3 className="font-semibold text-gray-900 dark:text-white mb-2">Upload</h3>
              <p className="text-sm text-gray-500">Drag and drop any image containing text.</p>
            </div>
            <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm border border-gray-100 dark:border-gray-800">
              <h3 className="font-semibold text-gray-900 dark:text-white mb-2">Edit</h3>
              <p className="text-sm text-gray-500">Click text to auto-erase and type new content.</p>
            </div>
            <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm border border-gray-100 dark:border-gray-800">
              <h3 className="font-semibold text-gray-900 dark:text-white mb-2">Download</h3>
              <p className="text-sm text-gray-500">Export your modified image instantly.</p>
            </div>
          </div>
        </div>
      ) : (
        <Editor file={file} onBack={() => setFile(null)} />
      )}
    </main>
  );
}
