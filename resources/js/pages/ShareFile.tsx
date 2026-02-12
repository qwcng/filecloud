import { useState, useRef } from "react";
import { usePage } from "@inertiajs/react";
import axios from "axios";
import MusicPlayer from "@/components/MusicPlayer";

export default function ShareFile() {
  const { fileId, fileName } = usePage().props as { fileId: number; fileName: string };
  const [code, setCode] = useState(new Array(6).fill(""));
  const [error, setError] = useState("");
  const [fileData, setFileData] = useState<null | {
    id: number;
    name: string;
    url: string;
    type: string;
    size: string;
  }>(null);

  const inputRefs = useRef<Array<HTMLInputElement | null>>([]);

  const handleChange = (value: string, index: number) => {
    if (!/^\d?$/.test(value)) return; // tylko cyfry
    const newCode = [...code];
    newCode[index] = value;
    setCode(newCode);

    // Automatyczne przejście do następnego inputu
    if (value && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleBackspace = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Backspace" && !code[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handleCheckCode = async () => {
    const codeStr = code.join("");
    if (codeStr.length < 6) return alert("Wprowadź pełny kod");
    try {
      const response = await axios.post(`/share/${fileId}/check`, { code: codeStr });
      setFileData(response.data.file);
      setError("");
    } catch (err: any) {
      setError(err.response?.data?.message || "Błąd podczas weryfikacji kodu");
    }
  };

  function downloadFile() {
    const codeStr = code.join("");
    if (!codeStr) return alert("Wprowadź kod dostępu");
    window.open(`/share/${fileId}/download?code=${codeStr}`, "_blank");
  }
  function showFile() {
  const codeStr = code.join("");
  if (!codeStr) return alert("Wprowadź kod dostępu");
  window.open(`/share/${fileId}/show?code=${codeStr}`, "_blank");
}

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100 dark:bg-neutral-900 p-4">
      {!fileData ? (
        <div className="bg-white dark:bg-neutral-800 p-6 rounded-lg shadow-md w-full max-w-md">
          <h2 className="text-xl font-semibold mb-4">Wprowadź kod dostępu</h2>
          <p className="mb-2">Plik: <strong>{fileName}</strong></p>

          <div className="flex justify-center gap-1 mb-4">
            {code.map((c, i) => (
              <input
                key={i}
                ref={(el) => (inputRefs.current[i] = el)}
                type="text"
                inputMode="numeric"
                maxLength={1}
                value={c}
                onChange={(e) => handleChange(e.target.value, i)}
                onKeyDown={(e) => handleBackspace(i, e)}
                className="w-12 h-12 text-center text-xl border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-neutral-700 dark:text-white"
              />
            ))}
          </div>

          <button
            onClick={handleCheckCode}
            className="w-full bg-blue-600 text-white rounded px-4 py-2 hover:bg-blue-700"
          >
            Sprawdź kod
          </button>
          {error && <p className="text-red-500 mt-2">{error}</p>}
        </div>
      ) : (
        <div className="bg-white dark:bg-neutral-800 p-6 rounded-lg shadow-md w-full max-w-md overflow-auto">
          <h2 className="text-xl font-semibold mb-4">{fileData.name}</h2>

          {fileData.type === "image" && (
            <img src={fileData.url} alt={fileData.name} className="max-h-64 mx-auto rounded-sm mb-4" />
          )}

          {fileData.type === "mp3" && (
            <div className="mb-4">
              <MusicPlayer src={fileData.url} title={fileData.name} artist="Unknown Artist" />
            </div>
          )}

          {fileData.type === "video" && (
            <video controls className="w-full max-h-64 rounded-sm mb-4">
              <source src={fileData.url} type="video/mp4" />
              Your browser does not support the video tag.
            </video>
          )}

          {/* {fileData.type === "other" && (
            <button
              className="rounded bg-indigo-600 px-4 py-2 text-white hover:bg-indigo-700"
              onClick={() => window.open(fileData.url, "_blank")}
            >
              Otwórz plik
            </button>
          )} */}

          <p className="mt-2"><strong>Typ:</strong> {fileData.type}</p>
          <p><strong>Rozmiar:</strong> {fileData.size} MB</p>
          <button
            onClick={downloadFile}
            className="mt-4 inline-block bg-green-600 px-4 py-2 text-white rounded hover:bg-green-700"
          >
            Pobierz plik
          </button>
          <button
        onClick={showFile}
        className="mt-4 ml-2 inline-block bg-blue-600 px-4 py-2 text-white rounded hover:bg-blue-700"
      >
        Wyświetl plik
      </button>
        </div>
      )}
    </div>
  );
}
