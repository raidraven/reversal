"use client";

// 忍者AdMax(審査不要のクリック報酬型広告)。
// document.writeでその場に描画するタグのため、Reactが管理するDOMに直接置くと
// (documentへの書き込みでReactの想定と実際のDOMがズレて)removeChildエラーで
// アプリが落ちる不具合が起きた。iframeでページ本体のDOMから完全に隔離して解決する。

// サイトのテーマ背景色(layout.tsxのviewport themeColorと合わせる)。
// 広告が未配信で空のときでも、白い帯として浮かないようにするため
const THEME_BG = "#0a0708";

function AdIframe({ src, height, title }: { src: string; height: number; title: string }) {
  const html = `<!doctype html><html><body style="margin:0;overflow:hidden;background:${THEME_BG}"><script src="${src}"></script></body></html>`;
  return (
    <iframe
      srcDoc={html}
      title={title}
      scrolling="no"
      style={{ display: "block", width: "100%", height, border: 0, backgroundColor: THEME_BG }}
    />
  );
}

/** SP(スマートフォン)向け広告枠(320x50)。lg以上の画面幅では非表示 */
export function AdMaxSP() {
  return (
    <div className="lg:hidden">
      <AdIframe src="https://adm.shinobi.jp/s/b102242bdd4fef113ee2abaf990d3e0a" height={50} title="広告(SP)" />
    </div>
  );
}

/** PC向け広告枠。lg未満の画面幅では非表示 */
export function AdMaxPC() {
  return (
    <div className="hidden lg:block">
      <AdIframe src="https://adm.shinobi.jp/s/98e52a4639da26d7c6ff258e1a6fd63f" height={250} title="広告(PC)" />
    </div>
  );
}
