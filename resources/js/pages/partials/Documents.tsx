import { FileText, FileCode, File as FileGeneric, MoreVertical, Eye, FileImage, FileSpreadsheet, FileArchive, Book, FileAudio } from "lucide-react";
import { motion } from "framer-motion";
import axios from "axios";
import React, { useState, useEffect, JSX } from "react";
import { FileModal } from "@/components/files/Files";
import { Loader2 } from "lucide-react";
import { FileData } from "@/types/Files";

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
//just a comment for commit
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
export function Card({
  file,
}: {
  file: FileData;
}) {
   const icons: Record<FileData["type"], JSX.Element> = {
    image: <FileImage className="mx-auto mb-2 h-20 w-20 text-blue-500" />,
    pdf: <FileText className="mx-auto mb-2 h-20 w-20 text-red-500" />,
    excel: <FileSpreadsheet className="mx-auto mb-2 h-20 w-20 text-green-500" />,
    ppt: <FileSpreadsheet className="mx-auto mb-2 h-20 w-20 text-orange-500" />,
    zip: <FileArchive className="mx-auto mb-2 h-20 w-20 text-yellow-500" />,
    epub: <Book className="mx-auto mb-2 h-20 w-20 text-indigo-500" />,
    mp3: <FileAudio className="mx-auto mb-2 h-20 w-20 text-purple-500" />,
    other: <FileText className="mx-auto mb-2 h-20 w-20 text-gray-500" />,
  };
  return (
    <motion.div
      whileHover={{ y: -4 }}
      whileTap={{ scale: 0.98 }}
      className="group flex flex-col items-center w-34 [@media(max-width:450px)]:w-24 cursor-pointer"
      
    >
      {/* Kontener na zdjęcie z efektem hover */}
      <div className="relative w-full aspect-square overflow-hidden rounded-2xl bg-neutral-100 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 transition-shadow group-hover:shadow-xl group-hover:shadow-blue-500/10">
        {icons[file.type]}
        
        {/* Subtelny overlay przy najechaniu */}
        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/5 transition-colors" />
      </div>

      {/* Tekst - bardziej czytelny i dopasowany do dark mode */}
      <span className="mt-2 px-1 w-full text-center">
        <p className="text-[13px] font-medium text-neutral-700 dark:text-neutral-200 line-clamp-1 truncate transition-colors group-hover:text-blue-500">
          {file.original_name}
        </p>
        {/* <p className="text-[10px] text-neutral-400 dark:text-neutral-500 uppercase tracking-tighter">
          Obraz
        </p> */}
      </span>
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
          <Card 
            key={doc.id}
            file={doc}
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