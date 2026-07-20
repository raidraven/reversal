// サイト全体の編集可能な文言・アイコンのデフォルト値とラベル定義
// クライアント/サーバー両方から使える純粋な定数(Prisma等のI/Oを一切importしないこと)

export const DEFAULT_SITE_TEXT: Record<string, string> = {
  "site.name": "リバーサル",
  "site.tagline": "AI副業で人生を反転させたいと誓う者たちが集う、秘密の仮面舞踏会",
  "landing.intro":
    "とある場所に佇む、古びた洋館。\nそこは、AI副業で人生を反転させたいと誓う者たちが、仮面をつけて集う秘密の夜会場——",
  "landing.loggedInMessage": "ログイン中でございます",
  "landing.hostRequestTitle": "主催者への要望",
  "landing.hostRequestDescription": "館の運営についてのご意見・ご要望はこちらから。匿名でも構いません。",
  "landing.latestArticleTitle": "最新の記事",
  "landing.latestPostTitle": "最新の談話室投稿",
  "login.title": "扉の前で",
  "login.subtitle": "すでに招待状をお持ちの方はこちらから",
  "board.description": "副業初心者の来賓たちが、実績・学び・ツール活用のコツを持ち寄る場所です。",
  "board.emptyMessage": "まだ投稿がありません。最初の一件を届けてみましょう。",
  "board.postNote": "どなたでも(未登録でも)投稿・コメントできます。",
  "board.guidelines":
    "・誇張や虚偽の収益報告はご遠慮ください\n・他の来賓への誹謗中傷はご遠慮ください\n・宣伝・勧誘目的の投稿はご遠慮ください",
  "articles.title": "書庫",
  "articles.description": "AI副業の始め方・続け方の攻略記事。運営者自身の実践記録とともに",
  "articles.guideSectionTitle": "攻略記事",
  "articles.novelSectionTitle": "小説",
  "articles.novelDescription": "この館の世界観を題材にした読み物です。",
  "articles.emptyMessage": "書物はまだ棚に並んでいません。近日、最初の一冊が収められます。",
  "article.ctaText": "この館では、AI副業の継続をゲーム感覚で支援しています。",
  "article.ctaButton": "招待状を受け取る(無料)",
  "admin.subtitle": "館の主 専用",
  "admin.title": "管理ページ",
  "admin.section.articles": "書庫(攻略記事)の管理",
  "admin.section.siteTexts": "文言・アイコンの編集",
  "admin.section.ranks": "位階(称号)の設定",
  "admin.section.ranksDescription": "レベルごとの称号を編集・追加・削除できます",
  "admin.section.missions": "今宵の使命(デイリーミッション)の設定",
  "admin.section.posts": "談話室の投稿管理",
  "admin.section.incidentDays": "障害日(ストリーク救済)の登録",
  "admin.section.incidentDaysDescription": "サイト障害等で欠席扱いにしたくない日を登録します",
  "admin.section.hostRequests": "主催者への要望",
  "admin.section.hostRequestsDescription": "来賓たちから届いた要望・感想",
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
  "about.content": `運営者: reven(ハンドルネーム)

このサイト「リバーサル」は、reven個人が一人で開発・運営しています。エンジニアではありますが、副業としてのAI活用は本サイトの運営を含めて実践中の身であり、専門家として収益を保証する立場ではありません。

■ このサイトについて
「AI副業で成功しました」という話ではなく、「AI副業で人生を反転させたいと挑戦している、その過程」を、収益0円の状態から包み隠さず記録・公開していくサイトです。談話室の実績報告は、運営者自身の記録も含め、誇張のない実数で行っています。

■ お問い合わせ
X(旧Twitter): @loner0351
または、トップページ下部の「主催者への要望」フォームから(匿名可)

■ 運営開始
2026年7月`,
  "terms.content": `本規約は、「リバーサル」(以下「本サイト」)の利用条件を定めるものです。本サイトをご利用いただいた時点で、本規約に同意したものとみなします。

1. サービス内容
本サイトは、AI副業に取り組む利用者(来賓)向けに、ミッション・技量・位階などのゲーム的な仕組み、AIコンパニオン「クロエ」との対話、談話室・一問一答などのコミュニティ機能、攻略記事(書庫)を提供します。

2. 収益に関する免責
本サイトは、いかなる収益・成果も保証するものではありません。談話室の実績報告や書庫の記事は、投稿者個人の実践記録・体験であり、同じ結果を得られることを約束するものではありません。AIコンパニオン「クロエ」の発言も、断定的な収益保証や誇張表現を行わない方針で運用していますが、参考情報の一つとしてご利用ください。

3. 禁止事項
利用者は、以下の行為を行ってはなりません。
- 虚偽・誇張を含む収益報告、詐欺的な勧誘・情報商材等の宣伝
- 他の利用者への誹謗中傷、迷惑行為、なりすまし
- 本サイトの運営を妨げる行為(不正アクセス、過度な自動アクセス等)
- 法令、公序良俗に反する行為
- 個人を特定できる他者の情報を無断で公開する行為

4. 投稿内容の取り扱い
利用者が投稿した内容(談話室・一問一答等)は、本サイト上での表示・掲載のために運営者が利用できるものとします。投稿の著作権は投稿者に帰属しますが、利用規約・サイトポリシーに反すると判断した投稿は、予告なく削除する場合があります。

5. アカウントの停止・削除
禁止事項に該当する行為があった場合、事前の通知なくアカウントの利用を制限・停止することがあります。利用者はログイン後、サイドメニューの「退会する」からいつでも自らアカウントを削除できます。

6. 免責事項
本サイトの利用により生じた損害について、運営者は故意または重大な過失がある場合を除き、責任を負わないものとします。AIコンパニオンとの対話内容は生成AIによるものであり、内容の正確性を完全に保証するものではありません。

7. 規約の変更
本規約の内容は、必要に応じて予告なく変更する場合があります。変更後の内容は本ページに掲載した時点で効力を生じるものとします。

8. 準拠法
本規約は日本法に準拠します。`,
};

export const SITE_TEXT_LABELS: Record<string, string> = {
  "site.name": "サイト名",
  "site.tagline": "サイトの説明文(メタ情報)",
  "landing.intro": "ランディングページの紹介文",
  "landing.loggedInMessage": "ランディングページ「ログイン中」表示の文言",
  "landing.hostRequestTitle": "ランディングページ「主催者への要望」の見出し",
  "landing.hostRequestDescription": "ランディングページ「主催者への要望」の説明文",
  "landing.latestArticleTitle": "ランディングページ「最新の記事」の見出し",
  "landing.latestPostTitle": "ランディングページ「最新の談話室投稿」の見出し",
  "login.title": "ログインパネルの見出し",
  "login.subtitle": "ログインパネルの副題",
  "board.description": "談話室ページの説明文",
  "board.emptyMessage": "談話室に投稿が無い時のメッセージ",
  "board.postNote": "談話室見出し下の「誰でも投稿できます」注記",
  "board.guidelines": "談話室のガイドライン(投稿ルール)",
  "articles.title": "書庫ページの見出し",
  "articles.description": "書庫ページの説明文",
  "articles.guideSectionTitle": "書庫「攻略記事」セクションの見出し",
  "articles.novelSectionTitle": "書庫「小説」セクションの見出し",
  "articles.novelDescription": "書庫「小説」セクションの説明文",
  "articles.emptyMessage": "書庫に記事が無い時のメッセージ",
  "article.ctaText": "記事末尾の登録案内テキスト",
  "article.ctaButton": "記事末尾の登録ボタン文言",
  "admin.subtitle": "管理ページの上部小見出し",
  "admin.title": "管理ページの見出し",
  "admin.section.articles": "管理ページ「書庫」セクションの見出し",
  "admin.section.siteTexts": "管理ページ「文言・アイコンの編集」セクションの見出し",
  "admin.section.ranks": "管理ページ「位階」セクションの見出し",
  "admin.section.ranksDescription": "管理ページ「位階」セクションの説明文",
  "admin.section.missions": "管理ページ「今宵の使命」セクションの見出し",
  "admin.section.posts": "管理ページ「談話室の投稿管理」セクションの見出し",
  "admin.section.incidentDays": "管理ページ「障害日」セクションの見出し",
  "admin.section.incidentDaysDescription": "管理ページ「障害日」セクションの説明文",
  "admin.section.hostRequests": "管理ページ「主催者への要望」セクションの見出し",
  "admin.section.hostRequestsDescription": "管理ページ「主催者への要望」セクションの説明文(件数の前に付く部分)",
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
  "privacy.content": "プライバシーポリシーの本文全体",
  "about.content": "運営者情報ページの本文全体",
  "terms.content": "利用規約ページの本文全体",
};

export const SITE_TEXT_KEYS = Object.keys(DEFAULT_SITE_TEXT);

// アイコン系の項目(値が画像URLにもなり得るもの)と、候補画像フォルダ(public/images/icons/<slot>/)の対応。
// 管理ページで候補サムネイルから選べるようにするための対応表
// (絵文字→生成画像への置き換えに伴い、旧アイコン系キーは静的なIconコンポーネントに移行済み)
export const ICON_SLOTS: Record<string, string> = {};
