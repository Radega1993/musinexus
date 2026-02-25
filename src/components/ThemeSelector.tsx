"use client";

import { useTheme } from "next-themes";
import { useEffect, useState } from "react";

export function ThemeSelector() {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => setMounted(true), []);

  if (!mounted) {
    return (
      <span className="text-sm text-zinc-500 dark:text-zinc-400" aria-hidden>
        Theme
      </span>
    );
  }

  return (
    <div className="flex items-center gap-1 rounded-lg border border-zinc-200 bg-zinc-50 p-0.5 dark:border-zinc-700 dark:bg-zinc-800">
      {(["light", "system", "dark"] as const).map((t) => (
        <button
          key={t}
          type="button"
          onClick={() => setTheme(t)}
          className={`rounded-md px-2 py-1 text-xs font-medium transition-colors ${
            theme === t
              ? "bg-white text-zinc-900 shadow-sm dark:bg-zinc-700 dark:text-zinc-100"
              : "text-zinc-600 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-100"
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
