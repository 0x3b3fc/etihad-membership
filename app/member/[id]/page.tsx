import { notFound } from "next/navigation";
import Header from "@/components/layout/Header";
import MemberProfile from "@/components/display/MemberProfile";
import { prisma } from "@/lib/prisma";

interface MemberPageProps {
  params: Promise<{ id: string }>;
}

async function getMember(id: string) {
  const member = await prisma.member.findUnique({
    where: { id },
    select: {
      id: true,
      memberNumber: true,
      fullNameAr: true,
      fullNameEn: true,
      governorate: true,
      memberType: true,
      entityName: true,
      role: true,
      profileImage: true,
      qrCode: true,
      createdAt: true,
    },
  });

  return member;
}

export default async function MemberPage({ params }: MemberPageProps) {
  const { id } = await params;
  const member = await getMember(id);

  if (!member) {
    notFound();
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header showAdminLink={false} />

      <main className="container mx-auto px-4 py-12">
        {/* Page Header */}
        <div className="text-center mb-10">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-[#1e3a5f]/10 rounded-full mb-4">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-[#1e3a5f]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M10 6H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V8a2 2 0 00-2-2h-5m-4 0V5a2 2 0 114 0v1m-4 0a2 2 0 104 0m-5 8a2 2 0 100-4 2 2 0 000 4zm0 0c1.306 0 2.417.835 2.83 2M9 14a3.001 3.001 0 00-2.83 2M15 11h3m-3 4h2" />
            </svg>
            <span className="text-sm font-medium text-[#1e3a5f]">بطاقة رقمية</span>
          </div>
          <h1 className="text-3xl font-bold mb-2 text-[#1e3a5f]">بطاقة العضوية</h1>
          <p className="text-gray-500">اتحاد بشبابها - عضويتي</p>
        </div>

        <MemberProfile
          member={{
            ...member,
            createdAt: member.createdAt.toISOString(),
          }}
        />
      </main>

      {/* Footer */}
      <footer className="border-t border-gray-200 mt-auto bg-white">
        <div className="container mx-auto px-4 py-6">
          <div className="text-center">
            <p className="text-sm text-gray-500">
              جميع الحقوق محفوظة © اتحاد بشبابها 2026 - وحدة الربط المركزي (المركز التقني)
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
