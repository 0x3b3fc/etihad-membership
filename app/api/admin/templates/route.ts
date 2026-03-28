import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

// Default field positions (matches the original hardcoded FIELDS)
// Generate default national ID box positions (14 boxes, RTL from right)
function generateNidDefaults() {
  const fields: Record<string, object> = {};
  const startX = 521;
  const boxSpacing = 22;
  const yTop = 216;
  for (let i = 1; i <= 14; i++) {
    fields[`nid_${i}`] = {
      x: startX - (i - 1) * boxSpacing,
      yTop,
      width: 10,
      height: 14,
      size: 9,
      type: "nidBox",
      label: `${i}`,
    };
  }
  return fields;
}

export const DEFAULT_TEMPLATE_FIELDS = {
  governorate:     { xRight: 415, yTop: 172, size: 9, type: "rtl", label: "المحافظة" },
  fullNameAr:      { xRight: 510, yTop: 196, size: 10, type: "rtl", label: "الاسم بالعربي" },
  ...generateNidDefaults(),
  address:         { xRight: 495, yTop: 238, size: 9, type: "rtl", label: "العنوان" },
  phone1:          { xRight: 490, yTop: 260, size: 9, type: "rtl", label: "الهاتف 1" },
  phone2:          { xRight: 315, yTop: 260, size: 9, type: "rtl", label: "الهاتف 2" },
  email:           { xRight: 490, yTop: 284, size: 9, type: "rtl", label: "البريد الإلكتروني" },
  studentCheck:    { x: 313, yTop: 316, type: "check", label: "طالب ✓" },
  graduateCheck:   { x: 97,  yTop: 316, type: "check", label: "خريج ✓" },
  university:      { xRight: 505, yTop: 358, size: 10, type: "rtl", label: "الجامعة" },
  faculty:         { xRight: 505, yTop: 382, size: 10, type: "rtl", label: "الكلية" },
  year:            { xRight: 505, yTop: 406, size: 10, type: "rtl", label: "السنة الدراسية" },
  postgraduateStudy: { xRight: 505, yTop: 430, size: 9, type: "rtl", label: "الدراسات العليا" },
  employedCheck:   { x: 295, yTop: 478, type: "check", label: "يعمل ✓" },
  unemployedCheck: { x: 97,  yTop: 478, type: "check", label: "لا يعمل ✓" },
  jobTitle:        { xRight: 505, yTop: 502, size: 9, type: "rtl", label: "المسمى الوظيفي" },
  employer:        { xRight: 505, yTop: 526, size: 9, type: "rtl", label: "جهة العمل" },
  previousExperiences: { xRight: 505, yTop: 568, size: 8, type: "rtl", label: "الخبرات السابقة" },
  skills:          { xRight: 505, yTop: 592, size: 8, type: "rtl", label: "المهارات" },
  profileImage:    { x: 37, yTop: 176, width: 104, height: 105, type: "image", label: "الصورة الشخصية" },
};

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "غير مصرح" }, { status: 401 });
    }

    const template = await prisma.pdfTemplate.findUnique({
      where: { id: "default" },
    });

    if (!template) {
      return NextResponse.json({
        success: true,
        data: {
          id: "default",
          name: "القالب الافتراضي",
          fields: DEFAULT_TEMPLATE_FIELDS,
        },
      });
    }

    // Merge: saved fields override defaults, but new default fields are included
    const mergedFields = { ...DEFAULT_TEMPLATE_FIELDS, ...(template.fields as Record<string, unknown>) };

    return NextResponse.json({ success: true, data: { ...template, fields: mergedFields } });
  } catch (error) {
    console.error("Template GET error:", error);
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
    return NextResponse.json(
      { error: "بيانات القالب غير صالحة" },
      { status: 400 }
    );
  }

  const template = await prisma.pdfTemplate.upsert({
    where: { id: "default" },
    create: {
      id: "default",
      name: name || "القالب الافتراضي",
      fields,
    },
    update: {
      name: name || "القالب الافتراضي",
      fields,
    },
  });

  return NextResponse.json({
    success: true,
    message: "تم حفظ القالب بنجاح",
    data: template,
  });
}

export async function POST() {
  const session = await getServerSession(authOptions);
  if (!session || session.user.role !== "ADMIN") {
    return NextResponse.json({ error: "غير مصرح" }, { status: 401 });
  }

  // Reset to defaults
  const template = await prisma.pdfTemplate.upsert({
    where: { id: "default" },
    create: {
      id: "default",
      name: "القالب الافتراضي",
      fields: DEFAULT_TEMPLATE_FIELDS,
    },
    update: {
      fields: DEFAULT_TEMPLATE_FIELDS,
    },
  });

  return NextResponse.json({
    success: true,
    message: "تم إعادة تعيين القالب للإعدادات الافتراضية",
    data: template,
  });
}
