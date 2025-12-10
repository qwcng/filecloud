import { useState } from "react"
import { Button } from "@/components/ui/button"
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

export default function OpenSharedLink() {
    const [link, setLink] = useState<string>("");
    function handleOpenLink() {
      if (link) {
        window.open(link, "_blank");
      }
    }
  return (
    <Dialog>
        <DialogTrigger asChild>
          <Button variant="outline">Otwórz udostępniony plik</Button>
        </DialogTrigger>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Otwórz udostępniony plik</DialogTitle>
            <DialogDescription>
              Wprowadź link do udostępnionego pliku, który chcesz otworzyć lub zeskanuj kod QR.
            </DialogDescription>
          </DialogHeader>
            <Input
            placeholder="Otwórz plik za pomocą linku..."
            value={link}
            onChange={(e) => {
              setLink(e.target.value);
            
            }}
          />
          <DialogFooter>
            <DialogClose asChild>
              <Button variant="outline">Cancel</Button>
            </DialogClose>
            <Button type="submit" onClick={handleOpenLink}>Otwórz plik</Button>
          </DialogFooter>
        </DialogContent>

    </Dialog>
  )
}
