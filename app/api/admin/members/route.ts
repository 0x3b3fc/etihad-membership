import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";

const DEFAULT_TIME_ZONE = "Africa/Cairo";

function getDatePartsInTimeZone(date: Date, timeZone: string) {
  const parts = new Intl.DateTimeFormat("en-US", {
    timeZone,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).formatToParts(date);

  const values = Object.fromEntries(
    parts.map((part) => [part.type, part.value])
  );
  return {
    year: Number(values.year),
    month: Number(values.month),
    day: Number(values.day),
  };
}

function getTimeZoneOffsetMs(date: Date, timeZone: string) {
  const parts = new Intl.DateTimeFormat("en-US", {
    timeZone,
    hour12: false,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  }).formatToParts(date);

  const values = Object.fromEntries(
    parts.map((part) => [part.type, part.value])
  );
  const asUtc = Date.UTC(
    Number(values.year),
    Number(values.month) - 1,
    Number(values.day),
    Number(values.hour),
    Number(values.minute),
    Number(values.second)
  );

  return asUtc - date.getTime();
}

function getTodayRangeUtc(timeZone: string) {
  const now = new Date();
  const { year, month, day } = getDatePartsInTimeZone(now, timeZone);

  const startLocalAsUtc = new Date(Date.UTC(year, month - 1, day, 0, 0, 0, 0));
  const endLocalAsUtc = new Date(
    Date.UTC(year, month - 1, day, 23, 59, 59, 999)
  );

  const startOffset = getTimeZoneOffsetMs(startLocalAsUtc, timeZone);
  const endOffset = getTimeZoneOffsetMs(endLocalAsUtc, timeZone);

  return {
    startUtc: new Date(startLocalAsUtc.getTime() - startOffset),
    endUtc: new Date(endLocalAsUtc.getTime() - endOffset),
  };
}

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
    const governorate = searchParams.get("governorate") || "";
    const entityName = searchParams.get("entityName") || "";

    const skip = (page - 1) * limit;

    const where = {
      AND: [
        search
          ? {
              OR: [
                {
                  fullNameAr: {
                    contains: search,
                    mode: "insensitive" as const,
                  },
                },
                {
                  fullNameEn: {
                    contains: search,
                    mode: "insensitive" as const,
                  },
                },
                {
                  nationalId: {
                    contains: search,
                    mode: "insensitive" as const,
                  },
                },
                {
                  memberNumber: {
                    contains: search,
                    mode: "insensitive" as const,
                  },
                },
              ],
            }
          : {},
        governorate ? { governorate } : {},
        entityName ? { entityName } : {},
      ],
    };

    const { startUtc, endUtc } = getTodayRangeUtc(DEFAULT_TIME_ZONE);
    const todayWhere = {
      AND: [...where.AND, { createdAt: { gte: startUtc, lte: endUtc } }],
    };

    const [members, total, todayCount] = await Promise.all([
      prisma.member.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: "desc" },
      }),
      prisma.member.count({ where }),
      prisma.member.count({ where: todayWhere }),
    ]);

    return NextResponse.json({
      success: true,
      data: members,
      stats: {
        todayNew: todayCount,
      },
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error("Error fetching members:", error);
    return NextResponse.json(
      { success: false, message: "حدث خطأ أثناء جلب البيانات" },
      { status: 500 }
    );
  }
}
