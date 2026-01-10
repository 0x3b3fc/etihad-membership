"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { memberSchema, type MemberFormData } from "@/lib/validations/member";
import { governorates } from "@/lib/data/governorates";
import { entities, memberTypes, paymentInfo } from "@/lib/data/entities";
import Input from "@/components/ui/Input";
import Select from "@/components/ui/Select";
import RadioGroup from "@/components/ui/RadioGroup";
import FileUpload from "@/components/ui/FileUpload";
import Button from "@/components/ui/Button";

export default function RegistrationForm() {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [profileImage, setProfileImage] = useState<File | null>(null);
  const [paymentReceipt, setPaymentReceipt] = useState<File | null>(null);
  const [imageError, setImageError] = useState<string | null>(null);
  const [receiptError, setReceiptError] = useState<string | null>(null);
  const [generalError, setGeneralError] = useState<string | null>(null);
  const [nationalIdError, setNationalIdError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = useForm<MemberFormData>({
    resolver: zodResolver(memberSchema),
    defaultValues: {
      paymentMethod: undefined,
      memberType: undefined,
      entityName: "",
    },
  });

  const paymentMethod = watch("paymentMethod");
  const memberType = watch("memberType");

  const onSubmit = async (data: MemberFormData) => {
    setGeneralError(null);
    setImageError(null);
    setReceiptError(null);
    setNationalIdError(null);

    if (!profileImage) {
      setImageError("الصورة الشخصية مطلوبة");
      return;
    }

    if (!paymentReceipt) {
      setReceiptError("صورة إيصال الدفع مطلوبة");
      return;
    }

    setIsSubmitting(true);

    try {
      const formData = new FormData();
      formData.append("nationalId", data.nationalId);
      formData.append("fullNameAr", data.fullNameAr);
      formData.append("fullNameEn", data.fullNameEn);
      formData.append("governorate", data.governorate);
      formData.append("memberType", data.memberType);
      formData.append("entityName", data.entityName);
      formData.append("role", data.role);
      formData.append("paymentMethod", data.paymentMethod);
      formData.append("profileImage", profileImage);
      formData.append("paymentReceipt", paymentReceipt);

      if (data.coordinatorName) {
        formData.append("coordinatorName", data.coordinatorName);
      }
      if (data.instapayRef) {
        formData.append("instapayRef", data.instapayRef);
      }

      const response = await fetch("/api/register", {
        method: "POST",
        body: formData,
      });

      const result = await response.json();

      if (!result.success) {
        if (result.errors) {
          result.errors.forEach((err: { field: string; message: string }) => {
            if (err.field === "profileImage") {
              setImageError(err.message);
            } else if (err.field === "paymentReceipt") {
              setReceiptError(err.message);
            } else if (err.field === "nationalId") {
              setNationalIdError(err.message);
            } else if (err.field === "general") {
              setGeneralError(err.message);
            }
          });
        }
        return;
      }

      router.push(`/success?id=${result.memberId}`);
    } catch {
      setGeneralError("حدث خطأ أثناء التسجيل، يرجى المحاولة مرة أخرى");
    } finally {
      setIsSubmitting(false);
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

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      {/* Error Alert */}
      {generalError && (
        <div className="p-3 bg-red-50 border border-red-200 rounded-md text-red-700 text-sm">
          {generalError}
        </div>
      )}

      {/* National ID */}
      <Input
        label="الرقم القومي"
        placeholder="00000000000000"
        error={errors.nationalId?.message || nationalIdError || undefined}
        required
        maxLength={14}
        dir="ltr"
        className="text-left"
        {...register("nationalId")}
      />

      {/* Name Fields */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Input
          label="الاسم الرباعي بالعربية"
          placeholder="محمد أحمد محمد علي"
          error={errors.fullNameAr?.message}
          required
          {...register("fullNameAr")}
        />

        <Input
          label="الاسم الرباعي بالإنجليزية"
          placeholder="Mohamed Ahmed Mohamed Ali"
          error={errors.fullNameEn?.message}
          required
          dir="ltr"
          className="text-left"
          {...register("fullNameEn")}
        />
      </div>

      {/* Governorate */}
      <Select
        label="المحافظة"
        options={governorateOptions}
        placeholder="اختر المحافظة"
        error={errors.governorate?.message}
        required
        {...register("governorate")}
      />

      {/* Member Type */}
      <RadioGroup
        label="نوع العضو"
        options={memberTypeOptions}
        value={memberType}
        onValueChange={(value) => setValue("memberType", value as "student" | "graduate")}
        error={errors.memberType?.message}
        required
      />

      {/* Entity Name */}
      <Select
        label="الوحدة / اللجنة"
        options={entityOptions}
        placeholder="اختر الوحدة أو اللجنة"
        error={errors.entityName?.message}
        required
        {...register("entityName")}
      />

      {/* Role */}
      <Input
        label="الصفة داخل الاتحاد"
        placeholder="عضو مجلس إدارة"
        error={errors.role?.message}
        required
        {...register("role")}
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
        value={paymentMethod}
        onValueChange={(value) => setValue("paymentMethod", value as "coordinator" | "instapay")}
        error={errors.paymentMethod?.message}
        required
      />

      {/* Conditional Fields */}
      {paymentMethod === "coordinator" && (
        <Input
          label="اسم منسق المحافظة"
          placeholder="أدخل اسم المنسق"
          error={errors.coordinatorName?.message}
          required
          {...register("coordinatorName")}
        />
      )}

      {paymentMethod === "instapay" && (
        <Input
          label="الرقم المرجعي Instapay"
          placeholder="أدخل الرقم المرجعي"
          error={errors.instapayRef?.message}
          required
          {...register("instapayRef")}
        />
      )}

      {/* Membership Fees Info */}
      <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg text-sm">
        <h4 className="font-semibold text-blue-900 mb-2">رسوم العضوية:</h4>
        <ul className="text-blue-800 space-y-1 mb-3">
          <li>• الطالب: {paymentInfo.studentFee}</li>
          <li>• الخريج: {paymentInfo.graduateFee}</li>
        </ul>
        <p className="text-blue-900">
          لسداد رسوم العضوية يتم السداد على رقم الحساب التالي:
        </p>
        <p className="font-mono font-bold text-blue-900 text-lg mt-1" dir="ltr">
          {paymentInfo.accountNumber}
        </p>
      </div>

      {/* Payment Receipt */}
      <FileUpload
        label="صورة إيصال الدفع"
        required
        error={receiptError || undefined}
        onChange={setPaymentReceipt}
      />

      {/* Submit Button */}
      <Button
        type="submit"
        size="lg"
        className="w-full"
        isLoading={isSubmitting}
      >
        تسجيل العضوية
      </Button>

      <p className="text-center text-xs text-gray-500">
        جميع الحقول المشار إليها بـ <span className="text-red-500">*</span> إلزامية
      </p>
    </form>
  );
}
