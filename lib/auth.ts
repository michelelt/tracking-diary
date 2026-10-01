import type { NextAuthConfig } from 'next-auth'
import Google from 'next-auth/providers/google'
import { db } from './db'

if (!process.env.GOOGLE_CLIENT_ID || !process.env.GOOGLE_CLIENT_SECRET) {
  throw new Error('Missing Google OAuth credentials')
}

export const isAdminEmail = (email?: string | null) => !!email && email === process.env.ADMIN_EMAIL

// The admin is always allowed, everyone else needs an approved AllowedUser row
export async function isAllowedEmail(email: string) {
  if (isAdminEmail(email)) return true
  const allowed = await db.allowedUser.findUnique({ where: { email } })
  return !!allowed?.approved
}

export const authConfig: NextAuthConfig = {
  trustHost: true,
  providers: [
    Google({
      clientId: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    }),
  ],
  pages: {
    signIn: '/login',
    error: '/login',
  },
  callbacks: {
    async signIn({ user }) {
      if (!user.email) {
        return false
      }

      // First sign-in leaves a pending request for the admin to approve
      await db.allowedUser.upsert({
        where: { email: user.email },
        update: {},
        create: { email: user.email },
      })

      if (!(await isAllowedEmail(user.email))) {
        return '/unauthorized'
      }

      // Create or update user in User table
      await db.user.upsert({
        where: { email: user.email },
        update: {
          name: user.name || undefined,
          image: user.image || undefined,
        },
        create: {
          email: user.email,
          name: user.name || undefined,
          image: user.image || undefined,
        },
      })

      return true
    },
    async session({ session, token }) {
      // Use JWT token data instead of querying DB in Edge Runtime
      if (session.user) {
        ;(session.user as any).id = token.sub
        // Lets the navigation show the admin link; access is enforced server-side
        ;(session.user as any).isAdmin = isAdminEmail(session.user.email)
      }
      return session
    },
    async jwt({ token }) {
      return token
    },
  },
}
