import Link from "next/link";
import Image from "next/image";
import Button from "@/components/ui/Button";

export default async function SuccessPage({
  searchParams,
}: {
  searchParams: Promise<{ id?: string; memberNumber?: string; nationalId?: string; password?: string }>;
}) {
  const { id, memberNumber, nationalId, password } = await searchParams;

  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-gray-50">
      {/* Header */}
      <header className="sticky top-0 z-50 border-b bg-white/95 backdrop-blur">
        <div className="container mx-auto flex h-14 sm:h-16 items-center px-4">
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
        </div>
      </header>

      <main className="container mx-auto px-4 py-12 sm:py-16">
        <div className="max-w-md mx-auto">
          {/* Success Card */}
          <div className="bg-white rounded-xl border shadow-sm overflow-hidden">
            <div className="px-6 py-8 text-center">
              {/* Success Icon */}
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-8 w-8 text-green-600"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                >
                  <path
                    fillRule="evenodd"
                    d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                    clipRule="evenodd"
                  />
                </svg>
              </div>

              {/* Title */}
              <h1 className="text-2xl font-bold text-gray-900 mb-2">
                تم التسجيل بنجاح!
              </h1>
              <p className="text-gray-600 mb-6">
                مرحباً بك في عائلة اتحاد بشبابها
              </p>

              {/* Member Number */}
              {memberNumber && (
                <div className="bg-[#1e3a5f]/5 rounded-lg p-4 mb-4 border border-[#1e3a5f]/20">
                  <p className="text-xs text-gray-500 mb-1">رقم العضوية</p>
                  <p className="font-mono text-lg font-bold text-[#1e3a5f]" dir="ltr">
                    {memberNumber}
                  </p>
                </div>
              )}

              {/* Login Credentials */}
              {nationalId && password && (
                <div className="bg-amber-50 rounded-lg p-4 mb-6 border border-amber-200 text-right">
                  <div className="flex items-center gap-2 mb-3">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-amber-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                    </svg>
                    <h3 className="font-bold text-amber-800">بيانات تسجيل الدخول</h3>
                  </div>
                  <p className="text-xs text-amber-700 mb-3">
                    احفظ هذه البيانات جيداً، لن تظهر مرة أخرى!
                  </p>
                  <div className="space-y-3">
                    <div className="bg-white rounded-lg p-3 border border-amber-200">
                      <p className="text-xs text-gray-500 mb-1">الرقم القومي</p>
                      <p className="font-mono text-sm text-gray-900 select-all" dir="ltr">
                        {nationalId}
                      </p>
                    </div>
                    <div className="bg-white rounded-lg p-3 border border-amber-200">
                      <p className="text-xs text-gray-500 mb-1">كلمة المرور</p>
                      <p className="font-mono text-sm text-gray-900 select-all" dir="ltr">
                        {password}
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {/* Action Buttons */}
              <div className="space-y-3">
                <Link href="/login" className="block">
                  <Button size="lg" className="w-full">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 ml-2" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1" />
                    </svg>
                    تسجيل الدخول
                  </Button>
                </Link>
                {id && (
                  <Link href={`/member/${id}`} className="block">
                    <Button variant="outline" size="lg" className="w-full">
                      عرض بطاقة العضوية
                    </Button>
                  </Link>
                )}
                <Link href="/" className="block">
                  <Button variant="ghost" size="lg" className="w-full text-gray-600">
                    العودة للصفحة الرئيسية
                  </Button>
                </Link>
              </div>
            </div>
          </div>

          {/* Features */}
          <div className="grid grid-cols-2 gap-4 mt-6">
            <div className="bg-white rounded-lg border p-4 text-center">
              <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-2">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v1m6 11h2m-6 0h-2v4m0-11v3m0 0h.01M12 12h4.01M16 20h4M4 12h4m12 0h.01M5 8h2a1 1 0 001-1V5a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1zm12 0h2a1 1 0 001-1V5a1 1 0 00-1-1h-2a1 1 0 00-1 1v2a1 1 0 001 1zM5 20h2a1 1 0 001-1v-2a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1z" />
                </svg>
              </div>
              <h3 className="font-semibold text-sm text-gray-900">رمز QR</h3>
              <p className="text-xs text-gray-500 mt-1">للتحقق من عضويتك</p>
            </div>
            <div className="bg-white rounded-lg border p-4 text-center">
              <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-2">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                </svg>
              </div>
              <h3 className="font-semibold text-sm text-gray-900">عضوية موثقة</h3>
              <p className="text-xs text-gray-500 mt-1">تم توثيق بياناتك</p>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
