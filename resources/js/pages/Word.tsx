import React, { useState, useRef, useEffect } from 'react';
import AppLayout from '@/layouts/app-layout';
import { router } from '@inertiajs/react';
import { SaveIcon } from 'lucide-react';
export default function ModernNotatnik({fileContent,fileId,fileName }: {fileContent?: string,fileId?: string,fileName?: string}) {
  const [url, setUrl] = useState('');
  const [filename, setFilename] = useState('');
  const [text, setText] = useState('');
  const [status, setStatus] = useState('gotowy');
  const [proxy, setProxy] = useState('');
  const [darkMode, setDarkMode] = useState(window.matchMedia('(prefers-color-scheme: dark)').matches);
  
  const fileInputRef = useRef<HTMLInputElement>(null);
  const dropRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const mq = window.matchMedia('(prefers-color-scheme: dark)');
    const listener = (e: MediaQueryListEvent) => setDarkMode(e.matches);
    mq.addEventListener('change', listener);
    return () => mq.removeEventListener('change', listener);
  }, []);

  function setStatusMsg(msg: string, err = false) {
    setStatus(`${err ? '❌' : '✅'} ${msg}`);
  }

  async function fetchText(targetUrl: string) {
    const resp = await fetch(targetUrl);
    if (!resp.ok) throw new Error('HTTP ' + resp.status);
    const blob = await resp.blob();
    if (blob.size > 10 * 1024 * 1024) throw new Error('Plik za duży (>10 MB)');
    const content = await blob.text();
    return { content, contentType: resp.headers.get('content-type') || '' };
  }

  async function tryLoad(u: string) {
    setStatusMsg('pobieranie...');
    const { content, contentType } = await fetchText(u);
    setText(content);
    if (!/text|json|html|xml|charset/.test(contentType.toLowerCase())) {
      setStatusMsg(`załadowano (uwaga: content-type=${contentType})`);
    } else setStatusMsg('załadowano');
    try {
      setFilename(decodeURIComponent(new URL(u).pathname.split('/').pop() || 'plik.txt'));
    } catch {
      setFilename('plik.txt');
    }
  }

  async function loadFromUrl() {
    try {
      await tryLoad(url);
      return;
    } catch (err: any) {
      console.warn('fetch error', err);
      setStatusMsg('błąd sieci/CORS — spróbuję proxy...', true);
    }

    if (proxy) {
      try {
        await tryLoad(proxy + url);
        return;
      } catch (err: any) {
        setStatusMsg('proxy nie powiodło się: ' + (err.message || err), true);
      }
    }

    setStatusMsg('Nie udało się automatycznie załadować. Otwórz URL ręcznie i wgraj plik.', true);
    window.open(url, '_blank');
  }

  function handleDownload() {
    const blob = new Blob([text], { type: 'text/plain;charset=utf-8' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = filename || 'notatka.txt';
    a.click();
    setStatusMsg('wyeksportowano');
  }

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const f = e.target.files?.[0];
    if (!f) return;
    if (f.size > 10 * 1024 * 1024) return alert('Plik za duży (>10MB)');
    f.text().then((t) => {
      setFilename(f.name);
      setText(t);
      setStatusMsg('wczytano lokalny plik');
    });
  }
function handleSaveFile() {
    if(!fileId) return alert('Brak ID pliku do zapisu.');
    router.post('/edit/'+fileId+'/save', {
        content: text,
        filename: filename
       
    },{ onSuccess: () => {
            console.log('File saved successfully');
        },});
  }

  useEffect(() => {
    const dz = dropRef.current;
    if (!dz) return;
    const prevent = (e: DragEvent) => e.preventDefault();
    dz.addEventListener('dragenter', prevent);
    dz.addEventListener('dragover', prevent);
    dz.addEventListener('drop', (e) => {
      e.preventDefault();
      const f = e.dataTransfer?.files?.[0];
      if (!f) return;
      if (f.size > 10 * 1024 * 1024) return alert('Plik za duży (>10MB)');
      f.text().then((t) => {
        setFilename(f.name);
        setText(t);
        setStatusMsg('wczytano przeciągnięty plik');
      });
    });
  }, []);

  return (
    <AppLayout>
    <div className={` min-h-screen p-6 bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-gray-100 font-sans transition-colors duration-300`}>

        <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-md transition-colors duration-300">
          <div className="grid gap-3 sm:grid-cols-12 items-center">
            {/* <input
              type="url"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              placeholder="Wklej URL"
              className="sm:col-span-9 col-span-12 bg-gray-100 dark:bg-gray-700 placeholder-gray-400 dark:placeholder-gray-300 px-3 py-2 rounded-lg"
            /> */}
            <div className="sm:col-span-3 col-span-12 mt-2 sm:mt-0 flex gap-2">
              {/* <button onClick={loadFromUrl} className="flex-1 px-3 py-2 bg-blue-600 hover:bg-blue-500 rounded-lg font-medium text-white">Załaduj</button> */}
              {/* <button onClick={() => window.open(url, '_blank')} className="px-3 py-2 bg-gray-300 dark:bg-gray-700 rounded-lg">Otwórz</button> */}
            </div>
          </div>

          <div className="mt-3 flex gap-2 items-center">
            <input
              type="text"
              defaultValue={fileName}
              onChange={(e) => setFilename(e.target.value)}
              placeholder=""
              className="flex-1 bg-gray-100 dark:bg-gray-700 px-3 py-2 rounded-lg"
            />
            {/* <button onClick={handleDownload} className="px-4 py-2 bg-green-600 hover:bg-green-500 rounded-lg text-white">Eksportuj</button>
             */}
             <button onClick={handleDownload} className="px-4 py-2 bg-green-600 hover:bg-green-500 rounded-lg text-white">Pobierz</button>
             <button onClick={handleSaveFile} className="px-4 py-2 w-13 text-center bg-blue-600 hover:bg-blue-500 rounded-lg text-white"><SaveIcon /></button>
            <button onClick={() => { setText(''); setStatusMsg('wyczyszczono'); }} className="px-4 py-2 bg-red-600 hover:bg-red-500 rounded-lg text-white">Wyczyść</button>
          </div>

          <div className="mt-4">
            {/* <div ref={dropRef} className="p-3 rounded-lg mb-3 border-2 border-dashed border-gray-300 dark:border-gray-600 text-center text-gray-500 dark:text-gray-400">
              Przeciągnij tutaj plik .txt lub użyj przycisku "Wczytaj lokalny"
            </div> */}
            {/* <input ref={fileInputRef} type="file" accept=".txt,text/plain" onChange={handleFileChange} className="mb-4" /> */}
            <textarea
              rows={18}
              defaultValue={fileContent}
              onChange={(e) => setText(e.target.value)}
              className="w-full bg-gray-100 dark:bg-gray-700 p-4 rounded-lg font-mono text-sm resize-vertical transition-colors duration-300"
            />

          </div>

          <div className="mt-3 flex items-center justify-between text-sm text-gray-500 dark:text-gray-400">
            <div>Status: <span className="text-gray-700 dark:text-gray-300">{status}</span></div>
            <div className="flex items-center gap-4">
              <button onClick={() => navigator.clipboard.writeText(text)} className="px-3 py-1.5 bg-gray-300 dark:bg-gray-700 rounded-lg">Kopiuj</button>
              {/* <label className="text-xs">Użyj CORS-proxy:</label> */}
              {/* <select value={proxy} onChange={(e) => setProxy(e.target.value)} className="bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded-lg text-sm">
                <option value="">(bez proxy)</option>
                <option value="https://r.jina.ai/http://">r.jina.ai</option>
                <option value="https://api.allorigins.win/raw?url=">allorigins.win</option>
              </select> */}
            </div>
          </div>
        </div>

        <footer className="mt-6 text-xs text-gray-500 dark:text-gray-400">
          Użytkownik: <span className="text-gray-700 dark:text-gray-300"></span>
        </footer>
      </div>
    
    </AppLayout>
  );
}