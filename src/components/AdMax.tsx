// 忍者AdMax(審査不要のクリック報酬型広告)。
// document.writeでその場に描画するタグのため、next/script(非同期読み込み)は使わず
// 通常の<script>としてサーバーレンダリングする(非同期挿入だとdocument.writeがブラウザにブロックされるため)

/** SP(スマートフォン)向け広告枠。lg以上の画面幅では非表示 */
export function AdMaxSP() {
  return (
    <div className="lg:hidden">
      {/* eslint-disable-next-line @next/next/no-sync-scripts */}
      <script src="https://adm.shinobi.jp/s/b102242bdd4fef113ee2abaf990d3e0a" />
    </div>
  );
}

/** PC向け広告枠。lg未満の画面幅では非表示 */
export function AdMaxPC() {
  return (
    <div className="hidden lg:block">
      {/* eslint-disable-next-line @next/next/no-sync-scripts */}
      <script src="https://adm.shinobi.jp/s/98e52a4639da26d7c6ff258e1a6fd63f" />
    </div>
  );
}
