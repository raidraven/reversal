import { withAuth } from "next-auth/middleware";
import { NextResponse } from "next/server";

// 認証必須ページ(未ログイン時は /login へリダイレクト)。
// /admin は館の主(isAdmin)のみ通過できる。
export default withAuth(
  function middleware(req) {
    const isAdminPath = req.nextUrl.pathname.startsWith("/admin");
    const isAdmin = !!req.nextauth.token?.isAdmin;
    if (isAdminPath && !isAdmin) {
      return NextResponse.redirect(new URL("/home", req.url));
    }
  },
  {
    pages: { signIn: "/login" },
    callbacks: {
      // token が存在すればログイン済みとして通過させる(admin判定は上のmiddleware本体で行う)
      authorized: ({ token }) => !!token,
    },
  }
);

export const config = {
  matcher: [
    "/home/:path*",
    "/missions/:path*",
    "/settings/:path*",
    "/admin/:path*",
    "/questions/:path*",
    "/board/new/:path*",
  ],
};
