import { prisma } from "@/lib/prisma";
import Link from "next/link";

export default async function AdminDashboardPage() {
  const [
    totalMembers,
    totalApplications,
    pendingApplications,
    acceptedApplications,
    rejectedApplications,
    totalGovernorates,
    totalUnits,
    latestApplications,
  ] = await Promise.all([
    prisma.member.count(),
    prisma.application.count(),
    prisma.application.count({ where: { status: "PENDING" } }),
    prisma.application.count({ where: { status: "ACCEPTED" } }),
    prisma.application.count({ where: { status: "REJECTED" } }),
    prisma.governorate.count({ where: { isActive: true } }),
    prisma.unit.count({ where: { isActive: true } }),
    prisma.application.findMany({
      take: 5,
      orderBy: { submittedAt: "desc" },
      include: { governorate: true },
    }),
  ]);

  const stats = [
    { label: "إجمالي الأعضاء", value: totalMembers, color: "bg-blue-100 text-blue-600", icon: "M15 19.128a9.38 9.38 0 002.625.372 9.337 9.337 0 004.121-.952 4.125 4.125 0 00-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 018.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0111.964-3.07M12 6.375a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0zm8.25 2.25a2.625 2.625 0 11-5.25 0 2.625 2.625 0 015.25 0z" },
    { label: "إجمالي الطلبات", value: totalApplications, color: "bg-purple-100 text-purple-600", icon: "M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" },
    { label: "قيد المراجعة", value: pendingApplications, color: "bg-yellow-100 text-yellow-600", icon: "M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" },
    { label: "مقبول", value: acceptedApplications, color: "bg-green-100 text-green-600", icon: "M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" },
    { label: "مرفوض", value: rejectedApplications, color: "bg-red-100 text-red-600", icon: "M9.75 9.75l4.5 4.5m0-4.5l-4.5 4.5M21 12a9 9 0 11-18 0 9 9 0 0118 0z" },
    { label: "المحافظات", value: totalGovernorates, color: "bg-indigo-100 text-indigo-600", icon: "M15 10.5a3 3 0 11-6 0 3 3 0 016 0zM19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1115 0z" },
    { label: "الوحدات", value: totalUnits, color: "bg-amber-100 text-amber-600", icon: "M3.75 21h16.5M4.5 3h15M5.25 3v18m13.5-18v18M9 6.75h1.5m-1.5 3h1.5m-1.5 3h1.5m3-6H15m-1.5 3H15m-1.5 3H15M9 21v-3.375c0-.621.504-1.125 1.125-1.125h3.75c.621 0 1.125.504 1.125 1.125V21" },
  ];

  const statusConfig: Record<string, { label: string; className: string }> = {
    PENDING: { label: "قيد المراجعة", className: "bg-yellow-100 text-yellow-700" },
    ACCEPTED: { label: "مقبول", className: "bg-green-100 text-green-700" },
    REJECTED: { label: "مرفوض", className: "bg-red-100 text-red-700" },
  };

  return (
    <div className="pt-14 lg:pt-0">
      <div className="mb-6">
        <h1 className="text-xl font-bold text-gray-900">لوحة التحكم</h1>
        <p className="text-sm text-gray-500 mt-1">نظرة عامة على النظام</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 mb-8">
        {stats.map((stat) => (
          <div key={stat.label} className="bg-white rounded-lg p-4 border border-gray-200">
            <div className="flex items-center gap-3">
              <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${stat.color.split(" ")[0]}`}>
                <svg xmlns="http://www.w3.org/2000/svg" className={`h-5 w-5 ${stat.color.split(" ")[1]}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d={stat.icon} />
                </svg>
              </div>
              <div>
                <p className="text-xs text-gray-500">{stat.label}</p>
                <p className="text-lg font-bold text-gray-900">{stat.value}</p>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Latest Applications */}
      <div className="bg-white rounded-lg border border-gray-200">
        <div className="p-6 pb-4 flex items-center justify-between">
          <div>
            <h2 className="text-base font-semibold text-gray-900">آخر الطلبات</h2>
            <p className="text-sm text-gray-500 mt-0.5">أحدث 5 طلبات تم تقديمها</p>
          </div>
          <Link
            href="/admin/applications"
            className="text-sm text-[#1e3a5f] font-medium hover:underline"
          >
            عرض الكل
          </Link>
        </div>

        {latestApplications.length === 0 ? (
          <div className="px-6 pb-6 text-center text-sm text-gray-500">
            لا توجد طلبات بعد
          </div>
        ) : (
          <div className="divide-y divide-gray-200">
            {latestApplications.map((app) => {
              const sc = statusConfig[app.status] || statusConfig.PENDING;
              return (
                <Link
                  key={app.id}
                  href={`/admin/applications/${app.id}`}
                  className="flex items-center justify-between px-6 py-3 hover:bg-gray-50 transition-colors"
                >
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-medium text-gray-900 truncate">{app.fullName}</p>
                    <p className="text-xs text-gray-500">{app.governorate.name} &middot; {new Date(app.submittedAt).toLocaleDateString("ar-EG")}</p>
                  </div>
                  <span className={`inline-block px-2 py-0.5 rounded-full text-xs font-medium ${sc.className}`}>
                    {sc.label}
                  </span>
                </Link>
              );
            })}
          </div>
        )}
      </div>

      {/* Quick Links */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-6">
        <Link href="/admin/members" className="bg-white rounded-lg border border-gray-200 p-4 hover:bg-gray-50 transition-colors text-center">
          <p className="text-sm font-medium text-gray-900">الأعضاء</p>
          <p className="text-xs text-gray-500 mt-1">إدارة الأعضاء</p>
        </Link>
        <Link href="/admin/applications" className="bg-white rounded-lg border border-gray-200 p-4 hover:bg-gray-50 transition-colors text-center">
          <p className="text-sm font-medium text-gray-900">الطلبات</p>
          <p className="text-xs text-gray-500 mt-1">مراجعة الطلبات</p>
        </Link>
        <Link href="/admin/governorates" className="bg-white rounded-lg border border-gray-200 p-4 hover:bg-gray-50 transition-colors text-center">
          <p className="text-sm font-medium text-gray-900">المحافظات</p>
          <p className="text-xs text-gray-500 mt-1">إدارة المحافظات</p>
        </Link>
        <Link href="/admin/units" className="bg-white rounded-lg border border-gray-200 p-4 hover:bg-gray-50 transition-colors text-center">
          <p className="text-sm font-medium text-gray-900">الوحدات</p>
          <p className="text-xs text-gray-500 mt-1">إدارة الوحدات</p>
        </Link>
      </div>
    </div>
  );
}
