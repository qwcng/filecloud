import { useState, useEffect } from "react";
import { Head } from "@inertiajs/react";
import AppLayout from "@/layouts/app-layout";
import { type BreadcrumbItem } from "@/types";
import { dashboard } from "@/routes";
import axios from "axios";
import { folder } from "@/routes/files";
import { FileCard, FileModal } from "@/components/files/Files";
import { Toaster } from "@/components/ui/sonner";
import { useTranslation } from "react-i18next";
import { WipeTrash } from "@/components/NavigationBar";
import { FileData } from "@/types/index";

export default function Trash() {
  const { t } = useTranslation();
  
  const breadcrumbs: BreadcrumbItem[] = [
    { title: t("breadcrumbs.dashboard"), href: dashboard() },
    { title: t("trash.title"), href: folder('trash') },
  ];

  const [files, setFiles] = useState<Array<FileData>>([]);
  const [selectedFile, setSelectedFile] = useState<FileData | null>(null);

  const mapMimeToType = (mime: string): FileData["type"] => {
    if (mime.startsWith("image/")) return "image";
    if (mime.startsWith("audio/")) return "mp3";
    if (mime.startsWith("video/")) return "video";
    if (mime === "application/pdf") return "pdf";
    if (mime.includes("word")) return "other";
    if (mime.includes("excel") || mime.includes("spreadsheet")) return "excel";
    if (mime.includes("presentation")) return "ppt";
    if (mime === "application/epub+zip") return "epub";
    return "other";
  };

  useEffect(() => {
    axios.get('/getTrashFiles')
      .then(response => {
        const mappedFiles: FileData[] = response.data.files.map((f: any) => ({
          id: f.id,
          name: f.original_name,
          type: mapMimeToType(f.mime_type),
          size: f.size,
          created_at: f.created_at,
          deleted_at: f.deleted_at,
          url: f.url,
          deleted: f.deleted_at,
        }));
        setFiles(mappedFiles);
      })
      .catch(error => {
        console.error('Error fetching trashed files:', error);
      });
  }, []);

  const removeFileFromUI = (id?: number) => {
    if (id) {
      setFiles((prev) => prev.filter((file) => file.id !== id));
    } else {
      setFiles([]);
    }
  };

  return (
    <AppLayout breadcrumbs={breadcrumbs}>
      <Head title={t("trash.title")}></Head>
      <Toaster position="top-center" richColors />
      <div className="flex h-full flex-1 flex-col gap-4 overflow-x-auto rounded-xl p-4">
        
        <h3 className="text-lg font-semibold">🧳 {t("trash.header")}</h3>
        <WipeTrash files={files} refreshData={removeFileFromUI} />

        <div className="flex flex-wrap gap-4 lg:justify-start justify-center">
          {files.length === 0 ? (
            <p className="text-muted-foreground col-span-full text-center">
              {t("trash.empty")}
            </p>
          ) : (
            files.map((file) => (
              <FileCard 
                key={file.id} 
                file={file} 
                onClick={() => setSelectedFile(file)} 
                refreshData={removeFileFromUI} 
              />
            ))
          )}
          {selectedFile && (
            <FileModal 
              file={selectedFile} 
              onClose={() => setSelectedFile(null)} 
            />
          )}
        </div>
      </div>
    </AppLayout>
  );
}