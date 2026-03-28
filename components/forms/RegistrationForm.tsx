"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { baseMemberSchema, type MemberFormData } from "@/lib/validations/member";
import { governorates } from "@/lib/data/governorates";
import Input from "@/components/ui/Input";
import Select from "@/components/ui/Select";
import RadioGroup from "@/components/ui/RadioGroup";
import FileUpload from "@/components/ui/FileUpload";
import Button from "@/components/ui/Button";

function TagInput({ label, placeholder, tags, onChange }: { label: string; placeholder: string; tags: string[]; onChange: (tags: string[]) => void }) {
  const [input, setInput] = useState("");
  const addTag = () => { const val = input.trim(); if (val && !tags.includes(val)) onChange([...tags, val]); setInput(""); };
  const handleKeyDown = (e: React.KeyboardEvent) => { if (e.key === "Enter" || e.key === ",") { e.preventDefault(); addTag(); } if (e.key === "Backspace" && !input && tags.length > 0) onChange(tags.slice(0, -1)); };
  return (
    <div className="w-full space-y-1.5">
      <label className="block text-sm font-medium text-gray-900">{label}</label>
      <div className="flex flex-wrap gap-1.5 p-2 rounded-md border border-gray-200 min-h-[42px] focus-within:ring-1 focus-within:ring-[#1e3a5f] focus-within:border-[#1e3a5f] transition-colors">
        {tags.map((tag, i) => (
          <span key={i} className="inline-flex items-center gap-1 bg-[#1e3a5f]/10 text-[#1e3a5f] text-xs font-medium px-2 py-1 rounded-full">
            {tag}
            <button type="button" onClick={() => onChange(tags.filter((_, idx) => idx !== i))} className="hover:text-red-600"><svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /></svg></button>
          </span>
        ))}
        <input value={input} onChange={(e) => setInput(e.target.value)} onKeyDown={handleKeyDown} onBlur={addTag} placeholder={tags.length === 0 ? placeholder : ""} className="flex-1 min-w-[120px] outline-none text-sm bg-transparent placeholder:text-gray-400" />
      </div>
      <p className="text-xs text-gray-400">اضغط Enter أو فاصلة للإضافة</p>
    </div>
  );
}

export default function RegistrationForm() {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [profileImage, setProfileImage] = useState<File | null>(null);
  const [imageError, setImageError] = useState<string | null>(null);
  const [generalError, setGeneralError] = useState<string | null>(null);
  const [nationalIdError, setNationalIdError] = useState<string | null>(null);
  const [experienceTags, setExperienceTags] = useState<string[]>([]);
  const [skillTags, setSkillTags] = useState<string[]>([]);

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = useForm<MemberFormData>({
    resolver: zodResolver(baseMemberSchema),
    defaultValues: {
      memberType: undefined,
      governorate: "",
      postgraduateStudy: "none",
      employmentStatus: "not_working",
      academicYear: "",
      phone2: "",
      email: "",
      jobTitle: "",
      employer: "",
    },
  });

  const memberType = watch("memberType");
  const employmentStatus = watch("employmentStatus");

  const onSubmit = async (data: MemberFormData) => {
    setGeneralError(null);
    setImageError(null);
    setNationalIdError(null);

    if (!profileImage) {
      setImageError("الصورة الشخصية مطلوبة");
      return;
    }

    setIsSubmitting(true);

    try {
      const formData = new FormData();
      formData.append("nationalId", data.nationalId);
      formData.append("fullNameAr", data.fullNameAr);
      formData.append("governorate", data.governorate);
      formData.append("memberType", data.memberType);
      formData.append("address", data.address);
      formData.append("phone1", data.phone1);
      if (data.phone2) formData.append("phone2", data.phone2);
      if (data.email) formData.append("email", data.email);
      formData.append("universityName", data.universityName);
      formData.append("facultyName", data.facultyName);
      if (data.academicYear) formData.append("academicYear", data.academicYear);
      formData.append("postgraduateStudy", data.postgraduateStudy);
      formData.append("employmentStatus", data.employmentStatus);
      if (data.jobTitle) formData.append("jobTitle", data.jobTitle);
      if (data.employer) formData.append("employer", data.employer);
      if (experienceTags.length) formData.append("previousExperiences", experienceTags.join("، "));
      if (skillTags.length) formData.append("skills", skillTags.join("، "));
      formData.append("profileImage", profileImage);

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
            } else if (err.field === "nationalId") {
              setNationalIdError(err.message);
            } else if (err.field === "general") {
              setGeneralError(err.message);
            }
          });
        }
        return;
      }

      router.push(`/success?id=${result.memberId}&memberNumber=${result.memberNumber}&nationalId=${result.nationalId}&password=${result.password}`);
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

  const memberTypeOptions = [
    { value: "student", label: "طالب" },
    { value: "graduate", label: "خريج" },
  ];

  const academicYearOptions = [
    { value: "الفرقة الأولى", label: "الفرقة الأولى" },
    { value: "الفرقة الثانية", label: "الفرقة الثانية" },
    { value: "الفرقة الثالثة", label: "الفرقة الثالثة" },
    { value: "الفرقة الرابعة", label: "الفرقة الرابعة" },
    { value: "الفرقة الخامسة", label: "الفرقة الخامسة" },
    { value: "الفرقة السادسة", label: "الفرقة السادسة" },
    { value: "الفرقة السابعة", label: "الفرقة السابعة" },
  ];

  const postgraduateOptions = [
    { value: "none", label: "لا يوجد" },
    { value: "preliminary", label: "تمهيدي" },
    { value: "masters", label: "ماجستير" },
    { value: "doctorate", label: "دكتوراه" },
  ];

  const employmentOptions = [
    { value: "working", label: "أعمل" },
    { value: "not_working", label: "لا أعمل" },
  ];

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      {/* Error Alert */}
      {generalError && (
        <div className="p-3 bg-red-50 border border-red-200 rounded-md text-red-700 text-sm">
          {generalError}
        </div>
      )}

      {/* ============ البيانات الأساسية ============ */}
      <div>
        <h3 className="text-base sm:text-lg font-bold text-[#1e3a5f] mb-3 pb-2 border-b-2 border-[#1e3a5f]/20">
          البيانات الأساسية
        </h3>

        <div className="space-y-4">
          {/* المحافظة */}
          <Select
            label="المحافظة"
            options={governorateOptions}
            placeholder="اختر المحافظة"
            error={errors.governorate?.message}
            required
            {...register("governorate")}
          />

          {/* الأسم رباعي */}
          <Input
            label="الأسم رباعي"
            placeholder="أحمد محمد علي حسن"
            error={errors.fullNameAr?.message}
            required
            {...register("fullNameAr")}
          />

          {/* الرقم القومي */}
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

          {/* العنوان بالتفصيل */}
          <div className="w-full space-y-1.5">
            <label className="block text-sm font-medium text-gray-900">
              العنوان بالتفصيل
              <span className="text-red-500 mr-1">*</span>
            </label>
            <textarea
              placeholder="المحافظة - المدينة - الحي - الشارع - رقم المبنى"
              rows={2}
              className="flex w-full rounded-md border border-gray-200 bg-transparent px-3 py-2 text-sm shadow-sm transition-colors placeholder:text-gray-400 focus:outline-none focus:ring-1 focus:ring-[#1e3a5f] focus:border-[#1e3a5f] disabled:cursor-not-allowed disabled:opacity-50"
              {...register("address")}
            />
            {errors.address?.message && (
              <p className="text-xs text-red-500">{errors.address.message}</p>
            )}
          </div>

          {/* الموبايل (1) و (2) */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              label="الموبايل (1)"
              placeholder="01012345678"
              error={errors.phone1?.message}
              required
              maxLength={11}
              dir="ltr"
              className="text-left"
              {...register("phone1")}
            />
            <Input
              label="الموبايل (2)"
              placeholder="01112345678"
              error={errors.phone2?.message}
              maxLength={11}
              dir="ltr"
              className="text-left"
              {...register("phone2")}
            />
          </div>

          {/* البريد الالكتروني */}
          <Input
            label="البريد الالكتروني"
            placeholder="example@email.com"
            type="email"
            error={errors.email?.message}
            dir="ltr"
            className="text-left"
            {...register("email")}
          />

          {/* الصورة الشخصية */}
          <FileUpload
            label="الصورة الشخصية"
            required
            error={imageError || undefined}
            onChange={setProfileImage}
          />
        </div>
      </div>

      {/* ============ المؤهلات التعليمية ============ */}
      <div>
        <h3 className="text-base sm:text-lg font-bold text-[#1e3a5f] mb-3 pb-2 border-b-2 border-[#1e3a5f]/20">
          المؤهلات التعليمية
        </h3>

        <div className="space-y-4">
          {/* طالب / خريج */}
          <RadioGroup
            label="الحالة"
            options={memberTypeOptions}
            value={memberType}
            onValueChange={(value) => setValue("memberType", value as "student" | "graduate")}
            error={errors.memberType?.message}
            required
          />

          {/* اسم الجامعة و الكلية */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              label="اسم الجامعة"
              placeholder="جامعة القاهرة"
              error={errors.universityName?.message}
              required
              {...register("universityName")}
            />
            <Input
              label="اسم الكلية"
              placeholder="كلية الهندسة"
              error={errors.facultyName?.message}
              required
              {...register("facultyName")}
            />
          </div>

          {/* الفرقة - للطلاب فقط */}
          {memberType === "student" && (
            <Select
              label="الفرقة"
              options={academicYearOptions}
              placeholder="اختر الفرقة"
              error={errors.academicYear?.message}
              required
              {...register("academicYear")}
            />
          )}

          {/* الدراسات العليا */}
          <RadioGroup
            label="الدراسات العليا"
            options={postgraduateOptions}
            value={watch("postgraduateStudy")}
            onValueChange={(value) => setValue("postgraduateStudy", value as "none" | "preliminary" | "masters" | "doctorate")}
            error={errors.postgraduateStudy?.message}
          />
        </div>
      </div>

      {/* ============ الحالة الوظيفية ============ */}
      <div>
        <h3 className="text-base sm:text-lg font-bold text-[#1e3a5f] mb-3 pb-2 border-b-2 border-[#1e3a5f]/20">
          الحالة الوظيفية
        </h3>

        <div className="space-y-4">
          <RadioGroup
            label=""
            options={employmentOptions}
            value={employmentStatus}
            onValueChange={(value) => setValue("employmentStatus", value as "working" | "not_working")}
            error={errors.employmentStatus?.message}
          />

          {employmentStatus === "working" && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Input
                label="المسمى الوظيفي"
                placeholder="مثال: مهندس برمجيات"
                error={errors.jobTitle?.message}
                required
                {...register("jobTitle")}
              />
              <Input
                label="جهة العمل"
                placeholder="مثال: شركة ..."
                error={errors.employer?.message}
                required
                {...register("employer")}
              />
            </div>
          )}
        </div>
      </div>

      {/* ============ الخبرات والمهارات ============ */}
      <div>
        <h3 className="text-base sm:text-lg font-bold text-[#1e3a5f] mb-3 pb-2 border-b-2 border-[#1e3a5f]/20">
          الخبرات والمهارات
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <TagInput label="الخبرات السابقة" placeholder="اكتب واضغط Enter..." tags={experienceTags} onChange={setExperienceTags} />
          <TagInput label="المهارات" placeholder="اكتب واضغط Enter..." tags={skillTags} onChange={setSkillTags} />
        </div>
      </div>

      {/* الإقرار */}
      <div className="p-4 bg-[#1e3a5f]/5 border border-[#1e3a5f]/20 rounded-lg text-sm text-gray-700 text-center leading-relaxed">
        أقرّ أنا الموقع أدناه بصحة كافة البيانات الواردة في استمارة العضوية، وأتعهد بالالتزام بجميع القوانين واللوائح المنظمة لعمل اتحاد بشبابها.
      </div>

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

      <div className="mt-6 pt-6 border-t border-gray-200 text-center">
        <p className="text-gray-600 text-sm">
          لديك حساب بالفعل؟{" "}
          <Link href="/login" className="text-[#1e3a5f] font-semibold hover:underline">
            سجل دخولك
          </Link>
        </p>
      </div>
    </form>
  );
}
