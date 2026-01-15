import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";
import crypto from "crypto";

function generatePassword(): string {
  return crypto.randomBytes(8).toString("hex"); // 16 characters
}

export async function POST(request: NextRequest) {
  try {
    const { nationalId } = await request.json();

    if (!nationalId) {
      return NextResponse.json(
        { success: false, message: "الرقم القومي مطلوب" },
        { status: 400 }
      );
    }

    // Find member by national ID
    const member = await prisma.member.findUnique({
      where: { nationalId },
    });

    if (!member) {
      return NextResponse.json(
        { success: false, message: "الرقم القومي غير مسجل في النظام" },
        { status: 404 }
      );
    }

    // Generate new password
    const newPassword = generatePassword();
    const hashedPassword = await bcrypt.hash(newPassword, 12);

    // Update member's password
    await prisma.member.update({
      where: { id: member.id },
      data: { password: hashedPassword },
    });

    return NextResponse.json({
      success: true,
      message: "تم إعادة تعيين كلمة المرور بنجاح",
      newPassword,
      memberNumber: member.memberNumber,
      fullName: member.fullNameAr,
    });
  } catch (error) {
    console.error("Password reset error:", error);
    return NextResponse.json(
      { success: false, message: "حدث خطأ أثناء إعادة تعيين كلمة المرور" },
      { status: 500 }
    );
  }
}
