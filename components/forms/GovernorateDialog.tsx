'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogTrigger,
} from '@/components/shadcn/dialog'
import { createGovernorate, updateGovernorate } from '@/lib/actions/governorate.actions'
import { useToast } from '@/hooks/use-toast'

interface GovernorateDialogProps {
  children: React.ReactNode
  governorate?: {
    id: string
    name: string
    code: string
    isActive: boolean
  }
}

export function GovernorateDialog({ children, governorate }: GovernorateDialogProps) {
  const [open, setOpen] = useState(false)
  const [name, setName] = useState(governorate?.name || '')
  const [code, setCode] = useState(governorate?.code || '')
  const [isActive, setIsActive] = useState(governorate?.isActive ?? true)
  const [error, setError] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const router = useRouter()
  const { toast } = useToast()

  const isEditing = !!governorate

  const handleSubmit = async () => {
    setError(null)
    setIsSubmitting(true)

    const result = isEditing
      ? await updateGovernorate(governorate.id, { name, code, isActive })
      : await createGovernorate({ name, code, isActive })

    if (result.error) {
      setError(result.error)
      setIsSubmitting(false)
    } else {
      toast({
        title: isEditing ? 'تم التحديث' : 'تم الإضافة',
        description: isEditing ? 'تم تحديث المحافظة بنجاح' : 'تم إضافة المحافظة بنجاح',
      })
      setOpen(false)
      resetForm()
      router.refresh()
    }
  }

  const resetForm = () => {
    if (!isEditing) {
      setName('')
      setCode('')
      setIsActive(true)
    }
    setError(null)
    setIsSubmitting(false)
  }

  const handleOpenChange = (newOpen: boolean) => {
    setOpen(newOpen)
    if (newOpen) {
      resetForm()
    }
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className="bg-white border border-gray-200 rounded-lg shadow-xl p-0 max-w-md">
        <DialogHeader className="p-6 pb-0">
          <DialogTitle className="text-lg font-bold text-gray-900">
            {isEditing ? 'تعديل محافظة' : 'إضافة محافظة جديدة'}
          </DialogTitle>
          <DialogDescription className="text-sm text-gray-500">
            {isEditing ? 'قم بتعديل بيانات المحافظة' : 'أدخل بيانات المحافظة الجديدة'}
          </DialogDescription>
        </DialogHeader>

        <div className="p-6 space-y-4">
          {error && (
            <div className="p-3 rounded-lg bg-red-50 text-red-700 border border-red-200 text-sm flex items-center gap-2">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.34 16.5c-.77.833.192 2.5 1.732 2.5z" />
              </svg>
              {error}
            </div>
          )}

          <div>
            <label htmlFor="gov-name" className="block text-sm font-medium text-gray-700 mb-1">
              اسم المحافظة
            </label>
            <input
              id="gov-name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="مثال: القاهرة"
              disabled={isSubmitting}
              className="w-full px-3 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#1e3a5f]/20 focus:border-[#1e3a5f] disabled:opacity-50 disabled:bg-gray-50"
            />
          </div>

          <div>
            <label htmlFor="gov-code" className="block text-sm font-medium text-gray-700 mb-1">
              كود المحافظة
            </label>
            <input
              id="gov-code"
              value={code}
              onChange={(e) => setCode(e.target.value.toUpperCase())}
              placeholder="مثال: CA"
              maxLength={3}
              disabled={isSubmitting}
              className="w-full px-3 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#1e3a5f]/20 focus:border-[#1e3a5f] disabled:opacity-50 disabled:bg-gray-50 font-mono"
            />
          </div>

          <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
            <label htmlFor="gov-active" className="text-sm font-medium text-gray-700">
              نشط
            </label>
            <button
              id="gov-active"
              type="button"
              role="switch"
              aria-checked={isActive}
              disabled={isSubmitting}
              onClick={() => setIsActive(!isActive)}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-[#1e3a5f]/20 disabled:opacity-50 ${
                isActive ? 'bg-[#1e3a5f]' : 'bg-gray-300'
              }`}
            >
              <span
                className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                  isActive ? 'translate-x-6' : 'translate-x-1'
                }`}
              />
            </button>
          </div>
        </div>

        <div className="p-6 pt-0 flex gap-2 justify-end">
          <button
            type="button"
            onClick={() => setOpen(false)}
            disabled={isSubmitting}
            className="px-4 py-2.5 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors disabled:opacity-50"
          >
            إلغاء
          </button>
          <button
            type="button"
            onClick={handleSubmit}
            disabled={!name || !code || isSubmitting}
            className="px-6 py-2.5 bg-[#1e3a5f] text-white rounded-lg text-sm font-medium hover:bg-[#1e3a5f]/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
          >
            {isSubmitting ? (
              <>
                <svg className="animate-spin h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                </svg>
                جاري الحفظ...
              </>
            ) : isEditing ? (
              'تحديث'
            ) : (
              'إضافة'
            )}
          </button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
