import React, { useState } from "react";
import { router, useForm } from "@inertiajs/react";
import axios from "axios";
import { FolderPlus, FilePlus, X, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { DialogBuilder } from "./DialogBuilder";
import { toast } from "sonner";
import { useIsMobile } from "@/hooks/use-mobile";
import { useTranslation } from "react-i18next";

export function NewFolder({ urlr, refreshData }: { urlr: string; refreshData: () => void }) {
  const { t } = useTranslation();
  const [folderName, setFolderName] = useState(t("navigation.newFolder"));
  const isMobile = useIsMobile();

  const handleCreateFolder = () => {
    router.post(
      "/createFolder",
      {
        name: folderName,
        parent: urlr === "dashboard" ? null : urlr,
      },
      {
        onSuccess: () => {
          toast.success(t("response.folderCreated"));
          refreshData();
          setFolderName(t("navigation.newFolder"));
        },
      }
    );
  };

  return (
    <DialogBuilder
      dialogTrigger={
        isMobile 
          ? <Button variant="outline" title={t("navigation.newFolder")}><FolderPlus className="w-4 h-4" /></Button> 
          : <Button variant="outline"><FolderPlus className="w-4 h-4" /> {t("navigation.newFolder")}</Button>
      }
      dialogTitle={t("dialog.createFolderTitle")}
      dialogDescription={t("dialog.createFolderDescription")}
      onSave={handleCreateFolder}
    >
      <div className="grid gap-4 py-4">
        <div className="grid gap-3">
          <Label htmlFor="folder-name">{t("form.folderName")}</Label>
          <Input
            id="folder-name"
            value={folderName}
            onChange={(e) => setFolderName(e.target.value)}
            placeholder={t("form.enterName")}
          />
        </div>
      </div>
    </DialogBuilder>
  );
}

export function UploadFolderDialog({ urlr, refreshData }: { urlr: string; refreshData: () => void }) {
  const { t } = useTranslation();
  const { data, setData, post, progress } = useForm<{ files: File[]; folder: string }>({
    files: [],
    folder: urlr === "dashboard" ? "root" : urlr,
  });

  const handleFolderSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setData("files", [...data.files, ...Array.from(e.target.files)]);
    }
  };

  const handleUpload = () => {
    if (data.files.length === 0) {
      toast.error(t("response.selectFolderFirst"));
      return;
    }
    post("/uploadFile", {
      forceFormData: true,
      onSuccess: () => {
        toast.success(t("response.folderUploaded"));
        setData("files", []);
        refreshData();
      },
    });
  };

  const removeFile = (index: number) => {
    setData("files", data.files.filter((_, i) => i !== index));
  };

  return (
    <DialogBuilder
      dialogTrigger={
        <Button variant="outline">
          <FolderPlus className="w-4 h-4" /> {t("navigation.uploadFolder")}
        </Button>
      }
      dialogTitle={t("navigation.uploadFolder")}
      dialogDescription={t("dialog.uploadFolderDescription")}
      onSave={handleUpload}
    >
      <div className="grid gap-4 py-4">
        <Label htmlFor="folder-upload">{t("form.selectFolder")}</Label>
        <input
          id="folder-upload"
          type="file"
          webkitdirectory="true"
          multiple
          onChange={handleFolderSelect}
          className="cursor-pointer border rounded p-2"
        />
        {data.files.length > 0 && (
          <div className="mt-2 max-h-48 overflow-y-auto space-y-1 border p-2 rounded">
            {data.files.map((file, i) => (
              <div key={i} className="flex justify-between items-center text-sm">
                <span className="truncate">{file.webkitRelativePath}</span>
                <button type="button" onClick={() => removeFile(i)} className="text-red-500 hover:text-red-700">
                  <X className="h-4 w-4" />
                </button>
              </div>
            ))}
          </div>
        )}
        {progress && (
          <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
            <div className="bg-blue-600 h-2 rounded-full" style={{ width: `${progress.percentage}%` }} />
          </div>
        )}
      </div>
    </DialogBuilder>
  );
}

export function UploadFilesDialog({ urlr, refreshData }: { urlr: string; refreshData: () => void }) {
  const { t } = useTranslation();
  const { data, setData, post, progress } = useForm<{ files: File[]; folder: string }>({
    files: [],
    folder: urlr === "dashboard" ? "root" : urlr,
  });

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setData("files", [...data.files, ...Array.from(e.target.files)]);
    }
  };

  const handleUpload = () => {
    if (data.files.length === 0) {
      toast.error(t("response.selectFilesFirst"));
      return;
    }
    post("/uploadFile", {
      forceFormData: true,
      onSuccess: () => {
        toast.success(t("response.filesUploaded"));
        setData("files", []);
        refreshData();
      },
    });
  };

  const removeFile = (index: number) => {
    setData("files", data.files.filter((_, i) => i !== index));
  };

  const isMobile = useIsMobile();

  return (
    <DialogBuilder
      dialogTrigger={
        isMobile
          ? <Button variant="outline" title={t("navigation.uploadFiles")}><FilePlus className="w-4 h-4" /></Button>
          : <Button variant="outline"><FilePlus className="w-4 h-4" /> {t("navigation.uploadFiles")}</Button>
      }
      dialogTitle={t("dialog.uploadFilesTitle")}
      dialogDescription={t("dialog.uploadFilesDescription")}
      onSave={handleUpload}
    >
      <div className="grid gap-4 py-4">
        <Label htmlFor="file-upload">{t("form.selectFiles")}</Label>
        <input
          id="file-upload"
          type="file"
          multiple
          onChange={handleFileSelect}
          className="cursor-pointer border rounded p-2"
        />
        {data.files.length > 0 && (
          <div className="mt-2 max-h-48 overflow-y-auto space-y-1 border p-2 rounded">
            {data.files.map((file, i) => (
              <div key={i} className="flex justify-between items-center text-sm">
                <span className="truncate">{file.name}</span>
                <button type="button" onClick={() => removeFile(i)} className="text-red-500 hover:text-red-700">
                  <X className="h-4 w-4" />
                </button>
              </div>
            ))}
          </div>
        )}
        {progress && (
          <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
            <div className="bg-blue-600 h-2 rounded-full" style={{ width: `${progress.percentage}%` }} />
          </div>
        )}
      </div>
    </DialogBuilder>
  );
}

export function NewFile({ urlr, refreshData }: { urlr: string; refreshData: () => void }) {
  const { t } = useTranslation();
  const isMobile = useIsMobile();
  const [name, setName] = useState(t("navigation.newFile"));

  const handleSave = () => {
    router.post('/createFile', {
      filename: name,
      parent: urlr === 'dashboard' ? null : urlr,
    }, {
      onSuccess: () => refreshData()
    });
  };

  return (
    <DialogBuilder 
      dialogTrigger={
        isMobile
          ? <Button variant="outline" title={t("navigation.newFile")}><FilePlus className="w-4 h-4" /></Button>
          : <Button variant="outline"><FilePlus className="w-4 h-4" />{t('navigation.newFile')}</Button>
      }
      dialogTitle={t("dialog.newFileTitle")}
      dialogDescription={t("dialog.newFileDescription")}
      onSave={handleSave}
    >
      <div className="grid gap-4">
        <div className="grid gap-3">
          <Label htmlFor="file-name">{t("form.name")}</Label>
          <Input id="file-name" value={name} onChange={(e) => setName(e.target.value)} />
        </div>
      </div>
    </DialogBuilder>
  );
}

export function WipeTrash({ refreshData, files }: { refreshData: (id?: number) => void; files: any[] }) {
  const { t } = useTranslation();

  const handleWipeTrash = async () => {
    if (files.length === 0) return;
    const toastId = toast.loading(t('response.DeletingFiles'));
    try {
      await Promise.all(files.map((file) => axios.delete(`/pernamentlyDeleteFile/${file.id}`)));
      toast.success(t("response.trashEmptied"), { id: toastId });
      refreshData();
    } catch (error) {
      toast.error(t("response.trashDeleteError"), { id: toastId });
      console.error(error);
    }
  };

  return (
    <Button variant="destructive" onClick={handleWipeTrash} disabled={files.length === 0}>
      <Trash2 className="w-4 h-4 mr-2" />
      {t("navigation.emptyTrash")} ({files.length})
    </Button>
  );
}