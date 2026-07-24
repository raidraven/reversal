import type { CardLink } from "@/components/home/MemberCard";

/** User.links (Prisma Json?) を安全にCardLink[]へ変換する */
export function parseCardLinks(json: unknown): CardLink[] {
  if (!Array.isArray(json)) return [];
  return json
    .filter((l): l is { label?: unknown; url?: unknown } => typeof l === "object" && l !== null)
    .map((l) => ({
      label: typeof l.label === "string" ? l.label : "",
      url: typeof l.url === "string" ? l.url : "",
    }))
    .filter((l) => l.label && l.url);
}
