import type { MetadataRoute } from "next";
import { prisma } from "@/lib/prisma";
import { SITE_URL } from "@/lib/siteUrl";
import { SIMULATOR_TRACKS } from "@/lib/revenueSimulator";

export const dynamic = "force-dynamic";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const articles = await prisma.article.findMany({
    where: { published: true },
    orderBy: { publishedAt: "desc" },
    select: { slug: true, publishedAt: true },
  });

  const posts = await prisma.post.findMany({
    orderBy: { createdAt: "desc" },
    select: { id: true, createdAt: true },
  });

  const staticRoutes: MetadataRoute.Sitemap = [
    { url: SITE_URL, changeFrequency: "daily", priority: 1 },
    { url: `${SITE_URL}/diagnosis`, changeFrequency: "monthly", priority: 0.7 },
    { url: `${SITE_URL}/simulator`, changeFrequency: "monthly", priority: 0.7 },
    { url: `${SITE_URL}/articles`, changeFrequency: "daily", priority: 0.9 },
    { url: `${SITE_URL}/board`, changeFrequency: "daily", priority: 0.6 },
    { url: `${SITE_URL}/about`, changeFrequency: "monthly", priority: 0.3 },
    { url: `${SITE_URL}/terms`, changeFrequency: "yearly", priority: 0.2 },
    { url: `${SITE_URL}/privacy`, changeFrequency: "yearly", priority: 0.2 },
  ];

  const simulatorRoutes: MetadataRoute.Sitemap = SIMULATOR_TRACKS.map((t) => ({
    url: `${SITE_URL}/simulator/${t.id}`,
    changeFrequency: "monthly",
    priority: 0.65,
  }));

  const articleRoutes: MetadataRoute.Sitemap = articles.map((a) => ({
    url: `${SITE_URL}/articles/${a.slug}`,
    lastModified: a.publishedAt ?? undefined,
    changeFrequency: "monthly",
    priority: 0.8,
  }));

  const postRoutes: MetadataRoute.Sitemap = posts.map((p) => ({
    url: `${SITE_URL}/board/${p.id}`,
    lastModified: p.createdAt,
    changeFrequency: "weekly",
    priority: 0.5,
  }));

  return [...staticRoutes, ...simulatorRoutes, ...articleRoutes, ...postRoutes];
}
