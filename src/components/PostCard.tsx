"use client";

import { useState, useEffect } from "react";
import Image from "next/image";

export interface PostCardAuthor {
  handle: string;
  displayName: string;
  avatarUrl: string | null;
}

export interface PostCardMediaItem {
  id: string;
  mimeType: string;
  key: string;
  publicUrl: string;
}

export interface PostCardProps {
  id: string;
  body: string | null;
  createdAt: string;
  author: PostCardAuthor;
  media: PostCardMediaItem[];
  likeCount?: number;
  saveCount?: number;
  commentCount?: number;
  likedByMe?: boolean;
  savedByMe?: boolean;
  onInteractionChange?: () => void;
}

function MediaItem({ item }: { item: PostCardMediaItem }) {
  if (!item.publicUrl) return null;
  const type = item.mimeType.split("/")[0];
  if (type === "image") {
    return (
      <div className="relative aspect-square w-full max-h-96 overflow-hidden rounded-lg bg-zinc-100">
        <Image
          src={item.publicUrl}
          alt=""
          fill
          className="object-contain"
          unoptimized
        />
      </div>
    );
  }
  if (type === "video") {
    return (
      <div className="w-full rounded-lg overflow-hidden bg-zinc-100">
        <video
          src={item.publicUrl}
          controls
          className="w-full max-h-96"
        />
      </div>
    );
  }
  if (type === "audio") {
    return (
      <div className="w-full rounded-lg bg-zinc-100 p-2">
        <audio src={item.publicUrl} controls className="w-full" />
      </div>
    );
  }
  return (
    <a
      href={item.publicUrl}
      target="_blank"
      rel="noopener noreferrer"
      className="text-sm text-blue-600 hover:underline"
    >
      View file
    </a>
  );
}

function CommentsDrawer({
  postId,
  onClose,
  onCommentAdded,
}: {
  postId: string;
  onClose: () => void;
  onCommentAdded?: () => void;
}) {
  const [comments, setComments] = useState<Array<{ id: string; body: string; createdAt: string; author: { handle: string; displayName: string; avatarUrl: string | null } }>>([]);
  const [nextCursor, setNextCursor] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitBody, setSubmitBody] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const loadComments = (cursor?: string) => {
    if (!cursor) setLoading(true);
    const url = cursor
      ? `/api/posts/${postId}/comments?limit=20&cursor=${encodeURIComponent(cursor)}`
      : `/api/posts/${postId}/comments?limit=20`;
    fetch(url)
      .then((res) => res.json())
      .then((data) => {
        if (data.comments) {
          setComments((prev) => (cursor ? [...prev, ...data.comments] : data.comments));
          setNextCursor(data.nextCursor ?? null);
        }
      })
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    loadComments();
  }, [postId]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const body = submitBody.trim();
    if (!body || submitting) return;
    setSubmitting(true);
    fetch(`/api/posts/${postId}/comments`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ body }),
    })
      .then((res) => {
        if (res.ok) {
          setSubmitBody("");
          loadComments();
          onCommentAdded?.();
        }
      })
      .finally(() => setSubmitting(false));
  };

  return (
    <>
      <div className="fixed inset-0 z-40 bg-black/50" aria-hidden onClick={onClose} />
      <div className="fixed right-0 top-0 z-50 h-full w-full max-w-md overflow-y-auto border-l border-zinc-200 bg-white shadow-xl dark:border-zinc-800 dark:bg-zinc-900">
        <div className="sticky top-0 flex items-center justify-between border-b border-zinc-200 bg-white p-4 dark:border-zinc-800 dark:bg-zinc-900">
          <h2 className="text-lg font-semibold text-zinc-900 dark:text-zinc-100">Comments</h2>
          <button type="button" onClick={onClose} className="rounded p-1 text-zinc-500 hover:bg-zinc-100 hover:text-zinc-700 dark:hover:bg-zinc-800 dark:hover:text-zinc-300">
            ✕
          </button>
        </div>
        <div className="p-4">
          <form onSubmit={handleSubmit} className="mb-4 flex gap-2">
            <input
              type="text"
              value={submitBody}
              onChange={(e) => setSubmitBody(e.target.value)}
              placeholder="Write a comment…"
              maxLength={2000}
              className="min-w-0 flex-1 rounded-lg border border-zinc-300 bg-white px-3 py-2 text-sm text-zinc-900 placeholder:text-zinc-400 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-100 dark:placeholder:text-zinc-500"
            />
            <button type="submit" disabled={!submitBody.trim() || submitting} className="rounded-lg bg-zinc-900 px-3 py-2 text-sm font-medium text-white disabled:opacity-50 dark:bg-zinc-100 dark:text-zinc-900">
              {submitting ? "…" : "Post"}
            </button>
          </form>
          {loading ? (
            <p className="text-sm text-zinc-500">Loading comments…</p>
          ) : comments.length === 0 ? (
            <p className="text-sm text-zinc-500">No comments yet.</p>
          ) : (
            <ul className="flex flex-col gap-3">
              {comments.map((c) => (
                <li key={c.id} className="rounded-lg border border-zinc-200 p-3 dark:border-zinc-800">
                  <p className="flex items-center gap-2 text-sm font-medium text-zinc-900 dark:text-zinc-100">
                    {c.author.displayName}
                    <span className="text-zinc-500">@{c.author.handle}</span>
                  </p>
                  <p className="mt-1 whitespace-pre-wrap text-sm text-zinc-700 dark:text-zinc-300">{c.body}</p>
                  <time className="mt-1 block text-xs text-zinc-400" dateTime={c.createdAt}>
                    {new Date(c.createdAt).toLocaleString()}
                  </time>
                </li>
              ))}
            </ul>
          )}
          {nextCursor && (
            <button type="button" onClick={() => loadComments(nextCursor)} className="mt-4 text-sm text-zinc-600 hover:underline dark:text-zinc-400">
              Load more
            </button>
          )}
        </div>
      </div>
    </>
  );
}

export function PostCard({
  id,
  body,
  createdAt,
  author,
  media,
  likeCount = 0,
  saveCount = 0,
  commentCount = 0,
  likedByMe = false,
  savedByMe = false,
  onInteractionChange,
}: PostCardProps) {
  const [likeLoading, setLikeLoading] = useState(false);
  const [saveLoading, setSaveLoading] = useState(false);
  const [commentsOpen, setCommentsOpen] = useState(false);
  const [commentsDrawerMounted, setCommentsDrawerMounted] = useState(false);

  const date = new Date(createdAt).toLocaleString();

  const handleLike = () => {
    if (likeLoading) return;
    setLikeLoading(true);
    const method = likedByMe ? "DELETE" : "POST";
    fetch(`/api/posts/${id}/like`, { method })
      .then((res) => res.ok && onInteractionChange?.())
      .finally(() => setLikeLoading(false));
  };

  const handleSave = () => {
    if (saveLoading) return;
    setSaveLoading(true);
    const method = savedByMe ? "DELETE" : "POST";
    fetch(`/api/posts/${id}/save`, { method })
      .then((res) => res.ok && onInteractionChange?.())
      .finally(() => setSaveLoading(false));
  };

  const openComments = () => {
    setCommentsDrawerMounted(true);
    setCommentsOpen(true);
  };

  const closeComments = () => {
    setCommentsOpen(false);
  };

  return (
    <>
      <article className="rounded-xl border border-zinc-200 bg-white p-4 shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
        <header className="mb-2 flex items-center gap-3">
          {author.avatarUrl ? (
            <Image
              src={author.avatarUrl}
              alt=""
              width={40}
              height={40}
              className="rounded-full"
              unoptimized
            />
          ) : (
            <div className="h-10 w-10 rounded-full bg-zinc-300 dark:bg-zinc-600" />
          )}
          <div className="min-w-0 flex-1">
            <p className="truncate font-medium text-zinc-900 dark:text-zinc-100">
              {author.displayName}
            </p>
            <p className="truncate text-sm text-zinc-500">@{author.handle}</p>
          </div>
          <time className="text-xs text-zinc-400" dateTime={createdAt}>
            {date}
          </time>
        </header>
        {body ? (
          <p className="mb-3 whitespace-pre-wrap text-zinc-700 dark:text-zinc-300">
            {body}
          </p>
        ) : null}
        {media.length > 0 ? (
          <div className="mb-3 flex flex-col gap-2">
            {media.map((item) => (
              <MediaItem key={item.id} item={item} />
            ))}
          </div>
        ) : null}
        <footer className="flex items-center gap-4 border-t border-zinc-100 pt-3 dark:border-zinc-800">
          <button
            type="button"
            onClick={handleLike}
            disabled={likeLoading}
            className="flex items-center gap-1.5 text-sm text-zinc-600 hover:text-red-600 disabled:opacity-50 dark:text-zinc-400 dark:hover:text-red-400"
            aria-pressed={likedByMe}
          >
            <span className="text-lg">{likedByMe ? "❤️" : "🤍"}</span>
            <span>{likeCount}</span>
          </button>
          <button
            type="button"
            onClick={handleSave}
            disabled={saveLoading}
            className="flex items-center gap-1.5 text-sm text-zinc-600 hover:text-zinc-900 disabled:opacity-50 dark:text-zinc-400 dark:hover:text-zinc-100"
            aria-pressed={savedByMe}
          >
            <span className="text-lg">{savedByMe ? "🔖" : "📑"}</span>
            <span>{saveCount}</span>
          </button>
          <button
            type="button"
            onClick={openComments}
            className="flex items-center gap-1.5 text-sm text-zinc-600 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-100"
          >
            <span className="text-lg">💬</span>
            <span>{commentCount}</span>
          </button>
        </footer>
      </article>
      {commentsOpen && commentsDrawerMounted && (
        <CommentsDrawer
          postId={id}
          onClose={closeComments}
          onCommentAdded={onInteractionChange}
        />
      )}
    </>
  );
}
