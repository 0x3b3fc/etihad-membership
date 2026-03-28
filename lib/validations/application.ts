import { z } from "zod";

const arabicNameRegex = /^[\u0600-\u06FF\u0750-\u077F\u08A0-\u08FF\s]+$/;
const nationalIdRegex = /^\d{14}$/;
const phoneRegex = /^01[0125]\d{8}$/;

export const applicationSchema = z
  .object({
    // البيانات الأساسية
    governorateId: z.string().min(1, { message: "المحافظة مطلوبة" }),
    fullName: z
      .string()
      .min(1, { message: "الاسم الرباعي مطلوب" })
      .min(10, { message: "الاسم يجب أن يكون 10 أحرف على الأقل" })
      .max(100, { message: "الاسم يجب ألا يتجاوز 100 حرف" })
      .refine((name) => arabicNameRegex.test(name), {
        message: "الاسم يجب أن يكون باللغة العربية فقط",
      })
      .refine((name) => name.trim().split(/\s+/).length >= 4, {
        message: "الاسم يجب أن يكون رباعياً على الأقل (أربعة أسماء)",
      }),
    nationalId: z
      .string()
      .min(1, { message: "الرقم القومي مطلوب" })
      .regex(nationalIdRegex, {
        message: "الرقم القومي يجب أن يكون 14 رقماً بالضبط",
      }),
    address: z
      .string()
      .min(1, { message: "العنوان بالتفصيل مطلوب" })
      .min(10, { message: "العنوان يجب أن يكون 10 أحرف على الأقل" })
      .max(300, { message: "العنوان يجب ألا يتجاوز 300 حرف" }),
    phone: z
      .string()
      .min(1, { message: "الموبايل (1) مطلوب" })
      .regex(phoneRegex, {
        message: "رقم الموبايل يجب أن يكون رقم مصري صحيح (01xxxxxxxxx)",
      }),
    phone2: z
      .string()
      .regex(phoneRegex, {
        message: "رقم الموبايل (2) يجب أن يكون رقم مصري صحيح",
      })
      .optional()
      .or(z.literal("")),
    email: z
      .string()
      .email({ message: "البريد الالكتروني غير صالح" })
      .optional()
      .or(z.literal("")),
    photoUrl: z.string().min(1, { message: "الصورة الشخصية مطلوبة" }),
    nationalIdPhotoUrl: z
      .string()
      .min(1, { message: "صورة وجه البطاقة مطلوبة" }),
    nationalIdPhotoBackUrl: z
      .string()
      .min(1, { message: "صورة ظهر البطاقة مطلوبة" }),

    // المؤهلات التعليمية
    memberType: z.enum(["student", "graduate"], {
      message: "يجب اختيار طالب أو خريج",
    }),
    universityName: z
      .string()
      .min(1, { message: "اسم الجامعة مطلوب" })
      .min(3, { message: "اسم الجامعة يجب أن يكون 3 أحرف على الأقل" }),
    facultyName: z
      .string()
      .min(1, { message: "اسم الكلية مطلوب" })
      .min(3, { message: "اسم الكلية يجب أن يكون 3 أحرف على الأقل" }),
    academicYear: z.string().optional().or(z.literal("")),
    postgraduateStudy: z
      .enum(["none", "preliminary", "masters", "doctorate"]),

    // الحالة الوظيفية
    employmentStatus: z.enum(["working", "not_working"], {
      message: "يجب اختيار الحالة الوظيفية",
    }),
    jobTitle: z.string().optional().or(z.literal("")),
    employer: z.string().optional().or(z.literal("")),

    // الخبرات والمهارات
    previousExperiences: z.string().optional().or(z.literal("")),
    skills: z.string().optional().or(z.literal("")),
  })
  .refine(
    (data) => {
      if (
        data.employmentStatus === "working" &&
        (!data.jobTitle || data.jobTitle.trim() === "")
      ) {
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
      if (
        data.employmentStatus === "working" &&
        (!data.employer || data.employer.trim() === "")
      ) {
        return false;
      }
      return true;
    },
    {
      message: "جهة العمل مطلوبة عند اختيار 'أعمل'",
      path: ["employer"],
    }
  )
  .refine(
    (data) => {
      if (
        data.memberType === "student" &&
        (!data.academicYear || data.academicYear.trim() === "")
      ) {
        return false;
      }
      return true;
    },
    {
      message: "الفرقة مطلوبة للطلاب",
      path: ["academicYear"],
    }
  );

export const applicationDecisionSchema = z
  .object({
    applicationId: z.string().min(1),
    status: z.enum(["ACCEPTED", "REJECTED"]),
    assignedUnitId: z.string().optional(),
    adminNote: z.string().optional(),
  })
  .refine(
    (data) => {
      if (data.status === "ACCEPTED" && !data.assignedUnitId) {
        return false;
      }
      return true;
    },
    {
      message: "يجب تحديد الوحدة عند قبول الطلب",
      path: ["assignedUnitId"],
    }
  );

export type ApplicationInput = z.infer<typeof applicationSchema>;
export type ApplicationDecisionInput = z.infer<
  typeof applicationDecisionSchema
>;
