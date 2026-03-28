"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import Button from "@/components/ui/Button";
import Spinner from "@/components/ui/Spinner";

// PDF page dimensions in points (A4)
const PDF_WIDTH = 595.5;
const PDF_HEIGHT = 842.25;

interface FieldPosition {
  label: string;
  type: "rtl" | "check" | "image" | "nationalId" | "nidBox";
  yTop: number;
  size?: number;
  // RTL fields
  xRight?: number;
  // LTR/check/nidBox fields
  x?: number;
  // Image & resizable fields
  width?: number;
  height?: number;
  // Check fields custom size
  checkSize?: number;
  // Legacy National ID fields
  startCenterX?: number;
  boxWidth?: number;
}

interface TemplateFields {
  [key: string]: FieldPosition;
}

interface DragState {
  fieldKey: string;
  startX: number;
  startY: number;
  origFieldX: number;
  origFieldY: number;
}

// Resize handle state
interface ResizeState {
  fieldKey: string;
  startX: number;
  startY: number;
  origWidth: number;
  origHeight: number;
}

export default function TemplateDesignerPage() {
  const [fields, setFields] = useState<TemplateFields | null>(null);
  const [selectedField, setSelectedField] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [message, setMessage] = useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);
  const [dragState, setDragState] = useState<DragState | null>(null);
  const [resizeState, setResizeState] = useState<ResizeState | null>(null);
  const [scale, setScale] = useState(1);
  const [pdfBgUrl, setPdfBgUrl] = useState<string | null>(null);
  const canvasRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // Calculate scale based on container width
  useEffect(() => {
    const updateScale = () => {
      if (containerRef.current) {
        const containerWidth = containerRef.current.clientWidth;
        const newScale = Math.min((containerWidth - 32) / PDF_WIDTH, 1.2);
        setScale(newScale);
      }
    };
    updateScale();
    window.addEventListener("resize", updateScale);
    return () => window.removeEventListener("resize", updateScale);
  }, []);

  // Render PDF template as background image (dynamic import to avoid SSR issues)
  useEffect(() => {
    const renderPdf = async () => {
      try {
        const pdfjsLib = await import("pdfjs-dist");
        pdfjsLib.GlobalWorkerOptions.workerSrc = "/pdf.worker.min.mjs";

        const pdf = await pdfjsLib.getDocument("/membership-form-template.pdf").promise;
        const page = await pdf.getPage(1);
        const viewport = page.getViewport({ scale: 2 });
        const canvas = document.createElement("canvas");
        canvas.width = viewport.width;
        canvas.height = viewport.height;
        const ctx = canvas.getContext("2d");
        if (!ctx) return;
        await page.render({ canvasContext: ctx, viewport, canvas }).promise;
        setPdfBgUrl(canvas.toDataURL("image/png"));
      } catch (err) {
        console.error("Failed to render PDF background:", err);
      }
    };
    renderPdf();
  }, []);

  // Load template
  useEffect(() => {
    fetchTemplate();
  }, []);

  const fetchTemplate = async () => {
    try {
      const res = await fetch("/api/admin/templates");
      const data = await res.json();
      if (data.success) {
        setFields(data.data.fields);
      }
    } catch {
      setMessage({ type: "error", text: "خطأ في تحميل القالب" });
    } finally {
      setIsLoading(false);
    }
  };

  const handleSave = async () => {
    if (!fields) return;
    setIsSaving(true);
    setMessage(null);
    try {
      const res = await fetch("/api/admin/templates", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ fields }),
      });
      const data = await res.json();
      if (data.success) {
        setMessage({ type: "success", text: data.message });
      } else {
        setMessage({ type: "error", text: data.error || "خطأ في الحفظ" });
      }
    } catch {
      setMessage({ type: "error", text: "خطأ في الاتصال بالخادم" });
    } finally {
      setIsSaving(false);
    }
  };

  const handleReset = async () => {
    if (!confirm("هل أنت متأكد من إعادة تعيين القالب للإعدادات الافتراضية؟")) return;
    setIsSaving(true);
    try {
      const res = await fetch("/api/admin/templates", { method: "POST" });
      const data = await res.json();
      if (data.success) {
        setFields(data.data.fields);
        setMessage({ type: "success", text: data.message });
      }
    } catch {
      setMessage({ type: "error", text: "خطأ في إعادة التعيين" });
    } finally {
      setIsSaving(false);
    }
  };

  // Get the visual x,y position of a field for rendering on canvas
  const getFieldVisualPosition = (field: FieldPosition) => {
    let x: number;
    const y = field.yTop;

    if (field.type === "rtl") {
      x = (field.xRight || 0) - (field.width ?? 120);
    } else if (field.type === "nationalId") {
      x = (field.startCenterX || 0) - 14 * (field.boxWidth || 22);
    } else {
      // check, image, nidBox — all use x
      x = field.x || 0;
    }

    return { x, y };
  };

  // Get the display dimensions of a field element
  const getFieldDimensions = (field: FieldPosition) => {
    if (field.type === "image") {
      return { width: field.width || 104, height: field.height || 105 };
    }
    if (field.type === "nationalId") {
      return { width: field.width ?? 14 * (field.boxWidth || 22), height: field.height ?? 20 };
    }
    if (field.type === "nidBox") {
      return { width: field.width ?? 10, height: field.height ?? 14 };
    }
    if (field.type === "check") {
      return { width: field.width ?? 20, height: field.height ?? 20 };
    }
    // RTL text fields
    return { width: field.width ?? 120, height: field.height ?? 18 };
  };

  // Mouse down on a field — start dragging
  const handleFieldMouseDown = useCallback(
    (e: React.MouseEvent, fieldKey: string) => {
      e.stopPropagation();
      e.preventDefault();
      if (!fields) return;

      const field = fields[fieldKey];
      const pos = getFieldVisualPosition(field);

      setSelectedField(fieldKey);
      setDragState({
        fieldKey,
        startX: e.clientX,
        startY: e.clientY,
        origFieldX: pos.x,
        origFieldY: pos.y,
      });
    },
    [fields]
  );

  // Mouse down on resize handle
  const handleResizeMouseDown = useCallback(
    (e: React.MouseEvent, fieldKey: string) => {
      e.stopPropagation();
      e.preventDefault();
      if (!fields) return;
      const field = fields[fieldKey];
      const dims = getFieldDimensions(field);

      setResizeState({
        fieldKey,
        startX: e.clientX,
        startY: e.clientY,
        origWidth: dims.width,
        origHeight: dims.height,
      });
    },
    [fields]
  );

  // Mouse move — handle dragging or resizing
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (dragState && fields) {
        const dx = (e.clientX - dragState.startX) / scale;
        const dy = (e.clientY - dragState.startY) / scale;

        const newX = dragState.origFieldX + dx;
        const newY = dragState.origFieldY + dy;

        setFields((prev) => {
          if (!prev) return prev;
          const field = { ...prev[dragState.fieldKey] };
          field.yTop = Math.max(0, Math.min(PDF_HEIGHT - 20, Math.round(newY)));

          if (field.type === "rtl") {
            field.xRight = Math.round(newX + (field.width ?? 120));
          } else if (field.type === "nationalId") {
            field.startCenterX = Math.round(newX + 14 * (field.boxWidth || 22));
          } else {
            // check, image, nidBox
            field.x = Math.max(0, Math.round(newX));
          }

          return { ...prev, [dragState.fieldKey]: field };
        });
      }

      if (resizeState && fields) {
        const dx = (e.clientX - resizeState.startX) / scale;
        const dy = (e.clientY - resizeState.startY) / scale;

        setFields((prev) => {
          if (!prev) return prev;
          const field = { ...prev[resizeState.fieldKey] };
          field.width = Math.max(10, Math.round(resizeState.origWidth + dx));
          field.height = Math.max(10, Math.round(resizeState.origHeight + dy));
          return { ...prev, [resizeState.fieldKey]: field };
        });
      }
    };

    const handleMouseUp = () => {
      setDragState(null);
      setResizeState(null);
    };

    if (dragState || resizeState) {
      window.addEventListener("mousemove", handleMouseMove);
      window.addEventListener("mouseup", handleMouseUp);
      return () => {
        window.removeEventListener("mousemove", handleMouseMove);
        window.removeEventListener("mouseup", handleMouseUp);
      };
    }
  }, [dragState, resizeState, fields, scale]);

  // Update a field property from the sidebar
  const updateFieldProp = (
    fieldKey: string,
    prop: string,
    value: number
  ) => {
    setFields((prev) => {
      if (!prev) return prev;
      return {
        ...prev,
        [fieldKey]: { ...prev[fieldKey], [prop]: value },
      };
    });
  };

  if (isLoading) {
    return (
      <div className="pt-14 lg:pt-0 flex items-center justify-center min-h-[400px]">
        <Spinner size="lg" />
      </div>
    );
  }

  if (!fields) {
    return (
      <div className="pt-14 lg:pt-0 text-center py-12">
        <p className="text-gray-500">خطأ في تحميل القالب</p>
      </div>
    );
  }

  const selectedFieldData = selectedField ? fields[selectedField] : null;

  return (
    <div className="pt-14 lg:pt-0">
      {/* Header */}
      <div className="mb-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-xl font-bold text-gray-900">مصمم القالب</h1>
          <p className="text-sm text-gray-500 mt-1">
            اسحب العناصر لتحديد مواقعها على استمارة العضوية
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={handleReset} disabled={isSaving}>
            إعادة تعيين
          </Button>
          <Button onClick={handleSave} disabled={isSaving}>
            {isSaving ? (
              <span className="flex items-center gap-2">
                <Spinner size="sm" />
                جاري الحفظ...
              </span>
            ) : (
              "حفظ القالب"
            )}
          </Button>
        </div>
      </div>

      {/* Message */}
      {message && (
        <div
          className={`mb-4 p-3 rounded-lg text-sm ${
            message.type === "success"
              ? "bg-green-50 text-green-700 border border-green-200"
              : "bg-red-50 text-red-700 border border-red-200"
          }`}
        >
          {message.text}
        </div>
      )}

      <div className="flex flex-col lg:flex-row gap-4">
        {/* Canvas Area */}
        <div
          ref={containerRef}
          className="flex-1 bg-gray-100 rounded-lg border border-gray-200 overflow-auto p-4"
        >
          <div
            ref={canvasRef}
            className="relative bg-white shadow-lg mx-auto"
            style={{
              width: PDF_WIDTH * scale,
              height: PDF_HEIGHT * scale,
            }}
            onClick={() => setSelectedField(null)}
          >
            {/* PDF template background */}
            {pdfBgUrl && (
              <img
                src={pdfBgUrl}
                alt="PDF Template"
                className="absolute inset-0 w-full h-full pointer-events-none"
                draggable={false}
              />
            )}

            {/* Grid overlay when no PDF */}
            {!pdfBgUrl && (
              <div
                className="absolute inset-0 opacity-10"
                style={{
                  backgroundImage:
                    "linear-gradient(#000 1px, transparent 1px), linear-gradient(90deg, #000 1px, transparent 1px)",
                  backgroundSize: `${50 * scale}px ${50 * scale}px`,
                }}
              />
            )}

            {/* Info overlay */}
            <div className="absolute top-2 left-2 bg-black/60 text-white text-[10px] px-2 py-1 rounded z-10">
              {Math.round(PDF_WIDTH)} × {Math.round(PDF_HEIGHT)} pt (A4)
            </div>

            {/* Render draggable fields */}
            {Object.entries(fields).map(([key, field]) => {
              const pos = getFieldVisualPosition(field);
              const dims = getFieldDimensions(field);
              const isSelected = selectedField === key;
              const isDragging = dragState?.fieldKey === key;

              // Color by type
              const bgColor =
                field.type === "image"
                  ? "bg-purple-100 border-purple-400"
                  : field.type === "check"
                  ? "bg-green-100 border-green-400"
                  : field.type === "nationalId" || field.type === "nidBox"
                  ? "bg-orange-100 border-orange-400"
                  : "bg-blue-100 border-blue-400";

              const selectedRing = isSelected ? "ring-2 ring-blue-500 ring-offset-1" : "";

              return (
                <div
                  key={key}
                  className={`absolute border ${bgColor} ${selectedRing} cursor-move select-none flex items-center justify-center overflow-hidden rounded-sm ${
                    isDragging ? "opacity-80 z-30" : "z-20"
                  }`}
                  style={{
                    left: pos.x * scale,
                    top: pos.y * scale,
                    width: dims.width * scale,
                    height: dims.height * scale,
                    fontSize: Math.max(8, 10 * scale),
                  }}
                  onMouseDown={(e) => handleFieldMouseDown(e, key)}
                  title={field.label}
                >
                  <span className="truncate px-1 text-gray-700 font-medium leading-none">
                    {field.label}
                  </span>

                  {/* Resize handle — visible on all selected fields */}
                  {isSelected && (
                    <div
                      className="absolute bottom-0 left-0 w-3 h-3 bg-blue-500 cursor-se-resize rounded-tr-sm"
                      onMouseDown={(e) => handleResizeMouseDown(e, key)}
                    />
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Properties Panel */}
        <div className="w-full lg:w-72 bg-white rounded-lg border border-gray-200 p-4 lg:max-h-[calc(100vh-12rem)] overflow-y-auto">
          <h2 className="text-sm font-semibold text-gray-900 mb-3">العناصر</h2>

          {/* Field list */}
          <div className="space-y-1 mb-4">
            {Object.entries(fields).map(([key, field]) => {
              const isSelected = selectedField === key;
              const typeColor =
                field.type === "image"
                  ? "text-purple-600"
                  : field.type === "check"
                  ? "text-green-600"
                  : field.type === "nationalId" || field.type === "nidBox"
                  ? "text-orange-600"
                  : "text-blue-600";

              return (
                <button
                  key={key}
                  className={`w-full text-right px-3 py-2 rounded-md text-sm transition-colors ${
                    isSelected
                      ? "bg-blue-50 text-blue-700 font-medium"
                      : "text-gray-600 hover:bg-gray-50"
                  }`}
                  onClick={() => setSelectedField(key)}
                >
                  <span className={`text-xs ml-2 ${typeColor}`}>
                    {field.type === "rtl"
                      ? "نص"
                      : field.type === "check"
                      ? "✓"
                      : field.type === "image"
                      ? "صورة"
                      : field.type === "nidBox"
                      ? "خانة"
                      : "رقم"}
                  </span>
                  {field.label}
                </button>
              );
            })}
          </div>

          {/* Selected field properties */}
          {selectedField && selectedFieldData && (
            <div className="border-t border-gray-200 pt-4">
              <h3 className="text-sm font-semibold text-gray-900 mb-3">
                خصائص: {selectedFieldData.label}
              </h3>
              <div className="space-y-3">
                {/* yTop — all fields have it */}
                <div>
                  <label className="block text-xs text-gray-500 mb-1">
                    Y (من الأعلى)
                  </label>
                  <input
                    type="number"
                    className="w-full px-2 py-1.5 border border-gray-300 rounded text-sm"
                    value={selectedFieldData.yTop}
                    onChange={(e) =>
                      updateFieldProp(selectedField, "yTop", Number(e.target.value))
                    }
                  />
                </div>

                {/* xRight for RTL */}
                {selectedFieldData.type === "rtl" && (
                  <>
                    <div>
                      <label className="block text-xs text-gray-500 mb-1">
                        X يمين (xRight)
                      </label>
                      <input
                        type="number"
                        className="w-full px-2 py-1.5 border border-gray-300 rounded text-sm"
                        value={selectedFieldData.xRight || 0}
                        onChange={(e) =>
                          updateFieldProp(selectedField, "xRight", Number(e.target.value))
                        }
                      />
                    </div>
                    <div>
                      <label className="block text-xs text-gray-500 mb-1">
                        حجم الخط
                      </label>
                      <input
                        type="number"
                        className="w-full px-2 py-1.5 border border-gray-300 rounded text-sm"
                        value={selectedFieldData.size || 9}
                        onChange={(e) =>
                          updateFieldProp(selectedField, "size", Number(e.target.value))
                        }
                      />
                    </div>
                  </>
                )}

                {/* x for check/image/nidBox */}
                {(selectedFieldData.type === "check" ||
                  selectedFieldData.type === "image" ||
                  selectedFieldData.type === "nidBox") && (
                  <div>
                    <label className="block text-xs text-gray-500 mb-1">
                      X (من اليسار)
                    </label>
                    <input
                      type="number"
                      className="w-full px-2 py-1.5 border border-gray-300 rounded text-sm"
                      value={selectedFieldData.x || 0}
                      onChange={(e) =>
                        updateFieldProp(selectedField, "x", Number(e.target.value))
                      }
                    />
                  </div>
                )}

                {/* Width & Height — all field types */}
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block text-xs text-gray-500 mb-1">
                      العرض
                    </label>
                    <input
                      type="number"
                      className="w-full px-2 py-1.5 border border-gray-300 rounded text-sm"
                      value={getFieldDimensions(selectedFieldData).width}
                      onChange={(e) =>
                        updateFieldProp(selectedField, "width", Number(e.target.value))
                      }
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-gray-500 mb-1">
                      الارتفاع
                    </label>
                    <input
                      type="number"
                      className="w-full px-2 py-1.5 border border-gray-300 rounded text-sm"
                      value={getFieldDimensions(selectedFieldData).height}
                      onChange={(e) =>
                        updateFieldProp(selectedField, "height", Number(e.target.value))
                      }
                    />
                  </div>
                </div>

                {/* Font size for nidBox */}
                {selectedFieldData.type === "nidBox" && (
                  <div>
                    <label className="block text-xs text-gray-500 mb-1">
                      حجم الخط
                    </label>
                    <input
                      type="number"
                      className="w-full px-2 py-1.5 border border-gray-300 rounded text-sm"
                      value={selectedFieldData.size || 9}
                      onChange={(e) =>
                        updateFieldProp(selectedField, "size", Number(e.target.value))
                      }
                    />
                  </div>
                )}

                {/* Legacy National ID */}
                {selectedFieldData.type === "nationalId" && (
                  <>
                    <div>
                      <label className="block text-xs text-gray-500 mb-1">
                        X مركز البداية (startCenterX)
                      </label>
                      <input
                        type="number"
                        className="w-full px-2 py-1.5 border border-gray-300 rounded text-sm"
                        value={selectedFieldData.startCenterX || 529}
                        onChange={(e) =>
                          updateFieldProp(
                            selectedField,
                            "startCenterX",
                            Number(e.target.value)
                          )
                        }
                      />
                    </div>
                    <div>
                      <label className="block text-xs text-gray-500 mb-1">
                        عرض الخانة (boxWidth)
                      </label>
                      <input
                        type="number"
                        className="w-full px-2 py-1.5 border border-gray-300 rounded text-sm"
                        value={selectedFieldData.boxWidth || 22}
                        onChange={(e) =>
                          updateFieldProp(
                            selectedField,
                            "boxWidth",
                            Number(e.target.value)
                          )
                        }
                      />
                    </div>
                    <div>
                      <label className="block text-xs text-gray-500 mb-1">
                        حجم الخط
                      </label>
                      <input
                        type="number"
                        className="w-full px-2 py-1.5 border border-gray-300 rounded text-sm"
                        value={selectedFieldData.size || 9}
                        onChange={(e) =>
                          updateFieldProp(selectedField, "size", Number(e.target.value))
                        }
                      />
                    </div>
                  </>
                )}
              </div>
            </div>
          )}

          {/* Legend */}
          <div className="border-t border-gray-200 pt-4 mt-4">
            <h3 className="text-xs font-semibold text-gray-500 mb-2">الألوان</h3>
            <div className="space-y-1 text-xs text-gray-500">
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 rounded bg-blue-100 border border-blue-400" />
                نص (RTL)
              </div>
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 rounded bg-green-100 border border-green-400" />
                علامة صح
              </div>
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 rounded bg-orange-100 border border-orange-400" />
                خانة رقم قومي
              </div>
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 rounded bg-purple-100 border border-purple-400" />
                صورة
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
