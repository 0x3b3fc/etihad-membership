"use client";

import { useState, useEffect } from "react";
import Input from "@/components/ui/Input";
import Button from "@/components/ui/Button";
import Spinner from "@/components/ui/Spinner";

interface Settings {
  id: string;
  platformName: string;
  platformSubtitle: string;
  logoUrl: string | null;
  primaryColor: string;
  membershipFee: number;
  instapayNumber: string | null;
  instapayName: string | null;
  enableRegistration: boolean;
}

interface QrUpdateResult {
  success: boolean;
  message: string;
  totalMembers?: number;
  updatedCount?: number;
}

export default function SettingsPage() {
  const [settings, setSettings] = useState<Settings | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isRegeneratingQr, setIsRegeneratingQr] = useState(false);
  const [qrResult, setQrResult] = useState<QrUpdateResult | null>(null);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      const response = await fetch("/api/admin/settings");
      const data = await response.json();
      if (data.success) {
        setSettings(data.data);
      }
    } catch (error) {
      console.error("Error fetching settings:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!settings) return;

    setIsSaving(true);
    setMessage(null);

    try {
      const response = await fetch("/api/admin/settings", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(settings),
      });

      const data = await response.json();

      if (data.success) {
        setMessage({ type: "success", text: data.message });
        setSettings(data.data);
      } else {
        setMessage({ type: "error", text: data.message });
      }
    } catch {
      setMessage({ type: "error", text: "حدث خطأ في حفظ الإعدادات" });
    } finally {
      setIsSaving(false);
    }
  };

  const handleChange = (field: keyof Settings, value: string | number | boolean) => {
    if (!settings) return;
    setSettings({ ...settings, [field]: value });
  };

  const handleRegenerateQrCodes = async () => {
    if (!confirm("هل أنت متأكد من تحديث جميع رموز QR؟ قد يستغرق هذا بعض الوقت.")) {
      return;
    }

    setIsRegeneratingQr(true);
    setQrResult(null);

    try {
      const response = await fetch("/api/admin/regenerate-qrcodes", {
        method: "POST",
      });

      const data = await response.json();
      setQrResult(data);
    } catch {
      setQrResult({ success: false, message: "حدث خطأ في الاتصال بالخادم" });
    } finally {
      setIsRegeneratingQr(false);
    }
  };

  if (isLoading) {
    return (
      <div className="pt-14 lg:pt-0 flex items-center justify-center min-h-[400px]">
        <Spinner size="lg" />
      </div>
    );
  }

  if (!settings) {
    return (
      <div className="pt-14 lg:pt-0 text-center py-12">
        <p className="text-gray-500">حدث خطأ في تحميل الإعدادات</p>
      </div>
    );
  }

  return (
    <div className="pt-14 lg:pt-0">
      {/* Page Header */}
      <div className="mb-6">
        <h1 className="text-xl font-bold text-gray-900">إعدادات المنصة</h1>
        <p className="text-sm text-gray-500 mt-1">تخصيص إعدادات المنصة والتسجيل</p>
      </div>

      {/* Message */}
      {message && (
        <div
          className={`mb-6 p-4 rounded-lg text-sm ${
            message.type === "success"
              ? "bg-green-50 text-green-700 border border-green-200"
              : "bg-red-50 text-red-700 border border-red-200"
          }`}
        >
          {message.text}
        </div>
      )}

      <form onSubmit={handleSubmit}>
        {/* General Settings */}
        <div className="bg-white rounded-lg border border-gray-200 p-6 mb-6">
          <h2 className="text-base font-semibold text-gray-900 mb-4">الإعدادات العامة</h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input
              label="اسم المنصة"
              value={settings.platformName}
              onChange={(e) => handleChange("platformName", e.target.value)}
            />
            <Input
              label="الشعار الفرعي"
              value={settings.platformSubtitle}
              onChange={(e) => handleChange("platformSubtitle", e.target.value)}
            />
            <Input
              label="رابط الشعار"
              value={settings.logoUrl || ""}
              onChange={(e) => handleChange("logoUrl", e.target.value)}
              placeholder="https://..."
            />
            <Input
              label="اللون الأساسي"
              type="color"
              value={settings.primaryColor}
              onChange={(e) => handleChange("primaryColor", e.target.value)}
              className="h-10"
            />
          </div>
        </div>

        {/* Registration Settings */}
        <div className="bg-white rounded-lg border border-gray-200 p-6 mb-6">
          <h2 className="text-base font-semibold text-gray-900 mb-4">إعدادات التسجيل</h2>

          <div className="mb-4">
            <label className="flex items-center gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={settings.enableRegistration}
                onChange={(e) => handleChange("enableRegistration", e.target.checked)}
                className="w-4 h-4 rounded border-gray-300 text-[#1e3a5f] focus:ring-[#1e3a5f]"
              />
              <span className="text-sm text-gray-700">تفعيل التسجيل</span>
            </label>
            <p className="text-xs text-gray-500 mt-1 mr-7">
              عند إيقاف هذا الخيار، لن يتمكن أي شخص من التسجيل كعضو جديد
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input
              label="رسوم العضوية (جنيه)"
              type="number"
              value={settings.membershipFee.toString()}
              onChange={(e) => handleChange("membershipFee", parseFloat(e.target.value) || 0)}
              min="0"
              step="0.01"
            />
          </div>
        </div>

        {/* Payment Settings */}
        <div className="bg-white rounded-lg border border-gray-200 p-6 mb-6">
          <h2 className="text-base font-semibold text-gray-900 mb-4">إعدادات الدفع</h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input
              label="رقم انستاباي"
              value={settings.instapayNumber || ""}
              onChange={(e) => handleChange("instapayNumber", e.target.value)}
              placeholder="01XXXXXXXXX"
            />
            <Input
              label="الاسم على انستاباي"
              value={settings.instapayName || ""}
              onChange={(e) => handleChange("instapayName", e.target.value)}
              placeholder="اسم صاحب الحساب"
            />
          </div>
        </div>

        {/* Submit Button */}
        <div className="flex justify-end">
          <Button type="submit" disabled={isSaving}>
            {isSaving ? (
              <span className="flex items-center gap-2">
                <Spinner size="sm" />
                جاري الحفظ...
              </span>
            ) : (
              "حفظ الإعدادات"
            )}
          </Button>
        </div>
      </form>

      {/* Maintenance Section */}
      <div className="bg-white rounded-lg border border-gray-200 p-6 mt-6">
        <h2 className="text-base font-semibold text-gray-900 mb-4">الصيانة</h2>

        <div className="space-y-4">
          <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
            <div>
              <h3 className="text-sm font-medium text-gray-900">تحديث رموز QR</h3>
              <p className="text-xs text-gray-500 mt-1">
                تحديث جميع رموز QR للأعضاء برابط الموقع الحالي
              </p>
            </div>
            <Button
              type="button"
              variant="secondary"
              onClick={handleRegenerateQrCodes}
              disabled={isRegeneratingQr}
            >
              {isRegeneratingQr ? (
                <span className="flex items-center gap-2">
                  <Spinner size="sm" />
                  جاري التحديث...
                </span>
              ) : (
                "تحديث QR"
              )}
            </Button>
          </div>

          {qrResult && (
            <div
              className={`p-4 rounded-lg text-sm ${
                qrResult.success
                  ? "bg-green-50 text-green-700 border border-green-200"
                  : "bg-red-50 text-red-700 border border-red-200"
              }`}
            >
              <p>{qrResult.message}</p>
              {qrResult.success && qrResult.totalMembers !== undefined && (
                <p className="mt-1 text-xs">
                  تم تحديث {qrResult.updatedCount} من {qrResult.totalMembers} عضو
                </p>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
