import { useState, useEffect, useRef, useMemo, useCallback } from "react";
import { Head, router, useForm, Link, usePage } from "@inertiajs/react";
import AppLayout from "@/layouts/app-layout";

import { type BreadcrumbItem } from "@/types";
import { dashboard } from "@/routes";
import axios from "axios";
import {
  ArrowUpNarrowWide,
  ArrowDownNarrowWide,
} from "lucide-react";
import { motion } from "motion/react";
import { FileCard, FileModal, UploadFolderCard } from "@/components/files/Files";
import { FolderCard } from "@/components/files/Folders";
import { Toaster } from "@/components/ui/sonner";
import { Skeleton } from "@/components/ui/skeleton";
import StorageUsageBar from "@/components/custom/StorageUsageBar";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger
} from "@/components/ui/dialog";
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from "@/components/ui/drawer";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { useTranslation, initReactI18next } from "react-i18next";
import HttpApi from "i18next-http-backend";
import i18n from "i18next";
import { NewFile, NewFolder, UploadFilesDialog, UploadFolderDialog } from "@/components/NavigationBar";
import debounce from 'lodash/debounce';
import FullScreenDrop from "@/components/custom/FullScreenDrop";
import { toast } from "sonner";
import { useSwipeable } from "react-swipeable";
import { useIsMobile } from "@/hooks/use-mobile";
import { SidebarProvider, useSidebar } from "@/components/ui/sidebar";
import { Gallerye } from "./partials/Gallery";
// --- Konfiguracja i18n ---


type FileData = {
  id: number;
  name: string;
  mime_type: "image" | "pdf" | "excel" | "ppt" | "zip" | "mp3" | "video" | "epub" | "other" | "text";
  size: string;
  created_at: string;
  url: string;
  type?: string;
  favorite?: boolean;
};

export default function Dashboard() {
  const { t } = useTranslation();
  const isMobile = useIsMobile();

  // --- Stan ---

  const [files, setFiles] = useState<FileData[]>([]);
  const [folders, setFolders] = useState<{ id: number; name: string, files_count: number }[]>([]);
  const [pathFolders, setPathFolders] = useState<{ id: number; name: string }[]>([]);
  const [selectedFile, setSelectedFile] = useState<FileData | null>(null);
  const { url } = usePage();
  const urlr = useMemo(() => {
    const segment = url.split("/").pop() || "";
    return segment === "dashboard" ? "" : segment;
  }, [url]);
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  const [selecting, setSelecting] = useState(false);
  const [selectedFiles, setSelectedFiles] = useState<FileData[]>([]);
  const [breadcrumbs, setBreadcrumbs] = useState<BreadcrumbItem[]>([]);
  const [sharedFile, setSharedFile] = useState(false);
  const [shareLink, setShareLink] = useState('');
  const [foldersLoading, setFoldersLoading] = useState(true);
  const [filesLoading, setFilesLoading] = useState(true);
  const [sorting, setSorting] = useState(localStorage.getItem("sorting") || 'dateDesc');
  const [searchTerm, setSearchTerm] = useState("");
  const [galleryVisible, setGalleryVisible] = useState(false);
  const [galleryIndex, setGalleryIndex] = useState(0);

  // --- Memos ---
  const sortedFiles = useMemo(() => {
    const sorted = [...files];
    sorted.sort((a, b) => {
      switch (sorting) {
        case "nameAsc": return a.name.localeCompare(b.name);
        case "nameDesc": return b.name.localeCompare(a.name);
        case "sizeAsc": return parseInt(a.size) - parseInt(b.size);
        case "sizeDesc": return parseInt(b.size) - parseInt(a.size);
        case "dateAsc": return a.created_at.localeCompare(b.created_at);
        case "dateDesc": return b.created_at.localeCompare(a.created_at);
        default: return 0;
      }
    });
    return sorted;
  }, [files, sorting]);

  const gallery = useMemo(() => {
    return sortedFiles.filter(file => file.mime_type === 'image' || file.mime_type === 'video');
  }, [sortedFiles]);
 


  // --- Handlery akcji ---

  const refreshData = useCallback(() => {
    setRefreshTrigger(prev => prev + 1);
  }, []);

  const handleToggleSelecting = () => {
    setSelecting(!selecting);
    if (selecting) setSelectedFiles([]);
  };

  const handleSelectAll = () => {
    if (selectedFiles.length === files.length && files.length > 0) {
      setSelectedFiles([]);
    } else {
      setSelectedFiles([...files]);
    }
  };

  const handleSortingChange = (value: string) => {
    localStorage.setItem("sorting", value);
    setSorting(value);
  };

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setSearchTerm(value);
    debouncedSearch(value.toLowerCase());
  };

  const handleCheckboxChange = (file: FileData, isChecked: boolean) => {
    if (isChecked) {
      setSelectedFiles(prev => [...prev, file]);
    } else {
      setSelectedFiles(prev => prev.filter(f => f.id !== file.id));
    }
  };
  const hideFileAfterMove = (fileId: number) => {

    setFiles(prev => prev.filter(f => f.id !== fileId));
  }

  const handleBulkDelete = async () => {
    if (selectedFiles.length === 0) return;

    if (confirm(`Czy na pewno chcesz usunąć ${selectedFiles.length} zaznaczone pliki?`)) {
      try {
        await Promise.all(selectedFiles.map(file => axios.delete(`/files/${file.id}`)));
        setSelecting(false);
        setSelectedFiles([]);
        refreshData();
      } catch (error) {
        console.error('Błąd usuwania:', error);
        alert('Wystąpił błąd podczas usuwania niektórych plików.');
      }
    }
  };

  const handleBulkMove = async (targetFolderId: number | null) => {
    if (selectedFiles.length === 0) return;
    const toastId = toast.loading('Moving files...');
    try {
      await Promise.all(selectedFiles.map(file => axios.patch(`/files/${file.id}/move`, { folder_id: targetFolderId })));
      setSelecting(false);
      setSelectedFiles([]);
      refreshData();
      toast.success(`Moved successfully.`, { id: toastId });
    } catch (error) {
      console.error('Error moving files:', error);
      toast.error('Error moving files.', { id: toastId });
    }
  };

  const handleFileClick = (file: FileData) => {
    // setSelectedFile(file);
    if(file.mime_type === "image" || file.mime_type==="video"){
      const index = gallery.findIndex(f => f.id === file.id);
      setGalleryIndex(index !== -1 ? index : 0);
      setGalleryVisible(true)
    }
    else if(file.mime_type === "text"){
      router.visit('/edit/' +file.id)
    }
    else if(file.mime_type === "pdf"){
      router.visit('/view/' + file.id + '/pdf')
    }
    else{
      setSelectedFile(file)
    }
  };

  const handleShareLinkChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setShareLink(e.target.value);
  };

  const handleCloseSharedDialog = () => {
    setSharedFile(false);
  };

  // --- Pomocnicze funkcje mapowania ---
  const mapMimeToType = (mime: string): FileData["mime_type"] => {
    if (mime.startsWith("image/")) return "image";
    if (mime.startsWith("audio/")) return "mp3";
    if (mime.startsWith("video/")) return "video";
    if (mime === "application/pdf") return "pdf";
    if (mime.includes("excel") || mime.includes("spreadsheet")) return "excel";
    if (mime.includes("presentation")) return "ppt";
    if (mime === "text/plain") return "text";
    if (mime === "application/epub+zip") return "epub";
    return "other";
  };

  // --- Logika wyszukiwania (Debounce) ---
  const debouncedSearch = useCallback(
    debounce((query: string) => {
      if (query.length > 1) {
        axios.get(`/search/${query}`).then((response) => {
          const mapped = response.data.map((f: any) => ({
            id: f.id,
            name: f.original_name,
            mime_type: mapMimeToType(f.mime_type),
            size: f.size,
            created_at: f.created_at,
            url: f.url,
          }));
          setFiles(mapped);
        }).catch(err => console.error("Search error:", err));
      } else if (query.length === 0) {
        refreshData();
      }
    }, 300),
    [refreshData]
  );

  // --- Efekty (Fetching danych) ---


useEffect(() => {
    const controller = new AbortController();

    const fetchData = async () => {
        setFilesLoading(true);
        setFoldersLoading(true);

        try {
            let filesRes, foldersRes, pathRes;
            
            setPathFolders([]); // zresetuj ścieżkę przy każdym pobieraniu
            
            if (urlr === "favorite") {
                filesRes = await axios.get(`/getFavorites`, { signal: controller.signal });
                setFolders([]);
                setBreadcrumbs([{ title: "Ulubione", href: "#" }]);
            } 
            else if (urlr === "sharedFile") {

                setSharedFile(true);

            } 
            else if(urlr==="saved"){
              foldersRes = await axios.get(`/folders/${urlr}`, { signal: controller.signal });
              setFolders(foldersRes.data);
            }
             else if(urlr==="hidden"){
              setBreadcrumbs([{ title: "Hidden Folders", href: "#" }]);
              foldersRes = await axios.get(`/folders/${urlr}`, { signal: controller.signal });
              setFolders(foldersRes.data);
            }
            else if(urlr === "dropzone") {
              setBreadcrumbs([{ title: "Miejsca publiczne (DropZones)", href: "#" }]);
              foldersRes = await axios.get(`/dropzones`, { signal: controller.signal });
              
              // Mapped for FolderCard
              const mappedZeros = foldersRes.data.map((dz: any) => ({
                id: dz.id,
                name: dz.name + " 🌐", // Add globe icon to visually distinguish
                files_count: dz.files_count || 0,
                isDropZone: true,
                token: dz.token
              }));
              setFolders(mappedZeros);
              setFiles([]);
            }
            else if (urlr.startsWith("dz_")) {
              const dzId = urlr.replace("dz_", "");
              filesRes = await axios.get(`/dropzones/${dzId}/files`, { signal: controller.signal });
              setBreadcrumbs([
                { title: "Miejsca publiczne", href: "/dashboard/dropzone" },
                { title: filesRes.data.folder.name, href: "#" }
              ]);
              setFolders([]);
              setFiles(filesRes.data.files.map((f: any) => ({
                id: f.id,
                name: f.original_name,
                mime_type: mapMimeToType(f.mime_type),
                size: f.size,
                created_at: f.created_at,
                url: f.url,
                is_drop_file: true,
              })));
            }
            else {

                [filesRes, foldersRes, pathRes] = await Promise.all([
                    axios.get(`/files/${urlr}`, { signal: controller.signal }),
                    axios.get(`/folders/${urlr}`, { signal: controller.signal }),
                    axios.get(`/pathTo/${urlr}`, { signal: controller.signal })
                ]);


                setFolders(foldersRes.data);
                setPathFolders(pathRes.data);

                const bc: BreadcrumbItem[] = [
                    { title: "panel", href: dashboard().url + "/" },
                    ...pathRes.data.map((f: any) => ({ 
                        title: f.name, 
                        href: `/dashboard/${f.id}` 
                    }))
                ];
                setBreadcrumbs(bc);
            }


            if (filesRes && filesRes.data.files) {
                const mappedFiles: FileData[] = filesRes.data.files.map((f: any) => ({
                    id: f.id,
                    name: f.original_name,
                    mime_type: mapMimeToType(f.mime_type),
                    size: f.size,
                    created_at: f.created_at,
                    url: f.url,
                    favorite: f.is_favorite
                }));
                setFiles(mappedFiles);
                // console.log(files.filter(file => file.type === 'image' || file.type === 'video'))
            }

        } catch (err) {
            if (axios.isCancel(err)) {
                console.log("Request canceled");
            } else {
                console.error("Błąd ładowania danych:", err);
            }
        } finally {
            setFilesLoading(false);
            setFoldersLoading(false);
        }
    };

    fetchData();

    return () => {
        controller.abort();
    };
}, [urlr, refreshTrigger]);

const hideFromUi = (fileId: number) => {
  setFiles(prev => prev.filter(f => f.id !== fileId));
} 


  // --- Sortowanie (Memoized) ---

  // --- Ścieżka dla Shared Dialog ---
  const cleanedSharePath = useMemo(() => shareLink.replace(window.location.origin + '/', ''), [shareLink]);

  const handleQuickUpload = async (fileList: FileList | File[]) => {
    const formData = new FormData();
    // Dodajemy wszystkie pliki do FormData
    Array.from(fileList).forEach((file) => {
      formData.append("files[]", file);
    });
    
    // Jeśli urlr to ID folderu, dodaj go
    if (urlr) formData.append("folder", urlr);

    const id = toast.loading("Przesyłanie plików...");

    try {
      await axios.post("/uploadFile", formData, {
        headers: { "Content-Type": "multipart/form-data" }
        
      });
      toast.success("Pliki przesłane pomyślnie!", { id });
      refreshData(); // Twoja funkcja odświeżająca cache i dane
    } catch (error) {
      toast.error("Błąd przesyłania", { id });
      console.error(error);
    }
  };

  const moveSelectComponent = (
    <Select onValueChange={(val) => handleBulkMove(val === "root" ? null : parseInt(val))}>
      <SelectTrigger>
        <SelectValue placeholder="Wybierz docelowy folder" />
      </SelectTrigger>
      <SelectContent>
        <SelectGroup>
          <SelectItem value="root">📁 Katalog główny</SelectItem>

          {pathFolders.length > 0 && (
            <>
              <SelectLabel>Ścieżka wstecz</SelectLabel>
              {pathFolders.slice(0, -1).map(f => (
                <SelectItem key={`path-${f.id}`} value={f.id.toString()}>📁 {f.name}</SelectItem>
              ))}
            </>
          )}

          {folders.length > 0 && (
            <>
              <SelectLabel>Podfoldery</SelectLabel>
              {folders.map(f => (
                <SelectItem key={`sub-${f.id}`} value={f.id.toString()}>📁 {f.name}</SelectItem>
              ))}
            </>
          )}
        </SelectGroup>
      </SelectContent>
    </Select>
  );

  return (
<AppLayout breadcrumbs={breadcrumbs} >
      <Head title={t('head.MyFiles')} >
        <meta name="robots" content="noindex, nofollow"></meta>
        
      </Head>

      {/* Modal Udostępniania */}
      {sharedFile && (
        <Dialog open={true}>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>Udostępniony plik</DialogTitle>
              <DialogDescription>Wprowadź link udostępnionego pliku.</DialogDescription>
            </DialogHeader>
            <div className="grid gap-4">
              <div className="grid gap-3">
                <Label htmlFor="share-link">Link</Label>
                <Input id="share-link" defaultValue="http://localhost:8000/share/" onChange={handleShareLinkChange} />
              </div>
            </div>
            <DialogFooter>
              <DialogClose asChild>
                <Link href={'./'}>
                  <Button variant="outline" onClick={handleCloseSharedDialog}>Anuluj</Button>
                </Link>
              </DialogClose>
              <Link href={`../${cleanedSharePath}`}>
                <Button type="submit">Otwórz plik</Button>
              </Link>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}

      {galleryVisible &&(
          <Gallerye 
          images={gallery} 
          initialIndex={galleryIndex} 
          onClose={()=>{setGalleryVisible(!galleryVisible)}} 
          sharing={false} 
          />
      )}
    
      <Toaster position="top-center" richColors duration={2000} />

      <div className=" flex h-full flex-1 flex-col gap-4 overflow-x-auto rounded-xl p-4">
        {urlr === "" && <StorageUsageBar />}
        {/* <h3 className="text-lg font-semibold">📂 {t("sidebarmyFiles")} </h3> */}
        <FullScreenDrop onFilesDropped={handleQuickUpload} urlr={urlr} />
        {/* Toolbar Akcji */}
        <div className="sticky top-0 z-10 flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between w-full">
         <div className="flex flex-wrap gap-2">
            <UploadFilesDialog urlr={urlr} refreshData={refreshData} />
            {!useIsMobile() && <UploadFolderDialog urlr={urlr} refreshData={refreshData} />}
            <NewFolder urlr={urlr} refreshData={refreshData} />
            <NewFile urlr={urlr} refreshData={refreshData} />
        </div>

          <Select defaultValue={sorting} onValueChange={handleSortingChange}>
            <SelectTrigger className="w-full lg:w-[180px]">
              <SelectValue placeholder={t('sorting')} />
            </SelectTrigger>
            <SelectContent>
              <SelectGroup>
                <SelectLabel>{t("sorting")}</SelectLabel>
                <SelectItem value="nameAsc"><ArrowUpNarrowWide className="mr-2 h-4 w-4 inline"/>{t("sorting.nameAsc")}</SelectItem>
                <SelectItem value="nameDesc"><ArrowDownNarrowWide className="mr-2 h-4 w-4 inline"/>{t("sorting.nameDesc")}</SelectItem>
                <SelectItem value="sizeAsc"><ArrowUpNarrowWide className="mr-2 h-4 w-4 inline"/>{t("sorting.sizeAsc")}</SelectItem>
                <SelectItem value="sizeDesc"><ArrowDownNarrowWide className="mr-2 h-4 w-4 inline"/>{t("sorting.sizeDesc")}</SelectItem>
                <SelectItem value="dateAsc"><ArrowUpNarrowWide className="mr-2 h-4 w-4 inline"/>{t("sorting.dateAsc")}</SelectItem>
                <SelectItem value="dateDesc"><ArrowDownNarrowWide className="mr-2 h-4 w-4 inline"/>{t("sorting.dateDesc")}</SelectItem>
              </SelectGroup>
            </SelectContent>
          </Select>
        </div>

        {/* Wyszukiwarka i Tryb Wyboru */}
        <div className="flex flex-col gap-3">
          <Input 
            type="text" 
            value={searchTerm}
            placeholder={t("sharedFiles.searchPlaceholder")} 
            className="w-full max-w-sm" 
            onChange={handleSearchChange}
          />
          <div className="flex flex-wrap items-center gap-2">
            <Button onClick={handleToggleSelecting} variant="outline">
              {selecting ? t('cancel') : t('files.select')}
            </Button>
            {selecting && (
              <>
                <Button onClick={handleSelectAll} variant="outline" size="sm">
                  {selectedFiles.length === files.length && files.length > 0 ? t('deselectAll', 'Deselect all') : t('selectAll', 'Select all')}
                </Button>
                <span className="text-sm font-medium">Selected: {selectedFiles.length}</span>
                <Button variant="destructive" size="sm" onClick={handleBulkDelete} disabled={selectedFiles.length === 0}>
                 {t('delete.selectedFile')}
                </Button>
                {isMobile ? (
                  <Drawer>
                    <DrawerTrigger asChild>
                      <Button variant="secondary" size="sm" disabled={selectedFiles.length === 0}>
                        {t('folder.move', 'Przenieś zaznaczone')}
                      </Button>
                    </DrawerTrigger>
                    <DrawerContent>
                      <div className="mx-auto w-full max-w-sm">
                        <DrawerHeader>
                          <DrawerTitle>Przenieś pliki</DrawerTitle>
                          <DrawerDescription>Wybierz nowy folder dla zaznaczonych plików.</DrawerDescription>
                        </DrawerHeader>
                        <div className="p-4 pb-0">
                          {moveSelectComponent}
                        </div>
                        <DrawerFooter>
                          <DrawerClose asChild>
                            <Button variant="outline">Anuluj</Button>
                          </DrawerClose>
                        </DrawerFooter>
                      </div>
                    </DrawerContent>
                  </Drawer>
                ) : (
                  <Dialog>
                    <DialogTrigger asChild>
                      <Button variant="secondary" size="sm" disabled={selectedFiles.length === 0}>
                        {t('folder.move', 'Przenieś zaznaczone')}
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="sm:max-w-[400px]">
                      <DialogHeader>
                        <DialogTitle>Przenieś pliki</DialogTitle>
                        <DialogDescription>Wybierz nowy folder dla zaznaczonych plików.</DialogDescription>
                      </DialogHeader>
                      {moveSelectComponent}
                    </DialogContent>
                  </Dialog>
                )}
              </>
            )}
          </div>
        </div>

        {/* Sekcja Folderów */}
        <div className="flex flex-wrap gap-4 lg:justify-start justify-center">
          {/* <UploadFolderCard folderName={urlr} refreshData={refreshData} /> */}
          {foldersLoading ? (
            Array(4).fill(0).map((_, i) => <Skeleton key={i} className="h-24 w-72 rounded-lg" />)
          ) : (
            folders.map((folder: any) => (
              <div key={folder.id} className="relative group">
                <FolderCard
                  href={folder.isDropZone ? `dz_${folder.id}` : folder.id.toString()}
                  onFolderClick={refreshData}
                  onMove={() => hideFromUi(folder.id)}
                  folderName={folder.name}
                  folderId={folder.id}
                  filesCount={folder.files_count}
                />
                
                {/* Osobny Przycisk do kopiowania linku zamiast blokowania folderu */}
                {folder.isDropZone && (
                   <button 
                     onClick={(e) => {
                       e.preventDefault();
                       e.stopPropagation();
                       const link = `${window.location.origin}/drop/${folder.token}`;
                       navigator.clipboard.writeText(link);
                       toast.success("Skopiowano publiczny link do schowka!");
                     }}
                     className="absolute top-3 right-3 p-1.5 bg-blue-100/80 text-blue-600 rounded-full hover:bg-blue-200 z-20 transition"
                     title="Kopiuj publiczny link zrzutu"
                   >
                     📋
                   </button>
                )}
              </div>
            ))
          )}
        </div>

        {/* Sekcja Plików */}
        <div className="flex flex-wrap gap-4 lg:justify-start justify-center">
          {filesLoading ? (
            Array(6).fill(0).map((_, i) => <Skeleton key={i} className="h-48 w-72 rounded-lg" />)
          ) : (
            sortedFiles.map((file) => (
              <div key={file.id} className="relative group">
                {selecting && (
                  <input 
                    type="checkbox" 
                    checked={selectedFiles.some(f => f.id === file.id)}
                    onChange={(e) => handleCheckboxChange(file, e.target.checked)} 
                    className="absolute top-2 left-2 h-6 w-6 z-20 cursor-pointer accent-blue-600" 
                  />
                )}
                <FileCard 
                  file={file} 
                  onClick={() => handleFileClick(file)} 
                  refreshData={refreshData} 
                />
              </div>
            ))
          )}
        </div>

        {selectedFile && <FileModal file={selectedFile} onClose={() => setSelectedFile(null)} />}
      </div>
    </AppLayout>
    
  );
}