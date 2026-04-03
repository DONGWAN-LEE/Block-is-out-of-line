import NextAuth from 'next-auth'
import Google from 'next-auth/providers/google'

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api/v1'

// Temporary store to pass backend data from signIn callback to jwt callback.
// Keyed by providerAccountId; cleared after jwt picks it up.
const pendingBackendData = new Map<string, { backendToken: string; admin: unknown }>()

export const { handlers, auth, signIn, signOut } = NextAuth({
  providers: [
    Google({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
  ],
  callbacks: {
    async signIn({ account }) {
      if (account?.provider !== 'google' || !account.id_token) {
        return false
      }

      try {
        const res = await fetch(`${API_BASE}/admin/auth/google`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ idToken: account.id_token }),
        })

        if (res.status === 403) {
          return false
        }

        const json = await res.json()
        if (!json.success) {
          return false
        }

        pendingBackendData.set(account.providerAccountId, {
          backendToken: json.data.accessToken,
          admin: json.data.admin,
        })
        return true
      } catch {
        return false
      }
    },

    async jwt({ token, account }) {
      if (account?.providerAccountId) {
        const pending = pendingBackendData.get(account.providerAccountId)
        if (pending) {
          token.backendToken = pending.backendToken
          token.admin = pending.admin
          pendingBackendData.delete(account.providerAccountId)
        }
      }
      return token
    },

    async session({ session, token }) {
      session.backendToken = token.backendToken as string | undefined
      session.admin = token.admin as Record<string, unknown> | undefined
      return session
    },
  },
  pages: {
    signIn: '/auth/signin',
    error: '/auth/signin',
  },
})

declare module 'next-auth' {
  interface Session {
    backendToken?: string
    admin?: Record<string, unknown>
  }
}
