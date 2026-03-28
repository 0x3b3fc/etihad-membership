"use client";

import { GovernorateDialog } from "@/components/forms/GovernorateDialog";

export function AddGovernorateButton() {
  return (
    <GovernorateDialog>
      <button className="self-start sm:self-auto px-4 py-2.5 bg-[#1e3a5f] text-white rounded-lg text-sm font-medium hover:bg-[#1e3a5f]/90 transition-colors flex items-center gap-2">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className="h-4 w-4"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={2}
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M12 4v16m8-8H4"
          />
        </svg>
        إضافة محافظة
      </button>
    </GovernorateDialog>
  );
}
