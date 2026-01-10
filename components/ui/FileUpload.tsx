"use client";

import { forwardRef, InputHTMLAttributes, useState, useCallback } from "react";
import Image from "next/image";

interface FileUploadProps extends Omit<InputHTMLAttributes<HTMLInputElement>, "type" | "onChange"> {
  label?: string;
  error?: string;
  accept?: string;
  onChange?: (file: File | null) => void;
}

const FileUpload = forwardRef<HTMLInputElement, FileUploadProps>(
  ({ label, error, accept = "image/jpeg,image/png", onChange, className = "", ...props }, ref) => {
    const [preview, setPreview] = useState<string | null>(null);
    const [isDragging, setIsDragging] = useState(false);

    const handleFile = useCallback(
      (file: File | null) => {
        if (file) {
          const reader = new FileReader();
          reader.onloadend = () => {
            setPreview(reader.result as string);
          };
          reader.readAsDataURL(file);
        } else {
          setPreview(null);
        }
        onChange?.(file);
      },
      [onChange]
    );

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0] || null;
      handleFile(file);
    };

    const handleDragOver = (e: React.DragEvent) => {
      e.preventDefault();
      setIsDragging(true);
    };

    const handleDragLeave = (e: React.DragEvent) => {
      e.preventDefault();
      setIsDragging(false);
    };

    const handleDrop = (e: React.DragEvent) => {
      e.preventDefault();
      setIsDragging(false);
      const file = e.dataTransfer.files?.[0] || null;
      if (file && accept.includes(file.type)) {
        handleFile(file);
      }
    };

    const handleRemove = () => {
      setPreview(null);
      onChange?.(null);
    };

    return (
      <div className={`w-full space-y-1.5 ${className}`}>
        {label && (
          <label className="block text-sm font-medium text-gray-900">
            {label}
            {props.required && <span className="text-red-500 mr-1">*</span>}
          </label>
        )}
        <div
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          className={`
            relative rounded-md border-2 border-dashed p-4 text-center transition-colors cursor-pointer
            ${error
              ? "border-red-300 bg-red-50"
              : isDragging
              ? "border-[#1e3a5f] bg-[#1e3a5f]/5"
              : preview
              ? "border-green-300 bg-green-50"
              : "border-gray-200 hover:border-gray-300"
            }
          `}
        >
          {preview ? (
            <div className="flex items-center gap-3">
              <div className="relative w-16 h-16 rounded-lg overflow-hidden flex-shrink-0 border bg-white">
                <Image
                  src={preview}
                  alt="Preview"
                  fill
                  className="object-cover"
                />
              </div>
              <div className="flex-1 text-right">
                <p className="text-sm text-green-700 font-medium">تم رفع الصورة</p>
                <button
                  type="button"
                  onClick={handleRemove}
                  className="text-xs text-red-600 hover:text-red-700 mt-1"
                >
                  حذف
                </button>
              </div>
            </div>
          ) : (
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-full bg-gray-100 flex items-center justify-center flex-shrink-0">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-6 w-6 text-gray-400"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={1.5}
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                  />
                </svg>
              </div>
              <div className="text-right flex-1">
                <p className="text-sm text-gray-700">
                  اسحب الصورة أو <span className="text-[#1e3a5f] font-medium">اضغط للاختيار</span>
                </p>
                <p className="text-xs text-gray-400 mt-0.5">
                  JPG, PNG - حد أقصى 2MB
                </p>
              </div>
            </div>
          )}
          <input
            ref={ref}
            type="file"
            accept={accept}
            onChange={handleChange}
            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
            {...props}
          />
        </div>
        {error && (
          <p className="text-xs text-red-500">{error}</p>
        )}
      </div>
    );
  }
);

FileUpload.displayName = "FileUpload";

export default FileUpload;
