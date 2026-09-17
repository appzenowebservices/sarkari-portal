import CredentialsProvider from "next-auth/providers/credentials";
import type { NextAuthConfig } from "next-auth";
import { PrismaAdapter } from "@auth/prisma-adapter";

import { db } from "@/server/db";
import { verifyPassword } from "@/lib/auth";

export const authConfig = {
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        username: { label: "Username", type: "text" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        const username = (credentials?.username as string | undefined)?.trim().toLowerCase();
        const password = credentials?.password as string | undefined;
        if (!username || !password) return null;

        const admin = await db.admin.findFirst({ where: { username } });
        if (!admin) return null;

        const valid = await verifyPassword(password, admin.passwordHash);
        if (!valid) return null;

        return { id: admin.id, name: admin.name, email: `${admin.username}@local` };
      },
    }),
  ],
  adapter: PrismaAdapter(db),
  session: { strategy: "jwt" },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = (user as { id?: string }).id ?? token.sub;
      }
      return token;
    },
    async session({ session, token }) {
      if (token && session.user) {
        (session.user as { id?: string }).id = (token.id ?? token.sub) as string;
      }
      return session;
    },
  },
  pages: { signIn: "/login" },
} satisfies NextAuthConfig;
