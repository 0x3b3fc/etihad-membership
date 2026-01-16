"use client";

import { useState, useEffect } from "react";
import Spinner from "@/components/ui/Spinner";
import MembersByGovernorateChart from "@/components/charts/MembersByGovernorateChart";
import MemberTypeChart from "@/components/charts/MemberTypeChart";
import AttendanceTrendChart from "@/components/charts/AttendanceTrendChart";

interface StatsData {
  totalMembers: number;
  todayNew: number;
  weekNew: number;
  monthNew: number;
  totalEvents: number;
  totalAttendance: number;
  membersByGovernorate: { governorate: string; count: number }[];
  memberTypeDistribution: { student: number; graduate: number };
  attendanceTrend: { date: string; count: number }[];
}

export default function AdminDashboardPage() {
  const [stats, setStats] = useState<StatsData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const response = await fetch("/api/admin/stats");
        const data = await response.json();

        if (data.success) {
          setStats(data.data);
        } else {
          setError(data.message);
        }
      } catch {
        setError("حدث خطأ في جلب البيانات");
      } finally {
        setIsLoading(false);
      }
    };

    fetchStats();
  }, []);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <Spinner size="lg" />
          <p className="text-gray-500 mt-3">جاري تحميل الإحصائيات...</p>
        </div>
      </div>
    );
  }

  if (error || !stats) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
        <p className="text-red-700">{error || "حدث خطأ في جلب البيانات"}</p>
      </div>
    );
  }

  return (
    <div className="pt-14 lg:pt-0 space-y-6">
      {/* Page Header */}
      <div>
        <h1 className="text-xl sm:text-2xl font-bold text-gray-900">لوحة المعلومات</h1>
        <p className="text-sm text-gray-500 mt-1">نظرة عامة على إحصائيات النظام</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Members */}
        <div className="bg-white rounded-xl p-4 sm:p-5 border border-gray-200 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 sm:w-12 sm:h-12 bg-blue-100 rounded-xl flex items-center justify-center flex-shrink-0">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 sm:h-6 sm:w-6 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M15 19.128a9.38 9.38 0 002.625.372 9.337 9.337 0 004.121-.952 4.125 4.125 0 00-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 018.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0111.964-3.07M12 6.375a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0zm8.25 2.25a2.625 2.625 0 11-5.25 0 2.625 2.625 0 015.25 0z" />
              </svg>
            </div>
            <div className="min-w-0">
              <p className="text-xs sm:text-sm text-gray-500 truncate">إجمالي الأعضاء</p>
              <p className="text-lg sm:text-2xl font-bold text-gray-900">{stats.totalMembers.toLocaleString("ar-EG")}</p>
            </div>
          </div>
        </div>

        {/* Today New */}
        <div className="bg-white rounded-xl p-4 sm:p-5 border border-gray-200 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 sm:w-12 sm:h-12 bg-green-100 rounded-xl flex items-center justify-center flex-shrink-0">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 sm:h-6 sm:w-6 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M18 7.5v3m0 0v3m0-3h3m-3 0h-3m-2.25-4.125a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0zM3 19.235v-.11a6.375 6.375 0 0112.75 0v.109A12.318 12.318 0 019.374 21c-2.331 0-4.512-.645-6.374-1.766z" />
              </svg>
            </div>
            <div className="min-w-0">
              <p className="text-xs sm:text-sm text-gray-500 truncate">جدد اليوم</p>
              <p className="text-lg sm:text-2xl font-bold text-gray-900">{stats.todayNew.toLocaleString("ar-EG")}</p>
            </div>
          </div>
        </div>

        {/* Total Events */}
        <div className="bg-white rounded-xl p-4 sm:p-5 border border-gray-200 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 sm:w-12 sm:h-12 bg-purple-100 rounded-xl flex items-center justify-center flex-shrink-0">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 sm:h-6 sm:w-6 text-purple-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0v-7.5A2.25 2.25 0 015.25 9h13.5A2.25 2.25 0 0121 11.25v7.5" />
              </svg>
            </div>
            <div className="min-w-0">
              <p className="text-xs sm:text-sm text-gray-500 truncate">الفعاليات</p>
              <p className="text-lg sm:text-2xl font-bold text-gray-900">{stats.totalEvents.toLocaleString("ar-EG")}</p>
            </div>
          </div>
        </div>

        {/* Total Attendance */}
        <div className="bg-white rounded-xl p-4 sm:p-5 border border-gray-200 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 sm:w-12 sm:h-12 bg-orange-100 rounded-xl flex items-center justify-center flex-shrink-0">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 sm:h-6 sm:w-6 text-orange-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div className="min-w-0">
              <p className="text-xs sm:text-sm text-gray-500 truncate">إجمالي الحضور</p>
              <p className="text-lg sm:text-2xl font-bold text-gray-900">{stats.totalAttendance.toLocaleString("ar-EG")}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Secondary Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
        <div className="bg-gradient-to-br from-[#1e3a5f] to-[#4a90a4] rounded-xl p-4 text-white">
          <p className="text-xs sm:text-sm opacity-80">جدد هذا الأسبوع</p>
          <p className="text-xl sm:text-2xl font-bold mt-1">{stats.weekNew.toLocaleString("ar-EG")}</p>
        </div>
        <div className="bg-gradient-to-br from-[#1e3a5f] to-[#4a90a4] rounded-xl p-4 text-white">
          <p className="text-xs sm:text-sm opacity-80">جدد هذا الشهر</p>
          <p className="text-xl sm:text-2xl font-bold mt-1">{stats.monthNew.toLocaleString("ar-EG")}</p>
        </div>
        <div className="bg-gradient-to-br from-[#1e3a5f] to-[#4a90a4] rounded-xl p-4 text-white col-span-2 sm:col-span-1">
          <p className="text-xs sm:text-sm opacity-80">المحافظات</p>
          <p className="text-xl sm:text-2xl font-bold mt-1">27</p>
        </div>
      </div>

      {/* Members by Governorate Chart */}
      <div className="bg-white rounded-xl border border-gray-200 p-4 sm:p-6 shadow-sm">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 013 19.875v-6.75zM9.75 8.625c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v11.25c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V8.625zM16.5 4.125c0-.621.504-1.125 1.125-1.125h2.25C20.496 3 21 3.504 21 4.125v15.75c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V4.125z" />
            </svg>
          </div>
          <div>
            <h2 className="text-base sm:text-lg font-bold text-gray-900">الأعضاء حسب المحافظة</h2>
            <p className="text-xs sm:text-sm text-gray-500">أعلى 10 محافظات</p>
          </div>
        </div>
        <MembersByGovernorateChart data={stats.membersByGovernorate} />
      </div>

      {/* Bottom Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Member Type Distribution */}
        <div className="bg-white rounded-xl border border-gray-200 p-4 sm:p-6 shadow-sm">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-purple-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 6a7.5 7.5 0 107.5 7.5h-7.5V6z" />
                <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 10.5H21A7.5 7.5 0 0013.5 3v7.5z" />
              </svg>
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-bold text-gray-900">توزيع نوع العضوية</h2>
              <p className="text-xs sm:text-sm text-gray-500">طلاب vs خريجين</p>
            </div>
          </div>
          <MemberTypeChart data={stats.memberTypeDistribution} />
        </div>

        {/* Attendance Trend */}
        <div className="bg-white rounded-xl border border-gray-200 p-4 sm:p-6 shadow-sm">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-orange-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 18L9 11.25l4.306 4.307a11.95 11.95 0 015.814-5.519l2.74-1.22m0 0l-5.94-2.28m5.94 2.28l-2.28 5.941" />
              </svg>
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-bold text-gray-900">الحضور خلال 30 يوم</h2>
              <p className="text-xs sm:text-sm text-gray-500">تطور الحضور في الفعاليات</p>
            </div>
          </div>
          <AttendanceTrendChart data={stats.attendanceTrend} />
        </div>
      </div>
    </div>
  );
}
