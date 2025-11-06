import React, { useState, useEffect, use } from "react";
import { Head,router } from "@inertiajs/react";
import AppLayout from "@/layouts/app-layout";
import { ArrowLeft, ArrowRight } from "lucide-react";
import { motion } from "framer-motion";
import axios from "axios";
import { type BreadcrumbItem } from "@/types";

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
  src,
  id,
  alt,
  onClick,
}: {
  src: string;
  id: number;
  alt: string;
  onClick: () => void;
}) {
  console.log("123");
  return (
    <motion.div
    initial={{ scale: 0.95 }}
    animate={{ scale: 1 }}
    
    // transition={transition}
      className="flex flex-col items-center w-32  [@media(max-width:450px)]:w-24 h-fit cursor-pointer"
      onClick={onClick}
    >
        <img className="w-16 h-16 [@media(max-width:450px)]:w-16  [@media(max-width:450px)]:h-16 object-cover 2xs:rounded-lg" src={'/showThumbnail/'+id} alt={alt}  loading="lazy"/>
      <span className="mt-1 font-bold text-sm text-neutral-800  dark:text-white w-full line-clamp-2 text-center break-words">
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
  images: Image[];
  initialIndex: number;
  onClose: () => void;
}) {
  const [currentIndex, setCurrentIndex] = useState(initialIndex);

  useEffect(() => {
    setCurrentIndex(initialIndex);
  }, [initialIndex]);

  // Obsługa Escape i strzałek
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        onClose();
      } else if (e.key === "ArrowLeft") {
        setCurrentIndex((prev) => (prev === 0 ? images.length - 1 : prev - 1));
      } else if (e.key === "ArrowRight") {
        setCurrentIndex((prev) => (prev === images.length - 1 ? 0 : prev + 1));
      }
    };

    window.addEventListener("keydown", handleKeyDown);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [images.length, onClose]);

  const prevImage = () => {
    setCurrentIndex((prev) => (prev === 0 ? images.length - 1 : prev - 1));
  };

  const nextImage = () => {
    setCurrentIndex((prev) => (prev === images.length - 1 ? 0 : prev + 1));
  };

  return (
    <div className="fixed inset-0  backdrop-blur-xs  backdrop-saturate-200 flex flex-col items-center justify-center z-50 ">
      <ArrowLeft
        className="absolute left-4 text-neutral-800 dark:text-white w-12 h-12 cursor-pointer"
        onClick={prevImage}
      />
      <ArrowRight
        className="absolute right-4 text-neutral-800 dark:text-white w-12 h-12 cursor-pointer"
        onClick={nextImage}
      />
      <img
        className="w-[80%] max-h-[70%] rounded-2xl object-contain "
        src={'/showFile/'+images[currentIndex].id}
        loading="lazy"
        alt={images[currentIndex].original_name}
      />
      <button
        className="absolute top-4 right-4 text-white px-4 py-2 border border-white rounded"
        onClick={onClose}
      >
        Zamknij
      </button>
      <div className="absolute bottom-4 flex gap-2 w-[90%] overflow-x-auto p-2 justify-start scroll-smooth">
        {images.map((img, i) => (
          <div key={i} onClick={() => setCurrentIndex(i)}>
            <img
            loading="lazy"
              className={`min-w-16 min-h-16 max-w-16 max-h-16 object-cover rounded-2xl cursor-pointer border-2 ${
                i === currentIndex ? "border-white" : "border-transparent"
              }`}
              src={'/showThumbnail/'+img.id}
              alt={img.original_name}
            />
          </div>
        ))}
      </div>
    </div>
  );
}

export default function Type() {
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
    <AppLayout breadcrumbs={breadcrumbs}>
      <Head title="Pliki według typu" />
      <div className="flex flex-wrap gap-4 p-4">
        {images.map((img, index) => (
          <ImageCard
            id={img.id}
            key={index}
            src={img.id}
            alt={img.original_name}
            onClick={() => openGallery(index)}
          />
        ))}
      </div>
      {showGallery && (
        <Gallery
          images={images}
          initialIndex={selectedIndex}
          onClose={closeGallery}
        />
      )}
    </AppLayout>
  );
}