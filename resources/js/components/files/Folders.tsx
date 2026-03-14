import React from "react";
// import { useState, useEffect, useRef } from "react";
import { Head, router, useForm, Link } from "@inertiajs/react";
import { Download, Edit2Icon, EllipsisVertical, Share, Trash2Icon, X } from "lucide-react";
import { motion } from "motion/react";
import { useEffect, useRef, useState } from "react";
import axios from "axios";
import { toast, Toaster } from "sonner";
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
import { Button } from "@/components/ui/button"
import { DialogBuilder } from "../DialogBuilder";


export function FolderCard({ folderName, href, onFolderClick, folderId, filesCount, onMove }: { folderName: string; href: string; onFolderClick: () => void; folderId: number; filesCount: number; onMove?: () => void }) {
  const [optionVisible, setOptionVisible] = useState(false);
  const [pos, setPos] = useState({ x: 0, y: 0 });
  const modalRef = useRef<HTMLDivElement>(null);
  const[accesCode,setAccesCode]= useState()

  const handleContextClick = (e: React.MouseEvent) => {
    e.preventDefault();
    setPos({ x: e.clientX, y: e.clientY });
    // setOptionVisible(true);
    optionVisible ? setOptionVisible(false) : setOptionVisible(true);
  
  };

  // obsługa kliknięcia poza modalem
  // useEffect(() => {
  //   // const handleClickOutside = (event: MouseEvent) => {
  //   //   if (modalRef.current && !modalRef.current.contains(event.target as Node)) {
  //   //     setOptionVisible(false);
  //   //   }
  //   // };
  //   document.addEventListener("mousedown", handleClickOutside);
  //   return () => document.removeEventListener("mousedown", handleClickOutside);
  // }, []);

  // DRAG & DROP
  const handleDrop = async (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    const fileId = e.dataTransfer.getData("fileId");
    // const previousFiles = [...files]; // Kopia zapasowa w razie błędu
 
    if (!fileId) return;

    try {
      // const ref = useRef(fileId);
      console.log(`Przenoszenie pliku ${fileId} do folderu ${folderId}`);
      await axios.patch(`/files/${fileId}/move`, { folder_id: folderId });
      toast.success(`Plik przeniesiony do ${folderName}`);
      if (onMove) onMove(); // Ukryj przeniesiony plik z UI


      
      
    } catch (err) {
      console.error(err);
      toast.error("Nie udało się przenieść pliku");
    }
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => e.preventDefault();

  const handleShare = (folder)=>{
    router.post(`/folderShare/${folder}/share`,{
      accesscode : accesCode
    },
  {
    onSuccess:()=>{
      console.log("Pomyślnie udostepniono plik")
    }
  })

  }
  const  handleDownloadFolder = ()=>{
    window.location.href =`downloadFolder/${folderId}`
    toast.success("Rozpoczynanie pobierania folderu")
  }
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.2, ease: "easeOut" }}
      onDrop={handleDrop}
      onDragOver={handleDragOver}
      
    >
      <Link
        href={`/dashboard/${href}`}
        onClick={() => onFolderClick()}
        className="hover:shadow-lg transition  dark:bg-neutral-800 relative block w-60 aspect-video border rounded-lg p-4 shadow"
      >
        <div className="flex justify-end">
        <EllipsisVertical
          className="h-5 w-5 text-neutral-800 hover:text-neutral-600 hover:bg-neutral-300 rounded cursor-pointer"
          onClick={(e) => {
            e.preventDefault();     // ⛔ nie pozwól nawigować
            e.stopPropagation();    // ⛔ nie propaguj kliknięcia do <Link>
            handleContextClick(e);  // 👈 pokaż modal
          }}
        />
        </div>
        <svg
          className="mx-auto mb-0 h-20 w-20 text-yellow-400"
          fill="#FFD700"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 7a2 2 0 012-2h6l2 2h6a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2V7z" />
        </svg>
        <h3 className="text-sm text-[#706f6c]">{filesCount} plików</h3>
        <h3 className="text-lg font-medium text-ellipsis">{folderName}</h3>
      </Link>

      {optionVisible && (
        <motion.div
          ref={modalRef}
          initial={{ opacity: 0, scale: 0.95, y: -5 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: -5 }}
          transition={{ duration: 0.15, ease: "easeOut" }}
          className="absolute z-50 bg-white dark:bg-neutral-900 rounded-xl p-4 shadow-xl w-48"
          style={{ top: pos.y, left: pos.x - 200 }}
        >
          <button
            onClick={() => setOptionVisible(false)}
            className="absolute top-2 right-2 text-gray-500 hover:text-gray-700"
          >
            <X className="h-5 w-5" />
          </button>
          <h2 className="text-lg font-semibold mb-2">Opcje folderu</h2>
          <ul>
            <Dialog>
        <DialogTrigger asChild>
          <li className="flex items-center cursor-pointer  hover:text-blue-400">
              <Edit2Icon className="inline-block mr-2" /> Zmień nazwę
          </li>
        </DialogTrigger>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Zmień nazwę folderu</DialogTitle>
            <DialogDescription>
              Zmień nazwę folderi i zapisz zmiany.
              
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4">
            <div className="grid gap-3">
              <Label htmlFor="foldernamee">Nazwa folderu</Label>
              <Input id="foldernamee" name="foldernamee" defaultValue={folderName} />
            </div>
            
          </div>
          <DialogFooter>
            <DialogClose asChild>
              <Button variant="outline">Cancel</Button>
            </DialogClose>
            <Button onClick={(e)=>{
              e.preventDefault();
              const foldername = (document.querySelector('input[name="foldernamee"]') as HTMLInputElement).value;
              router.post(`/changeFolderName/${folderId}`, {
                foldername: foldername,
                
                
              },
            {
              onSuccess: (folder) => {
                onFolderClick();
                
            ;
              }
            });

            }}>Zapisz zmiany</Button>
          </DialogFooter>
        </DialogContent>
    </Dialog>
            
              <DialogBuilder
              dialogTrigger={ <li className="flex items-center cursor-pointer mt-2 hover:text-red-500">
                          <Share className="inline-block mr-2" /> Udostępnij
                      </li>}
              dialogTitle="Czy chcesz udostępnić cały folder?"
              dialogDescription={`Czy aby napewno chcesz udostępnić folder ${folderName}?`}
              saveButtonText="Udostępnij"
              onSave={()=>handleShare(folderId)}
              >
                <>
                <h3>Podaj kod dostępu</h3>
                <Input type="number" onChange={(e)=>{setAccesCode(e.target.value)}}/>
                

                </>
              </DialogBuilder>
                  <li className="flex items-center cursor-pointer mt-2 hover:text-blue-500" >
                      
                      <button onClick={ handleDownloadFolder}><Download className="inline-block mr-2" /> Pobierz </button>
                      
                  </li>
             <AlertDialog>
                  <AlertDialogTrigger asChild>
                      <li className="flex items-center cursor-pointer mt-2 hover:text-red-500">
                          <Trash2Icon className="inline-block mr-2" /> Usuń
                      </li>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                      <AlertDialogHeader>
                          <AlertDialogTitle>Czy na pewno chcesz usunąć folder?</AlertDialogTitle>
                          <AlertDialogDescription>
                              Czy na pewno chcesz usunąć folder <strong>{folderName}</strong>? Operacji tej nie można cofnąć.
                              Stracisz <strong>{filesCount}</strong> plików znajdujących się w tym folderze.
                          </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                          <AlertDialogCancel>Anuluj</AlertDialogCancel>
                          <AlertDialogAction  onClick={async () => {
                              try {
                                  await router.delete(`/folders/${folderId}`);
                                  // alert('Plik został usunięty.');
                                  onFolderClick();
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
          </ul>
        </motion.div>
      )}
    </motion.div>
  );
}