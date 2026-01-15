import { notFound } from "next/navigation";
import Header from "@/components/layout/Header";
import MemberProfile from "@/components/display/MemberProfile";
import { prisma } from "@/lib/prisma";
import { getCategoryLabel } from "@/lib/data/events";

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
      attendances: {
        select: {
          id: true,
          scannedAt: true,
          event: {
            select: {
              id: true,
              name: true,
              category: true,
              date: true,
              location: true,
              organizingEntity: true,
            },
          },
        },
        orderBy: { scannedAt: "desc" },
      },
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

        {/* Member Events Section */}
        {member.attendances && member.attendances.length > 0 && (
          <div className="max-w-2xl mx-auto mt-8">
            <div className="bg-white rounded-xl shadow-lg border border-gray-100 overflow-hidden">
              <div className="bg-gradient-to-l from-[#1e3a5f] to-[#2d5a8f] px-6 py-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-white/20 rounded-lg flex items-center justify-center">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0v-7.5A2.25 2.25 0 015.25 9h13.5A2.25 2.25 0 0121 11.25v7.5" />
                    </svg>
                  </div>
                  <div>
                    <h2 className="text-lg font-bold text-white">الفعاليات المشارك فيها</h2>
                    <p className="text-white/70 text-sm">{member.attendances.length} فعالية</p>
                  </div>
                </div>
              </div>

              <div className="divide-y divide-gray-100">
                {member.attendances.map((attendance) => (
                  <div key={attendance.id} className="p-4 hover:bg-gray-50 transition-colors">
                    <div className="flex items-start gap-4">
                      <div className="w-12 h-12 bg-[#1e3a5f]/10 rounded-lg flex items-center justify-center flex-shrink-0">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-[#1e3a5f]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="font-semibold text-gray-900">{attendance.event.name}</h3>
                        <div className="mt-1 flex flex-wrap gap-2">
                          <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-blue-100 text-blue-800">
                            {getCategoryLabel(attendance.event.category)}
                          </span>
                          <span className="text-xs text-gray-500">
                            {attendance.event.organizingEntity}
                          </span>
                        </div>
                        <div className="mt-2 flex items-center gap-4 text-xs text-gray-500">
                          <span className="flex items-center gap-1">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                              <path strokeLinecap="round" strokeLinejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                            </svg>
                            {new Date(attendance.event.date).toLocaleDateString("ar-EG", { year: "numeric", month: "short", day: "numeric" })}
                          </span>
                          <span className="flex items-center gap-1">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                              <path strokeLinecap="round" strokeLinejoin="round" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                              <path strokeLinecap="round" strokeLinejoin="round" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                            </svg>
                            {attendance.event.location}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
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
