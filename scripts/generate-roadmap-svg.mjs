// 柱記事①の図解(位階ロードマップ)SVGを roadmapData.mjs のデータから生成するスクリプト
//
// 使い方:
//   node scripts/generate-roadmap-svg.mjs
//
// 文言を変えたい場合は roadmapData.mjs を編集してから、このスクリプトを再実行する。
// SVGファイル自体を手で編集する必要はない。
import { writeFileSync } from "fs";
import { ROADMAP_TITLE, ROADMAP_SUBTITLE, ROADMAP_FOOTER, STAGES } from "./roadmapData.mjs";

const OUT_PATH = "public/images/articles/ai-side-hustle-roadmap.svg";

const CANVAS_WIDTH = 800;
const CARD_X = 60;
const CARD_WIDTH = 680;
const FIRST_LINE_Y = 115;
const LINE_SPACING = 23;
const BOTTOM_PADDING = 69;
const CARD_GAP = 40;
const TOP_MARGIN = 120;
const FOOTER_HEIGHT = 60;

function cardHeight(stage) {
  const maxItems = Math.max(stage.doItems.length, stage.noteItems.length, 1);
  return FIRST_LINE_Y + (maxItems - 1) * LINE_SPACING + BOTTOM_PADDING;
}

function escapeXml(s) {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}

function renderCard(stage, y) {
  const h = cardHeight(stage);
  const doLines = stage.doItems
    .map((item, i) => `<text x="40" y="${FIRST_LINE_Y + i * LINE_SPACING}" fill="#d8cfc2" font-size="14">・${escapeXml(item)}</text>`)
    .join("\n    ");
  const noteLines = stage.noteItems
    .map((item, i) => `<text x="400" y="${FIRST_LINE_Y + i * LINE_SPACING}" fill="#a08e93" font-size="14">・${escapeXml(item)}</text>`)
    .join("\n    ");

  return `
  <g transform="translate(${CARD_X},${y})">
    <rect width="${CARD_WIDTH}" height="${h}" rx="14" fill="#160f11" stroke="url(#cardBorder)" stroke-width="2" />
    <circle cx="60" cy="55" r="30" fill="#1f1418" stroke="#c9a24d" stroke-width="2" />
    <text x="60" y="63" text-anchor="middle" fill="#e6c878" font-size="24" font-weight="bold">${stage.level}</text>
    <text x="105" y="48" fill="#8a7a6a" font-size="13">位階 Lv.${stage.level}</text>
    <text x="105" y="72" fill="#f5ede0" font-size="22" font-weight="bold">${escapeXml(stage.title)}</text>

    <text x="40" y="${FIRST_LINE_Y - 25}" fill="#e6c878" font-size="15" font-weight="bold">${escapeXml(stage.doLabel)}</text>
    ${doLines}

    <text x="400" y="${FIRST_LINE_Y - 25}" fill="#7d2438" font-size="15" font-weight="bold">${escapeXml(stage.noteLabel)}</text>
    ${noteLines}
  </g>`;
}

function renderArrow(y) {
  return `<polygon points="400,${y} 388,${y - 22} 412,${y - 22}" fill="#c9a24d" />`;
}

let y = TOP_MARGIN;
const cardBlocks = [];
const arrowBlocks = [];
STAGES.forEach((stage, i) => {
  cardBlocks.push(renderCard(stage, y));
  const h = cardHeight(stage);
  y += h;
  if (i < STAGES.length - 1) {
    arrowBlocks.push(renderArrow(y + CARD_GAP - 8));
    y += CARD_GAP;
  }
});

const totalHeight = y + FOOTER_HEIGHT;
const lineX2 = TOP_MARGIN + 20;
const lineY2 = y + 30;

const svg = `<svg viewBox="0 0 ${CANVAS_WIDTH} ${totalHeight}" xmlns="http://www.w3.org/2000/svg" font-family="Georgia, 'Hiragino Mincho ProN', 'Yu Mincho', 'Noto Serif JP', serif">
  <defs>
    <linearGradient id="cardBorder" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0%" stop-color="#e6c878" stop-opacity="0.55" />
      <stop offset="100%" stop-color="#8a6f2f" stop-opacity="0.35" />
    </linearGradient>
  </defs>

  <rect width="${CANVAS_WIDTH}" height="${totalHeight}" fill="#0a0708" />

  <text x="400" y="52" text-anchor="middle" fill="#e6c878" font-size="28" letter-spacing="1">
    ${escapeXml(ROADMAP_TITLE)}
  </text>
  <text x="400" y="80" text-anchor="middle" fill="#8a7a6a" font-size="14" letter-spacing="2">
    ${escapeXml(ROADMAP_SUBTITLE)}
  </text>

  <line x1="400" y1="${lineX2}" x2="400" y2="${lineY2}" stroke="#8a6f2f" stroke-width="2" stroke-dasharray="2 6" opacity="0.5" />

  ${cardBlocks.join("\n")}
  ${arrowBlocks.join("\n  ")}

  <text x="400" y="${totalHeight - 35}" text-anchor="middle" fill="#8a7a6a" font-size="13">
    ${escapeXml(ROADMAP_FOOTER)}
  </text>
</svg>
`;

writeFileSync(OUT_PATH, svg);
console.log(`saved: ${OUT_PATH} (${CANVAS_WIDTH}x${totalHeight})`);
