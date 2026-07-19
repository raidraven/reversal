// 忍者AdMax(審査不要のクリック報酬型広告)。
// document.writeでその場に描画するタグのため、next/script(非同期読み込み)は使わず
// 通常の<script>としてサーバーレンダリングする(非同期挿入だとdocument.writeがブラウザにブロックされるため)
export function AdMax() {
  // eslint-disable-next-line @next/next/no-sync-scripts
  return <script src="https://adm.shinobi.jp/s/b102242bdd4fef113ee2abaf990d3e0a" />;
}
