import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json(
        { success: false, message: "غير مصرح" },
        { status: 401 }
      );
    }

    const { id } = await params;

    const member = await prisma.member.findUnique({
      where: { id },
    });

    if (!member) {
      return NextResponse.json(
        { success: false, message: "العضو غير موجود" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: member,
    });
  } catch (error) {
    console.error("Error fetching member:", error);
    return NextResponse.json(
      { success: false, message: "حدث خطأ أثناء جلب البيانات" },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json(
        { success: false, message: "غير مصرح" },
        { status: 401 }
      );
    }

    const { id } = await params;
    const body = await request.json();

    // Check if member exists
    const existingMember = await prisma.member.findUnique({
      where: { id },
    });

    if (!existingMember) {
      return NextResponse.json(
        { success: false, message: "العضو غير موجود" },
        { status: 404 }
      );
    }

    // Check if nationalId is being changed to an existing one
    if (body.nationalId && body.nationalId !== existingMember.nationalId) {
      const nationalIdExists = await prisma.member.findUnique({
        where: { nationalId: body.nationalId },
      });

      if (nationalIdExists) {
        return NextResponse.json(
          { success: false, message: "الرقم القومي مستخدم بالفعل" },
          { status: 400 }
        );
      }
    }

    // Update member
    const updatedMember = await prisma.member.update({
      where: { id },
      data: {
        fullNameAr: body.fullNameAr,
        fullNameEn: body.fullNameEn,
        nationalId: body.nationalId,
        governorate: body.governorate,
        memberType: body.memberType,
        entityName: body.entityName,
        role: body.role,
        paymentMethod: body.paymentMethod,
        coordinatorName: body.coordinatorName || null,
        instapayRef: body.instapayRef || null,
      },
    });

    return NextResponse.json({
      success: true,
      message: "تم تحديث بيانات العضو بنجاح",
      data: updatedMember,
    });
  } catch (error) {
    console.error("Error updating member:", error);
    return NextResponse.json(
      { success: false, message: "حدث خطأ أثناء تحديث البيانات" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json(
        { success: false, message: "غير مصرح" },
        { status: 401 }
      );
    }

    const { id } = await params;

    // Check if member exists
    const existingMember = await prisma.member.findUnique({
      where: { id },
    });

    if (!existingMember) {
      return NextResponse.json(
        { success: false, message: "العضو غير موجود" },
        { status: 404 }
      );
    }

    // Delete member
    await prisma.member.delete({
      where: { id },
    });

    return NextResponse.json({
      success: true,
      message: "تم حذف العضو بنجاح",
    });
  } catch (error) {
    console.error("Error deleting member:", error);
    return NextResponse.json(
      { success: false, message: "حدث خطأ أثناء حذف العضو" },
      { status: 500 }
    );
  }
}
