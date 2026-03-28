export const revalidate = 60;

import { getGovernorates } from '@/lib/actions/governorate.actions'
import { GovernorateActions } from '@/components/forms/GovernorateActions'
import { AddGovernorateButton } from './AddGovernorateButton'

export default async function GovernoratesPage() {
  const governorates = await getGovernorates()

  const activeCount = governorates.filter((g) => g.isActive).length
  const totalUnits = governorates.reduce((sum, g) => sum + g._count.units, 0)
  const totalApps = governorates.reduce((sum, g) => sum + g._count.applications, 0)

  return (
    <div className="pt-14 lg:pt-0">
      {/* Header */}
      <div className="mb-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h1 className="text-xl font-bold text-gray-900">المحافظات</h1>
          <p className="text-sm text-gray-500 mt-1">إدارة قائمة المحافظات</p>
        </div>
        <AddGovernorateButton />
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
        <div className="bg-white rounded-lg p-4 border border-gray-200">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M15 10.5a3 3 0 11-6 0 3 3 0 016 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1115 0z" />
              </svg>
            </div>
            <div>
              <p className="text-xs text-gray-500">إجمالي المحافظات</p>
              <p className="text-lg font-bold text-gray-900">{governorates.length}</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-lg p-4 border border-gray-200">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div>
              <p className="text-xs text-gray-500">نشطة</p>
              <p className="text-lg font-bold text-gray-900">{activeCount}</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-lg p-4 border border-gray-200">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-purple-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 21h16.5M4.5 3h15M5.25 3v18m13.5-18v18M9 6.75h1.5m-1.5 3h1.5m-1.5 3h1.5m3-6H15m-1.5 3H15m-1.5 3H15M9 21v-3.375c0-.621.504-1.125 1.125-1.125h3.75c.621 0 1.125.504 1.125 1.125V21" />
              </svg>
            </div>
            <div>
              <p className="text-xs text-gray-500">إجمالي الوحدات</p>
              <p className="text-lg font-bold text-gray-900">{totalUnits}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
        {governorates.length === 0 ? (
          <div className="py-12 text-center">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-3">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M15 10.5a3 3 0 11-6 0 3 3 0 016 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1115 0z" />
              </svg>
            </div>
            <h3 className="font-semibold text-gray-900 mb-1">لا توجد محافظات</h3>
            <p className="text-sm text-gray-500">ابدأ بإضافة محافظة جديدة</p>
          </div>
        ) : (
          <>
            {/* Mobile Card View */}
            <div className="md:hidden divide-y divide-gray-200">
              {governorates.map((gov) => (
                <div key={gov.id} className="p-4">
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2">
                        <p className="font-medium text-gray-900 text-sm">{gov.name}</p>
                        <span className="text-xs text-gray-400 font-mono">{gov.code}</span>
                      </div>
                      <div className="flex items-center gap-3 mt-1 text-xs text-gray-500">
                        <span>{gov._count.units} وحدة</span>
                        <span>{gov._count.applications} طلب</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className={`inline-block px-2 py-0.5 rounded text-xs font-medium ${
                        gov.isActive ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'
                      }`}>
                        {gov.isActive ? 'نشط' : 'غير نشط'}
                      </span>
                      <GovernorateActions governorate={gov} />
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Desktop Table */}
            <div className="hidden md:block overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-200">
                    <th className="text-right py-3 px-4 font-medium text-gray-600 text-sm">اسم المحافظة</th>
                    <th className="text-right py-3 px-4 font-medium text-gray-600 text-sm">الكود</th>
                    <th className="text-right py-3 px-4 font-medium text-gray-600 text-sm">عدد الوحدات</th>
                    <th className="text-right py-3 px-4 font-medium text-gray-600 text-sm">عدد الطلبات</th>
                    <th className="text-right py-3 px-4 font-medium text-gray-600 text-sm">الحالة</th>
                    <th className="text-right py-3 px-4 font-medium text-gray-600 text-sm w-[80px]">إجراءات</th>
                  </tr>
                </thead>
                <tbody>
                  {governorates.map((gov) => (
                    <tr key={gov.id} className="border-b border-gray-200 hover:bg-gray-50 transition-colors">
                      <td className="py-3 px-4 font-medium text-gray-900 text-sm">{gov.name}</td>
                      <td className="py-3 px-4 text-sm">
                        <span className="inline-block px-2 py-0.5 bg-gray-100 text-gray-600 rounded text-xs font-mono">{gov.code}</span>
                      </td>
                      <td className="py-3 px-4 text-sm text-gray-700">{gov._count.units}</td>
                      <td className="py-3 px-4 text-sm text-gray-700">{gov._count.applications}</td>
                      <td className="py-3 px-4">
                        <span className={`inline-block px-2 py-0.5 rounded text-xs font-medium ${
                          gov.isActive ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'
                        }`}>
                          {gov.isActive ? 'نشط' : 'غير نشط'}
                        </span>
                      </td>
                      <td className="py-3 px-4">
                        <GovernorateActions governorate={gov} />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </>
        )}
      </div>

      {/* Footer */}
      <div className="mt-4 text-xs text-gray-500">
        إجمالي {governorates.length} محافظة &middot; {totalUnits} وحدة &middot; {totalApps} طلب
      </div>
    </div>
  )
}
