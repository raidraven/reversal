import type { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { isRateLimited, recordFailedAttempt, clearAttempts } from "@/lib/loginRateLimit";

if (process.env.NODE_ENV === "production" && !process.env.NEXTAUTH_SECRET) {
  throw new Error("NEXTAUTH_SECRET が未設定です。本番環境では必ず設定してください。");
}

/** ADMIN_EMAILS環境変数(カンマ区切り)に含まれるメールかどうか */
function isAdminEmail(email: string): boolean {
  const list = (process.env.ADMIN_EMAILS ?? "")
    .split(",")
    .map((e) => e.trim().toLowerCase())
    .filter(Boolean);
  return list.includes(email.toLowerCase());
}

// 将来 LINE Login 等を追加する場合は providers 配列に足すだけでよい構成
export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: "メールアドレス",
      credentials: {
        email: { label: "メールアドレス", type: "email" },
        password: { label: "パスワード", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) return null;

        const rateLimitKey = `login:${credentials.email.toLowerCase()}`;
        if (await isRateLimited(rateLimitKey)) {
          throw new Error("rate_limited");
        }

        const user = await prisma.user.findUnique({
          where: { email: credentials.email.toLowerCase() },
        });
        if (!user) {
          await recordFailedAttempt(rateLimitKey);
          return null;
        }

        const valid = await bcrypt.compare(credentials.password, user.passwordHash);
        if (!valid) {
          await recordFailedAttempt(rateLimitKey);
          return null;
        }
        await clearAttempts(rateLimitKey);

        // 通報の積み重ねで追放(banned)されたアカウントはログイン自体を拒否する
        if (user.banned) {
          throw new Error("banned");
        }

        // ADMIN_EMAILS に一致するユーザーには館の主(管理者)権限を自動付与
        let isAdmin = user.isAdmin;
        if (!isAdmin && isAdminEmail(user.email)) {
          const updated = await prisma.user.update({
            where: { id: user.id },
            data: { isAdmin: true },
          });
          isAdmin = updated.isAdmin;
        }

        return { id: user.id, email: user.email, name: user.name, isAdmin };
      },
    }),
  ],
  session: {
    strategy: "jwt",
    maxAge: 30 * 24 * 60 * 60, // 30日
  },
  pages: {
    signIn: "/login",
  },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.isAdmin = (user as { isAdmin?: boolean }).isAdmin ?? false;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user && token.id) {
        session.user.id = token.id as string;
        session.user.isAdmin = !!token.isAdmin;
      }
      return session;
    },
  },
  secret: process.env.NEXTAUTH_SECRET,
};
