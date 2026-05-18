import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { toast } from 'sonner';
import { X, ChevronDown, ChevronUp, LoaderCircle, CheckCircle2, AlertCircle } from 'lucide-react';

export interface UploadTask {
  id: string;
  name: string;
  progress: number;
  loaded: number;
  total: number;
  status: 'uploading' | 'success' | 'error';
}

// globalna lista uploadow
let activeUploads: UploadTask[] = [];

// zamiana bajtow na czytelny format (MB/KB)
export const formatBytes = (bytes: number, decimals = 2) => {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const dm = decimals < 0 ? 0 : decimals;
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
};

// emitowanie eventu o zmianie stanu wysylki
const triggerUpdate = () => {
  const event = new CustomEvent('global-upload-update', { detail: [...activeUploads] });
  window.dispatchEvent(event);
};

// glowna funkcja do wysylania w tle
export const startGlobalUpload = (files: File[], folderId: string | null, onComplete?: () => void) => {
  const taskId = Math.random().toString(36).substring(7);
  const taskName = files.length === 1 ? files[0].name : `${files.length} plików`;
  const totalSize = files.reduce((sum, f) => sum + f.size, 0);

  const newTask: UploadTask = {
    id: taskId,
    name: taskName,
    progress: 0,
    loaded: 0,
    total: totalSize,
    status: 'uploading'
  };

  activeUploads = [...activeUploads, newTask];
  triggerUpdate();

  const formData = new FormData();
  files.forEach((file) => {
    formData.append("files[]", file);
  });

  if (folderId && folderId !== 'dashboard' && folderId !== 'root') {
    formData.append("folder", folderId);
  }

  axios.post("/uploadFile", formData, {
    headers: { "Content-Type": "multipart/form-data" },
    onUploadProgress: (progressEvent) => {
      const loaded = progressEvent.loaded || 0;
      const total = progressEvent.total || totalSize;
      const progress = Math.round((loaded * 100) / total);

      activeUploads = activeUploads.map(t =>
        t.id === taskId ? { ...t, progress, loaded, total } : t
      );
      triggerUpdate();
    }
  }).then(() => {
    activeUploads = activeUploads.map(t =>
      t.id === taskId ? { ...t, progress: 100, status: 'success' } : t
    );
    triggerUpdate();
    toast.success(`Plik "${taskName}" przesłany pomyślnie!`);

    // schowanie z widgetu po 4s od sukcesu
    setTimeout(() => {
      activeUploads = activeUploads.filter(t => t.id !== taskId);
      triggerUpdate();
    }, 4000);

    if (onComplete) {
      onComplete();
    }
  }).catch((err) => {
    console.error("error przy wysylaniu:", err);
    activeUploads = activeUploads.map(t =>
      t.id === taskId ? { ...t, status: 'error' } : t
    );
    triggerUpdate();
    toast.error(`Nie udało się przesłać pliku "${taskName}"`);
  });
};

export const removeUploadTask = (taskId: string) => {
  activeUploads = activeUploads.filter(t => t.id !== taskId);
  triggerUpdate();
};

export default function UploadProgressWidget() {
  const [uploads, setUploads] = useState<UploadTask[]>(activeUploads);
  const [isMinimized, setIsMinimized] = useState(false);

  useEffect(() => {
    const handleUpdate = (e: Event) => {
      const customEvent = e as CustomEvent<UploadTask[]>;
      setUploads(customEvent.detail);
    };

    window.addEventListener('global-upload-update', handleUpdate);
    return () => {
      window.removeEventListener('global-upload-update', handleUpdate);
    };
  }, []);

  if (uploads.length === 0) return null;

  const totalLoaded = uploads.reduce((sum, u) => sum + u.loaded, 0);
  const totalSize = uploads.reduce((sum, u) => sum + u.total, 0);
  const overallProgress = totalSize > 0 ? Math.round((totalLoaded * 100) / totalSize) : 0;
  const activeCount = uploads.filter(u => u.status === 'uploading').length;

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 md:bottom-4 md:right-4 md:left-auto md:w-96 bg-white dark:bg-neutral-900 border-t md:border border-neutral-200 dark:border-neutral-800 shadow-2xl rounded-t-2xl md:rounded-2xl overflow-hidden transition-all duration-300">
      <div 
        onClick={() => setIsMinimized(!isMinimized)}
        className="flex items-center justify-between px-4 py-3 bg-neutral-50 dark:bg-neutral-800/50 border-b border-neutral-200 dark:border-neutral-800 cursor-pointer select-none"
      >
        <div className="flex items-center gap-2">
          {activeCount > 0 ? (
            <LoaderCircle className="h-4 w-4 text-blue-600 animate-spin" />
          ) : (
            <CheckCircle2 className="h-4 w-4 text-green-500" />
          )}
          <span className="font-medium text-sm text-neutral-800 dark:text-neutral-200">
            {activeCount > 0 ? `Wysyłam pliki (${activeCount})...` : 'Wszystko wysłane!'}
          </span>
          <span className="text-xs bg-blue-100 dark:bg-blue-900/40 text-blue-700 dark:text-blue-300 px-2 py-0.5 rounded-full font-semibold">
            {overallProgress}%
          </span>
        </div>
        <div className="flex items-center gap-1.5" onClick={(e) => e.stopPropagation()}>
          <button 
            onClick={() => setIsMinimized(!isMinimized)}
            className="p-1 hover:bg-neutral-200 dark:hover:bg-neutral-800 rounded transition text-neutral-500 dark:text-neutral-400"
            title={isMinimized ? "Pokaż" : "Ukryj"}
          >
            {isMinimized ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
          </button>
        </div>
      </div>

      {!isMinimized && (
        <div className="max-h-60 overflow-y-auto p-4 space-y-4">
          {uploads.map((task) => (
            <div key={task.id} className="space-y-1.5">
              <div className="flex items-start justify-between gap-3 text-xs">
                <span className="font-medium text-neutral-700 dark:text-neutral-300 truncate max-w-[200px]" title={task.name}>
                  {task.name}
                </span>
                <div className="flex items-center gap-1.5 shrink-0">
                  <span className="text-neutral-500 dark:text-neutral-400">
                    {formatBytes(task.loaded)} / {formatBytes(task.total)}
                  </span>
                  
                  {task.status === 'uploading' && (
                    <span className="text-blue-600 font-semibold">{task.progress}%</span>
                  )}
                  {task.status === 'success' && (
                    <CheckCircle2 className="h-4 w-4 text-green-500" />
                  )}
                  {task.status === 'error' && (
                    <div className="flex items-center gap-1 text-red-500">
                      <AlertCircle className="h-4 w-4" />
                      <button 
                        onClick={() => removeUploadTask(task.id)}
                        className="hover:text-red-700 p-0.5 rounded"
                      >
                        <X className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  )}
                </div>
              </div>

              <div className="w-full bg-neutral-100 dark:bg-neutral-800 rounded-full h-1.5 overflow-hidden">
                <div 
                  className={`h-full rounded-full transition-all duration-300 ${
                    task.status === 'error' 
                      ? 'bg-red-500' 
                      : task.status === 'success' 
                        ? 'bg-green-500' 
                        : 'bg-blue-600'
                  }`}
                  style={{ width: `${task.progress}%` }}
                />
              </div>
            </div>
          ))}
        </div>
      )}

      {isMinimized && (
        <div className="w-full bg-neutral-100 dark:bg-neutral-800 h-1 overflow-hidden">
          <div 
            className="bg-blue-600 h-full transition-all duration-300"
            style={{ width: `${overallProgress}%` }}
          />
        </div>
      )}
    </div>
  );
}
