import { useState, useEffect, useRef } from "react";
import AppLayout from "@/layouts/app-layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import axios from "axios";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Ban, CopyIcon, Download, EyeIcon, PenLine, ShareIcon } from "lucide-react";
import { router } from "@inertiajs/react";
import QrCodeGenerator from "@/components/QRcodeGenerator";
import OpenSharedLink from "@/components/OpenSharedLink";
import { FolderCard } from "@/components/files/Folders";
import { DialogBuilder } from "@/components/DialogBuilder";
import { toast } from "sonner";
import { Toaster } from "@/components/ui/sonner";
import { useTranslation } from "react-i18next";

interface FileType {
  id: number;
  name: string;
  size: string;
  expires_at: string | null;
  shared_at: string;
  code: string;
  downloads: number;
}

export default function SharedFileTest() {
  const { t } = useTranslation();
  const [files, setFiles] = useState<FileType[]>([]);
  const [code, setCode] = useState<number>();
  const [query, setQuery] = useState("");
  const [page, setPage] = useState(1);
  const [dialog, setDialog] = useState(false);
  const [selectedFile, setSelectedFile] = useState<FileType | null>(null);
  const [action, setAction] = useState<string | undefined>(undefined);
  const [folders, setFolders] = useState<any>();
  const perPage = 5;

  useEffect(() => {
    axios.get('/getSharedFiles').then(res => setFiles(res.data.shared_files));
    axios.get('/getSharedFolders').then(res => setFolders(res.data));
  }, []);

  const filteredFiles = files.filter(file =>
    file.name.toLowerCase().includes(query.toLowerCase())
  );

  const totalPages = Math.ceil(filteredFiles.length / perPage);
  const paginatedFiles = filteredFiles.slice((page - 1) * perPage, page * perPage);

  const handleActionOpen = (file: FileType, act: string) => {
    setSelectedFile(file);
    setAction(act);
    setDialog(true);
  };

  const handleSubmit = () => {
    if (action === "delete") {
      axios.delete(`/filesShare/${selectedFile?.id}`)
        .then(() => {
          setFiles(prev => prev.filter(f => f.id !== selectedFile?.id));
          setDialog(false);
        })
        .catch(err => console.error(err));
    }
    if (action === "download") {
      window.location.href = `/d/${selectedFile?.id}`;
      setDialog(false);
    }
  };

  return (
    <div className="flex h-full flex-1 flex-col gap-4 overflow-x-auto rounded-xl p-4">
      <h3 className="text-lg font-semibold">{t("sharedFiles.title")}</h3>
      <Toaster richColors position="top-center" />

      <div className="flex items-center gap-2 my-4">
        <OpenSharedLink />
        <Input
          placeholder={t("sharedFiles.searchPlaceholder")}
          value={query}
          onChange={(e) => { setQuery(e.target.value); setPage(1); }}
        />
      </div>

      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-16">{t("sharedFiles.table.name")}</TableHead>
            <TableHead>{t("sharedFiles.table.size")}</TableHead>
            <TableHead>{t("sharedFiles.table.sharedAt")}</TableHead>
            <TableHead>{t("sharedFiles.table.expires")}</TableHead>
            <TableHead>{t("sharedFiles.table.code")}</TableHead>
            <TableHead>{t("sharedFiles.table.downloads")}</TableHead>
            <TableHead>{t("sharedFiles.table.actions")}</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {paginatedFiles.map(file => (
            <TableRow key={file.id}>
              <TableCell className="font-medium">{file.name}</TableCell>
              <TableCell>{file.size}</TableCell>
              <TableCell>{new Date(file.shared_at).toLocaleString()}</TableCell>
              <TableCell>{file.expires_at ? new Date(file.expires_at).toLocaleString() : t("sharedFiles.never")}</TableCell>
              <TableCell>{file.code}</TableCell>
              <TableCell>{file.downloads}</TableCell>
              <TableCell>
                <Select onValueChange={(val) => handleActionOpen(file, val)}>
                  <SelectTrigger className="w-[180px]">
                    <SelectValue placeholder={t("sharedFiles.selectAction")} />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectGroup>
                      <SelectLabel>{t("sharedFiles.actionsLabel")}</SelectLabel>
                      <SelectItem value="preview"><div className="flex items-center gap-2"><EyeIcon size={16}/> {t("sharedFiles.actions.preview")}</div></SelectItem>
                      <SelectItem value="share"><div className="flex items-center gap-2"><ShareIcon size={16}/> {t("sharedFiles.actions.share")}</div></SelectItem>
                      <SelectItem value="delete"><div className="flex items-center gap-2"><Ban size={16}/> {t("sharedFiles.actions.revoke")}</div></SelectItem>
                      <SelectItem value="edit"><div className="flex items-center gap-2"><PenLine size={16}/> {t("sharedFiles.actions.changeCode")}</div></SelectItem>
                      <SelectItem value="download"><div className="flex items-center gap-2"><Download size={16}/> {t("sharedFiles.actions.download")}</div></SelectItem>
                    </SelectGroup>
                  </SelectContent>
                </Select>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>

      <div className="flex justify-between mt-4">
        <Button disabled={page <= 1} onClick={() => setPage(page - 1)}>{t("pagination.previous")}</Button>
        <span className="text-sm text-muted-foreground">{t("pagination.pageOf", { page, total: totalPages })}</span>
        <Button disabled={page >= totalPages} onClick={() => setPage(page + 1)}>{t("pagination.next")}</Button>
      </div>

      <AlertDialog open={dialog} onOpenChange={setDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{t("sharedFiles.dialog.revokeTitle")}</AlertDialogTitle>
            <AlertDialogDescription>
              {action === "delete" && t("sharedFiles.dialog.revokeDescription", { name: selectedFile?.name })}
              {action === "download" && t("sharedFiles.dialog.downloadDescription", { name: selectedFile?.name })}
              {action === "edit" && (
                <div className="space-y-4 mt-2">
                  <Input type="number" defaultValue={code} onChange={(e) => setCode(Number(e.target.value))} placeholder={t("sharedFiles.dialog.newAccessCode")} />
                  <Button className="w-full" onClick={() => router.post('/updateShareCode', { file_id: selectedFile?.id, access_code: code }, { onSuccess: () => setDialog(false) })}>{t("common.save")}</Button>
                </div>
              )}
              {action === "share" && (
                <div className="space-y-4 text-center mt-2">
                  <p>{t("sharedFiles.dialog.shareAgain", { name: selectedFile?.name })}</p>
                  <div className="flex justify-center"><QrCodeGenerator url={`${window.location.origin}/share/${selectedFile?.id}`} /></div>
                  <div className="flex gap-2">
                    <Input readOnly value={`${window.location.origin}/share/${selectedFile?.id}`} />
                    <Button variant="outline" onClick={() => { navigator.clipboard.writeText(`${window.location.origin}/share/${selectedFile?.id}`); toast.success(t("sharedFiles.linkCopied")); }}><CopyIcon size={16} /></Button>
                  </div>
                </div>
              )}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => { setDialog(false); setAction(undefined); }}>{t("common.cancel")}</AlertDialogCancel>
            {(action === "delete" || action === "download") && <AlertDialogAction onClick={handleSubmit}>{t("sharedFiles.revokeAccess")}</AlertDialogAction>}
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <h3 className="text-lg font-semibold mt-8">{t("sharedFolders.title")}</h3>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {folders?.map((folder: any) => (
          <div key={folder.folder_id} className="space-y-2">
            <FolderCard
              folderId={folder.folder_id}
              folderName={folder.name}
              href={folder.slug || folder.folder_id.toString()}
              filesCount={folder.files_count || 0}
              onFolderClick={() => console.log(folder.name)}
            />
            <DialogBuilder dialogTrigger={<Button variant="link" className="p-0 h-auto font-bold">{t("sharedFolders.more")}</Button>}>
              <div className="space-y-4 text-center">
                <div className="flex justify-center"><QrCodeGenerator url={`${window.location.origin}/folderShare/${folder.folder_id}`} /></div>
                <div className="flex gap-2">
                  <Input readOnly value={`${window.location.origin}/folderShare/${folder.folder_id}`} />
                  <Button variant="outline" onClick={() => { navigator.clipboard.writeText(`${window.location.origin}/folderShare/${folder.folder_id}`); toast.success(t("sharedFiles.linkCopied")); }}><CopyIcon size={16} /></Button>
                </div>
                <p className="text-sm font-medium">{t("sharedFolders.code")} {folder.access_code}</p>
                <Button variant="destructive" className="w-full" onClick={() => router.post('/revokeSharedFolder', { folder_id: folder.folder_id }, { onSuccess: () => toast.success(t("sharedFolders.revokedToast")) })}>{t("sharedFolders.revoke")}</Button>
              </div>
            </DialogBuilder>
          </div>
        ))}
      </div>
    </div>
  );
}

SharedFileTest.layout = (page: React.ReactNode) => <AppLayout>{page}</AppLayout>;