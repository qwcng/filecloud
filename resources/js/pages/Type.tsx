import React, { useState, useEffect } from "react";
import { Head } from "@inertiajs/react";
import AppLayout from "@/layouts/app-layout";
import { ArrowLeft, ArrowRight } from "lucide-react";
import { motion } from "framer-motion";
import axios from "axios";
import { type BreadcrumbItem } from "@/types";
import { LazyLoadImage } from "react-lazy-load-image-component";
import "react-lazy-load-image-component/src/effects/blur.css";

const breadcrumbs: BreadcrumbItem[] = [
  { title: "panel", href: "/dashboard/" },
  { title: "Moja galeria" },
];

export function ImageCard({
  id,
  alt,
  onClick,
}: {
  id: number;
  alt: string;
  onClick: () => void;
}) {
  return (
    <motion.div
      initial={{ scale: 0.95 }}
      animate={{ scale: 1 }}
      className="flex flex-col items-center w-32 h-fit cursor-pointer"
      onClick={onClick}
    >
      <LazyLoadImage
        className="w-18 h-18 object-cover rounded-xs transition-all duration-500 ease-out"
        src={`/showThumbnail/${id}`}
        alt={alt}
        placeholderSrc="/images/placeholder.png" // ✅ użyj neutralnego placeholdera
        effect="blur"
        // afterLoad={() => console.log("Loaded thumbnail", id)}
      />
      <span className="mt-1 font-bold text-sm text-neutral-800 dark:text-white w-full line-clamp-2 text-center break-words">
        {alt}
      </span>
    </motion.div>
  );
}

export function Gallery({
  images,
  initialIndex,
  onClose,
}: {
  images: any[];
  initialIndex: number;
  onClose: () => void;
}) {
  const [currentIndex, setCurrentIndex] = useState(initialIndex);

  useEffect(() => setCurrentIndex(initialIndex), [initialIndex]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
      if (e.key === "ArrowLeft")
        setCurrentIndex((p) => (p === 0 ? images.length - 1 : p - 1));
      if (e.key === "ArrowRight")
        setCurrentIndex((p) => (p === images.length - 1 ? 0 : p + 1));
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [images.length, onClose]);

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex flex-col items-center justify-center z-50">
      <ArrowLeft
        className="absolute left-4 text-white w-12 h-12 cursor-pointer"
        onClick={() =>
          setCurrentIndex((p) => (p === 0 ? images.length - 1 : p - 1))
        }
      />
      <ArrowRight
        className="absolute right-4 text-white w-12 h-12 cursor-pointer"
        onClick={() =>
          setCurrentIndex((p) => (p === images.length - 1 ? 0 : p + 1))
        }
      />

     <LazyLoadImage
  wrapperClassName="w-full flex justify-center items-center"
  className="max-h-[70%] max-w-[80%] rounded-2xl object-contain transition-all duration-700 ease-out mx-auto"
  src={`/showFile/${images[currentIndex].id}`}
  alt={images[currentIndex].original_name}
  // placeholderSrc="/images/placeholder.png"
  effect="blur"
/>

      <button
        className="absolute top-4 right-4 text-white px-4 py-2 border border-white rounded"
        onClick={onClose}
      >
        Zamknij
      </button>

      <div className="absolute bottom-4 flex gap-2 w-[90%] overflow-x-auto p-2 justify-start scroll-smooth">
        {images.map((img, i) => (
          <img
            key={i}
            onClick={() => setCurrentIndex(i)}
            loading="lazy"
            className={`min-w-16 min-h-16 max-w-16 max-h-16 object-cover rounded-2xl cursor-pointer border-2 transition-all ${
              i === currentIndex ? "border-white" : "border-transparent"
            }`}
            src={`/showThumbnail/${img.id}`}
            alt={img.original_name}
          />
        ))}
      </div>
    </div>
  );
}

export default function Type() {
  const [showGallery, setShowGallery] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [images, setImages] = useState<any[]>([]);

  useEffect(() => {
    axios.get("/getFileByType/image/").then((res) => {
      console.log(res.data);
      setImages(res.data);
    });
  }, []);

  return (
    <AppLayout breadcrumbs={breadcrumbs}>
      <Head title="Pliki według typu" />
      <div className="flex flex-wrap gap-4 p-4">
        {images.map((img, index) => (
          <ImageCard
            key={img.id}
            id={img.id}
            alt={img.original_name}
            onClick={() => {
              setSelectedIndex(index);
              setShowGallery(true);
            }}
          />
        ))}
      </div>
      {showGallery && (
        <Gallery
          images={images}
          initialIndex={selectedIndex}
          onClose={() => setShowGallery(false)}
        />
      )}
    </AppLayout>
  );
}
