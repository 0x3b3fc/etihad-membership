import { z } from "zod";

export const governorateSchema = z.object({
  name: z
    .string()
    .min(1, { message: "اسم المحافظة مطلوب" })
    .min(3, { message: "اسم المحافظة يجب أن يكون 3 أحرف على الأقل" }),
  code: z
    .string()
    .min(1, { message: "كود المحافظة مطلوب" })
    .min(2, { message: "كود المحافظة يجب أن يكون حرفين على الأقل" })
    .max(3, { message: "كود المحافظة يجب ألا يتجاوز 3 أحرف" }),
  isActive: z.boolean().default(true),
});

export type GovernorateInput = z.infer<typeof governorateSchema>;
