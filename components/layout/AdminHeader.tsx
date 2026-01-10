"use client";

import { signOut, useSession } from "next-auth/react";

export default function AdminHeader() {
  const { data: session } = useSession();

  const handleLogout = () => {
    signOut({ callbackUrl: "/admin/login" });
  };

  return (
    <header className="bg-white border-b border-gray-200 px-4 py-3 flex items-center justify-between">
      {/* Page Info - Hidden on mobile (shown in sidebar) */}
      <div className="hidden lg:block">
        <p className="text-sm text-gray-500">مرحباً بك في لوحة التحكم</p>
      </div>

      {/* Spacer for mobile */}
      <div className="lg:hidden" />

      {/* User Info & Logout */}
      <div className="flex items-center gap-3">
        {/* User Info */}
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-[#1e3a5f] rounded-full flex items-center justify-center">
            <span className="text-white text-sm font-medium">
              {session?.user?.name?.charAt(0) || "م"}
            </span>
          </div>
          <div className="hidden sm:block">
            <p className="text-sm font-medium text-gray-900">{session?.user?.name || "مدير النظام"}</p>
            <p className="text-xs text-gray-500"><span dir="ltr" className="inline-block">{session?.user?.email}</span></p>
          </div>
        </div>

        {/* Logout Button */}
        <button
          onClick={handleLogout}
          className="flex items-center gap-2 px-3 py-2 text-sm font-medium text-red-600 hover:bg-red-50 rounded-lg transition-colors"
        >
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
              d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
            />
          </svg>
          <span className="hidden sm:inline">خروج</span>
        </button>
      </div>
    </header>
  );
}
