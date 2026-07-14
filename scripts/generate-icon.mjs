// Gemini画像生成でアイコンPNGを作成するスクリプト
//
// 使い方:
//   node --env-file=.env scripts/generate-icon.mjs <key> [<key2> ...]   # 指定キーのみ生成
//   node --env-file=.env scripts/generate-icon.mjs --all                # 未生成の全キーを生成
//   node --env-file=.env scripts/generate-icon.mjs candle --force       # 既存でも強制再生成
//   node --env-file=.env scripts/generate-icon.mjs --debug candle       # 生レスポンスをJSON出力(課金なしの構造確認用ではない点に注意)
//
// 同じキーに対する重複生成を防ぐため、出力ファイルが既に存在する場合は --force なしではスキップする。
import { writeFileSync, existsSync, mkdirSync } from "fs";
import { join } from "path";
import sharp from "sharp";
import { GoogleGenAI } from "@google/genai";
import { ICONS, buildPrompt } from "./iconPrompts.mjs";

const OUT_DIR = "public/icons";
const MODEL_CANDIDATES = ["gemini-3.1-flash-image-preview", "gemini-3.1-flash-image"];

const args = process.argv.slice(2);
const force = args.includes("--force");
const debug = args.includes("--debug");
const all = args.includes("--all");
const keys = args.filter((a) => !a.startsWith("--"));

if (!process.env.GEMINI_API_KEY) {
  console.error("GEMINI_API_KEY が環境変数にありません。--env-file=.env を付けて実行してください。");
  process.exit(1);
}

const targetKeys = all ? Object.keys(ICONS) : keys;
if (targetKeys.length === 0) {
  console.error("生成対象のキーを指定するか --all を付けてください。利用可能キー:", Object.keys(ICONS).join(", "));
  process.exit(1);
}
for (const k of targetKeys) {
  if (!ICONS[k]) {
    console.error(`未知のキー: ${k}. 利用可能キー: ${Object.keys(ICONS).join(", ")}`);
    process.exit(1);
  }
}

mkdirSync(OUT_DIR, { recursive: true });

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

/** interaction レスポンスから base64画像データを取り出す(SDKバージョン差異に備えて複数の形を試す) */
function extractImageBase64(interaction) {
  if (interaction?.output_image?.data) return interaction.output_image.data;
  const fromOutputs = interaction?.outputs?.find((o) => o.type === "image")?.data;
  if (fromOutputs) return fromOutputs;
  const fromCandidates = interaction?.candidates?.[0]?.content?.parts?.find((p) => p.inlineData)?.inlineData?.data;
  if (fromCandidates) return fromCandidates;
  return null;
}

async function generateOne(key) {
  const outPath = join(OUT_DIR, `${key}.png`);
  if (existsSync(outPath) && !force) {
    console.log(`skip (既存): ${outPath}`);
    return;
  }

  const prompt = buildPrompt(key);
  let lastErr;
  for (const model of MODEL_CANDIDATES) {
    try {
      console.log(`generating "${key}" via ${model} ...`);
      const interaction = await ai.interactions.create({
        model,
        input: prompt,
        response_modalities: ["image"],
        response_format: { type: "image", aspect_ratio: "1:1" },
      });

      if (debug) {
        console.log(`--- raw response (${key}) ---`);
        console.log(JSON.stringify(interaction, null, 2).slice(0, 4000));
      }

      const base64 = extractImageBase64(interaction);
      if (!base64) {
        throw new Error("レスポンスから画像データを抽出できませんでした(--debug で構造を確認してください)");
      }

      const rawBuffer = Buffer.from(base64, "base64");

      // 黒背景(#000000近辺)を透過化する後処理
      const transparent = await makeTransparent(rawBuffer);
      writeFileSync(outPath, transparent);
      console.log(`saved: ${outPath}`);
      return;
    } catch (e) {
      lastErr = e;
      console.warn(`  model "${model}" 失敗: ${e.message}`);
    }
  }
  throw lastErr;
}

/** 黒に近いピクセルをアルファ透過にし、余白をトリムして正方形に整える */
async function makeTransparent(buffer) {
  const image = sharp(buffer).ensureAlpha();
  const { data, info } = await image.raw().toBuffer({ resolveWithObject: true });
  const { width, height, channels } = info;

  const THRESHOLD = 40; // 0-255。この値未満のRGBはほぼ黒とみなして透過にする
  for (let i = 0; i < data.length; i += channels) {
    const r = data[i];
    const g = data[i + 1];
    const b = data[i + 2];
    if (r < THRESHOLD && g < THRESHOLD && b < THRESHOLD) {
      data[i + 3] = 0;
    }
  }

  const keyed = sharp(data, { raw: { width, height, channels } }).png();

  // 透過部分をトリムして被写体にフィットさせ、全辺に固定割合の余白を足してから正方形に整える
  // (resize({fit:"contain"})はcontent自身の縦横比によって片方の辺の余白が0になりうるため使わない)
  const trimmedBuffer = await sharp(await keyed.toBuffer()).trim({ threshold: 10 }).toBuffer();
  const trimmedMeta = await sharp(trimmedBuffer).metadata();
  const pad = Math.round(Math.max(trimmedMeta.width, trimmedMeta.height) * 0.15);
  const paddedW = trimmedMeta.width + pad * 2;
  const paddedH = trimmedMeta.height + pad * 2;
  const side = Math.max(paddedW, paddedH);
  const extraW = side - paddedW;
  const extraH = side - paddedH;

  return sharp(trimmedBuffer)
    .extend({
      top: pad + Math.floor(extraH / 2),
      bottom: pad + Math.ceil(extraH / 2),
      left: pad + Math.floor(extraW / 2),
      right: pad + Math.ceil(extraW / 2),
      background: { r: 0, g: 0, b: 0, alpha: 0 },
    })
    .png()
    .toBuffer();
}

for (const key of targetKeys) {
  await generateOne(key);
}
