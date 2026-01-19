
import React, { Children } from "react";
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


export function DialogBuilder({
  children,
  dialogTrigger,
  dialogTitle,
  dialogDescription,
  saveButtonText = "Zapisz",
  onSave // Przekazujemy funkcję, która ma się wykonać
}: {
  children: React.ReactNode;
  dialogTrigger: React.ReactNode;
  dialogTitle: string;
  dialogDescription: string;
  saveButtonText?: string;
  onSave?: () => void;
}) {
  return (
    <Dialog>
      <DialogTrigger asChild>{dialogTrigger}</DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>{dialogTitle}</DialogTitle>
          <DialogDescription>{dialogDescription}</DialogDescription>
        </DialogHeader>
        
        {children}

        <DialogFooter>
          <DialogClose asChild>
            <Button variant="outline">Anuluj</Button>
          </DialogClose>
          {/* Jeśli onSave istnieje, renderujemy przycisk zapisu */}
          {onSave && (
            <Button type="submit" onClick={onSave}>
              {saveButtonText}
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
