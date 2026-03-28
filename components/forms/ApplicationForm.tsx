'use client'

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/shadcn/button'
import { Input } from '@/components/shadcn/input'
import { Textarea } from '@/components/shadcn/textarea'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  FormDescription,
} from '@/components/shadcn/form'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/shadcn/select'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/shadcn/card'
import { Alert, AlertDescription } from '@/components/shadcn/alert'
import { Separator } from '@/components/shadcn/separator'
import { ImageUpload } from '@/components/shared/image-upload'
import { applicationSchema, type ApplicationInput } from '@/lib/validations/application'
import { submitApplication } from '@/lib/actions/application.actions'
import { useToast } from '@/hooks/use-toast'
import { Loader2, AlertCircle } from 'lucide-react'

interface ApplicationFormProps {
  governorates: Array<{ id: string; name: string }>
}

export function ApplicationForm({ governorates }: ApplicationFormProps) {
  const [error, setError] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const router = useRouter()
  const { toast } = useToast()

  const form = useForm<ApplicationInput>({
    resolver: zodResolver(applicationSchema),
    defaultValues: {
      governorateId: '',
      fullName: '',
      nationalId: '',
      address: '',
      phone: '',
      phone2: '',
      email: '',
      photoUrl: '',
      nationalIdPhotoUrl: '',
      nationalIdPhotoBackUrl: '',
      memberType: 'student',
      universityName: '',
      facultyName: '',
      academicYear: '',
      postgraduateStudy: 'none',
      employmentStatus: 'not_working',
      jobTitle: '',
      employer: '',
      previousExperiences: '',
      skills: '',
    },
  })

  const memberType = form.watch('memberType')
  const employmentStatus = form.watch('employmentStatus')

  const onSubmit = async (data: ApplicationInput) => {
    setError(null)
    setIsSubmitting(true)

    const result = await submitApplication(data)

    if (result.error) {
      setError(result.error)
      setIsSubmitting(false)
    } else if (result.success) {
      toast({
        title: 'تم التقديم بنجاح',
        description: 'شكرًا لتقديمك، سيتم مراجعة طلبك وإعلامك بالنتيجة.',
      })
      router.push('/applicant/application')
    }
  }

  return (
    <Card className="w-full max-w-3xl mx-auto">
      <CardHeader className="text-center">
        <CardTitle className="text-2xl">إستمارة عضوية اتحاد بشبابها</CardTitle>
        <CardDescription>
          اتحاد &quot;بشبابها&quot; هو هيئة شبابية مصرية تم إشهارها رسمياً بقرار وزاري رقم 857 لسنة 2024
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            {error && (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            {/* ============ الصورة الشخصية ============ */}
            <FormField
              control={form.control}
              name="photoUrl"
              render={({ field }) => (
                <FormItem className="flex flex-col items-center">
                  <FormLabel>الصورة الشخصية *</FormLabel>
                  <FormControl>
                    <ImageUpload
                      value={field.value}
                      onChange={field.onChange}
                      disabled={isSubmitting}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* ============ البيانات الأساسية ============ */}
            <div>
              <h3 className="text-lg font-semibold mb-4 text-primary">البيانات الأساسية</h3>
              <Separator className="mb-4" />

              <div className="grid gap-4 md:grid-cols-2">
                <FormField
                  control={form.control}
                  name="governorateId"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>المحافظة *</FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                        disabled={isSubmitting}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="اختر المحافظة" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {governorates.map((gov) => (
                            <SelectItem key={gov.id} value={gov.id}>
                              {gov.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="fullName"
                  render={({ field }) => (
                    <FormItem className="md:col-span-2">
                      <FormLabel>الأسم رباعي *</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="أحمد محمد علي حسن"
                          disabled={isSubmitting}
                          {...field}
                        />
                      </FormControl>
                      <FormDescription>يجب كتابة الاسم رباعياً باللغة العربية</FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="nationalId"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>الرقم القومي *</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="29901011234567"
                          maxLength={14}
                          dir="ltr"
                          disabled={isSubmitting}
                          {...field}
                        />
                      </FormControl>
                      <FormDescription>14 رقماً</FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="address"
                  render={({ field }) => (
                    <FormItem className="md:col-span-2">
                      <FormLabel>العنوان بالتفصيل *</FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder="المحافظة - المدينة - الحي - الشارع - رقم المبنى"
                          rows={2}
                          disabled={isSubmitting}
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="phone"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>الموبايل (1) *</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="01012345678"
                          maxLength={11}
                          dir="ltr"
                          disabled={isSubmitting}
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="phone2"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>الموبايل (2)</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="01112345678"
                          maxLength={11}
                          dir="ltr"
                          disabled={isSubmitting}
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem className="md:col-span-2">
                      <FormLabel>البريد الالكتروني</FormLabel>
                      <FormControl>
                        <Input
                          type="email"
                          placeholder="example@email.com"
                          dir="ltr"
                          disabled={isSubmitting}
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </div>

            {/* صور البطاقة */}
            <div className="grid gap-4 md:grid-cols-2">
              <FormField
                control={form.control}
                name="nationalIdPhotoUrl"
                render={({ field }) => (
                  <FormItem className="flex flex-col items-center">
                    <FormLabel>صورة وجه البطاقة *</FormLabel>
                    <FormControl>
                      <ImageUpload
                        value={field.value}
                        onChange={field.onChange}
                        disabled={isSubmitting}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="nationalIdPhotoBackUrl"
                render={({ field }) => (
                  <FormItem className="flex flex-col items-center">
                    <FormLabel>صورة ظهر البطاقة *</FormLabel>
                    <FormControl>
                      <ImageUpload
                        value={field.value}
                        onChange={field.onChange}
                        disabled={isSubmitting}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* ============ المؤهلات التعليمية ============ */}
            <div>
              <h3 className="text-lg font-semibold mb-4 text-primary">المؤهلات التعليمية</h3>
              <Separator className="mb-4" />

              <div className="grid gap-4 md:grid-cols-2">
                <FormField
                  control={form.control}
                  name="memberType"
                  render={({ field }) => (
                    <FormItem className="md:col-span-2">
                      <FormLabel>الحالة *</FormLabel>
                      <div className="flex gap-6">
                        <label className="flex items-center gap-2 cursor-pointer">
                          <input
                            type="radio"
                            value="student"
                            checked={field.value === 'student'}
                            onChange={() => field.onChange('student')}
                            disabled={isSubmitting}
                            className="h-4 w-4 accent-primary"
                          />
                          <span>طالب</span>
                        </label>
                        <label className="flex items-center gap-2 cursor-pointer">
                          <input
                            type="radio"
                            value="graduate"
                            checked={field.value === 'graduate'}
                            onChange={() => field.onChange('graduate')}
                            disabled={isSubmitting}
                            className="h-4 w-4 accent-primary"
                          />
                          <span>خريج</span>
                        </label>
                      </div>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="universityName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>اسم الجامعة *</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="جامعة القاهرة"
                          disabled={isSubmitting}
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="facultyName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>اسم الكلية *</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="كلية الهندسة"
                          disabled={isSubmitting}
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {memberType === 'student' && (
                  <FormField
                    control={form.control}
                    name="academicYear"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>الفرقة *</FormLabel>
                        <Select
                          onValueChange={field.onChange}
                          defaultValue={field.value}
                          disabled={isSubmitting}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="اختر الفرقة" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="الفرقة الأولى">الفرقة الأولى</SelectItem>
                            <SelectItem value="الفرقة الثانية">الفرقة الثانية</SelectItem>
                            <SelectItem value="الفرقة الثالثة">الفرقة الثالثة</SelectItem>
                            <SelectItem value="الفرقة الرابعة">الفرقة الرابعة</SelectItem>
                            <SelectItem value="الفرقة الخامسة">الفرقة الخامسة</SelectItem>
                            <SelectItem value="الفرقة السادسة">الفرقة السادسة</SelectItem>
                            <SelectItem value="الفرقة السابعة">الفرقة السابعة</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                )}

                <FormField
                  control={form.control}
                  name="postgraduateStudy"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>الدراسات العليا</FormLabel>
                      <div className="flex flex-wrap gap-4">
                        {[
                          { value: 'none', label: 'لا يوجد' },
                          { value: 'preliminary', label: 'تمهيدي' },
                          { value: 'masters', label: 'ماجستير' },
                          { value: 'doctorate', label: 'دكتوراه' },
                        ].map((option) => (
                          <label key={option.value} className="flex items-center gap-2 cursor-pointer">
                            <input
                              type="radio"
                              value={option.value}
                              checked={field.value === option.value}
                              onChange={() => field.onChange(option.value)}
                              disabled={isSubmitting}
                              className="h-4 w-4 accent-primary"
                            />
                            <span className="text-sm">{option.label}</span>
                          </label>
                        ))}
                      </div>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </div>

            {/* ============ الحالة الوظيفية ============ */}
            <div>
              <h3 className="text-lg font-semibold mb-4 text-primary">الحالة الوظيفية</h3>
              <Separator className="mb-4" />

              <div className="grid gap-4 md:grid-cols-2">
                <FormField
                  control={form.control}
                  name="employmentStatus"
                  render={({ field }) => (
                    <FormItem className="md:col-span-2">
                      <div className="flex gap-6">
                        <label className="flex items-center gap-2 cursor-pointer">
                          <input
                            type="radio"
                            value="working"
                            checked={field.value === 'working'}
                            onChange={() => field.onChange('working')}
                            disabled={isSubmitting}
                            className="h-4 w-4 accent-primary"
                          />
                          <span>أعمل</span>
                        </label>
                        <label className="flex items-center gap-2 cursor-pointer">
                          <input
                            type="radio"
                            value="not_working"
                            checked={field.value === 'not_working'}
                            onChange={() => field.onChange('not_working')}
                            disabled={isSubmitting}
                            className="h-4 w-4 accent-primary"
                          />
                          <span>لا أعمل</span>
                        </label>
                      </div>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {employmentStatus === 'working' && (
                  <>
                    <FormField
                      control={form.control}
                      name="jobTitle"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>المسمى الوظيفي *</FormLabel>
                          <FormControl>
                            <Input
                              placeholder="مثال: مهندس برمجيات"
                              disabled={isSubmitting}
                              {...field}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="employer"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>جهة العمل *</FormLabel>
                          <FormControl>
                            <Input
                              placeholder="مثال: شركة ..."
                              disabled={isSubmitting}
                              {...field}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </>
                )}
              </div>
            </div>

            {/* ============ الخبرات والمهارات ============ */}
            <div>
              <h3 className="text-lg font-semibold mb-4 text-primary">الخبرات والمهارات</h3>
              <Separator className="mb-4" />

              <div className="grid gap-4 md:grid-cols-2">
                <FormField
                  control={form.control}
                  name="previousExperiences"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>الخبرات السابقة</FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder="اذكر خبراتك السابقة في العمل التطوعي أو المهني..."
                          rows={3}
                          disabled={isSubmitting}
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="skills"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>المهارات</FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder="مثال: تصميم جرافيك، فوتوشوب، إدارة مشاريع..."
                          rows={3}
                          disabled={isSubmitting}
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </div>

            {/* ============ الإقرار ============ */}
            <div className="bg-muted/50 rounded-lg p-4 text-sm text-muted-foreground text-center">
              أقرّ أنا الموقع أدناه بصحة كافة البيانات الواردة في استمارة العضوية، وأتعهد بالالتزام بجميع القوانين واللوائح المنظمة لعمل اتحاد بشبابها.
            </div>

            <Button type="submit" className="w-full text-lg py-6" disabled={isSubmitting}>
              {isSubmitting ? (
                <>
                  <Loader2 className="ms-2 h-5 w-5 animate-spin" />
                  جاري تقديم الطلب...
                </>
              ) : (
                'تقديم طلب العضوية'
              )}
            </Button>
          </form>
        </Form>
      </CardContent>
    </Card>
  )
}
