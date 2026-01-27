export interface FileData {
    id: number;
    name: string;
    type: "image" | "pdf" | "excel" | "ppt" | "zip" | "mp3" | "video" | "epub" | "other";
    size: string;
    created_at: string;
    deleted_at: string;
    url: string;
  };