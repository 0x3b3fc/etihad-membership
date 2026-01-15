"use client";

import { useState, useEffect, useRef, useCallback, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import Image from "next/image";
import type { Event, Member } from "@prisma/client";
import Spinner from "@/components/ui/Spinner";

interface EventWithCount extends Event {
  _count: { attendances: number };
}

interface ScanResult {
  success: boolean;
  error?: string;
  message: string;
  data?: {
    member: Pick<Member, "id" | "fullNameAr" | "fullNameEn" | "memberNumber" | "entityName" | "profileImage" | "governorate">;
    event?: { name: string };
    scannedAt: string;
  };
}

function QRScannerContent() {
  const searchParams = useSearchParams();
  const preselectedEventId = searchParams.get("eventId");

  const [events, setEvents] = useState<EventWithCount[]>([]);
  const [selectedEventId, setSelectedEventId] = useState<string>("");
  const [isLoadingEvents, setIsLoadingEvents] = useState(true);
  const [scanResult, setScanResult] = useState<ScanResult | null>(null);
  const [isScanning, setIsScanning] = useState(false);
  const [manualUrl, setManualUrl] = useState("");
  const [attendanceCount, setAttendanceCount] = useState(0);
  const [cameraError, setCameraError] = useState<string | null>(null);

  const scannerRef = useRef<HTMLDivElement>(null);
  const html5QrCodeRef = useRef<{ stop: () => Promise<void> } | null>(null);

  // Fetch active events
  useEffect(() => {
    const fetchEvents = async () => {
      try {
        const response = await fetch("/api/admin/events?activeOnly=true&limit=100");
        const data = await response.json();
        if (data.success) {
          setEvents(data.data);
          if (preselectedEventId) {
            setSelectedEventId(preselectedEventId);
          }
        }
      } catch (error) {
        console.error("Error fetching events:", error);
      } finally {
        setIsLoadingEvents(false);
      }
    };

    fetchEvents();
  }, [preselectedEventId]);

  // Update attendance count when event changes
  useEffect(() => {
    const selectedEvent = events.find((e) => e.id === selectedEventId);
    if (selectedEvent) {
      setAttendanceCount(selectedEvent._count.attendances);
    }
  }, [selectedEventId, events]);

  // Start QR Scanner
  const startScanner = useCallback(async () => {
    if (!scannerRef.current || !selectedEventId) return;

    setCameraError(null);
    setIsScanning(true);

    try {
      const { Html5Qrcode } = await import("html5-qrcode");
      const html5QrCode = new Html5Qrcode("qr-reader");
      html5QrCodeRef.current = html5QrCode;

      await html5QrCode.start(
        { facingMode: "environment" },
        {
          fps: 10,
          qrbox: { width: 250, height: 250 },
        },
        async (decodedText) => {
          // Extract member ID from URL
          const memberId = extractMemberId(decodedText);
          if (memberId) {
            await recordAttendance(memberId);
          }
        },
        () => {
          // QR code not found - ignore
        }
      );
    } catch (error) {
      console.error("Error starting scanner:", error);
      setCameraError("لم نتمكن من الوصول للكاميرا. تأكد من منح الإذن للمتصفح.");
      setIsScanning(false);
    }
  }, [selectedEventId]);

  // Stop QR Scanner
  const stopScanner = useCallback(async () => {
    if (html5QrCodeRef.current) {
      try {
        await html5QrCodeRef.current.stop();
        html5QrCodeRef.current = null;
      } catch {
        // Ignore
      }
    }
    setIsScanning(false);
  }, []);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      stopScanner();
    };
  }, [stopScanner]);

  // Extract member ID from URL
  const extractMemberId = (url: string): string | null => {
    try {
      const urlObj = new URL(url);
      const pathParts = urlObj.pathname.split("/");
      const memberIndex = pathParts.indexOf("member");
      if (memberIndex !== -1 && pathParts[memberIndex + 1]) {
        return pathParts[memberIndex + 1];
      }
    } catch {
      // If not a valid URL, check if it's just an ID
      if (url.match(/^[a-f0-9-]{36}$/i)) {
        return url;
      }
    }
    return null;
  };

  // Record attendance
  const recordAttendance = async (memberId: string) => {
    // Pause scanner during API call
    await stopScanner();

    try {
      const response = await fetch("/api/admin/attendance/scan", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          eventId: selectedEventId,
          memberId,
        }),
      });

      const data: ScanResult = await response.json();
      setScanResult(data);

      if (data.success) {
        // Play success sound
        playSound("success");
        // Update attendance count
        setAttendanceCount((prev) => prev + 1);
        // Update events list
        setEvents((prev) =>
          prev.map((e) =>
            e.id === selectedEventId
              ? { ...e, _count: { attendances: e._count.attendances + 1 } }
              : e
          )
        );
      } else if (data.error === "ALREADY_ATTENDED") {
        playSound("warning");
      } else {
        playSound("error");
      }
    } catch {
      setScanResult({
        success: false,
        error: "SERVER_ERROR",
        message: "حدث خطأ في الاتصال",
      });
      playSound("error");
    }

    // Auto-restart scanner after delay
    setTimeout(() => {
      startScanner();
    }, 2000);
  };

  // Handle manual URL input
  const handleManualSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const memberId = extractMemberId(manualUrl);
    if (memberId) {
      recordAttendance(memberId);
      setManualUrl("");
    } else {
      setScanResult({
        success: false,
        error: "INVALID_URL",
        message: "الرابط غير صالح",
      });
    }
  };

  // Play sound
  const playSound = (type: "success" | "warning" | "error") => {
    const frequencies = {
      success: [523, 659, 784],
      warning: [440, 440],
      error: [200, 200],
    };

    try {
      const audioContext = new (window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext)();
      const freqs = frequencies[type];

      freqs.forEach((freq, index) => {
        const oscillator = audioContext.createOscillator();
        const gainNode = audioContext.createGain();

        oscillator.connect(gainNode);
        gainNode.connect(audioContext.destination);

        oscillator.frequency.value = freq;
        oscillator.type = "sine";

        gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.3);

        oscillator.start(audioContext.currentTime + index * 0.15);
        oscillator.stop(audioContext.currentTime + 0.3 + index * 0.15);
      });
    } catch {
      // Audio not supported
    }
  };

  if (isLoadingEvents) {
    return (
      <div className="pt-14 lg:pt-0 flex items-center justify-center min-h-[400px]">
        <Spinner size="lg" />
      </div>
    );
  }

  return (
    <div className="pt-14 lg:pt-0">
      {/* Page Header */}
      <div className="mb-6">
        <h1 className="text-xl font-bold text-gray-900">مسح QR - تسجيل الحضور</h1>
        <p className="text-sm text-gray-500 mt-1">امسح رمز QR الخاص بالعضو لتسجيل حضوره</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Scanner Section */}
        <div className="space-y-4">
          {/* Event Selection */}
          <div className="bg-white rounded-lg border border-gray-200 p-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              اختر الفعالية
            </label>
            <select
              value={selectedEventId}
              onChange={(e) => {
                setSelectedEventId(e.target.value);
                setScanResult(null);
                stopScanner();
              }}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="">-- اختر فعالية --</option>
              {events.map((event) => (
                <option key={event.id} value={event.id}>
                  {event.name} ({event._count.attendances} حاضر)
                </option>
              ))}
            </select>
          </div>

          {/* QR Scanner */}
          {selectedEventId && (
            <div className="bg-white rounded-lg border border-gray-200 p-4">
              <div className="mb-4">
                <h2 className="font-medium text-gray-900 mb-2">كاميرا المسح</h2>

                {!isScanning ? (
                  <button
                    onClick={startScanner}
                    className="w-full py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center justify-center gap-2"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                    تشغيل الكاميرا
                  </button>
                ) : (
                  <button
                    onClick={stopScanner}
                    className="w-full py-2 bg-red-100 text-red-700 rounded-lg hover:bg-red-200 transition-colors text-sm"
                  >
                    إيقاف الكاميرا
                  </button>
                )}
              </div>

              {cameraError && (
                <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 rounded-lg text-sm">
                  {cameraError}
                </div>
              )}

              <div
                id="qr-reader"
                ref={scannerRef}
                className={`w-full aspect-square bg-gray-100 rounded-lg overflow-hidden ${!isScanning ? "hidden" : ""}`}
              />

              {/* Manual Input */}
              <div className="mt-4 pt-4 border-t border-gray-200">
                <h3 className="text-sm font-medium text-gray-700 mb-2">أو أدخل رابط العضو يدوياً</h3>
                <form onSubmit={handleManualSubmit} className="flex gap-2">
                  <input
                    type="text"
                    value={manualUrl}
                    onChange={(e) => setManualUrl(e.target.value)}
                    placeholder="الصق رابط العضو هنا..."
                    className="flex-1 px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                  <button
                    type="submit"
                    className="px-4 py-2 bg-gray-800 text-white rounded-lg hover:bg-gray-900 transition-colors text-sm"
                  >
                    تسجيل
                  </button>
                </form>
              </div>
            </div>
          )}
        </div>

        {/* Results Section */}
        <div className="space-y-4">
          {/* Stats */}
          {selectedEventId && (
            <div className="bg-white rounded-lg border border-gray-200 p-4">
              <h2 className="font-medium text-gray-900 mb-3">إحصائيات الفعالية</h2>
              <div className="flex items-center gap-4">
                <div className="flex-1 bg-green-50 rounded-lg p-4 text-center">
                  <p className="text-3xl font-bold text-green-600">{attendanceCount}</p>
                  <p className="text-sm text-green-700">حاضر</p>
                </div>
              </div>
            </div>
          )}

          {/* Scan Result */}
          {scanResult && (
            <div
              className={`bg-white rounded-lg border-2 p-4 ${
                scanResult.success
                  ? "border-green-500 bg-green-50"
                  : scanResult.error === "ALREADY_ATTENDED"
                  ? "border-yellow-500 bg-yellow-50"
                  : "border-red-500 bg-red-50"
              }`}
            >
              <div className="flex items-start gap-4">
                <div
                  className={`w-12 h-12 rounded-full flex items-center justify-center flex-shrink-0 ${
                    scanResult.success
                      ? "bg-green-100"
                      : scanResult.error === "ALREADY_ATTENDED"
                      ? "bg-yellow-100"
                      : "bg-red-100"
                  }`}
                >
                  {scanResult.success ? (
                    <svg className="w-6 h-6 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  ) : scanResult.error === "ALREADY_ATTENDED" ? (
                    <svg className="w-6 h-6 text-yellow-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                    </svg>
                  ) : (
                    <svg className="w-6 h-6 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  )}
                </div>

                <div className="flex-1">
                  <p
                    className={`font-medium ${
                      scanResult.success
                        ? "text-green-800"
                        : scanResult.error === "ALREADY_ATTENDED"
                        ? "text-yellow-800"
                        : "text-red-800"
                    }`}
                  >
                    {scanResult.message}
                  </p>

                  {scanResult.data?.member && (
                    <div className="mt-3 flex items-center gap-3">
                      <div className="w-14 h-14 rounded-full overflow-hidden bg-gray-200 flex-shrink-0">
                        {scanResult.data.member.profileImage ? (
                          <Image
                            src={scanResult.data.member.profileImage}
                            alt={scanResult.data.member.fullNameAr}
                            width={56}
                            height={56}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-gray-500">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                            </svg>
                          </div>
                        )}
                      </div>
                      <div>
                        <p className="font-semibold text-gray-900">{scanResult.data.member.fullNameAr}</p>
                        <p className="text-sm text-gray-600">{scanResult.data.member.memberNumber}</p>
                        <p className="text-xs text-gray-500">{scanResult.data.member.entityName}</p>
                      </div>
                    </div>
                  )}

                  {scanResult.data?.scannedAt && (
                    <p className="mt-2 text-xs text-gray-500">
                      الوقت: {new Date(scanResult.data.scannedAt).toLocaleTimeString("ar-EG")}
                    </p>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Instructions */}
          {selectedEventId && !scanResult && (
            <div className="bg-blue-50 rounded-lg border border-blue-200 p-4">
              <h3 className="font-medium text-blue-800 mb-2">تعليمات</h3>
              <ul className="text-sm text-blue-700 space-y-1">
                <li>1. وجّه الكاميرا نحو رمز QR الخاص بالعضو</li>
                <li>2. انتظر حتى يتم التعرف على الرمز</li>
                <li>3. سيتم تسجيل الحضور تلقائياً</li>
              </ul>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default function ScanPage() {
  return (
    <Suspense fallback={<div className="pt-14 lg:pt-0 flex items-center justify-center min-h-[400px]"><Spinner size="lg" /></div>}>
      <QRScannerContent />
    </Suspense>
  );
}
