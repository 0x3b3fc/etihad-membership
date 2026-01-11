import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";
import { cookies } from "next/headers";

export async function POST(request: NextRequest) {
  try {
    const { nationalId, password } = await request.json();

    if (!nationalId || !password) {
      return NextResponse.json(
        { success: false, message: "الرقم القومي وكلمة المرور مطلوبين" },
        { status: 400 }
      );
    }

    // Find member by national ID
    const member = await prisma.member.findUnique({
      where: { nationalId },
    });

    if (!member) {
      return NextResponse.json(
        { success: false, message: "الرقم القومي أو كلمة المرور غير صحيحة" },
        { status: 401 }
      );
    }

    // Verify password
    const isValidPassword = await bcrypt.compare(password, member.password);

    if (!isValidPassword) {
      return NextResponse.json(
        { success: false, message: "الرقم القومي أو كلمة المرور غير صحيحة" },
        { status: 401 }
      );
    }

    // Set session cookie
    const cookieStore = await cookies();
    cookieStore.set("member_session", member.id, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 60 * 60 * 24 * 7, // 7 days
      path: "/",
    });

    return NextResponse.json({
      success: true,
      message: "تم تسجيل الدخول بنجاح",
      memberId: member.id,
    });
  } catch (error) {
    console.error("Login error:", error);
    return NextResponse.json(
      { success: false, message: "حدث خطأ أثناء تسجيل الدخول" },
      { status: 500 }
    );
  }
}
