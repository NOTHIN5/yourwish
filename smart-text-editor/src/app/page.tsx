"use client";

import { useState } from "react";
import dynamic from "next/dynamic";
import { Upload } from "./components/Upload";

// Dynamically import Editor to disable SSR (Fabric.js requires window)
const Editor = dynamic(() => import("./components/Editor").then((mod) => mod.Editor), {
  ssr: false,
  loading: () => (
    <div className="flex items-center justify-center h-screen bg-gray-50 dark:bg-gray-900">
      <p className="text-gray-500">Loading Editor...</p>
    </div>
  ),
});

export default function Home() {
  const [file, setFile] = useState<File | null>(null);

  return (
    <main className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {!file ? (
        <div className="container mx-auto px-4 py-20 flex flex-col items-center justify-center min-h-screen">
          <div className="text-center mb-12">
            <h1 className="text-4xl font-extrabold tracking-tight text-gray-900 dark:text-white sm:text-5xl md:text-6xl mb-6">
              Smart Text <span className="text-blue-600">Editor</span>
            </h1>
            <p className="max-w-2xl mx-auto text-xl text-gray-500 dark:text-gray-400">
              Upload an image, click on any text to edit it, and download your changes.
              Everything happens in your browser—completely private and temporary.
            </p>
          </div>

          <Upload onImageSelect={setFile} />

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
