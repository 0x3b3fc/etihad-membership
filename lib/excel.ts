import * as XLSX from "xlsx";
import type { Member } from "@prisma/client";

interface ExcelMember {
  "رقم العضوية": string;
  "الرقم القومي": string;
  "الاسم بالعربية": string;
  "الاسم بالإنجليزية": string;
  "المحافظة": string;
  "نوع العضو": string;
  "الوحدة/اللجنة": string;
  "الصفة": string;
  "طريقة الدفع": string;
  "اسم المنسق": string;
  "رقم Instapay": string;
  "رابط الصورة": string;
  "رابط إيصال الدفع": string;
  "رابط QR": string;
  "تاريخ التسجيل": string;
}

export function generateExcel(members: Member[]): Buffer {
  const data: ExcelMember[] = members.map((member) => ({
    "رقم العضوية": member.memberNumber,
    "الرقم القومي": member.nationalId,
    "الاسم بالعربية": member.fullNameAr,
    "الاسم بالإنجليزية": member.fullNameEn,
    "المحافظة": member.governorate,
    "نوع العضو": member.memberType === "student" ? "طالب" : "خريج",
    "الوحدة/اللجنة": member.entityName,
    "الصفة": member.role,
    "طريقة الدفع": member.paymentMethod === "coordinator" ? "منسق المحافظة" : "Instapay",
    "اسم المنسق": member.coordinatorName || "-",
    "رقم Instapay": member.instapayRef || "-",
    "رابط الصورة": member.profileImage,
    "رابط إيصال الدفع": member.paymentReceipt || "-",
    "رابط QR": member.qrCode,
    "تاريخ التسجيل": new Date(member.createdAt).toLocaleDateString("ar-EG", {
      year: "numeric",
      month: "long",
      day: "numeric",
    }),
  }));

  const worksheet = XLSX.utils.json_to_sheet(data, {
    header: [
      "رقم العضوية",
      "الرقم القومي",
      "الاسم بالعربية",
      "الاسم بالإنجليزية",
      "المحافظة",
      "نوع العضو",
      "الوحدة/اللجنة",
      "الصفة",
      "طريقة الدفع",
      "اسم المنسق",
      "رقم Instapay",
      "رابط الصورة",
      "رابط إيصال الدفع",
      "رابط QR",
      "تاريخ التسجيل",
    ],
  });

  // Set RTL for the worksheet
  worksheet["!dir"] = "rtl";

  // Set column widths
  worksheet["!cols"] = [
    { wch: 12 }, // رقم العضوية
    { wch: 16 }, // الرقم القومي
    { wch: 30 }, // الاسم بالعربية
    { wch: 30 }, // الاسم بالإنجليزية
    { wch: 15 }, // المحافظة
    { wch: 10 }, // نوع العضو
    { wch: 35 }, // الوحدة/اللجنة
    { wch: 20 }, // الصفة
    { wch: 15 }, // طريقة الدفع
    { wch: 20 }, // اسم المنسق
    { wch: 20 }, // رقم Instapay
    { wch: 50 }, // رابط الصورة
    { wch: 50 }, // رابط إيصال الدفع
    { wch: 50 }, // رابط QR
    { wch: 20 }, // تاريخ التسجيل
  ];

  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, "الأعضاء");

  const buffer = XLSX.write(workbook, { type: "buffer", bookType: "xlsx" });
  return buffer;
}
