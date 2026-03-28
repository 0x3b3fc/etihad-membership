"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { governorates } from "@/lib/data/governorates";
import InputComp from "@/components/ui/Input";
import Select from "@/components/ui/Select";
import RadioGroup from "@/components/ui/RadioGroup";
import Button from "@/components/ui/Button";
import Spinner from "@/components/ui/Spinner";

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

export default function ApplyPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [fullName, setFullName] = useState("");
  const [nationalId, setNationalId] = useState("");
  const [governorate, setGovernorate] = useState("");
  const [address, setAddress] = useState("");
  const [phone, setPhone] = useState("");
  const [phone2, setPhone2] = useState("");
  const [email, setEmail] = useState("");
  const [birthDate, setBirthDate] = useState("");
  const [memberType, setMemberType] = useState("");
  const [universityName, setUniversityName] = useState("");
  const [facultyName, setFacultyName] = useState("");
  const [academicYear, setAcademicYear] = useState("");
  const [postgraduateStudy, setPostgraduateStudy] = useState("none");
  const [employmentStatus, setEmploymentStatus] = useState("not_working");
  const [jobTitle, setJobTitle] = useState("");
  const [employer, setEmployer] = useState("");
  const [previousExperiences, setPreviousExperiences] = useState<string[]>([]);
  const [skills, setSkills] = useState<string[]>([]);

  useEffect(() => {
    const load = async () => {
      try {
        const appRes = await fetch("/api/member/application");
        const appData = await appRes.json();
        if (appData.hasApplied) { router.push("/applicant/application"); return; }

        const profRes = await fetch("/api/member/profile");
        const profData = await profRes.json();
        if (profData.success) {
          const m = profData.data;
          setFullName(m.fullNameAr || "");
          setNationalId(m.nationalId || "");
          setGovernorate(m.governorate || "");
          setAddress(m.address || "");
          setPhone(m.phone1 || "");
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
          if (m.previousExperiences) setPreviousExperiences(m.previousExperiences.split("،").map((t: string) => t.trim()).filter(Boolean));
          if (m.skills) setSkills(m.skills.split("،").map((t: string) => t.trim()).filter(Boolean));
        }
      } catch { /* */ }
      finally { setIsLoading(false); }
    };
    load();
  }, [router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsSubmitting(true);
    try {
      const res = await fetch("/api/member/apply", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          fullName, governorateId: governorate, address, phone, phone2, email,
          birthDate: birthDate || undefined, memberType, universityName, facultyName,
          academicYear, postgraduateStudy, employmentStatus,
          jobTitle: employmentStatus === "working" ? jobTitle : "",
          employer: employmentStatus === "working" ? employer : "",
          previousExperiences: previousExperiences.join("، "),
          skills: skills.join("، "),
        }),
      });
      const data = await res.json();
      if (data.success) { router.push("/applicant/application"); }
      else { setError(data.error || "حدث خطأ"); }
    } catch { setError("حدث خطأ في الاتصال بالخادم"); }
    finally { setIsSubmitting(false); }
  };

  if (isLoading) return <div className="flex items-center justify-center min-h-[400px]"><Spinner size="lg" /></div>;

  const governorateOptions = governorates.map((gov) => ({ value: gov, label: gov }));
  const memberTypeOptions = [{ value: "student", label: "طالب" }, { value: "graduate", label: "خريج" }];
  const academicYearOptions = ["الأولى","الثانية","الثالثة","الرابعة","الخامسة","السادسة","السابعة"].map(y => ({ value: `الفرقة ${y}`, label: `الفرقة ${y}` }));
  const postgraduateOptions = [{ value: "none", label: "لا يوجد" }, { value: "preliminary", label: "تمهيدي" }, { value: "masters", label: "ماجستير" }, { value: "doctorate", label: "دكتوراه" }];
  const employmentOptions = [{ value: "working", label: "أعمل" }, { value: "not_working", label: "لا أعمل" }];

  return (
    <div className="max-w-2xl mx-auto">
      <div className="text-center mb-6">
        <h1 className="text-xl font-bold text-gray-900">طلب انضمام للاتحاد</h1>
        <p className="text-sm text-gray-500 mt-1">أكمل البيانات التالية لتقديم طلب الانضمام</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {error && <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">{error}</div>}

        {/* البيانات الأساسية */}
        <div>
          <h3 className="text-base sm:text-lg font-bold text-[#1e3a5f] mb-3 pb-2 border-b-2 border-[#1e3a5f]/20">البيانات الأساسية</h3>
          <div className="space-y-4">
            <Select label="المحافظة" options={governorateOptions} placeholder="اختر المحافظة" value={governorate} onChange={(e) => setGovernorate(e.target.value)} required />
            <InputComp label="الأسم رباعي" placeholder="أحمد محمد علي حسن" value={fullName} onChange={(e) => setFullName(e.target.value)} required />
            <InputComp label="الرقم القومي" value={nationalId} readOnly dir="ltr" className="text-left bg-gray-50" />
            <div className="w-full space-y-1.5">
              <label className="block text-sm font-medium text-gray-900">العنوان بالتفصيل <span className="text-red-500">*</span></label>
              <textarea placeholder="المحافظة - المدينة - الحي - الشارع" rows={2} value={address} onChange={(e) => setAddress(e.target.value)} required className="flex w-full rounded-md border border-gray-200 bg-transparent px-3 py-2 text-sm shadow-sm transition-colors placeholder:text-gray-400 focus:outline-none focus:ring-1 focus:ring-[#1e3a5f] focus:border-[#1e3a5f]" />
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <InputComp label="الموبايل (1)" placeholder="01012345678" value={phone} onChange={(e) => setPhone(e.target.value)} required maxLength={11} dir="ltr" className="text-left" />
              <InputComp label="الموبايل (2)" placeholder="01112345678" value={phone2} onChange={(e) => setPhone2(e.target.value)} maxLength={11} dir="ltr" className="text-left" />
            </div>
            <InputComp label="البريد الالكتروني" placeholder="example@email.com" type="email" value={email} onChange={(e) => setEmail(e.target.value)} dir="ltr" className="text-left" />
            <InputComp label="تاريخ الميلاد" type="date" value={birthDate} onChange={(e) => setBirthDate(e.target.value)} required dir="ltr" className="text-left" />
          </div>
        </div>

        {/* المؤهلات التعليمية */}
        <div>
          <h3 className="text-base sm:text-lg font-bold text-[#1e3a5f] mb-3 pb-2 border-b-2 border-[#1e3a5f]/20">المؤهلات التعليمية</h3>
          <div className="space-y-4">
            <RadioGroup label="الحالة" options={memberTypeOptions} value={memberType} onValueChange={setMemberType} required />
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <InputComp label="اسم الجامعة" placeholder="جامعة القاهرة" value={universityName} onChange={(e) => setUniversityName(e.target.value)} required />
              <InputComp label="اسم الكلية" placeholder="كلية الهندسة" value={facultyName} onChange={(e) => setFacultyName(e.target.value)} required />
            </div>
            {memberType === "student" && <Select label="الفرقة" options={academicYearOptions} placeholder="اختر الفرقة" value={academicYear} onChange={(e) => setAcademicYear(e.target.value)} required />}
            <RadioGroup label="الدراسات العليا" options={postgraduateOptions} value={postgraduateStudy} onValueChange={setPostgraduateStudy} />
          </div>
        </div>

        {/* الحالة الوظيفية */}
        <div>
          <h3 className="text-base sm:text-lg font-bold text-[#1e3a5f] mb-3 pb-2 border-b-2 border-[#1e3a5f]/20">الحالة الوظيفية</h3>
          <div className="space-y-4">
            <RadioGroup label="" options={employmentOptions} value={employmentStatus} onValueChange={setEmploymentStatus} />
            {employmentStatus === "working" && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <InputComp label="المسمى الوظيفي" placeholder="مثال: مهندس برمجيات" value={jobTitle} onChange={(e) => setJobTitle(e.target.value)} required />
                <InputComp label="جهة العمل" placeholder="مثال: شركة ..." value={employer} onChange={(e) => setEmployer(e.target.value)} required />
              </div>
            )}
          </div>
        </div>

        {/* الخبرات والمهارات */}
        <div>
          <h3 className="text-base sm:text-lg font-bold text-[#1e3a5f] mb-3 pb-2 border-b-2 border-[#1e3a5f]/20">الخبرات والمهارات</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <TagInput label="الخبرات السابقة" placeholder="اكتب واضغط Enter..." tags={previousExperiences} onChange={setPreviousExperiences} />
            <TagInput label="المهارات" placeholder="اكتب واضغط Enter..." tags={skills} onChange={setSkills} />
          </div>
        </div>

        {/* الإقرار */}
        <div className="p-4 bg-[#1e3a5f]/5 border border-[#1e3a5f]/20 rounded-lg text-sm text-gray-700 text-center leading-relaxed">
          أقرّ أنا الموقع أدناه بصحة كافة البيانات الواردة في الطلب، وأتعهد بالالتزام بجميع القوانين واللوائح المنظمة لعمل اتحاد بشبابها.
        </div>

        <Button type="submit" size="lg" className="w-full" isLoading={isSubmitting}>
          تقديم الطلب
        </Button>
      </form>
    </div>
  );
}
