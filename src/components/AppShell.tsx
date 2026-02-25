"use client";

import { usePathname } from "next/navigation";
import Link from "next/link";
import { ThemeSelector } from "@/components/ThemeSelector";

const HIDE_SHELL_PATHS = ["/", "/login", "/register"];

export function AppShell() {
  const pathname = usePathname();
  const hide = pathname && HIDE_SHELL_PATHS.includes(pathname);

  if (hide) return null;

  return (
    <header className="sticky top-0 z-30 border-b border-zinc-200 bg-white/95 backdrop-blur dark:border-zinc-800 dark:bg-zinc-950/95">
      <div className="mx-auto flex h-14 max-w-4xl items-center justify-between gap-4 px-4">
        <Link
          href="/feed"
          className="font-semibold text-zinc-900 dark:text-zinc-100"
        >
          Musinexus
        </Link>
        <nav className="flex items-center gap-4">
          <Link
            href="/feed"
            className="text-sm text-zinc-600 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-100"
          >
            Feed
          </Link>
          <Link
            href="/search"
            className="text-sm text-zinc-600 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-100"
          >
            Search
          </Link>
          <Link
            href="/create-post"
            className="text-sm text-zinc-600 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-100"
          >
            New post
          </Link>
          <ThemeSelector />
        </nav>
      </div>
    </header>
  );
}
