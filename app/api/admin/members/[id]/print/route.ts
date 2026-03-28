import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { PDFDocument, PDFFont, PDFPage, rgb, RGB } from "pdf-lib";
import fontkit from "@pdf-lib/fontkit";
import fs from "fs";
import path from "path";

// ─── Default Field Position Map ─────────────────────────────────────
// Used as fallback when no template is saved in the database.
// All coordinates use TOP-LEFT origin (like CSS):
//   xRight = right anchor for RTL text (text flows LEFT from here)
//   x      = left anchor for LTR text / checkmarks
//   yTop   = distance from TOP edge of page
//
// Page: 595.5 × 842.25 pt (A4)
// ─────────────────────────────────────────────────────────────────────

function generateNidDefaults() {
  const fields: Record<string, Record<string, number | string>> = {};
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
    };
  }
  return fields;
}

const DEFAULT_FIELDS = {
  governorate:    { xRight: 415, yTop: 172, size: 9 },
  fullNameAr:     { xRight: 510, yTop: 196, size: 10 },
  ...generateNidDefaults(),
  address:        { xRight: 495, yTop: 238, size: 9 },
  phone1:         { xRight: 490, yTop: 260, size: 9 },
  phone2:         { xRight: 315, yTop: 260, size: 9 },
  email:          { xRight: 490, yTop: 284, size: 9 },
  studentCheck:   { x: 313, yTop: 316 },
  graduateCheck:  { x: 97,  yTop: 316 },
  university:     { xRight: 505, yTop: 358, size: 10 },
  faculty:        { xRight: 505, yTop: 382, size: 10 },
  year:           { xRight: 505, yTop: 406, size: 10 },
  postgraduateStudy: { xRight: 505, yTop: 430, size: 9 },
  employedCheck:  { x: 295, yTop: 478 },
  unemployedCheck:{ x: 97,  yTop: 478 },
  jobTitle:       { xRight: 505, yTop: 502, size: 9 },
  employer:       { xRight: 505, yTop: 526, size: 9 },
  previousExperiences: { xRight: 505, yTop: 568, size: 8 },
  skills:         { xRight: 505, yTop: 592, size: 8 },
  profileImage:   { x: 37, yTop: 176, width: 104, height: 105 },
};

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type FieldMap = Record<string, any>;

// ─── Drawing Helpers ─────────────────────────────────────────────────

class PDFWriter {
  constructor(
    private page: PDFPage,
    private font: PDFFont,
    private pageHeight: number,
    private color: RGB
  ) {}

  /** Convert top-left Y to pdf-lib bottom-left Y */
  private toY(yFromTop: number): number {
    return this.pageHeight - yFromTop;
  }

  /** Draw RTL text — xRight is the RIGHT edge; text flows left */
  drawRTL(text: string | null | undefined, xRight: number, yTop: number, size: number) {
    if (!text) return;
    const textWidth = this.font.widthOfTextAtSize(text, size);
    this.page.drawText(text, {
      x: xRight - textWidth,
      y: this.toY(yTop),
      size,
      font: this.font,
      color: this.color,
    });
  }

  /** Draw a single character centered horizontally in a box */
  drawCentered(char: string, boxCenterX: number, yTop: number, size: number) {
    const charWidth = this.font.widthOfTextAtSize(char, size);
    this.page.drawText(char, {
      x: boxCenterX - charWidth / 2,
      y: this.toY(yTop),
      size,
      font: this.font,
      color: this.color,
    });
  }

  /** Draw a checkmark as a filled square */
  drawCheck(x: number, yTop: number) {
    const size = 8;
    this.page.drawRectangle({
      x: x,
      y: this.toY(yTop) - size / 2,
      width: size,
      height: size,
      color: this.color,
    });
  }

  /** Draw an image — yTop is the TOP edge of the image */
  async drawImage(
    doc: PDFDocument,
    imageUrl: string,
    x: number,
    yTop: number,
    width: number,
    imgHeight: number
  ) {
    const imgResponse = await fetch(imageUrl);
    const imgArrayBuffer = await imgResponse.arrayBuffer();
    const imgBytes = new Uint8Array(imgArrayBuffer);

    const contentType = imgResponse.headers.get("content-type") || "";
    const isPng = contentType.includes("png") || imageUrl.includes(".png");
    const image = isPng
      ? await doc.embedPng(imgBytes)
      : await doc.embedJpg(imgBytes);

    // pdf-lib y = BOTTOM edge of image
    this.page.drawImage(image, {
      x,
      y: this.toY(yTop + imgHeight),
      width,
      height: imgHeight,
    });
  }
}

// ─── Route Handler ───────────────────────────────────────────────────

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getServerSession(authOptions);
  if (!session || session.user.role !== "ADMIN") {
    return NextResponse.json({ error: "غير مصرح" }, { status: 401 });
  }

  const { id } = await params;

  const member = await prisma.member.findUnique({
    where: { id },
  });

  if (!member) {
    return NextResponse.json({ error: "العضو غير موجود" }, { status: 404 });
  }

  try {
    // Load template field positions from database, fallback to defaults
    const savedTemplate = await prisma.pdfTemplate.findUnique({
      where: { id: "default" },
    });
    // Merge: saved template overrides defaults, but new default fields are included
    const FIELDS: FieldMap = savedTemplate
      ? { ...DEFAULT_FIELDS, ...(savedTemplate.fields as FieldMap) }
      : DEFAULT_FIELDS;

    const templatePath = path.join(process.cwd(), "public", "membership-form-template.pdf");
    const fontPath = path.join(process.cwd(), "public", "Cairo-Variable.ttf");

    const pdfBytes = fs.readFileSync(templatePath);
    const fontBytes = fs.readFileSync(fontPath);

    const doc = await PDFDocument.load(pdfBytes);
    doc.registerFontkit(fontkit);
    const font = await doc.embedFont(fontBytes);

    const page = doc.getPage(0);
    const { height } = page.getSize();

    const w = new PDFWriter(page, font, height, rgb(0.05, 0.05, 0.3));

    // Parse "university - faculty" from entityName
    const entityParts = (member.entityName || "").split(" - ");
    const universityName = entityParts.length >= 2 ? entityParts[0] : member.entityName;
    const facultyName = entityParts.length >= 2 ? entityParts[1] : "";

    // ── البيانات الأساسية ──

    const gov = FIELDS.governorate;
    if (gov) w.drawRTL(member.governorate, gov.xRight, gov.yTop, gov.size);

    const name = FIELDS.fullNameAr;
    if (name) w.drawRTL(member.fullNameAr, name.xRight, name.yTop, name.size);

    // الرقم القومي — 14 individually positioned boxes (or legacy single field)
    if (member.nationalId) {
      const nid = member.nationalId;
      if (FIELDS.nid_1) {
        for (let i = 0; i < Math.min(nid.length, 14); i++) {
          const box = FIELDS[`nid_${i + 1}`];
          if (box) {
            const boxW = box.width || 16;
            const centerX = (box.x || 0) + boxW / 2;
            w.drawCentered(nid[i], centerX, box.yTop, box.size || 9);
          }
        }
      } else if (FIELDS.nationalId) {
        const f = FIELDS.nationalId;
        for (let i = 0; i < Math.min(nid.length, 14); i++) {
          w.drawCentered(nid[i], f.startCenterX - i * f.boxWidth, f.yTop, f.size || 9);
        }
      }
    }

    // العنوان
    if (FIELDS.address && member.address) {
      const addr = FIELDS.address;
      w.drawRTL(member.address, addr.xRight, addr.yTop, addr.size);
    }

    // الموبايل
    if (FIELDS.phone1 && member.phone1) {
      const p1 = FIELDS.phone1;
      w.drawRTL(member.phone1, p1.xRight, p1.yTop, p1.size);
    }
    if (FIELDS.phone2 && member.phone2) {
      const p2 = FIELDS.phone2;
      w.drawRTL(member.phone2, p2.xRight, p2.yTop, p2.size);
    }

    // البريد الالكتروني
    if (FIELDS.email && member.email) {
      const em = FIELDS.email;
      w.drawRTL(member.email, em.xRight, em.yTop, em.size);
    }

    // ── المؤهلات التعليمية ──

    if (member.memberType === "student") {
      if (FIELDS.studentCheck) w.drawCheck(FIELDS.studentCheck.x, FIELDS.studentCheck.yTop);
    } else if (member.memberType === "graduate") {
      if (FIELDS.graduateCheck) w.drawCheck(FIELDS.graduateCheck.x, FIELDS.graduateCheck.yTop);
    }

    const univ = FIELDS.university;
    if (univ) w.drawRTL(universityName, univ.xRight, univ.yTop, univ.size);

    const fac = FIELDS.faculty;
    if (fac) w.drawRTL(facultyName, fac.xRight, fac.yTop, fac.size);

    // الفرقة
    if (FIELDS.year && member.academicYear) {
      const yr = FIELDS.year;
      w.drawRTL(member.academicYear, yr.xRight, yr.yTop, yr.size);
    }

    // الدراسات العليا
    if (FIELDS.postgraduateStudy && member.postgraduateStudy && member.postgraduateStudy !== "none") {
      const pg = FIELDS.postgraduateStudy;
      const pgLabels: Record<string, string> = { preliminary: "تمهيدي", masters: "ماجستير", doctorate: "دكتوراه" };
      w.drawRTL(pgLabels[member.postgraduateStudy] || member.postgraduateStudy, pg.xRight, pg.yTop, pg.size);
    }

    // ── الحالة الوظيفية ──

    if (member.employmentStatus === "working") {
      if (FIELDS.employedCheck) w.drawCheck(FIELDS.employedCheck.x, FIELDS.employedCheck.yTop);
    } else {
      if (FIELDS.unemployedCheck) w.drawCheck(FIELDS.unemployedCheck.x, FIELDS.unemployedCheck.yTop);
    }

    // المسمى الوظيفي
    if (FIELDS.jobTitle && member.jobTitle) {
      const jt = FIELDS.jobTitle;
      w.drawRTL(member.jobTitle, jt.xRight, jt.yTop, jt.size);
    }

    // جهة العمل
    if (FIELDS.employer && member.employer) {
      const emp = FIELDS.employer;
      w.drawRTL(member.employer, emp.xRight, emp.yTop, emp.size);
    }

    // الخبرات السابقة
    if (FIELDS.previousExperiences && member.previousExperiences) {
      const pe = FIELDS.previousExperiences;
      w.drawRTL(member.previousExperiences, pe.xRight, pe.yTop, pe.size);
    }

    // المهارات
    if (FIELDS.skills && member.skills) {
      const sk = FIELDS.skills;
      w.drawRTL(member.skills, sk.xRight, sk.yTop, sk.size);
    }

    // ── الصورة الشخصية ──

    if (member.profileImage) {
      try {
        const img = FIELDS.profileImage;
        await w.drawImage(doc, member.profileImage, img.x, img.yTop, img.width, img.height);
      } catch (e) {
        console.error("Failed to embed profile image:", e);
      }
    }

    // ── Save & Return ──

    const filledPdf = await doc.save();

    return new NextResponse(Buffer.from(filledPdf), {
      status: 200,
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `inline; filename="membership-${member.memberNumber}.pdf"`,
      },
    });
  } catch (error) {
    console.error("PDF generation error:", error);
    return NextResponse.json(
      { error: "حدث خطأ في إنشاء الاستمارة" },
      { status: 500 }
    );
  }
}
