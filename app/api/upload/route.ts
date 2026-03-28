import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { uploadImage } from "@/lib/cloudinary";

export async function POST(request: NextRequest) {
  const cookieStore = await cookies();
  const memberId = cookieStore.get("member_session")?.value;

  if (!memberId) {
    return NextResponse.json({ error: "غير مصرح" }, { status: 401 });
  }

  try {
    const formData = await request.formData();
    const file = formData.get("file") as File;

    if (!file) {
      return NextResponse.json({ error: "لم يتم اختيار صورة" }, { status: 400 });
    }

    // Validate file type
    if (!["image/jpeg", "image/jpg", "image/png", "image/webp"].includes(file.type)) {
      return NextResponse.json({ error: "يجب أن تكون الصورة بصيغة JPG أو PNG" }, { status: 400 });
    }

    // Validate file size (2MB)
    if (file.size > 2 * 1024 * 1024) {
      return NextResponse.json({ error: "حجم الصورة يجب أن يكون أقل من 2 ميجابايت" }, { status: 400 });
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    const base64 = `data:${file.type};base64,${buffer.toString("base64")}`;

    const url = await uploadImage(base64);

    return NextResponse.json({ success: true, url });
  } catch (error) {
    console.error("Upload error:", error);
    return NextResponse.json({ error: "فشل في رفع الصورة" }, { status: 500 });
  }
}
