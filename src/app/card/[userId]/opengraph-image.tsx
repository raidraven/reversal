import { ImageResponse } from "next/og";
import { prisma } from "@/lib/prisma";
import { titleForRank } from "@/lib/rankTitle";
import { getRanks } from "@/lib/ranks";

export const alt = "REVERSAL 会員証";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

const GOLD = "#c9a24d";
const GOLD_LIGHT = "#e6c878";
const WINE_LIGHT = "#7d2438";
const SURFACE = "#0a0708";
const SURFACE_CARD = "#160f11";
const SURFACE_RAISED = "#1f1418";
const STONE_100 = "#f5f0e8";
const STONE_500 = "#8a7a6a";

/** undefined/null=デフォルト文言 / ""=非表示 / それ以外=上書き文言(MemberCard.tsxのresolveTextと同じ規則) */
function resolveText(override: string | null | undefined, fallback: string): string | null {
  if (override === undefined || override === null) return fallback;
  if (override === "") return null;
  return override;
}

/** Google Fontsの「text=」サブセットAPIで、実際に描画する文字だけを含む軽量フォントを取得する */
async function loadJapaneseFont(text: string, weight: 400 | 700): Promise<ArrayBuffer | null> {
  try {
    const cssRes = await fetch(
      `https://fonts.googleapis.com/css2?family=Noto+Sans+JP:wght@${weight}&text=${encodeURIComponent(text)}`,
      { headers: { "User-Agent": "Mozilla/5.0 (Windows NT 6.1) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/40.0" } }
    );
    const css = await cssRes.text();
    const match = css.match(/src: url\(([^)]+)\)/);
    if (!match) return null;
    const fontRes = await fetch(match[1]);
    return await fontRes.arrayBuffer();
  } catch {
    return null;
  }
}

type Props = { params: { userId: string } };

export default async function Image({ params }: Props) {
  const [user, ranks] = await Promise.all([
    prisma.user.findUnique({ where: { id: params.userId } }),
    getRanks(),
  ]);

  const isVisible = !!user && user.cardPublic && !user.banned;

  if (!isVisible) {
    const text = "REVERSAL";
    const font = await loadJapaneseFont("REVERSAL 会員証は非公開です", 400);
    return new ImageResponse(
      (
        <div
          style={{
            width: "100%",
            height: "100%",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            backgroundColor: SURFACE,
          }}
        >
          <div style={{ display: "flex", fontSize: 56, color: GOLD_LIGHT, letterSpacing: 4 }}>{text}</div>
          <div style={{ display: "flex", fontSize: 28, color: STONE_500, marginTop: 16 }}>
            会員証は非公開です
          </div>
        </div>
      ),
      { ...size, fonts: font ? [{ name: "Noto Sans JP", data: font, weight: 400 }] : [] }
    );
  }

  const title = titleForRank(user.level, ranks);
  const header = resolveText(user.cardHeaderText, "REVERSAL 会員証");
  const nameSuffix = resolveText(user.cardNameSuffixText, "様");
  const titleDisplay = resolveText(user.cardTitleText, title);
  const levelLabel = resolveText(user.cardLevelLabelText, "位階");

  const bioExcerpt = user.bio ? (user.bio.length > 60 ? `${user.bio.slice(0, 60)}…` : user.bio) : null;

  const allText = [
    header,
    user.name,
    nameSuffix,
    titleDisplay,
    levelLabel,
    String(user.level),
    bioExcerpt,
    "REVERSAL",
  ]
    .filter((t): t is string => !!t)
    .join("");

  const [regular, bold] = await Promise.all([
    loadJapaneseFont(allText, 400),
    loadJapaneseFont(allText, 700),
  ]);

  const fonts = [
    ...(regular ? [{ name: "Noto Sans JP", data: regular, weight: 400 as const }] : []),
    ...(bold ? [{ name: "Noto Sans JP", data: bold, weight: 700 as const }] : []),
  ];

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          padding: 48,
          backgroundColor: SURFACE,
        }}
      >
        <div
          style={{
            width: "100%",
            height: "100%",
            display: "flex",
            flexDirection: "column",
            justifyContent: "center",
            backgroundColor: SURFACE_CARD,
            border: `2px solid ${GOLD}`,
            borderRadius: 24,
            padding: "56px 72px",
          }}
        >
          {header && (
            <div
              style={{
                display: "flex",
                fontSize: 22,
                color: "rgba(230,200,120,0.7)",
                letterSpacing: 6,
                textTransform: "uppercase",
              }}
            >
              {header}
            </div>
          )}

          <div style={{ display: "flex", flexDirection: "row", alignItems: "center", marginTop: 28 }}>
            <div style={{ display: "flex", flexDirection: "column", flex: 1 }}>
              <div style={{ display: "flex", fontSize: 56, fontWeight: 700, color: STONE_100 }}>
                {user.name}
                {nameSuffix ? ` ${nameSuffix}` : ""}
              </div>
              {titleDisplay && (
                <div
                  style={{
                    display: "flex",
                    marginTop: 16,
                    alignSelf: "flex-start",
                    backgroundColor: "rgba(124,36,56,0.2)",
                    border: `1px solid ${WINE_LIGHT}`,
                    borderRadius: 999,
                    padding: "8px 24px",
                    fontSize: 28,
                    color: GOLD_LIGHT,
                  }}
                >
                  {titleDisplay}
                </div>
              )}
            </div>

            {levelLabel && (
              <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end" }}>
                <div style={{ display: "flex", fontSize: 22, color: STONE_500 }}>{levelLabel}</div>
                <div style={{ display: "flex", fontSize: 96, fontWeight: 700, color: GOLD_LIGHT, lineHeight: 1 }}>
                  {user.level}
                </div>
              </div>
            )}
          </div>

          {bioExcerpt && (
            <div
              style={{
                display: "flex",
                marginTop: 32,
                fontSize: 26,
                color: "#d6cfc9",
                borderTop: `1px solid ${SURFACE_RAISED}`,
                paddingTop: 28,
              }}
            >
              {bioExcerpt}
            </div>
          )}

          <div
            style={{
              display: "flex",
              marginTop: "auto",
              paddingTop: 32,
              fontSize: 20,
              letterSpacing: 4,
              color: STONE_500,
            }}
          >
            REVERSAL
          </div>
        </div>
      </div>
    ),
    { ...size, fonts }
  );
}
