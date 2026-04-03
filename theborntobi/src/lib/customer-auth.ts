import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";
import { db } from "@/lib/db";

const customerNextAuth = NextAuth({
  providers: [
    Credentials({
      name: "Customer Login",
      credentials: {
        username: { label: "아이디", type: "text" },
        password: { label: "비밀번호", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.username || !credentials?.password) return null;

        const customer = await db.customer.findUnique({
          where: { username: credentials.username as string },
        });

        if (!customer || !customer.passwordHash || customer.deletedAt) return null;

        const isValid = await bcrypt.compare(
          credentials.password as string,
          customer.passwordHash
        );

        if (!isValid) return null;

        return {
          id: customer.id,
          email: customer.email,
          name: customer.name,
          ageVerified: customer.ageVerified,
        };
      },
    }),
  ],
  basePath: "/api/customer-auth",
  pages: {
    signIn: "/auth/login",
  },
  cookies: {
    sessionToken: {
      name: "customer-session-token",
    },
  },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.type = "customer";
        token.ageVerified = (user as { ageVerified?: boolean }).ageVerified ?? false;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.sub!;
        (session.user as unknown as Record<string, unknown>).ageVerified = token.ageVerified;
        (session.user as unknown as Record<string, unknown>).type = "customer";
      }
      return session;
    },
  },
  session: {
    strategy: "jwt",
  },
});

export const customerHandlers = customerNextAuth.handlers;
export const customerSignIn = customerNextAuth.signIn;
export const customerSignOut = customerNextAuth.signOut;
export const customerAuth = customerNextAuth.auth;
