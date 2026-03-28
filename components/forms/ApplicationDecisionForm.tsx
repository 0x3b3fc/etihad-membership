'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { decideApplication, deleteApplication } from '@/lib/actions/application.actions'
import { useToast } from '@/hooks/use-toast'

interface ApplicationDecisionFormProps {
  applicationId: string
  currentStatus: 'PENDING' | 'ACCEPTED' | 'REJECTED'
  currentUnitId: string | null
  currentNote: string | null
  units: Array<{ id: string; name: string; governorate: { name: string } | null }>
}

export function ApplicationDecisionForm({
  applicationId,
  currentStatus,
  currentUnitId,
  currentNote,
  units,
}: ApplicationDecisionFormProps) {
  const [status, setStatus] = useState<'ACCEPTED' | 'REJECTED' | ''>('')
  const [unitId, setUnitId] = useState(currentUnitId || '')
  const [note, setNote] = useState(currentNote || '')
  const [error, setError] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
  const router = useRouter()
  const { toast } = useToast()

  const handleSubmit = async () => {
    if (!status) { setError('يرجى اختيار قرار'); return }
    if (status === 'ACCEPTED' && !unitId) { setError('يجب اختيار الوحدة عند القبول'); return }

    setError(null)
    setIsSubmitting(true)

    try {
      const result = await decideApplication({
        applicationId,
        status,
        assignedUnitId: status === 'ACCEPTED' ? unitId : undefined,
        adminNote: note || undefined,
      })

      if (result.error) {
        setError(result.error)
      } else {
        toast({
          title: 'تم حفظ القرار',
          description: status === 'ACCEPTED' ? 'تم قبول الطلب بنجاح' : 'تم رفض الطلب',
        })
        router.refresh()
      }
    } catch {
      setError('حدث خطأ أثناء حفظ القرار')
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleDelete = async () => {
    setIsDeleting(true)
    try {
      const result = await deleteApplication(applicationId)
      if (result.error) {
        setError(result.error)
        setIsDeleting(false)
      } else {
        toast({ title: 'تم الحذف', description: 'تم حذف الطلب بنجاح' })
        router.push('/admin/applications')
      }
    } catch {
      setError('حدث خطأ أثناء حذف الطلب')
      setIsDeleting(false)
    }
  }

  // If decision already taken (ACCEPTED or REJECTED), show read-only status
  if (currentStatus !== 'PENDING') {
    return (
      <div className="bg-white rounded-lg border border-gray-200 sticky top-20">
        <div className="p-6 pb-4">
          <h2 className="text-lg font-semibold text-gray-900">حالة الطلب</h2>
          <p className="text-sm text-gray-500 mt-1">تم اتخاذ القرار بشأن هذا الطلب</p>
        </div>

        <div className="px-6 pb-6 space-y-4">
          {error && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">{error}</div>
          )}

          {/* Status display */}
          <div className={`flex items-center gap-3 p-4 rounded-lg border ${
            currentStatus === 'ACCEPTED'
              ? 'bg-green-50 border-green-200'
              : 'bg-red-50 border-red-200'
          }`}>
            <svg xmlns="http://www.w3.org/2000/svg" className={`h-6 w-6 ${
              currentStatus === 'ACCEPTED' ? 'text-green-600' : 'text-red-600'
            }`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              {currentStatus === 'ACCEPTED'
                ? <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                : <path strokeLinecap="round" strokeLinejoin="round" d="M9.75 9.75l4.5 4.5m0-4.5l-4.5 4.5M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              }
            </svg>
            <div>
              <p className={`font-semibold text-sm ${
                currentStatus === 'ACCEPTED' ? 'text-green-800' : 'text-red-800'
              }`}>
                {currentStatus === 'ACCEPTED' ? 'تم قبول الطلب' : 'تم رفض الطلب'}
              </p>
              <p className={`text-xs ${
                currentStatus === 'ACCEPTED' ? 'text-green-600' : 'text-red-600'
              }`}>
                لا يمكن تعديل القرار بعد اتخاذه
              </p>
            </div>
          </div>

          {/* Show assigned unit for accepted */}
          {currentStatus === 'ACCEPTED' && currentUnitId && (
            <div>
              <p className="text-xs text-gray-500 mb-1">الوحدة المعينة</p>
              <p className="text-sm font-medium text-gray-900 bg-gray-50 rounded-lg p-3">
                {units.find(u => u.id === currentUnitId)?.name || '-'}
              </p>
            </div>
          )}

          {/* Show admin note */}
          {currentNote && (
            <div>
              <p className="text-xs text-gray-500 mb-1">ملاحظة الإدارة</p>
              <p className="text-sm text-gray-900 bg-gray-50 rounded-lg p-3">{currentNote}</p>
            </div>
          )}

          {/* Delete */}
          <div className="border-t border-gray-200 pt-4">
            {!showDeleteConfirm ? (
              <button
                type="button"
                onClick={() => setShowDeleteConfirm(true)}
                className="w-full py-2.5 border border-red-300 text-red-600 rounded-lg text-sm font-medium hover:bg-red-50 transition-colors flex items-center justify-center gap-2"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
                حذف الطلب
              </button>
            ) : (
              <div className="p-3 bg-red-50 border border-red-200 rounded-lg space-y-3">
                <p className="text-sm text-red-700 font-medium">هل أنت متأكد من حذف هذا الطلب؟</p>
                <p className="text-xs text-red-600">هذا الإجراء لا يمكن التراجع عنه.</p>
                <div className="flex gap-2">
                  <button
                    onClick={handleDelete}
                    disabled={isDeleting}
                    className="flex-1 py-2 bg-red-600 text-white rounded-lg text-sm font-medium hover:bg-red-700 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
                  >
                    {isDeleting ? 'جاري الحذف...' : 'نعم، احذف'}
                  </button>
                  <button
                    onClick={() => setShowDeleteConfirm(false)}
                    disabled={isDeleting}
                    className="flex-1 py-2 border border-gray-300 text-gray-700 rounded-lg text-sm font-medium hover:bg-gray-50 transition-colors disabled:opacity-50"
                  >
                    إلغاء
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    )
  }

  // PENDING status — show decision form
  return (
    <div className="bg-white rounded-lg border border-gray-200 sticky top-20">
      <div className="p-6 pb-4">
        <h2 className="text-lg font-semibold text-gray-900">اتخاذ قرار</h2>
        <p className="text-sm text-gray-500 mt-1">قم بمراجعة الطلب واتخاذ القرار المناسب</p>
      </div>

      <div className="px-6 pb-6 space-y-4">
        {error && (
          <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm flex items-center gap-2">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.34 16.5c-.77.833.192 2.5 1.732 2.5z" />
            </svg>
            {error}
          </div>
        )}

        {/* Decision buttons */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">القرار</label>
          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={() => setStatus('ACCEPTED')}
              disabled={isSubmitting}
              className={`flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium transition-colors border ${
                status === 'ACCEPTED'
                  ? 'bg-green-600 text-white border-green-600'
                  : 'bg-white text-gray-700 border-gray-300 hover:bg-green-50'
              } disabled:opacity-50`}
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              قبول
            </button>
            <button
              type="button"
              onClick={() => setStatus('REJECTED')}
              disabled={isSubmitting}
              className={`flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium transition-colors border ${
                status === 'REJECTED'
                  ? 'bg-red-600 text-white border-red-600'
                  : 'bg-white text-gray-700 border-gray-300 hover:bg-red-50'
              } disabled:opacity-50`}
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9.75 9.75l4.5 4.5m0-4.5l-4.5 4.5M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              رفض
            </button>
          </div>
        </div>

        {/* Unit select */}
        {status === 'ACCEPTED' && (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">الوحدة *</label>
            <select
              value={unitId}
              onChange={(e) => setUnitId(e.target.value)}
              disabled={isSubmitting}
              className="w-full px-3 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#1e3a5f]/20 focus:border-[#1e3a5f] bg-white disabled:opacity-50"
            >
              <option value="">اختر الوحدة</option>
              {units.map((unit) => (
                <option key={unit.id} value={unit.id}>
                  {unit.name}{unit.governorate ? ` (${unit.governorate.name})` : ''}
                </option>
              ))}
            </select>
          </div>
        )}

        {/* Note */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">ملاحظة (اختياري)</label>
          <textarea
            value={note}
            onChange={(e) => setNote(e.target.value)}
            placeholder="أضف ملاحظة للمتقدم..."
            rows={3}
            disabled={isSubmitting}
            className="w-full px-3 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#1e3a5f]/20 focus:border-[#1e3a5f] disabled:opacity-50 resize-none"
          />
        </div>

        {/* Submit */}
        <button
          onClick={handleSubmit}
          disabled={!status || isSubmitting}
          className="w-full py-2.5 bg-[#1e3a5f] text-white rounded-lg text-sm font-medium hover:bg-[#1e3a5f]/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
        >
          {isSubmitting ? (
            <>
              <svg className="animate-spin h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
              </svg>
              جاري الحفظ...
            </>
          ) : (
            'حفظ القرار'
          )}
        </button>

        {/* Delete */}
        <div className="border-t border-gray-200 pt-4">
          {!showDeleteConfirm ? (
            <button
              type="button"
              onClick={() => setShowDeleteConfirm(true)}
              className="w-full py-2.5 border border-red-300 text-red-600 rounded-lg text-sm font-medium hover:bg-red-50 transition-colors flex items-center justify-center gap-2"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
              </svg>
              حذف الطلب
            </button>
          ) : (
            <div className="p-3 bg-red-50 border border-red-200 rounded-lg space-y-3">
              <p className="text-sm text-red-700 font-medium">هل أنت متأكد من حذف هذا الطلب؟</p>
              <p className="text-xs text-red-600">هذا الإجراء لا يمكن التراجع عنه.</p>
              <div className="flex gap-2">
                <button
                  onClick={handleDelete}
                  disabled={isDeleting}
                  className="flex-1 py-2 bg-red-600 text-white rounded-lg text-sm font-medium hover:bg-red-700 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {isDeleting ? 'جاري الحذف...' : 'نعم، احذف'}
                </button>
                <button
                  onClick={() => setShowDeleteConfirm(false)}
                  disabled={isDeleting}
                  className="flex-1 py-2 border border-gray-300 text-gray-700 rounded-lg text-sm font-medium hover:bg-gray-50 transition-colors disabled:opacity-50"
                >
                  إلغاء
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
