"use server";

import { signIn, signOut } from "next-auth/react";
import { prisma } from "@/lib/prisma";
import {
  loginSchema,
  registerSchema,
  type LoginInput,
  type RegisterInput,
} from "@/lib/validations/auth";
import bcrypt from "bcryptjs";

export async function registerUser(data: RegisterInput) {
  const validatedFields = registerSchema.safeParse(data);

  if (!validatedFields.success) {
    const errors = validatedFields.error.flatten().fieldErrors;
    const firstError = Object.values(errors)[0]?.[0];
    return { error: firstError || "بيانات غير صالحة" };
  }

  const { name, email, password } = validatedFields.data;

  const existingUser = await prisma.user.findUnique({
    where: { email },
  });

  if (existingUser) {
    return { error: "البريد الإلكتروني مستخدم بالفعل" };
  }

  const hashedPassword = await bcrypt.hash(password, 12);

  await prisma.user.create({
    data: {
      name,
      email,
      password: hashedPassword,
    },
  });

  return { success: true };
}

export async function validateLogin(data: LoginInput) {
  const validatedFields = loginSchema.safeParse(data);

  if (!validatedFields.success) {
    return { error: "بيانات غير صالحة" };
  }

  const user = await prisma.user.findUnique({
    where: { email: validatedFields.data.email },
    select: { role: true },
  });

  if (!user) {
    return { error: "البريد الإلكتروني أو كلمة المرور غير صحيحة" };
  }

  return {
    success: true,
    redirectTo: user.role === "ADMIN" ? "/admin" : "/dashboard",
  };
}
