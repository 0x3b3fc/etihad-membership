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

    const { id: eventId } = await params;
    const searchParams = request.nextUrl.searchParams;
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "20");
    const search = searchParams.get("search") || "";

    const skip = (page - 1) * limit;

    // Check if event exists
    const event = await prisma.event.findUnique({
      where: { id: eventId },
      select: { id: true, name: true },
    });

    if (!event) {
      return NextResponse.json(
        { success: false, message: "الفعالية غير موجودة" },
        { status: 404 }
      );
    }

    const where = {
      eventId,
      ...(search
        ? {
            member: {
              OR: [
                { fullNameAr: { contains: search, mode: "insensitive" as const } },
                { fullNameEn: { contains: search, mode: "insensitive" as const } },
                { memberNumber: { contains: search, mode: "insensitive" as const } },
              ],
            },
          }
        : {}),
    };

    const [attendances, total] = await Promise.all([
      prisma.attendance.findMany({
        where,
        skip,
        take: limit,
        orderBy: { scannedAt: "desc" },
        include: {
          member: {
            select: {
              id: true,
              fullNameAr: true,
              fullNameEn: true,
              memberNumber: true,
              entityName: true,
              governorate: true,
              profileImage: true,
            },
          },
          scanner: {
            select: { name: true },
          },
        },
      }),
      prisma.attendance.count({ where }),
    ]);

    return NextResponse.json({
      success: true,
      data: attendances,
      event,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error("Error fetching attendance:", error);
    return NextResponse.json(
      { success: false, message: "حدث خطأ أثناء جلب بيانات الحضور" },
      { status: 500 }
    );
  }
}
