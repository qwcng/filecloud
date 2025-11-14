import React, { useState, useEffect, useRef, useCallback } from 'react';
import Epub, { Book, Rendition, NavItem } from 'epubjs';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';

const EpubReader: React.FC<{ defaultUrl?: string }> = ({ defaultUrl = "" }) => {
    const [book, setBook] = useState<Book | null>(null);
    const [rendition, setRendition] = useState<Rendition | null>(null);
    const [toc, setToc] = useState<NavItem[]>([]);
    const [currentLocationText, setCurrentLocationText] = useState<string>('Brak książki');
    const [currentPage, setCurrentPage] = useState<number>(0);
    const [totalPages, setTotalPages] = useState<number>(0);
    const [inputPage, setInputPage] = useState<string>('0');
    const [currentChapterHref, setCurrentChapterHref] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [isSidebarOpen, setIsSidebarOpen] = useState<boolean>(false);
    const [isMobile, setIsMobile] = useState<boolean>(window.innerWidth <= 768);
    const [refreshTrigger, setRefreshTrigger] = useState(0);

    const [bookCode, setBookCode] = useState<string>(defaultUrl); // <-- NEW FIELD

    const viewerRef = useRef<HTMLDivElement>(null);
    const currentRenditionLocationRef = useRef<any>(null);
    setTimeout(() => setRefreshTrigger(refreshTrigger + 1), 3000);

    useEffect(() => {
        const handleResize = () => {
            setIsMobile(window.innerWidth <= 768);
            rendition?.resize();
        };

        let resizeTimeout: NodeJS.Timeout;
        const debounced = () => {
            clearTimeout(resizeTimeout);
            resizeTimeout = setTimeout(handleResize, 200);
        };

        window.addEventListener('resize', debounced);
        return () => {
            window.removeEventListener('resize', debounced);
            clearTimeout(resizeTimeout);
        };
    }, [rendition]);

    const handleBookCodeChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
        setBookCode(e.target.value);
    }, []);

    // File upload removed

const handleUrlLoad = useCallback(async () => {
    if (!bookCode) return alert('Podaj URL książki');

    setIsLoading(true);
    setCurrentLocationText('Ładowanie książki...');
    setCurrentPage(0);
    setTotalPages(0);
    setInputPage('0');
    setToc([]);
    setCurrentChapterHref(null);

    rendition?.destroy();
    book?.destroy();
    setRendition(null);
    setBook(null);

    try {
        const response = await fetch("/showFile/" + bookCode);
        const arrayBuffer = await response.arrayBuffer();
        const newBook = Epub(arrayBuffer);
        setBook(newBook);
        const navigation = await newBook.loaded.navigation;
        setToc(navigation.toc);
    } catch (e) {
        alert('Nie udało się załadować książki z URL');
    }

    setIsLoading(false);
}, [book, rendition, bookCode]);

    useEffect(() => {
        if (book && viewerRef.current) {
            const newRendition = book.renderTo(viewerRef.current, {
                width: '100%',
                height: '100%',
                flow: 'paginated',
                manager: 'default',
                minSpreadWidth: 800,
                allowScriptedContent: true,
            });

            book.ready.then(async () => {
                await book.locations.generate(1500);
                setTotalPages(book.locations.length());
            });

            newRendition.display();

            newRendition.on('locationChanged', (location) => {
                currentRenditionLocationRef.current = location;

                const page = book.locations.locationFromCfi(location.start.cfi);
                if (typeof page === 'number') {
                    setCurrentPage(page);
                    setInputPage(String(page));
                }
            });

            setRendition(newRendition);

            return () => {
                newRendition.destroy();
                setRendition(null);
                currentRenditionLocationRef.current = null;
            };
        }
    }, [book, toc, viewerRef.current]);

    const nextPage = useCallback(() => rendition?.next(), [rendition]);
    const prevPage = useCallback(() => rendition?.prev(), [rendition]);
    const goToChapter = useCallback(href => { rendition?.display(href); if (isMobile) setIsSidebarOpen(false); }, [rendition, isMobile]);

    const handlePageInputChange = useCallback(e => setInputPage(e.target.value), []);
    const handleGoToPage = useCallback(e => {
        if (e.key === 'Enter' && currentRenditionLocationRef.current) {
            const pageNum = parseInt(inputPage, 10);
            if (!isNaN(pageNum) && pageNum >= 1 && pageNum <= totalPages) {
                currentRenditionLocationRef.current.goTo(pageNum);
            } else {
                alert(`Proszę wpisać prawidłowy numer strony (1-${totalPages}).`);
                setInputPage(String(currentPage));
            }
            e.currentTarget.blur();
        }
    }, [inputPage, totalPages, currentPage]);

    const renderSidebar = () => (
        <div className="flex flex-col h-full p-4 bg-background border-r shadow-md overflow-y-auto">
            <h3 className="text-lg font-semibold mb-4 text-foreground">Spis treści</h3>
            {toc.length ? (
                <ul>
                    {toc.map(item => (
                        <li key={item.href} className="mb-2">
                            <Button
                                variant="ghost"
                                className={`w-full justify-start ${currentChapterHref && item.href.includes(currentChapterHref) ? 'bg-primary text-primary-foreground' : ''}`}
                                onClick={() => goToChapter(item.href)}
                            >
                                {item.label}
                            </Button>
                        </li>
                    ))}
                </ul>
            ) : (
                <p className="text-muted-foreground text-sm">{isLoading ? 'Ładowanie spisu treści...' : 'Brak spisu treści.'}</p>
            )}
        </div>
    );

    return (
        <div className="flex flex-col h-screen bg-background text-foreground overflow-hidden">
            <header className="flex items-center justify-between p-4 bg-card border-b shadow-sm">
                <div className="flex items-center space-x-3">

                    {isMobile && (
                        <Sheet open={isSidebarOpen} onOpenChange={setIsSidebarOpen}>
                            <SheetTrigger asChild>
                                <Button variant="outline">Spis Treści</Button>
                            </SheetTrigger>
                            <SheetContent side="left" className="p-0 sm:max-w-xs">
                                {renderSidebar()}
                            </SheetContent>
                        </Sheet>
                    )}

                    

                    {/* NEW: INPUT FOR BOOK CODE */}
                    <Input type="text" placeholder="URL EPUB" value={bookCode} onChange={handleBookCodeChange} />
<Button onClick={handleUrlLoad}>Ładuj</Button>
                </div>
            </header>

            <div className="flex flex-grow overflow-hidden">
                {!isMobile && (
                    <aside className="w-[280px] overflow-y-auto">{renderSidebar()}</aside>
                )}

                <main className="flex-grow overflow-hidden bg-secondary flex justify-center items-center p-5">
                    {isLoading ? (
                        <p>Ładowanie książki...</p>
                    ) : book ? (
                        <div ref={viewerRef} className="w-full h-full max-w-[1000px]"></div>
                    ) : (
                        <p>Wklej URL książki, aby ją załadować.</p>
                    )}
                </main>
            </div>

            {book && !isLoading && (
                <footer className="flex items-center justify-center p-3 bg-card border-t shadow-sm gap-3">
                    <Button onClick={prevPage}>&larr; Poprzednia</Button>

                    <div className="flex items-center gap-2 text-sm">
                        <Input type="number" value={inputPage} onChange={handlePageInputChange} onKeyDown={handleGoToPage} className="w-16 text-center" />
                        <span>/ {totalPages}</span>
                    </div>

                    <Button onClick={nextPage}>Następna &rarr;</Button>
                </footer>
            )}
        </div>
    );
};

export default EpubReader;

