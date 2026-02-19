import React,{useState} from "react";
import { router, useForm } from "@inertiajs/react";
import axios from "axios";
import { 
  ArrowUpNarrowWide, 
  ArrowDownNarrowWide, 
  FolderPlus, 
  FilePlus, 
  Search, 
  Filter,
  SortAsc,
  X,
  Folder,
  Trash2
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
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
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { DialogBuilder } from "./DialogBuilder";
import { toast } from "sonner";
import { files } from "jszip";
import { ref } from "process";

interface NavigationBarProps {
  urlr: string;
  refreshData: () => void;
  sorting: string;
  onSortingChange: (val: string) => void;
  files: any[];
  setSortedFiles: (files: any[]) => void;
  mapMimeToType: (mime: string) => any;
}

export function NewFolder({ urlr, refreshData }: { urlr: string; refreshData: () => void }) {
  const [folderName, setFolderName] = useState("Nowy folder");

  const handleCreateFolder = () => {
    router.post(
      "/createFolder",
      {
        name: folderName,
        parent: urlr === "dashboard" ? null : urlr,
      },
      {
        onSuccess: (page) => {
          toast.success("Folder został utworzony!");
          refreshData();
          // Resetujemy nazwę po sukcesie (opcjonalnie)
          setFolderName("Nowy folder");
          // refreshData();
        },
      }
    );
  };

  return (
    <DialogBuilder
      dialogTrigger={<Button variant="outline"> <FolderPlus className="w-4 h-4 " /> Nowy Folder</Button>}
      dialogTitle="Stwórz folder"
      dialogDescription="Podaj nazwę nowego folderu."
      onSave={handleCreateFolder}
    >
      <div className="grid gap-4 py-4">
        <div className="grid gap-3">
          <Label htmlFor="folder-name">Nazwa folderu</Label>
          <Input
            id="folder-name"
            value={folderName}
            onChange={(e) => setFolderName(e.target.value)}
            placeholder="Wpisz nazwę..."
          />
        </div>
      </div>
    </DialogBuilder>
  );
}
export function UploadFolderDialog({ urlr, refreshData }: { urlr: string; refreshData: () => void }) {
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
      toast.error("Wybierz folder z plikami do przesłania!");
      return;
    }

    post("/uploadFile", {
      forceFormData: true,
      onSuccess: () => {
        toast.success("Folder został przesłany!");
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
      dialogTrigger={<Button variant="outline"><FolderPlus className="w-4 h-4" /> Prześlij folder</Button>}
      dialogTitle="Prześlij folder"
      dialogDescription="Wybierz folder do przesłania na serwer."
      onSave={handleUpload}
    >
      <div className="grid gap-4 py-4">
        <Label htmlFor="folder-upload">Wybierz folder</Label>
        <input
          id="folder-upload"
          type="file"
          webkitdirectory="true"
          multiple
          onChange={handleFolderSelect}
          className="cursor-pointer border rounded p-2"
        />
  {/* <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-500"></div> */}
        {data.files.length > 0 && (
          <div className="mt-2 max-h-48 overflow-y-auto space-y-1 border p-2 rounded">
            {data.files.map((file, i) => (
              <div key={i} className="flex justify-between items-center text-sm">
                <span className="truncate">{file.webkitRelativePath}</span>
                {/* loading animation */}
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500">

                </div>
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
      toast.error("Wybierz pliki do przesłania!");
      return;
    }

    post("/uploadFile", {
      forceFormData: true,
      onSuccess: () => {
        toast.success("Pliki zostały przesłane!");
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
      dialogTrigger={<Button variant="outline"><FilePlus className="w-4 h-4" /> Prześlij pliki</Button>}
      dialogTitle="Prześlij pliki"
      dialogDescription="Wybierz pliki do przesłania na serwer."
      onSave={handleUpload}
    >
      <div className="grid gap-4 py-4">
        <Label htmlFor="file-upload">Wybierz pliki</Label>
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
  const [name, setName] = React.useState("Nowy plik");

  const handleSave = () => {
    router.post('/createFile', {
      filename: name,
      parent: urlr === 'dashboard' ? null : urlr,
    }, {
      onSuccess: () => {
        refreshData();
        // Tutaj można dodać zamknięcie dialogu jeśli potrzebne
      }
    });
  };

  return (
    <DialogBuilder 
      dialogTrigger={<Button variant="outline"> <FilePlus className="w-4 h-4 " /> Nowy Plik</Button>} 
      dialogTitle="Nowy Plik" 
      dialogDescription="Podaj nazwę dla nowego elementu."
      onSave={handleSave} // Przekazujemy referencję do funkcji
    >
      <div className="grid gap-4">
        <div className="grid gap-3">
          <Label htmlFor="file-name">Nazwa</Label>
          <Input 
            id="file-name" 
            value={name} 
            onChange={(e) => setName(e.target.value)} 
          />
        </div>
      </div>
    </DialogBuilder>
  );

  
   
}
export function WipeTrash({ refreshData, files }: { refreshData: (id?: number) => void; files: any[] }) {
    const handleWipeTrash = async () => {
        if (files.length === 0) return;

        const toastId = toast.loading("Usuwanie plików...");

        try {
            // Wykonujemy wszystkie usunięcia równolegle
            await Promise.all(
                files.map((file) => axios.delete(`/pernamentlyDeleteFile/${file.id}`))
            );

            toast.success("Kosz został opróżniony", { id: toastId });
            refreshData(); // Wywołanie bez ID wyczyści całą tablicę w stanie
        } catch (error) {
            toast.error("Nie udało się usunąć wszystkich plików", { id: toastId });
            console.error(error);
        }
    };

    return (
        <Button variant="destructive" onClick={handleWipeTrash} disabled={files.length === 0}>
            <Trash2 className="w-4 h-4 mr-2" />
            Opróżnij kosz ({files.length})
        </Button>
    );
}