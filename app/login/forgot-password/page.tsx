"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import Input from "@/components/ui/Input";
import Button from "@/components/ui/Button";

export default function ForgotPasswordPage() {
  const [nationalId, setNationalId] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<{
    success: boolean;
    newPassword?: string;
    memberNumber?: string;
    fullName?: string;
  } | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setResult(null);
    setIsLoading(true);

    try {
      const response = await fetch("/api/member/reset-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ nationalId }),
      });

      const data = await response.json();

      if (!data.success) {
        setError(data.message || "حدث خطأ أثناء إعادة تعيين كلمة المرور");
        return;
      }

      setResult({
        success: true,
        newPassword: data.newPassword,
        memberNumber: data.memberNumber,
        fullName: data.fullName,
      });
    } catch {
      setError("حدث خطأ أثناء إعادة تعيين كلمة المرور");
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

        {/* Card */}
        <div className="bg-white rounded-2xl shadow-xl p-6 sm:p-8">
          {!result ? (
            <>
              <div className="text-center mb-6">
                <h2 className="text-xl font-bold text-gray-900">نسيت كلمة المرور</h2>
                <p className="text-gray-500 text-sm mt-1">
                  أدخل الرقم القومي لإعادة تعيين كلمة المرور
                </p>
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
                  placeholder="أدخل الرقم القومي المسجل به"
                  value={nationalId}
                  onChange={(e) => setNationalId(e.target.value)}
                  maxLength={14}
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
                  إعادة تعيين كلمة المرور
                </Button>
              </form>

              <div className="mt-6 text-center">
                <Link
                  href="/login"
                  className="text-[#1e3a5f] font-semibold hover:underline text-sm"
                >
                  العودة لتسجيل الدخول
                </Link>
              </div>
            </>
          ) : (
            <>
              <div className="text-center mb-6">
                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-8 w-8 text-green-600"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth={2}
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M5 13l4 4L19 7"
                    />
                  </svg>
                </div>
                <h2 className="text-xl font-bold text-gray-900">
                  تم إعادة تعيين كلمة المرور
                </h2>
                <p className="text-gray-500 text-sm mt-1">
                  يرجى حفظ كلمة المرور الجديدة
                </p>
              </div>

              <div className="space-y-4">
                <div className="bg-gray-50 rounded-lg p-4">
                  <p className="text-gray-500 text-xs mb-1">اسم العضو</p>
                  <p className="font-semibold text-gray-900">{result.fullName}</p>
                </div>

                <div className="bg-gray-50 rounded-lg p-4">
                  <p className="text-gray-500 text-xs mb-1">رقم العضوية</p>
                  <p className="font-semibold text-gray-900 font-mono" dir="ltr">
                    {result.memberNumber}
                  </p>
                </div>

                <div className="bg-[#1e3a5f] rounded-lg p-4">
                  <p className="text-white/70 text-xs mb-1">كلمة المرور الجديدة</p>
                  <p className="font-bold text-white text-xl font-mono tracking-wider" dir="ltr">
                    {result.newPassword}
                  </p>
                </div>

                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
                  <p className="text-yellow-800 text-sm text-center">
                    احفظ كلمة المرور الجديدة في مكان آمن
                  </p>
                </div>
              </div>

              <div className="mt-6">
                <Link href="/login">
                  <Button size="lg" className="w-full">
                    تسجيل الدخول الآن
                  </Button>
                </Link>
              </div>
            </>
          )}
        </div>

        {/* Footer */}
        <p className="text-center text-white/60 text-xs mt-6">
          جميع الحقوق محفوظة © اتحاد بشبابها 2026 - وحدة الربط المركزي (المركز التقني)
        </p>
      </div>
    </div>
  );
}
