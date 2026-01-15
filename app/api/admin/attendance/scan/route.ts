import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";

export async function POST(request: NextRequest) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json(
        { success: false, error: "UNAUTHORIZED", message: "غير مصرح" },
        { status: 401 }
      );
    }

    // Get admin from database by email
    const admin = await prisma.admin.findUnique({
      where: { email: session.user.email },
    });

    if (!admin) {
      return NextResponse.json(
        { success: false, error: "UNAUTHORIZED", message: "المسؤول غير موجود" },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { eventId, memberId } = body;

    if (!eventId || !memberId) {
      return NextResponse.json(
        { success: false, error: "MISSING_DATA", message: "يرجى تحديد الفعالية والعضو" },
        { status: 400 }
      );
    }

    // Check if event exists and is active
    const event = await prisma.event.findUnique({
      where: { id: eventId },
    });

    if (!event) {
      return NextResponse.json(
        { success: false, error: "EVENT_NOT_FOUND", message: "الفعالية غير موجودة" },
        { status: 404 }
      );
    }

    if (!event.isActive) {
      return NextResponse.json(
        { success: false, error: "EVENT_INACTIVE", message: "الفعالية غير نشطة" },
        { status: 400 }
      );
    }

    // Check if member exists
    const member = await prisma.member.findUnique({
      where: { id: memberId },
      select: {
        id: true,
        fullNameAr: true,
        fullNameEn: true,
        memberNumber: true,
        entityName: true,
        profileImage: true,
        governorate: true,
      },
    });

    if (!member) {
      return NextResponse.json(
        { success: false, error: "MEMBER_NOT_FOUND", message: "العضو غير موجود" },
        { status: 404 }
      );
    }

    // Check if already attended
    const existingAttendance = await prisma.attendance.findUnique({
      where: {
        eventId_memberId: {
          eventId,
          memberId,
        },
      },
    });

    if (existingAttendance) {
      return NextResponse.json(
        {
          success: false,
          error: "ALREADY_ATTENDED",
          message: "هذا العضو مسجل حضوره مسبقاً في هذه الفعالية",
          data: {
            member,
            scannedAt: existingAttendance.scannedAt,
          },
        },
        { status: 409 }
      );
    }

    // Create attendance record
    const attendance = await prisma.attendance.create({
      data: {
        eventId,
        memberId,
        scannedBy: admin.id,
      },
    });

    return NextResponse.json({
      success: true,
      message: "تم تسجيل الحضور بنجاح",
      data: {
        member,
        event: {
          name: event.name,
        },
        scannedAt: attendance.scannedAt,
      },
    });
  } catch (error) {
    console.error("Error recording attendance:", error);
    return NextResponse.json(
      { success: false, error: "SERVER_ERROR", message: "حدث خطأ أثناء تسجيل الحضور" },
      { status: 500 }
    );
  }
}
