import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import Link from "next/link";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { SiteTextsManager } from "@/components/admin/SiteTextsManager";
import { RanksManager } from "@/components/admin/RanksManager";
import { MissionsManager } from "@/components/admin/MissionsManager";
import { IncidentDaysManager } from "@/components/admin/IncidentDaysManager";
import { PostsManager } from "@/components/admin/PostsManager";
import { AdminSection } from "@/components/admin/AdminSection";
import { listAllIconCandidates } from "@/lib/iconCandidates";
import { ICON_SLOTS } from "@/lib/siteTextDefaults";

export const dynamic = "force-dynamic";

function formatDate(d: Date): string {
  return new Intl.DateTimeFormat("ja-JP", {
    timeZone: "Asia/Tokyo",
    dateStyle: "medium",
    timeStyle: "short",
  }).format(d);
}

export default async function AdminPage() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) redirect("/login");
  if (!session.user.isAdmin) redirect("/home");

  const requests = await prisma.hostRequest.findMany({
    orderBy: { createdAt: "desc" },
  });
  const iconCandidates = listAllIconCandidates(ICON_SLOTS);

  return (
    <main className="mx-auto max-w-2xl space-y-6 px-4 py-8 lg:max-w-5xl">
      <header className="flex items-center justify-between">
        <div>
          <p className="text-xs uppercase tracking-widest text-gold/70">館の主 専用</p>
          <h1 className="mansion-title text-2xl">管理ページ</h1>
        </div>
        <Link href="/home" className="ghost-button !px-3 !py-2 text-xs">
          ホームへ戻る
        </Link>
      </header>

      <div className="grid grid-cols-1 items-start gap-4 lg:grid-cols-2">
        <AdminSection title="文言・アイコンの編集" defaultOpen>
          <SiteTextsManager iconCandidates={iconCandidates} />
        </AdminSection>

        <AdminSection title="位階(称号)の設定" description="レベルごとの称号を編集・追加・削除できます">
          <RanksManager />
        </AdminSection>

        <AdminSection title="今宵の使命(デイリーミッション)の設定">
          <MissionsManager />
        </AdminSection>

        <AdminSection title="談話室の投稿管理">
          <PostsManager />
        </AdminSection>

        <AdminSection
          title="障害日(ストリーク救済)の登録"
          description="サイト障害等で欠席扱いにしたくない日を登録します"
        >
          <IncidentDaysManager />
        </AdminSection>

        <AdminSection title="主催者への要望" description={`来賓たちから届いた要望・感想(全 ${requests.length} 件)`}>
          {requests.length === 0 ? (
            <p className="text-center text-sm text-stone-500">まだ要望は届いていません。</p>
          ) : (
            <ul className="space-y-3">
              {requests.map((r) => (
                <li key={r.id} className="rounded-md border border-surface-border bg-surface-raised p-3">
                  <div className="flex items-center justify-between text-xs text-stone-500">
                    <span className="font-serif text-gold-light">{r.name}</span>
                    <span>{formatDate(r.createdAt)}</span>
                  </div>
                  <p className="mt-2 whitespace-pre-wrap text-sm leading-relaxed text-stone-200">
                    {r.content}
                  </p>
                </li>
              ))}
            </ul>
          )}
        </AdminSection>
      </div>
    </main>
  );
}
