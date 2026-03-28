'use client'

import { useState, useRef, useEffect } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { useRouter } from 'next/navigation'

interface UserHeaderProps {
  user: {
    name?: string | null
    email?: string | null
  }
  siteName?: string
}

export function UserHeader({ user, siteName = 'عضويتي' }: UserHeaderProps) {
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const router = useRouter()

  const handleLogout = async () => {
    await fetch('/api/member/logout', { method: 'POST' })
    router.push('/applicant/login')
    router.refresh()
  }

  return (
    <header className="sticky top-0 z-50 flex h-14 sm:h-16 items-center justify-between border-b border-gray-200 bg-white px-3 sm:px-4 lg:px-6">
      <Link href="/applicant/dashboard" className="flex items-center gap-2 sm:gap-3">
        <Image
          src="/logo.png"
          alt="Logo"
          width={40}
          height={40}
          className="rounded-lg sm:w-[50px] sm:h-[50px]"
        />
        <span className="font-bold text-sm sm:text-lg truncate max-w-[120px] sm:max-w-[200px] text-[#1e3a5f]">
          {siteName}
        </span>
      </Link>

      <div className="relative" ref={ref}>
        <button
          onClick={() => setOpen(!open)}
          className="flex items-center gap-2 p-1.5 rounded-lg hover:bg-gray-100 transition-colors"
        >
          <div className="h-9 w-9 sm:h-10 sm:w-10 rounded-full bg-[#1e3a5f]/10 flex items-center justify-center">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 sm:h-5 sm:w-5 text-[#1e3a5f]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z" />
            </svg>
          </div>
        </button>

        {open && (
          <div className="absolute left-0 top-full mt-2 w-56 bg-white rounded-lg border border-gray-200 shadow-lg z-50 py-1">
            <div className="px-4 py-3 border-b border-gray-100">
              <p className="text-sm font-medium text-gray-900">{user.name || 'مستخدم'}</p>
              <p className="text-xs text-gray-500 truncate">{user.email}</p>
            </div>
            <Link
              href="/applicant/profile"
              onClick={() => setOpen(false)}
              className="flex items-center gap-2 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z" />
              </svg>
              تعديل البيانات
            </Link>
            <button
              onClick={handleLogout}
              className="w-full flex items-center gap-2 px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 transition-colors"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 9V5.25A2.25 2.25 0 0013.5 3h-6a2.25 2.25 0 00-2.25 2.25v13.5A2.25 2.25 0 007.5 21h6a2.25 2.25 0 002.25-2.25V15m3 0l3-3m0 0l-3-3m3 3H9" />
              </svg>
              تسجيل الخروج
            </button>
          </div>
        )}
      </div>
    </header>
  )
}
