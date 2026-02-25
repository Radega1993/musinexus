"use client";

import { useState, useCallback } from "react";
import Image from "next/image";
import Link from "next/link";

interface SearchProfile {
  id: string;
  handle: string;
  displayName: string;
  avatarUrl: string | null;
  isFollowing?: boolean;
}

export default function SearchPage() {
  const [query, setQuery] = useState("");
  const [profiles, setProfiles] = useState<SearchProfile[]>([]);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);

  const runSearch = useCallback(() => {
    const q = query.trim();
    if (q.length < 2) {
      setProfiles([]);
      setSearched(true);
      return;
    }
    setLoading(true);
    setSearched(true);
    fetch(`/api/search/profiles?q=${encodeURIComponent(q)}`)
      .then((res) => res.json())
      .then((data) => {
        setProfiles(data.profiles ?? []);
      })
      .finally(() => setLoading(false));
  }, [query]);

  const showEmpty = searched && !loading && (query.trim().length < 2 || profiles.length === 0);

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950 py-8 px-4">
      <div className="mx-auto max-w-2xl flex flex-col gap-6">
        <h1 className="text-2xl font-semibold text-zinc-900 dark:text-zinc-100">
          Search profiles
        </h1>
        <div className="flex gap-2">
          <input
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && runSearch()}
            placeholder="Search by handle or name (min 2 chars)"
            className="min-w-0 flex-1 rounded-lg border border-zinc-300 bg-white px-3 py-2 text-zinc-900 placeholder:text-zinc-400 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-100 dark:placeholder:text-zinc-500"
            aria-label="Search profiles"
          />
          <button
            type="button"
            onClick={runSearch}
            disabled={loading}
            className="rounded-lg bg-zinc-900 px-4 py-2 text-sm font-medium text-white hover:bg-zinc-800 disabled:opacity-50 dark:bg-zinc-100 dark:text-zinc-900"
          >
            {loading ? "…" : "Search"}
          </button>
        </div>
        {loading && (
          <p className="text-sm text-zinc-500">Searching…</p>
        )}
        {showEmpty && (
          <p className="text-sm text-zinc-500">
            {query.trim().length < 2
              ? "Type at least 2 characters to search."
              : "No profiles found."}
          </p>
        )}
        {!loading && profiles.length > 0 && (
          <ul className="flex flex-col gap-2">
            {profiles.map((p) => (
              <li key={p.id}>
                <Link
                  href={`/${p.handle}`}
                  className="flex items-center gap-3 rounded-xl border border-zinc-200 bg-white p-3 transition hover:bg-zinc-50 dark:border-zinc-800 dark:bg-zinc-900 dark:hover:bg-zinc-800"
                >
                  {p.avatarUrl ? (
                    <Image
                      src={p.avatarUrl}
                      alt=""
                      width={48}
                      height={48}
                      className="rounded-full shrink-0"
                      unoptimized
                    />
                  ) : (
                    <div className="h-12 w-12 rounded-full bg-zinc-300 dark:bg-zinc-600 shrink-0" />
                  )}
                  <div className="min-w-0 flex-1">
                    <p className="font-medium text-zinc-900 dark:text-zinc-100 truncate">
                      {p.displayName}
                    </p>
                    <p className="text-sm text-zinc-500 truncate">@{p.handle}</p>
                  </div>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
