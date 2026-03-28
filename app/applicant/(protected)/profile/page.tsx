"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import { governorates } from "@/lib/data/governorates";
import Input from "@/components/ui/Input";
import Select from "@/components/ui/Select";
import RadioGroup from "@/components/ui/RadioGroup";
import FileUpload from "@/components/ui/FileUpload";
import Button from "@/components/ui/Button";
import Spinner from "@/components/ui/Spinner";

function TagInput({
  label,
  placeholder,
  tags,
  onChange,
}: {
  label: string;
  placeholder: string;
  tags: string[];
  onChange: (tags: string[]) => void;
}) {
  const [input, setInput] = useState("");

  const addTag = () => {
    const val = input.trim();
    if (val && !tags.includes(val)) {
      onChange([...tags, val]);
    }
    setInput("");
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" || e.key === ",") {
      e.preventDefault();
      addTag();
    }
    if (e.key === "Backspace" && !input && tags.length > 0) {
      onChange(tags.slice(0, -1));
    }
  };

  const removeTag = (index: number) => {
    onChange(tags.filter((_, i) => i !== index));
  };

  return (
    <div className="w-full space-y-1.5">
      <label className="block text-sm font-medium text-gray-900">{label}</label>
      <div className="flex flex-wrap gap-1.5 p-2 rounded-md border border-gray-200 min-h-[42px] focus-within:ring-1 focus-within:ring-[#1e3a5f] focus-within:border-[#1e3a5f] transition-colors">
        {tags.map((tag, i) => (
          <span
            key={i}
            className="inline-flex items-center gap-1 bg-[#1e3a5f]/10 text-[#1e3a5f] text-xs font-medium px-2 py-1 rounded-full"
          >
            {tag}
            <button
              type="button"
              onClick={() => removeTag(i)}
              className="hover:text-red-600 transition-colors"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </span>
        ))}
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          onBlur={addTag}
          placeholder={tags.length === 0 ? placeholder : ""}
          className="flex-1 min-w-[120px] outline-none text-sm bg-transparent placeholder:text-gray-400"
        />
      </div>
      <p className="text-xs text-gray-400">اضغط Enter أو فاصلة للإضافة</p>
    </div>
  );
}

export default function ProfilePage() {
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  // Read-only
  const [profileImage, setProfileImage] = useState("");
  const [memberNumber, setMemberNumber] = useState("");
  const [nationalId, setNationalId] = useState("");
  const [createdAt, setCreatedAt] = useState("");

  // Editable
  const [fullNameAr, setFullNameAr] = useState("");
  const [fullNameEn, setFullNameEn] = useState("");
  const [governorate, setGovernorate] = useState("");
  const [address, setAddress] = useState("");
  const [phone1, setPhone1] = useState("");
  const [phone2, setPhone2] = useState("");
  const [email, setEmail] = useState("");
  const [memberType, setMemberType] = useState("");
  const [universityName, setUniversityName] = useState("");
  const [facultyName, setFacultyName] = useState("");
  const [academicYear, setAcademicYear] = useState("");
  const [postgraduateStudy, setPostgraduateStudy] = useState("none");
  const [employmentStatus, setEmploymentStatus] = useState("not_working");
  const [jobTitle, setJobTitle] = useState("");
  const [employer, setEmployer] = useState("");
  const [previousExperiences, setPreviousExperiences] = useState("");
  const [skills, setSkills] = useState("");
  const [role, setRole] = useState("");
  const [newProfileImage, setNewProfileImage] = useState<File | null>(null);

  useEffect(() => {
    const load = async () => {
      try {
        const res = await fetch("/api/member/profile");
        const data = await res.json();
        if (data.success) {
          const m = data.data;
          setProfileImage(m.profileImage || "");
          setMemberNumber(m.memberNumber || "");
          setNationalId(m.nationalId || "");
          setCreatedAt(m.createdAt || "");
          setFullNameAr(m.fullNameAr || "");
          setFullNameEn(m.fullNameEn || "");
          setGovernorate(m.governorate || "");
          setAddress(m.address || "");
          setPhone1(m.phone1 || "");
          setPhone2(m.phone2 || "");
          setEmail(m.email || "");
          setMemberType(m.memberType || "");
          const parts = (m.entityName || "").split(" - ");
          setUniversityName(parts[0] || "");
          setFacultyName(parts.length >= 2 ? parts[1] : "");
          setAcademicYear(m.academicYear || "");
          setPostgraduateStudy(m.postgraduateStudy || "none");
          setEmploymentStatus(m.employmentStatus || "not_working");
          setJobTitle(m.jobTitle || "");
          setEmployer(m.employer || "");
          setPreviousExperiences(m.previousExperiences || "");
          setSkills(m.skills || "");
          setRole(m.role || "");
        }
      } catch { /* */ }
      finally { setIsLoading(false); }
    };
    load();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    setMessage(null);

    try {
      // Upload new profile image if selected
      let updatedProfileImage = profileImage;
      if (newProfileImage) {
        const formData = new FormData();
        formData.append("file", newProfileImage);
        const uploadRes = await fetch("/api/upload", { method: "POST", body: formData });
        const uploadData = await uploadRes.json();
        if (uploadData.url) {
          updatedProfileImage = uploadData.url;
        }
      }

      const res = await fetch("/api/member/profile", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          fullNameAr,
          fullNameEn,
          governorate,
          address,
          phone1,
          phone2,
          email,
          memberType,
          entityName: facultyName ? `${universityName} - ${facultyName}` : universityName,
          academicYear,
          postgraduateStudy,
          employmentStatus,
          jobTitle: employmentStatus === "working" ? jobTitle : "",
          employer: employmentStatus === "working" ? employer : "",
          previousExperiences,
          skills,
          role,
          profileImage: updatedProfileImage,
        }),
      });
      const data = await res.json();
      if (data.success) {
        setMessage({ type: "success", text: data.message });
        if (updatedProfileImage !== profileImage) {
          setProfileImage(updatedProfileImage);
        }
      } else {
        setMessage({ type: "error", text: data.error || "حدث خطأ" });
      }
    } catch {
      setMessage({ type: "error", text: "حدث خطأ في الاتصال بالخادم" });
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Spinner size="lg" />
      </div>
    );
  }

  const governorateOptions = governorates.map((gov) => ({ value: gov, label: gov }));
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
    <div className="max-w-2xl mx-auto">
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Message */}
        {message && (
          <div className={`p-3 rounded-lg text-sm ${
            message.type === "success"
              ? "bg-green-50 text-green-700 border border-green-200"
              : "bg-red-50 text-red-700 border border-red-200"
          }`}>
            {message.text}
          </div>
        )}

        {/* ============ بيانات العضوية ============ */}
        <div>
          <h3 className="text-base sm:text-lg font-bold text-[#1e3a5f] mb-3 pb-2 border-b-2 border-[#1e3a5f]/20">
            بيانات العضوية
          </h3>

          <div className="flex items-center gap-4 mb-4">
            <div className="h-20 w-20 rounded-full overflow-hidden bg-gray-100 flex-shrink-0 border-2 border-gray-200">
              {profileImage ? (
                <Image src={profileImage} alt={fullNameAr} width={80} height={80} className="h-full w-full object-cover" />
              ) : (
                <div className="h-full w-full flex items-center justify-center">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z" />
                  </svg>
                </div>
              )}
            </div>
            <div>
              <h2 className="text-lg font-semibold text-gray-900">{fullNameAr}</h2>
              <span className="inline-block mt-1 px-2.5 py-0.5 bg-[#1e3a5f]/10 text-[#1e3a5f] rounded text-xs font-mono font-medium" dir="ltr">
                {memberNumber}
              </span>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input label="رقم العضوية" value={memberNumber} readOnly dir="ltr" className="text-left bg-gray-50" />
            <Input label="الرقم القومي" value={nationalId} readOnly dir="ltr" className="text-left bg-gray-50" />
            <Input label="تاريخ التسجيل" value={createdAt ? new Date(createdAt).toLocaleDateString("ar-EG") : ""} readOnly className="bg-gray-50" />
          </div>
        </div>

        {/* ============ البيانات الأساسية ============ */}
        <div>
          <h3 className="text-base sm:text-lg font-bold text-[#1e3a5f] mb-3 pb-2 border-b-2 border-[#1e3a5f]/20">
            البيانات الأساسية
          </h3>

          <div className="space-y-4">
            <Select
              label="المحافظة"
              options={governorateOptions}
              placeholder="اختر المحافظة"
              value={governorate}
              onChange={(e) => setGovernorate(e.target.value)}
              required
            />

            <Input
              label="الأسم رباعي"
              placeholder="أحمد محمد علي حسن"
              value={fullNameAr}
              onChange={(e) => setFullNameAr(e.target.value)}
              required
            />

            <Input
              label="الأسم بالإنجليزي"
              value={fullNameEn}
              onChange={(e) => setFullNameEn(e.target.value)}
              dir="ltr"
              className="text-left"
            />

            <div className="w-full space-y-1.5">
              <label className="block text-sm font-medium text-gray-900">
                العنوان بالتفصيل
              </label>
              <textarea
                placeholder="المحافظة - المدينة - الحي - الشارع - رقم المبنى"
                rows={2}
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                className="flex w-full rounded-md border border-gray-200 bg-transparent px-3 py-2 text-sm shadow-sm transition-colors placeholder:text-gray-400 focus:outline-none focus:ring-1 focus:ring-[#1e3a5f] focus:border-[#1e3a5f]"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Input
                label="الموبايل (1)"
                placeholder="01012345678"
                value={phone1}
                onChange={(e) => setPhone1(e.target.value)}
                maxLength={11}
                dir="ltr"
                className="text-left"
              />
              <Input
                label="الموبايل (2)"
                placeholder="01112345678"
                value={phone2}
                onChange={(e) => setPhone2(e.target.value)}
                maxLength={11}
                dir="ltr"
                className="text-left"
              />
            </div>

            <Input
              label="البريد الالكتروني"
              placeholder="example@email.com"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              dir="ltr"
              className="text-left"
            />

            <FileUpload
              label="تغيير الصورة الشخصية"
              onChange={setNewProfileImage}
            />
          </div>
        </div>

        {/* ============ المؤهلات التعليمية ============ */}
        <div>
          <h3 className="text-base sm:text-lg font-bold text-[#1e3a5f] mb-3 pb-2 border-b-2 border-[#1e3a5f]/20">
            المؤهلات التعليمية
          </h3>

          <div className="space-y-4">
            <RadioGroup
              label="الحالة"
              options={memberTypeOptions}
              value={memberType}
              onValueChange={(value) => setMemberType(value)}
              required
            />

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Input
                label="اسم الجامعة"
                placeholder="جامعة القاهرة"
                value={universityName}
                onChange={(e) => setUniversityName(e.target.value)}
                required
              />
              <Input
                label="اسم الكلية"
                placeholder="كلية الهندسة"
                value={facultyName}
                onChange={(e) => setFacultyName(e.target.value)}
                required
              />
            </div>

            {memberType === "student" && (
              <Select
                label="الفرقة"
                options={academicYearOptions}
                placeholder="اختر الفرقة"
                value={academicYear}
                onChange={(e) => setAcademicYear(e.target.value)}
                required
              />
            )}

            <RadioGroup
              label="الدراسات العليا"
              options={postgraduateOptions}
              value={postgraduateStudy}
              onValueChange={(value) => setPostgraduateStudy(value)}
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
              onValueChange={(value) => setEmploymentStatus(value)}
            />

            {employmentStatus === "working" && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Input
                  label="المسمى الوظيفي"
                  placeholder="مثال: مهندس برمجيات"
                  value={jobTitle}
                  onChange={(e) => setJobTitle(e.target.value)}
                  required
                />
                <Input
                  label="جهة العمل"
                  placeholder="مثال: شركة ..."
                  value={employer}
                  onChange={(e) => setEmployer(e.target.value)}
                  required
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
            <TagInput
              label="الخبرات السابقة"
              placeholder="اكتب واضغط Enter للإضافة..."
              tags={previousExperiences ? previousExperiences.split("،").map(t => t.trim()).filter(Boolean) : []}
              onChange={(tags) => setPreviousExperiences(tags.join("، "))}
            />
            <TagInput
              label="المهارات"
              placeholder="اكتب واضغط Enter للإضافة..."
              tags={skills ? skills.split("،").map(t => t.trim()).filter(Boolean) : []}
              onChange={(tags) => setSkills(tags.join("، "))}
            />
          </div>
        </div>

        {/* ============ الصفة داخل الاتحاد ============ */}
        <div>
          <h3 className="text-base sm:text-lg font-bold text-[#1e3a5f] mb-3 pb-2 border-b-2 border-[#1e3a5f]/20">
            الصفة داخل الاتحاد
          </h3>

          <div className="space-y-4">
            <Input
              label="الصفة"
              value={role}
              onChange={(e) => setRole(e.target.value)}
              placeholder="مثال: عضو، رئيس وحدة..."
            />
          </div>
        </div>

        {/* Submit */}
        <Button type="submit" size="lg" className="w-full" isLoading={isSaving}>
          حفظ التغييرات
        </Button>

        <p className="text-center text-xs text-gray-500">
          الحقول ذات الخلفية الرمادية للقراءة فقط ولا يمكن تعديلها
        </p>
      </form>
    </div>
  );
}
