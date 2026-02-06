import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { UploadCloud } from "lucide-react";

interface Props {
  onFilesDropped: (files: FileList) => void;
}

export default function FullScreenDrop({ onFilesDropped }: Props) {
  const [isDragging, setIsDragging] = useState(false);

  // Obsługa przeciągania nad całym oknem
  useEffect(() => {
    const handleDragOver = (e: DragEvent) => {
      e.preventDefault();
      setIsDragging(true);
    };

    const handleDragLeave = (e: DragEvent) => {
      e.preventDefault();
      // Tylko jeśli wychodzimy z okna (nie do pod-elementu)
      if (e.relatedTarget === null) {
        setIsDragging(false);
      }
    };

    const handleDrop = (e: DragEvent) => {
      e.preventDefault();
      setIsDragging(false);
      
      if (e.dataTransfer?.files && e.dataTransfer.files.length > 0) {
        onFilesDropped(e.dataTransfer.files);
      }
    };

    window.addEventListener("dragover", handleDragOver);
    window.addEventListener("dragleave", handleDragLeave);
    window.addEventListener("drop", handleDrop);

    return () => {
      window.removeEventListener("dragover", handleDragOver);
      window.removeEventListener("dragleave", handleDragLeave);
      window.removeEventListener("drop", handleDrop);
    };
  }, [onFilesDropped]);

  return (
    <AnimatePresence>
      {isDragging && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[100] flex items-center justify-center bg-blue-600/20 backdrop-blur-sm p-10"
        >
          <motion.div 
            initial={{ scale: 0.9, y: 20 }}
            animate={{ scale: 1, y: 0 }}
            className="w-full h-full border-4 border-dashed border-blue-500 rounded-3xl bg-black/70 flex flex-col items-center justify-center shadow-2xl"
          >
            <div className="bg-blue-100 p-6 rounded-full mb-4">
              <UploadCloud className="w-16 h-16 text-blue-600 " />
            </div>
            <h2 className="text-3xl font-bold text-gray-800">Upuść pliki tutaj</h2>
            <p className="text-gray-500 mt-2 text-lg font-medium">Aby natychmiast przesłać je do folderu</p>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}