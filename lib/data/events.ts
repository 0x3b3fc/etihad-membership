export const eventCategories = [
  { value: "workshop", label: "ورشة عمل" },
  { value: "conference", label: "مؤتمر" },
  { value: "meeting", label: "اجتماع" },
  { value: "training", label: "تدريب" },
  { value: "seminar", label: "ندوة" },
  { value: "celebration", label: "احتفال" },
  { value: "sports", label: "نشاط رياضي" },
  { value: "cultural", label: "نشاط ثقافي" },
  { value: "other", label: "أخرى" },
] as const;

export type EventCategoryValue = (typeof eventCategories)[number]["value"];

export function getCategoryLabel(value: string): string {
  const category = eventCategories.find((c) => c.value === value);
  return category?.label || value;
}
