"use server";

import { prisma } from "@/lib/prisma";

export async function getSiteName() {
  const settings = await prisma.settings.findUnique({
    where: { id: "default" },
    select: { platformName: true },
  });

  return settings?.platformName || "عضويتي";
}

export async function getSettings() {
  return prisma.settings.findUnique({
    where: { id: "default" },
  });
}
