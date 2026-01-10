import { z } from "zod";
import { governorates } from "../data/governorates";
import { entities } from "../data/entities";

const MAX_FILE_SIZE = 2 * 1024 * 1024; // 2MB
const ACCEPTED_IMAGE_TYPES = ["image/jpeg", "image/jpg", "image/png"];

export const memberSchema = z
  .object({
    nationalId: z
      .string()
      .min(1, "الرقم القومي مطلوب")
      .length(14, "الرقم القومي يجب أن يكون 14 رقم")
      .regex(/^\d{14}$/, "الرقم القومي يجب أن يحتوي على أرقام فقط"),
    fullNameAr: z
      .string()
      .min(1, "الاسم الرباعي باللغة العربية مطلوب")
      .min(8, "يرجى إدخال الاسم الرباعي كاملاً")
      .regex(/^[\u0600-\u06FF\s]+$/, "يجب أن يكون الاسم باللغة العربية فقط"),
    fullNameEn: z
      .string()
      .min(1, "الاسم الرباعي باللغة الإنجليزية مطلوب")
      .min(8, "يرجى إدخال الاسم الرباعي كاملاً")
      .regex(/^[a-zA-Z\s]+$/, "يجب أن يكون الاسم باللغة الإنجليزية فقط"),
    governorate: z
      .string()
      .min(1, "المحافظة مطلوبة")
      .refine((val) => governorates.includes(val as (typeof governorates)[number]), {
        message: "يرجى اختيار محافظة صحيحة",
      }),
    memberType: z.enum(["student", "graduate"], {
      message: "يرجى اختيار نوع العضو",
    }),
    entityName: z
      .string()
      .min(1, "الوحدة/اللجنة مطلوبة")
      .refine((val) => entities.includes(val as (typeof entities)[number]), {
        message: "يرجى اختيار وحدة أو لجنة صحيحة",
      }),
    role: z
      .string()
      .min(1, "الصفة داخل الاتحاد مطلوبة")
      .min(3, "يرجى إدخال صفة صحيحة"),
    paymentMethod: z.enum(["coordinator", "instapay"], {
      message: "يرجى اختيار طريقة الدفع",
    }),
    coordinatorName: z.string().optional(),
    instapayRef: z.string().optional(),
  })
  .refine(
    (data) => {
      if (data.paymentMethod === "coordinator") {
        return data.coordinatorName && data.coordinatorName.length >= 3;
      }
      return true;
    },
    {
      message: "اسم منسق المحافظة مطلوب",
      path: ["coordinatorName"],
    }
  )
  .refine(
    (data) => {
      if (data.paymentMethod === "instapay") {
        return data.instapayRef && data.instapayRef.length >= 3;
      }
      return true;
    },
    {
      message: "الرقم المرجعي لعملية الدفع مطلوب",
      path: ["instapayRef"],
    }
  );

export const imageSchema = z.object({
  size: z.number().max(MAX_FILE_SIZE, "حجم الصورة يجب أن يكون أقل من 2 ميجابايت"),
  type: z.string().refine((type) => ACCEPTED_IMAGE_TYPES.includes(type), {
    message: "يجب أن تكون الصورة بصيغة JPG أو PNG فقط",
  }),
});

export type MemberFormData = z.infer<typeof memberSchema>;
