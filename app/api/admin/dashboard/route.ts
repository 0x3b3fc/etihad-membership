import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session || session.user.role !== "ADMIN") {
    return NextResponse.json({ error: "غير مصرح" }, { status: 401 });
  }

  const [
    totalMembers,
    totalApplications,
    pendingApplications,
    acceptedApplications,
    rejectedApplications,
    totalGovernorates,
    totalUnits,
    latestApplications,
  ] = await Promise.all([
    prisma.member.count(),
    prisma.application.count(),
    prisma.application.count({ where: { status: "PENDING" } }),
    prisma.application.count({ where: { status: "ACCEPTED" } }),
    prisma.application.count({ where: { status: "REJECTED" } }),
    prisma.governorate.count({ where: { isActive: true } }),
    prisma.unit.count({ where: { isActive: true } }),
    prisma.application.findMany({
      take: 5,
      orderBy: { submittedAt: "desc" },
      include: { governorate: { select: { name: true } } },
    }),
  ]);

  return NextResponse.json({
    success: true,
    data: {
      totalMembers,
      totalApplications,
      pendingApplications,
      acceptedApplications,
      rejectedApplications,
      totalGovernorates,
      totalUnits,
      latestApplications,
    },
  });
}
