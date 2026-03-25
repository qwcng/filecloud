import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, ExternalLink } from "lucide-react";

interface PdfModalProps {
  file: {
    name: string;
    path: string; // Zakładam, że to pełny URL do pliku
  } | null;
  onClose: () => void;
}

export function PdfModal({ file, onClose }: PdfModalProps) {
  if (!file) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-10">
        {/* Backdrop / Tło */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        />

        {/* Kontener Modala */}
        <motion.div
          initial={{ scale: 0.95, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.95, opacity: 0 }}
          className="relative w-full h-full max-w-6xl bg-white dark:bg-neutral-900 rounded-2xl overflow-hidden shadow-2xl flex flex-col"
        >
          {/* Pasek narzędzi modala */}
          <div className="flex items-center justify-between p-4 border-b border-neutral-200 dark:border-neutral-800">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-red-100 dark:bg-red-900/30 rounded-lg">
                <ExternalLink className="w-5 h-5 text-red-600" />
              </div>
              <h3 className="text-sm font-semibold text-neutral-800 dark:text-neutral-200 truncate max-w-[200px] sm:max-w-md">
                {file.name}
              </h3>
            </div>
            
            <button
              onClick={onClose}
              className="p-2 hover:bg-neutral-100 dark:hover:bg-neutral-800 rounded-full transition-colors"
            >
              <X className="w-6 h-6 text-neutral-500" />
            </button>
          </div>

          {/* Native PDF Viewer */}
          <div className="flex-1 bg-neutral-100 dark:bg-neutral-950">
            <embed
              src={`/showFile/${file.id}#toolbar=1`} // #toolbar=1 wymusza pokazanie narzędzi
              type="application/pdf"
              width="100%"
              height="100%"
              className="rounded-b-2xl"
            />
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}