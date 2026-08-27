/* Signal Ledger component: the workspace exposes the current route, local route ledger, and processing state with concise operational feedback. */
"use client";

import { QrCodeCard } from "@/components/qr-code-card";
import { RecentLinkHistory } from "@/components/recent-link-history";
import { RecaptchaWidget } from "@/components/recaptcha-widget";
import { LINK_HISTORY_STORAGE_KEY, prependRecentLink, readRecentLinks, type RecentLink } from "@/lib/link-history";
import { ArrowUpRight, Check, Copy, LoaderCircle, Sparkles } from "lucide-react";
import Link from "next/link";
import { FormEvent, useEffect, useRef, useState } from "react";
import toast from "react-hot-toast";

type CreatedLink = { originalUrl: string; shortCode: string; shortUrl: string; clicks: number; createdAt: string };
type CopyState = "idle" | "copied" | "error";

export function LinkShortener() {
  const [originalUrl, setOriginalUrl] = useState("");
  const [customCode, setCustomCode] = useState("");
  const [showCustomCode, setShowCustomCode] = useState(false);
  const [recaptchaToken, setRecaptchaToken] = useState<string | null>(null);
  const [recaptchaRefreshKey, setRecaptchaRefreshKey] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [result, setResult] = useState<CreatedLink | null>(null);
  const [recentLinks, setRecentLinks] = useState<RecentLink[]>([]);
  const [historyReady, setHistoryReady] = useState(false);
  const [copyState, setCopyState] = useState<CopyState>("idle");
  const copyFeedbackTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    try { setRecentLinks(readRecentLinks(window.localStorage.getItem(LINK_HISTORY_STORAGE_KEY))); } catch { setRecentLinks([]); }
    setHistoryReady(true);
    return () => { if (copyFeedbackTimer.current) clearTimeout(copyFeedbackTimer.current); };
  }, []);

  useEffect(() => {
    if (!historyReady) return;
    try { window.localStorage.setItem(LINK_HISTORY_STORAGE_KEY, JSON.stringify(recentLinks)); } catch { /* Browsers may block local storage. */ }
  }, [historyReady, recentLinks]);

  function resetCaptcha() { setRecaptchaToken(null); setRecaptchaRefreshKey((value) => value + 1); }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (isSubmitting) return;
    if (!recaptchaToken) { toast.error("Selesaikan verifikasi anti-spam sebelum membuat link."); return; }
    setIsSubmitting(true); setResult(null); setCopyState("idle");
    try {
      const response = await fetch("/api/links", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ originalUrl, customCode: showCustomCode ? customCode : undefined, recaptchaToken }) });
      const payload = (await response.json()) as CreatedLink & { error?: string };
      if (!response.ok) throw new Error(payload.error ?? "Tautan belum bisa dibuat. Coba ulangi.");
      setResult(payload);
      setRecentLinks((current) => prependRecentLink(current, { shortCode: payload.shortCode, shortUrl: payload.shortUrl, originalUrl: payload.originalUrl, createdAt: payload.createdAt }));
      resetCaptcha();
      toast.success("Tautan pendek dan QR code siap digunakan.");
    } catch (error) {
      resetCaptcha();
      toast.error(error instanceof Error ? error.message : "Terjadi kesalahan tak terduga.");
    } finally { setIsSubmitting(false); }
  }

  async function copyShortUrl(url: string, showFeedback = false) {
    if (copyFeedbackTimer.current) clearTimeout(copyFeedbackTimer.current);
    try { await navigator.clipboard.writeText(url); if (showFeedback) setCopyState("copied"); toast.success("Tautan pendek disalin."); }
    catch { if (showFeedback) setCopyState("error"); toast.error("Salin otomatis gagal. Pilih dan salin tautan secara manual."); }
    finally { if (showFeedback) copyFeedbackTimer.current = setTimeout(() => setCopyState("idle"), 1800); }
  }

  const copyWasSuccessful = copyState === "copied";
  const submitLabel = isSubmitting ? "Memverifikasi & merangkai link..." : recaptchaToken ? "Ringkas tautan ini" : "Selesaikan verifikasi";

  return <section className="paper-grain relative overflow-hidden rounded-[6px] border border-[var(--line)] bg-[var(--paper)] p-5 shadow-[8px_8px_0_color-mix(in_srgb,var(--ink)_8%,transparent)] sm:p-7"><div className="absolute inset-x-0 top-0 h-1 bg-[var(--signal)]" /><div className="mb-7 flex items-start justify-between gap-4 border-b border-[var(--line)] pb-5"><div><p className="font-mono-brand text-[10px] font-medium uppercase tracking-[.18em] text-[var(--ink-soft)]">01 / ruang kerja</p><h2 className="mt-2 text-xl font-extrabold tracking-[-.045em] text-[var(--ink)]">Buat link baru</h2></div><span className="inline-flex items-center gap-1.5 rounded-full bg-[var(--signal-soft)] px-3 py-1.5 font-mono-brand text-[10px] font-medium text-[var(--ink)]"><Sparkles className="size-3 text-[var(--signal)]" />6 karakter unik</span></div><form onSubmit={handleSubmit} className="space-y-4" noValidate><label className="block"><span className="mb-2 block font-mono-brand text-[10px] font-medium uppercase tracking-[.15em] text-[var(--ink-soft)]">URL tujuan</span><input name="originalUrl" type="url" inputMode="url" autoComplete="url" value={originalUrl} onChange={(event) => setOriginalUrl(event.target.value)} placeholder="https://contoh.com/halaman-yang-sangat-panjang" required maxLength={2048} className="h-14 w-full rounded-[4px] border border-[var(--line)] bg-[var(--canvas)] px-4 font-mono-brand text-sm text-[var(--ink)] shadow-inner outline-none transition placeholder:text-[color:color-mix(in_srgb,var(--ink-soft)_65%,transparent)] focus:border-[var(--signal)] focus:ring-4 focus:ring-[color:color-mix(in_srgb,var(--signal)_18%,transparent)]" /></label><div className="flex items-center gap-3 py-1"><button type="button" onClick={() => setShowCustomCode((value) => !value)} className="font-mono-brand text-[11px] font-medium text-[var(--ink-soft)] underline decoration-[var(--signal)] decoration-2 underline-offset-4 transition hover:text-[var(--ink)] active:scale-[.98]">{showCustomCode ? "Gunakan kode acak" : "Atur kode kustom"}</button><span className="h-px flex-1 bg-[var(--line)]" /></div>{showCustomCode && <label className="block"><span className="mb-2 block font-mono-brand text-[10px] font-medium uppercase tracking-[.15em] text-[var(--ink-soft)]">Kode pilihan Anda</span><div className="flex overflow-hidden rounded-[4px] border border-[var(--line)] bg-[var(--canvas)]"><span className="flex items-center border-r border-[var(--line)] px-3 font-mono-brand text-xs text-[var(--ink-soft)]">/</span><input name="customCode" value={customCode} onChange={(event) => setCustomCode(event.target.value.toLowerCase())} placeholder="namasaya" maxLength={32} className="h-12 min-w-0 flex-1 bg-transparent px-3 font-mono-brand text-sm text-[var(--ink)] outline-none" /></div></label>}<RecaptchaWidget onTokenChange={setRecaptchaToken} refreshKey={recaptchaRefreshKey} /><button type="submit" disabled={isSubmitting || !recaptchaToken} className="group flex h-14 w-full items-center justify-between rounded-[4px] bg-[var(--signal)] px-5 text-left font-bold text-[#fffaf4] shadow-[4px_4px_0_var(--ink)] transition duration-180 hover:-translate-y-0.5 hover:shadow-[6px_6px_0_var(--ink)] disabled:cursor-not-allowed disabled:opacity-50 active:translate-y-0 active:scale-[.98] active:shadow-[2px_2px_0_var(--ink)]"><span>{submitLabel}</span>{isSubmitting ? <LoaderCircle className="size-5 animate-spin" /> : <ArrowUpRight className="size-5 transition-transform duration-180 group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />}</button>{isSubmitting && <p role="status" aria-live="polite" className="flex items-center gap-2 font-mono-brand text-[10px] font-medium uppercase tracking-[.13em] text-[var(--ink-soft)]"><LoaderCircle className="size-3 animate-spin text-[var(--signal)]" />memeriksa anti-spam dan menyimpan rute</p>}</form>{result && <div className="mt-6 border-t border-[var(--line)] pt-5 motion-safe:animate-[result-in_220ms_cubic-bezier(.23,1,.32,1)]"><div className="mb-3 flex items-center gap-2 font-mono-brand text-[10px] font-medium uppercase tracking-[.16em] text-[var(--ink-soft)]"><Check className="size-3.5 text-[var(--signal)]" strokeWidth={3} />tautan aktif</div><div className="flex flex-col gap-2 rounded-[4px] border border-[var(--ink)] bg-[var(--canvas)] p-2.5 sm:flex-row sm:items-center"><a href={result.shortUrl} target="_blank" rel="noreferrer" className="min-w-0 flex-1 truncate px-2 py-2 font-mono-brand text-sm font-medium text-[var(--ink)] underline decoration-[var(--signal)] decoration-2 underline-offset-4">{result.shortUrl}</a><button type="button" onClick={() => copyShortUrl(result.shortUrl, true)} className={`group/copy inline-flex h-10 shrink-0 items-center justify-center gap-2 rounded-[3px] px-3 font-mono-brand text-[11px] font-bold transition duration-180 active:scale-[.97] ${copyWasSuccessful ? "bg-[var(--sage)] text-[var(--ink)] shadow-[2px_2px_0_var(--ink)]" : copyState === "error" ? "bg-[var(--signal)] text-[#fffaf4]" : "bg-[var(--ink)] text-[var(--paper)] hover:bg-[var(--signal)]"}`} aria-label="Copy to Clipboard" title="Copy to Clipboard" aria-live="polite">{copyWasSuccessful ? <Check className="size-4 motion-safe:animate-[stamp-in_220ms_cubic-bezier(.23,1,.32,1)]" strokeWidth={3} /> : <Copy className="size-4" />}<span>{copyWasSuccessful ? "Tersalin!" : copyState === "error" ? "Coba lagi" : "Copy to Clipboard"}</span></button></div><p className="mt-3 truncate font-mono-brand text-[11px] text-[var(--ink-soft)]">→ {result.originalUrl}</p><QrCodeCard shortCode={result.shortCode} shortUrl={result.shortUrl} /><Link href={`/insight/${result.shortCode}`} className="mt-5 inline-flex items-center gap-1.5 font-mono-brand text-[11px] font-medium text-[var(--ink)] underline decoration-[var(--signal)] decoration-2 underline-offset-4 transition hover:text-[var(--signal)]">Lihat catatan klik<ArrowUpRight className="size-3.5" /></Link></div>}{historyReady && <RecentLinkHistory items={recentLinks} onCopy={(url) => copyShortUrl(url)} onClear={() => { setRecentLinks([]); toast.success("Riwayat lokal dibersihkan."); }} />}</section>;
}
