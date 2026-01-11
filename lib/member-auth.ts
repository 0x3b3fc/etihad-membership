import { cookies } from "next/headers";
import { prisma } from "./prisma";

export async function getMemberSession() {
  const cookieStore = await cookies();
  const memberId = cookieStore.get("member_session")?.value;

  if (!memberId) {
    return null;
  }

  const member = await prisma.member.findUnique({
    where: { id: memberId },
    select: {
      id: true,
      memberNumber: true,
      nationalId: true,
      fullNameAr: true,
      fullNameEn: true,
      governorate: true,
      memberType: true,
      entityName: true,
      role: true,
      profileImage: true,
      qrCode: true,
      createdAt: true,
    },
  });

  return member;
}
