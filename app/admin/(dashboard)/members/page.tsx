"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import type { Member } from "@prisma/client";
import Spinner from "@/components/ui/Spinner";
import Button from "@/components/ui/Button";
import Pagination from "@/components/ui/Pagination";
import SearchFilter from "@/components/forms/SearchFilter";
import MemberTable from "@/components/display/MemberTable";
import QRCodeDisplay from "@/components/display/QRCodeDisplay";
import DeleteConfirmModal from "@/components/ui/DeleteConfirmModal";

interface MembersResponse {
  success: boolean;
  data: Member[];
  stats: {
    todayNew: number;
  };
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export default function AdminMembersPage() {
  const [members, setMembers] = useState<Member[]>([]);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 0,
  });
  const [isLoading, setIsLoading] = useState(true);
  const [isExporting, setIsExporting] = useState(false);
  const [search, setSearch] = useState("");
  const [governorate, setGovernorate] = useState("");
  const [entityName, setEntityName] = useState("");
  const [selectedMember, setSelectedMember] = useState<Member | null>(null);
  const [memberToDelete, setMemberToDelete] = useState<Member | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [todayNew, setTodayNew] = useState(0);

  const fetchMembers = useCallback(async () => {
    setIsLoading(true);
    try {
      const params = new URLSearchParams({
        page: pagination.page.toString(),
        limit: pagination.limit.toString(),
      });

      if (search) params.append("search", search);
      if (governorate) params.append("governorate", governorate);
      if (entityName) params.append("entityName", entityName);

      const response = await fetch(`/api/admin/members?${params}`);
      const data: MembersResponse = await response.json();

      if (data.success) {
        setMembers(data.data);
        setPagination(data.pagination);
        setTodayNew(data.stats?.todayNew ?? 0);
      }
    } catch (error) {
      console.error("Error fetching members:", error);
    } finally {
      setIsLoading(false);
    }
  }, [pagination.page, pagination.limit, search, governorate, entityName]);

  useEffect(() => {
    fetchMembers();
  }, [fetchMembers]);

  const handleSearch = useCallback((value: string) => {
    setSearch(value);
    setPagination((prev) => ({ ...prev, page: 1 }));
  }, []);

  const handleFilter = useCallback((value: string) => {
    setGovernorate(value);
    setPagination((prev) => ({ ...prev, page: 1 }));
  }, []);

  const handleEntityFilter = useCallback((value: string) => {
    setEntityName(value);
    setPagination((prev) => ({ ...prev, page: 1 }));
  }, []);

  const handleExport = async () => {
    setIsExporting(true);
    try {
      // Build export URL with current filters
      const params = new URLSearchParams();
      if (search) params.append("search", search);
      if (governorate) params.append("governorate", governorate);
      if (entityName) params.append("entityName", entityName);

      const response = await fetch(`/api/admin/export-excel?${params}`);
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      const governorateSuffix = governorate ? `-${governorate}` : "";
      const entitySuffix = entityName ? `-${entityName}` : "";
      a.download = `أعضاء-الاتحاد${governorateSuffix}${entitySuffix}-${new Date().toISOString().split("T")[0]}.xlsx`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (error) {
      console.error("Error exporting:", error);
    } finally {
      setIsExporting(false);
    }
  };

  const handlePageChange = (page: number) => {
    setPagination((prev) => ({ ...prev, page }));
  };

  const handleDeleteMember = async () => {
    if (!memberToDelete) return;

    setIsDeleting(true);
    try {
      const response = await fetch(`/api/admin/members/${memberToDelete.id}`, {
        method: "DELETE",
      });
      const data = await response.json();

      if (data.success) {
        setMemberToDelete(null);
        fetchMembers(); // Refresh the list
      } else {
        console.error("Error deleting member:", data.message);
      }
    } catch (error) {
      console.error("Error deleting member:", error);
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="pt-14 lg:pt-0">
      {/* Page Header */}
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-gray-900">إدارة الأعضاء</h1>
          <p className="text-sm text-gray-500 mt-1">عرض وإدارة جميع أعضاء الاتحاد المسجلين</p>
        </div>
        <Link href="/admin/members/add">
          <Button>
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 ml-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            إضافة عضو
          </Button>
        </Link>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
        <div className="bg-white rounded-lg p-4 border border-gray-200">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M15 19.128a9.38 9.38 0 002.625.372 9.337 9.337 0 004.121-.952 4.125 4.125 0 00-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 018.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0111.964-3.07M12 6.375a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0zm8.25 2.25a2.625 2.625 0 11-5.25 0 2.625 2.625 0 015.25 0z" />
              </svg>
            </div>
            <div>
              <p className="text-xs text-gray-500">إجمالي الأعضاء</p>
              <p className="text-lg font-bold text-gray-900">{pagination.total}</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-lg p-4 border border-gray-200">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div>
              <p className="text-xs text-gray-500">أعضاء جدد اليوم</p>
              <p className="text-lg font-bold text-gray-900">{todayNew}</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-lg p-4 border border-gray-200">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-purple-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M15 10.5a3 3 0 11-6 0 3 3 0 016 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1115 0z" />
              </svg>
            </div>
            <div>
              <p className="text-xs text-gray-500">المحافظات</p>
              <p className="text-lg font-bold text-gray-900">27</p>
            </div>
          </div>
        </div>
      </div>

      {/* Search & Filter */}
      <div className="bg-white rounded-lg border border-gray-200 p-4 mb-6">
        <SearchFilter
          onSearch={handleSearch}
          onFilter={handleFilter}
          onEntityFilter={handleEntityFilter}
          onExport={handleExport}
          isExporting={isExporting}
        />
      </div>

      {/* Members Table */}
      <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
        {isLoading ? (
          <div className="py-12">
            <Spinner size="lg" />
            <p className="text-center text-gray-500 mt-3 text-sm">جاري تحميل البيانات...</p>
          </div>
        ) : members.length === 0 ? (
          <div className="py-12 text-center">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-3">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M15 19.128a9.38 9.38 0 002.625.372 9.337 9.337 0 004.121-.952 4.125 4.125 0 00-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 018.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0111.964-3.07M12 6.375a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0zm8.25 2.25a2.625 2.625 0 11-5.25 0 2.625 2.625 0 015.25 0z" />
              </svg>
            </div>
            <h3 className="font-semibold text-gray-900 mb-1">لا يوجد أعضاء</h3>
            <p className="text-sm text-gray-500">لم يتم العثور على أي أعضاء مطابقين لمعايير البحث</p>
          </div>
        ) : (
          <>
            <MemberTable members={members} onViewQR={setSelectedMember} onDelete={setMemberToDelete} />

            {pagination.totalPages > 1 && (
              <div className="p-4 border-t border-gray-200 bg-gray-50">
                <Pagination
                  currentPage={pagination.page}
                  totalPages={pagination.totalPages}
                  onPageChange={handlePageChange}
                />
              </div>
            )}
          </>
        )}
      </div>

      {/* Footer Info */}
      <div className="mt-4 flex items-center justify-between text-xs text-gray-500">
        <span>
          عرض {members.length} من {pagination.total} عضو
        </span>
        <span>
          الصفحة {pagination.page} من {pagination.totalPages || 1}
        </span>
      </div>

      {/* QR Code Modal */}
      {selectedMember && (
        <QRCodeDisplay
          qrCode={selectedMember.qrCode}
          memberName={selectedMember.fullNameAr}
          onClose={() => setSelectedMember(null)}
        />
      )}

      {/* Delete Confirmation Modal */}
      <DeleteConfirmModal
        isOpen={!!memberToDelete}
        title="حذف العضو"
        message="هل أنت متأكد من حذف هذا العضو؟"
        itemName={memberToDelete?.fullNameAr}
        isDeleting={isDeleting}
        onConfirm={handleDeleteMember}
        onCancel={() => setMemberToDelete(null)}
      />
    </div>
  );
}
