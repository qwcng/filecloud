import { useState, useEffect, useRef, useMemo, useCallback } from "react";
import { Head, router, useForm, Link } from "@inertiajs/react";
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
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
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

// --- Konfiguracja i18n ---
if (!i18n.isInitialized) {
  i18n
    .use(HttpApi)
    .use(initReactI18next)
    .init({
      supportedLngs: ["en", "pl", "ru", "fr"],
      fallbackLng: "en",
      lng: localStorage.getItem("lang") || "pl",
      backend: { loadPath: "/locales/{{lng}}/translation.json" },
      interpolation: { escapeValue: false }
    });
}

type FileData = {
  id: number;
  name: string;
  type: "image" | "pdf" | "excel" | "ppt" | "zip" | "mp3" | "video" | "epub" | "other";
  size: string;
  created_at: string;
  url: string;
  favorite?: boolean;
};

export default function Dashboard() {
  const { t } = useTranslation();

  // --- Stan ---
  const [files, setFiles] = useState<FileData[]>([]);
  const [folders, setFolders] = useState<{ id: number; name: string, files_count: number }[]>([]);
  const [selectedFile, setSelectedFile] = useState<FileData | null>(null);
  const [urlr, setUrlr] = useState(window.location.pathname.split("/").pop() || '');
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

  // --- Handlery akcji ---

  const refreshData = useCallback(() => {
    setRefreshTrigger(prev => prev + 1);
  }, []);

  const handleToggleSelecting = () => {
    setSelecting(!selecting);
    if (selecting) setSelectedFiles([]);
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

  const handleFileClick = (file: FileData) => {
    setSelectedFile(file);
  };

  const handleShareLinkChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setShareLink(e.target.value);
  };

  const handleCloseSharedDialog = () => {
    setSharedFile(false);
  };

  // --- Pomocnicze funkcje mapowania ---
  const mapMimeToType = (mime: string): FileData["type"] => {
    if (mime.startsWith("image/")) return "image";
    if (mime.startsWith("audio/")) return "mp3";
    if (mime.startsWith("video/")) return "video";
    if (mime === "application/pdf") return "pdf";
    if (mime.includes("excel") || mime.includes("spreadsheet")) return "excel";
    if (mime.includes("presentation")) return "ppt";
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
            type: mapMimeToType(f.mime_type),
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
    const segment = window.location.pathname.split("/").pop() || '';
    setUrlr(segment === 'dashboard' ? '' : segment);
  }, [refreshTrigger]);

useEffect(() => {
    const controller = new AbortController();

    const fetchData = async () => {
        setFilesLoading(true);
        setFoldersLoading(true);

        try {
            // 1. Definiujemy zmienne na dane (wartości domyślne)
            let filesRes, foldersRes, pathRes;
            
            // 2. Obsługa specyficznych przypadków (WIDOKI SPECJALNE)
            if (urlr === "favorite") {
                // Dla ulubionych pobieramy TYLKO pliki
                filesRes = await axios.get(`/getFavorites`, { signal: controller.signal });
                
                // Resetujemy foldery i ścieżkę, bo w "ulubionych" ich nie ma/są inne
                setFolders([]);
                setBreadcrumbs([{ title: "Ulubione", href: "#" }]);
            } 
            else if (urlr === "sharedFile") {
                // Logika dla udostępnionych (jeśli potrzebujesz czegoś innego)
                setSharedFile(true);
                // Tutaj dodaj odpowiedni request jeśli trzeba
            } 
            else if(urlr==="saved"){
              foldersRes = await axios.get(`/folders/${urlr}`, { signal: controller.signal });
              setFolders(foldersRes.data);
            }
            else {
                // 3. WIDOK STANDARDOWEGO FOLDERA (PROMISE.ALL)
                // Tutaj Promise.all ma sens, bo potrzebujemy kompletu danych
                [filesRes, foldersRes, pathRes] = await Promise.all([
                    axios.get(`/files/${urlr}`, { signal: controller.signal }),
                    axios.get(`/folders/${urlr}`, { signal: controller.signal }),
                    axios.get(`/pathTo/${urlr}`, { signal: controller.signal })
                ]);

                // Ustawiamy foldery i breadcrumbs tylko w tym przypadku
                setFolders(foldersRes.data);
                const bc: BreadcrumbItem[] = [
                    { title: "panel", href: dashboard().url + "/" },
                    ...pathRes.data.map((f: any) => ({ 
                        title: f.name, 
                        href: `/dashboard/${f.id}` 
                    }))
                ];
                setBreadcrumbs(bc);
            }

            // 4. Mapowanie i ustawianie plików (wspólne dla większości widoków)
            if (filesRes && filesRes.data.files) {
                const mappedFiles: FileData[] = filesRes.data.files.map((f: any) => ({
                    id: f.id,
                    name: f.original_name,
                    type: mapMimeToType(f.mime_type),
                    size: f.size,
                    created_at: f.created_at,
                    url: f.url,
                    favorite: f.is_favorite
                }));
                setFiles(mappedFiles);
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
}, [urlr, refreshTrigger]); // Wywalamy pozostałe useEffecty obsługujące te dane

const hideFromUi = (fileId: number) => {
  setFiles(prev => prev.filter(f => f.id !== fileId));
} 
  // --- Sortowanie (Memoized) ---
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

  // --- Ścieżka dla Shared Dialog ---
  const cleanedSharePath = useMemo(() => shareLink.replace(window.location.origin + '/', ''), [shareLink]);

  const handleQuickUpload = async (fileList: FileList) => {
    const formData = new FormData();
    // Dodajemy wszystkie pliki do FormData
    Array.from(fileList).forEach((file) => {
      formData.append("files[]", file);
    });
    
    // Jeśli urlr to ID folderu, dodaj go
    if (urlr) formData.append("folder_id", urlr);

    const id = toast.loading("Przesyłanie plików...");

    try {
      await axios.post("/uploadFile/", formData, {
        headers: { "Content-Type": "multipart/form-data" }
      });
      toast.success("Pliki przesłane pomyślnie!", { id });
      refreshData(); // Twoja funkcja odświeżająca cache i dane
    } catch (error) {
      toast.error("Błąd przesyłania", { id });
      console.error(error);
    }
  };
  return (
    <AppLayout breadcrumbs={breadcrumbs}>
      <Head title="Moje Pliki" >
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

      <Toaster position="top-center" richColors duration={2000} />

      <div className="flex h-full flex-1 flex-col gap-4 overflow-x-auto rounded-xl p-4">
        <h3 className="text-lg font-semibold">📂 {t("sidebarmyFiles")} </h3>
        <FullScreenDrop onFilesDropped={handleQuickUpload} />
        {/* Toolbar Akcji */}
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between w-full">
          <div className="flex gap-2">
            <UploadFilesDialog urlr={urlr} refreshData={refreshData} />
            <UploadFolderDialog urlr={urlr} refreshData={refreshData} />
            <NewFolder urlr={urlr} refreshData={refreshData} />
            <NewFile urlr={urlr} refreshData={refreshData} />
          </div>

          <Select defaultValue={sorting} onValueChange={handleSortingChange}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Sortuj" />
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
        <div className="flex flex-col gap-2">
          <Input 
            type="text" 
            value={searchTerm}
            placeholder={t("searchPlaceholder") || 'Szukaj plików...'} 
            className="max-w-sm" 
            onChange={handleSearchChange}
          />
          <div className="flex items-center gap-2">
            <Button onClick={handleToggleSelecting} variant="outline">
              {selecting ? 'Anuluj' : 'Zaznacz pliki'}
            </Button>
            {selecting && (
              <>
                <span className="text-sm font-medium">Zaznaczono: {selectedFiles.length}</span>
                <Button variant="destructive" size="sm" onClick={handleBulkDelete} disabled={selectedFiles.length === 0}>
                  Usuń zaznaczone
                </Button>
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
            folders.map((folder) => (
              <FolderCard
                key={folder.id}
                href={folder.id.toString()}
                onFolderClick={refreshData}
                onMove={hideFromUi}
                folderName={folder.name}
                folderId={folder.id}
                filesCount={folder.files_count}
              />
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