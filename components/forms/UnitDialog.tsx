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
import { createUnit, updateUnit } from '@/lib/actions/unit.actions'
import { useToast } from '@/hooks/use-toast'

interface UnitDialogProps {
  children: React.ReactNode
  governorates: Array<{ id: string; name: string }>
  unit?: {
    id: string
    name: string
    governorateId: string | null
    whatsappLink: string | null
    address: string | null
    phone: string | null
    isActive: boolean
  }
}

export function UnitDialog({ children, governorates, unit }: UnitDialogProps) {
  const [open, setOpen] = useState(false)
  const [name, setName] = useState(unit?.name || '')
  const [governorateId, setGovernorateId] = useState(unit?.governorateId || '')
  const [whatsappLink, setWhatsappLink] = useState(unit?.whatsappLink || '')
  const [address, setAddress] = useState(unit?.address || '')
  const [phone, setPhone] = useState(unit?.phone || '')
  const [isActive, setIsActive] = useState(unit?.isActive ?? true)
  const [error, setError] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const router = useRouter()
  const { toast } = useToast()

  const isEditing = !!unit

  const handleSubmit = async () => {
    setError(null)
    if (!name.trim()) {
      setError('يجب إدخال اسم الوحدة')
      return
    }
    setIsSubmitting(true)

    const data = {
      name: name.trim(),
      governorateId: governorateId || undefined,
      whatsappLink: whatsappLink || undefined,
      address: address || undefined,
      phone: phone || undefined,
      isActive,
    }

    const result = isEditing
      ? await updateUnit(unit.id, data)
      : await createUnit(data)

    if (result.error) {
      setError(result.error)
      setIsSubmitting(false)
    } else {
      toast({
        title: isEditing ? 'تم التحديث' : 'تم الإضافة',
        description: isEditing ? 'تم تحديث الوحدة بنجاح' : 'تم إضافة الوحدة بنجاح',
      })
      setOpen(false)
      resetForm()
      router.refresh()
    }
  }

  const resetForm = () => {
    if (!isEditing) {
      setName('')
      setGovernorateId('')
      setWhatsappLink('')
      setAddress('')
      setPhone('')
      setIsActive(true)
    }
    setError(null)
    setIsSubmitting(false)
  }

  const handleOpenChange = (newOpen: boolean) => {
    setOpen(newOpen)
    if (newOpen) resetForm()
  }

  const inputClass = "w-full px-3 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#1e3a5f]/20 focus:border-[#1e3a5f] disabled:opacity-50 disabled:bg-gray-50"

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className="bg-white border border-gray-200 rounded-lg shadow-xl p-0 max-w-md">
        <DialogHeader className="p-6 pb-0">
          <DialogTitle className="text-lg font-bold text-gray-900">
            {isEditing ? 'تعديل وحدة' : 'إضافة وحدة جديدة'}
          </DialogTitle>
          <DialogDescription className="text-sm text-gray-500">
            {isEditing ? 'قم بتعديل بيانات الوحدة' : 'أدخل بيانات الوحدة الجديدة'}
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
            <label className="block text-sm font-medium text-gray-700 mb-1">المحافظة (اختياري)</label>
            <select
              value={governorateId}
              onChange={(e) => setGovernorateId(e.target.value)}
              disabled={isSubmitting}
              className={`${inputClass} bg-white`}
            >
              <option value="">اختر المحافظة</option>
              {governorates.map((gov) => (
                <option key={gov.id} value={gov.id}>{gov.name}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">اسم الوحدة *</label>
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="مثال: وحدة مصر الجديدة"
              disabled={isSubmitting}
              className={inputClass}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">العنوان</label>
            <input
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              placeholder="مثال: شارع الحرية، مصر الجديدة"
              disabled={isSubmitting}
              className={inputClass}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">الهاتف</label>
            <input
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="01234567890"
              dir="ltr"
              disabled={isSubmitting}
              className={inputClass}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">رابط الواتساب</label>
            <input
              value={whatsappLink}
              onChange={(e) => setWhatsappLink(e.target.value)}
              placeholder="https://wa.me/201234567890"
              dir="ltr"
              disabled={isSubmitting}
              className={inputClass}
            />
          </div>

          <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
            <label className="text-sm font-medium text-gray-700">نشط</label>
            <button
              type="button"
              role="switch"
              aria-checked={isActive}
              disabled={isSubmitting}
              onClick={() => setIsActive(!isActive)}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-[#1e3a5f]/20 disabled:opacity-50 ${
                isActive ? 'bg-[#1e3a5f]' : 'bg-gray-300'
              }`}
            >
              <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                isActive ? 'translate-x-6' : 'translate-x-1'
              }`} />
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
            disabled={!name || isSubmitting}
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
