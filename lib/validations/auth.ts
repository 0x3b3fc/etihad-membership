import { z } from "zod";

export const loginSchema = z.object({
  email: z
    .string()
    .min(1, { message: "البريد الإلكتروني مطلوب" })
    .email({ message: "البريد الإلكتروني غير صالح" }),
  password: z
    .string()
    .min(1, { message: "كلمة المرور مطلوبة" })
    .min(6, { message: "كلمة المرور يجب أن تكون 6 أحرف على الأقل" }),
});

export const registerSchema = z
  .object({
    name: z
      .string()
      .min(1, { message: "الاسم مطلوب" })
      .min(2, { message: "الاسم يجب أن يكون حرفين على الأقل" }),
    email: z
      .string()
      .min(1, { message: "البريد الإلكتروني مطلوب" })
      .email({ message: "البريد الإلكتروني غير صالح" }),
    password: z
      .string()
      .min(1, { message: "كلمة المرور مطلوبة" })
      .min(6, { message: "كلمة المرور يجب أن تكون 6 أحرف على الأقل" }),
    confirmPassword: z
      .string()
      .min(1, { message: "تأكيد كلمة المرور مطلوب" }),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "كلمات المرور غير متطابقة",
    path: ["confirmPassword"],
  });

export type LoginInput = z.infer<typeof loginSchema>;
export type RegisterInput = z.infer<typeof registerSchema>;
