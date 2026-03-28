import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const cookieStore = await cookies();
  const memberId = cookieStore.get("member_session")?.value;

  if (!memberId) {
    return NextResponse.json({ error: "غير مصرح" }, { status: 401 });
  }

  const application = await prisma.application.findUnique({
    where: { memberId },
    include: {
      governorate: true,
      assignedUnit: {
        include: { governorate: true },
      },
    },
  });

  return NextResponse.json({
    success: true,
    data: application,
    hasApplied: !!application,
  });
}
