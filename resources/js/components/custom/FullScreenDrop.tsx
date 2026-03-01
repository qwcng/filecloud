import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "motion/react";
import { UploadCloud } from "lucide-react";

interface Props {
  onFilesDropped: (files: FileList | File[]) => void;
}

export default function FullScreenDrop({ onFilesDropped }: Props) {
  const [isDragging, setIsDragging] = useState(false);

  // Funkcja pomocnicza do przetwarzania plików (używana w drop i paste)
  const handleFiles = useCallback((files: FileList | File[]) => {
    if (files.length > 0) {
      onFilesDropped(files);
    }
  }, [onFilesDropped]);

  useEffect(() => {
    const handleDragOver = (e: DragEvent) => {
      const isFile = e.dataTransfer?.types?.includes("Files");
      if (isFile) {
        e.preventDefault();
        setIsDragging(true);
      }
    };

    const handleDragLeave = (e: DragEvent) => {
      e.preventDefault();
      if (e.relatedTarget === null) {
        setIsDragging(false);
      }
    };

    const handleDrop = (e: DragEvent) => {
      const isFile = e.dataTransfer?.types?.includes("Files");
      if (isFile) {
        e.preventDefault();
        setIsDragging(false);
        if (e.dataTransfer?.files) {
          handleFiles(e.dataTransfer.files);
        }
      } else {
        setIsDragging(false);
      }
    };

    // --- OBSŁUGA CTRL + V ---
    const handlePaste = (e: ClipboardEvent) => {
      const items = e.clipboardData?.items;
      if (!items) return;

      const files: File[] = [];
      for (let i = 0; i < items.length; i++) {
        if (items[i].kind === "file") {
          const file = items[i].getAsFile();
          if (file) files.push(file);
        }
      }

      if (files.length > 0) {
        // Opcjonalnie: można tu wywołać animację sukcesu
        handleFiles(files);
      }
    };

    window.addEventListener("dragover", handleDragOver);
    window.addEventListener("dragleave", handleDragLeave);
    window.addEventListener("drop", handleDrop);
    window.addEventListener("paste", handlePaste); // Nasłuchiwanie wklejania

    return () => {
      window.removeEventListener("dragover", handleDragOver);
      window.removeEventListener("dragleave", handleDragLeave);
      window.removeEventListener("drop", handleDrop);
      window.removeEventListener("paste", handlePaste);
    };
  }, [handleFiles]);

  return (
    <AnimatePresence>
      {isDragging && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[100] flex items-center justify-center bg-blue-600/20 backdrop-blur-sm p-10 pointer-events-none"
        >
          <motion.div 
            initial={{ scale: 0.9, y: 20 }}
            animate={{ scale: 1, y: 0 }}
            className="w-full h-full border-4 border-dashed border-blue-500 rounded-3xl bg-black/80 flex flex-col items-center justify-center shadow-2xl"
          >
            <div className="bg-blue-600 p-6 rounded-full mb-4 shadow-lg">
              <UploadCloud className="w-16 h-16 text-white" />
            </div>
            <h2 className="text-3xl font-bold text-white">Upuść pliki tutaj</h2>
            <p className="text-blue-200 mt-2 text-lg font-medium">Lub naciśnij <kbd className="bg-blue-800 px-2 py-1 rounded shadow-inner">Ctrl + V</kbd></p>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}