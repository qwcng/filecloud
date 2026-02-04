  import { useState, useEffect, useRef, useMemo, useCallback } from "react";
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
import {FileCard, FileModal,ShareModal,UploadFileCard, UploadFolderCard} from "@/components/files/Files"
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
import { NewFile, NewFolder, UploadFilesDialog, UploadFolderDialog } from "@/components/NavigationBar";
import { FullScreenDrop } from "@/components/custom/FullScreenDrop";
import debounce from 'lodash/debounce';
  const url = window.location.pathname;
  let fileName = url.split("/").pop();




  if(fileName === 'dashboard'){
  fileName=null;
  }
  console.log("Nazwa pliku z URL:", fileName);

  type FileData = {
    id: number;
    name: string;
    type: "image" | "pdf" | "excel" | "ppt" | "zip" | "mp3" | "video" | "epub" | "other";
    size: string;
    created_at: string;
    url: string;
  };





  // --- ShareModal i FileModal pozostają bez zmian ---
i18n
  .use(HttpApi)                  // 🔥 musisz włączyć backend
  .use(initReactI18next)
  .init({
    supportedLngs: ["en", "pl","ru","fr"],
    fallbackLng: "en",
    lng: localStorage.getItem("lang") || "pl",

    backend: {
      loadPath: "/locales/{{lng}}/translation.json"
    },

    interpolation: {
      escapeValue: false
    }
  });




  export default function Dashboard() {
    const [files, setFiles] = useState<FileData[]>([]);
    const [selectedFile, setSelectedFile] = useState<FileData | null>(null);
    const [urlr, setUrlr] = useState(window.location.pathname.split("/").pop() || '');
    const [refreshTrigger, setRefreshTrigger] = useState(0);
    const [selecting, setSelecting] = useState(false);
    const [selectedFiles, setSelectedFiles] = useState<FileData[]>([]);
    const [breadcrumbs,setBreadcrumbs] = useState();
    const [sharedFile,setSharedFile] = useState(false);
    const [shareLink,setShareLink] =useState('');
    const [clicks, setClicks] = useState(0);
    const [foldersLoading, setFoldersLoading] = useState(true);
    const [filesLoading, setFilesLoading] = useState(true);
    const [sorting,setSorting] = useState(localStorage.getItem("sorting") || 'dateDesc');
    const [searchTerm, setSearchTerm] = useState("");
    // const [sortedFiles,setSortedFiles] = useState<FileData[]>([]);
          
    
    useEffect(() => {
    setUrlr(window.location.pathname.split("/").pop() || '');



    


}, [refreshTrigger]);
const refreshData = () => {
  setRefreshTrigger(prev => prev + 1);

};

    useEffect(() => {
      if(urlr == 'dashboard'){
        setUrlr('');
      }
      console.log("Current URL segment:", urlr);

    }, [ urlr,refreshTrigger]);
    const debouncedSearch = useCallback(
  debounce((query: string) => {
    if (query.length > 1) {
      axios.get(`/search/${query}`).then((response) => {
        const mappedFiles: FileData[] = response.data.map((f: any) => ({
          id: f.id,
          name: f.original_name,
          type: mapMimeToType(f.mime_type),
          size: f.size,
          created_at: f.created_at,
          url: f.url,
        }));

        setFiles(mappedFiles);
        console.log("Search resultss:", mappedFiles);
      }).catch(err => console.error("Search error:", err));
    } else if (query.length === 0) {
      refreshData();
    }
  }, 300), // Czekaj 300ms po ostatnim klawiszu
  []
);

const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
  const value = e.target.value;
  setSearchTerm(value); // Aktualizujemy input natychmiast, żeby nie było laga w UI
  debouncedSearch(value.toLowerCase());
};
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
    const [folders, setFolders] = useState<{ id: number; name: string, filesCount: number }[]>([]);

    useEffect(() => {
      setFoldersLoading(true);
      console.log("Fetching folders for parent:", urlr);
      axios.get(`/folders/${urlr}`).then((response) => {
        setFoldersLoading(false);
        console.log(response.data);
        setFolders(response.data);

        // console.log("Folders response:", response.data);
      });
    }, [refreshTrigger]);
      useEffect(() => {
          
              axios.get(`/pathTo/${urlr}`).then((response) => {
                  // response.data = [{id,name}, ...]
                  const bc: BreadcrumbItem[] = [
                      { title: "panel", href: dashboard().url + "/" },
                      ...response.data.map((folder: any) => ({
                          title: folder.name,
                          href: `/dashboard/${folder.id}`,
                      }))
                  ];
                  setBreadcrumbs(bc);
              });
         
              // setBreadcrumbs([{ title: "panel", href: dashboard().url + "/" }]);
          
      }, [urlr, refreshTrigger]);

useEffect(() => {
    // 1. Definiujemy funkcję asynchroniczną wewnątrz efektu
    const fetchFiles = async () => {
        setFilesLoading(true);
        
        // 2. Ustalamy endpoint w zależności od warunku
        let endpoint = `/files/${urlr}`;
        if (urlr === "favorite") {
            endpoint = `/getFavorites`;
        }

        console.log(`Fetching files from: ${endpoint}`);

        try {
            // 3. Wykonujemy zapytanie (jedno miejsce, zamiast dwóch)
            const response = await axios.get(endpoint);
            console.log("Otrzymane dane plików:", response.data);
            
            // 4. Mapujemy dane (logika napisana tylko raz)
            const mappedFiles: FileData[] = response.data.files.map((f: any) => ({
                id: f.id,
                name: f.original_name,
                type: mapMimeToType(f.mime_type),
                size: f.size,
                created_at: f.created_at,
                url: f.url,
                favorite: f.is_favorite
            }));

            setFiles(mappedFiles);
            console.log(mappedFiles);

            // 5. Specyficzna logika dla sharedFile
            if (urlr === "sharedFile") {
                setSharedFile(true);
            }

        } catch (error) {
            console.error("Błąd pobierania plików:", error);
            // Tutaj warto dodać np. toast.error("Nie udało się pobrać plików");
        } finally {
            // 6. Wyłączamy loading niezależnie od sukcesu czy błędu
            setFilesLoading(false);
        }
    };

    fetchFiles();

// Dodajemy urlr do zależności! Inaczej zmiana folderu nie odświeży widoku.
}, [urlr, refreshTrigger]);
const sortedFiles = useMemo(() => {
  const sorted = [...files]; // Tworzymy kopię, by nie mutować oryginału
  sorted.sort((a, b) => {
      switch (sorting) {
        case "nameAsc": return a.name.localeCompare(b.name);
        case "nameDesc": return b.name.localeCompare(a.name);
        case "sizeAsc": return parseInt(a.size) - parseInt(b.size); // Upewnij się, że size to liczba
        case "sizeDesc": return parseInt(b.size) - parseInt(a.size);
        case "dateAsc": return a.created_at.localeCompare(b.created_at);
        case "dateDesc": return b.created_at.localeCompare(a.created_at);
        default: return 0;
      }
  });
  
  // Jeśli masz filtrowanie po nazwie (wyszukiwanie lokalne), dodaj je tutaj:
  // return sorted.filter(f => f.name.toLowerCase().includes(searchQuery));
  
  return sorted;
}, [files, sorting])

    // useEffect(() => {
    //   alert('123');
    // }, [clicks]);
    // console.log("Folders:", refreshTrigger);



    

    const {t, i18n} = useTranslation();
    // i18n.changeLanguage("pl");
    
    return (
      <AppLayout breadcrumbs={breadcrumbs}>
        <Head title="Moje Pliki" >
          
        </Head>
        {sharedFile &&(
          <Dialog open={true}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Udostępniony plik</DialogTitle>
            <DialogDescription>
            Wprowadź link udostepnionego pliku.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4">
            <div className="grid gap-3">
              <Label htmlFor="name-1">Link</Label>
              <Input id="name-1" name="name" defaultValue="http://localhost:8000/share/" onChange={ (e)=>{setShareLink(e.target.value)}}/>
            </div>
          </div>
          <DialogFooter>
            <DialogClose asChild>
              <Link href={'./'}>
              <Button variant="outline" onClick={
                ()=>{ setSharedFile(false)
                      
                }}>Cancel</Button>
              </Link>
            </DialogClose>
           { (() => {
      const cleanedPath = shareLink.replace(window.location.origin + '/', '');
      return (
        <Link href={`../${cleanedPath}`}>
          <Button type="submit">Otwórz plik</Button>
        </Link>
      );
  })() }
          </DialogFooter>
        </DialogContent>
    </Dialog>
        )}
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
          
          <h3 className="text-lg font-semibold">📂 {t("sidebarmyFiles")} </h3>
            

         
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between w-full">
          <div className="flex gap-2">
          <UploadFilesDialog urlr={urlr} refreshData={refreshData} />
          <UploadFolderDialog urlr={urlr} refreshData={refreshData} />
          <NewFolder urlr={urlr} refreshData={refreshData} />
          <NewFile urlr={urlr} refreshData={refreshData} />
          {/* <FullScreenDrop urlr={urlr} refreshData={refreshData} /> */}

          {/* <UploadFolderDialog urlr={urlr} refreshData={refreshData} /> */}
          </div>
          <Select defaultValue={sorting}  onValueChange={(e)=>{
      console.log(e);
        localStorage.setItem("sorting", e);

    // setSortedFiles(sorted);
      setSorting(e)}}>
        
        
      <SelectTrigger className="w-[180px]">
        <SelectValue placeholder="Sortuj" />
      </SelectTrigger>
      <SelectContent>
        <SelectGroup>
          <SelectLabel>{t("sorting")}</SelectLabel>
          <SelectItem value="nameAsc"> <ArrowUpNarrowWide/>{t("sorting.nameAsc")}</SelectItem>
          <SelectItem value="nameDesc"><ArrowDownNarrowWide/>{t("sorting.nameDesc")}</SelectItem>
          <SelectItem value="sizeAsc"><ArrowUpNarrowWide />{t("sorting.sizeAsc")}</SelectItem>
          <SelectItem value="sizeDesc"><ArrowDownNarrowWide/>{t("sorting.sizeDesc")}</SelectItem>
          <SelectItem value="dateAsc"><ArrowUpNarrowWide/>{t("sorting.dateAsc")}</SelectItem>
          <SelectItem value="dateDesc"><ArrowDownNarrowWide/>{t("sorting.dateDesc")}</SelectItem>
        </SelectGroup>
      </SelectContent>
    </Select>
        </div>
    <Input 
      type="text" 
      value={searchTerm}
      placeholder={t("searchPlaceholder") || 'Szukaj plików...'} 
      className="max-w-sm" 
      onChange={handleSearchChange}
    />
    {/* <Button variant={"outline"} className="w-5 "><</Button>    */}
          
          <Button onClick={() => selecting ? setSelecting(false) : setSelecting(true)}
          className="w-34  "
          variant={"outline"}>
            {selecting ? 'Anuluj' : 'Zaznacz pliki'}
          </Button>
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
            <UploadFolderCard folderName={urlr} refreshData={refreshData} />
             {/* <FolderCard folderName="Nowy Folder" /> */}
              {foldersLoading ? (
                <>
                  <Skeleton className=" w-72 rounded-lg" />
                  <Skeleton className=" w-72 rounded-lg" />
                  <Skeleton className=" w-72 rounded-lg" />
                  <Skeleton className=" w-72 rounded-lg" />
                  <Skeleton className=" w-72 rounded-lg" />
                </>
              ) : (
                folders.map((folder) => (
                  <FolderCard
                    key={folder.id}
                    href={folder.id.toString()}

                    onFolderClick={refreshData}
                    folderName={folder.name}
                    folderId={folder.id}
                    filesCount={folder.files_count}
                  />
                ))
              )}
          </div>
          <div className="flex flex-wrap gap-4 lg:justify-start justify-center">
          {filesLoading ? (
                <>
                  <Skeleton className=" w-72 rounded-lg" />  
                  <Skeleton className=" w-72 rounded-lg" />
                  <Skeleton className=" w-72 rounded-lg" />
                  <Skeleton className=" w-72 rounded-lg" />
                  <Skeleton className=" w-72 rounded-lg" />
                  <Skeleton className=" w-72 rounded-lg" />
                  <Skeleton className=" w-72 rounded-lg" />
                </>
              ) : (
            sortedFiles.map((file) => (
              <>
              {selecting && (<input type="checkbox"    onChange={(e) => {
                if (e.target.checked) {
                  setSelectedFiles([...selectedFiles, file]);
                } else {
                  setSelectedFiles(selectedFiles.filter(f => f.id !== file.id));
                }
              }} className="inline-block   h-8 w-8 z-10" />)}
              <FileCard key={file.id} file={file} onClick={() => setSelectedFile(file)} refreshData={refreshData} />
              </>
            )))}
          </div>
          {selectedFile && <FileModal file={selectedFile} onClose={() => setSelectedFile(null)} />}
        </div>
      </AppLayout>
    );
  }