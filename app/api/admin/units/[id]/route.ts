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

  if (body.toggleActive) {
    const unit = await prisma.unit.findUnique({ where: { id } });
    if (!unit) return NextResponse.json({ error: "غير موجود" }, { status: 404 });
    const updated = await prisma.unit.update({
      where: { id },
      data: { isActive: !unit.isActive },
    });
    return NextResponse.json({ success: true, data: updated });
  }

  const { name, governorateId, whatsappLink, address, phone, isActive } = body;
  const updated = await prisma.unit.update({
    where: { id },
    data: {
      name,
      governorateId: governorateId || null,
      whatsappLink: whatsappLink || null,
      address: address || null,
      phone: phone || null,
      isActive,
    },
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

  const unit = await prisma.unit.findUnique({
    where: { id },
    include: { _count: { select: { users: true, applications: true } } },
  });

  if (!unit) return NextResponse.json({ error: "غير موجود" }, { status: 404 });

  if (unit._count.users > 0 || unit._count.applications > 0) {
    return NextResponse.json({ error: "لا يمكن حذف وحدة بها أعضاء أو طلبات" }, { status: 400 });
  }

  await prisma.unit.delete({ where: { id } });
  return NextResponse.json({ success: true, message: "تم الحذف بنجاح" });
}
