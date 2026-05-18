import React, { useState } from "react";
import AppLayout from "@/layouts/app-layout";
import { type BreadcrumbItem } from "@/types";
import { dashboard } from "@/routes";
import { Head, router } from "@inertiajs/react";
import { X } from "lucide-react";
import { startGlobalUpload } from "@/components/custom/UploadProgressWidget";

const breadcrumbs: BreadcrumbItem[] = [
  { title: "panel", href: dashboard().url },
  { title: "Dodaj pliki", href: dashboard().url },
];

export default function AddFile() {
  const [files, setFiles] = useState<File[]>([]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setFiles([...files, ...Array.from(e.target.files)]);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (files.length === 0) return;
    
    startGlobalUpload(files, null);
    setFiles([]);
    router.visit(dashboard().url);
  };

  const removeFile = (index: number) => {
    setFiles(files.filter((_, i) => i !== index));
  };

  return (
    <AppLayout breadcrumbs={breadcrumbs}>
      <Head title="Dodaj pliki" />

      <div className="flex h-full flex-1 flex-col rounded-xl p-4">
        <h3 className="text-lg font-semibold mb-4">📂 Dodaj Pliki</h3>

        <form
          onSubmit={handleSubmit}
          className="relative w-full max-w-md space-y-4"
        >
          {/* Dropzone / input */}
          <label
            htmlFor="file-upload"
            className="cursor-pointer flex flex-col items-center justify-center border-2 border-dashed border-gray-300 rounded-lg p-6 hover:border-blue-500"
          >
            <svg
              className="mb-3 w-10 h-10 text-gray-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
              ></path>
            </svg>
            <span className="text-gray-600 text-center">
              Kliknij lub przeciągnij pliki tutaj, aby je przesłać
            </span>
            <input
              id="file-upload"
              type="file"
              className="hidden"
              multiple
              onChange={handleFileChange}
            />
            {files.length > 0 && (
            <div className="space-y-2">
              {files.map((file, i) => (
                <div
                  key={i}
                  className="flex items-center justify-between rounded border px-3 py-2 text-sm"
                >
                  <span>{file.name}</span>
                  <button
                    type="button"
                    onClick={() => removeFile(i)}
                    className="text-red-500 hover:text-red-700"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>
              ))}
            </div>
          )}
          </label>

          {/* Lista wybranych plików */}
          

          {/* Przyciski */}
          <button
            type="submit"
            disabled={files.length === 0}
            className="w-full rounded bg-blue-600 px-4 py-2 text-white hover:bg-blue-700 disabled:bg-gray-400"
          >
            Prześlij pliki
          </button>

          <span className="block text-sm text-gray-600 text-center">
            {files.length > 0
              ? `${files.length} plików gotowych do przesłania`
              : "Brak plików do przesłania"}
          </span>
        </form>
      </div>
    </AppLayout>
  );
}
