"use client";

import { useEffect, useState, useRef } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";

interface MessageItem {
  id: string;
  body: string;
  createdAt: string;
  author: {
    id: string;
    handle: string;
    displayName: string;
    avatarUrl: string | null;
  };
}

const POLL_INTERVAL_MS = 5000;

export default function ConversationPage() {
  const params = useParams();
  const router = useRouter();
  const id = typeof params.id === "string" ? params.id : "";
  const [messages, setMessages] = useState<MessageItem[]>([]);
  const [nextCursor, setNextCursor] = useState<string | null>(null);
  const [body, setBody] = useState("");
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const bottomRef = useRef<HTMLDivElement>(null);

  const fetchMessages = (cursor?: string | null) => {
    if (!id) return;
    const url = cursor
      ? `/api/conversations/${id}/messages?limit=20&cursor=${encodeURIComponent(cursor)}`
      : `/api/conversations/${id}/messages?limit=20`;
    fetch(url)
      .then((res) => {
        if (res.status === 403 || res.status === 404) {
          router.replace("/messages");
          return null;
        }
        return res.json();
      })
      .then((data) => {
        if (!data) return;
        if (data.messages) {
          setMessages((prev) =>
            cursor ? [...prev, ...data.messages] : data.messages
          );
          setNextCursor(data.nextCursor ?? null);
        }
      })
      .catch((err) => setError(String(err.message)));
  };

  useEffect(() => {
    if (!id) return;
    let cancelled = false;
    setLoading(true);
    setError(null);
    fetch(`/api/conversations/${id}/messages?limit=20`)
      .then((res) => {
        if (res.status === 403 || res.status === 404) {
          router.replace("/messages");
          return null;
        }
        return res.json();
      })
      .then((data) => {
        if (cancelled || !data) return;
        if (data.messages) {
          setMessages(data.messages);
          setNextCursor(data.nextCursor ?? null);
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
  }, [id, router]);

  useEffect(() => {
    if (!id) return;
    const startPolling = () => {
      if (intervalRef.current) return;
      intervalRef.current = setInterval(() => fetchMessages(), POLL_INTERVAL_MS);
    };
    const stopPolling = () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    };
    const onVisibility = () => {
      if (document.visibilityState === "visible") {
        fetchMessages();
        startPolling();
      } else {
        stopPolling();
      }
    };
    if (document.visibilityState === "visible") {
      startPolling();
    }
    document.addEventListener("visibilitychange", onVisibility);
    return () => {
      stopPolling();
      document.removeEventListener("visibilitychange", onVisibility);
    };
  }, [id]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = body.trim();
    if (!trimmed || sending || !id) return;
    setSending(true);
    fetch(`/api/conversations/${id}/messages`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ body: trimmed }),
    })
      .then((res) => {
        if (res.status === 403 || res.status === 404) {
          router.replace("/messages");
          return null;
        }
        return res.json();
      })
      .then((data) => {
        if (data) {
          setBody("");
          setMessages((prev) => [
            ...prev,
            {
              id: data.id,
              body: data.body,
              createdAt: data.createdAt,
              author: data.author,
            },
          ]);
          setNextCursor(null);
          bottomRef.current?.scrollIntoView({ behavior: "smooth" });
        }
      })
      .finally(() => setSending(false));
  };

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950 flex flex-col">
      <header className="sticky top-0 z-10 border-b border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-900 px-4 py-3">
        <div className="mx-auto max-w-2xl flex items-center gap-4">
          <Link
            href="/messages"
            className="text-zinc-600 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-100"
          >
            ← Back
          </Link>
          <h1 className="text-lg font-semibold text-zinc-900 dark:text-zinc-100 truncate">
            Conversation
          </h1>
        </div>
      </header>
      <main className="flex-1 overflow-y-auto px-4 py-4">
        <div className="mx-auto max-w-2xl">
          {error && (
            <p className="text-sm text-red-600 dark:text-red-400 mb-4">
              {error}
            </p>
          )}
          {loading && messages.length === 0 ? (
            <p className="text-zinc-500">Loading messages…</p>
          ) : messages.length === 0 ? (
            <p className="text-zinc-500">No messages yet. Send one below.</p>
          ) : (
            <ul className="flex flex-col gap-3">
              {messages.map((m) => (
                <li
                  key={m.id}
                  className="rounded-lg border border-zinc-200 bg-white p-3 dark:border-zinc-800 dark:bg-zinc-900"
                >
                  <p className="text-sm font-medium text-zinc-900 dark:text-zinc-100">
                    {m.author.displayName}
                    <span className="text-zinc-500 font-normal ml-2">
                      @{m.author.handle}
                    </span>
                  </p>
                  <p className="mt-1 whitespace-pre-wrap text-zinc-700 dark:text-zinc-300">
                    {m.body}
                  </p>
                  <time
                    className="mt-1 block text-xs text-zinc-400"
                    dateTime={m.createdAt}
                  >
                    {new Date(m.createdAt).toLocaleString()}
                  </time>
                </li>
              ))}
            </ul>
          )}
          {nextCursor && (
            <button
              type="button"
              onClick={() => fetchMessages(nextCursor)}
              className="mt-4 text-sm text-zinc-600 hover:underline dark:text-zinc-400"
            >
              Load older messages
            </button>
          )}
          <div ref={bottomRef} />
        </div>
      </main>
      <footer className="sticky bottom-0 border-t border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-900 px-4 py-3">
        <div className="mx-auto max-w-2xl">
          <form onSubmit={handleSubmit} className="flex gap-2">
            <input
              type="text"
              value={body}
              onChange={(e) => setBody(e.target.value)}
              placeholder="Write a message…"
              maxLength={2000}
              className="min-w-0 flex-1 rounded-lg border border-zinc-300 bg-white px-3 py-2 text-sm text-zinc-900 placeholder:text-zinc-400 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-100 dark:placeholder:text-zinc-500"
            />
            <button
              type="submit"
              disabled={!body.trim() || sending}
              className="rounded-lg bg-zinc-900 px-4 py-2 text-sm font-medium text-white disabled:opacity-50 dark:bg-zinc-100 dark:text-zinc-900"
            >
              {sending ? "…" : "Send"}
            </button>
          </form>
        </div>
      </footer>
    </div>
  );
}
