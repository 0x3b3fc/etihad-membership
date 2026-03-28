import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { PDFDocument, PDFFont, PDFPage, rgb, RGB } from "pdf-lib";
import fontkit from "@pdf-lib/fontkit";
import fs from "fs";
import path from "path";

// Card image dimensions in pixels
const CARD_WIDTH = 647;
const CARD_HEIGHT = 409;

// Default card field positions
const DEFAULT_CARD_FIELDS: Record<string, Record<string, number | string>> = {
  fullNameAr:   { x: 340, yTop: 120, size: 14, type: "text" },
  memberNumber: { x: 340, yTop: 160, size: 12, type: "text" },
  governorate:  { x: 340, yTop: 200, size: 12, type: "text" },
  nationalId:   { x: 340, yTop: 240, size: 11, type: "text" },
  role:         { x: 340, yTop: 280, size: 12, type: "text" },
  profileImage: { x: 30,  yTop: 110, width: 120, height: 150, type: "image" },
  qrCode:       { x: 540, yTop: 280, width: 80,  height: 80,  type: "image" },
};

class CardPDFWriter {
  constructor(
    private page: PDFPage,
    private font: PDFFont,
    private pageHeight: number,
    private color: RGB,
    private scaleX: number,
    private scaleY: number
  ) {}

  private toY(yFromTop: number): number {
    return this.pageHeight - yFromTop * this.scaleY;
  }

  drawRTL(text: string | null | undefined, x: number, yTop: number, size: number) {
    if (!text) return;
    const scaledSize = size * this.scaleX;
    const textWidth = this.font.widthOfTextAtSize(text, scaledSize);
    this.page.drawText(text, {
      x: x * this.scaleX - textWidth,
      y: this.toY(yTop),
      size: scaledSize,
      font: this.font,
      color: this.color,
    });
  }

  drawLTR(text: string | null | undefined, x: number, yTop: number, size: number) {
    if (!text) return;
    const scaledSize = size * this.scaleX;
    this.page.drawText(text, {
      x: x * this.scaleX,
      y: this.toY(yTop),
      size: scaledSize,
      font: this.font,
      color: this.color,
    });
  }

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

    this.page.drawImage(image, {
      x: x * this.scaleX,
      y: this.toY(yTop + imgHeight),
      width: width * this.scaleX,
      height: imgHeight * this.scaleY,
    });
  }
}

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getServerSession(authOptions);
  if (!session || session.user.role !== "ADMIN") {
    return NextResponse.json({ error: "غير مصرح" }, { status: 401 });
  }

  const { id } = await params;

  const member = await prisma.member.findUnique({ where: { id } });
  if (!member) {
    return NextResponse.json({ error: "العضو غير موجود" }, { status: 404 });
  }

  try {
    // Load card template positions from database
    const savedTemplate = await prisma.pdfTemplate.findUnique({
      where: { id: "card" },
    });
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const FIELDS: Record<string, any> = savedTemplate
      ? (savedTemplate.fields as Record<string, Record<string, number | string>>)
      : DEFAULT_CARD_FIELDS;

    const fontPath = path.join(process.cwd(), "public", "Cairo-Variable.ttf");
    const cardImagePath = path.join(process.cwd(), "public", "membership-card-template.png");

    const fontBytes = fs.readFileSync(fontPath);
    const cardImageBytes = fs.readFileSync(cardImagePath);

    // Create PDF with card dimensions (convert px to pt: 1px ≈ 0.75pt at 96dpi)
    const pdfWidth = CARD_WIDTH * 0.75;
    const pdfHeight = CARD_HEIGHT * 0.75;
    const scaleX = pdfWidth / CARD_WIDTH;
    const scaleY = pdfHeight / CARD_HEIGHT;

    const doc = await PDFDocument.create();
    doc.registerFontkit(fontkit);
    const font = await doc.embedFont(fontBytes);

    const page = doc.addPage([pdfWidth, pdfHeight]);

    // Draw card background image
    const cardImage = await doc.embedPng(cardImageBytes);
    page.drawImage(cardImage, {
      x: 0,
      y: 0,
      width: pdfWidth,
      height: pdfHeight,
    });

    const w = new CardPDFWriter(page, font, pdfHeight, rgb(0.05, 0.05, 0.2), scaleX, scaleY);

    // Draw text fields
    const nameField = FIELDS.fullNameAr;
    if (nameField) {
      w.drawRTL(member.fullNameAr, nameField.x, nameField.yTop, nameField.size || 14);
    }

    const numField = FIELDS.memberNumber;
    if (numField) {
      w.drawLTR(member.memberNumber, numField.x, numField.yTop, numField.size || 12);
    }

    const govField = FIELDS.governorate;
    if (govField) {
      w.drawRTL(member.governorate, govField.x, govField.yTop, govField.size || 12);
    }

    const nidField = FIELDS.nationalId;
    if (nidField) {
      w.drawLTR(member.nationalId, nidField.x, nidField.yTop, nidField.size || 11);
    }

    const roleField = FIELDS.role;
    if (roleField) {
      w.drawRTL(member.role, roleField.x, roleField.yTop, roleField.size || 12);
    }

    // Draw profile image
    if (member.profileImage && FIELDS.profileImage) {
      try {
        const img = FIELDS.profileImage;
        await w.drawImage(doc, member.profileImage, img.x, img.yTop, img.width || 120, img.height || 150);
      } catch (e) {
        console.error("Failed to embed profile image:", e);
      }
    }

    // Draw QR code
    if (member.qrCode && FIELDS.qrCode) {
      try {
        const qr = FIELDS.qrCode;
        await w.drawImage(doc, member.qrCode, qr.x, qr.yTop, qr.width || 80, qr.height || 80);
      } catch (e) {
        console.error("Failed to embed QR code:", e);
      }
    }

    const pdfBytes = await doc.save();

    return new NextResponse(Buffer.from(pdfBytes), {
      status: 200,
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `inline; filename="card-${member.memberNumber}.pdf"`,
      },
    });
  } catch (error) {
    console.error("Card PDF generation error:", error);
    return NextResponse.json(
      { error: "حدث خطأ في إنشاء الكارنيه" },
      { status: 500 }
    );
  }
}
