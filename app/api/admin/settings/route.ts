import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

// GET - Fetch settings
export async function GET() {
  try {
    let session = null;
    try {
      session = await getServerSession(authOptions);
    } catch {
      session = null;
    }

    if (!session) {
      return NextResponse.json(
        { success: false, message: "غير مصرح" },
        { status: 401 }
      );
    }

    let settings = await prisma.settings.findUnique({
      where: { id: "default" },
    });

    // Create default settings if not exists
    if (!settings) {
      settings = await prisma.settings.create({
        data: {
          id: "default",
          platformName: "عضويتي",
          platformSubtitle: "اتحاد بشبابها",
          primaryColor: "#1e3a5f",
          membershipFee: 0,
          enableRegistration: true,
          updatedAt: new Date(),
        },
      });
    }

    return NextResponse.json({
      success: true,
      data: settings,
    });
  } catch (error) {
    console.error("Error fetching settings:", error);
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json(
      { success: false, message: "حدث خطأ في جلب الإعدادات", error: errorMessage },
      { status: 500 }
    );
  }
}

// PUT - Update settings
export async function PUT(request: Request) {
  try {
    let session = null;
    try {
      session = await getServerSession(authOptions);
    } catch {
      session = null;
    }

    if (!session) {
      return NextResponse.json(
        { success: false, message: "غير مصرح" },
        { status: 401 }
      );
    }

    const body = await request.json();
    const {
      platformName,
      platformSubtitle,
      logoUrl,
      primaryColor,
      membershipFee,
      instapayNumber,
      instapayName,
      enableRegistration,
    } = body;

    const settings = await prisma.settings.upsert({
      where: { id: "default" },
      update: {
        platformName,
        platformSubtitle,
        logoUrl,
        primaryColor,
        membershipFee,
        instapayNumber,
        instapayName,
        enableRegistration,
        updatedAt: new Date(),
      },
      create: {
        id: "default",
        platformName,
        platformSubtitle,
        logoUrl,
        primaryColor,
        membershipFee,
        instapayNumber,
        instapayName,
        enableRegistration,
        updatedAt: new Date(),
      },
    });

    return NextResponse.json({
      success: true,
      message: "تم حفظ الإعدادات بنجاح",
      data: settings,
    });
  } catch (error) {
    console.error("Error updating settings:", error);
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json(
      { success: false, message: "حدث خطأ في حفظ الإعدادات", error: errorMessage },
      { status: 500 }
    );
  }
}
