import { z } from "zod";
import { governorates } from "../data/governorates";

const MAX_FILE_SIZE = 2 * 1024 * 1024; // 2MB
const ACCEPTED_IMAGE_TYPES = ["image/jpeg", "image/jpg", "image/png"];

export const baseMemberSchema = z.object({
  // البيانات الأساسية
  governorate: z
    .string()
    .min(1, "المحافظة مطلوبة")
    .refine((val) => governorates.includes(val as (typeof governorates)[number]), {
      message: "يرجى اختيار محافظة صحيحة",
    }),
  fullNameAr: z
    .string()
    .min(1, "الاسم الرباعي باللغة العربية مطلوب")
    .min(8, "يرجى إدخال الاسم الرباعي كاملاً")
    .regex(/^[\u0600-\u06FF\s]+$/, "يجب أن يكون الاسم باللغة العربية فقط"),
  nationalId: z
    .string()
    .min(1, "الرقم القومي مطلوب")
    .length(14, "الرقم القومي يجب أن يكون 14 رقم")
    .regex(/^\d{14}$/, "الرقم القومي يجب أن يحتوي على أرقام فقط"),
  address: z
    .string()
    .min(1, "العنوان بالتفصيل مطلوب")
    .min(10, "يرجى إدخال العنوان بالتفصيل"),
  phone1: z
    .string()
    .min(1, "رقم الموبايل (1) مطلوب")
    .regex(/^01[0125]\d{8}$/, "رقم الموبايل يجب أن يكون رقم مصري صحيح (01xxxxxxxxx)"),
  phone2: z
    .string()
    .regex(/^01[0125]\d{8}$/, "رقم الموبايل (2) يجب أن يكون رقم مصري صحيح")
    .optional()
    .or(z.literal("")),
  email: z
    .string()
    .email("البريد الالكتروني غير صالح")
    .optional()
    .or(z.literal("")),

  // المؤهلات التعليمية
  memberType: z.enum(["student", "graduate"], {
    message: "يرجى اختيار طالب أو خريج",
  }),
  universityName: z
    .string()
    .min(1, "اسم الجامعة مطلوب")
    .min(3, "اسم الجامعة يجب أن يكون 3 أحرف على الأقل"),
  facultyName: z
    .string()
    .min(1, "اسم الكلية مطلوب")
    .min(3, "اسم الكلية يجب أن يكون 3 أحرف على الأقل"),
  academicYear: z.string().optional().or(z.literal("")),
  postgraduateStudy: z
    .enum(["none", "preliminary", "masters", "doctorate"]),

  // الحالة الوظيفية
  employmentStatus: z.enum(["working", "not_working"], {
    message: "يرجى اختيار الحالة الوظيفية",
  }),
  jobTitle: z.string().optional().or(z.literal("")),
  employer: z.string().optional().or(z.literal("")),

});

export type MemberFormData = z.infer<typeof baseMemberSchema>;

export const memberSchema = baseMemberSchema
  .refine(
    (data) => {
      if (data.memberType === "student" && (!data.academicYear || data.academicYear.trim() === "")) {
        return false;
      }
      return true;
    },
    {
      message: "الفرقة مطلوبة للطلاب",
      path: ["academicYear"],
    }
  )
  .refine(
    (data) => {
      if (data.employmentStatus === "working" && (!data.jobTitle || data.jobTitle.trim() === "")) {
        return false;
      }
      return true;
    },
    {
      message: "المسمى الوظيفي مطلوب عند اختيار 'أعمل'",
      path: ["jobTitle"],
    }
  )
  .refine(
    (data) => {
      if (data.employmentStatus === "working" && (!data.employer || data.employer.trim() === "")) {
        return false;
      }
      return true;
    },
    {
      message: "جهة العمل مطلوبة عند اختيار 'أعمل'",
      path: ["employer"],
    }
  );

export const imageSchema = z.object({
  size: z.number().max(MAX_FILE_SIZE, "حجم الصورة يجب أن يكون أقل من 2 ميجابايت"),
  type: z.string().refine((type) => ACCEPTED_IMAGE_TYPES.includes(type), {
    message: "يجب أن تكون الصورة بصيغة JPG أو PNG فقط",
  }),
});
