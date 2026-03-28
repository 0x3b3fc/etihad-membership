import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getServerSession(authOptions);
  if (!session || session.user.role !== "ADMIN") {
    return NextResponse.json({ error: "غير مصرح" }, { status: 401 });
  }

  const { id } = await params;

  const application = await prisma.application.findUnique({
    where: { id },
    include: {
      governorate: true,
      assignedUnit: { include: { governorate: true } },
    },
  });

  if (!application) {
    return NextResponse.json({ error: "الطلب غير موجود" }, { status: 404 });
  }

  return NextResponse.json({ success: true, data: application });
}

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
  const { status, assignedUnitId, adminNote } = body;

  const application = await prisma.application.findUnique({ where: { id } });
  if (!application) {
    return NextResponse.json({ error: "الطلب غير موجود" }, { status: 404 });
  }

  const updated = await prisma.application.update({
    where: { id },
    data: {
      status,
      assignedUnitId: status === "ACCEPTED" ? assignedUnitId : null,
      adminNote: adminNote || null,
      decidedAt: status !== "PENDING" ? new Date() : null,
    },
    include: { governorate: true, assignedUnit: true },
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

  await prisma.application.delete({ where: { id } });

  return NextResponse.json({ success: true, message: "تم حذف الطلب بنجاح" });
}
