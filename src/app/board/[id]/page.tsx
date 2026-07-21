import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { readAnonId } from "@/lib/anonId";
import { getPost, getPostComments } from "@/lib/board";
import { ThreadDetail } from "@/components/board/ThreadDetail";

export const dynamic = "force-dynamic";

type Props = { params: { id: string } };

function excerpt(text: string, maxLen = 100): string {
  return text.length > maxLen ? `${text.slice(0, maxLen)}…` : text;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const post = await getPost({}, params.id);
  if (!post) return { title: "スレッドが見つかりません | リバーサル" };

  return {
    title: `${post.title} | リバーサル 掲示板`,
    description: excerpt(post.content),
    openGraph: {
      title: post.title,
      description: excerpt(post.content),
      type: "article",
    },
  };
}

export default async function ThreadPage({ params }: Props) {
  const session = await getServerSession(authOptions);
  const isLoggedIn = !!session?.user?.id;
  const anonId = readAnonId();
  const viewer = session?.user?.id ? { userId: session.user.id } : anonId ? { anonId } : {};

  const post = await getPost(viewer, params.id);
  if (!post) notFound();

  const comments = await getPostComments(post.id);

  return (
    <main className="mx-auto max-w-md px-4 py-8 lg:max-w-2xl">
      <p className="mb-4 text-xs">
        <Link href="/board" className="text-stone-400 hover:text-gold-light hover:underline">
          掲示板へ戻る
        </Link>
      </p>

      <ThreadDetail
        post={{ ...post, createdAt: post.createdAt.toISOString() }}
        comments={comments.map((c) => ({ ...c, createdAt: c.createdAt.toISOString() }))}
        isLoggedIn={isLoggedIn}
      />
    </main>
  );
}
