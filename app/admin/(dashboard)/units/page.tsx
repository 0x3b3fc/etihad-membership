import { getUnits } from '@/lib/actions/unit.actions'
import { getGovernorates } from '@/lib/actions/governorate.actions'
import { UnitActions } from '@/components/forms/UnitActions'
import { AddUnitButton } from './AddUnitButton'

interface SearchParams {
  governorateId?: string
}

export default async function UnitsPage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>
}) {
  const params = await searchParams
  const governorateId = params.governorateId || ''

  const [units, governorates] = await Promise.all([
    getUnits({ governorateId: governorateId || undefined }),
    getGovernorates(),
  ])

  const activeCount = units.filter((u) => u.isActive).length
  const totalUsers = units.reduce((sum, u) => sum + u._count.users, 0)

  return (
    <div className="pt-14 lg:pt-0">
      {/* Header */}
      <div className="mb-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h1 className="text-xl font-bold text-gray-900">الوحدات</h1>
          <p className="text-sm text-gray-500 mt-1">إدارة الوحدات التابعة للمحافظات</p>
        </div>
        <AddUnitButton governorates={governorates.map(g => ({ id: g.id, name: g.name }))} />
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
        <div className="bg-white rounded-lg p-4 border border-gray-200">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 21h16.5M4.5 3h15M5.25 3v18m13.5-18v18M9 6.75h1.5m-1.5 3h1.5m-1.5 3h1.5m3-6H15m-1.5 3H15m-1.5 3H15M9 21v-3.375c0-.621.504-1.125 1.125-1.125h3.75c.621 0 1.125.504 1.125 1.125V21" />
              </svg>
            </div>
            <div>
              <p className="text-xs text-gray-500">إجمالي الوحدات</p>
              <p className="text-lg font-bold text-gray-900">{units.length}</p>
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
                <path strokeLinecap="round" strokeLinejoin="round" d="M15 19.128a9.38 9.38 0 002.625.372 9.337 9.337 0 004.121-.952 4.125 4.125 0 00-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 018.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0111.964-3.07M12 6.375a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0zm8.25 2.25a2.625 2.625 0 11-5.25 0 2.625 2.625 0 015.25 0z" />
              </svg>
            </div>
            <div>
              <p className="text-xs text-gray-500">إجمالي الأعضاء</p>
              <p className="text-lg font-bold text-gray-900">{totalUsers}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Filter */}
      <div className="bg-white rounded-lg border border-gray-200 p-4 mb-6">
        <form className="flex flex-col sm:flex-row gap-3">
          <select
            name="governorateId"
            defaultValue={governorateId || 'all'}
            className="px-3 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#1e3a5f]/20 focus:border-[#1e3a5f] bg-white flex-1 sm:flex-none sm:w-[220px]"
          >
            <option value="all">جميع المحافظات</option>
            {governorates.map((gov) => (
              <option key={gov.id} value={gov.id}>{gov.name}</option>
            ))}
          </select>
          <button
            type="submit"
            className="px-6 py-2.5 bg-[#1e3a5f] text-white rounded-lg text-sm font-medium hover:bg-[#1e3a5f]/90 transition-colors"
          >
            تصفية
          </button>
        </form>
      </div>

      {/* Table */}
      <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
        {units.length === 0 ? (
          <div className="py-12 text-center">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-3">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 21h16.5M4.5 3h15M5.25 3v18m13.5-18v18M9 6.75h1.5m-1.5 3h1.5m-1.5 3h1.5m3-6H15m-1.5 3H15m-1.5 3H15M9 21v-3.375c0-.621.504-1.125 1.125-1.125h3.75c.621 0 1.125.504 1.125 1.125V21" />
              </svg>
            </div>
            <h3 className="font-semibold text-gray-900 mb-1">لا توجد وحدات</h3>
            <p className="text-sm text-gray-500">ابدأ بإضافة وحدة جديدة</p>
          </div>
        ) : (
          <>
            {/* Mobile Card View */}
            <div className="md:hidden divide-y divide-gray-200">
              {units.map((unit) => (
                <div key={unit.id} className="p-4">
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0 flex-1">
                      <p className="font-medium text-gray-900 text-sm">{unit.name}</p>
                      {unit.address && <p className="text-xs text-gray-500 truncate">{unit.address}</p>}
                      <div className="flex items-center gap-3 mt-1 text-xs text-gray-500">
                        <span>{unit.governorate?.name || '-'}</span>
                        <span>{unit._count.users} عضو</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className={`inline-block px-2 py-0.5 rounded text-xs font-medium ${
                        unit.isActive ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'
                      }`}>
                        {unit.isActive ? 'نشط' : 'غير نشط'}
                      </span>
                      <UnitActions unit={unit} governorates={governorates} />
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
                    <th className="text-right py-3 px-4 font-medium text-gray-600 text-sm">اسم الوحدة</th>
                    <th className="text-right py-3 px-4 font-medium text-gray-600 text-sm">المحافظة</th>
                    <th className="text-right py-3 px-4 font-medium text-gray-600 text-sm">الهاتف</th>
                    <th className="text-right py-3 px-4 font-medium text-gray-600 text-sm">واتساب</th>
                    <th className="text-right py-3 px-4 font-medium text-gray-600 text-sm">الأعضاء</th>
                    <th className="text-right py-3 px-4 font-medium text-gray-600 text-sm">الحالة</th>
                    <th className="text-right py-3 px-4 font-medium text-gray-600 text-sm w-[80px]">إجراءات</th>
                  </tr>
                </thead>
                <tbody>
                  {units.map((unit) => (
                    <tr key={unit.id} className="border-b border-gray-200 hover:bg-gray-50 transition-colors">
                      <td className="py-3 px-4">
                        <div>
                          <p className="font-medium text-gray-900 text-sm">{unit.name}</p>
                          {unit.address && <p className="text-xs text-gray-500">{unit.address}</p>}
                        </div>
                      </td>
                      <td className="py-3 px-4 text-sm text-gray-700">{unit.governorate?.name || '-'}</td>
                      <td className="py-3 px-4 text-sm text-gray-700">
                        <span dir="ltr">{unit.phone || '-'}</span>
                      </td>
                      <td className="py-3 px-4">
                        {unit.whatsappLink ? (
                          <a
                            href={unit.whatsappLink}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1 text-green-600 hover:text-green-700 text-xs font-medium"
                          >
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                              <path strokeLinecap="round" strokeLinejoin="round" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                            </svg>
                            رابط
                          </a>
                        ) : (
                          <span className="text-sm text-gray-400">-</span>
                        )}
                      </td>
                      <td className="py-3 px-4 text-sm text-gray-700">{unit._count.users}</td>
                      <td className="py-3 px-4">
                        <span className={`inline-block px-2 py-0.5 rounded text-xs font-medium ${
                          unit.isActive ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'
                        }`}>
                          {unit.isActive ? 'نشط' : 'غير نشط'}
                        </span>
                      </td>
                      <td className="py-3 px-4">
                        <UnitActions unit={unit} governorates={governorates} />
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
        إجمالي {units.length} وحدة &middot; {totalUsers} عضو
      </div>
    </div>
  )
}
