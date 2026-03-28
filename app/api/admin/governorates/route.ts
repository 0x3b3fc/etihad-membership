import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session || session.user.role !== "ADMIN") {
    return NextResponse.json({ error: "غير مصرح" }, { status: 401 });
  }

  const governorates = await prisma.governorate.findMany({
    orderBy: { name: "asc" },
    include: { _count: { select: { units: true, applications: true } } },
  });

  return NextResponse.json({ success: true, data: governorates });
}

export async function POST(request: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session || session.user.role !== "ADMIN") {
    return NextResponse.json({ error: "غير مصرح" }, { status: 401 });
  }

  const body = await request.json();
  const { name, code, isActive } = body;

  if (!name || !code) {
    return NextResponse.json({ error: "الاسم والكود مطلوبين" }, { status: 400 });
  }

  const existing = await prisma.governorate.findFirst({
    where: { OR: [{ name }, { code }] },
  });

  if (existing) {
    return NextResponse.json({ error: "المحافظة أو الكود موجود بالفعل" }, { status: 400 });
  }

  const governorate = await prisma.governorate.create({
    data: { name, code, isActive: isActive ?? true },
  });

  return NextResponse.json({ success: true, data: governorate });
}
