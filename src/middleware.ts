import { getToken } from "next-auth/jwt";
import { NextResponse, type NextRequest } from "next/server";

const ANON_ID_COOKIE = "reversal_anon_id";

// 認証必須ページ(未ログイン時は /login へリダイレクト)。
// /admin は館の主(isAdmin)のみ通過できる。
const AUTH_REQUIRED_PREFIXES = ["/home", "/missions", "/settings", "/admin", "/questions", "/board/new"];

export default async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;
  const token = await getToken({ req });

  if (AUTH_REQUIRED_PREFIXES.some((prefix) => pathname.startsWith(prefix))) {
    if (!token) {
      return NextResponse.redirect(new URL("/login", req.url));
    }
    if (pathname.startsWith("/admin") && !token.isAdmin) {
      return NextResponse.redirect(new URL("/home", req.url));
    }
  }

  // 未ログインの来賓に匿名IDを発行する(来賓数カウント・いいね機能で使用)。
  // Server Componentからは新規Cookieを発行できないため、ここで発行してリクエストに乗せ直す。
  if (!token && !req.cookies.get(ANON_ID_COOKIE)) {
    const anonId = crypto.randomUUID();
    req.cookies.set(ANON_ID_COOKIE, anonId);
    const response = NextResponse.next({ request: req });
    response.cookies.set(ANON_ID_COOKIE, anonId, {
      httpOnly: true,
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
      maxAge: 60 * 60 * 24 * 365,
      path: "/",
    });
    return response;
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/",
    "/home/:path*",
    "/missions/:path*",
    "/settings/:path*",
    "/admin/:path*",
    "/questions/:path*",
    "/board/:path*",
    "/articles/:path*",
  ],
};
