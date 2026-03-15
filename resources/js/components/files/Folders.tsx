import React, { useEffect, useRef, useState } from "react";
import { Head, router, useForm, Link } from "@inertiajs/react";
import { Download, Edit2Icon, EllipsisVertical, Share, Trash2Icon, X } from "lucide-react";
import { motion } from "motion/react";
import axios from "axios";
import { toast } from "sonner";
import { useTranslation } from "react-i18next";

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
} from "@/components/ui/alert-dialog";

import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { DialogBuilder } from "../DialogBuilder";

interface FolderCardProps {
  folderName: string;
  href: string;
  onFolderClick: () => void;
  folderId: number;
  filesCount: number;
  onMove?: () => void;
}

export function FolderCard({ folderName, href, onFolderClick, folderId, filesCount, onMove }: FolderCardProps) {
  const { t } = useTranslation();
  const [optionVisible, setOptionVisible] = useState(false);
  const [pos, setPos] = useState({ x: 0, y: 0 });
  const modalRef = useRef<HTMLDivElement>(null);
  const [accesCode, setAccesCode] = useState<any>();

  const handleContextClick = (e: React.MouseEvent) => {
    e.preventDefault();
    setPos({ x: e.clientX, y: e.clientY });
    setOptionVisible(!optionVisible);
  };

  const handleDrop = async (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    const fileId = e.dataTransfer.getData("fileId");
    if (!fileId) return;

    try {
      await axios.patch(`/files/${fileId}/move`, { folder_id: folderId });
      toast.success(t("response.fileMovedToFolder", { folder: folderName }));
      if (onMove) onMove();
    } catch (err) {
      console.error(err);
      toast.error(t("response.fileMoveError"));
    }
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => e.preventDefault();

  const handleShare = (folder: number) => {
    router.post(`/folderShare/${folder}/share`, { accesscode: accesCode }, {
      onSuccess: () => toast.success(t("response.folderShared")),
    });
  };

  const handleDownloadFolder = () => {
    window.location.href = `downloadFolder/${folderId}`;
    toast.success(t("response.folderDownloadStart"));
  };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.2, ease: "easeOut" }}
      onDrop={handleDrop}
      onDragOver={handleDragOver}
      className="relative"
    >
      <Link
        href={`/dashboard/${href}`}
        onClick={() => onFolderClick()}
        className="hover:shadow-lg transition dark:bg-neutral-800 relative block w-60 aspect-video border rounded-lg p-4 shadow"
      >
        <div className="flex justify-end">
          <EllipsisVertical
            className="h-5 w-5 text-neutral-800 hover:text-neutral-600 hover:bg-neutral-300 rounded cursor-pointer"
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              handleContextClick(e);
            }}
          />
        </div>

        <svg className="mx-auto mb-0 h-20 w-20 text-yellow-400" fill="#FFD700" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 7a2 2 0 012-2h6l2 2h6a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2V7z" />
        </svg>

        <h3 className="text-sm text-[#706f6c]">{filesCount} {t("files.count")}</h3>
        <h3 className="text-lg font-medium text-ellipsis overflow-hidden whitespace-nowrap">{folderName}</h3>
      </Link>

      {optionVisible && (
        <motion.div
          ref={modalRef}
          initial={{ opacity: 0, scale: 0.95, y: -5 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          transition={{ duration: 0.15, ease: "easeOut" }}
          className="absolute z-50 bg-white dark:bg-neutral-900 rounded-xl p-4 shadow-xl w-48"
          style={{ top: pos.y, left: pos.x - 200 }}
        >
          <button onClick={() => setOptionVisible(false)} className="absolute top-2 right-2 text-gray-500 hover:text-gray-700">
            <X className="h-5 w-5" />
          </button>

          <h2 className="text-lg font-semibold mb-2">{t("folder.options")}</h2>

          <ul className="space-y-2">
            <Dialog>
              <DialogTrigger asChild>
                <li className="flex items-center cursor-pointer hover:text-blue-400">
                  <Edit2Icon className="h-4 w-4 mr-2" /> {t("folder.rename")}
                </li>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                  <DialogTitle>{t("folder.renameTitle")}</DialogTitle>
                  <DialogDescription>{t("folder.renameDescription")}</DialogDescription>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                  <div className="grid gap-2">
                    <Label htmlFor="foldernamee">{t("form.folderName")}</Label>
                    <Input id="foldernamee" name="foldernamee" defaultValue={folderName} />
                  </div>
                </div>
                <DialogFooter>
                  <DialogClose asChild>
                    <Button variant="outline">{t("common.cancel")}</Button>
                  </DialogClose>
                  <Button onClick={(e) => {
                    e.preventDefault();
                    const name = (document.querySelector('input[name="foldernamee"]') as HTMLInputElement).value;
                    router.post(`/changeFolderName/${folderId}`, { foldername: name }, { onSuccess: () => onFolderClick() });
                  }}>
                    {t("common.saveChanges")}
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>

            <DialogBuilder
              dialogTrigger={
                <li className="flex items-center cursor-pointer hover:text-blue-400">
                  <Share className="h-4 w-4 mr-2" /> {t("folder.share")}
                </li>
              }
              dialogTitle={t("folder.shareConfirmTitle")}
              dialogDescription={t("folder.shareConfirmDescription", { folder: folderName })}
              saveButtonText={t("folder.share")}
              onSave={() => handleShare(folderId)}
            >
              <div className="space-y-2">
                <Label>{t("folder.enterAccessCode")}</Label>
                <Input type="number" onChange={(e) => setAccesCode(e.target.value)} />
              </div>
            </DialogBuilder>

            <li className="flex items-center cursor-pointer hover:text-blue-500" onClick={handleDownloadFolder}>
              <Download className="h-4 w-4 mr-2" /> {t("folder.download")}
            </li>

            <AlertDialog>
              <AlertDialogTrigger asChild>
                <li className="flex items-center cursor-pointer hover:text-red-500">
                  <Trash2Icon className="h-4 w-4 mr-2" /> {t("folder.delete")}
                </li>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>{t("folder.deleteConfirmTitle")}</AlertDialogTitle>
                  <AlertDialogDescription>
                    {t("folder.deleteConfirmDescription", { folder: folderName, files: filesCount })}
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>{t("common.cancel")}</AlertDialogCancel>
                  <AlertDialogAction
                    className="bg-red-700 hover:bg-red-600 text-white"
                    onClick={async () => {
                      try {
                        await router.delete(`/folders/${folderId}`);
                        onFolderClick();
                        setOptionVisible(false);
                        toast.success(t("response.folderDeleted"));
                      } catch (error) {
                        toast.error(t("response.deleteError"));
                      }
                    }}
                  >
                    {t("folder.delete")}
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </ul>
        </motion.div>
      )}
    </motion.div>
  );
}