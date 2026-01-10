"use client";

import { useState, useEffect, useCallback } from "react";
import Spinner from "@/components/ui/Spinner";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";
import DeleteConfirmModal from "@/components/ui/DeleteConfirmModal";

interface Admin {
  id: string;
  email: string;
  name: string;
  createdAt: string;
}

export default function AdminUsersPage() {
  const [admins, setAdmins] = useState<Admin[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [adminToDelete, setAdminToDelete] = useState<Admin | null>(null);
  const [adminToEdit, setAdminToEdit] = useState<Admin | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  // Form state
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    name: "",
  });

  const fetchAdmins = useCallback(async () => {
    try {
      const response = await fetch("/api/admin/users");
      const data = await response.json();

      if (data.success) {
        setAdmins(data.data);
      }
    } catch (error) {
      console.error("Error fetching admins:", error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchAdmins();
  }, [fetchAdmins]);

  const handleAddAdmin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsSaving(true);

    try {
      const response = await fetch("/api/admin/users", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (data.success) {
        setSuccess("تم إضافة المسؤول بنجاح");
        setShowAddModal(false);
        setFormData({ email: "", password: "", name: "" });
        fetchAdmins();
        setTimeout(() => setSuccess(null), 3000);
      } else {
        setError(data.message);
      }
    } catch {
      setError("حدث خطأ في الاتصال بالخادم");
    } finally {
      setIsSaving(false);
    }
  };

  const handleEditAdmin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!adminToEdit) return;
    setError(null);
    setIsSaving(true);

    try {
      const response = await fetch(`/api/admin/users/${adminToEdit.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: formData.email,
          name: formData.name,
          password: formData.password || undefined,
        }),
      });

      const data = await response.json();

      if (data.success) {
        setSuccess("تم تحديث بيانات المسؤول بنجاح");
        setShowEditModal(false);
        setAdminToEdit(null);
        setFormData({ email: "", password: "", name: "" });
        fetchAdmins();
        setTimeout(() => setSuccess(null), 3000);
      } else {
        setError(data.message);
      }
    } catch {
      setError("حدث خطأ في الاتصال بالخادم");
    } finally {
      setIsSaving(false);
    }
  };

  const handleDeleteAdmin = async () => {
    if (!adminToDelete) return;
    setIsDeleting(true);

    try {
      const response = await fetch(`/api/admin/users/${adminToDelete.id}`, {
        method: "DELETE",
      });

      const data = await response.json();

      if (data.success) {
        setSuccess("تم حذف المسؤول بنجاح");
        setAdminToDelete(null);
        fetchAdmins();
        setTimeout(() => setSuccess(null), 3000);
      } else {
        setError(data.message);
        setAdminToDelete(null);
        setTimeout(() => setError(null), 3000);
      }
    } catch {
      setError("حدث خطأ في الاتصال بالخادم");
      setAdminToDelete(null);
    } finally {
      setIsDeleting(false);
    }
  };

  const openEditModal = (admin: Admin) => {
    setAdminToEdit(admin);
    setFormData({
      email: admin.email,
      name: admin.name,
      password: "",
    });
    setShowEditModal(true);
  };

  return (
    <div className="pt-14 lg:pt-0">
      {/* Page Header */}
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-gray-900">إدارة المسؤولين</h1>
          <p className="text-sm text-gray-500 mt-1">إضافة وتعديل وحذف مسؤولي النظام</p>
        </div>
        <Button onClick={() => setShowAddModal(true)}>
          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 ml-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          إضافة مسؤول
        </Button>
      </div>

      {/* Messages */}
      {success && (
        <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded-lg text-green-700 text-sm">
          {success}
        </div>
      )}
      {error && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
          {error}
        </div>
      )}

      {/* Admins Table */}
      <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
        {isLoading ? (
          <div className="py-12">
            <Spinner size="lg" />
            <p className="text-center text-gray-500 mt-3 text-sm">جاري تحميل البيانات...</p>
          </div>
        ) : admins.length === 0 ? (
          <div className="py-12 text-center">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-3">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285z" />
              </svg>
            </div>
            <h3 className="font-semibold text-gray-900 mb-1">لا يوجد مسؤولين</h3>
            <p className="text-sm text-gray-500">قم بإضافة مسؤول جديد للنظام</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200 bg-gray-50">
                  <th className="text-right py-3 px-4 font-medium text-gray-600 text-sm">الاسم</th>
                  <th className="text-right py-3 px-4 font-medium text-gray-600 text-sm">البريد الإلكتروني</th>
                  <th className="text-right py-3 px-4 font-medium text-gray-600 text-sm">تاريخ الإضافة</th>
                  <th className="text-right py-3 px-4 font-medium text-gray-600 text-sm">الإجراءات</th>
                </tr>
              </thead>
              <tbody>
                {admins.map((admin) => (
                  <tr key={admin.id} className="border-b border-gray-200 hover:bg-gray-50">
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-[#1e3a5f] rounded-full flex items-center justify-center">
                          <span className="text-white font-medium text-sm">
                            {admin.name.charAt(0)}
                          </span>
                        </div>
                        <span className="font-medium text-gray-900">{admin.name}</span>
                      </div>
                    </td>
                    <td className="py-3 px-4 text-gray-600">
                      <span dir="ltr" className="inline-block text-left">{admin.email}</span>
                    </td>
                    <td className="py-3 px-4 text-gray-600 text-sm">
                      {new Date(admin.createdAt).toLocaleDateString("ar-EG", {
                        year: "numeric",
                        month: "short",
                        day: "numeric",
                      })}
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => openEditModal(admin)}
                          className="p-2 text-green-600 hover:bg-green-50 rounded-lg transition-colors"
                          title="تعديل"
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                          </svg>
                        </button>
                        <button
                          onClick={() => setAdminToDelete(admin)}
                          className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                          title="حذف"
                          disabled={admins.length <= 1}
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                          </svg>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Footer Info */}
      <div className="mt-4 text-xs text-gray-500">
        إجمالي المسؤولين: {admins.length}
      </div>

      {/* Add Admin Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm" onClick={() => setShowAddModal(false)} />
          <div className="relative bg-white rounded-xl shadow-2xl max-w-md w-full mx-4 p-6">
            <h3 className="text-lg font-bold text-gray-900 mb-4">إضافة مسؤول جديد</h3>
            <form onSubmit={handleAddAdmin} className="space-y-4">
              <Input
                label="الاسم"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="اسم المسؤول"
                required
              />
              <Input
                label="البريد الإلكتروني"
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                placeholder="admin@example.com"
                dir="ltr"
                className="text-left"
                required
              />
              <Input
                label="كلمة المرور"
                type="password"
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                placeholder="••••••••"
                dir="ltr"
                className="text-left"
                required
              />
              <div className="flex gap-3 pt-2">
                <Button type="submit" isLoading={isSaving} className="flex-1">
                  إضافة
                </Button>
                <Button type="button" variant="outline" onClick={() => setShowAddModal(false)}>
                  إلغاء
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Admin Modal */}
      {showEditModal && adminToEdit && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm" onClick={() => setShowEditModal(false)} />
          <div className="relative bg-white rounded-xl shadow-2xl max-w-md w-full mx-4 p-6">
            <h3 className="text-lg font-bold text-gray-900 mb-4">تعديل بيانات المسؤول</h3>
            <form onSubmit={handleEditAdmin} className="space-y-4">
              <Input
                label="الاسم"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="اسم المسؤول"
                required
              />
              <Input
                label="البريد الإلكتروني"
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                placeholder="admin@example.com"
                dir="ltr"
                className="text-left"
                required
              />
              <Input
                label="كلمة المرور الجديدة (اختياري)"
                type="password"
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                placeholder="اتركه فارغاً للإبقاء على كلمة المرور الحالية"
                dir="ltr"
                className="text-left"
              />
              <div className="flex gap-3 pt-2">
                <Button type="submit" isLoading={isSaving} className="flex-1">
                  حفظ التعديلات
                </Button>
                <Button type="button" variant="outline" onClick={() => setShowEditModal(false)}>
                  إلغاء
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      <DeleteConfirmModal
        isOpen={!!adminToDelete}
        title="حذف المسؤول"
        message="هل أنت متأكد من حذف هذا المسؤول؟"
        itemName={adminToDelete?.name}
        isDeleting={isDeleting}
        onConfirm={handleDeleteAdmin}
        onCancel={() => setAdminToDelete(null)}
      />
    </div>
  );
}
