"use server";

import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import {
  applicationSchema,
  applicationDecisionSchema,
  type ApplicationInput,
  type ApplicationDecisionInput,
} from "@/lib/validations/application";
import { revalidatePath } from "next/cache";

export async function submitApplication(data: ApplicationInput) {
  const session = await getServerSession(authOptions);

  if (!session?.user?.id) {
    return { error: "يجب تسجيل الدخول أولاً" };
  }

  const validatedFields = applicationSchema.safeParse(data);

  if (!validatedFields.success) {
    const errors = validatedFields.error.flatten().fieldErrors;
    const firstError = Object.values(errors)[0]?.[0];
    return { error: firstError || "بيانات غير صالحة" };
  }

  const existingApplication = await prisma.application.findUnique({
    where: { userId: session.user.id },
  });

  if (existingApplication) {
    return { error: "لديك طلب مقدم بالفعل" };
  }

  const existingNationalId = await prisma.application.findUnique({
    where: { nationalId: validatedFields.data.nationalId },
  });

  if (existingNationalId) {
    return { error: "الرقم القومي مستخدم بالفعل في طلب آخر" };
  }

  const d = validatedFields.data;

  await prisma.application.create({
    data: {
      userId: session.user.id,
      governorateId: d.governorateId,
      fullName: d.fullName,
      nationalId: d.nationalId,
      phone: d.phone,
      phone2: d.phone2 || null,
      email: d.email || null,
      address: d.address,
      // Educational
      memberType: d.memberType,
      universityName: d.universityName,
      facultyName: d.facultyName,
      academicYear: d.academicYear || null,
      postgraduateStudy: d.postgraduateStudy === "none" ? null : d.postgraduateStudy,
      // Employment
      employmentStatus: d.employmentStatus,
      jobTitle: d.jobTitle || null,
      employer: d.employer || null,
      // Experience & Skills
      previousExperiences: d.previousExperiences || null,
      skills: d.skills || null,
      // Photos
      photoUrl: d.photoUrl,
      nationalIdPhotoUrl: d.nationalIdPhotoUrl,
      nationalIdPhotoBackUrl: d.nationalIdPhotoBackUrl,
      // Legacy - build education string for backwards compat
      education: `${d.universityName} - ${d.facultyName}`,
      birthDate: new Date(),
    },
  });

  revalidatePath("/application");
  revalidatePath("/dashboard");

  return { success: true };
}

export async function decideApplication(data: ApplicationDecisionInput) {
  const session = await getServerSession(authOptions);

  if (!session?.user?.id || session.user.role !== "ADMIN") {
    return { error: "غير مصرح لك بهذا الإجراء" };
  }

  const validatedFields = applicationDecisionSchema.safeParse(data);

  if (!validatedFields.success) {
    const errors = validatedFields.error.flatten().fieldErrors;
    const firstError = Object.values(errors)[0]?.[0];
    return { error: firstError || "بيانات غير صالحة" };
  }

  const { applicationId, status, assignedUnitId, adminNote } =
    validatedFields.data;

  await prisma.$transaction(async (tx) => {
    const application = await tx.application.update({
      where: { id: applicationId },
      data: {
        status,
        assignedUnitId: status === "ACCEPTED" ? assignedUnitId : null,
        adminNote: adminNote || null,
        decidedAt: new Date(),
      },
    });

    if (status === "ACCEPTED" && assignedUnitId && application.userId) {
      await tx.user.update({
        where: { id: application.userId },
        data: { unitId: assignedUnitId },
      });
    } else if (status === "REJECTED" && application.userId) {
      await tx.user.update({
        where: { id: application.userId },
        data: { unitId: null },
      });
    }
  });

  revalidatePath("/admin/applications");
  revalidatePath(`/admin/applications/${applicationId}`);

  return { success: true };
}

export async function getApplications(params?: {
  status?: string;
  governorateId?: string;
  unitId?: string;
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
  const where: any = {};

  if (params?.status && params.status !== "ALL") {
    where.status = params.status;
  }

  if (params?.governorateId) {
    where.governorateId = params.governorateId;
  }

  if (params?.unitId) {
    where.assignedUnitId = params.unitId;
  }

  if (params?.search) {
    where.OR = [
      { fullName: { contains: params.search, mode: "insensitive" } },
      { nationalId: { contains: params.search } },
      {
        user: { email: { contains: params.search, mode: "insensitive" } },
      },
    ];
  }

  const [applications, total] = await Promise.all([
    prisma.application.findMany({
      where,
      include: {
        governorate: true,
        user: { select: { id: true, email: true, name: true } },
        assignedUnit: true,
      },
      orderBy: { submittedAt: "desc" },
      skip,
      take: limit,
    }),
    prisma.application.count({ where }),
  ]);

  return {
    applications,
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    },
  };
}

export async function getApplicationById(id: string) {
  const session = await getServerSession(authOptions);

  if (!session?.user?.id || session.user.role !== "ADMIN") {
    return null;
  }

  return prisma.application.findUnique({
    where: { id },
    include: {
      governorate: true,
      user: {
        select: {
          id: true,
          email: true,
          name: true,
          phone: true,
          createdAt: true,
        },
      },
      assignedUnit: {
        include: { governorate: true },
      },
    },
  });
}

export async function getUserApplication() {
  const session = await getServerSession(authOptions);

  if (!session?.user?.id) {
    return null;
  }

  return prisma.application.findUnique({
    where: { userId: session.user.id },
    include: {
      governorate: true,
      assignedUnit: {
        include: { governorate: true },
      },
    },
  });
}

export async function hasUserApplied() {
  const session = await getServerSession(authOptions);

  if (!session?.user?.id) {
    return false;
  }

  const application = await prisma.application.findUnique({
    where: { userId: session.user.id },
    select: { id: true },
  });

  return !!application;
}

export async function deleteApplication(applicationId: string) {
  const session = await getServerSession(authOptions);

  if (!session?.user?.id || session.user.role !== "ADMIN") {
    return { error: "غير مصرح لك بهذا الإجراء" };
  }

  const application = await prisma.application.findUnique({
    where: { id: applicationId },
    select: { id: true, userId: true },
  });

  if (!application) {
    return { error: "الطلب غير موجود" };
  }

  // If user was assigned to a unit, remove the assignment
  if (application.userId) {
    await prisma.user.update({
      where: { id: application.userId },
      data: { unitId: null },
    });
  }

  await prisma.application.delete({
    where: { id: applicationId },
  });

  revalidatePath("/admin/applications");

  return { success: true };
}
