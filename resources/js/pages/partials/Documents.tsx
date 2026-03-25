import React, {JSX, useState, useEffect, useRef, useCallback } from "react";
// import React, { JSX, useEffect, useRef, useState } from "react";
import { Head, router, useRemember } from "@inertiajs/react";
import AppLayout from "@/layouts/app-layout";
import { ArrowLeft, ArrowRight, Download, Ellipsis, Share, Share2, X, Loader2, FileVideo, Info, Play, Pause, Maximize, Minimize, FileImage, FileArchive, FileAudio, Book } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import axios from "axios";
import { type BreadcrumbItem } from "@/types";
import { useTranslation } from "react-i18next";
import { Skeleton } from "@/components/ui/skeleton";
import { FileModal, ShareModal } from "@/components/files/Files";
import { PdfModal } from "./PdfModal";
import { FileText, FileCode, FileType, File as FileIcon, FileSpreadsheet, Image as ImageIcon } from "lucide-react";

const icons: Record<FileData["mime_type"], JSX.Element> = {
    image: <FileImage className="mx-auto mb-2 h-20 w-20 text-blue-500" />,
    pdf: <FileText className="mx-auto mb-2 h-20 w-20 text-red-500" />,
    excel: <FileSpreadsheet className="mx-auto mb-2 h-20 w-20 text-green-500" />,
    ppt: <FileSpreadsheet className="mx-auto mb-2 h-20 w-20 text-orange-500" />,
    zip: <FileArchive className="mx-auto mb-2 h-20 w-20 text-yellow-500" />,
    epub: <Book className="mx-auto mb-2 h-20 w-20 text-indigo-500" />,
    mp3: <FileAudio className="mx-auto mb-2 h-20 w-20 text-purple-500" />,
    other: <FileText className="mx-auto mb-2 h-20 w-20 text-gray-500" />,
  };
  const mapMimeToType = (mime: string): FileData["mime_type"] => {
    if (mime.startsWith("image/")) return "image";
    if (mime.startsWith("audio/")) return "mp3";
    if (mime.startsWith("video/")) return "video";
    if (mime === "application/pdf") return "pdf";
    if (mime.includes("excel") || mime.includes("spreadsheet")) return "excel";
    if (mime.includes("presentation")) return "ppt";
    if (mime === "text/plain") return "text";
    if (mime === "application/epub+zip") return "epub";
    return "other";
  };

export function ImageCard({
  id,
  alt,
  type,
  onClick,
}: {
  id: number;
  alt: string;
  type: string;
  onClick: () => void;
}) {

  
  return (
    <motion.div
      whileHover={{ y: -4 }}
      whileTap={{ scale: 0.98 }}
      className="group flex flex-col items-center w-34 [@media(max-width:450px)]:w-24 cursor-pointer"
      onClick={onClick}
    >
      <div className="relative w-full aspect-square overflow-hidden rounded-2xl bg-neutral-100 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 transition-shadow group-hover:shadow-xl group-hover:shadow-blue-500/10">
       {icons[mapMimeToType(type)]}
        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/5 transition-colors" />
        
        
      </div>

      <span className="mt-2 px-1 w-full text-center">
        <p className="text-[13px] font-medium text-neutral-700 dark:text-neutral-200 line-clamp-1 truncate transition-colors group-hover:text-blue-500">
           {alt}
        </p>
      </span>
    </motion.div>
  );
}


export function ImageSkeleton() {
  return (
    <div className="flex flex-col items-center w-34 [@media(max-width:450px)]:w-24">
      <Skeleton className="w-full aspect-square rounded-2xl" />
      <div className="mt-2 px-1 w-full flex flex-col items-center gap-1">
        <Skeleton className="h-4 w-3/4" />
      </div>
    </div>
  );
}

export function DocumentsComponent() {
  const { t } = useTranslation();
  
  const breadcrumbs: BreadcrumbItem[] = [
    { title: t("breadcrumbs.dashboard"), href: "/dashboard/" },
    { title: t("gallery.title") },
  ];

  const [images, setImages] = useRemember<any[]>([], "gallery/images");
  const [page, setPage] = useRemember(1, "gallery/page");
  const [hasMore, setHasMore] = useRemember(true, "gallery/hasMore");

  const [loading, setLoading] = useState(false);
  const [showGallery, setShowGallery] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(0);

  const observer = useRef<IntersectionObserver | null>(null);
  
  const lastElementRef = useCallback((node: HTMLDivElement) => {
    if (loading) return;
    if (observer.current) observer.current.disconnect();

    observer.current = new IntersectionObserver(entries => {
      if (entries[0].isIntersecting && hasMore) {
        setPage(prevPage => prevPage + 1);
      }
    });

    if (node) observer.current.observe(node);
  }, [loading, hasMore]);

  useEffect(() => {
    const itemsPerPage = 24;
    const needsMoreData = images.length < page * itemsPerPage;

    if (needsMoreData && hasMore) {
      setLoading(true);
      axios.get(`/getFileByType/document?page=${page}&limit=${itemsPerPage}`)
        .then(response => {
          const newData = response.data.data;
          setImages(prev => {
            if (page === 1) return newData;
            const existingIds = new Set(prev.map(img => img.id));
            const uniqueNew = newData.filter((img: any) => !existingIds.has(img.id));
            return [...prev, ...uniqueNew];
          });
          setHasMore(response.data.next_page_url !== null);
        })
        .finally(() => setLoading(false));
    }
  }, [page]);

  return (
    <>
      <Head title={t("gallery.title")} />
      <div className="flex flex-wrap gap-4 p-4 justify-center md:justify-start">
        {images.map((img, index) => (
          <ImageCard
            id={img.id}
            key={`${img.id}-${index}`}
            type={img.mime_type}
            alt={img.name}
            onClick={() => {
              setSelectedIndex(index);
              setShowGallery(true);
            }}
          />
        ))}

        {loading && Array.from({ length: 8 }).map((_, i) => (
          <ImageSkeleton key={`skeleton-${i}`} />
        ))}

        {!loading && hasMore && <div ref={lastElementRef} className="w-full h-10" />}
      </div>

      {showGallery && (
        <PdfModal 
              file={images[selectedIndex]} 
              onClose={() => setShowGallery(false)} 
            />
      )}
    </>
  );
}