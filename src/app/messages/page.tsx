"use client";

import { useEffect, useState, useRef } from "react";
import Link from "next/link";

interface ConversationItem {
  id: string;
  createdAt: string;
  lastMessageAt: string | null;
  otherParticipant: {
    id: string;
    handle: string;
    displayName: string;
    avatarUrl: string | null;
  } | null;
  lastMessage: {
    id: string;
    body: string;
    createdAt: string;
  } | null;
}

const POLL_INTERVAL_MS = 8000;

export default function MessagesPage() {
  const [conversations, setConversations] = useState<ConversationItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const fetchInbox = () => {
    fetch("/api/conversations")
      .then((res) => {
        if (!res.ok) return res.json().then(() => ({ conversations: [] }));
        return res.json();
      })
      .then((data) => {
        if (data.conversations) setConversations(data.conversations);
      })
      .catch((err) => setError(String(err.message)));
  };

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError(null);
    fetch("/api/conversations")
      .then((res) => res.json())
      .then((data) => {
        if (cancelled) return;
        setConversations(data.conversations ?? []);
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

  useEffect(() => {
    const startPolling = () => {
      if (intervalRef.current) return;
      intervalRef.current = setInterval(fetchInbox, POLL_INTERVAL_MS);
    };
    const stopPolling = () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    };
    const onVisibility = () => {
      if (document.visibilityState === "visible") {
        fetchInbox();
        startPolling();
      } else {
        stopPolling();
      }
    };
    if (document.visibilityState === "visible") startPolling();
    document.addEventListener("visibilitychange", onVisibility);
    return () => {
      stopPolling();
      document.removeEventListener("visibilitychange", onVisibility);
    };
  }, []);

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950 py-8 px-4">
      <div className="mx-auto max-w-2xl">
        <h1 className="text-2xl font-semibold text-zinc-900 dark:text-zinc-100 mb-6">
          Messages
        </h1>
        {error && (
          <p className="text-sm text-red-600 dark:text-red-400 mb-4">{error}</p>
        )}
        {loading && conversations.length === 0 ? (
          <p className="text-zinc-500">Loading conversations…</p>
        ) : conversations.length === 0 ? (
          <p className="text-zinc-500">
            No conversations yet. Start a conversation from a profile.
          </p>
        ) : (
          <ul className="flex flex-col gap-2">
            {conversations.map((conv) => (
              <li key={conv.id}>
                <Link
                  href={`/messages/${conv.id}`}
                  className="block rounded-xl border border-zinc-200 bg-white p-4 shadow-sm hover:bg-zinc-50 dark:border-zinc-800 dark:bg-zinc-900 dark:hover:bg-zinc-800"
                >
                  <div className="flex items-center justify-between gap-3">
                    <div className="min-w-0 flex-1">
                      <p className="font-medium text-zinc-900 dark:text-zinc-100 truncate">
                        {conv.otherParticipant?.displayName ?? "Unknown"}
                      </p>
                      <p className="text-sm text-zinc-500 truncate">
                        @{conv.otherParticipant?.handle ?? "—"}
                      </p>
                      {conv.lastMessage && (
                        <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400 truncate">
                          {conv.lastMessage.body}
                        </p>
                      )}
                    </div>
                    {conv.lastMessageAt && (
                      <time
                        className="text-xs text-zinc-400 shrink-0"
                        dateTime={conv.lastMessageAt}
                      >
                        {new Date(conv.lastMessageAt).toLocaleString()}
                      </time>
                    )}
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
