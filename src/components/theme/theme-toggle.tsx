"use client";

import { THEME_COOKIE, type Theme } from "@/lib/theme";

export function ThemeToggle() {
  function toggleTheme() {
    const root = document.documentElement;
    const resolved =
      root.dataset.theme ??
      (window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light");
    const next: Theme = resolved === "dark" ? "light" : "dark";

    root.dataset.theme = next;
    document.cookie = `${THEME_COOKIE}=${next}; path=/; max-age=31536000; samesite=lax`;
  }

  return (
    <button
      className="theme-toggle"
      type="button"
      onClick={toggleTheme}
      aria-label="Cambiar entre tema claro y oscuro"
      title="Cambiar tema"
    >
      <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">
        <circle cx="12" cy="12" r="8.5" />
        <path d="M12 3.5a8.5 8.5 0 0 1 0 17Z" fill="currentColor" stroke="none" />
      </svg>
    </button>
  );
}
