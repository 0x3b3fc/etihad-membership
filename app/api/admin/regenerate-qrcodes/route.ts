import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { generateQRCode } from "@/lib/qrcode";
import { getSession } from "@/lib/auth";

export async function POST() {
  // Check admin authentication
  const session = await getSession();
  if (!session) {
    return NextResponse.json(
      { success: false, message: "غير مصرح" },
      { status: 401 }
    );
  }

  try {
    // Get all members
    const members = await prisma.member.findMany({
      select: { id: true },
    });

    let updatedCount = 0;
    const errors: string[] = [];

    // Regenerate QR codes for each member
    for (const member of members) {
      try {
        const newQrCode = await generateQRCode(member.id);
        await prisma.member.update({
          where: { id: member.id },
          data: { qrCode: newQrCode },
        });
        updatedCount++;
      } catch (error) {
        errors.push(`فشل تحديث العضو ${member.id}`);
        console.error(`Error updating QR for member ${member.id}:`, error);
      }
    }

    return NextResponse.json({
      success: true,
      message: `تم تحديث ${updatedCount} من ${members.length} رمز QR`,
      totalMembers: members.length,
      updatedCount,
      errors: errors.length > 0 ? errors : undefined,
    });
  } catch (error) {
    console.error("Regenerate QR codes error:", error);
    return NextResponse.json(
      { success: false, message: "حدث خطأ أثناء تحديث رموز QR" },
      { status: 500 }
    );
  }
}
