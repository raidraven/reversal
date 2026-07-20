import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import Link from "next/link";
import { authOptions } from "@/lib/auth";
import { QnaBoard } from "@/components/qna/QnaBoard";
import { Icon } from "@/components/Icon";

export const dynamic = "force-dynamic";

export default async function QuestionsPage() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) redirect("/login");

  return (
    <main className="mx-auto max-w-md px-4 py-8">
      <header className="mb-4">
        <h1 className="mansion-title flex items-center gap-1.5 text-xl">
          <Icon name="question" size={22} /> 今宵の問い
        </h1>
      </header>

      <QnaBoard isLoggedIn />

      <p className="mt-4 text-center text-sm">
        <Link href="/questions/new" className="text-gold-light hover:underline">
          新しい問いを立てる
        </Link>
      </p>
    </main>
  );
}
