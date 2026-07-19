import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import Link from "next/link";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { getSiteTexts } from "@/lib/siteText";
import { SiteTextsManager } from "@/components/admin/SiteTextsManager";
import { RanksManager } from "@/components/admin/RanksManager";
import { MissionsManager } from "@/components/admin/MissionsManager";
import { IncidentDaysManager } from "@/components/admin/IncidentDaysManager";
import { PostsManager } from "@/components/admin/PostsManager";
import { ArticlesManager } from "@/components/admin/ArticlesManager";
import { AdminSection } from "@/components/admin/AdminSection";
import { EditableText } from "@/components/admin/EditableText";
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

  const [requests, texts] = await Promise.all([
    prisma.hostRequest.findMany({ orderBy: { createdAt: "desc" } }),
    getSiteTexts(),
  ]);
  const iconCandidates = listAllIconCandidates(ICON_SLOTS);

  return (
    <main className="mx-auto max-w-2xl space-y-6 px-4 py-8 lg:max-w-5xl">
      <header className="flex items-center justify-between">
        <div>
          <p className="text-xs uppercase tracking-widest text-gold/70">
            <EditableText siteTextKey="admin.subtitle" value={texts["admin.subtitle"]} />
          </p>
          <h1 className="mansion-title text-2xl">
            <EditableText siteTextKey="admin.title" value={texts["admin.title"]} />
          </h1>
        </div>
        <Link href="/home" className="ghost-button !px-3 !py-2 text-xs">
          ホームへ戻る
        </Link>
      </header>

      <div className="grid grid-cols-1 items-start gap-4 lg:grid-cols-2">
        <AdminSection
          title={<EditableText siteTextKey="admin.section.articles" value={texts["admin.section.articles"]} />}
          defaultOpen
        >
          <ArticlesManager />
        </AdminSection>

        <AdminSection
          title={
            <EditableText siteTextKey="admin.section.siteTexts" value={texts["admin.section.siteTexts"]} />
          }
        >
          <SiteTextsManager iconCandidates={iconCandidates} />
        </AdminSection>

        <AdminSection
          title={<EditableText siteTextKey="admin.section.ranks" value={texts["admin.section.ranks"]} />}
          description={
            <EditableText
              siteTextKey="admin.section.ranksDescription"
              value={texts["admin.section.ranksDescription"]}
            />
          }
        >
          <RanksManager />
        </AdminSection>

        <AdminSection
          title={<EditableText siteTextKey="admin.section.missions" value={texts["admin.section.missions"]} />}
        >
          <MissionsManager />
        </AdminSection>

        <AdminSection
          title={<EditableText siteTextKey="admin.section.posts" value={texts["admin.section.posts"]} />}
        >
          <PostsManager />
        </AdminSection>

        <AdminSection
          title={
            <EditableText siteTextKey="admin.section.incidentDays" value={texts["admin.section.incidentDays"]} />
          }
          description={
            <EditableText
              siteTextKey="admin.section.incidentDaysDescription"
              value={texts["admin.section.incidentDaysDescription"]}
            />
          }
        >
          <IncidentDaysManager />
        </AdminSection>

        <AdminSection
          title={
            <EditableText
              siteTextKey="admin.section.hostRequests"
              value={texts["admin.section.hostRequests"]}
            />
          }
          description={
            <>
              <EditableText
                siteTextKey="admin.section.hostRequestsDescription"
                value={texts["admin.section.hostRequestsDescription"]}
              />
              {`(全 ${requests.length} 件)`}
            </>
          }
        >
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
