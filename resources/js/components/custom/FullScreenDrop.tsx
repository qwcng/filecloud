import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { UploadCloud } from "lucide-react";

interface Props {
  onFilesDropped: (files: FileList) => void;
}

export default function FullScreenDrop({ onFilesDropped }: Props) {
  const [isDragging, setIsDragging] = useState(false);

  useEffect(() => {
    const handleDragOver = (e: DragEvent) => {
      // SPRAWDZENIE: Czy przeciągany obiekt to pliki?
      // e.dataTransfer.types to pseudo-tablica (DOMStringList)
      const isFile = e.dataTransfer?.types?.includes("Files");
      
      if (isFile) {
        e.preventDefault();
        setIsDragging(true);
      }
    };

    const handleDragLeave = (e: DragEvent) => {
      e.preventDefault();
      // Tylko jeśli wychodzimy poza okno
      if (e.relatedTarget === null) {
        setIsDragging(false);
      }
    };

    const handleDrop = (e: DragEvent) => {
      // Ponownie sprawdzamy, czy to pliki, by uniknąć błędów przy upuszczeniu linku
      const isFile = e.dataTransfer?.types?.includes("Files");
      
      if (isFile) {
        e.preventDefault();
        setIsDragging(false);
        
        if (e.dataTransfer?.files && e.dataTransfer.files.length > 0) {
          onFilesDropped(e.dataTransfer.files);
        }
      } else {
        // Jeśli to nie pliki, ignorujemy i zamykamy overlay
        setIsDragging(false);
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
          // Pointer-events-none na overlayu zapobiega migotaniu przy najechaniu na ikony, 
          // ale tutaj potrzebujemy obsługi, więc zostawiamy standardowo.
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
            <p className="text-blue-200 mt-2 text-lg font-medium">Aby natychmiast przesłać je do folderu</p>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}