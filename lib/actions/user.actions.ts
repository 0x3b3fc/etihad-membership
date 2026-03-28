"use server";

import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function getUsers(params?: {
  search?: string;
  page?: number;
  limit?: number;
}) {
  const session = await getServerSession(authOptions);

  if (!session?.user?.id || session.user.role !== "ADMIN") {
    return { error: "غير مصرح لك بهذا الإجراء" };
  }

  const page = params?.page || 1;
  const limit = params?.limit || 10;
  const skip = (page - 1) * limit;

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const where: any = {
    role: "USER",
  };

  if (params?.search) {
    where.OR = [
      { name: { contains: params.search, mode: "insensitive" } },
      { email: { contains: params.search, mode: "insensitive" } },
    ];
  }

  const [users, total] = await Promise.all([
    prisma.user.findMany({
      where,
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        createdAt: true,
        unit: {
          select: { id: true, name: true },
        },
        application: {
          select: { id: true, status: true, fullName: true },
        },
      },
      orderBy: { createdAt: "desc" },
      skip,
      take: limit,
    }),
    prisma.user.count({ where }),
  ]);

  return {
    users,
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    },
  };
}

export async function getUserById(id: string) {
  const session = await getServerSession(authOptions);

  if (!session?.user?.id || session.user.role !== "ADMIN") {
    return null;
  }

  return prisma.user.findUnique({
    where: { id },
    select: {
      id: true,
      name: true,
      email: true,
      phone: true,
      createdAt: true,
      unit: {
        include: { governorate: true },
      },
      application: {
        include: {
          governorate: true,
          assignedUnit: {
            include: { governorate: true },
          },
        },
      },
    },
  });
}

export async function getCurrentUser() {
  const session = await getServerSession(authOptions);

  if (!session?.user?.id) {
    return null;
  }

  return prisma.user.findUnique({
    where: { id: session.user.id },
    select: {
      id: true,
      name: true,
      email: true,
      phone: true,
      role: true,
      createdAt: true,
      unit: {
        include: { governorate: true },
      },
    },
  });
}

export async function updateUserProfile(data: {
  name: string;
  phone?: string;
  email: string;
}) {
  const session = await getServerSession(authOptions);

  if (!session?.user?.id) {
    return { error: "غير مصرح لك بهذا الإجراء" };
  }

  if (!data.name || data.name.trim().length < 2) {
    return { error: "الاسم يجب أن يكون حرفين على الأقل" };
  }

  if (!data.email || !data.email.includes("@")) {
    return { error: "البريد الإلكتروني غير صالح" };
  }

  // Check email uniqueness if changed
  const currentUser = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { email: true },
  });

  if (currentUser && currentUser.email !== data.email) {
    const existingUser = await prisma.user.findUnique({
      where: { email: data.email },
    });
    if (existingUser) {
      return { error: "البريد الإلكتروني مسجل بالفعل" };
    }
  }

  await prisma.user.update({
    where: { id: session.user.id },
    data: {
      name: data.name.trim(),
      email: data.email.trim(),
      phone: data.phone?.trim() || null,
    },
  });

  return { success: true, message: "تم تحديث البيانات بنجاح" };
}
