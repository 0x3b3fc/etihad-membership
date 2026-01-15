import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json(
        { success: false, message: "غير مصرح" },
        { status: 401 }
      );
    }

    const { id } = await params;

    const event = await prisma.event.findUnique({
      where: { id },
      include: {
        _count: {
          select: { attendances: true },
        },
        creator: {
          select: { name: true },
        },
      },
    });

    if (!event) {
      return NextResponse.json(
        { success: false, message: "الفعالية غير موجودة" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: event,
    });
  } catch (error) {
    console.error("Error fetching event:", error);
    return NextResponse.json(
      { success: false, message: "حدث خطأ أثناء جلب الفعالية" },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json(
        { success: false, message: "غير مصرح" },
        { status: 401 }
      );
    }

    const { id } = await params;
    const body = await request.json();
    const {
      name,
      description,
      category,
      organizingEntity,
      location,
      date,
      startTime,
      endTime,
      isActive,
    } = body;

    const existingEvent = await prisma.event.findUnique({
      where: { id },
    });

    if (!existingEvent) {
      return NextResponse.json(
        { success: false, message: "الفعالية غير موجودة" },
        { status: 404 }
      );
    }

    const event = await prisma.event.update({
      where: { id },
      data: {
        name,
        description,
        category,
        organizingEntity,
        location,
        date: date ? new Date(date) : undefined,
        startTime,
        endTime,
        isActive,
      },
    });

    return NextResponse.json({
      success: true,
      message: "تم تحديث الفعالية بنجاح",
      data: event,
    });
  } catch (error) {
    console.error("Error updating event:", error);
    return NextResponse.json(
      { success: false, message: "حدث خطأ أثناء تحديث الفعالية" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json(
        { success: false, message: "غير مصرح" },
        { status: 401 }
      );
    }

    const { id } = await params;

    const existingEvent = await prisma.event.findUnique({
      where: { id },
    });

    if (!existingEvent) {
      return NextResponse.json(
        { success: false, message: "الفعالية غير موجودة" },
        { status: 404 }
      );
    }

    await prisma.event.delete({
      where: { id },
    });

    return NextResponse.json({
      success: true,
      message: "تم حذف الفعالية بنجاح",
    });
  } catch (error) {
    console.error("Error deleting event:", error);
    return NextResponse.json(
      { success: false, message: "حدث خطأ أثناء حذف الفعالية" },
      { status: 500 }
    );
  }
}
