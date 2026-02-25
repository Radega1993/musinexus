"use client";

import { usePathname } from "next/navigation";
import Link from "next/link";
import { ThemeSelector } from "@/components/ThemeSelector";
import { Container } from "@/components/Container";

const HIDE_SHELL_PATHS = ["/", "/login", "/register"];

export function AppShell() {
  const pathname = usePathname();
  const hide = pathname && HIDE_SHELL_PATHS.includes(pathname);

  if (hide) return null;

  return (
    <header className="sticky top-0 z-30 border-b border-brand-border bg-brand-panel/95 backdrop-blur-md">
      <Container>
        <div className="flex h-14 items-center justify-between gap-4">
          <Link
            href="/feed"
            className="font-semibold text-brand-text"
          >
            Musinexus
          </Link>
          <nav className="flex items-center gap-4">
            <Link
              href="/feed"
              className="text-sm text-brand-muted hover:text-brand-text"
            >
              Feed
            </Link>
            <Link
              href="/search"
              className="text-sm text-brand-muted hover:text-brand-text"
            >
              Search
            </Link>
            <Link
              href="/create-post"
              className="text-sm text-brand-muted hover:text-brand-text"
            >
              New post
            </Link>
            <ThemeSelector />
          </nav>
        </div>
      </Container>
    </header>
  );
}
