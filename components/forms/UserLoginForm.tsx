'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'

export function UserLoginForm() {
  const [nationalId, setNationalId] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setIsLoading(true)

    try {
      const response = await fetch('/api/member/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ nationalId, password }),
      })

      const data = await response.json()

      if (!data.success) {
        setError(data.message || 'حدث خطأ أثناء تسجيل الدخول')
        setIsLoading(false)
        return
      }

      router.push('/applicant/dashboard')
      router.refresh()
    } catch {
      setError('حدث خطأ أثناء تسجيل الدخول')
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#1e3a5f] to-[#4a90a4] flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-8">
          <Link href="/" className="inline-flex flex-col items-center">
            <Image
              src="/logo.png"
              alt="عضويتي"
              width={80}
              height={80}
              className="mb-4"
            />
            <h1 className="text-2xl font-bold text-white">عضويتي</h1>
            <p className="text-white/70 text-sm">اتحاد بشبابها</p>
          </Link>
        </div>

        {/* Login Card */}
        <div className="bg-white rounded-2xl shadow-xl p-6 sm:p-8">
          <div className="text-center mb-6">
            <h2 className="text-xl font-bold text-gray-900">تسجيل دخول الأعضاء</h2>
            <p className="text-gray-500 text-sm mt-1">أدخل بياناتك للوصول إلى عضويتك</p>
          </div>

          {error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm text-center">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">الرقم القومي</label>
              <input
                type="text"
                value={nationalId}
                onChange={(e) => setNationalId(e.target.value)}
                placeholder="أدخل الرقم القومي"
                disabled={isLoading}
                required
                maxLength={14}
                dir="ltr"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg text-sm text-left focus:outline-none focus:ring-2 focus:ring-[#1e3a5f]/20 focus:border-[#1e3a5f] disabled:opacity-50 disabled:bg-gray-50"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">كلمة المرور</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                disabled={isLoading}
                required
                dir="ltr"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg text-sm text-left focus:outline-none focus:ring-2 focus:ring-[#1e3a5f]/20 focus:border-[#1e3a5f] disabled:opacity-50 disabled:bg-gray-50"
              />
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-3 bg-[#1e3a5f] text-white rounded-lg text-sm font-medium hover:bg-[#1e3a5f]/90 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {isLoading ? (
                <>
                  <svg className="animate-spin h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                  </svg>
                  جاري تسجيل الدخول...
                </>
              ) : (
                'تسجيل الدخول'
              )}
            </button>
          </form>

          <div className="mt-4 text-center">
            <Link href="/login/forgot-password" className="text-gray-500 hover:text-[#1e3a5f] text-sm">
              نسيت كلمة المرور؟
            </Link>
          </div>

          <div className="mt-4 text-center">
            <p className="text-gray-500 text-sm">
              ليس لديك حساب؟{' '}
              <Link href="/" className="text-[#1e3a5f] font-semibold hover:underline">
                سجل الآن
              </Link>
            </p>
          </div>
        </div>

        <p className="text-center text-white/60 text-xs mt-6">
          جميع الحقوق محفوظة © اتحاد بشبابها 2026
        </p>
      </div>
    </div>
  )
}
