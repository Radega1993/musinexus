"use client";

import { useTheme } from "next-themes";
import { useEffect, useState } from "react";

export function ThemeSelector() {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => setMounted(true), []);

  if (!mounted) {
    return (
      <span className="text-sm text-brand-muted" aria-hidden>
        Theme
      </span>
    );
  }

  return (
    <div className="flex items-center gap-1 rounded-xl border border-brand-border bg-brand-panel p-0.5">
      {(["light", "system", "dark"] as const).map((t) => (
        <button
          key={t}
          type="button"
          onClick={() => setTheme(t)}
          className={`rounded-lg px-2 py-1 text-xs font-medium transition-colors ${
            theme === t
              ? "bg-brand-bg text-brand-text shadow-soft"
              : "text-brand-muted hover:text-brand-text"
          }`}
          aria-pressed={theme === t}
          aria-label={`Use ${t} theme`}
        >
          {t === "light" ? "☀️" : t === "dark" ? "🌙" : "💻"}
        </button>
      ))}
    </div>
  );
}
