import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

// Card template: 647 × 409 px
const DEFAULT_CARD_FIELDS = {
  fullNameAr:    { x: 340, yTop: 120, size: 14, type: "text", label: "الاسم" },
  memberNumber:  { x: 340, yTop: 160, size: 12, type: "text", label: "رقم العضوية" },
  governorate:   { x: 340, yTop: 200, size: 12, type: "text", label: "المحافظة" },
  nationalId:    { x: 340, yTop: 240, size: 11, type: "text", label: "الرقم القومي" },
  role:          { x: 340, yTop: 280, size: 12, type: "text", label: "الصفة" },
  profileImage:  { x: 30,  yTop: 110, width: 120, height: 150, type: "image", label: "الصورة الشخصية" },
  qrCode:        { x: 540, yTop: 280, width: 80, height: 80, type: "image", label: "QR Code" },
};

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "غير مصرح" }, { status: 401 });
    }

    const template = await prisma.pdfTemplate.findUnique({
      where: { id: "card" },
    });

    if (!template) {
      return NextResponse.json({
        success: true,
        data: {
          id: "card",
          name: "قالب الكارنيه",
          fields: DEFAULT_CARD_FIELDS,
        },
      });
    }

    return NextResponse.json({ success: true, data: template });
  } catch (error) {
    console.error("Card template GET error:", error);
    return NextResponse.json(
      { error: "خطأ في تحميل القالب", details: String(error) },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session || session.user.role !== "ADMIN") {
    return NextResponse.json({ error: "غير مصرح" }, { status: 401 });
  }

  const body = await request.json();
  const { name, fields } = body;

  if (!fields || typeof fields !== "object") {
    return NextResponse.json({ error: "بيانات القالب غير صالحة" }, { status: 400 });
  }

  const template = await prisma.pdfTemplate.upsert({
    where: { id: "card" },
    create: { id: "card", name: name || "قالب الكارنيه", fields },
    update: { name: name || "قالب الكارنيه", fields },
  });

  return NextResponse.json({
    success: true,
    message: "تم حفظ قالب الكارنيه بنجاح",
    data: template,
  });
}

export async function POST() {
  const session = await getServerSession(authOptions);
  if (!session || session.user.role !== "ADMIN") {
    return NextResponse.json({ error: "غير مصرح" }, { status: 401 });
  }

  const template = await prisma.pdfTemplate.upsert({
    where: { id: "card" },
    create: { id: "card", name: "قالب الكارنيه", fields: DEFAULT_CARD_FIELDS },
    update: { fields: DEFAULT_CARD_FIELDS },
  });

  return NextResponse.json({
    success: true,
    message: "تم إعادة تعيين قالب الكارنيه للإعدادات الافتراضية",
    data: template,
  });
}
