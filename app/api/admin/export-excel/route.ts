import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";
import { generateExcel } from "@/lib/excel";

export async function GET(request: NextRequest) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json(
        { success: false, message: "غير مصرح" },
        { status: 401 }
      );
    }

    // Get filter parameters
    const searchParams = request.nextUrl.searchParams;
    const search = searchParams.get("search") || "";
    const governorate = searchParams.get("governorate") || "";
    const entityName = searchParams.get("entityName") || "";

    // Build where clause
    const where = {
      AND: [
        search
          ? {
              OR: [
                { fullNameAr: { contains: search, mode: "insensitive" as const } },
                { fullNameEn: { contains: search, mode: "insensitive" as const } },
                { nationalId: { contains: search, mode: "insensitive" as const } },
                { memberNumber: { contains: search, mode: "insensitive" as const } },
              ],
            }
          : {},
        governorate ? { governorate } : {},
        entityName ? { entityName } : {},
      ],
    };

    const members = await prisma.member.findMany({
      where,
      orderBy: { createdAt: "desc" },
    });

    const excelBuffer = generateExcel(members);

    const date = new Date().toISOString().split("T")[0];
    const governorateSuffix = governorate ? `-${governorate}` : "";
    const entitySuffix = entityName ? `-${entityName}` : "";
    const filename = `أعضاء-الاتحاد${governorateSuffix}${entitySuffix}-${date}.xlsx`;

    return new NextResponse(new Uint8Array(excelBuffer), {
      headers: {
        "Content-Type": "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        "Content-Disposition": `attachment; filename="${encodeURIComponent(filename)}"`,
      },
    });
  } catch (error) {
    console.error("Error exporting Excel:", error);
    return NextResponse.json(
      { success: false, message: "حدث خطأ أثناء تصدير البيانات" },
      { status: 500 }
    );
  }
}
