import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { memberSchema, imageSchema } from "@/lib/validations/member";
import { uploadImage } from "@/lib/cloudinary";
import { generateQRCode } from "@/lib/qrcode";
import { getGovernorateCode, governorates, type Governorate } from "@/lib/data/governorates";

async function generateMemberNumber(governorate: string): Promise<string> {
  const prefix = getGovernorateCode(governorate);

  // Get governorate index to calculate base number
  // Each governorate has a reserved range of 5000 numbers
  const governorateIndex = governorates.indexOf(governorate as Governorate);
  const baseNumber = governorateIndex * 5000; // القاهرة=0, الجيزة=5000, الإسكندرية=10000, etc.

  // Get or create counter for this prefix
  const counter = await prisma.memberCounter.upsert({
    where: { prefix },
    update: { counter: { increment: 1 } },
    create: { id: prefix, prefix, counter: baseNumber + 1 }, // يبدأ من baseNumber + 1
  });

  // Format: XX-XXXXX (e.g., CA-00001, GZ-05001, AX-10001)
  const number = counter.counter.toString().padStart(5, "0");
  return `${prefix}-${number}`;
}

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();

    const nationalId = formData.get("nationalId") as string;
    const fullNameAr = formData.get("fullNameAr") as string;
    const fullNameEn = formData.get("fullNameEn") as string;
    const governorate = formData.get("governorate") as string;
    const memberType = formData.get("memberType") as string;
    const entityName = formData.get("entityName") as string;
    const role = formData.get("role") as string;
    const paymentMethod = formData.get("paymentMethod") as string;
    const coordinatorName = formData.get("coordinatorName") as string | null;
    const instapayRef = formData.get("instapayRef") as string | null;
    const amountPaid = formData.get("amountPaid") as string;
    const profileImageFile = formData.get("profileImage") as File | null;
    const paymentReceiptFile = formData.get("paymentReceipt") as File | null;

    // Validate form data
    const validationResult = memberSchema.safeParse({
      nationalId,
      fullNameAr,
      fullNameEn,
      governorate,
      memberType,
      entityName,
      role,
      paymentMethod,
      coordinatorName: coordinatorName || undefined,
      instapayRef: instapayRef || undefined,
      amountPaid,
    });

    if (!validationResult.success) {
      const errors = validationResult.error.issues.map((e) => ({
        field: e.path.join("."),
        message: e.message,
      }));
      return NextResponse.json(
        { success: false, errors },
        { status: 400 }
      );
    }

    // Check if nationalId already exists
    const existingMember = await prisma.member.findUnique({
      where: { nationalId: validationResult.data.nationalId },
    });

    if (existingMember) {
      return NextResponse.json(
        { success: false, errors: [{ field: "nationalId", message: "هذا الرقم القومي مسجل بالفعل" }] },
        { status: 400 }
      );
    }

    // Validate profile image
    if (!profileImageFile) {
      return NextResponse.json(
        { success: false, errors: [{ field: "profileImage", message: "الصورة الشخصية مطلوبة" }] },
        { status: 400 }
      );
    }

    const imageValidation = imageSchema.safeParse({
      size: profileImageFile.size,
      type: profileImageFile.type,
    });

    if (!imageValidation.success) {
      const errors = imageValidation.error.issues.map((e) => ({
        field: "profileImage",
        message: e.message,
      }));
      return NextResponse.json(
        { success: false, errors },
        { status: 400 }
      );
    }

    // Validate payment receipt
    if (!paymentReceiptFile) {
      return NextResponse.json(
        { success: false, errors: [{ field: "paymentReceipt", message: "صورة إيصال الدفع مطلوبة" }] },
        { status: 400 }
      );
    }

    const receiptValidation = imageSchema.safeParse({
      size: paymentReceiptFile.size,
      type: paymentReceiptFile.type,
    });

    if (!receiptValidation.success) {
      const errors = receiptValidation.error.issues.map((e) => ({
        field: "paymentReceipt",
        message: e.message,
      }));
      return NextResponse.json(
        { success: false, errors },
        { status: 400 }
      );
    }

    // Convert profile image to base64 and upload
    const bytes = await profileImageFile.arrayBuffer();
    const buffer = Buffer.from(bytes);
    const base64Image = `data:${profileImageFile.type};base64,${buffer.toString("base64")}`;

    let profileImageUrl: string;
    try {
      profileImageUrl = await uploadImage(base64Image);
    } catch {
      return NextResponse.json(
        { success: false, errors: [{ field: "profileImage", message: "فشل في رفع الصورة، يرجى المحاولة مرة أخرى" }] },
        { status: 500 }
      );
    }

    // Convert payment receipt to base64 and upload
    const receiptBytes = await paymentReceiptFile.arrayBuffer();
    const receiptBuffer = Buffer.from(receiptBytes);
    const base64Receipt = `data:${paymentReceiptFile.type};base64,${receiptBuffer.toString("base64")}`;

    let paymentReceiptUrl: string;
    try {
      paymentReceiptUrl = await uploadImage(base64Receipt);
    } catch {
      return NextResponse.json(
        { success: false, errors: [{ field: "paymentReceipt", message: "فشل في رفع صورة الإيصال، يرجى المحاولة مرة أخرى" }] },
        { status: 500 }
      );
    }

    // Generate member number
    const memberNumber = await generateMemberNumber(validationResult.data.governorate);

    // Create member with temporary QR code
    const member = await prisma.member.create({
      data: {
        memberNumber,
        nationalId: validationResult.data.nationalId,
        fullNameAr: validationResult.data.fullNameAr,
        fullNameEn: validationResult.data.fullNameEn,
        governorate: validationResult.data.governorate,
        memberType: validationResult.data.memberType,
        entityName: validationResult.data.entityName,
        role: validationResult.data.role,
        profileImage: profileImageUrl,
        paymentMethod: validationResult.data.paymentMethod,
        coordinatorName: validationResult.data.coordinatorName || null,
        instapayRef: validationResult.data.instapayRef || null,
        amountPaid: parseFloat(validationResult.data.amountPaid),
        paymentReceipt: paymentReceiptUrl,
        qrCode: "", // Will be updated after creation
      },
    });

    // Generate QR code with the member ID
    const qrCode = await generateQRCode(member.id);

    // Update member with QR code
    await prisma.member.update({
      where: { id: member.id },
      data: { qrCode },
    });

    return NextResponse.json({
      success: true,
      message: "تم تسجيل العضوية بنجاح",
      memberId: member.id,
      memberNumber: member.memberNumber,
    });
  } catch (error) {
    console.error("Registration error:", error);
    return NextResponse.json(
      { success: false, errors: [{ field: "general", message: "حدث خطأ أثناء التسجيل، يرجى المحاولة مرة أخرى" }] },
      { status: 500 }
    );
  }
}
