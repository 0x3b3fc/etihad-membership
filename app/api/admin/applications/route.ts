import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET(request: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session || session.user.role !== "ADMIN") {
    return NextResponse.json({ error: "غير مصرح" }, { status: 401 });
  }

  const searchParams = request.nextUrl.searchParams;
  const page = parseInt(searchParams.get("page") || "1");
  const limit = parseInt(searchParams.get("limit") || "10");
  const status = searchParams.get("status") || "ALL";
  const governorateId = searchParams.get("governorateId") || "";
  const search = searchParams.get("search") || "";

  const skip = (page - 1) * limit;

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const where: any = { AND: [] };

  if (status && status !== "ALL") {
    where.AND.push({ status });
  }
  if (governorateId) {
    where.AND.push({ governorateId });
  }
  if (search) {
    where.AND.push({
      OR: [
        { fullName: { contains: search, mode: "insensitive" } },
        { nationalId: { contains: search } },
        { email: { contains: search, mode: "insensitive" } },
      ],
    });
  }

  const [applications, total] = await Promise.all([
    prisma.application.findMany({
      where,
      skip,
      take: limit,
      orderBy: { submittedAt: "desc" },
      include: {
        governorate: { select: { id: true, name: true } },
        assignedUnit: { select: { id: true, name: true } },
      },
    }),
    prisma.application.count({ where }),
  ]);

  return NextResponse.json({
    success: true,
    data: applications,
    pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
  });
}
