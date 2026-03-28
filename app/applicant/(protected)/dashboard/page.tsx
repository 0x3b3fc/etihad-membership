import { redirect } from 'next/navigation'
import { getMemberSession } from '@/lib/member-auth'
import { prisma } from '@/lib/prisma'
import MemberProfile from '@/components/display/MemberProfile'
import Link from 'next/link'

export default async function DashboardPage() {
  const member = await getMemberSession()

  if (!member) {
    redirect('/applicant/login')
  }

  // Check if member has submitted an application
  const application = await prisma.application.findUnique({
    where: { memberId: member.id },
    select: { id: true, status: true, adminNote: true },
  })

  const hasApplied = !!application

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      {/* Welcome */}
      <div className="text-center">
        <h1 className="text-xl font-bold text-gray-900">مرحباً، {member.fullNameAr}</h1>
        <p className="text-sm text-gray-500 mt-1">هذه بطاقة عضويتك الإلكترونية</p>
      </div>

      {/* Member Card */}
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
        applicationStatus={application?.status as "PENDING" | "ACCEPTED" | "REJECTED" | undefined ?? null}
      />

      {/* Application Status */}
      {!hasApplied ? (
        <div className="bg-white rounded-xl border border-gray-200 p-5">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
              </svg>
            </div>
            <div>
              <h2 className="text-base font-semibold text-gray-900">تقديم طلب انضمام</h2>
              <p className="text-xs text-gray-500">لم تقم بتقديم طلب انضمام بعد. يمكنك تقديم طلبك الآن.</p>
            </div>
          </div>
          <Link href="/applicant/apply" className="inline-flex items-center px-5 py-2.5 bg-[#1e3a5f] text-white rounded-lg text-sm font-medium hover:bg-[#1e3a5f]/90 transition-colors">
            تقديم طلب الآن
          </Link>
        </div>
      ) : (
        <div className="bg-white rounded-xl border border-gray-200 p-5">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-base font-semibold text-gray-900">حالة طلب الانضمام</h2>
            <span className={`inline-block px-2.5 py-0.5 rounded-full text-xs font-medium ${
              application.status === 'PENDING' ? 'bg-yellow-100 text-yellow-700' :
              application.status === 'ACCEPTED' ? 'bg-green-100 text-green-700' :
              'bg-red-100 text-red-700'
            }`}>
              {application.status === 'PENDING' ? 'قيد المراجعة' :
               application.status === 'ACCEPTED' ? 'مقبول' : 'مرفوض'}
            </span>
          </div>
          {application.status === 'PENDING' && (
            <p className="text-xs text-yellow-700 bg-yellow-50 p-3 rounded-lg border border-yellow-200">طلبك قيد المراجعة، سيتم إعلامك بالنتيجة قريباً.</p>
          )}
          {application.status === 'ACCEPTED' && (
            <p className="text-xs text-green-700 bg-green-50 p-3 rounded-lg border border-green-200">تهانينا! تم قبول طلبك للانضمام.</p>
          )}
          {application.status === 'REJECTED' && (
            <div className="text-xs text-red-700 bg-red-50 p-3 rounded-lg border border-red-200">
              <p>نأسف، تم رفض طلبك.</p>
              {application.adminNote && <p className="mt-1">ملاحظة: {application.adminNote}</p>}
            </div>
          )}
          <Link href="/applicant/application" className="inline-flex items-center mt-3 px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors">
            عرض التفاصيل
          </Link>
        </div>
      )}

      {/* Quick Actions */}
      <div className="grid grid-cols-3 gap-3">
        <a href={member.qrCode} download={`qr-${member.fullNameAr.replace(/\s+/g, '-')}.png`} className="flex flex-col items-center gap-2 p-4 bg-white rounded-xl border border-gray-200 hover:border-[#1e3a5f] hover:shadow-md transition-all">
          <div className="w-10 h-10 bg-[#1e3a5f]/10 rounded-lg flex items-center justify-center">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-[#1e3a5f]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" /></svg>
          </div>
          <span className="text-xs font-medium text-gray-700">تحميل QR</span>
        </a>
        <Link href={`/member/${member.id}`} className="flex flex-col items-center gap-2 p-4 bg-white rounded-xl border border-gray-200 hover:border-[#1e3a5f] hover:shadow-md transition-all">
          <div className="w-10 h-10 bg-[#1e3a5f]/10 rounded-lg flex items-center justify-center">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-[#1e3a5f]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" /></svg>
          </div>
          <span className="text-xs font-medium text-gray-700">رابط العضوية</span>
        </Link>
        <Link href="/applicant/profile" className="flex flex-col items-center gap-2 p-4 bg-white rounded-xl border border-gray-200 hover:border-[#1e3a5f] hover:shadow-md transition-all">
          <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-purple-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z" /></svg>
          </div>
          <span className="text-xs font-medium text-gray-700">تعديل البيانات</span>
        </Link>
      </div>
    </div>
  )
}
