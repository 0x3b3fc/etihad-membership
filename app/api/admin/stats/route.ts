import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const session = await getServerSession(authOptions);

    if (!session) {
      return NextResponse.json(
        { success: false, message: "غير مصرح" },
        { status: 401 }
      );
    }

    // Get Cairo timezone dates
    const now = new Date();
    const cairoOffset = 2 * 60 * 60 * 1000; // UTC+2
    const cairoNow = new Date(now.getTime() + cairoOffset);

    // Start of today (Cairo)
    const todayStart = new Date(cairoNow);
    todayStart.setUTCHours(0, 0, 0, 0);
    todayStart.setTime(todayStart.getTime() - cairoOffset);

    // Start of week (Cairo)
    const weekStart = new Date(cairoNow);
    weekStart.setUTCDate(weekStart.getUTCDate() - weekStart.getUTCDay());
    weekStart.setUTCHours(0, 0, 0, 0);
    weekStart.setTime(weekStart.getTime() - cairoOffset);

    // Start of month (Cairo)
    const monthStart = new Date(cairoNow);
    monthStart.setUTCDate(1);
    monthStart.setUTCHours(0, 0, 0, 0);
    monthStart.setTime(monthStart.getTime() - cairoOffset);

    // 30 days ago
    const thirtyDaysAgo = new Date(now);
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    // Fetch all stats in parallel
    const [
      totalMembers,
      todayNew,
      weekNew,
      monthNew,
      totalEvents,
      totalAttendance,
      membersByGovernorate,
      memberTypeDistribution,
      attendanceTrend,
    ] = await Promise.all([
      // Total members
      prisma.member.count(),

      // New members today
      prisma.member.count({
        where: { createdAt: { gte: todayStart } },
      }),

      // New members this week
      prisma.member.count({
        where: { createdAt: { gte: weekStart } },
      }),

      // New members this month
      prisma.member.count({
        where: { createdAt: { gte: monthStart } },
      }),

      // Total events
      prisma.event.count(),

      // Total attendance
      prisma.attendance.count(),

      // Members by governorate
      prisma.member.groupBy({
        by: ["governorate"],
        _count: { id: true },
        orderBy: { _count: { id: "desc" } },
      }),

      // Member type distribution
      prisma.member.groupBy({
        by: ["memberType"],
        _count: { id: true },
      }),

      // Attendance trend (last 30 days)
      prisma.attendance.findMany({
        where: { scannedAt: { gte: thirtyDaysAgo } },
        select: { scannedAt: true },
        orderBy: { scannedAt: "asc" },
      }),
    ]);

    // Process members by governorate
    const governorateData = membersByGovernorate.map((item) => ({
      governorate: item.governorate,
      count: item._count.id,
    }));

    // Process member type distribution
    const typeDistribution = {
      student: 0,
      graduate: 0,
    };
    memberTypeDistribution.forEach((item) => {
      if (item.memberType === "student") {
        typeDistribution.student = item._count.id;
      } else if (item.memberType === "graduate") {
        typeDistribution.graduate = item._count.id;
      }
    });

    // Process attendance trend (group by date)
    const trendMap = new Map<string, number>();

    // Initialize all dates in the range with 0
    for (let i = 29; i >= 0; i--) {
      const date = new Date(now);
      date.setDate(date.getDate() - i);
      const dateStr = date.toISOString().split("T")[0];
      trendMap.set(dateStr, 0);
    }

    // Count attendance per day
    attendanceTrend.forEach((item) => {
      const dateStr = item.scannedAt.toISOString().split("T")[0];
      if (trendMap.has(dateStr)) {
        trendMap.set(dateStr, (trendMap.get(dateStr) || 0) + 1);
      }
    });

    const trendData = Array.from(trendMap.entries()).map(([date, count]) => ({
      date,
      count,
    }));

    return NextResponse.json({
      success: true,
      data: {
        totalMembers,
        todayNew,
        weekNew,
        monthNew,
        totalEvents,
        totalAttendance,
        membersByGovernorate: governorateData,
        memberTypeDistribution: typeDistribution,
        attendanceTrend: trendData,
      },
    });
  } catch (error) {
    console.error("Error fetching stats:", error);
    return NextResponse.json(
      { success: false, message: "حدث خطأ في جلب الإحصائيات" },
      { status: 500 }
    );
  }
}
