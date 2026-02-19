import { useState, useEffect, useRef, use } from "react";
  import { Head, router,useForm,Link  } from "@inertiajs/react";
  import AppLayout from "@/layouts/app-layout";
  import { type BreadcrumbItem } from "@/types";
  import { dashboard } from "@/routes";
  
  import MusicPlayer from "@/components/MusicPlayer";
  import axios from "axios";
    import {
    FileImage,
    FileText,
    FileSpreadsheet,
    FileArchive,
    FileAudio,
    X,
    EllipsisVertical,
    EyeIcon,
    Edit2Icon,
    Trash2Icon,
    DownloadIcon,
    Share2Icon,
    LucideInfinity,
    InfoIcon,
    UserPlusIcon,
    ArrowUpNarrowWide,
    ArrowDownNarrowWide,
  } from "lucide-react";
  import { folder} from "@/routes/files";
import { ref } from "process";
import { motion } from "motion/react"
import {FileCard, FileModal,ShareModal,UploadFileCard, DeletedFileCard} from "@/components/files/Files"
import {FolderCard} from "@/components/files/Folders"
import { Toaster } from "@/components/ui/sonner"
import { Skeleton } from "@/components/ui/skeleton";
import { SelectScrollUpButton } from "@radix-ui/react-select";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { useTranslation, initReactI18next } from "react-i18next";
import HttpApi from "i18next-http-backend";
import i18n from "i18next";
import { NewFile, NewFolder, WipeTrash } from "@/components/NavigationBar";
import { FileData } from "@/types/index";
export default function Trash(){
const breadcrumbs: BreadcrumbItem[] = [
    { title: 'panel', href: dashboard() },
    { title: 'Kosz', href: folder('trash') },
];

const { t } = useTranslation();
const [files, setFiles] = useState<Array<any>>([]);
const [selectedFile, setSelectedFile] = useState<FileData | null>(null);
const mapMimeToType = (mime: string): FileData["type"] => {
      if (mime.startsWith("image/")) return "image";
      if (mime.startsWith("audio/")) return "mp3";
      if (mime.startsWith("video/")) return "video";
      if (mime === "application/pdf") return "pdf";
      if (mime.includes("word")) return "other";
      if (mime.includes("excel") || mime.includes("spreadsheet")) return "excel";
      if (mime.includes("presentation")) return "ppt";
      // if (mime.includes("zip") || mime.includes("compressed")) return "zip";
      if (mime === "application/epub+zip") return "epub";
      return "other";
    };
useEffect(() => {
    // Fetch trashed files from the server
    axios.get('/getTrashFiles')
        .then(response => {
          console.log(response.data.files);
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
            console.log(response.data);
        })
        .catch(error => {
            console.error('Error fetching trashed files:', error);
        });
}, []);
const removeFileFromUI = (id?: number) => {
    if (id) {
        setFiles((prev) => prev.filter((file) => file.id !== id));
    } else {
        setFiles([]); // Czyści całą listę (dla opcji "Opróżnij kosz")
    }
};
return(

    <AppLayout
    breadcrumbs={breadcrumbs}>
      <Head title="Kosz"></Head>
      <Toaster position="top-center" richColors />
        <div className="flex h-full flex-1 flex-col gap-4 overflow-x-auto rounded-xl p-4">
          
          <h3 className="text-lg font-semibold">🧳 Usunięte Pliki</h3>
         <WipeTrash files={files} refreshData={removeFileFromUI} />
          <div className="flex flex-wrap gap-4 lg:justify-start justify-center">
            {files.length === 0 ? (
              <p className="text-muted-foreground col-span-full text-center">Brak usuniętych plików.</p>
            ) : (

              files.map((file) => (
                <FileCard key={file.id} file={file} onClick={() =>{setSelectedFile(file)}} refreshData={removeFileFromUI} />
              ))
            )}
             {selectedFile && <FileModal file={selectedFile} onClose={() => setSelectedFile(null)} />}
          </div>
        </div>
    </AppLayout>

)

}
