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
  } from "lucide-react";
  import { folder } from "@/routes/files";
import { ref } from "process";
import { motion } from "motion/react"
import {FileCard, FileModal,ShareModal,UploadFileCard} from "@/components/files/Files"
import {FolderCard} from "@/components/files/Folders"
import { Toaster } from "@/components/ui/sonner"
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
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
  const url = window.location.pathname;
  let fileName = url.split("/").pop();
  const breadcrumbs: BreadcrumbItem[] = [
    { title: "panel", href: dashboard().url + "/" },
    // { title: "Pliki", href: dashboard().url + "/files" },
    { title: fileName, href: dashboard().url + "/" + fileName },  // { title: "Mój folder", href: dashboard().url }
  ];

  if(fileName === 'dashboard'){
  fileName=null;
  }
  console.log("Nazwa pliku z URL:", fileName);

  type FileData = {
    id: number;
    name: string;
    type: "image" | "pdf" | "excel" | "ppt" | "zip" | "mp3" | "video" | "other";
    size: string;
    created_at: string;
    url: string;
  };

  

  

  // --- ShareModal i FileModal pozostają bez zmian ---


  
  
  export default function Dashboard() {
    const [files, setFiles] = useState<FileData[]>([]);
    const [selectedFile, setSelectedFile] = useState<FileData | null>(null);
    const [urlr, setUrlr] = useState(window.location.pathname.split("/").pop() || '');
    const [refreshTrigger, setRefreshTrigger] = useState(0);
    const [selecting, setSelecting] = useState(false);
    const [selectedFiles, setSelectedFiles] = useState<FileData[]>([]);
    const [clicks, setClicks] = useState(0);
    useEffect(() => {
    setUrlr(window.location.pathname.split("/").pop() || '');
}, [refreshTrigger]);
const refreshData = () => {
  setRefreshTrigger(prev => prev + 1);

};

    useEffect(() => {
      console.log("Current URL segment:", urlr);

    }, [urlr]);

    const mapMimeToType = (mime: string): FileData["type"] => {
      if (mime.startsWith("image/")) return "image";
      if (mime.startsWith("audio/")) return "mp3";
      if (mime.startsWith("video/")) return "video";
      if (mime === "application/pdf") return "pdf";
      if (mime.includes("word")) return "other";
      if (mime.includes("excel") || mime.includes("spreadsheet")) return "excel";
      if (mime.includes("presentation")) return "ppt";
      if (mime.includes("zip") || mime.includes("compressed")) return "zip";
      return "other";
    };
    const [folders, setFolders] = useState<{ id: number; name: string }[]>([]);

    useEffect(() => {
      axios.get(`/folders/${urlr}`).then((response) => {
        setFolders(response.data);
        // console.log("Folders response:", response.data);
      });
    }, [refreshTrigger]);


    useEffect(() => {
      axios.get(`/files/${urlr}`).then((response) => {
        const mappedFiles: FileData[] = response.data.files.map((f: any) => ({
          id: f.id,
          name: f.original_name,
          type: mapMimeToType(f.mime_type),
          size: f.size,
          created_at: f.created_at,
          url: f.url,
        }));
        setFiles(mappedFiles);
      });
    }, [refreshTrigger]);

    // useEffect(() => {
    //   alert('123');
    // }, [clicks]);
    // console.log("Folders:", refreshTrigger);
    return (
      <AppLayout breadcrumbs={breadcrumbs}>
        <Head title="Moje Pliki" />
      <Toaster
      position="top-center"
      richColors
      swipeDirections={['right', 'left', 'top', 'bottom']}
      duration={2000}
      toastOptions={{
        className: "text-lg px-4 py-3 rounded-lg", // większy tekst i padding
        iconTheme: {
          primary: "#f87171", // kolor ikony
          secondary: "#fff",
        },
      }}
      />

        <div className="flex h-full flex-1 flex-col gap-4 overflow-x-auto rounded-xl p-4">
          <h3 className="text-lg font-semibold">📂 Moje Pliki
            
          </h3>
          {/* <button className="border" onClick={()=>{setClicks(clicks+1)}}>{clicks}</button> */}
          <Dialog>
      <form>
         <DialogTrigger asChild>
          <Button variant="outline">Nowy Folder</Button>
        </DialogTrigger>
        {/* <DialogTrigger asChild>
          <Button variant="outline">Open Dialog</Button>
        </DialogTrigger> */}
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Stwórz folder.</DialogTitle>
            <DialogDescription>
              Podaj nazwę nowego folderu.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4">
            <div className="grid gap-3">
              <Label htmlFor="name-1">Nazwa folderu</Label>
              <Input id="name-1" name="name" defaultValue="Nowy folder" />
            </div>
            
          </div>
          <DialogFooter>
            <DialogClose asChild>
              <Button variant="outline">Cancel</Button>
            </DialogClose>
            <DialogClose asChild>
              <Button type="submit" onClick={() => {

                // alert('123')
                router.post('/createFolder', {
                  name: (document.querySelector('input[name="name"]') as HTMLInputElement).value,
                  parent: urlr === 'dashboard' ? null : urlr,
                });
                refreshData();
              }}>Zapisz</Button>
            </DialogClose>
          </DialogFooter>
        </DialogContent>
      </form>
    </Dialog>
            
          <button onClick={() => selecting ? setSelecting(false) : setSelecting(true)}
          className="w-34 rounded bg-blue-600 px-4 py-2 text-white hover:bg-blue-700 ">
            {selecting ? 'Anuluj' : 'Zaznacz pliki'}
          </button>
          {selecting ? (
            <>
              <span> zaznaczono {selectedFiles.length} plików</span>
              <button className=" w-34 ml-2 rounded bg-red-600 px-4 py-2 text-white hover:bg-red-700" onClick={() => {
                if (confirm(`Czy na pewno chcesz usunąć zaznaczone pliki?`)) {
                  console.log(selectedFiles)
                  selectedFiles.forEach(async (file) => {

                    try {
                      console.log(file)
                      await axios.delete(`/files/${file.id}`);
                      // alert('Plik został usunięty.');
                      setSelectedFiles(files.filter(f => f.id !== file.id));
                      // setSelectedFiles([]);
                      setSelecting(false);
                    } catch (error) {
                      console.error('Błąd podczas usuwania pliku:', error);
                      alert('Wystąpił błąd podczas usuwania pliku.');
                    }
                  });
                  refreshData();
                }
              }}> Usuń zaznaczone pliki</button>
            </>
          ) : null}
          <div className="flex flex-wrap gap-4 lg:justify-start justify-center sm:">
            <UploadFileCard folderName={urlr} refreshData={refreshData} />
             {/* <FolderCard folderName="Nowy Folder" /> */}
            {folders.map((folder) => (
              <>
              
              <FolderCard key={folder.id} href={folder.id}  onFolderClick={refreshData}folderName={folder.name} />
              </>
            ))}
          </div>
          <div className="flex flex-wrap gap-4 lg:justify-start justify-center">
            {files.map((file) => (
              <>
              {selecting && (<input type="checkbox" onChange={(e) => {
                if (e.target.checked) {
                  setSelectedFiles([...selectedFiles, file]);
                } else {
                  setSelectedFiles(selectedFiles.filter(f => f.id !== file.id));
                }
              }} className=" left-[-10] h-5 w-5 z-10" />)}
              <FileCard key={file.id} file={file} onClick={() => setSelectedFile(file)} refreshData={refreshData} />
              </>
            ))}
          </div>
          {selectedFile && <FileModal file={selectedFile} onClose={() => setSelectedFile(null)} />}
        </div>
      </AppLayout>
    );
  }
