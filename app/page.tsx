import Image from "next/image";
import Link from "next/link";
import RegistrationForm from "@/components/forms/RegistrationForm";

export default function HomePage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-gray-50">
      {/* Header */}
      <header className="sticky top-0 z-50 border-b bg-white/95 backdrop-blur supports-[backdrop-filter]:bg-white/60">
        <div className="container mx-auto flex h-14 sm:h-16 items-center justify-between px-4">
          <Link href="/" className="flex items-center gap-2 sm:gap-3">
            <Image
              src="https://res.cloudinary.com/det1gfcko/image/upload/v1768060031/d5df2f10-7e43-4d9f-8509-4ec203636719-copied-media_2_ssq0wg.png"
              alt="عضويتي"
              width={40}
              height={40}
              className="w-10 h-10 sm:w-12 sm:h-12"
            />
            <div>
              <h1 className="font-bold text-[#1e3a5f] text-sm sm:text-base">عضويتي</h1>
              <p className="text-[10px] sm:text-xs text-gray-500">اتحاد بشبابها</p>
            </div>
          </Link>
          <Link
            href="/admin/login"
            className="inline-flex items-center gap-1.5 rounded-md border px-3 py-1.5 text-xs sm:text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
            <span className="hidden sm:inline">لوحة التحكم</span>
          </Link>
        </div>
      </header>

      {/* Hero Section */}
      <section className="py-8 sm:py-12 lg:py-16 px-4">
        <div className="container mx-auto text-center max-w-2xl">
          <div className="mb-6 sm:mb-8">
            <Image
              src="https://res.cloudinary.com/det1gfcko/image/upload/v1768060031/d5df2f10-7e43-4d9f-8509-4ec203636719-copied-media_2_ssq0wg.png"
              alt="عضويتي"
              width={100}
              height={100}
              className="mx-auto w-20 h-20 sm:w-24 sm:h-24 lg:w-28 lg:h-28"
            />
          </div>
          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-[#1e3a5f] mb-3 sm:mb-4">
            اتحاد بشبابها
          </h2>
          <p className="text-gray-600 text-sm sm:text-base lg:text-lg max-w-lg mx-auto">
سجل الآن و احصل علي كارنيه العضوية و العضوية الالكترونية          </p>
        </div>
      </section>

      {/* Features */}
      <section className="pb-8 sm:pb-12 px-4">
        <div className="container mx-auto max-w-3xl">
          <div className="grid grid-cols-3 gap-3 sm:gap-6">
            <div className="text-center p-3 sm:p-4">
              <div className="w-10 h-10 sm:w-12 sm:h-12 mx-auto mb-2 sm:mb-3 rounded-full bg-[#1e3a5f]/10 flex items-center justify-center">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 sm:h-6 sm:w-6 text-[#1e3a5f]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                </svg>
              </div>
              <h3 className="font-semibold text-xs sm:text-sm text-gray-900">عضوية موثقة</h3>
              <p className="text-[10px] sm:text-xs text-gray-500 mt-1 hidden sm:block">بياناتك محمية ومؤمنة</p>
            </div>
            <div className="text-center p-3 sm:p-4">
              <div className="w-10 h-10 sm:w-12 sm:h-12 mx-auto mb-2 sm:mb-3 rounded-full bg-[#1e3a5f]/10 flex items-center justify-center">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 sm:h-6 sm:w-6 text-[#1e3a5f]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v1m6 11h2m-6 0h-2v4m0-11v3m0 0h.01M12 12h4.01M16 20h4M4 12h4m12 0h.01M5 8h2a1 1 0 001-1V5a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1zm12 0h2a1 1 0 001-1V5a1 1 0 00-1-1h-2a1 1 0 00-1 1v2a1 1 0 001 1zM5 20h2a1 1 0 001-1v-2a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1z" />
                </svg>
              </div>
              <h3 className="font-semibold text-xs sm:text-sm text-gray-900">بطاقة رقمية</h3>
              <p className="text-[10px] sm:text-xs text-gray-500 mt-1 hidden sm:block">رمز QR خاص بك</p>
            </div>
            <div className="text-center p-3 sm:p-4">
              <div className="w-10 h-10 sm:w-12 sm:h-12 mx-auto mb-2 sm:mb-3 rounded-full bg-[#1e3a5f]/10 flex items-center justify-center">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 sm:h-6 sm:w-6 text-[#1e3a5f]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </div>
              <h3 className="font-semibold text-xs sm:text-sm text-gray-900">تسجيل سريع</h3>
              <p className="text-[10px] sm:text-xs text-gray-500 mt-1 hidden sm:block">في دقائق معدودة</p>
            </div>
          </div>
        </div>
      </section>

      {/* Registration Form Card */}
      <section className="pb-12 sm:pb-16 lg:pb-20 px-4">
        <div className="container mx-auto max-w-2xl">
          <div className="bg-white rounded-xl border shadow-sm">
            {/* Card Header */}
            <div className="border-b px-4 sm:px-6 py-4">
              <h3 className="text-lg sm:text-xl font-bold text-gray-900">نموذج التسجيل</h3>
              <p className="text-xs sm:text-sm text-gray-500 mt-1">أكمل البيانات التالية للحصول على عضويتك</p>
            </div>
            {/* Card Content */}
            <div className="p-4 sm:p-6">
              <RegistrationForm />
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t bg-white py-4 sm:py-6">
        <div className="container mx-auto px-4 text-center">
          <p className="text-xs sm:text-sm text-gray-500">
            جميع الحقوق محفوظة © اتحاد بشبابها 2026 - وحدة الربط المركزي (المركز التقني)
          </p>
        </div>
      </footer>
    </div>
  );
}
