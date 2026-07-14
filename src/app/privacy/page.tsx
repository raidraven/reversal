import Link from "next/link";
import { Icon } from "@/components/Icon";

export const metadata = {
  title: "プライバシーポリシー | リバーサル",
};

export default function PrivacyPolicyPage() {
  return (
    <main className="mx-auto max-w-2xl px-4 py-12">
      <div className="game-card space-y-6 text-sm leading-relaxed text-stone-300">
        <div className="text-center">
          <p className="flex justify-center">
            <Icon name="scroll" size={32} />
          </p>
          <h1 className="mansion-title mt-2 text-2xl">プライバシーポリシー</h1>
          <p className="mt-1 text-xs text-stone-500">最終改定日: 2026年7月14日</p>
        </div>

        <p>
          「リバーサル」(以下「本サイト」)は、来賓の皆様に安心してご利用いただくため、取得する情報の範囲と利用目的を以下の通り定めます。
        </p>

        <section className="space-y-2">
          <h2 className="mansion-title text-base text-gold-light">1. 取得する情報</h2>
          <ul className="list-disc space-y-1 pl-5">
            <li>会員登録時: メールアドレス、パスワード(暗号化して保存し、平文では保管しません)、お名前(表示名)、選択された仮面(アバター)</li>
            <li>利用状況: 位階(レベル)・経験値・技量スコア・ミッション達成状況・ログイン日時(連夜の参加の記録のため)</li>
            <li>投稿内容: 談話室への投稿、一問一答の質問・回答、任意で入力された報告収益額</li>
            <li>AIコンパニオン「クロエ」とのチャット履歴</li>
            <li>未登録の状態でいいねを行った場合、個人を特定しない匿名ID(Cookie)</li>
          </ul>
        </section>

        <section className="space-y-2">
          <h2 className="mansion-title text-base text-gold-light">2. 利用目的</h2>
          <ul className="list-disc space-y-1 pl-5">
            <li>ミッション・位階・技量など、本サイトのゲーム的な仕組みを提供するため</li>
            <li>クロエによる声かけ・相談対応など、AIコンパニオン機能を提供するため</li>
            <li>投稿・質問・回答の内容が利用規約に反していないかを自動判定するため</li>
            <li>パスワード再設定など、アカウントに関するご連絡をするため</li>
            <li>通報が繰り返された利用者への対応など、コミュニティの安全確保のため</li>
          </ul>
        </section>

        <section className="space-y-2">
          <h2 className="mansion-title text-base text-gold-light">3. 外部サービスへの情報提供</h2>
          <p>本サイトは、以下の外部サービスを利用しています。</p>
          <ul className="list-disc space-y-1 pl-5">
            <li>
              <strong className="text-stone-100">Anthropic社(Claude API)</strong>
              ——クロエとの会話内容、投稿・質問・回答のモデレーション判定のため、該当するテキストを送信します。
            </li>
            <li>
              <strong className="text-stone-100">Resend社</strong>
              ——パスワード再設定メールの送信のため、メールアドレスを送信します。
            </li>
          </ul>
          <p className="text-xs text-stone-500">
            上記以外の目的で、取得した情報を第三者に販売・提供することはありません。
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="mansion-title text-base text-gold-light">4. 保管期間・削除について</h2>
          <p>
            取得した情報は、アカウントが存在する間保管します。アカウントの削除やデータの開示・訂正・削除をご希望の場合は、トップページの「主催者への要望」フォーム、または個別にご連絡いただければ対応いたします(現時点では退会機能をご自身で操作いただく画面はご用意できていないため、手動での対応となります)。
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="mansion-title text-base text-gold-light">5. Cookieについて</h2>
          <p>
            ログイン状態の維持のほか、未登録の方が「いいね」を行った際に、個人を特定しない匿名IDをCookieとして保存します。ブラウザの設定でCookieを無効化することも可能ですが、その場合一部機能がご利用いただけません。
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="mansion-title text-base text-gold-light">6. 本ポリシーの変更</h2>
          <p>
            本ポリシーの内容は、必要に応じて予告なく変更する場合があります。変更後の内容は本ページに掲載した時点で効力を生じるものとします。
          </p>
        </section>

        <div className="border-t border-surface-border pt-4 text-center text-xs text-stone-500">
          <Link href="/" className="text-gold-light hover:underline">
            館の入口へ戻る
          </Link>
        </div>
      </div>
    </main>
  );
}
