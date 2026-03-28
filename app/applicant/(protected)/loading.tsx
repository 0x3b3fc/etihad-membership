export default function Loading() {
  return (
    <div className="flex items-center justify-center min-h-[400px]">
      <div className="text-center">
        <div className="w-10 h-10 border-3 border-gray-200 border-t-[#1e3a5f] rounded-full animate-spin mx-auto mb-3"></div>
        <p className="text-gray-500 text-sm">جاري التحميل...</p>
      </div>
    </div>
  );
}
