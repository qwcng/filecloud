import React, { useEffect, useRef, useState } from "react";
import ePub, { Book, Rendition, Location } from "epubjs";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogTrigger, DialogTitle } from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Input } from "@/components/ui/input";

interface Bookmark {
  cfi: string;
  note?: string;
}

const EpubReader: React.FC = () => {
  const viewerRef = useRef<HTMLDivElement>(null);
  const [book, setBook] = useState<Book | null>(null);
  const [rendition, setRendition] = useState<Rendition | null>(null);
  const [toc, setToc] = useState<any[]>([]);
  const [currentLocation, setCurrentLocation] = useState<string | null>(null);
  const [locations, setLocations] = useState<Location[] | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);
  const [fontSize, setFontSize] = useState(100);
  const [theme, setTheme] = useState<"light" | "dark">("light");
  const [bookmarks, setBookmarks] = useState<Bookmark[]>([]);
  const [fileName, setFileName] = useState<string>("");
  const [fileBuffer, setFileBuffer] = useState<ArrayBuffer | null>(null);


  const handleFileChange = (file: File) => {
    setFileName(file.name);
    const reader = new FileReader();
    reader.onload = (e) => {
      if (e.target?.result) setFileBuffer(e.target.result as ArrayBuffer);
    };
    reader.readAsArrayBuffer(file);
  };

  useEffect(() => {
    if (!fileBuffer || !viewerRef.current) return;

    const initBook = async () => {
      const b = ePub(fileBuffer);
      setBook(b);

      await b.ready;

      // Generowanie lokalizacji
      await b.locations.generate(1600);
      setLocations(b.locations?.locations || []);
      setTotalPages(b.locations?.length() || 0);

      const r = b.renderTo(viewerRef.current!, {
        width: "100%",
        height: viewerRef.current?.clientHeight || 600,
      });

      await r.display(); // <- kluczowe

      // Rejestracja motywów
      r.themes.register("dark", { body: { background: "#121212", color: "#E5E5E5" } });
      r.themes.register("light", { body: { background: "#FAFAFA", color: "#111111" } });
      r.themes.select(theme);
      r.themes.fontSize(`${fontSize}%`);

      r.on("relocated", (location) => {
        setCurrentLocation(location.start.cfi);
        const locObj = b.locations!.locationFromCfi(location.start.cfi);
        const allLocations = b.locations!.locations || [];
        const pageIndex = allLocations.findIndex((l) => l.start.cfi === locObj.start.cfi) + 1;
        setCurrentPage(pageIndex > 0 ? pageIndex : 1);
      });

      const nav = await b.loaded.navigation;
      setToc(nav.toc);

      setRendition(r);
    };

    initBook();
  }, [fileBuffer]);
  
  // Aktualizacja motywu i fontu
  useEffect(() => {
    if (!rendition) return;
    rendition.themes.select(theme);
    rendition.themes.fontSize(`${fontSize}%`);
  }, [theme, fontSize, rendition]);


  const goToLocation = (cfi: string) => {
    setCurrentPage(rendition?.currentLocation().start.index);
    rendition?.display(cfi);
  };
  const nextPage = () => {
  if (!rendition || !locations) return;
  rendition.next();
  setCurrentPage(rendition.currentLocation().start.index);
  console.log(rendition.currentLocation().start.index);
};

const prevPage = () => {
  if (!rendition || !locations) return;
  rendition.prev();
  setCurrentPage(rendition.currentLocation().start.index);
};


const goToPage = (pageNum: number) => {
  if (!locations) return;
  if (pageNum < 1) pageNum = 1;
  if (pageNum > totalPages) pageNum = totalPages;

  goToLocation(locations[pageNum - 1].start.cfi);
};

  const addBookmark = () => {
    if (!currentLocation) return;
    const note = prompt("Dodaj notatkę do zakładki (opcjonalnie):");
    setBookmarks([...bookmarks, { cfi: currentLocation, note: note || "" }]);
  };

  return (
    <div className="flex flex-col h-screen w-screen bg-gray-50 dark:bg-gray-900 transition-colors">
      {/* Wybór pliku */}
      <div className="flex items-center justify-center p-4 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 gap-4 flex-wrap">
        <label className="cursor-pointer">
          <input
            type="file"
            accept=".epub"
            onChange={(e) => {
              const file = e.target?.files?.[0];
              if (file) handleFileChange(file);
            }}
            // className="hidden"
          />
          
       
        </label>
      </div>

      
        <>
          {/* Pasek nawigacyjny */}
          <nav className="flex items-center justify-between p-3 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 flex-wrap gap-2">
            <div className="flex items-center gap-2">
              <Button variant="ghost" onClick={prevPage}>⬅️</Button>
              <Button variant="ghost" onClick={nextPage}>➡️</Button>
              <Button variant="ghost" onClick={() => setTheme(theme === "light" ? "dark" : "light")}>
                {theme === "light" ? "🌙" : "☀️"}
              </Button>
              <input
                type="range"
                min={50}
                max={200}
                value={fontSize}
                onChange={(e) => setFontSize(Number(e.target.value))}
                className="ml-4 w-32 accent-blue-500"
              />
              <Button variant="ghost" onClick={addBookmark}>🔖</Button>
            </div>

            <div className="flex items-center gap-2">
              {/* Spis treści */}
              <Dialog>
                <DialogTrigger asChild>
                  <Button variant="ghost">📚 TOC</Button>
                </DialogTrigger>
                <DialogContent className="w-72 max-w-full p-2">
                  <DialogTitle className="sr-only">Spis treści</DialogTitle>
                  <ScrollArea className="h-80">
                    <ul className="flex flex-col gap-1">
                      {toc.map((item, idx) => (
                        <li key={idx}>
                          <Button
                            variant="ghost"
                            className="w-full text-left text-sm"
                            onClick={() => goToLocation(item.href)}
                          >
                            {item.label}
                          </Button>
                        </li>
                      ))}
                    </ul>
                  </ScrollArea>
                </DialogContent>
              </Dialog>

              {/* Zakładki */}
              <Dialog>
                <DialogTrigger asChild>
                  <Button variant="ghost">📌 Zakładki</Button>
                </DialogTrigger>
                <DialogContent className="w-72 max-w-full p-2">
                  <DialogTitle className="sr-only">Zakładki</DialogTitle>
                  <ScrollArea className="h-80">
                    <ul className="flex flex-col gap-1">
                      {bookmarks.map((bm, idx) => (
                        <li key={idx}>
                          <Button
                            variant="ghost"
                            className="w-full text-left text-sm"
                            onClick={() => goToLocation(bm.cfi)}
                          >
                            {bm.note || `Zakładka ${idx + 1}`}
                          </Button>
                        </li>
                      ))}
                    </ul>
                  </ScrollArea>
                </DialogContent>
              </Dialog>
            </div>
          </nav>

          {/* Czytnik */}
          <div
            ref={viewerRef}
            className="flex-1 w-full"
            style={{ minHeight: "calc(100vh - 120px)" }}
          />

          {/* Paginacja */}
          <div className="flex items-center justify-center gap-4 p-3 bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700">
            <span className="text-sm text-gray-600 dark:text-gray-400">
              Strona: {currentPage} / {totalPages}
            </span>
            
<input
  type="number"
  min={1}
  max={totalPages}
  value={currentPage} // <--- teraz sterowany
  // onChange={(e) => {
  //   const pageNum = e.target.valueAsNumber;
  //   if (!isNaN(pageNum)) goToPage(pageNum);
  // }}
    // onKeyDown={(e) => {
    //   if (e.key === "Enter") {
    //     const pageNum = Number((e.target as HTMLInputElement).value);
    //     goToPage(pageNum);
    //   }
    // }}
  className="w-20 text-sm"
/>
            
          </div>
        </>
    
    </div>
  );
};

export default EpubReader;
