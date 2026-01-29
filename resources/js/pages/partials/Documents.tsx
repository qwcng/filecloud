import { FileText, FileCode, File as FileGeneric, MoreVertical, Eye } from "lucide-react";
import { motion } from "framer-motion";
import axios from "axios";
import React, { useState, useEffect } from "react";
import { FileModal } from "@/components/files/Files";
import { Loader2 } from "lucide-react";

export function DocumentCard({ 
  file, 
  onClick 
}: { 
  file: any; 
  onClick: () => void 
}) {
  // Funkcja dobierająca ikonę do rozszerzenia
  const getFileIcon = (name: string) => {
    const ext = name.split('.').pop()?.toLowerCase();
    if (ext === 'pdf') return <FileText className="text-red-500" />;
    if (['doc', 'docx', 'txt'].includes(ext!)) return <FileText className="text-blue-500" />;
    if (['xls', 'xlsx', 'csv'].includes(ext!)) return <FileGeneric className="text-green-600" />;
    return <FileGeneric className="text-neutral-400" />;
  };

  return (
    <motion.div
      whileHover={{ scale: 1.02 }}
      className="flex items-center gap-4 p-4 bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-xl cursor-pointer hover:shadow-md transition-shadow group"
      onClick={onClick}
    >
      <div className="p-3 bg-neutral-100 dark:bg-neutral-800 rounded-lg group-hover:bg-blue-50 dark:group-hover:bg-blue-900/20 transition-colors">
        {getFileIcon(file.original_name)}
      </div>
      
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-neutral-700 dark:text-neutral-200 truncate">
          {file.original_name}
        </p>
        <p className="text-[11px] text-neutral-400 uppercase tracking-tight">
          {(file.size / 1024).toFixed(1)} KB • {file.created_at}
        </p>
      </div>

      <button className="p-2 opacity-0 group-hover:opacity-100 text-neutral-400 hover:text-blue-500 transition-all">
        <Eye className="w-4 h-4" />
      </button>
    </motion.div>
  );
}
export function DocumentsComponent() {
  const [documents, setDocuments] = useState([]);
  const [selectedFile, setSelectedFile] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Zakładam, że w backendzie masz endpoint filtrujący dokumenty
    axios.get('/getFileByType/document/')
      .then(response => {
        setDocuments(response.data);
      })
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="p-8 flex justify-center"><Loader2 className="animate-spin text-blue-500" /></div>;

  return (
    <div className="p-4">
      {/* Nagłówek sekcji */}
      <div className="mb-6">
        <h2 className="text-lg font-semibold dark:text-white text-neutral-800">Moje Dokumenty</h2>
        <p className="text-sm text-neutral-500">Zarządzaj swoimi plikami PDF i dokumentami tekstowymi</p>
      </div>

      {/* Grid z listą dokumentów */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
        {documents.map((doc: any) => (
          <DocumentCard 
            key={doc.id} 
            file={doc} 
            onClick={() => setSelectedFile(doc)} 
          />
        ))}

        {documents.length === 0 && (
          <div className="col-span-full py-20 text-center border-2 border-dashed border-neutral-200 dark:border-neutral-800 rounded-2xl">
            <FileText className="w-12 h-12 mx-auto mb-3 text-neutral-300" />
            <p className="text-neutral-500">Brak dokumentów w tej kategorii</p>
          </div>
        )}
      </div>

      {/* Wykorzystujemy FileModal do podglądu i akcji (usuwanie/pobieranie) */}
      {selectedFile && (
        <FileModal 
          file={selectedFile} 
          onClose={() => setSelectedFile(null)} 
        />
      )}
    </div>
  );
}