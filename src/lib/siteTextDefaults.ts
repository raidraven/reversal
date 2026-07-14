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
  "privacy.content": `「リバーサル」(以下「本サイト」)は、来賓の皆様に安心してご利用いただくため、取得する情報の範囲と利用目的を以下の通り定めます。

1. 取得する情報
- 会員登録時: メールアドレス、パスワード(暗号化して保存し、平文では保管しません)、お名前(表示名)、選択された仮面(アバター)
- 利用状況: 位階(レベル)・経験値・技量スコア・ミッション達成状況・ログイン日時(連夜の参加の記録のため)
- 投稿内容: 談話室への投稿、一問一答の質問・回答、任意で入力された報告収益額
- AIコンパニオン「クロエ」とのチャット履歴
- 未登録の状態でいいねを行った場合、個人を特定しない匿名ID(Cookie)

2. 利用目的
- ミッション・位階・技量など、本サイトのゲーム的な仕組みを提供するため
- クロエによる声かけ・相談対応など、AIコンパニオン機能を提供するため
- 投稿・質問・回答の内容が利用規約に反していないかを自動判定するため
- パスワード再設定など、アカウントに関するご連絡をするため
- 通報が繰り返された利用者への対応など、コミュニティの安全確保のため

3. 外部サービスへの情報提供
本サイトは、以下の外部サービスを利用しています。
- Anthropic社(Claude API): クロエとの会話内容、投稿・質問・回答のモデレーション判定のため、該当するテキストを送信します。
- Resend社: パスワード再設定メールの送信のため、メールアドレスを送信します。
上記以外の目的で、取得した情報を第三者に販売・提供することはありません。

4. 保管期間・削除について
取得した情報は、アカウントが存在する間保管します。アカウントの削除は、ログイン後にサイドメニューから移動できる「退会する」ページよりご自身で行えます。データの開示・訂正等をご希望の場合は、トップページの「主催者への要望」フォーム、または個別にご連絡ください。

5. Cookieについて
ログイン状態の維持のほか、未登録の方が「いいね」を行った際に、個人を特定しない匿名IDをCookieとして保存します。ブラウザの設定でCookieを無効化することも可能ですが、その場合一部機能がご利用いただけません。

6. 本ポリシーの変更
本ポリシーの内容は、必要に応じて予告なく変更する場合があります。変更後の内容は本ページに掲載した時点で効力を生じるものとします。`,
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
  "privacy.content": "プライバシーポリシーの本文全体",
};

export const SITE_TEXT_KEYS = Object.keys(DEFAULT_SITE_TEXT);

// アイコン系の項目(値が画像URLにもなり得るもの)と、候補画像フォルダ(public/images/icons/<slot>/)の対応。
// 管理ページで候補サムネイルから選べるようにするための対応表
// (絵文字→生成画像への置き換えに伴い、旧アイコン系キーは静的なIconコンポーネントに移行済み)
export const ICON_SLOTS: Record<string, string> = {};
