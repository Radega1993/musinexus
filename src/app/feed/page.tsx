"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { PostCard } from "@/components/PostCard";

interface PostItem {
  id: string;
  body: string | null;
  createdAt: string;
  author: { handle: string; displayName: string; avatarUrl: string | null };
  media: Array<{ id: string; mimeType: string; key: string; publicUrl: string }>;
  likeCount: number;
  saveCount: number;
  commentCount: number;
  likedByMe?: boolean;
  savedByMe?: boolean;
}

export default function FeedPage() {
  const [posts, setPosts] = useState<PostItem[]>([]);
  const [nextCursor, setNextCursor] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const refetchFeed = () => {
    fetch("/api/feed?limit=20")
      .then((res) => res.json())
      .then((data) => {
        if (data.posts) {
          setPosts(data.posts);
          setNextCursor(data.nextCursor ?? null);
        }
      });
  };

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError(null);
    fetch("/api/feed?limit=20")
      .then((res) => res.json())
      .then((data) => {
        if (cancelled) return;
        if (data.posts) {
          setPosts(data.posts);
          setNextCursor(data.nextCursor ?? null);
        } else {
          setPosts([]);
          setNextCursor(null);
        }
      })
      .catch((err) => {
        if (!cancelled) setError(String(err.message));
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  const loadMore = () => {
    if (!nextCursor || loading) return;
    setLoading(true);
    fetch(`/api/feed?limit=20&cursor=${encodeURIComponent(nextCursor)}`)
      .then((res) => res.json())
      .then((data) => {
        if (data.posts?.length) {
          setPosts((prev) => [...prev, ...data.posts]);
          setNextCursor(data.nextCursor ?? null);
        } else {
          setNextCursor(null);
        }
      })
      .finally(() => setLoading(false));
  };

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950 py-8 px-4">
      <div className="mx-auto max-w-2xl flex flex-col gap-6">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-semibold text-zinc-900 dark:text-zinc-100">
            Feed
          </h1>
          <Link
            href="/create-post"
            className="rounded-full bg-zinc-900 px-4 py-2 text-sm font-medium text-white hover:bg-zinc-800 dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-zinc-200"
          >
            New post
          </Link>
        </div>
        {error && (
          <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
        )}
        {loading && posts.length === 0 ? (
          <p className="text-zinc-500">Loading feed…</p>
        ) : posts.length === 0 ? (
          <p className="text-zinc-500">
            No posts yet. Set an active profile and follow others, or create a
            post.
          </p>
        ) : (
          <>
            <ul className="flex flex-col gap-4">
              {posts.map((post) => (
                <li key={post.id}>
                  <PostCard {...post} onInteractionChange={refetchFeed} />
                </li>
              ))}
            </ul>
            {nextCursor && (
              <button
                type="button"
                onClick={loadMore}
                disabled={loading}
                className="rounded-lg border border-zinc-300 bg-white px-4 py-2 text-sm font-medium text-zinc-700 hover:bg-zinc-50 disabled:opacity-50 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-300 dark:hover:bg-zinc-800"
              >
                {loading ? "Loading…" : "Load more"}
              </button>
            )}
          </>
        )}
      </div>
    </div>
  );
}
