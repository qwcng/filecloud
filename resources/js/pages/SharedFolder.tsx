import React, { useState, useRef, useEffect } from 'react';
import axios from 'axios';
import { Head, router, usePage } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import { Toaster } from '@/components/ui/sonner';
import { FileCard, FileModal } from '@/components/files/Files';
import { Gallerye } from './partials/Gallery';
import { Button } from '@/components/ui/button';

interface FileData {
    id: number;
    original_name: string;
    path: string;
    mime_type: string;
    size: string;
    created_at: string;
    is_favorite: boolean;
    type?: string;
    name?: string;
    url?: string;
}

// Prosty kontener dla osób niezalogowanych - brak Sidebaru
const GuestLayout = ({ children }: { children: React.ReactNode }) => (
    <div className="min-h-screen bg-gray-50 dark:bg-neutral-950 flex flex-col">
        {/* <header className="h-16 border-b dark:border-neutral-800 bg-white dark:bg-neutral-900 flex items-center px-6">
            <span className="text-lg font-bold dark:text-white">CloudShare</span>
        </header> */}
        <main className="flex-1 container mx-auto p-4 lg:p-8">
            {children}
        </main>
    </div>
);

export default function SharedFolder({ folderId }: { folderId: string }) {
    // Pobieramy dane o autoryzacji z Inertia
    const { auth } = usePage().props as any;
    const isLogged = !!auth.user;

    const [code, setCode] = useState(['', '', '', '', '', '']);
    const [loading, setLoading] = useState(false);
    const [files, setFiles] = useState<FileData[] | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [gallery, setGallery] = useState<boolean>(false);
    const [selectedFile, setSelectedFile] = useState<FileData | null>(null);
    const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

    const handleChange = (value: string, index: number) => {
        if (!/^\d*$/.test(value)) return;

        const newCode = [...code];
        if (value.length > 1) {
            const pastedCode = value.split('').slice(0, 6);
            pastedCode.forEach((char, i) => {
                if (newCode[i] !== undefined) newCode[i] = char;
            });
            setCode(newCode);
            inputRefs.current[Math.min(pastedCode.length, 5)]?.focus();
            return;
        }

        newCode[index] = value;
        setCode(newCode);

        if (value && index < 5) {
            inputRefs.current[index + 1]?.focus();
        }
    };

    const handleBackspace = (index: number, e: React.KeyboardEvent) => {
        if (e.key === 'Backspace' && !code[index] && index > 0) {
            inputRefs.current[index - 1]?.focus();
        }
    };

    const mapMimeToType = (mime: string) => {
        if (mime.startsWith("image/")) return "image";
        if (mime.startsWith("audio/")) return "mp3";
        if (mime.startsWith("video/")) return "video";
        if (mime === "application/pdf") return "pdf";
        if (mime.includes("word")) return "other";
        if (mime.includes("excel") || mime.includes("spreadsheet")) return "excel";
        if (mime.includes("presentation")) return "ppt";
        if (mime === "application/epub+zip") return "epub";
        return "other";
    };

    const handleVerify = async () => {
        const fullCode = code.join('');
        if (fullCode.length !== 6) return;

        setLoading(true);
        setError(null);
        try {
            const response = await axios.post(`/folderShare/${folderId}/check`, {
                access_code: fullCode
            });
            const mappedFiles = response.data.map((f: any) => ({
                id: f.id,
                name: f.original_name,
                type: mapMimeToType(f.mime_type),
                size: f.size,
                created_at: f.created_at,
                url: f.url,
            }));
            setFiles(mappedFiles);
        } catch (err: any) {
            setError(err.response?.data?.message || 'Błędny kod dostępu lub link wygasł');
            setCode(['', '', '', '', '', '']);
            inputRefs.current[0]?.focus();
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (code.every(char => char !== '')) {
            handleVerify();
        }
    }, [code]);

    const closeGallery = () => setGallery(false);

    const handleClick = (file: FileData) => {
        if (file.type === "image") {
            setGallery(true);
        } else {
            setSelectedFile(file);
        }
    };

    // Wybór layoutu na podstawie zalogowania
    const Layout = isLogged ? AppLayout : GuestLayout;
    const handleFolderSave = ()=>{
        router.post(`/saveSharedFolder/${folderId}`,{
            access_code: code.join('')
        })
    }
    // EKRAN WPISYWANIA KODU (zawsze bez sidebaru)
    if (!files) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-neutral-950 py-12 px-4">
                <Head title="Prywatny Folder" />
                
                <div className="bg-white dark:bg-neutral-900 p-6 rounded-lg shadow-md w-full max-w-md border dark:border-neutral-800">
                    <h2 className="text-xl font-semibold mb-4 dark:text-white">Wprowadź kod dostępu</h2>
                    <p className="text-sm text-gray-500 dark:text-neutral-400 mb-6">
                        Ten folder jest chroniony. Wpisz 6-cyfrowy kod, aby zobaczyć zawartość.
                    </p>

                    <div className="flex justify-center gap-2 mb-6">
                        {code.map((c, i) => (
                            <input
                                key={i}
                                ref={(el) => (inputRefs.current[i] = el)}
                                type="text"
                                inputMode="numeric"
                                maxLength={1}
                                value={c}
                                disabled={loading}
                                onChange={(e) => handleChange(e.target.value, i)}
                                onKeyDown={(e) => handleBackspace(i, e)}
                                className="w-12 h-12 text-center text-xl border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-neutral-800 dark:border-neutral-700 dark:text-white transition-all disabled:opacity-50"
                            />
                        ))}
                    </div>

                    <button
                        onClick={handleVerify}
                        disabled={loading || code.join('').length < 6}
                        className="w-full bg-blue-600 text-white rounded-md px-4 py-2 hover:bg-blue-700 transition-colors flex justify-center items-center gap-2 disabled:bg-blue-400 disabled:cursor-not-allowed"
                    >
                        {loading && <div className="w-4 h-4 border-2 border-t-transparent border-white rounded-full animate-spin"></div>}
                        {loading ? 'Weryfikacja...' : 'Sprawdź kod'}
                    </button>

                    {error && (
                        <p className="text-red-500 text-sm mt-4 text-center bg-red-50 dark:bg-red-900/10 p-2 rounded">
                            {error}
                        </p>
                    )}
                </div>
            </div>
        );
    }

    // WIDOK PLIKÓW (z layoutem zależnym od logowania)
    return (
        <Layout>
            <Head title="Udostępnione Pliki" />
            <Toaster position="top-center" richColors />
            
            <div className="flex h-full flex-1 flex-col gap-4 p-4">
                <div className="flex flex-col gap-1">
                    <h1 className="text-2xl font-bold dark:text-white">Udostępnione pliki</h1>
                    <p className="text-sm text-muted-foreground">
                        {isLogged ? "Przeglądasz pliki jako zalogowany użytkownik." : "Masz dostęp do poniższych zasobów."}
                        
                    </p>
                    {isLogged?(
                            <>
                            <Button variant={"outline"} onClick={handleFolderSave}> Zapisz Folder</Button>
                            </>
                        ):(
                            <>
                            </>
                        )}
                </div>

                <div className="flex flex-wrap gap-4 lg:justify-start justify-center mt-4">
                    {files.length === 0 ? (
                        <div className="w-full text-center py-20">
                            <p className="text-muted-foreground">Ten folder jest pusty.</p>
                        </div>
                    ) : (
                        files.map((file) => (
                            <FileCard key={file.id} file={file as any} onClick={() => handleClick(file)} sharing={true} />
                        ))
                    )}

                    {selectedFile && <FileModal file={selectedFile} onClose={() => setSelectedFile(null)} />}
                    
                    {gallery && (
                        <Gallerye 
                            images={files.filter(file => file.type === 'image')} 
                            initialIndex={0} 
                            onClose={closeGallery} 
                            sharing={true} 
                        />
                    )}
                </div>
            </div>
        </Layout>
    );
}