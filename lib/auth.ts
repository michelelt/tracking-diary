import type { NextAuthConfig } from 'next-auth'
import Google from 'next-auth/providers/google'
import { db } from './db'

if (!process.env.GOOGLE_CLIENT_ID || !process.env.GOOGLE_CLIENT_SECRET) {
  throw new Error('Missing Google OAuth credentials')
}

export const authConfig: NextAuthConfig = {
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

      // Create entry in AllowedUser if doesn't exist
      await db.allowedUser.upsert({
        where: { email: user.email },
        update: {},
        create: { email: user.email },
      })

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
      }
      return session
    },
    async jwt({ token, user }) {
      return token
    },
  },
}
