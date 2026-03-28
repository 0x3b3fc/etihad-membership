"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { governorates } from "@/lib/data/governorates";
import { entities, memberTypes } from "@/lib/data/entities";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";
import Select from "@/components/ui/Select";
import RadioGroup from "@/components/ui/RadioGroup";
import FileUpload from "@/components/ui/FileUpload";

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
    address: "",
    phone1: "",
    phone2: "",
    email: "",
    memberType: "" as "student" | "graduate" | "",
    universityName: "",
    facultyName: "",
    academicYear: "",
    postgraduateStudy: "none",
    employmentStatus: "not_working",
    jobTitle: "",
    employer: "",
    entityName: "",
    role: "",
  });

  const [experienceTags, setExperienceTags] = useState<string[]>([]);
  const [skillTags, setSkillTags] = useState<string[]>([]);

  const set = (field: string, value: string) => setFormData((prev) => ({ ...prev, [field]: value }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setImageError(null);

    if (!profileImage) { setImageError("الصورة الشخصية مطلوبة"); return; }
    if (!formData.memberType) {
      setError("يرجى ملء جميع الحقول المطلوبة");
      return;
    }

    setIsSubmitting(true);

    try {
      const submitData = new FormData();
      // Required fields
      submitData.append("nationalId", formData.nationalId);
      submitData.append("fullNameAr", formData.fullNameAr);
      submitData.append("governorate", formData.governorate);
      submitData.append("memberType", formData.memberType);
      submitData.append("entityName", formData.entityName || `${formData.universityName} - ${formData.facultyName}`);
      submitData.append("role", formData.role);
      submitData.append("profileImage", profileImage);

      // Optional fields
      if (formData.fullNameEn) submitData.append("fullNameEn", formData.fullNameEn);
      if (formData.address) submitData.append("address", formData.address);
      if (formData.phone1) submitData.append("phone1", formData.phone1);
      if (formData.phone2) submitData.append("phone2", formData.phone2);
      if (formData.email) submitData.append("email", formData.email);
      if (formData.universityName) submitData.append("universityName", formData.universityName);
      if (formData.facultyName) submitData.append("facultyName", formData.facultyName);
      if (formData.academicYear) submitData.append("academicYear", formData.academicYear);
      if (formData.postgraduateStudy) submitData.append("postgraduateStudy", formData.postgraduateStudy);
      if (formData.employmentStatus) submitData.append("employmentStatus", formData.employmentStatus);
      if (formData.jobTitle) submitData.append("jobTitle", formData.jobTitle);
      if (formData.employer) submitData.append("employer", formData.employer);
      if (experienceTags.length) submitData.append("previousExperiences", experienceTags.join("، "));
      if (skillTags.length) submitData.append("skills", skillTags.join("، "));

      const response = await fetch("/api/register", { method: "POST", body: submitData });
      const result = await response.json();

      if (!result.success) {
        if (result.errors) {
          setError(result.errors.map((err: { message: string }) => err.message).join("، "));
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

  const governorateOptions = governorates.map((gov) => ({ value: gov, label: gov }));
  const memberTypeOptions = memberTypes.map((t) => ({ value: t.value, label: t.label }));
  const entityOptions = entities.map((e) => ({ value: e, label: e }));
  const academicYearOptions = ["الأولى","الثانية","الثالثة","الرابعة","الخامسة","السادسة","السابعة"].map(y => ({ value: `الفرقة ${y}`, label: `الفرقة ${y}` }));
  const postgraduateOptions = [
    { value: "none", label: "لا يوجد" }, { value: "preliminary", label: "تمهيدي" },
    { value: "masters", label: "ماجستير" }, { value: "doctorate", label: "دكتوراه" },
  ];
  const employmentOptions = [{ value: "working", label: "أعمل" }, { value: "not_working", label: "لا أعمل" }];

  return (
    <div className="pt-14 lg:pt-0 max-w-3xl mx-auto">
      {/* Header */}
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-gray-900">إضافة عضو جديد</h1>
          <p className="text-sm text-gray-500 mt-1">أكمل البيانات التالية لإضافة عضو جديد</p>
        </div>
        <Link href="/admin/members">
          <Button variant="outline">العودة للقائمة</Button>
        </Link>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {error && (
          <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">{error}</div>
        )}

        {/* ============ البيانات الأساسية ============ */}
        <div>
          <h3 className="text-base sm:text-lg font-bold text-[#1e3a5f] mb-3 pb-2 border-b-2 border-[#1e3a5f]/20">
            البيانات الأساسية
          </h3>
          <div className="space-y-4">
            <Select label="المحافظة" options={governorateOptions} placeholder="اختر المحافظة" value={formData.governorate} onChange={(e) => set("governorate", e.target.value)} required />
            <Input label="الأسم رباعي بالعربي" placeholder="أحمد محمد علي حسن" value={formData.fullNameAr} onChange={(e) => set("fullNameAr", e.target.value)} required />
            <Input label="الأسم بالإنجليزي" placeholder="Ahmed Mohamed Ali Hassan" value={formData.fullNameEn} onChange={(e) => set("fullNameEn", e.target.value)} dir="ltr" className="text-left" />
            <Input label="الرقم القومي" placeholder="00000000000000" value={formData.nationalId} onChange={(e) => set("nationalId", e.target.value)} required maxLength={14} dir="ltr" className="text-left" />
            <div className="w-full space-y-1.5">
              <label className="block text-sm font-medium text-gray-900">العنوان بالتفصيل</label>
              <textarea placeholder="المحافظة - المدينة - الحي - الشارع - رقم المبنى" rows={2} value={formData.address} onChange={(e) => set("address", e.target.value)} className="flex w-full rounded-md border border-gray-200 bg-transparent px-3 py-2 text-sm shadow-sm transition-colors placeholder:text-gray-400 focus:outline-none focus:ring-1 focus:ring-[#1e3a5f] focus:border-[#1e3a5f]" />
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Input label="الموبايل (1)" placeholder="01012345678" value={formData.phone1} onChange={(e) => set("phone1", e.target.value)} maxLength={11} dir="ltr" className="text-left" />
              <Input label="الموبايل (2)" placeholder="01112345678" value={formData.phone2} onChange={(e) => set("phone2", e.target.value)} maxLength={11} dir="ltr" className="text-left" />
            </div>
            <Input label="البريد الالكتروني" placeholder="example@email.com" type="email" value={formData.email} onChange={(e) => set("email", e.target.value)} dir="ltr" className="text-left" />
            <FileUpload label="الصورة الشخصية" required error={imageError || undefined} onChange={setProfileImage} />
          </div>
        </div>

        {/* ============ المؤهلات التعليمية ============ */}
        <div>
          <h3 className="text-base sm:text-lg font-bold text-[#1e3a5f] mb-3 pb-2 border-b-2 border-[#1e3a5f]/20">
            المؤهلات التعليمية
          </h3>
          <div className="space-y-4">
            <RadioGroup label="الحالة" options={memberTypeOptions} value={formData.memberType} onValueChange={(v) => set("memberType", v)} required />
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Input label="اسم الجامعة" placeholder="جامعة القاهرة" value={formData.universityName} onChange={(e) => set("universityName", e.target.value)} required />
              <Input label="اسم الكلية" placeholder="كلية الهندسة" value={formData.facultyName} onChange={(e) => set("facultyName", e.target.value)} required />
            </div>
            {formData.memberType === "student" && (
              <Select label="الفرقة" options={academicYearOptions} placeholder="اختر الفرقة" value={formData.academicYear} onChange={(e) => set("academicYear", e.target.value)} required />
            )}
            <RadioGroup label="الدراسات العليا" options={postgraduateOptions} value={formData.postgraduateStudy} onValueChange={(v) => set("postgraduateStudy", v)} />
          </div>
        </div>

        {/* ============ الحالة الوظيفية ============ */}
        <div>
          <h3 className="text-base sm:text-lg font-bold text-[#1e3a5f] mb-3 pb-2 border-b-2 border-[#1e3a5f]/20">
            الحالة الوظيفية
          </h3>
          <div className="space-y-4">
            <RadioGroup label="" options={employmentOptions} value={formData.employmentStatus} onValueChange={(v) => set("employmentStatus", v)} />
            {formData.employmentStatus === "working" && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Input label="المسمى الوظيفي" placeholder="مثال: مهندس برمجيات" value={formData.jobTitle} onChange={(e) => set("jobTitle", e.target.value)} required />
                <Input label="جهة العمل" placeholder="مثال: شركة ..." value={formData.employer} onChange={(e) => set("employer", e.target.value)} required />
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

        {/* ============ الصفة داخل الاتحاد ============ */}
        <div>
          <h3 className="text-base sm:text-lg font-bold text-[#1e3a5f] mb-3 pb-2 border-b-2 border-[#1e3a5f]/20">
            الصفة داخل الاتحاد
          </h3>
          <div className="space-y-4">
            <Select label="الوحدة / اللجنة" options={entityOptions} placeholder="اختر الوحدة أو اللجنة" value={formData.entityName} onChange={(e) => set("entityName", e.target.value)} required />
            <Input label="الصفة" placeholder="عضو مجلس إدارة" value={formData.role} onChange={(e) => set("role", e.target.value)} required />
          </div>
        </div>

        {/* Submit */}
        <div className="flex flex-col-reverse sm:flex-row gap-3 pt-2">
          <Link href="/admin/members" className="w-full sm:w-auto">
            <Button type="button" variant="outline" size="lg" className="w-full">إلغاء</Button>
          </Link>
          <Button type="submit" size="lg" className="w-full sm:flex-1" isLoading={isSubmitting}>
            إضافة العضو
          </Button>
        </div>

        <p className="text-center text-xs text-gray-500">
          جميع الحقول المشار إليها بـ <span className="text-red-500">*</span> إلزامية
        </p>
      </form>
    </div>
  );
}
