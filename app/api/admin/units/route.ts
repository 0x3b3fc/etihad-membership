import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET(request: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session || session.user.role !== "ADMIN") {
    return NextResponse.json({ error: "غير مصرح" }, { status: 401 });
  }

  const governorateId = request.nextUrl.searchParams.get("governorateId") || "";

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const where: any = {};
  if (governorateId) where.governorateId = governorateId;

  const units = await prisma.unit.findMany({
    where,
    orderBy: { name: "asc" },
    include: {
      governorate: { select: { id: true, name: true } },
      _count: { select: { users: true, applications: true } },
    },
  });

  return NextResponse.json({ success: true, data: units });
}

export async function POST(request: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session || session.user.role !== "ADMIN") {
    return NextResponse.json({ error: "غير مصرح" }, { status: 401 });
  }

  const body = await request.json();
  const { name, governorateId, whatsappLink, address, phone, isActive } = body;

  if (!name) {
    return NextResponse.json({ error: "اسم الوحدة مطلوب" }, { status: 400 });
  }

  const unit = await prisma.unit.create({
    data: {
      name,
      governorateId: governorateId || null,
      whatsappLink: whatsappLink || null,
      address: address || null,
      phone: phone || null,
      isActive: isActive ?? true,
    },
  });

  return NextResponse.json({ success: true, data: unit });
}
