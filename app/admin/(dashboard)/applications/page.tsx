export const revalidate = 30;

import { getApplications } from '@/lib/actions/application.actions'
import { getGovernorates } from '@/lib/actions/governorate.actions'
import Link from 'next/link'
import { format } from 'date-fns'
import { ar } from 'date-fns/locale'

interface SearchParams {
  status?: string
  governorateId?: string
  search?: string
  page?: string
}

function StatusBadge({ status }: { status: string }) {
  const config: Record<string, { label: string; className: string }> = {
    PENDING: { label: 'قيد المراجعة', className: 'bg-yellow-100 text-yellow-700' },
    ACCEPTED: { label: 'مقبول', className: 'bg-green-100 text-green-700' },
    REJECTED: { label: 'مرفوض', className: 'bg-red-100 text-red-700' },
  }
  const c = config[status] || config.PENDING
  return (
    <span className={`inline-block px-2 py-0.5 rounded text-xs font-medium ${c.className}`}>
      {c.label}
    </span>
  )
}

export default async function ApplicationsPage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>
}) {
  const params = await searchParams
  const page = Number(params.page) || 1
  const status = params.status || 'ALL'
  const governorateId = params.governorateId || ''
  const search = params.search || ''

  const [result, governorates] = await Promise.all([
    getApplications({
      status: status === 'ALL' ? undefined : status,
      governorateId: governorateId || undefined,
      search: search || undefined,
      page,
      limit: 10,
    }),
    getGovernorates(),
  ])

  if ('error' in result) {
    return (
      <div className="pt-14 lg:pt-0 text-center py-12">
        <p className="text-gray-500">خطأ: {result.error}</p>
      </div>
    )
  }

  const { applications, pagination } = result

  const buildUrl = (newParams: Partial<SearchParams>) => {
    const urlParams = new URLSearchParams()
    const mergedParams = { status, governorateId, search, page: String(page), ...newParams }
    Object.entries(mergedParams).forEach(([key, value]) => {
      if (value && value !== 'ALL' && value !== '1' && value !== 'all') {
        urlParams.set(key, String(value))
      }
    })
    return `/admin/applications?${urlParams.toString()}`
  }

  return (
    <div className="pt-14 lg:pt-0">
      {/* Header */}
      <div className="mb-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h1 className="text-xl font-bold text-gray-900">الطلبات</h1>
          <p className="text-sm text-gray-500 mt-1">إدارة ومراجعة طلبات الانضمام</p>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
        <div className="bg-white rounded-lg p-4 border border-gray-200">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
              </svg>
            </div>
            <div>
              <p className="text-xs text-gray-500">إجمالي الطلبات</p>
              <p className="text-lg font-bold text-gray-900">{pagination.total}</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-lg p-4 border border-gray-200">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-yellow-100 rounded-lg flex items-center justify-center">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-yellow-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div>
              <p className="text-xs text-gray-500">قيد المراجعة</p>
              <p className="text-lg font-bold text-gray-900">
                {applications.filter((a) => a.status === 'PENDING').length}
              </p>
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
              <p className="text-xs text-gray-500">مقبول</p>
              <p className="text-lg font-bold text-gray-900">
                {applications.filter((a) => a.status === 'ACCEPTED').length}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg border border-gray-200 p-4 mb-6">
        <form className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <svg xmlns="http://www.w3.org/2000/svg" className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <input
              name="search"
              placeholder="بحث بالاسم أو الرقم القومي أو البريد..."
              defaultValue={search}
              className="w-full pr-10 pl-4 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#1e3a5f]/20 focus:border-[#1e3a5f]"
            />
          </div>
          <select
            name="status"
            defaultValue={status}
            className="px-3 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#1e3a5f]/20 focus:border-[#1e3a5f] bg-white sm:w-[160px]"
          >
            <option value="ALL">جميع الحالات</option>
            <option value="PENDING">قيد المراجعة</option>
            <option value="ACCEPTED">مقبول</option>
            <option value="REJECTED">مرفوض</option>
          </select>
          <select
            name="governorateId"
            defaultValue={governorateId || 'all'}
            className="px-3 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#1e3a5f]/20 focus:border-[#1e3a5f] bg-white sm:w-[160px]"
          >
            <option value="all">جميع المحافظات</option>
            {governorates.map((gov) => (
              <option key={gov.id} value={gov.id}>
                {gov.name}
              </option>
            ))}
          </select>
          <button
            type="submit"
            className="px-6 py-2.5 bg-[#1e3a5f] text-white rounded-lg text-sm font-medium hover:bg-[#1e3a5f]/90 transition-colors"
          >
            بحث
          </button>
        </form>
      </div>

      {/* Table */}
      <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
        {applications.length === 0 ? (
          <div className="py-12 text-center">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-3">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
              </svg>
            </div>
            <h3 className="font-semibold text-gray-900 mb-1">لا توجد طلبات</h3>
            <p className="text-sm text-gray-500">لم يتم العثور على أي طلبات مطابقة للبحث</p>
          </div>
        ) : (
          <>
            {/* Mobile Card View */}
            <div className="md:hidden space-y-0 divide-y divide-gray-200">
              {applications.map((app) => (
                <div key={app.id} className="p-4">
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0 flex-1">
                      <p className="font-medium text-gray-900 text-sm truncate">{app.fullName}</p>
                      <p className="text-xs text-gray-500 truncate">{app.user?.email || app.email || '-'}</p>
                    </div>
                    <StatusBadge status={app.status} />
                  </div>
                  <div className="mt-2 grid grid-cols-2 gap-2 text-xs">
                    <div>
                      <span className="text-gray-500">المحافظة:</span>
                      <span className="text-gray-700 mr-1">{app.governorate.name}</span>
                    </div>
                    <div>
                      <span className="text-gray-500">الهاتف:</span>
                      <span className="text-gray-700 mr-1" dir="ltr">{app.phone || '-'}</span>
                    </div>
                  </div>
                  <div className="mt-2 flex items-center justify-between">
                    <span className="text-xs text-gray-500">
                      {format(new Date(app.submittedAt), 'dd/MM/yyyy', { locale: ar })}
                    </span>
                    <Link
                      href={`/admin/applications/${app.id}`}
                      className="text-[#1e3a5f] text-xs font-medium hover:underline"
                    >
                      عرض التفاصيل
                    </Link>
                  </div>
                </div>
              ))}
            </div>

            {/* Desktop Table */}
            <div className="hidden md:block overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-200">
                    <th className="text-right py-3 px-4 font-medium text-gray-600 text-sm">الاسم</th>
                    <th className="text-right py-3 px-4 font-medium text-gray-600 text-sm">الرقم القومي</th>
                    <th className="text-right py-3 px-4 font-medium text-gray-600 text-sm">الهاتف</th>
                    <th className="text-right py-3 px-4 font-medium text-gray-600 text-sm">المحافظة</th>
                    <th className="text-right py-3 px-4 font-medium text-gray-600 text-sm">تاريخ التقديم</th>
                    <th className="text-right py-3 px-4 font-medium text-gray-600 text-sm">الحالة</th>
                    <th className="text-right py-3 px-4 font-medium text-gray-600 text-sm w-[70px]">إجراءات</th>
                  </tr>
                </thead>
                <tbody>
                  {applications.map((app) => (
                    <tr key={app.id} className="border-b border-gray-200 hover:bg-gray-50 transition-colors">
                      <td className="py-3 px-4">
                        <div>
                          <p className="font-medium text-gray-900 text-sm">{app.fullName}</p>
                          <p className="text-xs text-gray-500">{app.user?.email || app.email || '-'}</p>
                        </div>
                      </td>
                      <td className="py-3 px-4 text-sm text-gray-700">
                        <span className="font-mono" dir="ltr">{app.nationalId}</span>
                      </td>
                      <td className="py-3 px-4 text-sm text-gray-700">
                        <span dir="ltr">{app.phone || '-'}</span>
                      </td>
                      <td className="py-3 px-4 text-sm text-gray-700">{app.governorate.name}</td>
                      <td className="py-3 px-4 text-sm text-gray-700">
                        {format(new Date(app.submittedAt), 'dd/MM/yyyy', { locale: ar })}
                      </td>
                      <td className="py-3 px-4">
                        <StatusBadge status={app.status} />
                      </td>
                      <td className="py-3 px-4">
                        <Link
                          href={`/admin/applications/${app.id}`}
                          className="p-2 text-gray-500 hover:bg-gray-100 rounded-lg transition-colors inline-flex"
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                            <path strokeLinecap="round" strokeLinejoin="round" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                          </svg>
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            {pagination.totalPages > 1 && (
              <div className="p-4 border-t border-gray-200 bg-gray-50 flex items-center justify-between">
                <span className="text-xs text-gray-500">
                  صفحة {pagination.page} من {pagination.totalPages}
                </span>
                <div className="flex gap-2">
                  {pagination.page > 1 ? (
                    <Link
                      href={buildUrl({ page: String(pagination.page - 1) })}
                      className="px-3 py-1.5 border border-gray-300 rounded-lg text-sm text-gray-700 hover:bg-gray-100 transition-colors flex items-center gap-1"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                      </svg>
                      السابق
                    </Link>
                  ) : (
                    <span className="px-3 py-1.5 border border-gray-200 rounded-lg text-sm text-gray-400 flex items-center gap-1 cursor-not-allowed">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                      </svg>
                      السابق
                    </span>
                  )}
                  {pagination.page < pagination.totalPages ? (
                    <Link
                      href={buildUrl({ page: String(pagination.page + 1) })}
                      className="px-3 py-1.5 border border-gray-300 rounded-lg text-sm text-gray-700 hover:bg-gray-100 transition-colors flex items-center gap-1"
                    >
                      التالي
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
                      </svg>
                    </Link>
                  ) : (
                    <span className="px-3 py-1.5 border border-gray-200 rounded-lg text-sm text-gray-400 flex items-center gap-1 cursor-not-allowed">
                      التالي
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
                      </svg>
                    </span>
                  )}
                </div>
              </div>
            )}
          </>
        )}
      </div>

      {/* Footer */}
      <div className="mt-4 flex items-center justify-between text-xs text-gray-500">
        <span>عرض {applications.length} من {pagination.total} طلب</span>
        <span>الصفحة {pagination.page} من {pagination.totalPages || 1}</span>
      </div>
    </div>
  )
}
