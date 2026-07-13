# クロエの表情画像の置き場所

このフォルダに以下の2ファイルを保存してください。

| ファイル名 | 内容 |
|---|---|
| `sheet.png` | 3表情が横に並んだ画像(左: 困り顔 / 中央: 通常 / 右: 怒り) |
| `happy.png` | 笑顔の1枚絵 |

保存したら、プロジェクトルートで次を実行:

```bash
node scripts/prepare-companion-images.mjs
```

`public/companion/` に `neutral.png` `happy.png` `angry.png` `troubled.png`(各512x512)が生成され、
クロエの返答の感情(《neutral》《happy》《angry》《troubled》タグ)に応じてアイコンが自動で切り替わるようになります。

画像が無い間は、絵文字アイコンで表示されます(エラーにはなりません)。
