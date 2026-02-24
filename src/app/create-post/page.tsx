"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function CreatePostPage() {
  const router = useRouter();
  const [body, setBody] = useState("");
  const [mediaAssetIds, setMediaAssetIds] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const ids = mediaAssetIds
      .split(/[\s,]+/)
      .map((s) => s.trim())
      .filter(Boolean);
    if (ids.length === 0) {
      setError("Add at least one media asset id (from upload flow).");
      return;
    }
    setError(null);
    setSubmitting(true);
    try {
      const res = await fetch("/api/posts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          body: body.trim() || undefined,
          mediaAssetIds: ids,
        }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setError(data.detail || data.title || "Failed to create post");
        return;
      }
      router.push("/feed");
      router.refresh();
    } catch (err) {
      setError(String(err));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950 py-8 px-4">
      <div className="mx-auto max-w-xl">
        <div className="mb-6 flex items-center gap-4">
          <Link
            href="/feed"
            className="text-sm text-zinc-600 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-100"
          >
            ← Feed
          </Link>
          <h1 className="text-2xl font-semibold text-zinc-900 dark:text-zinc-100">
            Create post
          </h1>
        </div>
        <form
          onSubmit={handleSubmit}
          className="flex flex-col gap-4 rounded-xl border border-zinc-200 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-900"
        >
          {error && (
            <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
          )}
          <label className="flex flex-col gap-1">
            <span className="text-sm font-medium text-zinc-700 dark:text-zinc-300">
              Caption (optional)
            </span>
            <textarea
              value={body}
              onChange={(e) => setBody(e.target.value)}
              rows={3}
              className="rounded-lg border border-zinc-300 bg-white px-3 py-2 text-zinc-900 placeholder-zinc-400 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-100"
              placeholder="Write a caption…"
            />
          </label>
          <label className="flex flex-col gap-1">
            <span className="text-sm font-medium text-zinc-700 dark:text-zinc-300">
              Media asset IDs (required, min 1)
            </span>
            <input
              type="text"
              value={mediaAssetIds}
              onChange={(e) => setMediaAssetIds(e.target.value)}
              className="rounded-lg border border-zinc-300 bg-white px-3 py-2 text-zinc-900 placeholder-zinc-400 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-100"
              placeholder="e.g. clxx123, clxx456 (from upload flow)"
              required
            />
            <span className="text-xs text-zinc-500">
              Paste one or more asset IDs from the media upload flow, comma or
              space separated.
            </span>
          </label>
          <div className="flex gap-3">
            <button
              type="submit"
              disabled={submitting}
              className="rounded-lg bg-zinc-900 px-4 py-2 text-sm font-medium text-white hover:bg-zinc-800 disabled:opacity-50 dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-zinc-200"
            >
              {submitting ? "Posting…" : "Post"}
            </button>
            <Link
              href="/feed"
              className="rounded-lg border border-zinc-300 px-4 py-2 text-sm font-medium text-zinc-700 hover:bg-zinc-50 dark:border-zinc-700 dark:text-zinc-300 dark:hover:bg-zinc-800"
            >
              Cancel
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
}
