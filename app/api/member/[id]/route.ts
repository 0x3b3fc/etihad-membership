import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const member = await prisma.member.findUnique({
      where: { id },
      select: {
        id: true,
        memberNumber: true,
        fullNameAr: true,
        fullNameEn: true,
        governorate: true,
        memberType: true,
        entityName: true,
        role: true,
        profileImage: true,
        qrCode: true,
        createdAt: true,
      },
    });

    if (!member) {
      return NextResponse.json(
        { success: false, message: "العضو غير موجود" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: member,
    });
  } catch (error) {
    console.error("Error fetching member:", error);
    return NextResponse.json(
      { success: false, message: "حدث خطأ أثناء جلب البيانات" },
      { status: 500 }
    );
  }
}
