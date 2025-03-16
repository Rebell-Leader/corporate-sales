"use client";

import { useState, useRef, useCallback } from "react";
import { button as buttonStyles } from "@heroui/theme";

import { cn } from "../lib/utils";

interface DropzoneProps {
  onFileAccepted: (file: File) => void;
  className?: string;
}

export function Dropzone({ onFileAccepted, className }: DropzoneProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [fileName, setFileName] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleDragOver = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  }, []);

  const handleDrop = useCallback(
    (e: React.DragEvent<HTMLDivElement>) => {
      e.preventDefault();
      e.stopPropagation();
      setIsDragging(false);

      const files = e.dataTransfer.files;
      if (files && files.length > 0) {
        const file = files[0];
        if (file.type === "application/pdf") {
          setFileName(file.name);
          onFileAccepted(file);
        } else {
          alert("Please upload a PDF file");
        }
      }
    },
    [onFileAccepted]
  );

  const handleFileChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const files = e.target.files;
      if (files && files.length > 0) {
        const file = files[0];
        if (file.type === "application/pdf") {
          setFileName(file.name);
          onFileAccepted(file);
        } else {
          alert("Please upload a PDF file");
        }
      }
    },
    [onFileAccepted]
  );

  const handleClick = () => {
    fileInputRef.current?.click();
  };

  return (
    <div
      className={cn(
        "w-full max-w-xl p-6 border-2 border-dashed rounded-lg cursor-pointer transition-colors",
        isDragging
          ? "border-primary bg-primary/10"
          : "border-gray-300 dark:border-gray-700",
        fileName ? "bg-success/10 border-success" : "",
        className
      )}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      onClick={handleClick}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          handleClick();
        }
      }}
      role="button"
      tabIndex={0}
      aria-label="Upload PDF file"
    >
      <input
        ref={fileInputRef}
        type="file"
        accept="application/pdf"
        className="hidden"
        onChange={handleFileChange}
      />
      <div className="flex flex-col items-center justify-center gap-2 text-center">
        <div className="text-3xl mb-2">{fileName ? "✅" : "📄"}</div>
        {fileName ? (
          <>
            <p className="text-sm font-medium">{fileName}</p>
            <p className="text-xs text-gray-500 dark:text-gray-400">
              File uploaded successfully
            </p>
          </>
        ) : (
          <>
            <p className="text-sm font-medium">
              Drag and drop your tender notice PDF here
            </p>
            <p className="text-xs text-gray-500 dark:text-gray-400">
              or click to browse files
            </p>
            <button
              className={buttonStyles({
                color: "primary",
                variant: "flat",
                size: "sm",
                className: "mt-2",
              })}
              type="button"
            >
              Select PDF
            </button>
          </>
        )}
      </div>
    </div>
  );
}
