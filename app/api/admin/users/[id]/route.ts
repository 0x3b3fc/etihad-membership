import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";
import bcrypt from "bcryptjs";

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

    const admin = await prisma.admin.findUnique({
      where: { id },
      select: {
        id: true,
        email: true,
        name: true,
        createdAt: true,
      },
    });

    if (!admin) {
      return NextResponse.json(
        { success: false, message: "المسؤول غير موجود" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: admin,
    });
  } catch (error) {
    console.error("Error fetching admin:", error);
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
    const { email, password, name } = body;

    // Check if admin exists
    const existingAdmin = await prisma.admin.findUnique({
      where: { id },
    });

    if (!existingAdmin) {
      return NextResponse.json(
        { success: false, message: "المسؤول غير موجود" },
        { status: 404 }
      );
    }

    // Check if email is being changed to an existing one
    if (email && email !== existingAdmin.email) {
      const emailExists = await prisma.admin.findUnique({
        where: { email },
      });

      if (emailExists) {
        return NextResponse.json(
          { success: false, message: "البريد الإلكتروني مستخدم بالفعل" },
          { status: 400 }
        );
      }
    }

    // Prepare update data
    const updateData: { email?: string; name?: string; password?: string } = {};
    if (email) updateData.email = email;
    if (name) updateData.name = name;
    if (password) updateData.password = await bcrypt.hash(password, 10);

    // Update admin
    const admin = await prisma.admin.update({
      where: { id },
      data: updateData,
      select: {
        id: true,
        email: true,
        name: true,
        createdAt: true,
      },
    });

    return NextResponse.json({
      success: true,
      message: "تم تحديث بيانات المسؤول بنجاح",
      data: admin,
    });
  } catch (error) {
    console.error("Error updating admin:", error);
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

    // Check if admin exists
    const existingAdmin = await prisma.admin.findUnique({
      where: { id },
    });

    if (!existingAdmin) {
      return NextResponse.json(
        { success: false, message: "المسؤول غير موجود" },
        { status: 404 }
      );
    }

    // Count total admins
    const totalAdmins = await prisma.admin.count();

    // Prevent deleting the last admin
    if (totalAdmins <= 1) {
      return NextResponse.json(
        { success: false, message: "لا يمكن حذف المسؤول الوحيد في النظام" },
        { status: 400 }
      );
    }

    // Delete admin
    await prisma.admin.delete({
      where: { id },
    });

    return NextResponse.json({
      success: true,
      message: "تم حذف المسؤول بنجاح",
    });
  } catch (error) {
    console.error("Error deleting admin:", error);
    return NextResponse.json(
      { success: false, message: "حدث خطأ أثناء حذف المسؤول" },
      { status: 500 }
    );
  }
}
