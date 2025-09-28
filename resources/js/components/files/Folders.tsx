import React from "react";
// import { useState, useEffect, useRef } from "react";
import { Head, router, useForm, Link } from "@inertiajs/react";
import { EllipsisVertical, X } from "lucide-react";
import { motion } from "motion/react";
import { useEffect, useRef, useState } from "react";


export function FolderCard({ folderName, href, onFolderClick }: { folderName: string; href: string; onFolderClick: () => void }) {
  const [optionVisible, setOptionVisible] = useState(false);
  const [pos, setPos] = useState({ x: 0, y: 0 });
  const modalRef = useRef<HTMLDivElement>(null);

  const handleContextClick = (e: React.MouseEvent) => {
    e.preventDefault();
    setPos({ x: e.clientX, y: e.clientY });
    setOptionVisible(true);
  };

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (modalRef.current && !modalRef.current.contains(event.target as Node)) {
        setOptionVisible(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.2, ease: "easeOut" }}
      // whileHover={{ scale: 1.02, }}
      className="
      "
    >
      <Link
        href={`/dashboard/${href}`}
        onClick={() => onFolderClick()}
        className="hover:shadow-lg transition bg-[#8090a0] dark:bg-neutral-800 relative block w-72 border rounded-lg p-4 shadow transition bg-white dark:bg-neutral-800"
      >
        <div className="flex justify-end">
          <EllipsisVertical
            className="h-5 w-5 text-neutral-800 hover:text-neutral-600 hover:bg-neutral-300 rounded cursor-pointer"
            onClick={handleContextClick}
          />
        </div>
        <svg
          className="mx-auto mb-0 h-20 w-20 text-yellow-400"
          fill="#FFD700"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M3 7a2 2 0 012-2h6l2 2h6a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2V7z"
          />
        </svg>
        <h3 className="text-sm text-[#706f6c]">10 plików</h3>
        <h3 className="text-lg font-medium text-ellipsis">{folderName}</h3>
      </Link>

      {optionVisible && (
        <motion.div
          ref={modalRef}
          initial={{ opacity: 0, scale: 0.95, y: -5 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: -5 }}
          transition={{ duration: 0.15, ease: "easeOut" }}
          className=" z-50 bg-white dark:bg-neutral-900 rounded-xl p-4 shadow-xl w-48"
          style={{ top: pos.y, left: pos.x - 200 }}
        >
          <button
            onClick={() => setOptionVisible(false)}
            className="absolute top-2 right-2 text-gray-500 hover:text-gray-700"
          >
            <X className="h-5 w-5" />
          </button>
          <h2 className="text-lg font-semibold mb-2">Opcje folderu</h2>
          <ul>
            <li className="mb-2 cursor-pointer hover:text-blue-600">Zmień nazwę</li>
            <li className="mb-2 cursor-pointer text-red-600">Usuń</li>
          </ul>
        </motion.div>
      )}
    </motion.div>
  );
}