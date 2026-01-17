import Image from "next/image";

export default function MaintenancePage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-gray-50 flex items-center justify-center px-4">
      <div className="text-center max-w-md">
        <div className="mb-8">
          <Image
            src="https://res.cloudinary.com/det1gfcko/image/upload/v1768060031/d5df2f10-7e43-4d9f-8509-4ec203636719-copied-media_2_ssq0wg.png"
            alt="عضويتي"
            width={100}
            height={100}
            className="mx-auto w-24 h-24"
          />
        </div>

        <div className="w-16 h-16 mx-auto mb-6 rounded-full bg-[#1e3a5f]/10 flex items-center justify-center">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-8 w-8 text-[#1e3a5f]"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"
            />
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
            />
          </svg>
        </div>

        <h1 className="text-2xl sm:text-3xl font-bold text-[#1e3a5f] mb-4">
تم انتهاء من المرحلة الاولي للموقع 
        </h1>

        <div className="text-xs text-gray-400">
          اتحاد بشبابها - عضويتي - وحدة الربط المركزي
        </div>
      </div>
    </div>
  );
}
