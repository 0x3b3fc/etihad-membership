"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import Input from "@/components/ui/Input";
import Button from "@/components/ui/Button";

export default function MemberLoginPage() {
  const router = useRouter();
  const [nationalId, setNationalId] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    try {
      const response = await fetch("/api/member/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ nationalId, password }),
      });

      const data = await response.json();

      if (!data.success) {
        setError(data.message || "حدث خطأ أثناء تسجيل الدخول");
        return;
      }

      router.push("/dashboard");
    } catch {
      setError("حدث خطأ أثناء تسجيل الدخول");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#1e3a5f] to-[#4a90a4] flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-8">
          <Link href="/" className="inline-flex flex-col items-center">
            <Image
              src="https://res.cloudinary.com/det1gfcko/image/upload/v1768060031/d5df2f10-7e43-4d9f-8509-4ec203636719-copied-media_2_ssq0wg.png"
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
            <Input
              label="الرقم القومي"
              type="text"
              placeholder="أدخل الرقم القومي"
              value={nationalId}
              onChange={(e) => setNationalId(e.target.value)}
              maxLength={14}
              dir="ltr"
              className="text-left"
              required
            />

            <Input
              label="كلمة المرور"
              type="password"
              placeholder="أدخل كلمة المرور"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              dir="ltr"
              className="text-left"
              required
            />

            <Button
              type="submit"
              size="lg"
              className="w-full"
              isLoading={isLoading}
            >
              تسجيل الدخول
            </Button>
          </form>

          <div className="mt-4 text-center">
            <Link
              href="/login/forgot-password"
              className="text-gray-500 hover:text-[#1e3a5f] text-sm"
            >
              نسيت كلمة المرور؟
            </Link>
          </div>

          <div className="mt-4 text-center">
            <p className="text-gray-500 text-sm">
              ليس لديك حساب؟{" "}
              <Link href="/" className="text-[#1e3a5f] font-semibold hover:underline">
                سجل الآن
              </Link>
            </p>
          </div>
        </div>

        {/* Footer */}
        <p className="text-center text-white/60 text-xs mt-6">
          جميع الحقوق محفوظة © اتحاد بشبابها 2026 - وحدة الربط المركزي (المركز التقني)
        </p>
      </div>
    </div>
  );
}
