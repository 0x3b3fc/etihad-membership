import { redirect } from 'next/navigation'
import { getMemberSession } from '@/lib/member-auth'
import { UserHeader } from '@/components/layout/UserHeader'
import { getSiteName } from '@/lib/actions/settings.actions'

export default async function ApplicantLayout({ children }: { children: React.ReactNode }) {
  const member = await getMemberSession()

  if (!member) {
    redirect('/applicant/login')
  }

  const siteName = await getSiteName()

  return (
    <div className="min-h-screen flex flex-col">
      <UserHeader user={{ name: member.fullNameAr, email: member.nationalId }} siteName={siteName} />
      <main className="flex-1 container mx-auto p-3 sm:p-4 lg:p-6">{children}</main>
    </div>
  )
}
