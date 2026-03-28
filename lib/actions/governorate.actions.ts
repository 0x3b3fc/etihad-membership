"use server";

import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import {
  governorateSchema,
  type GovernorateInput,
} from "@/lib/validations/governorate";
import { revalidatePath } from "next/cache";

export async function createGovernorate(data: GovernorateInput) {
  const session = await getServerSession(authOptions);

  if (!session?.user?.id || session.user.role !== "ADMIN") {
    return { error: "غير مصرح لك بهذا الإجراء" };
  }

  const validatedFields = governorateSchema.safeParse(data);

  if (!validatedFields.success) {
    const errors = validatedFields.error.flatten().fieldErrors;
    const firstError = Object.values(errors)[0]?.[0];
    return { error: firstError || "بيانات غير صالحة" };
  }

  const existingGovernorate = await prisma.governorate.findUnique({
    where: { name: validatedFields.data.name },
  });

  if (existingGovernorate) {
    return { error: "اسم المحافظة موجود بالفعل" };
  }

  await prisma.governorate.create({
    data: validatedFields.data,
  });

  revalidatePath("/admin/governorates");
  return { success: true };
}

export async function updateGovernorate(id: string, data: GovernorateInput) {
  const session = await getServerSession(authOptions);

  if (!session?.user?.id || session.user.role !== "ADMIN") {
    return { error: "غير مصرح لك بهذا الإجراء" };
  }

  const validatedFields = governorateSchema.safeParse(data);

  if (!validatedFields.success) {
    const errors = validatedFields.error.flatten().fieldErrors;
    const firstError = Object.values(errors)[0]?.[0];
    return { error: firstError || "بيانات غير صالحة" };
  }

  const existingGovernorate = await prisma.governorate.findFirst({
    where: {
      name: validatedFields.data.name,
      NOT: { id },
    },
  });

  if (existingGovernorate) {
    return { error: "اسم المحافظة موجود بالفعل" };
  }

  await prisma.governorate.update({
    where: { id },
    data: validatedFields.data,
  });

  revalidatePath("/admin/governorates");
  return { success: true };
}

export async function deleteGovernorate(id: string) {
  const session = await getServerSession(authOptions);

  if (!session?.user?.id || session.user.role !== "ADMIN") {
    return { error: "غير مصرح لك بهذا الإجراء" };
  }

  const governorate = await prisma.governorate.findUnique({
    where: { id },
    include: {
      _count: {
        select: { units: true, applications: true },
      },
    },
  });

  if (!governorate) {
    return { error: "المحافظة غير موجودة" };
  }

  if (governorate._count.units > 0) {
    return { error: "لا يمكن حذف المحافظة لأنها تحتوي على وحدات" };
  }

  if (governorate._count.applications > 0) {
    return { error: "لا يمكن حذف المحافظة لأنها مرتبطة بطلبات" };
  }

  await prisma.governorate.delete({
    where: { id },
  });

  revalidatePath("/admin/governorates");
  return { success: true };
}

export async function toggleGovernorateActive(id: string) {
  const session = await getServerSession(authOptions);

  if (!session?.user?.id || session.user.role !== "ADMIN") {
    return { error: "غير مصرح لك بهذا الإجراء" };
  }

  const governorate = await prisma.governorate.findUnique({
    where: { id },
  });

  if (!governorate) {
    return { error: "المحافظة غير موجودة" };
  }

  await prisma.governorate.update({
    where: { id },
    data: { isActive: !governorate.isActive },
  });

  revalidatePath("/admin/governorates");
  return { success: true };
}

export async function getGovernorates(activeOnly = false) {
  const where = activeOnly ? { isActive: true } : {};

  return prisma.governorate.findMany({
    where,
    orderBy: { name: "asc" },
    include: {
      _count: {
        select: { units: true, applications: true },
      },
    },
  });
}

export async function getActiveGovernorates() {
  return prisma.governorate.findMany({
    where: { isActive: true },
    orderBy: { name: "asc" },
  });
}
