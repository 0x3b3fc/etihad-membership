import { redirect } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import LoginForm from "@/components/forms/LoginForm";
import Providers from "@/components/Providers";

export default async function AdminLoginPage() {
  let session = null;

  try {
    session = await getServerSession(authOptions);
  } catch {
    // Session error - treat as no session
    session = null;
  }

  if (session) {
    redirect("/admin/members");
  }

  return (
    <Providers>
      <div className="min-h-screen bg-gradient-to-b from-white to-gray-50">
        {/* Header */}
        <header className="border-b bg-white">
          <div className="container mx-auto flex h-14 sm:h-16 items-center px-4">
            <Link href="/" className="flex items-center gap-2 sm:gap-3">
              <Image
                src="/logo.png"
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

        {/* Main Content */}
        <main className="container mx-auto px-4 py-12 sm:py-16">
          <div className="max-w-md mx-auto">
            {/* Login Card */}
            <div className="bg-white rounded-xl border shadow-sm overflow-hidden">
              <div className="border-b px-6 py-4">
                <h2 className="text-lg font-bold text-gray-900">تسجيل الدخول</h2>
                <p className="text-sm text-gray-500 mt-1">أدخل بياناتك للوصول إلى لوحة التحكم</p>
              </div>
              <div className="p-6">
                <LoginForm />
              </div>
            </div>

            {/* Back Link */}
            <div className="text-center mt-6">
              <Link href="/" className="text-sm text-gray-500 hover:text-gray-700">
                العودة للصفحة الرئيسية
              </Link>
            </div>
          </div>
        </main>
      </div>
    </Providers>
  );
}
