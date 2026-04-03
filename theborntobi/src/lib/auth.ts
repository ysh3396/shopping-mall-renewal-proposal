import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";
import { db } from "@/lib/db";

export const { handlers, signIn, signOut, auth } = NextAuth({
  providers: [
    Credentials({
      id: "admin-credentials",
      name: "Admin Login",
      credentials: {
        email: { label: "이메일", type: "email" },
        password: { label: "비밀번호", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) return null;

        const user = await db.adminUser.findUnique({
          where: { email: credentials.email as string },
          include: { role: true },
        });

        if (!user || !user.isActive) return null;

        const isValid = await bcrypt.compare(
          credentials.password as string,
          user.passwordHash
        );

        if (!isValid) return null;

        await db.adminUser.update({
          where: { id: user.id },
          data: { lastLoginAt: new Date() },
        });

        return {
          id: user.id,
          email: user.email,
          name: user.name,
          role: user.role.name,
          userType: "admin",
        };
      },
    }),
    Credentials({
      id: "customer-credentials",
      name: "Customer Login",
      credentials: {
        email: { label: "이메일", type: "email" },
        password: { label: "비밀번호", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) return null;

        const customer = await db.customer.findUnique({
          where: { email: credentials.email as string },
          include: { grade: true },
        });

        if (!customer || customer.deletedAt || !customer.passwordHash) return null;

        const isValid = await bcrypt.compare(
          credentials.password as string,
          customer.passwordHash
        );

        if (!isValid) return null;

        return {
          id: customer.id,
          email: customer.email,
          name: customer.name,
          userType: "customer",
          gradeName: customer.grade?.name ?? null,
        };
      },
    }),
  ],
  pages: {
    signIn: "/admin/login",
  },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.role = (user as { role?: string }).role;
        token.userType = (user as { userType?: "admin" | "customer" }).userType;
        token.gradeName = (user as { gradeName?: string | null }).gradeName;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.sub!;
        (session.user as { role?: string }).role = token.role as string;
        (session.user as { userType?: "admin" | "customer" }).userType = token.userType as
          | "admin"
          | "customer";
        (session.user as { gradeName?: string | null }).gradeName =
          (token.gradeName as string | null) ?? null;
      }
      return session;
    },
  },
  session: {
    strategy: "jwt",
  },
});
