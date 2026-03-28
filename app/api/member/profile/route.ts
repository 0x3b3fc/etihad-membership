import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const cookieStore = await cookies();
  const memberId = cookieStore.get("member_session")?.value;

  if (!memberId) {
    return NextResponse.json({ error: "غير مصرح" }, { status: 401 });
  }

  const member = await prisma.member.findUnique({
    where: { id: memberId },
  });

  if (!member) {
    return NextResponse.json({ error: "العضو غير موجود" }, { status: 404 });
  }

  return NextResponse.json({ success: true, data: member });
}

export async function PUT(request: NextRequest) {
  const cookieStore = await cookies();
  const memberId = cookieStore.get("member_session")?.value;

  if (!memberId) {
    return NextResponse.json({ error: "غير مصرح" }, { status: 401 });
  }

  const body = await request.json();

  if (!body.fullNameAr || body.fullNameAr.trim().length < 2) {
    return NextResponse.json({ error: "الاسم بالعربي مطلوب" }, { status: 400 });
  }

  // Build update data from all provided fields
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const updateData: Record<string, any> = {
    fullNameAr: body.fullNameAr.trim(),
  };

  const optionalFields = [
    "fullNameEn", "governorate", "address", "phone1", "phone2", "email",
    "memberType", "entityName", "role", "academicYear", "postgraduateStudy",
    "employmentStatus", "jobTitle", "employer", "previousExperiences", "skills",
    "profileImage",
  ];
  for (const field of optionalFields) {
    if (body[field] !== undefined) {
      updateData[field] = body[field];
    }
  }

  await prisma.member.update({
    where: { id: memberId },
    data: updateData,
  });

  return NextResponse.json({ success: true, message: "تم تحديث البيانات بنجاح" });
}
