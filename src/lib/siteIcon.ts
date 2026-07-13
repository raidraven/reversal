// サイト文言の「アイコン」欄は絵文字テキストのほか、画像URLも入力できる
// (絶対URL・data URIに加えて、public/配下を指す "/images/..." のようなルート相対パスも対象)
export function isImageIconValue(value: string): boolean {
  const v = value.trim();
  return (
    v.startsWith("http://") ||
    v.startsWith("https://") ||
    v.startsWith("data:image/") ||
    v.startsWith("/")
  );
}
