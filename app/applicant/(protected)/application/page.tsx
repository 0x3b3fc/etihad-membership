"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import Spinner from "@/components/ui/Spinner";

interface ApplicationData {
  id: string;
  fullName: string;
  nationalId: string;
  phone: string | null;
  email: string | null;
  address: string;
  birthDate: string;
  memberType: string;
  universityName: string | null;
  facultyName: string | null;
  employmentStatus: string;
  jobTitle: string | null;
  employer: string | null;
  previousExperiences: string | null;
  skills: string | null;
  photoUrl: string | null;
  status: string;
  adminNote: string | null;
  submittedAt: string;
  decidedAt: string | null;
  governorate: { name: string };
  assignedUnit: {
    name: string;
    address: string | null;
    phone: string | null;
    whatsappLink: string | null;
    governorate: { name: string } | null;
  } | null;
}

export default function ApplicationPage() {
  const router = useRouter();
  const [application, setApplication] = useState<ApplicationData | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const res = await fetch("/api/member/application");
        const data = await res.json();
        if (!data.hasApplied) {
          router.push("/applicant/apply");
          return;
        }
        setApplication(data.data);
      } catch { /* */ }
      finally { setIsLoading(false); }
    };
    load();
  }, [router]);

  if (isLoading) return <div className="flex items-center justify-center min-h-[400px]"><Spinner size="lg" /></div>;
  if (!application) return null;

  const statusConfig: Record<string, { label: string; bg: string; alertBg: string; textColor: string; subColor: string; msg: string; sub: string }> = {
    PENDING: { label: "قيد المراجعة", bg: "bg-yellow-100 text-yellow-700", alertBg: "bg-yellow-50 border-yellow-200", textColor: "text-yellow-800", subColor: "text-yellow-700", msg: "طلبك قيد المراجعة", sub: "سيتم إعلامك بالنتيجة قريباً. شكراً لصبرك." },
    ACCEPTED: { label: "مقبول", bg: "bg-green-100 text-green-700", alertBg: "bg-green-50 border-green-200", textColor: "text-green-800", subColor: "text-green-700", msg: "تم قبول طلبك", sub: "تهانينا! تم قبول طلبك للانضمام." },
    REJECTED: { label: "مرفوض", bg: "bg-red-100 text-red-700", alertBg: "bg-red-50 border-red-200", textColor: "text-red-800", subColor: "text-red-700", msg: "تم رفض طلبك", sub: "نأسف لإبلاغك بأن طلبك قد تم رفضه." },
  };
  const sc = statusConfig[application.status] || statusConfig.PENDING;
  const formatDate = (d: string) => new Date(d).toLocaleDateString("ar-EG", { year: "numeric", month: "long", day: "numeric" });

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-gray-900">طلب الانضمام</h1>
          <p className="text-sm text-gray-500 mt-1">تفاصيل طلبك ومتابعة حالته</p>
        </div>
        <span className={`inline-block px-2.5 py-1 rounded-full text-xs font-medium ${sc.bg}`}>{sc.label}</span>
      </div>

      {/* Status Alert */}
      <div className={`flex items-start gap-3 p-4 rounded-lg border ${sc.alertBg}`}>
        <svg xmlns="http://www.w3.org/2000/svg" className={`h-5 w-5 mt-0.5 flex-shrink-0 ${sc.subColor}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
          {application.status === "PENDING" && <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" />}
          {application.status === "ACCEPTED" && <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />}
          {application.status === "REJECTED" && <path strokeLinecap="round" strokeLinejoin="round" d="M9.75 9.75l4.5 4.5m0-4.5l-4.5 4.5M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />}
        </svg>
        <div>
          <p className={`font-medium text-sm ${sc.textColor}`}>{sc.msg}</p>
          <p className={`text-xs ${sc.subColor}`}>{sc.sub}</p>
          {application.status === "REJECTED" && application.adminNote && (
            <p className={`text-xs mt-2 pt-2 border-t border-red-200 ${sc.subColor}`}>ملاحظة الإدارة: {application.adminNote}</p>
          )}
        </div>
      </div>

      {/* Assigned Unit */}
      {application.status === "ACCEPTED" && application.assignedUnit && (
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">الوحدة المسجل بها</h2>
          <div className="grid gap-3 sm:grid-cols-2">
            {application.assignedUnit.governorate && (
              <div><p className="text-xs text-gray-500">المحافظة</p><p className="text-sm font-medium text-gray-900">{application.assignedUnit.governorate.name}</p></div>
            )}
            <div><p className="text-xs text-gray-500">الوحدة</p><p className="text-sm font-medium text-gray-900">{application.assignedUnit.name}</p></div>
            {application.assignedUnit.address && <div><p className="text-xs text-gray-500">العنوان</p><p className="text-sm font-medium text-gray-900">{application.assignedUnit.address}</p></div>}
            {application.assignedUnit.phone && <div><p className="text-xs text-gray-500">الهاتف</p><p className="text-sm font-medium text-gray-900" dir="ltr">{application.assignedUnit.phone}</p></div>}
          </div>
          {application.assignedUnit.whatsappLink && (
            <a href={application.assignedUnit.whatsappLink} target="_blank" rel="noopener noreferrer" className="mt-4 w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-green-600 text-white rounded-lg text-sm font-medium hover:bg-green-700 transition-colors">
              تواصل عبر الواتساب
            </a>
          )}
        </div>
      )}

      {/* Application Details */}
      <div className="bg-white rounded-lg border border-gray-200">
        <div className="p-6 pb-4">
          <h2 className="text-lg font-semibold text-gray-900">بيانات الطلب</h2>
          <p className="text-sm text-gray-500 mt-1">تم التقديم في {formatDate(application.submittedAt)}</p>
        </div>
        <div className="px-6 pb-6 space-y-5">
          <div className="flex items-center gap-4">
            <div className="h-16 w-16 rounded-full bg-gray-100 flex items-center justify-center overflow-hidden flex-shrink-0">
              {application.photoUrl ? (
                <Image src={application.photoUrl} alt={application.fullName} width={64} height={64} className="h-full w-full object-cover" />
              ) : (
                <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z" /></svg>
              )}
            </div>
            <div>
              <p className="text-base font-medium text-gray-900">{application.fullName}</p>
              <p className="text-sm text-gray-500 font-mono" dir="ltr">{application.nationalId}</p>
            </div>
          </div>
          <hr className="border-gray-200" />
          <div className="grid gap-4 sm:grid-cols-2">
            <div><p className="text-xs text-gray-500">المحافظة</p><p className="text-sm font-medium text-gray-900">{application.governorate.name}</p></div>
            <div><p className="text-xs text-gray-500">تاريخ الميلاد</p><p className="text-sm font-medium text-gray-900">{formatDate(application.birthDate)}</p></div>
            {application.phone && <div><p className="text-xs text-gray-500">الهاتف</p><p className="text-sm font-medium text-gray-900" dir="ltr">{application.phone}</p></div>}
            {application.email && <div><p className="text-xs text-gray-500">البريد</p><p className="text-sm font-medium text-gray-900" dir="ltr">{application.email}</p></div>}
            <div><p className="text-xs text-gray-500">العنوان</p><p className="text-sm font-medium text-gray-900">{application.address}</p></div>
            <div><p className="text-xs text-gray-500">نوع العضوية</p><p className="text-sm font-medium text-gray-900">{application.memberType === "student" ? "طالب" : "خريج"}</p></div>
            {application.universityName && <div><p className="text-xs text-gray-500">الجامعة</p><p className="text-sm font-medium text-gray-900">{application.universityName}</p></div>}
            {application.facultyName && <div><p className="text-xs text-gray-500">الكلية</p><p className="text-sm font-medium text-gray-900">{application.facultyName}</p></div>}
            <div><p className="text-xs text-gray-500">الحالة الوظيفية</p><p className="text-sm font-medium text-gray-900">{application.employmentStatus === "working" ? "يعمل" : "لا يعمل"}</p></div>
            {application.jobTitle && <div><p className="text-xs text-gray-500">الوظيفة</p><p className="text-sm font-medium text-gray-900">{application.jobTitle}</p></div>}
          </div>
          {application.decidedAt && (
            <><hr className="border-gray-200" /><div><p className="text-xs text-gray-500">تاريخ القرار</p><p className="text-sm font-medium text-gray-900">{formatDate(application.decidedAt)}</p></div></>
          )}
        </div>
      </div>

      <div className="flex justify-center">
        <Link href="/applicant/dashboard" className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors">
          العودة للوحة التحكم
        </Link>
      </div>
    </div>
  );
}
