import React, { useState, useEffect } from 'react';
import { Head, router } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from "@/types";
import { dashboard } from "@/routes";
import { Save, Download, Trash2, ArrowLeft, Copy, Check } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { useTranslation } from "react-i18next";

const breadcrumbs: BreadcrumbItem[] = [
  { title: "panel", href: dashboard().url },
  { title: "Pliki", href: dashboard().url },
  { title: "Edytor", href: "#" },
];

export default function ModernNotatnik({
  fileContent,
  fileId,
  fileName,
}: {
  fileContent?: string;
  fileId?: string;
  fileName?: string;
}) {
  const { t } = useTranslation();
  const [filename, setFilename] = useState(fileName || 'notatka.txt');
  const [text, setText] = useState(fileContent || '');
  const [status, setStatus] = useState('gotowy');
  const [isCopying, setIsCopying] = useState(false);

  // 🔹 Synchronizacja danych z props
  useEffect(() => {
    if (fileContent !== undefined) setText(fileContent);
    if (fileName !== undefined) setFilename(fileName);
  }, [fileContent, fileName]);

  // 🔹 Pobieranie pliku (eksport)
  function handleDownload() {
    const blob = new Blob([text], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename.endsWith('.txt') ? filename : `${filename}.txt`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success(t("files.exportedSuccess", "Wyeksportowano pomyślnie"));
  }

  // 🔹 Zapis pliku do backendu
  function handleSaveFile(closeAfter = false) {
    if (!fileId) return toast.error(t("files.noFileId", "Brak ID pliku do zapisu."));

    router.post(
      `/edit/${fileId}/save`,
      {
        content: text,
        filename: filename,
      },
      {
        onStart: () => setStatus('zapisywanie...'),
        onSuccess: () => {
          toast.success(t("files.savedSuccess", "Zapisano pomyślnie"));
          if (closeAfter) {
            router.visit(dashboard().url);
          }
        },
        onError: (errors) => {
          console.error('Save error:', errors);
          toast.error(t("files.saveError", "Błąd przy zapisie"));
        },
      }
    );
  }

  const handleCopy = () => {
    navigator.clipboard.writeText(text);
    setIsCopying(true);
    toast.success(t("files.copiedToClipboard", "Skopiowano do schowka"));
    setTimeout(() => setIsCopying(false), 2000);
  };

  return (
    <AppLayout breadcrumbs={breadcrumbs}>
      <Head title={`${t("files.editor", "Edytor")} - ${filename}`} />
      
      <div className="flex h-full flex-1 flex-col gap-4 p-4 md:p-8">
        {/* Header toolbar */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between bg-white dark:bg-neutral-900 p-4 rounded-xl border dark:border-neutral-800 shadow-sm">
          <div className="flex flex-1 items-center gap-3">
             <Button variant="ghost" size="icon" onClick={() => router.visit(dashboard().url)}>
                <ArrowLeft className="h-5 w-5" />
             </Button>
             <div className="flex-1 max-w-sm">
                <Input
                    type="text"
                    value={filename}
                    onChange={(e) => setFilename(e.target.value)}
                    placeholder={t("files.filenamePlaceholder", "Nazwa pliku...")}
                    className="h-9"
                />
             </div>
          </div>

          <div className="flex items-center gap-2">
            <Button 
                variant="outline" 
                size="sm" 
                onClick={handleDownload}
                className="gap-2"
            >
              <Download className="h-4 w-4" />
              <span className="hidden md:inline">{t("files.download", "Pobierz")}</span>
            </Button>
            
            <Button 
                variant="outline" 
                size="sm" 
                onClick={() => {
                    setText('');
                    toast.info(t("files.cleared", "Wyczyszczono edytor"));
                }}
                className="gap-2 text-red-500 hover:text-red-600 hover:bg-red-50/50 dark:hover:bg-red-900/10"
            >
              <Trash2 className="h-4 w-4" />
              <span className="hidden md:inline">{t("files.clear", "Wyczyść")}</span>
            </Button>

            <Button 
                size="sm" 
                onClick={() => handleSaveFile(false)}
                className="gap-2 bg-blue-600 hover:bg-blue-700"
            >
              <Save className="h-4 w-4" />
              {t("files.save", "Zapisz")}
            </Button>
          </div>
        </div>

        {/* Editor Area */}
        <div className="flex-1 flex flex-col bg-white dark:bg-neutral-900 rounded-xl border dark:border-neutral-800 shadow-sm overflow-hidden min-h-[500px]">
             <div className="flex items-center justify-between px-4 py-2 border-b dark:border-neutral-800 bg-gray-50/50 dark:bg-neutral-800/50">
                <span className="text-xs font-medium text-neutral-500 uppercase tracking-wider">
                    {t("files.content", "Treść pliku")}
                </span>
                <Button variant="ghost" size="sm" onClick={handleCopy} className="h-8 gap-2">
                    {isCopying ? <Check className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" />}
                    <span className="text-xs">{isCopying ? t("files.copied", "Skopiowano") : t("files.copy", "Kopiuj")}</span>
                </Button>
             </div>
             
             <textarea
                value={text}
                onChange={(e) => setText(e.target.value)}
                spellCheck={false}
                className="flex-1 w-full bg-transparent p-6 font-mono text-sm resize-none focus:outline-none dark:text-neutral-200 leading-relaxed custom-scrollbar"
                placeholder={t("files.editorPlaceholder", "Zacznij pisać...")}
             />

             <div className="px-4 py-2 border-t dark:border-neutral-800 bg-gray-50/50 dark:bg-neutral-800/50 flex justify-between items-center">
                <div className="text-[10px] text-neutral-400 uppercase tracking-widest font-bold">
                    {text.length} {t("files.characters", "znaków")} | {text.split(/\s+/).filter(Boolean).length} {t("files.words", "słów")}
                </div>
                <div className="flex items-center gap-2">
                   <div className={`h-2 w-2 rounded-full ${status === 'zapisywanie...' ? 'bg-yellow-500 animate-pulse' : 'bg-green-500'}`} />
                   <span className="text-[10px] text-neutral-500 font-medium uppercase tracking-wider">{status}</span>
                </div>
             </div>
        </div>
      </div>
    </AppLayout>
  );
}
