/* Signal Ledger component: a local history reads like a lightweight route ledger, stored only in the visitor’s own browser. */
"use client";

import type { RecentLink } from "@/lib/link-history";
import { Copy, ExternalLink, History, Trash2 } from "lucide-react";

type RecentLinkHistoryProps = {
  items: RecentLink[];
  onClear: () => void;
  onCopy: (url: string) => void;
};

export function RecentLinkHistory({ items, onClear, onCopy }: RecentLinkHistoryProps) {
  return (
    <section className="mt-6 border-t border-[var(--line)] pt-5" aria-labelledby="recent-links-title">
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-2"><History className="size-4 text-[var(--signal)]" /><h2 id="recent-links-title" className="font-mono-brand text-[10px] font-medium uppercase tracking-[.16em] text-[var(--ink-soft)]">riwayat lokal / {items.length}</h2></div>
        <button type="button" onClick={onClear} disabled={!items.length} className="inline-flex items-center gap-1.5 font-mono-brand text-[10px] font-medium text-[var(--ink-soft)] underline decoration-[var(--signal)] decoration-2 underline-offset-4 transition hover:text-[var(--signal)] disabled:cursor-not-allowed disabled:no-underline disabled:opacity-40"><Trash2 className="size-3" />bersihkan</button>
      </div>
      {!items.length ? <p className="mt-4 text-sm leading-6 text-[var(--ink-soft)]">Link baru yang Anda buat akan tercatat di perangkat ini agar mudah dibuka kembali.</p> : <ul className="mt-4 divide-y divide-[var(--line)] border-y border-[var(--line)]">{items.map((item) => <li key={item.shortCode} className="group grid grid-cols-[minmax(0,1fr)_auto] items-center gap-3 py-3"><div className="min-w-0"><a href={item.shortUrl} target="_blank" rel="noreferrer" className="flex w-fit max-w-full items-center gap-1.5 truncate font-mono-brand text-sm font-medium text-[var(--ink)] underline decoration-[var(--signal)] decoration-2 underline-offset-4 transition hover:text-[var(--signal)]"><span className="truncate">/{item.shortCode}</span><ExternalLink className="size-3 shrink-0" /></a><p className="mt-1 truncate font-mono-brand text-[10px] text-[var(--ink-soft)]">{item.originalUrl}</p></div><button type="button" onClick={() => onCopy(item.shortUrl)} className="grid size-9 place-items-center rounded-[3px] border border-[var(--line)] bg-[var(--paper)] text-[var(--ink)] transition hover:border-[var(--signal)] hover:text-[var(--signal)] active:scale-[.97]" aria-label={`Salin ${item.shortUrl}`} title="Salin tautan"><Copy className="size-3.5" /></button></li>)}</ul>}
    </section>
  );
}

