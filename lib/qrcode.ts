import QRCode from "qrcode";

export async function generateQRCode(memberId: string): Promise<string> {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
  const memberUrl = `${baseUrl}/member/${memberId}`;

  try {
    const qrCodeDataUrl = await QRCode.toDataURL(memberUrl, {
      width: 300,
      margin: 2,
      color: {
        dark: "#1e3a5f",
        light: "#ffffff",
      },
      errorCorrectionLevel: "M",
    });

    return qrCodeDataUrl;
  } catch (error) {
    console.error("Error generating QR code:", error);
    throw new Error("فشل في إنشاء رمز QR");
  }
}

export function getMemberUrl(memberId: string): string {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
  return `${baseUrl}/member/${memberId}`;
}
