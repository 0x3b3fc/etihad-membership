import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";
import { EventCategory } from "@prisma/client";

export async function GET(request: NextRequest) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json(
        { success: false, message: "غير مصرح" },
        { status: 401 }
      );
    }

    const searchParams = request.nextUrl.searchParams;
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "10");
    const search = searchParams.get("search") || "";
    const category = searchParams.get("category") || "";
    const organizingEntity = searchParams.get("organizingEntity") || "";
    const isActive = searchParams.get("isActive");
    const activeOnly = searchParams.get("activeOnly") === "true";

    const skip = (page - 1) * limit;

    const where = {
      AND: [
        search
          ? {
              OR: [
                { name: { contains: search, mode: "insensitive" as const } },
                { location: { contains: search, mode: "insensitive" as const } },
              ],
            }
          : {},
        category ? { category: category as EventCategory } : {},
        organizingEntity ? { organizingEntity } : {},
        isActive !== null && isActive !== ""
          ? { isActive: isActive === "true" }
          : {},
        activeOnly ? { isActive: true } : {},
      ],
    };

    const [events, total] = await Promise.all([
      prisma.event.findMany({
        where,
        skip,
        take: limit,
        orderBy: { date: "desc" },
        include: {
          _count: {
            select: { attendances: true },
          },
          creator: {
            select: { name: true },
          },
        },
      }),
      prisma.event.count({ where }),
    ]);

    return NextResponse.json({
      success: true,
      data: events,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error("Error fetching events:", error);
    return NextResponse.json(
      { success: false, message: "حدث خطأ أثناء جلب الفعاليات" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json(
        { success: false, message: "غير مصرح" },
        { status: 401 }
      );
    }

    // Get admin from database by email
    const admin = await prisma.admin.findUnique({
      where: { email: session.user.email },
    });

    if (!admin) {
      return NextResponse.json(
        { success: false, message: "المسؤول غير موجود" },
        { status: 401 }
      );
    }

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
    } = body;

    if (!name || !category || !organizingEntity || !location || !date || !startTime) {
      return NextResponse.json(
        { success: false, message: "يرجى ملء جميع الحقول المطلوبة" },
        { status: 400 }
      );
    }

    const event = await prisma.event.create({
      data: {
        name,
        description,
        category,
        organizingEntity,
        location,
        date: new Date(date),
        startTime,
        endTime,
        createdBy: admin.id,
      },
    });

    return NextResponse.json({
      success: true,
      message: "تم إنشاء الفعالية بنجاح",
      data: event,
    });
  } catch (error) {
    console.error("Error creating event:", error);
    return NextResponse.json(
      { success: false, message: "حدث خطأ أثناء إنشاء الفعالية" },
      { status: 500 }
    );
  }
}
