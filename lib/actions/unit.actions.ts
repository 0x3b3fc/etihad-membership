"use server";

import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { unitSchema, type UnitInput } from "@/lib/validations/unit";
import { revalidatePath } from "next/cache";

export async function createUnit(data: UnitInput) {
  const session = await getServerSession(authOptions);

  if (!session?.user?.id || session.user.role !== "ADMIN") {
    return { error: "غير مصرح لك بهذا الإجراء" };
  }

  const validatedFields = unitSchema.safeParse(data);

  if (!validatedFields.success) {
    const errors = validatedFields.error.flatten().fieldErrors;
    const firstError = Object.values(errors)[0]?.[0];
    return { error: firstError || "بيانات غير صالحة" };
  }

  const existingUnit = await prisma.unit.findFirst({
    where: { name: validatedFields.data.name },
  });

  if (existingUnit) {
    return { error: "اسم الوحدة موجود بالفعل" };
  }

  await prisma.unit.create({
    data: {
      governorateId: validatedFields.data.governorateId || null,
      name: validatedFields.data.name,
      whatsappLink: validatedFields.data.whatsappLink || null,
      address: validatedFields.data.address || null,
      phone: validatedFields.data.phone || null,
      isActive: validatedFields.data.isActive,
    },
  });

  revalidatePath("/admin/units");
  return { success: true };
}

export async function updateUnit(id: string, data: UnitInput) {
  const session = await getServerSession(authOptions);

  if (!session?.user?.id || session.user.role !== "ADMIN") {
    return { error: "غير مصرح لك بهذا الإجراء" };
  }

  const validatedFields = unitSchema.safeParse(data);

  if (!validatedFields.success) {
    const errors = validatedFields.error.flatten().fieldErrors;
    const firstError = Object.values(errors)[0]?.[0];
    return { error: firstError || "بيانات غير صالحة" };
  }

  const existingUnit = await prisma.unit.findFirst({
    where: {
      name: validatedFields.data.name,
      NOT: { id },
    },
  });

  if (existingUnit) {
    return { error: "اسم الوحدة موجود بالفعل" };
  }

  await prisma.unit.update({
    where: { id },
    data: {
      governorateId: validatedFields.data.governorateId || null,
      name: validatedFields.data.name,
      whatsappLink: validatedFields.data.whatsappLink || null,
      address: validatedFields.data.address || null,
      phone: validatedFields.data.phone || null,
      isActive: validatedFields.data.isActive,
    },
  });

  revalidatePath("/admin/units");
  return { success: true };
}

export async function deleteUnit(id: string) {
  const session = await getServerSession(authOptions);

  if (!session?.user?.id || session.user.role !== "ADMIN") {
    return { error: "غير مصرح لك بهذا الإجراء" };
  }

  const unit = await prisma.unit.findUnique({
    where: { id },
    include: {
      _count: {
        select: { users: true, applications: true },
      },
    },
  });

  if (!unit) {
    return { error: "الوحدة غير موجودة" };
  }

  if (unit._count.users > 0 || unit._count.applications > 0) {
    return { error: "لا يمكن حذف الوحدة لأنها مرتبطة بمستخدمين أو طلبات" };
  }

  await prisma.unit.delete({
    where: { id },
  });

  revalidatePath("/admin/units");
  return { success: true };
}

export async function toggleUnitActive(id: string) {
  const session = await getServerSession(authOptions);

  if (!session?.user?.id || session.user.role !== "ADMIN") {
    return { error: "غير مصرح لك بهذا الإجراء" };
  }

  const unit = await prisma.unit.findUnique({
    where: { id },
  });

  if (!unit) {
    return { error: "الوحدة غير موجودة" };
  }

  await prisma.unit.update({
    where: { id },
    data: { isActive: !unit.isActive },
  });

  revalidatePath("/admin/units");
  return { success: true };
}

export async function getUnits(params?: {
  governorateId?: string;
  activeOnly?: boolean;
}) {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const where: any = {};

  if (params?.governorateId) {
    where.governorateId = params.governorateId;
  }

  if (params?.activeOnly) {
    where.isActive = true;
  }

  return prisma.unit.findMany({
    where,
    include: {
      governorate: true,
      _count: {
        select: { users: true, applications: true },
      },
    },
    orderBy: [{ governorate: { name: "asc" } }, { name: "asc" }],
  });
}

export async function getUnitsByGovernorate(
  governorateId: string,
  activeOnly = true
) {
  return prisma.unit.findMany({
    where: {
      governorateId,
      ...(activeOnly ? { isActive: true } : {}),
    },
    orderBy: { name: "asc" },
  });
}

export async function getAllUnits(activeOnly = true) {
  return prisma.unit.findMany({
    where: activeOnly ? { isActive: true } : {},
    include: {
      governorate: true,
    },
    orderBy: { name: "asc" },
  });
}
