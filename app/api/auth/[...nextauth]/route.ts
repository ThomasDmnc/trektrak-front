import NextAuth from "next-auth"
import CredentialsProvider from "next-auth/providers/credentials"

const handler = NextAuth({
  providers: [
    CredentialsProvider({
      name: "Email & Password",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" }
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          return null
        }

        const { email, password } = credentials
        console.log("Attempting login for:", credentials.email)
        try {
          const res = await fetch(`${process.env.BACKEND_URL}/login`, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              "Accept": "application/json"
            },
            body: JSON.stringify({
              user: {
                email: email,
                password: password,
              }
            })
          })

          if (!res.ok) {
            console.error("Login failed:", res.status, res.statusText)
            return null
          }

          const data = await res.json()
          const token = res.headers.get("Authorization")?.split(" ")[1]
          console.log("Login response data:", data)
          console.log("Token received:", token)

          const userData = data.status?.data?.user;

          if (userData && token) {
            return {
              id: userData.id.toString(),
              name: userData.username || userData.first_name || userData.email,
              email: userData.email,
              photo_url: userData.photo_url,
              token: token
            }
          }
          return null
        } catch (error) {
          console.error("Authentication error:", error)
          return null
        }
      }
    })
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user?.token) {
        token.accessToken = user.token
      }
      return token
    },
    async session({ session, token }) {
      if (session.user && token.accessToken) {
        session.user.accessToken = token.accessToken
      }
      return session
    }
  },
  events: {
    async signOut({ token }) {
      if (token?.accessToken) {
        try {
          await fetch(`${process.env.BACKEND_URL}/logout`, {
            method: "DELETE",
            headers: {
              "Authorization": `Bearer ${token.accessToken}`,
              "Content-Type": "application/json"
            }
          })
        } catch (error) {
          console.error("Error during server-side logout:", error)
        }
      }
    }
  },
  session: {
    strategy: "jwt"
  },
  pages: {
    signIn: "/login"
  },
  secret: process.env.NEXTAUTH_SECRET
})

export { handler as GET, handler as POST }
