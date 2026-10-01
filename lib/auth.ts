import type { NextAuthConfig } from 'next-auth'
import Credentials from 'next-auth/providers/credentials'
import Google from 'next-auth/providers/google'
import { db } from './db'
import { DEMO_EMAIL, isDemoEmail } from './demo'

if (!process.env.GOOGLE_CLIENT_ID || !process.env.GOOGLE_CLIENT_SECRET) {
  throw new Error('Missing Google OAuth credentials')
}

// The demo user is never admin, whatever ADMIN_EMAIL says
export const isAdminEmail = (email?: string | null) =>
  !!email && email === process.env.ADMIN_EMAIL && !isDemoEmail(email)

// The admin and the demo user are always allowed, everyone else needs an approved AllowedUser row
export async function isAllowedEmail(email: string) {
  if (isAdminEmail(email) || isDemoEmail(email)) return true
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
    // "Prova la demo": no input is read, so it can only ever sign in the demo user
    Credentials({
      id: 'demo',
      name: 'Demo',
      credentials: {},
      authorize: () => ({ id: 'demo', email: DEMO_EMAIL, name: 'Demo' }),
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

      // The demo user gets no AllowedUser row: nothing for the admin to approve or revoke
      if (!isDemoEmail(user.email)) {
        // First sign-in leaves a pending request for the admin to approve
        await db.allowedUser.upsert({
          where: { email: user.email },
          update: {},
          create: { email: user.email },
        })

        if (!(await isAllowedEmail(user.email))) {
          return '/unauthorized'
        }
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
