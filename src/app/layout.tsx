import type { Metadata, Viewport } from "next";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { EditModeProvider } from "@/components/admin/EditModeProvider";
import { MobileNavMenu, type NavLink } from "@/components/MobileNavMenu";
import { GoogleAnalytics } from "@/components/GoogleAnalytics";
import { getSiteText } from "@/lib/siteText";
import { SITE_URL } from "@/lib/siteUrl";
import "./globals.css";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: "リバーサル",
  description: "AI副業で人生を反転させたい者たちが集う、秘密の仮面舞踏会",
  openGraph: {
    title: "リバーサル",
    description: "AI副業で人生を反転させたい者たちが集う、秘密の仮面舞踏会",
    type: "website",
    url: SITE_URL,
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#0a0708",
};

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const session = await getServerSession(authOptions);

  let navLinks: NavLink[] = [];
  if (session?.user?.id) {
    const boardName = await getSiteText("board.name");
    navLinks = [
      { href: "/", label: "ホームに戻る" },
      { href: "/home", label: "自室に戻る" },
      { href: "/questions", label: "質問に答える" },
      { href: "/questions/new", label: "質問する" },
      { href: "/board", label: boardName },
      { href: "/articles", label: "書庫" },
      ...(session.user.isAdmin ? [{ href: "/admin", label: "主人の部屋", gold: true }] : []),
    ];
  }

  return (
    <html lang="ja">
      <body>
        <GoogleAnalytics />
        <EditModeProvider isAdmin={!!session?.user?.isAdmin}>
          {children}
          {session?.user?.id && <MobileNavMenu links={navLinks} />}
        </EditModeProvider>
      </body>
    </html>
  );
}
