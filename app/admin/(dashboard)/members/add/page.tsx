"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { governorates } from "@/lib/data/governorates";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";
import Select from "@/components/ui/Select";
import RadioGroup from "@/components/ui/RadioGroup";
import FileUpload from "@/components/ui/FileUpload";

export default function AddMemberPage() {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [profileImage, setProfileImage] = useState<File | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [imageError, setImageError] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    nationalId: "",
    fullNameAr: "",
    fullNameEn: "",
    governorate: "",
    entityType: "" as "unit" | "committee" | "",
    entityLevel: "" as "central" | "governorate" | "",
    entityName: "",
    role: "",
    paymentMethod: "" as "coordinator" | "instapay" | "",
    coordinatorName: "",
    instapayRef: "",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setImageError(null);

    if (!profileImage) {
      setImageError("الصورة الشخصية مطلوبة");
      return;
    }

    if (!formData.entityType || !formData.entityLevel || !formData.paymentMethod) {
      setError("يرجى ملء جميع الحقول المطلوبة");
      return;
    }

    setIsSubmitting(true);

    try {
      const submitData = new FormData();
      submitData.append("nationalId", formData.nationalId);
      submitData.append("fullNameAr", formData.fullNameAr);
      submitData.append("fullNameEn", formData.fullNameEn);
      submitData.append("governorate", formData.governorate);
      submitData.append("entityType", formData.entityType);
      submitData.append("entityLevel", formData.entityLevel);
      if (formData.entityName) {
        submitData.append("entityName", formData.entityName);
      }
      submitData.append("role", formData.role);
      submitData.append("paymentMethod", formData.paymentMethod);
      submitData.append("profileImage", profileImage);

      if (formData.coordinatorName) {
        submitData.append("coordinatorName", formData.coordinatorName);
      }
      if (formData.instapayRef) {
        submitData.append("instapayRef", formData.instapayRef);
      }

      const response = await fetch("/api/register", {
        method: "POST",
        body: submitData,
      });

      const result = await response.json();

      if (!result.success) {
        if (result.errors) {
          const errorMessages = result.errors.map((err: { message: string }) => err.message).join("، ");
          setError(errorMessages);
        } else {
          setError("حدث خطأ أثناء إضافة العضو");
        }
        return;
      }

      router.push(`/admin/members/${result.memberId}`);
    } catch {
      setError("حدث خطأ في الاتصال بالخادم");
    } finally {
      setIsSubmitting(false);
    }
  };

  const governorateOptions = governorates.map((gov) => ({
    value: gov,
    label: gov,
  }));

  const entityTypeOptions = [
    { value: "unit", label: "وحدة" },
    { value: "committee", label: "لجنة" },
  ];

  const entityLevelOptions = [
    { value: "central", label: "مركزي (على مستوى الجمهورية)" },
    { value: "governorate", label: "محافظة" },
  ];

  const paymentOptions = [
    { value: "coordinator", label: "منسق المحافظة" },
    { value: "instapay", label: "Instapay" },
  ];

  return (
    <div className="pt-14 lg:pt-0">
      {/* Page Header */}
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-gray-900">إضافة عضو جديد</h1>
          <p className="text-sm text-gray-500 mt-1">إضافة عضو جديد للاتحاد</p>
        </div>
        <Link href="/admin/members">
          <Button variant="outline">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 ml-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            العودة للقائمة
          </Button>
        </Link>
      </div>

      {/* Form */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Error Alert */}
          {error && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-md text-red-700 text-sm">
              {error}
            </div>
          )}

          {/* National ID */}
          <Input
            label="الرقم القومي"
            placeholder="00000000000000"
            value={formData.nationalId}
            onChange={(e) => setFormData({ ...formData, nationalId: e.target.value })}
            required
            maxLength={14}
          />

          {/* Name Fields */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              label="الاسم الرباعي بالعربية"
              placeholder="محمد أحمد محمد علي"
              value={formData.fullNameAr}
              onChange={(e) => setFormData({ ...formData, fullNameAr: e.target.value })}
              required
            />

            <Input
              label="الاسم الرباعي بالإنجليزية"
              placeholder="Mohamed Ahmed Mohamed Ali"
              value={formData.fullNameEn}
              onChange={(e) => setFormData({ ...formData, fullNameEn: e.target.value })}
              required
            />
          </div>

          {/* Governorate */}
          <Select
            label="المحافظة"
            options={governorateOptions}
            placeholder="اختر المحافظة"
            value={formData.governorate}
            onChange={(e) => setFormData({ ...formData, governorate: e.target.value })}
            required
          />

          {/* Entity Type & Level */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <RadioGroup
              label="نوع الكيان"
              options={entityTypeOptions}
              value={formData.entityType}
              onValueChange={(value) => setFormData({ ...formData, entityType: value as "unit" | "committee" })}
              required
            />

            <RadioGroup
              label="المستوى"
              options={entityLevelOptions}
              value={formData.entityLevel}
              onValueChange={(value) => setFormData({ ...formData, entityLevel: value as "central" | "governorate" })}
              required
            />
          </div>

          {/* Entity Name */}
          <Input
            label={formData.entityType === "committee" ? "اسم اللجنة" : "اسم الوحدة"}
            placeholder={formData.entityType === "committee" ? "مثال: لجنة الشباب" : "مثال: وحدة التدريب"}
            value={formData.entityName}
            onChange={(e) => setFormData({ ...formData, entityName: e.target.value })}
          />

          {/* Role */}
          <Input
            label="الصفة داخل الاتحاد"
            placeholder="عضو مجلس إدارة"
            value={formData.role}
            onChange={(e) => setFormData({ ...formData, role: e.target.value })}
            required
          />

          {/* Profile Photo */}
          <FileUpload
            label="الصورة الشخصية"
            required
            error={imageError || undefined}
            onChange={setProfileImage}
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
              placeholder="أدخل اسم المنسق"
              value={formData.coordinatorName}
              onChange={(e) => setFormData({ ...formData, coordinatorName: e.target.value })}
              required
            />
          )}

          {formData.paymentMethod === "instapay" && (
            <Input
              label="الرقم المرجعي Instapay"
              placeholder="أدخل الرقم المرجعي"
              value={formData.instapayRef}
              onChange={(e) => setFormData({ ...formData, instapayRef: e.target.value })}
              required
            />
          )}

          {/* Submit Button */}
          <div className="flex gap-3 pt-4">
            <Button
              type="submit"
              size="lg"
              className="flex-1"
              isLoading={isSubmitting}
            >
              إضافة العضو
            </Button>
            <Link href="/admin/members">
              <Button type="button" variant="outline" size="lg">
                إلغاء
              </Button>
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
}
