import Script from "next/script";

// 忍者AdMax(審査不要のクリック報酬型広告)。掲載したいページにだけ個別に埋め込む
export function AdMax() {
  return <Script src="https://adm.shinobi.jp/s/b102242bdd4fef113ee2abaf990d3e0a" strategy="afterInteractive" />;
}
