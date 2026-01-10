export default function AdminLoading() {
  return (
    <div className="flex items-center justify-center min-h-[60vh]">
      <div className="text-center">
        <div className="w-12 h-12 border-4 border-gray-200 border-t-[#1e3a5f] rounded-full animate-spin mx-auto mb-4"></div>
        <p className="text-gray-500">جاري التحميل...</p>
      </div>
    </div>
  );
}
