import React, { useState, useEffect, useRef, useCallback } from "react";
import { Head, router, useRemember } from "@inertiajs/react";
import AppLayout from "@/layouts/app-layout";
import { ArrowLeft, ArrowRight, Download, Ellipsis, Share, Share2, X, Loader2, FileVideo, Info } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import axios from "axios";
import { type BreadcrumbItem } from "@/types";
import { useTranslation } from "react-i18next";
import { Skeleton } from "@/components/ui/skeleton";

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
        <img
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
          src={`/showThumbnail/${id}`}
          alt={alt}
          loading="lazy"
        />
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

export function Gallerye({ images, initialIndex, onClose, sharing = false }: { images: any[]; initialIndex: number; onClose: () => void, sharing: boolean }) {
  const { t } = useTranslation();
  const [currentIndex, setCurrentIndex] = useState(initialIndex);
  const [imageCache, setImageCache] = useState<{ [key: number]: string }>({});
  const [fileAction, setFileAction] = useState(false);
  const thumbnailRefs = useRef<(HTMLButtonElement | null)[]>([]);
  const [scale, setScale] = useState(1);
  const initialDistance = useRef<number | null>(null);
  const [info, setInfo] = useState(false);

  const scrollToActive = (index: number, behavior: "smooth" | "auto" = "smooth") => {
    const activeThumb = thumbnailRefs.current[index];
    if (activeThumb) {
      activeThumb.scrollIntoView({ behavior, block: "nearest", inline: "center" });
    }
  };

  useEffect(() => {
    const timer = setTimeout(() => scrollToActive(currentIndex, "auto"), 10);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    scrollToActive(currentIndex);
    const currentImage = images[currentIndex];
    if (!sharing) {
      if (currentImage && !imageCache[currentImage.id]) {
        fetch(`/showFile/${currentImage.id}`)
          .then((res) => res.blob())
          .then((blob) => {
            const url = URL.createObjectURL(blob);
            setImageCache((prev) => ({ ...prev, [currentImage.id]: url }));
          });
      }
    } else {
      if (currentImage && !imageCache[currentImage.id]) {
        fetch(`/share/file/${currentImage.id}`)
          .then((res) => res.blob())
          .then((blob) => {
            const url = URL.createObjectURL(blob);
            setImageCache((prev) => ({ ...prev, [currentImage.id]: url }));
          });
      }
    }
  }, [currentIndex]);

  const prevImage = () => { setFileAction(false); setCurrentIndex((p) => (p === 0 ? images.length - 1 : p - 1)); };
  const nextImage = () => { setFileAction(false); setCurrentIndex((p) => (p === images.length - 1 ? 0 : p + 1)); };

  return (
    <div className="fixed inset-0 z-50 flex flex-col bg-black/95 select-none overflow-hidden">
      <style>{`.no-scrollbar::-webkit-scrollbar { display: none; } .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }`}</style>

      <div className="flex items-center justify-between p-4 z-50">
        <div className="text-white">
          <h1 className="text-sm font-medium opacity-80 truncate max-w-[180px] md:max-w-md">
            {images[currentIndex]?.name}
          </h1>
          <p className="text-[10px] text-gray-500 uppercase tracking-tighter">
            {currentIndex + 1} / {images.length}
          </p>
        </div>

        <div className="flex items-center gap-1 relative">
          <button onClick={() => setFileAction(!fileAction)} className="p-2 text-white/70 hover:text-white transition-colors">
            <Ellipsis className="w-5 h-5" />
          </button>
          
          {fileAction && (
            <div className="absolute top-12 right-10 bg-neutral-900 border border-white/10 rounded-lg shadow-xl py-1 min-w-[140px] z-[60]">
              <a 
                href={`${window.location.origin}/d/${images[currentIndex].id}`} 
                download 
                className="flex items-center w-full gap-3 px-4 py-2 text-sm text-white hover:bg-white/5 transition-colors"
              >
                <Download className="w-4 h-4" /> {t("gallery.download")}
              </a>
              <button className="flex items-center w-full gap-3 px-4 py-2 text-sm text-white hover:bg-white/5 transition-colors">
                <Share2 className="w-4 h-4" /> {t("gallery.share")}
              </button>
            </div>
          )}
          <button onClick={() => setInfo(!info)} className="p-2 text-white/70 hover:text-white transition-colors">
            <Info className="w-5 h-5" />
          </button>

          <button onClick={onClose} className="p-2 text-white/70 hover:text-white transition-all">
            <X className="w-7 h-7" />
          </button>
        </div>
      </div>

      <div className="relative flex-1 flex items-center justify-center touch-none overflow-hidden">
        <button onClick={prevImage} className="hidden md:flex absolute left-4 z-30 p-4 text-white/20 hover:text-white transition-colors"><ArrowLeft className="w-8 h-8" /></button>
        {images[currentIndex]?.mime_type.includes('video') ? (
          <motion.video
            key={images[currentIndex].id}
            src={imageCache[images[currentIndex].id]}
            className="max-w-full max-h-[75vh] object-contain shadow-2xl"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.2 }}
            poster={`/showThumbnail/${images[currentIndex].id}`}
            controls
            autoPlay
            loop
            drag="x"
            dragConstraints={{ left: 0, right: 0 }}
            onDragEnd={(_, info) => {
              if (info.offset.x < -40) nextImage();
              if (info.offset.x > 40) prevImage();
            }}
          />
        ) : (
          <motion.img
            key={images[currentIndex].id}
            src={imageCache[images[currentIndex].id]}
            className="max-w-full max-h-[75vh] object-contain shadow-2xl"
            drag
            dragConstraints={{ left: 0, right: 0, top: 0, bottom: 0 }}
            style={{ scale }}
            onTouchStart={(e) => {
              if (e.touches.length === 2) {
                const dist = Math.hypot(
                  e.touches[0].clientX - e.touches[1].clientX,
                  e.touches[0].clientY - e.touches[1].clientY
                );
                initialDistance.current = dist;
              }
            }}
            onTouchMove={(e) => {
              if (e.touches.length === 2 && initialDistance.current !== null) {
                const dist = Math.hypot(
                  e.touches[0].clientX - e.touches[1].clientX,
                  e.touches[0].clientY - e.touches[1].clientY
                );
                const zoomFactor = dist / initialDistance.current;
                setScale((prev) => Math.min(3, Math.max(1, prev * zoomFactor)));
                initialDistance.current = dist;
              }
            }}
            onTouchEnd={(e) => {
              if (e.touches.length < 2) {
                initialDistance.current = null;
              }
            }}
            onDoubleClick={() => setScale(scale === 1 ? 2 : 1)}
            onDragEnd={(_, info) => {
              if (scale === 1) {
                if (info.offset.x < -40) nextImage();
                if (info.offset.x > 40) prevImage();
              }
            }}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.2 }}
          />
        )}
        <button onClick={nextImage} className="hidden md:flex absolute right-4 z-30 p-4 text-white/20 hover:text-white transition-colors"><ArrowRight className="w-8 h-8" /></button>
      </div>

      <div className="h-24 flex items-center mb-4">
        <div className="flex gap-2 overflow-x-auto no-scrollbar scroll-smooth w-full px-[50%]">
          {images.map((img, i) => (
            <button
              key={img.id}
              ref={(el) => (thumbnailRefs.current[i] = el)}
              onClick={() => setCurrentIndex(i)}
              className={`relative flex-shrink-0 transition-all duration-200 rounded-md overflow-hidden h-14 w-14 border-2 ${
                i === currentIndex ? "border-white scale-110 opacity-100" : "border-transparent opacity-30"
              }`}
            >
              {sharing ? (
                <img src={`/share/file/${img.id}/thumbnail`} className="w-full h-full object-cover" alt="" />
              ) : (
                <img src={`/showThumbnail/${img.id}`} className="w-full h-full object-cover" alt="" />
              )}
            </button>
          ))}
        </div>
      </div>
    </div>
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

export function GalleryComponent() {
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
      axios.get(`/getFileByType/image?page=${page}&limit=${itemsPerPage}`)
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
        <Gallerye
          images={images}
          initialIndex={selectedIndex}
          onClose={() => setShowGallery(false)}
          sharing={false}
        />
      )}
    </>
  );
}