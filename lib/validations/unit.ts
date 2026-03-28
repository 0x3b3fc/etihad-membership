import { z } from "zod";

export const unitSchema = z.object({
  governorateId: z.string().optional().or(z.literal("")),
  name: z
    .string()
    .min(1, { message: "اسم الوحدة مطلوب" })
    .min(3, { message: "اسم الوحدة يجب أن يكون 3 أحرف على الأقل" }),
  whatsappLink: z
    .string()
    .url({ message: "رابط الواتساب غير صالح" })
    .optional()
    .or(z.literal("")),
  address: z.string().optional().or(z.literal("")),
  phone: z
    .string()
    .regex(/^0\d{10}$/, {
      message:
        "رقم الهاتف غير صالح (يجب أن يبدأ بـ 0 ويتكون من 11 رقم)",
    })
    .optional()
    .or(z.literal("")),
  isActive: z.boolean().default(true),
});

export type UnitInput = z.infer<typeof unitSchema>;
