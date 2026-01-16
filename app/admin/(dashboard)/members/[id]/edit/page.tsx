"use client";

import { useState, useEffect, use } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import type { Member } from "@prisma/client";
import { governorates } from "@/lib/data/governorates";
import { entities, memberTypes } from "@/lib/data/entities";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";
import Select from "@/components/ui/Select";
import RadioGroup from "@/components/ui/RadioGroup";
import Spinner from "@/components/ui/Spinner";

interface EditMemberPageProps {
  params: Promise<{ id: string }>;
}

export default function EditMemberPage({ params }: EditMemberPageProps) {
  const { id } = use(params);
  const router = useRouter();
  const [member, setMember] = useState<Member | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  // Form state
  const [formData, setFormData] = useState({
    fullNameAr: "",
    fullNameEn: "",
    nationalId: "",
    governorate: "",
    memberType: "" as "student" | "graduate" | "",
    entityName: "",
    role: "",
    paymentMethod: "" as "coordinator" | "instapay" | "",
    coordinatorName: "",
    instapayRef: "",
  });

  useEffect(() => {
    const fetchMember = async () => {
      try {
        const response = await fetch(`/api/admin/members/${id}`);
        const data = await response.json();

        if (data.success) {
          setMember(data.data);
          setFormData({
            fullNameAr: data.data.fullNameAr,
            fullNameEn: data.data.fullNameEn,
            nationalId: data.data.nationalId,
            governorate: data.data.governorate,
            memberType: data.data.memberType,
            entityName: data.data.entityName || "",
            role: data.data.role,
            paymentMethod: data.data.paymentMethod,
            coordinatorName: data.data.coordinatorName || "",
            instapayRef: data.data.instapayRef || "",
          });
        } else {
          setError(data.message || "حدث خطأ في تحميل البيانات");
        }
      } catch {
        setError("حدث خطأ في الاتصال بالخادم");
      } finally {
        setIsLoading(false);
      }
    };

    fetchMember();
  }, [id]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);
    setIsSaving(true);

    try {
      const response = await fetch(`/api/admin/members/${id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (data.success) {
        setSuccess("تم تحديث البيانات بنجاح");
        setTimeout(() => {
          router.push(`/admin/members/${id}`);
        }, 1500);
      } else {
        setError(data.message || "حدث خطأ أثناء التحديث");
      }
    } catch {
      setError("حدث خطأ في الاتصال بالخادم");
    } finally {
      setIsSaving(false);
    }
  };

  const governorateOptions = governorates.map((gov) => ({
    value: gov,
    label: gov,
  }));

  const memberTypeOptions = memberTypes.map((type) => ({
    value: type.value,
    label: type.label,
  }));

  const entityOptions = entities.map((entity) => ({
    value: entity,
    label: entity,
  }));

  const paymentOptions = [
    { value: "coordinator", label: "منسق المحافظة" },
    { value: "instapay", label: "Instapay" },
  ];

  if (isLoading) {
    return (
      <div className="pt-14 lg:pt-0 flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <Spinner size="lg" />
          <p className="mt-3 text-gray-500">جاري تحميل البيانات...</p>
        </div>
      </div>
    );
  }

  if (!member) {
    return (
      <div className="pt-14 lg:pt-0">
        <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
          <p className="text-red-700">{error || "العضو غير موجود"}</p>
          <Link href="/admin/members" className="text-[#1e3a5f] hover:underline mt-2 inline-block">
            العودة للقائمة
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="pt-14 lg:pt-0">
      {/* Page Header */}
      <div className="mb-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h1 className="text-xl font-bold text-gray-900">تعديل بيانات العضو</h1>
          <p className="text-sm text-gray-500 mt-1 truncate max-w-[250px] sm:max-w-none">تعديل بيانات {member.fullNameAr}</p>
        </div>
        <Link href={`/admin/members/${id}`} className="self-start sm:self-auto">
          <Button variant="outline" className="w-full sm:w-auto">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 ml-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            العودة
          </Button>
        </Link>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Profile Preview */}
        <div className="lg:col-span-1 order-first lg:order-none">
          <div className="bg-white rounded-lg border border-gray-200 p-6 text-center lg:sticky lg:top-6">
            <div className="w-24 h-24 mx-auto mb-4 relative">
              <Image
                src={member.profileImage}
                alt={member.fullNameAr}
                fill
                className="rounded-full object-cover"
              />
            </div>
            <h3 className="font-bold text-gray-900">{member.fullNameAr}</h3>
            <p className="text-sm text-gray-500 mb-2" dir="ltr">{member.fullNameEn}</p>
            <span className="inline-block px-3 py-1 bg-[#1e3a5f]/10 text-[#1e3a5f] rounded-full text-xs font-mono" dir="ltr">
              {member.memberNumber}
            </span>
          </div>
        </div>

        {/* Edit Form */}
        <div className="lg:col-span-2">
          <form onSubmit={handleSubmit} className="bg-white rounded-lg border border-gray-200 p-6">
            {/* Messages */}
            {error && (
              <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
                {error}
              </div>
            )}
            {success && (
              <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded-lg text-green-700 text-sm">
                {success}
              </div>
            )}

            <div className="space-y-4">
              {/* National ID */}
              <Input
                label="الرقم القومي"
                value={formData.nationalId}
                onChange={(e) => setFormData({ ...formData, nationalId: e.target.value })}
                required
                maxLength={14}
                dir="ltr"
                className="text-left"
              />

              {/* Names */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Input
                  label="الاسم الرباعي بالعربية"
                  value={formData.fullNameAr}
                  onChange={(e) => setFormData({ ...formData, fullNameAr: e.target.value })}
                  required
                />
                <Input
                  label="الاسم الرباعي بالإنجليزية"
                  value={formData.fullNameEn}
                  onChange={(e) => setFormData({ ...formData, fullNameEn: e.target.value })}
                  required
                  dir="ltr"
                  className="text-left"
                />
              </div>

              {/* Governorate */}
              <Select
                label="المحافظة"
                options={governorateOptions}
                value={formData.governorate}
                onChange={(e) => setFormData({ ...formData, governorate: e.target.value })}
                required
              />

              {/* Member Type */}
              <RadioGroup
                label="نوع العضو"
                options={memberTypeOptions}
                value={formData.memberType}
                onValueChange={(value) => setFormData({ ...formData, memberType: value as "student" | "graduate" })}
                required
              />

              {/* Entity Name */}
              <Select
                label="الوحدة / اللجنة"
                options={entityOptions}
                value={formData.entityName}
                onChange={(e) => setFormData({ ...formData, entityName: e.target.value })}
                required
              />

              {/* Role */}
              <Input
                label="الصفة داخل الاتحاد"
                value={formData.role}
                onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                required
              />

              {/* Payment Method */}
              <RadioGroup
                label="طريقة سداد الرسوم"
                options={paymentOptions}
                value={formData.paymentMethod}
                onValueChange={(value) => setFormData({ ...formData, paymentMethod: value as "coordinator" | "instapay" })}
                required
              />

              {/* Conditional Fields */}
              {formData.paymentMethod === "coordinator" && (
                <Input
                  label="اسم منسق المحافظة"
                  value={formData.coordinatorName}
                  onChange={(e) => setFormData({ ...formData, coordinatorName: e.target.value })}
                  required
                />
              )}

              {formData.paymentMethod === "instapay" && (
                <Input
                  label="الرقم المرجعي Instapay"
                  value={formData.instapayRef}
                  onChange={(e) => setFormData({ ...formData, instapayRef: e.target.value })}
                  required
                />
              )}

              {/* Submit Button */}
              <div className="flex flex-col-reverse sm:flex-row gap-3 pt-4">
                <Link href={`/admin/members/${id}`} className="w-full sm:w-auto">
                  <Button type="button" variant="outline" className="w-full">
                    إلغاء
                  </Button>
                </Link>
                <Button type="submit" isLoading={isSaving} className="w-full sm:flex-1">
                  حفظ التعديلات
                </Button>
              </div>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
