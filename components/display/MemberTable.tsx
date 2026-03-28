"use client";

import { useState, useRef, useEffect } from "react";
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

function ActionsDropdown({
  member,
  onViewQR,
  onDelete,
}: {
  member: Member;
  onViewQR: (member: Member) => void;
  onDelete?: (member: Member) => void;
}) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={() => setOpen(!open)}
        className="p-2 text-gray-500 hover:bg-gray-100 rounded-lg transition-colors"
      >
        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z" />
        </svg>
      </button>

      {open && (
        <div className="absolute left-0 top-full mt-1 w-44 bg-white rounded-lg border border-gray-200 shadow-lg z-50 py-1">
          <button
            onClick={() => { onViewQR(member); setOpen(false); }}
            className="w-full flex items-center gap-2 px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-[#1e3a5f]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v1m6 11h2m-6 0h-2v4m0-11v3m0 0h.01M12 12h4.01M16 20h2M4 12h4m12 0h.01M5 8h2a1 1 0 001-1V5a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1zm12 0h2a1 1 0 001-1V5a1 1 0 00-1-1h-2a1 1 0 00-1 1v2a1 1 0 001 1zM5 20h2a1 1 0 001-1v-2a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1z" />
            </svg>
            عرض QR Code
          </button>
          <Link
            href={`/admin/members/${member.id}`}
            onClick={() => setOpen(false)}
            className="w-full flex items-center gap-2 px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              <path strokeLinecap="round" strokeLinejoin="round" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
            </svg>
            عرض التفاصيل
          </Link>
          <Link
            href={`/admin/members/${member.id}/edit`}
            onClick={() => setOpen(false)}
            className="w-full flex items-center gap-2 px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
            </svg>
            تعديل
          </Link>
          <a
            href={`/api/admin/members/${member.id}/print`}
            target="_blank"
            rel="noopener noreferrer"
            onClick={() => setOpen(false)}
            className="w-full flex items-center gap-2 px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-purple-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
            </svg>
            طباعة الاستمارة
          </a>
          <a
            href={`/api/admin/members/${member.id}/print-card`}
            target="_blank"
            rel="noopener noreferrer"
            onClick={() => setOpen(false)}
            className="w-full flex items-center gap-2 px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-amber-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 8.25h19.5M2.25 9h19.5m-16.5 5.25h6m-6 2.25h3m-3.75 3h15a2.25 2.25 0 002.25-2.25V6.75A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25v10.5A2.25 2.25 0 004.5 19.5z" />
            </svg>
            طباعة الكارنيه
          </a>
          {onDelete && (
            <>
              <div className="border-t border-gray-100 my-1" />
              <button
                onClick={() => { onDelete(member); setOpen(false); }}
                className="w-full flex items-center gap-2 px-3 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
                حذف
              </button>
            </>
          )}
        </div>
      )}
    </div>
  );
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
              <ActionsDropdown member={member} onViewQR={onViewQR} onDelete={onDelete} />
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
                  <ActionsDropdown member={member} onViewQR={onViewQR} onDelete={onDelete} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  );
}
