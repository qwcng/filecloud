import React from "react";
import AppLayout from "@/layouts/app-layout";
import { type BreadcrumbItem } from "@/types";
import { dashboard } from "@/routes";
import { Head } from "@inertiajs/react";
import PdfViewer from "@/components/files/PdfViewer";

const breadcrumbs: BreadcrumbItem[] = [
  { title: "panel", href: dashboard().url },
  { title: "Pliki", href: dashboard().url },
];

type PdfFileProps = {
  id: number;
  name: string;
};

export default function PdfFile({ id, name }: PdfFileProps) {
  return (
    <AppLayout breadcrumbs={breadcrumbs}>
      <Head title={`PDF - ${name}`} />
      <div className="flex bg-white dark:bg-neutral-900 border dark:border-neutral-800 shadow-sm h-full flex-1 flex-col rounded-xl overflow-hidden">
        <div className="p-4 border-b dark:border-neutral-800 bg-gray-50 dark:bg-neutral-800/50 flex justify-between items-center">
            <h3 className="text-lg font-semibold flex items-center gap-2">
                <span className="text-red-500">📄</span> {name}
            </h3>
            <div className="text-sm text-gray-500 italic">
                Secure PDF View
            </div>
        </div>

        <div className="flex-1">
            {/* Wykorzystujemy nasz nowy PdfViewer który zajmie całą dostępną przestrzeń */}
            <PdfViewer fileUrl={`/showFile/${id}`} />
        </div>
      </div>
    </AppLayout>
  );
}
