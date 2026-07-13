// サイト全体の編集可能な文言・アイコンのデフォルト値とラベル定義
// クライアント/サーバー両方から使える純粋な定数(Prisma等のI/Oを一切importしないこと)

export const DEFAULT_SITE_TEXT: Record<string, string> = {
  "site.name": "リバーサル",
  "site.tagline": "AI副業で人生を反転させたいと誓う者たちが集う、秘密の仮面舞踏会",
  "landing.intro":
    "とある場所に佇む、古びた洋館。\nそこは、AI副業で人生を反転させたいと誓う者たちが、仮面をつけて集う秘密の夜会場——",
  "landing.cta": "招待状を受け取る",
  "companion.name": "クロエ",
  "companion.emoji": "🐦‍⬛",
  "home.emoji": "🕯️",
  "mission.board.title": "今宵の使命",
  "mission.board.icon": "🗝️",
  "skill.board.title": "技量",
  "skill.board.icon": "📜",
  "board.name": "談話室",
  "board.icon": "🗣️",
  "qna.board.title": "今宵の問い",
  "qna.icon": "❓",
  "streak.label": "本日の来館",
  "room.backLabel": "自室に戻る",
  "landing.hostMessageTitle": "主催者から一言",
  "landing.hostMessage":
    "AI副業という慣れない挑戦に踏み出したあなたを、心から歓迎します。焦らず、しかし着実に。この洋館が、その一歩を支える場所になれば幸いです。",
};

export const SITE_TEXT_LABELS: Record<string, string> = {
  "site.name": "サイト名",
  "site.tagline": "サイトの説明文(メタ情報)",
  "landing.intro": "ランディングページの紹介文",
  "landing.cta": "ランディングページのボタン文言",
  "companion.name": "AIコンパニオンの名前",
  "companion.emoji": "AIコンパニオンのアイコン(絵文字 または 画像URL・推奨: 正方形128px以上、表示は40px角)",
  "home.emoji": "ホーム画面タイトルのアイコン(絵文字 または 画像URL・推奨: 正方形128px以上、表示は24px角)",
  "mission.board.title": "ミッションボードの見出し",
  "mission.board.icon": "ミッションボードのアイコン(絵文字 または 画像URL)",
  "skill.board.title": "技量ボードの見出し",
  "skill.board.icon": "技量ボードのアイコン(絵文字 または 画像URL)",
  "board.name": "談話室(情報共有掲示板)の名前",
  "board.icon": "談話室のアイコン(絵文字 または 画像URL)",
  "qna.board.title": "一問一答の見出し",
  "qna.icon": "一問一答のアイコン(絵文字 または 画像URL)",
  "streak.label": "連続来館カードの見出し",
  "room.backLabel": "自室(ホーム画面)への戻りリンクの文言",
  "landing.hostMessageTitle": "ランディングページ「主催者から一言」の見出し",
  "landing.hostMessage": "ランディングページ「主催者から一言」の本文",
};

export const SITE_TEXT_KEYS = Object.keys(DEFAULT_SITE_TEXT);

// アイコン系の項目(値が画像URLにもなり得るもの)と、候補画像フォルダ(public/images/icons/<slot>/)の対応。
// 管理ページで候補サムネイルから選べるようにするための対応表
export const ICON_SLOTS: Record<string, string> = {
  "companion.emoji": "companion",
  "home.emoji": "home",
  "qna.icon": "qna",
  "board.icon": "board",
  "mission.board.icon": "mission",
  "skill.board.icon": "skill",
};
