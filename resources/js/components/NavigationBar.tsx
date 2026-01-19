import React,{useState} from "react";
import { router } from "@inertiajs/react";
import axios from "axios";
import { 
  ArrowUpNarrowWide, 
  ArrowDownNarrowWide, 
  FolderPlus, 
  FilePlus, 
  Search, 
  Filter,
  SortAsc
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
        onSuccess: () => {
          refreshData();
          // Resetujemy nazwę po sukcesie (opcjonalnie)
          setFolderName("Nowy folder");
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