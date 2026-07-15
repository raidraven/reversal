"use client";

import { useEffect, useState } from "react";

type Category = "guide" | "novel";

type Article = {
  id: string;
  slug: string;
  title: string;
  description: string;
  content: string;
  category: Category;
  published: boolean;
  publishedAt: string | null;
};

const EMPTY_FORM = { slug: "", title: "", description: "", content: "", category: "guide" as Category };

const CATEGORY_LABELS: Record<Category, string> = { guide: "攻略記事", novel: "小説" };

export function ArticlesManager() {
  const [articles, setArticles] = useState<Article[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [busyId, setBusyId] = useState<string | null>(null);
  const [openId, setOpenId] = useState<string | null>(null);
  const [newForm, setNewForm] = useState(EMPTY_FORM);

  async function load() {
    setLoading(true);
    const res = await fetch("/api/admin/articles");
    if (res.ok) {
      const data = await res.json();
      setArticles(data.articles);
    }
    setLoading(false);
  }

  useEffect(() => {
    load();
  }, []);

  function updateLocal(id: string, patch: Partial<Article>) {
    setArticles((prev) => prev.map((a) => (a.id === id ? { ...a, ...patch } : a)));
  }

  async function saveArticle(article: Article, publishedOverride?: boolean) {
    setBusyId(article.id);
    setError(null);
    try {
      const res = await fetch(`/api/admin/articles/${article.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          slug: article.slug,
          title: article.title,
          description: article.description,
          content: article.content,
          category: article.category,
          published: publishedOverride ?? article.published,
        }),
      });
      const data = await res.json().catch(() => null);
      if (!res.ok) {
        setError(data?.error ?? "保存に失敗しました");
        return;
      }
      updateLocal(article.id, data.article);
    } catch {
      setError("通信エラーが発生しました");
    } finally {
      setBusyId(null);
    }
  }

  async function deleteArticle(id: string) {
    if (!confirm("この記事を削除しますか?この操作は取り消せません。")) return;
    setBusyId(id);
    setError(null);
    try {
      const res = await fetch(`/api/admin/articles/${id}`, { method: "DELETE" });
      if (!res.ok) {
        const data = await res.json().catch(() => null);
        setError(data?.error ?? "削除に失敗しました");
        return;
      }
      setArticles((prev) => prev.filter((a) => a.id !== id));
    } catch {
      setError("通信エラーが発生しました");
    } finally {
      setBusyId(null);
    }
  }

  async function addArticle(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    try {
      const res = await fetch("/api/admin/articles", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newForm),
      });
      const data = await res.json().catch(() => null);
      if (!res.ok) {
        setError(data?.error ?? "作成に失敗しました");
        return;
      }
      setNewForm(EMPTY_FORM);
      await load();
    } catch {
      setError("通信エラーが発生しました");
    }
  }

  if (loading) return <div className="h-40 animate-pulse rounded-md bg-surface-raised" />;

  return (
    <>
      <p className="text-xs text-stone-500">
        書庫(/articles)に載せる攻略記事を作成・編集できます。本文はMarkdown(見出しは ##
        から)で書きます。下書き保存し、公開ボタンを押すと書庫に並びます(全 {articles.length} 件)。
      </p>

      {error && (
        <p className="mt-3 rounded-md border border-wine-light/50 bg-wine/20 px-3 py-2 text-xs text-gold-light">
          {error}
        </p>
      )}

      <ul className="mt-4 space-y-2">
        {articles.map((a) => (
          <li key={a.id} className="rounded-md border border-surface-border bg-surface-raised p-3">
            <div className="flex items-center gap-2">
              <span
                className={`rounded-full px-1.5 py-0.5 text-[10px] font-bold ${
                  a.published ? "bg-gold/20 text-gold-light" : "bg-surface-card text-stone-500"
                }`}
              >
                {a.published ? "公開中" : "下書き"}
              </span>
              <span className="rounded-full border border-surface-border px-1.5 py-0.5 text-[10px] text-stone-400">
                {CATEGORY_LABELS[a.category]}
              </span>
              <button
                onClick={() => setOpenId(openId === a.id ? null : a.id)}
                className="min-w-0 flex-1 truncate text-left text-sm font-semibold text-stone-100 hover:text-gold-light"
              >
                {a.title}
              </button>
              <button
                onClick={() => saveArticle(a, !a.published)}
                disabled={busyId === a.id}
                className="ghost-button !px-3 !py-1.5 text-xs"
              >
                {a.published ? "下書きに戻す" : "公開する"}
              </button>
            </div>

            {openId === a.id && (
              <div className="mt-3 space-y-2 border-t border-surface-border pt-3">
                <label className="block text-xs text-stone-500">
                  スラッグ(URL: /articles/◯◯)
                  <input
                    type="text"
                    value={a.slug}
                    onChange={(e) => updateLocal(a.id, { slug: e.target.value })}
                    className="form-input mt-1 !py-1.5 font-mono text-xs"
                  />
                </label>
                <label className="block text-xs text-stone-500">
                  タイトル
                  <input
                    type="text"
                    value={a.title}
                    onChange={(e) => updateLocal(a.id, { title: e.target.value })}
                    className="form-input mt-1 !py-1.5 text-sm"
                  />
                </label>
                <label className="block text-xs text-stone-500">
                  区分
                  <select
                    value={a.category}
                    onChange={(e) => updateLocal(a.id, { category: e.target.value as Category })}
                    className="form-input mt-1 !py-1.5 text-sm"
                  >
                    <option value="guide">攻略記事</option>
                    <option value="novel">小説</option>
                  </select>
                </label>
                <label className="block text-xs text-stone-500">
                  説明文(検索結果・OGPに表示)
                  <textarea
                    value={a.description}
                    onChange={(e) => updateLocal(a.id, { description: e.target.value })}
                    rows={2}
                    className="form-input mt-1 resize-none !py-1.5 text-xs"
                  />
                </label>
                <label className="block text-xs text-stone-500">
                  本文(Markdown)
                  <textarea
                    value={a.content}
                    onChange={(e) => updateLocal(a.id, { content: e.target.value })}
                    rows={16}
                    className="form-input mt-1 !py-1.5 font-mono text-xs"
                  />
                </label>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => saveArticle(a)}
                    disabled={busyId === a.id}
                    className="ghost-button !px-3 !py-1.5 text-xs"
                  >
                    保存
                  </button>
                  {a.published && (
                    <a
                      href={`/articles/${a.slug}`}
                      target="_blank"
                      rel="noreferrer"
                      className="text-xs text-gold-light hover:underline"
                    >
                      表示を確認 ↗
                    </a>
                  )}
                  <button
                    onClick={() => deleteArticle(a.id)}
                    disabled={busyId === a.id}
                    className="ml-auto rounded-md border border-wine-light/50 px-3 py-1.5 text-xs text-gold-light transition-colors hover:bg-wine/20"
                  >
                    削除
                  </button>
                </div>
              </div>
            )}
          </li>
        ))}
      </ul>

      <form onSubmit={addArticle} className="mt-4 space-y-2 border-t border-surface-border pt-4">
        <p className="text-xs font-semibold text-stone-300">新しい記事を書く(下書きとして作成)</p>
        <input
          type="text"
          placeholder="スラッグ(例: ai-fukugyou-hajimekata)"
          value={newForm.slug}
          onChange={(e) => setNewForm((p) => ({ ...p, slug: e.target.value }))}
          className="form-input !py-1.5 font-mono text-xs"
        />
        <input
          type="text"
          placeholder="タイトル"
          value={newForm.title}
          onChange={(e) => setNewForm((p) => ({ ...p, title: e.target.value }))}
          className="form-input !py-1.5 text-sm"
        />
        <select
          value={newForm.category}
          onChange={(e) => setNewForm((p) => ({ ...p, category: e.target.value as Category }))}
          className="form-input !py-1.5 text-sm"
        >
          <option value="guide">攻略記事</option>
          <option value="novel">小説</option>
        </select>
        <textarea
          placeholder="説明文(検索結果に表示される120字前後の紹介文)"
          value={newForm.description}
          onChange={(e) => setNewForm((p) => ({ ...p, description: e.target.value }))}
          rows={2}
          className="form-input resize-none !py-1.5 text-xs"
        />
        <textarea
          placeholder="本文(Markdown)&#10;&#10;## 見出し&#10;本文テキスト…"
          value={newForm.content}
          onChange={(e) => setNewForm((p) => ({ ...p, content: e.target.value }))}
          rows={10}
          className="form-input !py-1.5 font-mono text-xs"
        />
        <button type="submit" className="neon-button w-full !py-2 text-sm">
          下書きを作成
        </button>
      </form>
    </>
  );
}
