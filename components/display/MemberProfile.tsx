"use client";

import Image from "next/image";

interface MemberData {
  id: string;
  memberNumber: string;
  fullNameAr: string;
  fullNameEn: string;
  governorate: string;
  entityType: string;
  entityLevel: string;
  entityName: string | null;
  role: string;
  profileImage: string;
  qrCode: string;
  createdAt: string;
}

interface MemberProfileProps {
  member: MemberData;
}

function getEntityTypeLabel(type: string): string {
  return type === "unit" ? "وحدة" : "لجنة";
}

function getEntityLevelLabel(level: string): string {
  return level === "central" ? "مركزي" : "محافظة";
}

export default function MemberProfile({ member }: MemberProfileProps) {
  return (
    <div className="max-w-md mx-auto">
      {/* Card */}
      <div className="relative bg-white rounded-2xl shadow-lg border border-gray-200 overflow-hidden">
        {/* Header */}
        <div className="h-24 bg-[#1e3a5f] relative">
          {/* Member Number Badge */}
          <div className="absolute top-3 right-3 px-2.5 py-1 bg-white/20 backdrop-blur-sm rounded-full">
            <span className="text-white text-xs font-medium" dir="ltr">{member.memberNumber}</span>
          </div>
          {/* Verified Badge */}
          <div className="absolute top-3 left-3 px-2.5 py-1 bg-green-500/90 backdrop-blur-sm rounded-full">
            <span className="text-white text-xs font-medium">عضو موثق</span>
          </div>
        </div>

        {/* Profile Content */}
        <div className="relative px-6 pb-6 -mt-12 text-center">
          {/* Profile Image */}
          <div className="relative inline-block mb-4 mx-auto">
            <div className="w-24 h-24 rounded-full p-1 bg-white shadow-lg">
              <Image
                src={member.profileImage}
                alt={member.fullNameAr}
                width={96}
                height={96}
                className="w-full h-full rounded-full object-cover"
              />
            </div>
            {/* Verified Badge */}
            <div className="absolute -bottom-1 -left-1 w-7 h-7 bg-green-500 rounded-full flex items-center justify-center shadow-md ring-2 ring-white">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-white" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
              </svg>
            </div>
          </div>

          {/* Name */}
          <h2 className="text-xl font-bold text-gray-900 mb-0.5">
            {member.fullNameAr}
          </h2>
          <p className="text-sm text-gray-500 mb-3" dir="ltr">
            {member.fullNameEn}
          </p>

          {/* Role Badge */}
          <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-[#1e3a5f]/10 rounded-lg mb-4">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-[#1e3a5f]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
            </svg>
            <span className="text-[#1e3a5f] font-medium text-sm">{member.role}</span>
          </div>

          {/* Info Grid */}
          <div className="grid grid-cols-2 gap-3 mb-4">
            <div className="bg-gray-50 rounded-lg p-3 text-center">
              <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center mx-auto mb-2">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
              </div>
              <p className="text-xs text-gray-500 mb-0.5">المحافظة</p>
              <p className="font-semibold text-sm text-gray-900">{member.governorate}</p>
            </div>
            <div className="bg-gray-50 rounded-lg p-3 text-center">
              <div className="w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center mx-auto mb-2">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-purple-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                </svg>
              </div>
              <p className="text-xs text-gray-500 mb-0.5">{getEntityTypeLabel(member.entityType)}</p>
              <p className="font-semibold text-sm text-gray-900">
                {member.entityName || getEntityLevelLabel(member.entityLevel)}
              </p>
            </div>
          </div>

          {/* Date */}
          <div className="bg-gray-50 rounded-lg p-3 text-center mb-4">
            <div className="flex items-center justify-center gap-2">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              <span className="text-gray-500 text-sm">تاريخ التسجيل:</span>
              <span className="font-semibold text-sm text-gray-900">
                {new Date(member.createdAt).toLocaleDateString("ar-EG", {
                  year: "numeric",
                  month: "short",
                  day: "numeric",
                })}
              </span>
            </div>
          </div>

          {/* QR Code */}
          {member.qrCode && (
            <div className="bg-white rounded-lg p-4 border border-gray-200 mb-4">
              <Image
                src={member.qrCode}
                alt="QR Code"
                width={150}
                height={150}
                className="mx-auto"
              />
              <p className="text-xs text-gray-500 mt-2">امسح الكود للتحقق من العضوية</p>
            </div>
          )}

          {/* Member Status */}
          <div className="bg-green-50 rounded-lg p-3 border border-green-200">
            <div className="flex items-center justify-center gap-2">
              <div className="w-2 h-2 bg-green-500 rounded-full"></div>
              <span className="text-green-700 font-medium text-sm">عضو نشط ومسجل</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
