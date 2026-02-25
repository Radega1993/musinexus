"use client";

import { useParams } from "next/navigation";
import { useEffect, useState, useCallback } from "react";
import Image from "next/image";
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

interface ProfileData {
  id: string;
  handle: string;
  displayName: string;
  avatarUrl: string | null;
  followerCount: number;
  followingCount: number;
  isFollowing?: boolean;
  isOwnProfile?: boolean;
  posts: PostItem[];
}

export default function ProfilePage() {
  const params = useParams();
  const handle = typeof params.handle === "string" ? params.handle : "";
  const [profile, setProfile] = useState<ProfileData | null>(null);
  const [loading, setLoading] = useState(true);
  const [followLoading, setFollowLoading] = useState(false);
  const [notFound, setNotFound] = useState(false);

  const refetch = useCallback(() => {
    if (!handle) return;
    setLoading(true);
    setNotFound(false);
    fetch(`/api/profiles/${encodeURIComponent(handle)}`)
      .then((res) => {
        if (res.status === 404) {
          setNotFound(true);
          return null;
        }
        return res.json();
      })
      .then((data) => {
        if (data) setProfile(data);
      })
      .finally(() => setLoading(false));
  }, [handle]);

  useEffect(() => {
    refetch();
  }, [refetch]);

  const toggleFollow = () => {
    if (!profile || profile.isOwnProfile || followLoading) return;
    setFollowLoading(true);
    const method = profile.isFollowing ? "DELETE" : "POST";
    fetch(`/api/profiles/id/${profile.id}/follow`, { method })
      .then((res) => {
        if (res.ok && (res.status === 200 || res.status === 201)) {
          return res.json().then((body: { isFollowing?: boolean }) => {
            setProfile((prev) =>
              prev
                ? {
                    ...prev,
                    isFollowing: body.isFollowing ?? !prev.isFollowing,
                    followerCount:
                      body.isFollowing === true
                        ? prev.followerCount + 1
                        : body.isFollowing === false
                          ? Math.max(0, prev.followerCount - 1)
                          : prev.followerCount,
                  }
                : null
            );
          });
        }
      })
      .finally(() => setFollowLoading(false));
  };

  if (!handle) {
    return (
      <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950 py-8 px-4">
        <p className="text-zinc-500">Invalid profile.</p>
      </div>
    );
  }

  if (loading && !profile) {
    return (
      <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950 py-8 px-4">
        <p className="text-zinc-500">Loading profile…</p>
      </div>
    );
  }

  if (notFound || !profile) {
    return (
      <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950 py-8 px-4">
        <div className="mx-auto max-w-2xl">
          <p className="text-zinc-500">Profile not found.</p>
          <Link href="/search" className="mt-4 inline-block text-sm text-zinc-600 hover:underline dark:text-zinc-400">
            Search profiles
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950 py-8 px-4">
      <div className="mx-auto max-w-2xl flex flex-col gap-6">
        <header className="flex flex-col gap-4 rounded-xl border border-zinc-200 bg-white p-6 dark:border-zinc-800 dark:bg-zinc-900">
          <div className="flex items-center gap-4">
            {profile.avatarUrl ? (
              <Image
                src={profile.avatarUrl}
                alt=""
                width={80}
                height={80}
                className="rounded-full shrink-0"
                unoptimized
              />
            ) : (
              <div className="h-20 w-20 rounded-full bg-zinc-300 dark:bg-zinc-600 shrink-0" />
            )}
            <div className="min-w-0 flex-1">
              <h1 className="text-xl font-semibold text-zinc-900 dark:text-zinc-100">
                {profile.displayName}
              </h1>
              <p className="text-zinc-500">@{profile.handle}</p>
              <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">
                {profile.followerCount} followers · {profile.followingCount} following
              </p>
            </div>
            {!profile.isOwnProfile && profile.isFollowing !== undefined && (
              <button
                type="button"
                onClick={toggleFollow}
                disabled={followLoading}
                className="rounded-full bg-zinc-900 px-4 py-2 text-sm font-medium text-white hover:bg-zinc-800 disabled:opacity-50 dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-zinc-200"
              >
                {followLoading ? "…" : profile.isFollowing ? "Unfollow" : "Follow"}
              </button>
            )}
          </div>
        </header>
        <section>
          <h2 className="mb-4 text-lg font-medium text-zinc-900 dark:text-zinc-100">
            Posts
          </h2>
          {profile.posts.length === 0 ? (
            <p className="text-sm text-zinc-500">No posts yet.</p>
          ) : (
            <ul className="flex flex-col gap-4">
              {profile.posts.map((post) => (
                <li key={post.id}>
                  <PostCard {...post} onInteractionChange={refetch} />
                </li>
              ))}
            </ul>
          )}
        </section>
      </div>
    </div>
  );
}
