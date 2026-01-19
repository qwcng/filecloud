import React, { JSX, useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";
import { Link, router, useForm} from "@inertiajs/react";
import { EllipsisVertical, X, EyeIcon, InfoIcon, DownloadIcon, Edit2Icon, Trash2Icon, ShareIcon, Book, Heart } from "lucide-react";
import { FileArchive, FileAudio, FileImage, FileSpreadsheet, FileText } from "lucide-react";
import axios from "axios";
import { type BreadcrumbItem, type FileData } from "@/types";
import { dashboard } from "@/routes";
import AppLayout from "@/layouts/app-layout";
import { Head } from "@inertiajs/react";
import MusicPlayer from "@/components/MusicPlayer";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
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
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
const breadcrumbs: BreadcrumbItem[] = [
  { title: "panel", href: dashboard().url },
  { title: "Pliki", href: dashboard().url },
];

export function FileCard({ file, onClick, refreshData }: { file: FileData; onClick: () => void; refreshData: () => void }) {
  const icons: Record<FileData["type"], JSX.Element> = {
    image: <FileImage className="mx-auto mb-2 h-16 w-16 text-blue-500" />,
    pdf: <FileText className="mx-auto mb-2 h-16 w-16 text-red-500" />,
    excel: <FileSpreadsheet className="mx-auto mb-2 h-16 w-16 text-green-500" />,
    ppt: <FileSpreadsheet className="mx-auto mb-2 h-16 w-16 text-orange-500" />,
    zip: <FileArchive className="mx-auto mb-2 h-16 w-16 text-yellow-500" />,
    epub: <Book className="mx-auto mb-2 h-16 w-16 text-indigo-500" />,
    mp3: <FileAudio className="mx-auto mb-2 h-16 w-16 text-purple-500" />,
    other: <FileText className="mx-auto mb-2 h-16 w-16 text-gray-500" />,
  };

  const [optionVisible, setOptionVisible] = useState(false);
  const [pos, setPos] = useState({ x: 0, y: 0 });
  const modalRef = useRef<HTMLDivElement>(null);
  const [shareModalOpen, setShareModalOpen] = useState(false);
  const handleContextClick = (e: React.MouseEvent) => {
    e.preventDefault();
    setPos({ x: e.clientX, y: e.clientY });
    setOptionVisible(true);
  };

//   useEffect(() => {
//     const handleClickOutside = (event: MouseEvent) => {
//       if (modalRef.current && !modalRef.current.contains(event.target as Node)) {
//         setOptionVisible(false);
//       }
//     };
//     document.addEventListener("mousedown", handleClickOutside);
//     return () => {
//       document.removeEventListener("mousedown", handleClickOutside);
//     };
//   }, []);
 const handleDragStart = (e: React.DragEvent<HTMLDivElement>) => {
    e.dataTransfer.setData("fileId", file.id.toString());
    e.dataTransfer.effectAllowed = "move";
    e.currentTarget.style.opacity = "0.5";
    e.currentTarget.style.border = "2px dashed #000";
  };
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.2, ease: "easeOut" }}
      // whileHover={{ scale: 1.02, boxShadow: "0 8px 20px rgba(0,0,0,0.08)" }}
      className="relative w-72 border rounded-lg p-4 shadow transition bg-white dark:bg-neutral-800"
      draggable
      onDragStart={handleDragStart}
      onDragEnd={(e) => {
        e.currentTarget.style.opacity = "1";
        e.currentTarget.style.border = "none";
        setOptionVisible(false);
      }}
    >
      <div className="flex justify-end">
        <EllipsisVertical
          className="h-5 w-5 text-neutral-800 dark:text-amber-50 hover:text-neutral-600 hover:bg-neutral-300 rounded cursor-pointer"
          onClick={handleContextClick}
        />
      </div>

      <div
        onClick={onClick}
        className="text-center w-full overflow-ellipsis overflow-hidden cursor-pointer"
      >
        {icons[file.type]}
        <h3 className="text-lg font-medium text-ellipsis">{file.name}</h3>
        <p className="text-sm text-gray-500">Rozmiar: {(file.size / 1000000).toPrecision(2)} MB</p>
        <p className="text-sm text-gray-500">Data: {file.created_at}</p>
      </div>

      {optionVisible && (
        <motion.div
          ref={modalRef}
          initial={{ opacity: 0, scale: 0.95, y: -5 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: -5 }}
          transition={{ duration: 0.15, ease: "easeOut" }}
          className="fixed z-50 bg-white dark:bg-neutral-900 rounded-xl p-4 shadow-xl w-72"
          // left upper to cursor
          style={{ top: pos.y - 100, left: pos.x - 300 }}
        >
          <button
            onClick={() => setOptionVisible(false)}
            className="absolute top-2 right-2 text-gray-500 hover:text-gray-700"
          >
            <X className="h-5 w-5" />
          </button>
          <h2 className="text-lg font-semibold mb-2">Opcje pliku</h2>
          <ul className="list-none p-0 m-0">
            <li className="m-2 cursor-pointer hover:text-blue-600">
                <span onClick={() => router.post(`/toggleFavorite/${file.id}`)}><Heart className="inline-block mr-2" /> Dodaj do ulubionych</span>
            </li>
            <li className="m-2 cursor-pointer hover:text-blue-600">
              <Link href={`/edit/${file.id}`}><EyeIcon className="inline-block mr-2" /> Podgląd</Link>
            </li>
            
            <li className="m-2 cursor-pointer hover:text-blue-600">
              <span onClick={() =>{setInfoModalOpen(true)}}><InfoIcon className="inline-block mr-2" /> Szczegóły</span>
            </li>
            <li className="m-2 cursor-pointer hover:text-blue-600">
  <a
    href={`/d/${file.id}`}
    target="_blank"
    rel="noopener noreferrer"
    download
    className="flex items-center"
  ><DownloadIcon className="inline-block mr-2" /> Pobierz</a>
            </li>
            
              {shareModalOpen && (
                <ShareModal
                  fileId={file.id}
                  onClose={() => setShareModalOpen(false)}
                />
              )}
            <li className="m-2 cursor-pointer hover:text-blue-600">  
              <span onClick={() =>{setShareModalOpen(true)}}><ShareIcon className="inline-block mr-2" /> Udostępnij</span>
            </li>
          
              <Dialog>
        <DialogTrigger asChild>
         <li className="m-2 cursor-pointer hover:text-blue-600">
              <Edit2Icon className="inline-block mr-2" /> Zmień nazwę
            </li>
        </DialogTrigger>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Zmień nazwę pliku</DialogTitle>
            <DialogDescription>
              Zmień nazwę pliku i zapisz zmiany.
              
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4">
            <div className="grid gap-3">
              <Label htmlFor="filenamee">Nazwa pliku</Label>
              <Input id="filenamee" name="filenamee" defaultValue={file.name} />
            </div>
            
          </div>
          <DialogFooter>
            <DialogClose asChild>
              <Button variant="outline">Cancel</Button>
            </DialogClose>
            <Button onClick={(e)=>{
              e.preventDefault();
              const filename = (document.querySelector('input[name="filenamee"]') as HTMLInputElement).value;
              router.post(`/changeFileName/${file.id}`, {
                filename: filename,
                
                
              },
            {
              onSuccess: (file) => {
                refreshData();
                
            ;
              }
            });

            }}>Zapisz zmiany</Button>
          </DialogFooter>
        </DialogContent>
    </Dialog>
            
            {/* <li className="m-2 cursor-pointer text-red-600" onClick={async () => {
              if (confirm(`Czy na pewno chcesz usunąć plik "${file.name}"?`)) {
                try {
                  await router.delete(`/files/${file.id}`);
                  alert('Plik został usunięty.');
                  refreshData();
                  // window.location.reload(); // Odświeżenie strony po usunięciu
                } catch (error) {
                  console.error('Błąd podczas usuwania pliku:', error);
                  alert('Wystąpił błąd podczas usuwania pliku.');
                }
              }
            }}>
              <Trash2Icon className="inline-block mr-2" /> Usuń
            </li> */}
            <li className="m-2 cursor-pointer text-red-700">
              <AlertDialog>
                  <AlertDialogTrigger asChild>
                      <div className="flex items-center">
                          <Trash2Icon className="inline-block mr-2" /> Usuń
                      </div>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                      <AlertDialogHeader>
                          <AlertDialogTitle>Czy na pewno chcesz usunąć plik?</AlertDialogTitle>
                          <AlertDialogDescription>
                              Czy na pewno chcesz usunąć plik <strong>{file.name}</strong>? Operacji tej nie można cofnąć.
                          </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                          <AlertDialogCancel>Anuluj</AlertDialogCancel>
                          <AlertDialogAction  onClick={async () => {
                              try {
                                  await router.delete(`/files/${file.id}`);
                                  // alert('Plik został usunięty.');
                                  refreshData();
                                  setOptionVisible(false);
                                  toast.success('Plik został usunięty.');
                                  // window.location.reload(); // Odświeżenie strony po usunięciu
                              } catch (error) {
                                  console.error('Błąd podczas usuwania pliku:', error);
                                  alert('Wystąpił błąd podczas usuwania pliku.');
                              }
                          }} className="bg-red-700 hover:bg-red-600 text-white">Usuń</AlertDialogAction>
                      </AlertDialogFooter>
                  </AlertDialogContent>
              </AlertDialog>
            </li>
          </ul>
        </motion.div>
      )}
    </motion.div>
  );
}
export function FileModal({ file, onClose }: { file: FileData; onClose: () => void }) {
    const [showShareModal, setShowShareModal] = useState(false);

    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60">
        <div className="bg-white h-[95dvh] overflow-auto dark:bg-neutral-900 rounded-xl p-6 shadow-xl w-full max-w-md relative">
          <button
            onClick={onClose}
            className="absolute top-3 right-3 text-gray-500 hover:text-gray-700"
          >
            <X className="h-5 w-5" />
          </button>

          <button
            onClick={() => setShowShareModal(true)}
            className="mb-4 rounded bg-indigo-600 px-4 py-2 text-white hover:bg-indigo-700"
          >
            🔗 Udostępnij
          </button>

          {file.type === "mp3" && (
            <div className="mb-4">
              <MusicPlayer src={`/showFile/${file.id}`} title={file.name} artist="Unknown Artist" />
            </div>
          )}
          {file.type === "image" && (
            <div className="mb-4">
              <img src={`/showFile/${file.id}`} alt={file.name} className="max-h-64 mx-auto rounded-sm" />
            </div>
          )}
          {file.type === "video" && (
            <div className="mb-4">
              <video controls className="w-full max-h-64 rounded-sm">
                <source src={`/showFile/${file.id}`} type="video/mp4" />
                Your browser does not support the video tag.
              </video>
            </div>
          )}
          {file.type === "epub" && (
            <div className="mb-4">
             <Button variant="outline" onClick={() => window.open(`/polygon/${file.id}`, "_blank")}>Otwórz czytnik EPUB</Button>
            </div>
          )}
          {file.type === "other" && (
            <div className="mb-4 text-center">
              <button
                className="rounded bg-indigo-600 px-4 py-2 text-white hover:bg-indigo-700"
                onClick={() => window.open(`d/${file.id}`, "_blank")}
              >
                Otwórz plik
              </button>
            </div>
          )}

          <h2 className="text-xl font-semibold mb-4">Szczegóły pliku</h2>
          <button
            onClick={() => window.open(`d/${file.id}`, "_blank")}
            className="mb-4 rounded bg-blue-600 px-4 py-2 text-white hover:bg-blue-700"
          >
            Pobierz
          </button>

          <p className="mb-2"><strong>Nazwa:</strong> {file.name}</p>
          <p className="mb-2"><strong>Typ:</strong> {file.type}</p>
          <p className="mb-2"><strong>Rozmiar:</strong> {file.size} MB</p>
          <p className="mb-2"><strong>Data dodania:</strong> {file.created_at}</p>
        </div>

        {showShareModal && (
          <ShareModal fileId={file.id} onClose={() => setShowShareModal(false)} />
        )}
      </div>
    );
  }
export function ShareModal({ fileId, onClose }: { fileId: number; onClose: () => void }) {
    const [code, setCode] = useState("");
    const [expiresAt, setExpiresAt] = useState("");

    const handleShare = async () => {
      if (!code || code.length !== 6) return alert("Kod musi mieć 6 cyfr");

      try {
        await router.post(`/filesShare/${fileId}`, {
          access_code: code,
          expires_in: expiresAt ? expiresAt : null,
        },{
          onSuccess: () => {
           
            // toast.success('Plik został udostępniony!')
        }
        
      });
        // alert(
        //   "✅ Plik został udostępniony! \n Znajdziesz go pod linkiem localhost:800/share/" + fileId
        // );
        
      } catch (err: any) {
        console.error(err);
        alert(err.response?.data?.message || "❌ Błąd podczas udostępniania");
      }
    };

    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60">
        <div className="bg-white dark:bg-neutral-900 rounded-xl p-6 shadow-xl w-full max-w-md relative">
          <button
            onClick={onClose}
            className="absolute top-3 right-3 text-gray-500 hover:text-gray-700"
          >
            <X className="h-5 w-5" />
          </button>
          <h2 className="text-xl font-semibold mb-4">Udostępnij plik</h2>

          <label className="block mb-2">Kod dostępu (6 cyfr)</label>
          <input
            type="text"
            maxLength={6}
            value={code}
            onChange={(e) => setCode(e.target.value)}
            className="w-full border rounded px-3 py-2 mb-4 dark:bg-neutral-800"
          />

          <label className="block mb-2">Data wygaśnięcia (opcjonalnie)</label>
          <input
            type="date"
            value={expiresAt}
            onChange={(e) => setExpiresAt(e.target.value)}
            className="w-full border rounded px-3 py-2 mb-4 dark:bg-neutral-800"
          />

<Dialog>
      <DialogTrigger asChild>
        <Button variant="outline" onClick={()=> {handleShare()}}>Share</Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Udostępniono link.</DialogTitle>
          <DialogDescription>
            Każdy, kto ma ten link oraz kod <strong>{code} </strong>, będzie mógł go wyświetlić.
          </DialogDescription>
        </DialogHeader>
        <div className="flex items-center gap-2">
          <div className="grid flex-1 gap-2">
            <Label htmlFor="link" className="sr-only">
              Link
            </Label>
            <Input
              id="link"
              defaultValue={`https://filecloud.ct8.pl/share/${fileId}`}
              readOnly
            />
          </div>
        </div>
        <DialogFooter className="sm:justify-start">
          <DialogClose asChild>
            <Button type="button" variant="secondary" onClick={()=>{
              onClose()
              toast.success('Plik został udostępniony!')

            }}>
              Close
            </Button>
          </DialogClose>
        </DialogFooter>
      </DialogContent>
    </Dialog>
        </div>
      </div>
    );
  }
export function UploadFileCard({folderName, refreshData}: {folderName: string; refreshData: () => void}) {
    const { data, setData, post, progress } = useForm<{ files: File[]; folder: string }>({
        files: [],
        folder: folderName ==="dashboard" ? "root" :folderName,
      });
      
    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      if (e.target.files) {
        // dodajemy nowe pliki do już istniejących
        setData("files", [...data.files, ...Array.from(e.target.files)]);
        setData("folder", data.folder);
      }
    };

      const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        console.log(data);
        post('/uploadFile', {
          forceFormData: true,
          onSuccess: () => {
            toast.success('Pliki zostały przesłane!');
            setData("files", []);
            refreshData();
          } // wymusza wysyłkę multipart/form-data
        }, 
       
        
        );
        // After successful upload,
        
      };
    
      const removeFile = (index: number) => {
        setData(
          "files",
          data.files.filter((_, i) => i !== index)
        );
      };
    return (
      <form
                onSubmit={handleSubmit}
                className="relative w-72 max-w-md space-y-4"
              >
                {/* Dropzone / input */}
                <label
                  htmlFor="file-upload"
                  className="cursor-pointer flex flex-col items-center justify-center border-2 border-dashed border-gray-300 rounded-lg p-6 hover:border-blue-500"
                >
                  <svg
                    className="mb-3 w-10 h-10 text-gray-400"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
                    ></path>
                  </svg>
                  <span className="text-gray-600 text-center">
                    Kliknij lub przeciągnij pliki tutaj, aby je przesłać
                  </span>
                  <input
                    id="file-upload"
                    type="file"
                    className="hidden"
                    multiple
                    onChange={handleFileChange}
                  />
                  {data.files.length > 0 && (
                  <div className="space-y-2">
                    {data.files.map((file, i) => (
                      <div
                        key={i}
                        className="flex items-center justify-between rounded border px-3 py-2 text-sm"
                      >
                        <span>{file.name}</span>
                        <button
                          type="button"
                          onClick={() => removeFile(i)}
                          className="text-red-500 hover:text-red-700"
                        >
                          <X className="h-4 w-4" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
      
                {/* Progress bar */}
                {progress && (
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-blue-600 h-2 rounded-full"
                      style={{ width: `${progress.percentage}%` }}
                    />
                  </div>
                )}
      
                {/* Przyciski */}
                <button
                  type="submit"
                  disabled={data.files.length === 0}
                  className="w-full rounded bg-blue-600 px-4 py-2 text-white hover:bg-blue-700 disabled:bg-gray-400"
                >
                  Prześlij pliki
                </button>
      
                <span className="block text-sm text-gray-600 text-center">
                  {data.files.length > 0
                    ? `${data.files.length} plików gotowych do przesłania`
                    : "Brak plików do przesłania"}
                </span>
                </label>
      
                {/* Lista wybranych plików */}
                
              </form>
    );
  }