import { auth } from '@/auth'
import { isAllowedEmail } from '@/lib/auth'
import { redirect } from 'next/navigation'

export default async function AppLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const session = await auth()

  if (!session?.user?.email) {
    redirect('/login')
  }

  // A session outlives a revoked approval
  if (!(await isAllowedEmail(session.user.email))) {
    redirect('/unauthorized')
  }

  return <>{children}</>
}
