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
  employedCheck:  { x: 295, yTop: 478 },
  unemployedCheck:{ x: 97,  yTop: 478 },
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

  /** Draw a checkmark */
  drawCheck(x: number, yTop: number) {
    this.page.drawText("✓", {
      x,
      y: this.toY(yTop),
      size: 12,
      font: this.font,
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
    const FIELDS: FieldMap = savedTemplate
      ? (savedTemplate.fields as FieldMap)
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
    w.drawRTL(member.governorate, gov.xRight, gov.yTop, gov.size);

    const name = FIELDS.fullNameAr;
    w.drawRTL(member.fullNameAr, name.xRight, name.yTop, name.size);

    // الرقم القومي — 14 individually positioned boxes (or legacy single field)
    if (member.nationalId) {
      const nid = member.nationalId;
      if (FIELDS.nid_1) {
        // New format: 14 individual boxes
        for (let i = 0; i < Math.min(nid.length, 14); i++) {
          const box = FIELDS[`nid_${i + 1}`];
          if (box) {
            const boxW = box.width || 16;
            const centerX = (box.x || 0) + boxW / 2;
            w.drawCentered(nid[i], centerX, box.yTop, box.size || 9);
          }
        }
      } else if (FIELDS.nationalId) {
        // Legacy format: single field with startCenterX + boxWidth
        const f = FIELDS.nationalId;
        for (let i = 0; i < Math.min(nid.length, 14); i++) {
          w.drawCentered(nid[i], f.startCenterX - i * f.boxWidth, f.yTop, f.size || 9);
        }
      }
    }

    // ── المؤهلات التعليمية ──

    if (member.memberType === "student") {
      w.drawCheck(FIELDS.studentCheck.x, FIELDS.studentCheck.yTop);
    } else if (member.memberType === "graduate") {
      w.drawCheck(FIELDS.graduateCheck.x, FIELDS.graduateCheck.yTop);
    }

    const univ = FIELDS.university;
    w.drawRTL(universityName, univ.xRight, univ.yTop, univ.size);

    const fac = FIELDS.faculty;
    w.drawRTL(facultyName, fac.xRight, fac.yTop, fac.size);

    // ── الحالة الوظيفية ──

    w.drawCheck(FIELDS.unemployedCheck.x, FIELDS.unemployedCheck.yTop);

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
