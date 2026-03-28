import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { prisma } from "@/lib/prisma";

export async function POST(request: NextRequest) {
  const cookieStore = await cookies();
  const memberId = cookieStore.get("member_session")?.value;

  if (!memberId) {
    return NextResponse.json({ error: "غير مصرح" }, { status: 401 });
  }

  // Check if already applied
  const existing = await prisma.application.findUnique({
    where: { memberId },
  });

  if (existing) {
    return NextResponse.json({ error: "لقد قمت بتقديم طلب بالفعل" }, { status: 400 });
  }

  // Get member data
  const member = await prisma.member.findUnique({
    where: { id: memberId },
  });

  if (!member) {
    return NextResponse.json({ error: "العضو غير موجود" }, { status: 404 });
  }

  const body = await request.json();

  // Find governorate by name
  const governorate = await prisma.governorate.findFirst({
    where: { name: body.governorateId || member.governorate },
  });

  if (!governorate) {
    return NextResponse.json({ error: "المحافظة غير موجودة" }, { status: 400 });
  }

  // Check nationalId uniqueness in applications
  const existingNationalId = await prisma.application.findUnique({
    where: { nationalId: member.nationalId },
  });

  if (existingNationalId) {
    return NextResponse.json({ error: "يوجد طلب مسجل بهذا الرقم القومي بالفعل" }, { status: 400 });
  }

  const application = await prisma.application.create({
    data: {
      memberId,
      governorateId: governorate.id,
      fullName: body.fullName || member.fullNameAr,
      nationalId: member.nationalId,
      phone: body.phone || member.phone1,
      phone2: body.phone2 || member.phone2,
      email: body.email || member.email,
      birthDate: body.birthDate ? new Date(body.birthDate) : new Date("2000-01-01"),
      address: body.address || member.address || "",
      memberType: body.memberType || member.memberType,
      universityName: body.universityName,
      facultyName: body.facultyName,
      academicYear: body.academicYear,
      postgraduateStudy: body.postgraduateStudy || "none",
      employmentStatus: body.employmentStatus || "not_working",
      jobTitle: body.jobTitle,
      employer: body.employer,
      previousExperiences: body.previousExperiences,
      skills: body.skills,
      photoUrl: member.profileImage,
    },
  });

  return NextResponse.json({
    success: true,
    message: "تم تقديم طلبك بنجاح",
    data: application,
  });
}
