"use client";

import Image from "next/image";
import Link from "next/link";
import type { Member } from "@prisma/client";

interface MemberTableProps {
  members: Member[];
  onViewQR: (member: Member) => void;
  onDelete?: (member: Member) => void;
}

function getMemberTypeLabel(type: string): string {
  return type === "student" ? "طالب" : "خريج";
}

export default function MemberTable({ members, onViewQR, onDelete }: MemberTableProps) {
  if (members.length === 0) {
    return (
      <div className="text-center py-12 text-gray-500">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className="h-12 w-12 mx-auto mb-4 opacity-50"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
          />
        </svg>
        <p>لا يوجد أعضاء</p>
      </div>
    );
  }

  return (
    <>
      {/* Mobile Card View */}
      <div className="md:hidden space-y-3">
        {members.map((member) => (
          <div key={member.id} className="bg-white border border-gray-200 rounded-lg p-4 shadow-sm">
            <div className="flex items-start gap-3">
              <Image
                src={member.profileImage}
                alt={member.fullNameAr}
                width={48}
                height={48}
                className="rounded-full object-cover w-12 h-12 flex-shrink-0"
              />
              <div className="flex-1 min-w-0">
                <p className="font-medium text-gray-900 text-sm truncate">{member.fullNameAr}</p>
                <p className="text-xs text-gray-500 truncate">{member.fullNameEn}</p>
                <div className="flex items-center gap-2 mt-1 flex-wrap">
                  <span className="inline-block px-2 py-0.5 bg-[#1e3a5f]/10 text-[#1e3a5f] rounded text-xs font-mono font-medium" dir="ltr">
                    {member.memberNumber}
                  </span>
                  <span className={`inline-block px-2 py-0.5 rounded text-xs font-medium ${
                    member.memberType === "student" ? "bg-blue-100 text-blue-700" : "bg-purple-100 text-purple-700"
                  }`}>
                    {getMemberTypeLabel(member.memberType)}
                  </span>
                </div>
              </div>
            </div>
            <div className="mt-3 pt-3 border-t border-gray-100 grid grid-cols-2 gap-2 text-xs">
              <div>
                <span className="text-gray-500">المحافظة:</span>
                <span className="text-gray-700 mr-1">{member.governorate}</span>
              </div>
              <div>
                <span className="text-gray-500">الوحدة:</span>
                <span className="text-gray-700 mr-1 truncate">{member.entityName}</span>
              </div>
            </div>
            <div className="mt-3 pt-3 border-t border-gray-100 flex items-center justify-between">
              <span className="text-xs text-gray-500">
                {new Date(member.createdAt).toLocaleDateString("ar-EG")}
              </span>
              <div className="flex items-center gap-1">
                <button
                  onClick={() => onViewQR(member)}
                  className="p-2 text-[#1e3a5f] hover:bg-gray-100 rounded-lg transition-colors"
                  title="عرض QR Code"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v1m6 11h2m-6 0h-2v4m0-11v3m0 0h.01M12 12h4.01M16 20h2M4 12h4m12 0h.01M5 8h2a1 1 0 001-1V5a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1zm12 0h2a1 1 0 001-1V5a1 1 0 00-1-1h-2a1 1 0 00-1 1v2a1 1 0 001 1zM5 20h2a1 1 0 001-1v-2a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1z" />
                  </svg>
                </button>
                <Link
                  href={`/admin/members/${member.id}`}
                  className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                  title="عرض التفاصيل"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                  </svg>
                </Link>
                <Link
                  href={`/admin/members/${member.id}/edit`}
                  className="p-2 text-green-600 hover:bg-green-50 rounded-lg transition-colors"
                  title="تعديل"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                  </svg>
                </Link>
                {onDelete && (
                  <button
                    onClick={() => onDelete(member)}
                    className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                    title="حذف"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                  </button>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Desktop Table View */}
      <div className="hidden md:block overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-gray-200">
              <th className="text-right py-3 px-4 font-medium text-gray-600 text-sm">الصورة</th>
              <th className="text-right py-3 px-4 font-medium text-gray-600 text-sm">رقم العضوية</th>
              <th className="text-right py-3 px-4 font-medium text-gray-600 text-sm">الاسم</th>
              <th className="text-right py-3 px-4 font-medium text-gray-600 text-sm hidden lg:table-cell">الرقم القومي</th>
              <th className="text-right py-3 px-4 font-medium text-gray-600 text-sm">المحافظة</th>
              <th className="text-right py-3 px-4 font-medium text-gray-600 text-sm hidden xl:table-cell">نوع العضو</th>
              <th className="text-right py-3 px-4 font-medium text-gray-600 text-sm hidden xl:table-cell">الوحدة/اللجنة</th>
              <th className="text-right py-3 px-4 font-medium text-gray-600 text-sm hidden xl:table-cell">الصفة</th>
              <th className="text-right py-3 px-4 font-medium text-gray-600 text-sm hidden lg:table-cell">التاريخ</th>
              <th className="text-right py-3 px-4 font-medium text-gray-600 text-sm">الإجراءات</th>
            </tr>
          </thead>
          <tbody>
            {members.map((member) => (
              <tr key={member.id} className="border-b border-gray-200 hover:bg-gray-50">
                <td className="py-3 px-4">
                  <Image
                    src={member.profileImage}
                    alt={member.fullNameAr}
                    width={40}
                    height={40}
                    className="rounded-full object-cover w-10 h-10"
                  />
                </td>
                <td className="py-3 px-4">
                  <span className="inline-block px-2 py-1 bg-[#1e3a5f]/10 text-[#1e3a5f] rounded text-xs font-mono font-medium" dir="ltr">
                    {member.memberNumber}
                  </span>
                </td>
                <td className="py-3 px-4">
                  <div>
                    <p className="font-medium text-gray-900 text-sm">{member.fullNameAr}</p>
                    <p className="text-xs text-gray-500">{member.fullNameEn}</p>
                  </div>
                </td>
                <td className="py-3 px-4 text-gray-700 text-sm hidden lg:table-cell">
                  <span dir="ltr" className="inline-block font-mono">{member.nationalId}</span>
                </td>
                <td className="py-3 px-4 text-gray-700 text-sm">{member.governorate}</td>
                <td className="py-3 px-4 hidden xl:table-cell">
                  <span className={`inline-block px-2 py-1 rounded text-xs font-medium ${
                    member.memberType === "student" ? "bg-blue-100 text-blue-700" : "bg-purple-100 text-purple-700"
                  }`}>
                    {getMemberTypeLabel(member.memberType)}
                  </span>
                </td>
                <td className="py-3 px-4 text-gray-700 text-sm hidden xl:table-cell">{member.entityName}</td>
                <td className="py-3 px-4 text-gray-700 text-sm hidden xl:table-cell">{member.role}</td>
                <td className="py-3 px-4 text-gray-700 text-sm hidden lg:table-cell">
                  {new Date(member.createdAt).toLocaleDateString("ar-EG")}
                </td>
                <td className="py-3 px-4">
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => onViewQR(member)}
                      className="p-2 text-[#1e3a5f] hover:bg-gray-100 rounded-lg transition-colors"
                      title="عرض QR Code"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v1m6 11h2m-6 0h-2v4m0-11v3m0 0h.01M12 12h4.01M16 20h2M4 12h4m12 0h.01M5 8h2a1 1 0 001-1V5a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1zm12 0h2a1 1 0 001-1V5a1 1 0 00-1-1h-2a1 1 0 00-1 1v2a1 1 0 001 1zM5 20h2a1 1 0 001-1v-2a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1z" />
                      </svg>
                    </button>
                    <Link
                      href={`/admin/members/${member.id}`}
                      className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                      title="عرض التفاصيل"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                      </svg>
                    </Link>
                    <Link
                      href={`/admin/members/${member.id}/edit`}
                      className="p-2 text-green-600 hover:bg-green-50 rounded-lg transition-colors"
                      title="تعديل"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                      </svg>
                    </Link>
                    {onDelete && (
                      <button
                        onClick={() => onDelete(member)}
                        className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                        title="حذف"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                      </button>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  );
}
