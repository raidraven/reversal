# 🕯️ リバーサル

とある場所に佇む、古びた洋館。そこはAI副業で人生を反転させたいと誓う者たちが、仮面をつけて集う秘密の夜会場——というテーマの継続支援Webアプリです。ゲーム風の進捗可視化とAI執事「セバスチャン」で、毎日ログインしたくなる体験を提供します。

## 技術スタック

| 分類 | 技術 |
|---|---|
| フレームワーク | Next.js 14 (App Router) + TypeScript |
| スタイリング | Tailwind CSS(黒×アンティークゴールド×深紅の洋館テーマ) |
| DB | SQLite(開発)/ PostgreSQL(本番想定・Prisma ORM) |
| 認証 | NextAuth.js(Credentials Provider、JWT・30日) |
| AI | Claude API(claude-sonnet-4-6、ストリーミング対応) |
| チャート | recharts |

## セットアップ

```bash
# 1. 依存パッケージのインストール
npm install

# 2. 環境変数の設定
#    .env.example をコピーして .env を作成し、値を設定
#    - NEXTAUTH_SECRET: `openssl rand -base64 32` 等で生成
#    - ANTHROPIC_API_KEY: https://console.anthropic.com/ で取得
#      (未設定でもアプリは動作します。AIコンパニオンが固定メッセージになるだけ)
#    - ADMIN_EMAILS: 管理者ページ(/admin)を見られるメールアドレス(カンマ区切り)

# 3. DB作成 + デイリーミッションのシード投入
npx prisma db push
npx prisma db seed

# 4. 開発サーバー起動
npm run dev
```

http://localhost:3000 を開いてください。ランディングページから「招待状を受け取る」で新規登録できます。

## 主な機能

- **ランディングページ(`/`)** — 未ログイン時に表示。館のコンセプト紹介、新規登録・ログインへの導線、「主催者への要望」フォームを設置
- **ホーム画面** — 位階(レベル)・経験値バー・称号・連夜の参加(ストリーク)・技量レーダーチャート
- **今宵の使命(デイリーミッション)** — 下記7種のプールから、日付ごとに決定的に3件を抽選(全ユーザー共通・リロードしても変わらない)
  1. 投稿を1つする
  2. AIに相談する
  3. 作業を10分する
  4. 収益を出す
  5. 他のユーザーにいいねを送る
  6. 今日の反省を書く
  7. 記事を1つ書く
  完了でEXPと技量を獲得。レベルアップ(位階上昇)演出つき
- **入館ボーナス** — 1日1回目のログインでもEXPを獲得(現在 +15)。連続7日で限定称号フラグ、連続30日でプレミアム解放フラグ
- **AI執事「セバスチャン」** — 画面右下のチャットで相談可能。位階・連夜の参加・今宵の使命の達成状況・技量を踏まえた文脈のある応答(1日30メッセージまで)。入館時にはその日初回のみ挨拶を自動生成
- **一問一答** — ホーム画面・`/questions` に「今宵の問い」を表示。マイページの「質問する」から誰でも新しい問いを立てられ、最新の問いが常に表示される。回答は早い者勝ちでEXPが変動(1着+50 → 2着+35 → 3着+25 → 4着+15 → 5着以降+8)。回答には「いいね」を送信可能
- **マイページ(`/mypage`)** — 広間(ホーム)・質問に答える・質問する・(管理者のみ)館の主ページへの導線
- **主催者への要望** — ランディングページから匿名で送信可能。管理者(`ADMIN_EMAILS`に登録したメールでログインした来賓)は `/admin` で一覧閲覧可能
- **管理ページ(`/admin`)** — 館の主のみアクセス可能。以下を編集できる
  - サイト各所の文言・アイコン(サイト名、ランディングの紹介文・ボタン文言、AIコンパニオンの名前・アイコン、各ボード見出し)
  - 位階(称号)の追加・編集・削除(到達レベルと称号名)
  - 今宵の使命(デイリーミッション)の追加・編集・削除(ここに登録された項目からランダムに3件が選出される)

## プロジェクト構成

```
prisma/
  schema.prisma          # データモデル(User, Mission, Rank, SiteText, Question, Answer 等)
  seed.js                # デイリーミッション7種・位階7種の初期シード(既存行は上書きしない)
src/
  config/companion.ts    # AIコンパニオンの性格・モデル・レート制限(名前/アイコンは管理ページ側で上書き可)
  lib/
    auth.ts              # NextAuth設定 + 管理者自動昇格(ADMIN_EMAILS)
    game.ts              # EXP・レベル・ストリーク・ミッション完了・入館ボーナス
    dailyMissions.ts     # ミッションプールから日替わり3件を決定的に抽選
    companion.ts         # コンテキスト注入・挨拶生成・レート制限
    leveling.ts          # レベル・EXP計算
    rankTitle.ts          # 位階→称号の変換(クライアント/サーバー共通の純粋関数)
    ranks.ts              # 位階(称号)のDB取得(サーバー専用)
    siteText.ts / siteTextDefaults.ts  # 編集可能な文言・アイコンのDB取得とデフォルト値
    qna.ts                # 一問一答:質問作成・回答(速答XP計算)・いいね
    adminAuth.ts          # 管理API共通の権限チェック
    onboarding.ts         # 初期診断・仮面(アバター)定義
  app/
    page.tsx             # ランディングページ(未ログイン時のトップ)
    login/ signup/       # 認証画面(登録時に3問の初期診断+仮面選択)
    home/                # ホーム(ゲームUI+一問一答)
    mypage/              # マイページ(各機能への導線)
    questions/ questions/new/  # 一問一答の回答ページ・出題ページ
    admin/               # 管理者ページ(文言/位階/ミッション編集、要望閲覧)
    api/auth/            # NextAuth + 登録API
    api/missions/        # ミッション完了API
    api/companion/       # チャット(ストリーミング)+ 挨拶API
    api/host-requests/   # 主催者への要望 投稿API(公開)
    api/questions/ api/answers/  # 一問一答API(質問作成・回答・いいね)
    api/site-texts/      # 文言・アイコンの取得API(公開)
    api/admin/           # 管理API(文言/位階/ミッションのCRUD、要admin権限)
  components/            # UIコンポーネント
  middleware.ts           # 認証保護(/home, /admin, /mypage, /questions 等)。/admin は isAdmin 必須
```

## 本番デプロイ(Railway想定)

1. `prisma/schema.prisma` の `provider` を `postgresql` に変更
2. 環境変数 `DATABASE_URL`(PostgreSQL)、`NEXTAUTH_SECRET`、`NEXTAUTH_URL`(本番URL)、`ANTHROPIC_API_KEY`、`ADMIN_EMAILS` を設定
3. ビルドコマンド: `npx prisma db push && npx prisma db seed && npm run build`

## 開発メモ

- 日付処理はすべて日本時間(JST)基準(`src/lib/date.ts`)
- ストリーク・入館ボーナスはホーム画面表示時に日次で更新(JWTで長期ログイン中でも反映)
- デイリーミッションの抽選は日付文字列をシードにした決定的シャッフルのため、同じ日なら誰がリロードしても同じ3件になる(`src/lib/dailyMissions.ts`)
- ミッション完了APIは「今日選出された3件」以外のIDを拒否する(過去の固定IDを使った不正な完了リクエスト対策)
- 一問一答は「最新の質問1件」だけが常に表示される(履歴の閲覧には未対応)。新しい問いを立てると、それが即座に表示中の問いに切り替わる
- 位階・文言はDBに実データとして保存される(`prisma/seed.js` で初期投入)。管理ページでの編集は再シード(`npx prisma db seed`)で消えない
- **注意**: `npm run dev` の実行中に `npm run build` を実行しないこと(`.next` を共有しているため開発サーバーが壊れます)
