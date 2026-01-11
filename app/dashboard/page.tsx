import { redirect } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { getMemberSession } from "@/lib/member-auth";
import MemberProfile from "@/components/display/MemberProfile";
import LogoutButton from "@/components/ui/LogoutButton";

export default async function DashboardPage() {
  const member = await getMemberSession();

  if (!member) {
    redirect("/login");
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-gray-50">
      {/* Header */}
      <header className="sticky top-0 z-50 border-b bg-white/95 backdrop-blur">
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
          <LogoutButton />
        </div>
      </header>

      <main className="container mx-auto px-4 py-8 sm:py-12">
        {/* Welcome Message */}
        <div className="text-center mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            مرحباً، {member.fullNameAr}
          </h2>
          <p className="text-gray-500">هذه بطاقة عضويتك الإلكترونية</p>
        </div>

        {/* Member Profile Card */}
        <MemberProfile
          member={{
            id: member.id,
            memberNumber: member.memberNumber,
            fullNameAr: member.fullNameAr,
            fullNameEn: member.fullNameEn,
            governorate: member.governorate,
            memberType: member.memberType,
            entityName: member.entityName,
            role: member.role,
            profileImage: member.profileImage,
            qrCode: member.qrCode,
            createdAt: member.createdAt.toISOString(),
          }}
        />

        {/* Quick Actions */}
        <div className="max-w-md mx-auto mt-8 grid grid-cols-2 gap-4">
          <a
            href={member.qrCode}
            download={`qr-${member.fullNameAr.replace(/\s+/g, "-")}.png`}
            className="flex flex-col items-center gap-2 p-4 bg-white rounded-xl border hover:border-[#1e3a5f] hover:shadow-md transition-all"
          >
            <div className="w-10 h-10 bg-[#1e3a5f]/10 rounded-lg flex items-center justify-center">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-[#1e3a5f]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
              </svg>
            </div>
            <span className="text-sm font-medium text-gray-700">تحميل QR</span>
          </a>
          <Link
            href={`/member/${member.id}`}
            className="flex flex-col items-center gap-2 p-4 bg-white rounded-xl border hover:border-[#1e3a5f] hover:shadow-md transition-all"
          >
            <div className="w-10 h-10 bg-[#1e3a5f]/10 rounded-lg flex items-center justify-center">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-[#1e3a5f]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
              </svg>
            </div>
            <span className="text-sm font-medium text-gray-700">رابط العضوية</span>
          </Link>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t bg-white py-4 mt-auto">
        <div className="container mx-auto px-4 text-center">
          <p className="text-xs text-gray-500">
            جميع الحقوق محفوظة © اتحاد بشبابها 2026 - وحدة الربط المركزي (المركز التقني)
          </p>
        </div>
      </footer>
    </div>
  );
}
