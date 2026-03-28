'use client'

import { useState, useRef } from 'react'
import { Button } from '@/components/shadcn/button'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/shadcn/avatar'
import { uploadImage } from '@/lib/actions/upload.actions'
import { useToast } from '@/hooks/use-toast'
import { Loader2, Upload, X, User } from 'lucide-react'

interface ImageUploadProps {
  value?: string
  onChange: (url: string) => void
  disabled?: boolean
}

export function ImageUpload({ value, onChange, disabled }: ImageUploadProps) {
  const [isUploading, setIsUploading] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)
  const { toast } = useToast()

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    setIsUploading(true)

    const formData = new FormData()
    formData.append('file', file)

    const result = await uploadImage(formData)

    if (result.error) {
      toast({
        title: 'خطأ',
        description: result.error,
        variant: 'destructive',
      })
    } else if (result.url) {
      onChange(result.url)
      toast({
        title: 'تم الرفع',
        description: 'تم رفع الصورة بنجاح',
      })
    }

    setIsUploading(false)
    if (inputRef.current) inputRef.current.value = ''
  }

  return (
    <div className="flex flex-col items-center gap-4">
      <Avatar className="h-32 w-32 border-2 border-dashed border-muted-foreground/25">
        <AvatarImage src={value} alt="صورة المتقدم" className="object-cover" />
        <AvatarFallback className="bg-muted">
          <User className="h-12 w-12 text-muted-foreground" />
        </AvatarFallback>
      </Avatar>

      <div className="flex gap-2">
        <Button
          type="button"
          variant="outline"
          disabled={disabled || isUploading}
          onClick={() => inputRef.current?.click()}
        >
          {isUploading ? (
            <>
              <Loader2 className="ms-2 h-4 w-4 animate-spin" />
              جاري الرفع...
            </>
          ) : (
            <>
              <Upload className="ms-2 h-4 w-4" />
              {value ? 'تغيير الصورة' : 'رفع صورة'}
            </>
          )}
        </Button>

        {value && !isUploading && (
          <Button
            type="button"
            variant="ghost"
            size="icon"
            onClick={() => onChange('')}
            disabled={disabled}
          >
            <X className="h-4 w-4" />
          </Button>
        )}
      </div>

      <p className="text-xs text-muted-foreground">
        الأنواع المدعومة: JPG, PNG, WEBP (الحد الأقصى 5 ميجابايت)
      </p>

      <input
        ref={inputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp"
        onChange={handleUpload}
        className="hidden"
      />
    </div>
  )
}
