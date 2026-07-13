import type { Metadata, Viewport } from "next";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { EditModeProvider } from "@/components/admin/EditModeProvider";
import "./globals.css";

export const metadata: Metadata = {
  title: "リバーサル",
  description: "AI副業で人生を反転させたい者たちが集う、秘密の仮面舞踏会",
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#0a0708",
};

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const session = await getServerSession(authOptions);

  return (
    <html lang="ja">
      <body>
        <EditModeProvider isAdmin={!!session?.user?.isAdmin}>{children}</EditModeProvider>
      </body>
    </html>
  );
}
