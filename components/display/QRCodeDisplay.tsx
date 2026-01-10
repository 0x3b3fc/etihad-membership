"use client";

import { useRef } from "react";
import Image from "next/image";
import Button from "@/components/ui/Button";

interface QRCodeDisplayProps {
  qrCode: string;
  memberName: string;
  onClose: () => void;
}

export default function QRCodeDisplay({ qrCode, memberName, onClose }: QRCodeDisplayProps) {
  const qrRef = useRef<HTMLDivElement>(null);

  const handleDownload = () => {
    const link = document.createElement("a");
    link.href = qrCode;
    link.download = `qr-${memberName.replace(/\s+/g, "-")}.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      <div className="bg-white rounded-xl p-6 max-w-sm w-full mx-4 shadow-xl">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900">رمز QR</h3>
          <button
            onClick={onClose}
            className="p-1 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-6 w-6 text-gray-500"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        </div>

        <div ref={qrRef} className="flex flex-col items-center">
          <p className="text-sm text-[var(--muted)] mb-4">{memberName}</p>
          <div className="p-4 bg-white rounded-lg border border-[var(--border)]">
            <Image
              src={qrCode}
              alt={`QR Code for ${memberName}`}
              width={200}
              height={200}
              className="mx-auto"
            />
          </div>
        </div>

        <div className="mt-6 flex gap-3">
          <Button onClick={handleDownload} className="flex-1">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-5 w-5 ml-2"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"
              />
            </svg>
            تحميل
          </Button>
          <Button variant="outline" onClick={onClose} className="flex-1">
            إغلاق
          </Button>
        </div>
      </div>
    </div>
  );
}
