import React, { useState, useEffect, useRef } from "react";
import { Head,router } from "@inertiajs/react";
import AppLayout from "@/layouts/app-layout";
import { ArrowLeft, ArrowRight, Download, Ellipsis, Share, Share2, X,Loader2 } from "lucide-react";
import { motion,AnimatePresence, scale } from "framer-motion";
import axios from "axios";
import { type BreadcrumbItem } from "@/types";
import { downloadFile } from "@/routes";
import { url } from "inspector";
import { GalleryComponent } from "./partials/Gallery";

import { DocumentsComponent } from "./partials/Documents";
const breadcrumbs: BreadcrumbItem[] = [
  { title: "panel", href: "/dashboard/" },
  { title: "Moja galeria" },
];


export default function Type() {
  const [urlr, setUrlr] = useState<string>(window.location.pathname.split('/').pop() || '');
 
  console.log("URLR:", urlr);
  useEffect(() => {
    const currentPath = window.location.pathname;
    const lastSegment = currentPath.split('/').pop() || '';
    setUrlr(lastSegment);
  }, [urlr]);
  const render = () => {
    if (urlr === 'images') {
      return <GalleryComponent />;
    } else if (urlr === 'documents') {
      return <DocumentsComponent />;
    } else if (urlr === 'audio') {
      return <div>Audio content</div>;
    } else {
      return <div>Other content</div>;
    }
  };
  return (
    <AppLayout breadcrumbs={breadcrumbs}>
      <Head title="Pliki według typu" />
      {render()}
      
    </AppLayout>
  );
}