"use client";

import { useState, useEffect, useCallback } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import type { Event, Member } from "@prisma/client";
import Spinner from "@/components/ui/Spinner";
import Button from "@/components/ui/Button";
import Pagination from "@/components/ui/Pagination";
import { getCategoryLabel } from "@/lib/data/events";

interface AttendanceRecord {
  id: string;
  scannedAt: string;
  member: Pick<Member, "id" | "fullNameAr" | "fullNameEn" | "memberNumber" | "entityName" | "governorate" | "profileImage">;
  scanner: { name: string };
}

interface EventWithCount extends Event {
  _count: { attendances: number };
  creator: { name: string };
}

export default function EventDetailsPage() {
  const params = useParams();
  const eventId = params.id as string;

  const [event, setEvent] = useState<EventWithCount | null>(null);
  const [attendances, setAttendances] = useState<AttendanceRecord[]>([]);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 20,
    total: 0,
    totalPages: 0,
  });
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingAttendance, setIsLoadingAttendance] = useState(true);
  const [search, setSearch] = useState("");

  const fetchEvent = useCallback(async () => {
    try {
      const response = await fetch(`/api/admin/events/${eventId}`);
      const data = await response.json();
      if (data.success) {
        setEvent(data.data);
      }
    } catch (error) {
      console.error("Error fetching event:", error);
    } finally {
      setIsLoading(false);
    }
  }, [eventId]);

  const fetchAttendance = useCallback(async () => {
    setIsLoadingAttendance(true);
    try {
      const params = new URLSearchParams({
        page: pagination.page.toString(),
        limit: pagination.limit.toString(),
      });
      if (search) params.append("search", search);

      const response = await fetch(`/api/admin/events/${eventId}/attendance?${params}`);
      const data = await response.json();
      if (data.success) {
        setAttendances(data.data);
        setPagination(data.pagination);
      }
    } catch (error) {
      console.error("Error fetching attendance:", error);
    } finally {
      setIsLoadingAttendance(false);
    }
  }, [eventId, pagination.page, pagination.limit, search]);

  useEffect(() => {
    fetchEvent();
  }, [fetchEvent]);

  useEffect(() => {
    fetchAttendance();
  }, [fetchAttendance]);

  const formatDate = (date: string | Date) => {
    return new Date(date).toLocaleDateString("ar-EG", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const formatTime = (time: string | Date) => {
    return new Date(time).toLocaleTimeString("ar-EG", {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  if (isLoading) {
    return (
      <div className="pt-14 lg:pt-0 flex items-center justify-center min-h-[400px]">
        <Spinner size="lg" />
      </div>
    );
  }

  if (!event) {
    return (
      <div className="pt-14 lg:pt-0 text-center py-12">
        <h2 className="text-xl font-semibold text-gray-900">الفعالية غير موجودة</h2>
        <Link href="/admin/events" className="text-blue-600 hover:underline mt-2 inline-block">
          العودة للفعاليات
        </Link>
      </div>
    );
  }

  return (
    <div className="pt-14 lg:pt-0">
      {/* Page Header */}
      <div className="mb-6 flex items-center justify-between">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Link href="/admin/events" className="text-gray-500 hover:text-gray-700">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </Link>
            <h1 className="text-xl font-bold text-gray-900">{event.name}</h1>
          </div>
          <p className="text-sm text-gray-500">{event.organizingEntity}</p>
        </div>
        <div className="flex gap-2">
          <Link href={`/admin/events/scan?eventId=${event.id}`}>
            <Button variant="outline">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 ml-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v1m6 11h2m-6 0h-2v4m0-11v3m0 0h.01M12 12h4.01M16 20h4M4 12h4m12 0h.01M5 8h2a1 1 0 001-1V5a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1zm12 0h2a1 1 0 001-1V5a1 1 0 00-1-1h-2a1 1 0 00-1 1v2a1 1 0 001 1zM5 20h2a1 1 0 001-1v-2a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1z" />
              </svg>
              مسح QR
            </Button>
          </Link>
          <Link href={`/admin/events/${event.id}/edit`}>
            <Button>
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 ml-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
              </svg>
              تعديل
            </Button>
          </Link>
        </div>
      </div>

      {/* Event Info Card */}
      <div className="bg-white rounded-lg border border-gray-200 p-6 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div>
            <p className="text-xs text-gray-500 mb-1">التصنيف</p>
            <span className="px-2 py-1 text-sm font-medium bg-blue-100 text-blue-800 rounded-full">
              {getCategoryLabel(event.category)}
            </span>
          </div>
          <div>
            <p className="text-xs text-gray-500 mb-1">التاريخ</p>
            <p className="text-sm font-medium text-gray-900">{formatDate(event.date)}</p>
          </div>
          <div>
            <p className="text-xs text-gray-500 mb-1">الوقت</p>
            <p className="text-sm font-medium text-gray-900">
              {event.startTime}
              {event.endTime && ` - ${event.endTime}`}
            </p>
          </div>
          <div>
            <p className="text-xs text-gray-500 mb-1">المكان</p>
            <p className="text-sm font-medium text-gray-900">{event.location}</p>
          </div>
        </div>
        {event.description && (
          <div className="mt-4 pt-4 border-t border-gray-200">
            <p className="text-xs text-gray-500 mb-1">الوصف</p>
            <p className="text-sm text-gray-700">{event.description}</p>
          </div>
        )}
        <div className="mt-4 pt-4 border-t border-gray-200 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div>
              <p className="text-xs text-gray-500">الحالة</p>
              <span className={`px-2 py-1 text-xs font-medium rounded-full ${event.isActive ? "bg-green-100 text-green-800" : "bg-gray-100 text-gray-800"}`}>
                {event.isActive ? "نشطة" : "منتهية"}
              </span>
            </div>
            <div>
              <p className="text-xs text-gray-500">عدد الحاضرين</p>
              <p className="text-lg font-bold text-gray-900">{event._count.attendances}</p>
            </div>
          </div>
          <div className="text-xs text-gray-500">
            أنشأها: {event.creator.name}
          </div>
        </div>
      </div>

      {/* Attendance List */}
      <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
        <div className="p-4 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <h2 className="font-semibold text-gray-900">قائمة الحاضرين</h2>
            <input
              type="text"
              placeholder="بحث عن عضو..."
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setPagination((prev) => ({ ...prev, page: 1 }));
              }}
              className="px-3 py-1.5 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
        </div>

        {isLoadingAttendance ? (
          <div className="py-12">
            <Spinner size="lg" />
          </div>
        ) : attendances.length === 0 ? (
          <div className="py-12 text-center">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-3">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M15 19.128a9.38 9.38 0 002.625.372 9.337 9.337 0 004.121-.952 4.125 4.125 0 00-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 018.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0111.964-3.07M12 6.375a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0zm8.25 2.25a2.625 2.625 0 11-5.25 0 2.625 2.625 0 015.25 0z" />
              </svg>
            </div>
            <h3 className="font-semibold text-gray-900 mb-1">لا يوجد حاضرين</h3>
            <p className="text-sm text-gray-500">لم يتم تسجيل أي حضور لهذه الفعالية</p>
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">العضو</th>
                    <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">رقم العضوية</th>
                    <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">الوحدة</th>
                    <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">المحافظة</th>
                    <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">وقت الحضور</th>
                    <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">سجله</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {attendances.map((attendance) => (
                    <tr key={attendance.id} className="hover:bg-gray-50">
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full overflow-hidden bg-gray-200 flex-shrink-0">
                            {attendance.member.profileImage ? (
                              <Image
                                src={attendance.member.profileImage}
                                alt={attendance.member.fullNameAr}
                                width={40}
                                height={40}
                                className="w-full h-full object-cover"
                              />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center text-gray-500">
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                                </svg>
                              </div>
                            )}
                          </div>
                          <div>
                            <p className="font-medium text-gray-900">{attendance.member.fullNameAr}</p>
                            <p className="text-xs text-gray-500">{attendance.member.fullNameEn}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-600">{attendance.member.memberNumber}</td>
                      <td className="px-4 py-3 text-sm text-gray-600">{attendance.member.entityName}</td>
                      <td className="px-4 py-3 text-sm text-gray-600">{attendance.member.governorate}</td>
                      <td className="px-4 py-3 text-sm text-gray-600">{formatTime(attendance.scannedAt)}</td>
                      <td className="px-4 py-3 text-sm text-gray-500">{attendance.scanner.name}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {pagination.totalPages > 1 && (
              <div className="p-4 border-t border-gray-200 bg-gray-50">
                <Pagination
                  currentPage={pagination.page}
                  totalPages={pagination.totalPages}
                  onPageChange={(page) => setPagination((prev) => ({ ...prev, page }))}
                />
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
