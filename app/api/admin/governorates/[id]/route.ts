import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getServerSession(authOptions);
  if (!session || session.user.role !== "ADMIN") {
    return NextResponse.json({ error: "غير مصرح" }, { status: 401 });
  }

  const { id } = await params;
  const body = await request.json();

  // Toggle active
  if (body.toggleActive) {
    const gov = await prisma.governorate.findUnique({ where: { id } });
    if (!gov) return NextResponse.json({ error: "غير موجود" }, { status: 404 });
    const updated = await prisma.governorate.update({
      where: { id },
      data: { isActive: !gov.isActive },
    });
    return NextResponse.json({ success: true, data: updated });
  }

  const { name, code, isActive } = body;
  const updated = await prisma.governorate.update({
    where: { id },
    data: { name, code, isActive },
  });

  return NextResponse.json({ success: true, data: updated });
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getServerSession(authOptions);
  if (!session || session.user.role !== "ADMIN") {
    return NextResponse.json({ error: "غير مصرح" }, { status: 401 });
  }

  const { id } = await params;

  const gov = await prisma.governorate.findUnique({
    where: { id },
    include: { _count: { select: { units: true, applications: true } } },
  });

  if (!gov) return NextResponse.json({ error: "غير موجود" }, { status: 404 });

  if (gov._count.units > 0) {
    return NextResponse.json({ error: "لا يمكن حذف محافظة بها وحدات" }, { status: 400 });
  }

  await prisma.governorate.delete({ where: { id } });
  return NextResponse.json({ success: true, message: "تم الحذف بنجاح" });
}
