import React from 'react';
import { Viewer, Worker } from '@react-pdf-viewer/core';
import { defaultLayoutPlugin } from '@react-pdf-viewer/default-layout';

// Importy styli
import '@react-pdf-viewer/core/lib/styles/index.css';
import '@react-pdf-viewer/default-layout/lib/styles/index.css';

interface PdfViewerProps {
    fileUrl: string;
}

const PdfViewer: React.FC<PdfViewerProps> = ({ fileUrl }) => {
    // Inicjalizacja pluginu z domyślnym layoutem (toolbar, sidebar itp.)
    const defaultLayoutPluginInstance = defaultLayoutPlugin();

    return (
        <div className="w-full h-[600px] md:h-[800px] border border-gray-200 dark:border-neutral-800 rounded-lg overflow-hidden bg-white dark:bg-neutral-900">
            <Worker workerUrl="https://unpkg.com/pdfjs-dist@3.11.174/build/pdf.worker.min.js">
                <Viewer
                    fileUrl={fileUrl}
                    plugins={[defaultLayoutPluginInstance]}
                    theme={{
                        theme: 'auto', // Dopasuje się do dark mode jeśli rodzic ma odpowiednią klasę
                    }}
                />
            </Worker>
        </div>
    );
};

export default PdfViewer;
