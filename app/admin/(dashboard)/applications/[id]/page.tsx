import { notFound } from 'next/navigation'
import { getApplicationById } from '@/lib/actions/application.actions'
import { getAllUnits } from '@/lib/actions/unit.actions'
import { ApplicationDecisionForm } from '@/components/forms/ApplicationDecisionForm'
import Link from 'next/link'
import { format } from 'date-fns'
import { ar } from 'date-fns/locale'
import Image from 'next/image'

export default async function ApplicationDetailPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const application = await getApplicationById(id)

  if (!application) {
    notFound()
  }

  const units = await getAllUnits(false)

  const formatDate = (date: Date) => {
    return format(new Date(date), 'dd MMMM yyyy', { locale: ar })
  }

  const statusConfig: Record<string, { label: string; className: string }> = {
    PENDING: { label: 'قيد المراجعة', className: 'bg-yellow-100 text-yellow-700' },
    ACCEPTED: { label: 'مقبول', className: 'bg-green-100 text-green-700' },
    REJECTED: { label: 'مرفوض', className: 'bg-red-100 text-red-700' },
  }
  const sc = statusConfig[application.status] || statusConfig.PENDING

  return (
    <div className="pt-14 lg:pt-0 space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <Link
          href="/admin/applications"
          className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
          </svg>
        </Link>
        <div>
          <h1 className="text-xl font-bold text-gray-900">تفاصيل الطلب</h1>
          <p className="text-sm text-gray-500">مراجعة واتخاذ قرار بشأن الطلب</p>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Main Info */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white rounded-lg border border-gray-200">
            {/* Card Header */}
            <div className="p-6 pb-4">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-semibold text-gray-900">بيانات المتقدم</h2>
                <span className={`inline-block px-2.5 py-0.5 rounded-full text-xs font-medium ${sc.className}`}>
                  {sc.label}
                </span>
              </div>
              <p className="text-sm text-gray-500 mt-1">تم التقديم في {formatDate(application.submittedAt)}</p>
            </div>

            <div className="px-6 pb-6 space-y-5">
              {/* Photos */}
              <div className="grid gap-3 sm:gap-4 grid-cols-1 sm:grid-cols-3">
                <div className="text-center">
                  <p className="text-xs text-gray-500 mb-2">الصورة الشخصية</p>
                  <div className="relative mx-auto w-24 h-24 sm:w-32 sm:h-32 rounded-lg overflow-hidden border border-gray-200 bg-gray-50">
                    {application.photoUrl ? (
                      <Image src={application.photoUrl} alt={application.fullName} fill className="object-cover" />
                    ) : (
                      <div className="flex items-center justify-center h-full">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z" />
                        </svg>
                      </div>
                    )}
                  </div>
                </div>
                <div className="text-center">
                  <p className="text-xs text-gray-500 mb-2">وجه البطاقة</p>
                  <div className="relative mx-auto w-32 h-20 sm:w-40 sm:h-28 rounded-lg overflow-hidden border border-gray-200 bg-gray-50">
                    {application.nationalIdPhotoUrl ? (
                      <Image src={application.nationalIdPhotoUrl} alt="وجه البطاقة" fill className="object-cover" />
                    ) : (
                      <div className="flex items-center justify-center h-full">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 8.25h19.5M2.25 9h19.5m-16.5 5.25h6m-6 2.25h3m-3.75 3h15a2.25 2.25 0 002.25-2.25V6.75A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25v10.5A2.25 2.25 0 004.5 19.5z" />
                        </svg>
                      </div>
                    )}
                  </div>
                </div>
                <div className="text-center">
                  <p className="text-xs text-gray-500 mb-2">ظهر البطاقة</p>
                  <div className="relative mx-auto w-32 h-20 sm:w-40 sm:h-28 rounded-lg overflow-hidden border border-gray-200 bg-gray-50">
                    {application.nationalIdPhotoBackUrl ? (
                      <Image src={application.nationalIdPhotoBackUrl} alt="ظهر البطاقة" fill className="object-cover" />
                    ) : (
                      <div className="flex items-center justify-center h-full">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 8.25h19.5M2.25 9h19.5m-16.5 5.25h6m-6 2.25h3m-3.75 3h15a2.25 2.25 0 002.25-2.25V6.75A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25v10.5A2.25 2.25 0 004.5 19.5z" />
                        </svg>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              <hr className="border-gray-200" />

              {/* Name */}
              <div>
                <h3 className="text-xl font-bold text-gray-900">{application.fullName}</h3>
                <p className="text-gray-500 font-mono text-sm" dir="ltr">{application.nationalId}</p>
              </div>

              <hr className="border-gray-200" />

              {/* Info Grid */}
              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <p className="text-xs text-gray-500">البريد الإلكتروني</p>
                  <p className="text-sm font-medium text-gray-900" dir="ltr">{application.user?.email || application.email || '-'}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500">رقم الهاتف</p>
                  <p className="text-sm font-medium text-gray-900" dir="ltr">{application.phone || '-'}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500">تاريخ الميلاد</p>
                  <p className="text-sm font-medium text-gray-900">{formatDate(application.birthDate)}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500">المحافظة</p>
                  <p className="text-sm font-medium text-gray-900">{application.governorate.name}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500">المؤهل الدراسي</p>
                  <p className="text-sm font-medium text-gray-900">{application.education || application.memberType || '-'}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500">العنوان</p>
                  <p className="text-sm font-medium text-gray-900">{application.address}</p>
                </div>
                {application.universityName && (
                  <div>
                    <p className="text-xs text-gray-500">الجامعة</p>
                    <p className="text-sm font-medium text-gray-900">{application.universityName}</p>
                  </div>
                )}
                {application.facultyName && (
                  <div>
                    <p className="text-xs text-gray-500">الكلية</p>
                    <p className="text-sm font-medium text-gray-900">{application.facultyName}</p>
                  </div>
                )}
                {application.employmentStatus && (
                  <div>
                    <p className="text-xs text-gray-500">الحالة الوظيفية</p>
                    <p className="text-sm font-medium text-gray-900">{application.employmentStatus === 'working' ? 'يعمل' : 'لا يعمل'}</p>
                  </div>
                )}
                {application.jobTitle && (
                  <div>
                    <p className="text-xs text-gray-500">الوظيفة</p>
                    <p className="text-sm font-medium text-gray-900">{application.jobTitle}</p>
                  </div>
                )}
              </div>

              {/* Experiences */}
              {application.experiences && application.experiences.length > 0 && (
                <>
                  <hr className="border-gray-200" />
                  <div>
                    <p className="text-xs text-gray-500 mb-2">الخبرات والمهارات</p>
                    <div className="flex flex-wrap gap-2">
                      {application.experiences.map((exp) => (
                        <span key={exp} className="inline-flex items-center rounded-full bg-gray-100 px-2.5 py-0.5 text-xs font-medium text-gray-700">
                          {exp}
                        </span>
                      ))}
                    </div>
                  </div>
                </>
              )}

              {/* Skills/Previous Experiences text fields */}
              {(application.previousExperiences || application.skills) && (
                <>
                  <hr className="border-gray-200" />
                  <div className="grid gap-4 sm:grid-cols-2">
                    {application.previousExperiences && (
                      <div>
                        <p className="text-xs text-gray-500 mb-1">الخبرات السابقة</p>
                        <p className="text-sm text-gray-900 bg-gray-50 rounded-lg p-3">{application.previousExperiences}</p>
                      </div>
                    )}
                    {application.skills && (
                      <div>
                        <p className="text-xs text-gray-500 mb-1">المهارات</p>
                        <p className="text-sm text-gray-900 bg-gray-50 rounded-lg p-3">{application.skills}</p>
                      </div>
                    )}
                  </div>
                </>
              )}

              <hr className="border-gray-200" />

              {/* Dates */}
              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <p className="text-xs text-gray-500">تاريخ تسجيل الحساب</p>
                  <p className="text-sm font-medium text-gray-900">{formatDate(application.user?.createdAt || application.createdAt)}</p>
                </div>
                {application.decidedAt && (
                  <div>
                    <p className="text-xs text-gray-500">تاريخ القرار</p>
                    <p className="text-sm font-medium text-gray-900">{formatDate(application.decidedAt)}</p>
                  </div>
                )}
              </div>

              {/* Assigned Unit */}
              {application.assignedUnit && (
                <>
                  <hr className="border-gray-200" />
                  <div>
                    <p className="text-xs text-gray-500 mb-2">الوحدة المسجل بها</p>
                    <div className="p-4 bg-gray-50 rounded-lg">
                      <p className="font-medium text-gray-900">{application.assignedUnit.name}</p>
                      {application.assignedUnit.governorate && (
                        <p className="text-sm text-gray-500">{application.assignedUnit.governorate.name}</p>
                      )}
                    </div>
                  </div>
                </>
              )}

              {/* Admin Note */}
              {application.adminNote && (
                <>
                  <hr className="border-gray-200" />
                  <div>
                    <p className="text-xs text-gray-500 mb-2">ملاحظة الإدارة</p>
                    <p className="text-sm text-gray-900 p-4 bg-gray-50 rounded-lg">{application.adminNote}</p>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>

        {/* Decision Form */}
        <div>
          <ApplicationDecisionForm
            applicationId={application.id}
            currentStatus={application.status}
            currentUnitId={application.assignedUnitId}
            currentNote={application.adminNote}
            units={units}
          />
        </div>
      </div>
    </div>
  )
}
