/* Signal Ledger component: theme control remains compact, tactile, and secondary to link creation. */
"use client";

import { Moon, Sun } from "lucide-react";
import { useEffect, useState } from "react";

type Theme = "light" | "dark";
function applyTheme(theme: Theme) { document.documentElement.classList.toggle("dark", theme === "dark"); }

export function ThemeToggle() {
  const [theme, setTheme] = useState<Theme>("light");
  useEffect(() => { const stored = window.localStorage.getItem("pendek-theme") as Theme | null; const initial = stored ?? (window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light"); setTheme(initial); applyTheme(initial); }, []);
  function toggleTheme() { const next = theme === "light" ? "dark" : "light"; setTheme(next); window.localStorage.setItem("pendek-theme", next); applyTheme(next); }
  return <button type="button" onClick={toggleTheme} className="group inline-flex size-10 items-center justify-center rounded-full border border-[var(--line)] bg-[color:color-mix(in_srgb,var(--paper)_88%,transparent)] text-[var(--ink)] transition duration-180 hover:-translate-y-0.5 hover:border-[var(--ink)] active:scale-[0.97]" aria-label={theme === "light" ? "Aktifkan tema gelap" : "Aktifkan tema terang"} title={theme === "light" ? "Tema gelap" : "Tema terang"}>{theme === "light" ? <Moon className="size-[18px] transition-transform duration-200 group-hover:rotate-12" strokeWidth={1.8} /> : <Sun className="size-[18px] transition-transform duration-200 group-hover:rotate-45" strokeWidth={1.8} />}</button>;
}
