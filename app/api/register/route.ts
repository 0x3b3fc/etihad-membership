import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { memberSchema, imageSchema } from "@/lib/validations/member";
import { uploadImage } from "@/lib/cloudinary";
import { generateQRCode } from "@/lib/qrcode";
import { getGovernorateCode, governorates, type Governorate } from "@/lib/data/governorates";
import bcrypt from "bcryptjs";
import crypto from "crypto";

function generatePassword(): string {
  return crypto.randomBytes(8).toString("hex"); // 16 characters
}

async function generateMemberNumber(governorate: string): Promise<string> {
  const prefix = getGovernorateCode(governorate);

  const governorateIndex = governorates.indexOf(governorate as Governorate);
  const baseNumber = governorateIndex * 5000;

  const counter = await prisma.memberCounter.upsert({
    where: { prefix },
    update: { counter: { increment: 1 } },
    create: { id: prefix, prefix, counter: baseNumber + 1 },
  });

  const number = counter.counter.toString().padStart(5, "0");
  return `${prefix}-${number}`;
}

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();

    // البيانات الأساسية
    const nationalId = formData.get("nationalId") as string;
    const fullNameAr = formData.get("fullNameAr") as string;
    const governorate = formData.get("governorate") as string;
    const address = formData.get("address") as string;
    const phone1 = formData.get("phone1") as string;
    const phone2 = formData.get("phone2") as string | null;
    const email = formData.get("email") as string | null;

    // المؤهلات التعليمية
    const memberType = formData.get("memberType") as string;
    const universityName = formData.get("universityName") as string;
    const facultyName = formData.get("facultyName") as string;
    const academicYear = formData.get("academicYear") as string | null;
    const postgraduateStudy = formData.get("postgraduateStudy") as string;

    // الحالة الوظيفية
    const employmentStatus = formData.get("employmentStatus") as string;
    const jobTitle = formData.get("jobTitle") as string | null;
    const employer = formData.get("employer") as string | null;

    // الخبرات والمهارات
    const previousExperiences = formData.get("previousExperiences") as string | null;
    const skills = formData.get("skills") as string | null;

    const profileImageFile = formData.get("profileImage") as File | null;

    // Validate form data
    const validationResult = memberSchema.safeParse({
      nationalId,
      fullNameAr,
      governorate,
      address,
      phone1,
      phone2: phone2 || "",
      email: email || "",
      memberType,
      universityName,
      facultyName,
      academicYear: academicYear || "",
      postgraduateStudy: postgraduateStudy || "none",
      employmentStatus: employmentStatus || "not_working",
      jobTitle: jobTitle || "",
      employer: employer || "",
      previousExperiences: previousExperiences || "",
      skills: skills || "",
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

    const d = validationResult.data;

    // Generate member number
    const memberNumber = await generateMemberNumber(d.governorate);

    // Generate random password
    const plainPassword = generatePassword();
    const hashedPassword = await bcrypt.hash(plainPassword, 12);

    // Build education string and entity name from new fields
    const educationStr = `${d.universityName} - ${d.facultyName}`;
    const fullNameEn = d.fullNameAr; // Use Arabic name as placeholder for English name

    // Create member
    const member = await prisma.member.create({
      data: {
        memberNumber,
        nationalId: d.nationalId,
        password: hashedPassword,
        fullNameAr: d.fullNameAr,
        fullNameEn,
        governorate: d.governorate,
        memberType: d.memberType as "student" | "graduate",
        entityName: educationStr,
        role: d.employmentStatus === "working" ? (d.jobTitle || "عضو") : "عضو",
        profileImage: profileImageUrl,
        qrCode: "",
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
      nationalId: member.nationalId,
      password: plainPassword,
    });
  } catch (error) {
    console.error("Registration error:", error);
    return NextResponse.json(
      { success: false, errors: [{ field: "general", message: "حدث خطأ أثناء التسجيل، يرجى المحاولة مرة أخرى" }] },
      { status: 500 }
    );
  }
}
