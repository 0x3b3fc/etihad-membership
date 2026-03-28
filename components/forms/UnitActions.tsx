'use client'

import { useState, useRef, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { UnitDialog } from './UnitDialog'
import { deleteUnit, toggleUnitActive } from '@/lib/actions/unit.actions'
import { useToast } from '@/hooks/use-toast'

interface UnitActionsProps {
  unit: {
    id: string
    name: string
    governorateId: string | null
    whatsappLink: string | null
    address: string | null
    phone: string | null
    isActive: boolean
    _count: {
      users: number
      applications: number
    }
  }
  governorates: Array<{ id: string; name: string }>
}

export function UnitActions({ unit, governorates }: UnitActionsProps) {
  const [open, setOpen] = useState(false)
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)
  const ref = useRef<HTMLDivElement>(null)
  const router = useRouter()
  const { toast } = useToast()

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const handleDelete = async () => {
    setIsDeleting(true)
    const result = await deleteUnit(unit.id)

    if (result.error) {
      toast({ title: 'خطأ', description: result.error, variant: 'destructive' })
    } else {
      toast({ title: 'تم الحذف', description: 'تم حذف الوحدة بنجاح' })
      router.refresh()
    }

    setIsDeleting(false)
    setShowDeleteConfirm(false)
  }

  const handleToggleActive = async () => {
    setOpen(false)
    const result = await toggleUnitActive(unit.id)

    if (result.error) {
      toast({ title: 'خطأ', description: result.error, variant: 'destructive' })
    } else {
      toast({
        title: 'تم التحديث',
        description: unit.isActive ? 'تم إلغاء تفعيل الوحدة' : 'تم تفعيل الوحدة',
      })
      router.refresh()
    }
  }

  return (
    <>
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
            <UnitDialog unit={unit} governorates={governorates}>
              <button
                className="w-full flex items-center gap-2 px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                onClick={() => setOpen(false)}
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                </svg>
                تعديل
              </button>
            </UnitDialog>
            <button
              onClick={handleToggleActive}
              className="w-full flex items-center gap-2 px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
            >
              {unit.isActive ? (
                <>
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-yellow-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636" />
                  </svg>
                  إلغاء التفعيل
                </>
              ) : (
                <>
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  تفعيل
                </>
              )}
            </button>
            <div className="border-t border-gray-100 my-1" />
            <button
              onClick={() => { setShowDeleteConfirm(true); setOpen(false) }}
              className="w-full flex items-center gap-2 px-3 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
              </svg>
              حذف
            </button>
          </div>
        )}
      </div>

      {/* Delete Confirmation */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4" onClick={() => !isDeleting && setShowDeleteConfirm(false)}>
          <div className="bg-white rounded-lg shadow-xl max-w-sm w-full p-6" onClick={(e) => e.stopPropagation()}>
            <h3 className="text-lg font-bold text-gray-900 mb-2">هل أنت متأكد؟</h3>
            <p className="text-sm text-gray-500 mb-6">
              سيتم حذف الوحدة &quot;{unit.name}&quot; نهائياً. هذا الإجراء لا يمكن التراجع عنه.
            </p>
            <div className="flex gap-2 justify-end">
              <button
                onClick={() => setShowDeleteConfirm(false)}
                disabled={isDeleting}
                className="px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors disabled:opacity-50"
              >
                إلغاء
              </button>
              <button
                onClick={handleDelete}
                disabled={isDeleting}
                className="px-4 py-2 bg-red-600 text-white rounded-lg text-sm font-medium hover:bg-red-700 transition-colors disabled:opacity-50"
              >
                {isDeleting ? 'جاري الحذف...' : 'حذف'}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
