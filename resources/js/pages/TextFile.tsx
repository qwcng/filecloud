import React, { useState, useEffect } from "react";
import AppLayout from "@/layouts/app-layout";
import { type BreadcrumbItem } from "@/types";
import { dashboard } from "@/routes";
import { Head } from "@inertiajs/react";
import axios from "axios";

const breadcrumbs: BreadcrumbItem[] = [
  { title: "panel", href: dashboard().url },
  { title: "Pliki", href: dashboard().url },
];

type TextFileViewerProps = {
  fileUrl: string; // URL pliku tekstowego (np. /files/text/123)
};

export default function TextFile({ fileUrl, fileContent }: TextFileViewerProps) {
  const [content, setContent] = useState<string>(fileContent || "");
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

//   // Podmień na właściwy URL pliku

//     useEffect(() => {
//   setLoading(true);
//   setError(null);

//   axios
//     .get(fileUrl)
//     .then((res) => {
//       // tutaj zależy od struktury odpowiedzi
//       // jeśli zwraca tylko string:
//     //   setContent(res.data);
//       // jeśli zwraca obiekt { data: "..." }:
//       setContent(res.data.data);
//     })
//     .catch((err) => {
//       console.error(err);
//       setError("Nie udało się wczytać pliku.");
//     })
//     .finally(() => setLoading(false));
// }, [fileUrl]);

  return (
    <AppLayout breadcrumbs={breadcrumbs}>
      <Head title="Plik tekstowy" />
      <div className="flex h-full flex-1 flex-col rounded-xl p-4">
        <h3 className="text-lg font-semibold mb-4">📄 Podgląd pliku tekstowego</h3>

        <div className="flex-1 overflow-auto border rounded-lg p-4 bg-gray-50 dark:bg-neutral-800">
          {loading && <p className="text-gray-500">Ładowanie pliku...</p>}
          {error && <p className="text-red-500">{error}</p>}
          {!loading && !error && (
            <pre className="whitespace-pre-wrap text-sm font-mono">{content}</pre>
          )}
        </div>
      </div>
    </AppLayout>
  );
}
