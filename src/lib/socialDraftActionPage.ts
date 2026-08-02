/** メールのワンクリックリンクを踏んだ後に表示する、簡易な結果ページ(HTML文字列)を組み立てる */
export function renderActionResultPage(input: { ok: boolean; message: string }): string {
  const accent = input.ok ? "#c9a24d" : "#7d2438";
  return `<!doctype html>
<html lang="ja">
<head>
<meta charset="utf-8" />
<meta name="viewport" content="width=device-width, initial-scale=1" />
<title>REVERSAL</title>
<style>
  body { margin: 0; min-height: 100vh; display: flex; align-items: center; justify-content: center;
    background: #0a0708; color: #f5f0e8; font-family: system-ui, -apple-system, sans-serif; }
  .card { max-width: 420px; margin: 24px; padding: 32px; border: 1px solid ${accent}66;
    border-radius: 16px; background: #160f11; text-align: center; }
  .brand { font-size: 13px; letter-spacing: 4px; color: #c9a24d; text-transform: uppercase; margin-bottom: 16px; }
  .message { font-size: 16px; line-height: 1.7; white-space: pre-wrap; }
</style>
</head>
<body>
  <div class="card">
    <div class="brand">REVERSAL</div>
    <div class="message">${escapeHtml(input.message)}</div>
  </div>
</body>
</html>`;
}

function escapeHtml(s: string): string {
  return s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}
