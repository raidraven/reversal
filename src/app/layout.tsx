import type { Metadata, Viewport } from "next";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { EditModeProvider } from "@/components/admin/EditModeProvider";
import { MobileNavMenu, type NavLink } from "@/components/MobileNavMenu";
import { DesktopNav } from "@/components/DesktopNav";
import { GoogleAnalytics } from "@/components/GoogleAnalytics";
import { getSiteText } from "@/lib/siteText";
import { SITE_URL } from "@/lib/siteUrl";
import "./globals.css";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: "REVERSAL",
  description: "人生を反転させたい者たちが集う、秘密の洋館",
  openGraph: {
    title: "REVERSAL",
    description: "人生を反転させたい者たちが集う、秘密の洋館",
    type: "website",
    url: SITE_URL,
    images: [{ url: "/og-image.jpg", width: 1200, height: 630 }],
  },
  twitter: {
    card: "summary_large_image",
    title: "REVERSAL",
    description: "人生を反転させたい者たちが集う、秘密の洋館",
    images: ["/og-image.jpg"],
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#0a0708",
};

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const session = await getServerSession(authOptions);
  const isLoggedIn = !!session?.user?.id;
  const boardName = await getSiteText("board.name");
  const roomBackLabel = await getSiteText("room.backLabel");

  const navLinks: NavLink[] = isLoggedIn
    ? [
        { href: "/", label: "ホームに戻る" },
        { href: "/home", label: roomBackLabel },
        { href: "/questions", label: "質問に答える" },
        { href: "/questions/new", label: "質問する" },
        { href: "/board", label: boardName },
        { href: "/articles", label: "書庫" },
        ...(session!.user.isAdmin ? [{ href: "/admin", label: "主人の部屋", gold: true }] : []),
      ]
    : [
        { href: "/", label: "館の入口" },
        { href: "/board", label: boardName },
        { href: "/articles", label: "書庫" },
        { href: "/signup", label: "招待状を受け取る", gold: true },
      ];

  return (
    <html lang="ja">
      <body>
        <GoogleAnalytics />
        <EditModeProvider isAdmin={!!session?.user?.isAdmin}>
          <DesktopNav links={navLinks} isLoggedIn={isLoggedIn} />
          <div className="lg:pl-48">{children}</div>
          {isLoggedIn && <MobileNavMenu links={navLinks} />}
        </EditModeProvider>
      </body>
    </html>
  );
}
