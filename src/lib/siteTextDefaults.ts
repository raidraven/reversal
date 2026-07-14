// サイト全体の編集可能な文言・アイコンのデフォルト値とラベル定義
// クライアント/サーバー両方から使える純粋な定数(Prisma等のI/Oを一切importしないこと)

export const DEFAULT_SITE_TEXT: Record<string, string> = {
  "site.name": "リバーサル",
  "site.tagline": "AI副業で人生を反転させたいと誓う者たちが集う、秘密の仮面舞踏会",
  "landing.intro":
    "とある場所に佇む、古びた洋館。\nそこは、AI副業で人生を反転させたいと誓う者たちが、仮面をつけて集う秘密の夜会場——",
  "landing.cta": "招待状を受け取る",
  "companion.name": "クロエ",
  "mission.board.title": "今宵の使命",
  "skill.board.title": "技量",
  "board.name": "談話室",
  "qna.board.title": "今宵の問い",
  "streak.label": "本日の来館",
  "room.backLabel": "自室に戻る",
  "landing.hostMessageTitle": "主催者から一言",
  "landing.hostMessage":
    "AI副業という慣れない挑戦に踏み出したあなたを、心から歓迎します。焦らず、しかし着実に。この洋館が、その一歩を支える場所になれば幸いです。",
  "hostRequest.placeholder": "主催者へお伝えしたいことをお書きください",
  "hostRequest.completedMessage": "要望をお預かりいたしました。主催者に必ずお届けいたします。",
  "landing.stats.guestLabel": "名の来賓",
  "landing.stats.registeredLabel": "名の登録者",
  "landing.stats.missionLabel": "達成された使命",
  "landing.stats.answerLabel": "問いへの回答",
};

export const SITE_TEXT_LABELS: Record<string, string> = {
  "site.name": "サイト名",
  "site.tagline": "サイトの説明文(メタ情報)",
  "landing.intro": "ランディングページの紹介文",
  "landing.cta": "ランディングページのボタン文言",
  "companion.name": "AIコンパニオンの名前",
  "mission.board.title": "ミッションボードの見出し",
  "skill.board.title": "技量ボードの見出し",
  "board.name": "談話室(情報共有掲示板)の名前",
  "qna.board.title": "一問一答の見出し",
  "streak.label": "連続来館カードの見出し",
  "room.backLabel": "自室(ホーム画面)への戻りリンクの文言",
  "landing.hostMessageTitle": "ランディングページ「主催者から一言」の見出し",
  "landing.hostMessage": "ランディングページ「主催者から一言」の本文",
  "hostRequest.placeholder": "主催者への要望フォームの入力欄プレースホルダー",
  "hostRequest.completedMessage": "主催者への要望フォームの送信完了メッセージ",
  "landing.stats.guestLabel": "ランディングページの統計「来賓数」のラベル",
  "landing.stats.registeredLabel": "ランディングページの統計「登録者数」のラベル",
  "landing.stats.missionLabel": "ランディングページの統計「達成された使命」のラベル",
  "landing.stats.answerLabel": "ランディングページの統計「問いへの回答」のラベル",
};

export const SITE_TEXT_KEYS = Object.keys(DEFAULT_SITE_TEXT);

// アイコン系の項目(値が画像URLにもなり得るもの)と、候補画像フォルダ(public/images/icons/<slot>/)の対応。
// 管理ページで候補サムネイルから選べるようにするための対応表
// (絵文字→生成画像への置き換えに伴い、旧アイコン系キーは静的なIconコンポーネントに移行済み)
export const ICON_SLOTS: Record<string, string> = {};
