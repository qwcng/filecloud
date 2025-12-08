import { useState, useEffect, useRef } from "react";
import AppLayout from "@/layouts/app-layout";
import { Card, CardContent,CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCaption, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
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
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"


interface FileType {
  id: number;
  name: string;
  size: string;
  shared_at: string;
}

export default function SharedFileTest() {
  const [files, setFiles] = useState<FileType[]>([]);

  useEffect(() => {
  // dane testowe
  axios.get('/getSharedFiles').then(response => {
    console.log(response.data);
    setFiles(response.data.shared_files);
  });
  }, []);

  

  const [query, setQuery] = useState("");
  const [page, setPage] = useState(1);
  const perPage = 5;
  const [dialog, setDialog] = useState(false);
  const [selectedFile, setSelectedFile] = useState<FileType | null>(null);
  const[action, setAction] = useState<string | undefined>(undefined);
  // filtrowanie po nazwie
  const filteredFiles = files.filter(file =>
    file.name.toLowerCase().includes(query.toLowerCase())
  );

  const totalPages = Math.ceil(filteredFiles.length / perPage);

  // paginacja lokalna
  const paginatedFiles = filteredFiles.slice((page - 1) * perPage, page * perPage);
const handleaction = (e:any) => {
  return (value: string) => {
  
      console.log("Cofnij udostępnienie dla pliku o ID:", e.id);
      setDialog(true);
      setSelectedFile(e);
      // Tutaj dodaj logikę cofania udostępnienia pliku
   
  }
}
useRef(selectedFile);

const handleSubmit = () => {
  if(action==="delete"){
    // Tutaj dodaj logikę cofania udostępnienia pliku
    axios.delete('/filesShare/' + selectedFile?.id)
    .then(response => {
      setDialog(false);
    })
    .catch(error => {
      console.error('There was an error!', error);
    });
  }
  if(action==="download"){
    // Tutaj dodaj logikę pobierania pliku
    window.location.href = '/d/' + selectedFile?.id ;
  }
  setDialog(false);
}
  return (
    <AppLayout breadcrumbs={[{ title: "Udostępnione pliki", href: "/shared-files" }]}>
      <div className="flex h-full flex-1 flex-col gap-4 overflow-x-auto rounded-xl p-4">
        <h3 className="text-lg font-semibold">📂 Udostępnione pliki</h3>

        <div className="flex items-center gap-2 my-4">
          <Input
            placeholder="Szukaj plików..."
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setPage(1); // reset strony przy wyszukiwaniu
            }}
          />
        </div>

        
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-16">Nazwa pliku</TableHead>
                  <TableHead>Rozmiar</TableHead>
                  {/* <TableHead>Udostępnione przez</TableHead> */}
                  <TableHead>Data dodania</TableHead>
                  <TableHead>Akcje</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {paginatedFiles.map(file => (
                  <TableRow key={file.id}>
                    <TableCell>{file.name}</TableCell>
                    <TableCell>{file.size}</TableCell>
                    
                    <TableCell>{new Date(file.shared_at).toLocaleString()}</TableCell>
                    <TableCell>
                     <Select 
                      value={undefined}
                    onValueChange={(e)=>{handleaction(file)(e)
                                                setAction(e);
                                    
                      
                                            
                     }
                    
                    }
                    
                    >
                      <SelectTrigger className="w-[180px]">
                        <SelectValue placeholder="Wybierz akcję" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectGroup>
                          <SelectLabel>Akcje</SelectLabel>
                          <SelectItem value="delete">Cofnij udostępnienie</SelectItem>
                          <SelectItem value="edit">Zmień kod</SelectItem>
                          <SelectItem value="download">Pobierz</SelectItem>
                          


                          {/* <SelectItem value="blueberry">Blueberry</SelectItem> */}
                          {/* <SelectItem value="grapes">Grapes</SelectItem>
                          <SelectItem value="pineapple">Pineapple</SelectItem> */}
                        </SelectGroup>
                      </SelectContent>
                    </Select>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>

            <div className="flex justify-between mt-4">
              <Button
                disabled={page <= 1}
                onClick={() => setPage(page - 1)}
              >
                Poprzednia
              </Button>
              <span>Strona {page} z {totalPages}</span>
              <Button
                disabled={page >= totalPages}
                onClick={() => setPage(page + 1)}
              >
                Następna
              </Button>
            </div>
         
        <AlertDialog open={dialog}>
      <AlertDialogTrigger asChild>
        <Button variant="outline">Show Dialog</Button>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Czy napewno chcesz cofnąć dostęp?</AlertDialogTitle>
          <AlertDialogDescription>
            {action==="delete" ?(
           `Czy na pewno chcesz cofnąć dostęp do pliku ${selectedFile?.name}"?`
            ) : null}
            {action==="download" ?(
              <>
                Plik <strong>{selectedFile?.name}</strong> zostanie pobrany.
              </>
          
          ) : null}
            {action==="edit" ?(
           `Funkcja pobierania pliku jeszcze nie jest zaimplementowana.`
            ) : null}

          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel onClick={(e) => {
                            setDialog(false);
                            setAction(undefined); 
                            // setAction(null);            
                                            
          }}>Cancel</AlertDialogCancel>
          <AlertDialogAction onClick={(e)=>{handleSubmit()}}>Cofnij dostęp</AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
      </div>
    </AppLayout>
  );
}
