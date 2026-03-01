import React, { useState, useEffect, useRef } from "react";
import { Head,router } from "@inertiajs/react";
import AppLayout from "@/layouts/app-layout";
import { ArrowLeft, ArrowRight, Download, Ellipsis, Share, Share2, X,Loader2, FileVideo, Info } from "lucide-react";
import { motion,AnimatePresence, scale } from "framer-motion";
import axios from "axios";
import { type BreadcrumbItem } from "@/types";
import { downloadFile } from "@/routes";
import { info } from "console";
import { FileModal } from "@/components/files/Files";

const breadcrumbs: BreadcrumbItem[] = [
  { title: "panel", href: "/dashboard/" },
  { title: "Moja galeria" },
];
type Image = {
  src: string;
  alt: string;
};

const images: Image[] = [
  {
    src: "https://cdn.motor1.com/images/mgl/AkQlKx/s1/koenigsegg-chimera.jpg",
    alt: "Koenigsegg Chimera",
  },
  {
    src: "https://images.squarespace-cdn.com/content/v1/5f7ca9b4bb17060b028086bb/1663702472875-MD7AS638YGSZL94L16PK/DSC02968-min.jpg",
    alt: "DSC02968",
  },
  {
    src: "https://st.automobilemag.com/uploads/sites/11/2017/11/Koenigsegg-04.jpg",
    alt: "Koenigsegg 04",
  },
];
const transition = {
  duration: 0.8,
  delay: 0.5,
  ease: [0, 0.71, 0.2, 1.01],
}

export function ImageCard({
  id,
  alt,
  type,
  onClick,
}: {
  id: number;
  alt: string;
  onClick: () => void;
}) {
  return (
    <motion.div
      whileHover={{ y: -4 }}
      whileTap={{ scale: 0.98 }}
      className="group flex flex-col items-center w-34 [@media(max-width:450px)]:w-24 cursor-pointer"
      onClick={onClick}
    >
      {/* Kontener na zdjęcie z efektem hover */}
      <div className="relative w-full aspect-square overflow-hidden rounded-2xl bg-neutral-100 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 transition-shadow group-hover:shadow-xl group-hover:shadow-blue-500/10">
        {type.includes('video')?(
           <img
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
          src={`/showThumbnail/${id}`}
          alt={alt}
          loading="lazy"
        />
        )
          :(
        <img
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
          src={`/showThumbnail/${id}`}
          alt={alt}
          loading="lazy"
        />
        )}
        
        {/* Subtelny overlay przy najechaniu */}
        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/5 transition-colors" />
      </div>

      {/* Tekst - bardziej czytelny i dopasowany do dark mode */}
      <span className="mt-2 px-1 w-full text-center">
        <p className="text-[13px] font-medium text-neutral-700 dark:text-neutral-200 line-clamp-1 truncate transition-colors group-hover:text-blue-500">
          {alt}
        </p>
        {/* <p className="text-[10px] text-neutral-400 dark:text-neutral-500 uppercase tracking-tighter">
          Obraz
        </p> */}
      </span>
    </motion.div>
  );
}



export function Gallerye({ images, initialIndex, onClose,sharing = false }: { images: any[]; initialIndex: number; onClose: () => void, sharing:boolean }) {
  const [currentIndex, setCurrentIndex] = useState(initialIndex);
  const [imageCache, setImageCache] = useState<{ [key: number]: string }>({});
  const [fileAction, setFileAction] = useState(false);
  const thumbnailRefs = useRef<(HTMLButtonElement | null)[]>([]);
  const [scale, setScale] = useState(1);
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
    
    // Prosty fetch bez zbędnej logiki
    const currentImage = images[currentIndex];
    if(!sharing){
    if (currentImage && !imageCache[currentImage.id]) {
      fetch(`/showFile/${currentImage.id}`)
        .then((res) => res.blob())
        .then((blob) => {
          const url = URL.createObjectURL(blob);
          setImageCache((prev) => ({ ...prev, [currentImage.id]: url }));
        });
    }}
    else{
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
      {/* CSS do ukrycia scrollbara */}
      <style>{`.no-scrollbar::-webkit-scrollbar { display: none; } .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }`}</style>

      {/* HEADER */}
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
              <button onClick={() => window.location.href = `/d/${images[currentIndex].id}`} className="flex items-center w-full gap-3 px-4 py-2 text-sm text-white hover:bg-white/5 transition-colors">
                <Download className="w-4 h-4" /> Pobierz
              </button>
              <button className="flex items-center w-full gap-3 px-4 py-2 text-sm text-white hover:bg-white/5 transition-colors">
                <Share2 className="w-4 h-4" /> Udostępnij
              </button>
            </div>
          )}
          <button onClick={() => setInfo(!info)} className="p-2 text-white/70 hover:text-white transition-colors">
             <Info className="w-5 h-5" />
             
          </button>
            {/* {info && (
              console.log(images[currentIndex].name),
              <FileModal fileId={images[currentIndex].} onClose={() => setInfo(false)} />
            )} */}

          <button onClick={onClose} className="p-2 text-white/70 hover:text-white transition-all">
            <X className="w-7 h-7" />
          </button>
        </div>
      </div>

      {/* MAIN VIEW - usunięty AnimatePresence i ciężkie springi */}
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
            
          />
        ) : (
          <>
        <motion.img
          key={images[currentIndex].id}
          src={imageCache[images[currentIndex].id]}
          className="max-w-full max-h-[75vh] object-contain shadow-2xl"
          drag
          dragConstraints={{ left: 0, right: 0, top: 0, bottom: 0 }}
          style={{ scale }}
          onPinch={(_, info) => {
            setScale((prev) =>
              Math.min(3, Math.max(1, prev * info.scale))
            );
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
        </>
        )}

        <button onClick={nextImage} className="hidden md:flex absolute right-4 z-30 p-4 text-white/20 hover:text-white transition-colors"><ArrowRight className="w-8 h-8" /></button>
      </div>

      {/* MINIATURY - czyste i wycentrowane */}
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
              {sharing?(
              <img src={`/share/file/${img.id}/thumbnail`} className="w-full h-full object-cover" alt="" />
              ):(
                <img src={`/showThumbnail/${img.id}`} className="w-full h-full object-cover" alt="" />
              )}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

export  function GalleryComponent() {
  const [showGallery, setShowGallery] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [images, setImages] = useState([]);
  const openGallery = (index: number) => {
    setSelectedIndex(index);
    setShowGallery(true);
  };

  const closeGallery = () => setShowGallery(false);
  useEffect(() => {
    axios.get('/getFileByType/image/').then(response => {
      console.log(response.data);
        setImages(response.data);

    });
  },[]);
  return (
<>
      <div className="flex flex-wrap gap-4 p-4">
        {images.map((img, index) => (
          <ImageCard
            id={img.id}
            key={index}
            src={img.id}
            type={img.mime_type}
            alt={img.name}
            onClick={() => openGallery(index)}
          />
        ))}
      </div>
      {showGallery && (
        <Gallerye
          images={images}
          initialIndex={selectedIndex}
          onClose={closeGallery}
        />
      )}
   </>
  );
}