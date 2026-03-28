"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import Button from "@/components/ui/Button";
import Spinner from "@/components/ui/Spinner";

// Card image dimensions in pixels
const CARD_WIDTH = 647;
const CARD_HEIGHT = 409;

interface FieldPosition {
  label: string;
  type: "text" | "image";
  yTop: number;
  x: number;
  size?: number;
  width?: number;
  height?: number;
}

interface TemplateFields {
  [key: string]: FieldPosition;
}

interface DragState {
  fieldKey: string;
  startX: number;
  startY: number;
  origX: number;
  origY: number;
}

interface ResizeState {
  fieldKey: string;
  startX: number;
  startY: number;
  origWidth: number;
  origHeight: number;
}

export default function CardDesignerPage() {
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
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const updateScale = () => {
      if (containerRef.current) {
        const containerWidth = containerRef.current.clientWidth;
        const newScale = Math.min((containerWidth - 32) / CARD_WIDTH, 1.5);
        setScale(newScale);
      }
    };
    updateScale();
    window.addEventListener("resize", updateScale);
    return () => window.removeEventListener("resize", updateScale);
  }, []);

  useEffect(() => {
    fetchTemplate();
  }, []);

  const fetchTemplate = async () => {
    try {
      const res = await fetch("/api/admin/templates/card");
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
      const res = await fetch("/api/admin/templates/card", {
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
      const res = await fetch("/api/admin/templates/card", { method: "POST" });
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

  const getFieldDimensions = (field: FieldPosition) => {
    if (field.type === "image") {
      return { width: field.width || 100, height: field.height || 100 };
    }
    return { width: field.width ?? 140, height: field.height ?? 20 };
  };

  const handleFieldMouseDown = useCallback(
    (e: React.MouseEvent, fieldKey: string) => {
      e.stopPropagation();
      e.preventDefault();
      if (!fields) return;
      const field = fields[fieldKey];
      setSelectedField(fieldKey);
      setDragState({
        fieldKey,
        startX: e.clientX,
        startY: e.clientY,
        origX: field.x,
        origY: field.yTop,
      });
    },
    [fields]
  );

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

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (dragState && fields) {
        const dx = (e.clientX - dragState.startX) / scale;
        const dy = (e.clientY - dragState.startY) / scale;
        setFields((prev) => {
          if (!prev) return prev;
          const field = { ...prev[dragState.fieldKey] };
          field.x = Math.max(0, Math.round(dragState.origX + dx));
          field.yTop = Math.max(0, Math.min(CARD_HEIGHT - 10, Math.round(dragState.origY + dy)));
          return { ...prev, [dragState.fieldKey]: field };
        });
      }
      if (resizeState && fields) {
        const dx = (e.clientX - resizeState.startX) / scale;
        const dy = (e.clientY - resizeState.startY) / scale;
        setFields((prev) => {
          if (!prev) return prev;
          const field = { ...prev[resizeState.fieldKey] };
          field.width = Math.max(20, Math.round(resizeState.origWidth + dx));
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

  const updateFieldProp = (fieldKey: string, prop: string, value: number) => {
    setFields((prev) => {
      if (!prev) return prev;
      return { ...prev, [fieldKey]: { ...prev[fieldKey], [prop]: value } };
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
      <div className="mb-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-xl font-bold text-gray-900">مصمم الكارنيه</h1>
          <p className="text-sm text-gray-500 mt-1">
            اسحب العناصر لتحديد مواقعها على كارنيه العضوية
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
        {/* Canvas */}
        <div
          ref={containerRef}
          className="flex-1 bg-gray-100 rounded-lg border border-gray-200 overflow-auto p-4"
        >
          <div
            className="relative mx-auto shadow-lg"
            style={{
              width: CARD_WIDTH * scale,
              height: CARD_HEIGHT * scale,
            }}
            onClick={() => setSelectedField(null)}
          >
            {/* Card background */}
            <img
              src="/membership-card-template.png"
              alt="Card Template"
              className="absolute inset-0 w-full h-full pointer-events-none"
              draggable={false}
            />

            {/* Info */}
            <div className="absolute top-2 left-2 bg-black/60 text-white text-[10px] px-2 py-1 rounded z-10">
              {CARD_WIDTH} × {CARD_HEIGHT} px
            </div>

            {/* Draggable fields */}
            {Object.entries(fields).map(([key, field]) => {
              const dims = getFieldDimensions(field);
              const isSelected = selectedField === key;
              const isDragging = dragState?.fieldKey === key;

              const bgColor =
                field.type === "image"
                  ? "bg-purple-100/80 border-purple-400"
                  : "bg-blue-100/80 border-blue-400";

              const selectedRing = isSelected ? "ring-2 ring-blue-500 ring-offset-1" : "";

              return (
                <div
                  key={key}
                  className={`absolute border ${bgColor} ${selectedRing} cursor-move select-none flex items-center justify-center overflow-hidden rounded-sm ${
                    isDragging ? "opacity-80 z-30" : "z-20"
                  }`}
                  style={{
                    left: field.x * scale,
                    top: field.yTop * scale,
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

          <div className="space-y-1 mb-4">
            {Object.entries(fields).map(([key, field]) => {
              const isSelected = selectedField === key;
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
                  <span className={`text-xs ml-2 ${field.type === "image" ? "text-purple-600" : "text-blue-600"}`}>
                    {field.type === "image" ? "صورة" : "نص"}
                  </span>
                  {field.label}
                </button>
              );
            })}
          </div>

          {selectedField && selectedFieldData && (
            <div className="border-t border-gray-200 pt-4">
              <h3 className="text-sm font-semibold text-gray-900 mb-3">
                خصائص: {selectedFieldData.label}
              </h3>
              <div className="space-y-3">
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block text-xs text-gray-500 mb-1">X</label>
                    <input
                      type="number"
                      className="w-full px-2 py-1.5 border border-gray-300 rounded text-sm"
                      value={selectedFieldData.x}
                      onChange={(e) => updateFieldProp(selectedField, "x", Number(e.target.value))}
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-gray-500 mb-1">Y</label>
                    <input
                      type="number"
                      className="w-full px-2 py-1.5 border border-gray-300 rounded text-sm"
                      value={selectedFieldData.yTop}
                      onChange={(e) => updateFieldProp(selectedField, "yTop", Number(e.target.value))}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block text-xs text-gray-500 mb-1">العرض</label>
                    <input
                      type="number"
                      className="w-full px-2 py-1.5 border border-gray-300 rounded text-sm"
                      value={getFieldDimensions(selectedFieldData).width}
                      onChange={(e) => updateFieldProp(selectedField, "width", Number(e.target.value))}
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-gray-500 mb-1">الارتفاع</label>
                    <input
                      type="number"
                      className="w-full px-2 py-1.5 border border-gray-300 rounded text-sm"
                      value={getFieldDimensions(selectedFieldData).height}
                      onChange={(e) => updateFieldProp(selectedField, "height", Number(e.target.value))}
                    />
                  </div>
                </div>

                {selectedFieldData.type === "text" && (
                  <div>
                    <label className="block text-xs text-gray-500 mb-1">حجم الخط</label>
                    <input
                      type="number"
                      className="w-full px-2 py-1.5 border border-gray-300 rounded text-sm"
                      value={selectedFieldData.size || 12}
                      onChange={(e) => updateFieldProp(selectedField, "size", Number(e.target.value))}
                    />
                  </div>
                )}
              </div>
            </div>
          )}

          <div className="border-t border-gray-200 pt-4 mt-4">
            <h3 className="text-xs font-semibold text-gray-500 mb-2">الألوان</h3>
            <div className="space-y-1 text-xs text-gray-500">
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 rounded bg-blue-100 border border-blue-400" />
                نص
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
