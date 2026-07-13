// クロエの表情画像を public/companion/ に整形出力するスクリプト
//
// 使い方:
//   1. public/companion/raw/sheet.png … 3表情(左:困り顔 / 中:通常 / 右:怒り)が横に並んだ画像
//   2. public/companion/raw/happy.png … 笑顔の1枚絵
//   を置いてから `node scripts/prepare-companion-images.mjs` を実行する
//
// 出力: public/companion/{troubled,neutral,angry,happy}.png (512x512)
import sharp from "sharp";
import { existsSync } from "node:fs";
import { mkdir } from "node:fs/promises";
import path from "node:path";

const RAW_DIR = path.join(process.cwd(), "public", "companion", "raw");
const OUT_DIR = path.join(process.cwd(), "public", "companion");
const OUT_SIZE = 512;

/** 中央の正方形を切り出して指定サイズに整える */
async function centerSquare(input, region, outFile) {
  await sharp(input)
    .extract(region)
    .resize(OUT_SIZE, OUT_SIZE, { fit: "cover" })
    .png()
    .toFile(path.join(OUT_DIR, outFile));
  console.log(`✔ ${outFile}`);
}

async function main() {
  await mkdir(OUT_DIR, { recursive: true });

  const sheetPath = path.join(RAW_DIR, "sheet.png");
  const happyPath = path.join(RAW_DIR, "happy.png");

  let processed = 0;

  if (existsSync(sheetPath)) {
    const meta = await sharp(sheetPath).metadata();
    const { width, height } = meta;
    const third = Math.floor(width / 3);
    const side = Math.min(third, height);
    const top = Math.floor((height - side) / 2);

    // シートの並び: 左=困り顔(troubled) / 中央=通常(neutral) / 右=怒り(angry)
    const names = ["troubled", "neutral", "angry"];
    for (let i = 0; i < 3; i++) {
      const centerX = Math.floor(third * i + third / 2);
      const left = Math.max(0, Math.min(centerX - Math.floor(side / 2), width - side));
      await centerSquare(sheetPath, { left, top, width: side, height: side }, `${names[i]}.png`);
      processed++;
    }
  } else {
    console.log(`(skip) ${sheetPath} が見つかりません`);
  }

  if (existsSync(happyPath)) {
    const meta = await sharp(happyPath).metadata();
    const { width, height } = meta;
    const side = Math.min(width, height);
    const left = Math.floor((width - side) / 2);
    const top = Math.floor((height - side) / 2);
    await centerSquare(happyPath, { left, top, width: side, height: side }, "happy.png");
    processed++;
  } else {
    console.log(`(skip) ${happyPath} が見つかりません`);
  }

  if (processed === 0) {
    console.log("\n画像が見つかりませんでした。public/companion/raw/ に sheet.png と happy.png を置いてから再実行してください。");
    process.exitCode = 1;
  } else {
    console.log(`\n完了: ${processed} 枚を public/companion/ に出力しました。`);
  }
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
