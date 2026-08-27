/* Signal Ledger component: verification is presented as a calm gate in the routing workspace, never a disruptive interruption. */
"use client";

import Script from "next/script";
import { ShieldCheck } from "lucide-react";
import { useEffect, useRef, useState } from "react";

type RecaptchaWidgetProps = {
  onTokenChange: (token: string | null) => void;
  refreshKey: number;
};

type Grecaptcha = {
  render: (container: HTMLElement, parameters: Record<string, unknown>) => number;
  reset: (widgetId?: number) => void;
};

declare global {
  interface Window {
    grecaptcha?: Grecaptcha;
  }
}

export function RecaptchaWidget({ onTokenChange, refreshKey }: RecaptchaWidgetProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const widgetIdRef = useRef<number | null>(null);
  const [scriptReady, setScriptReady] = useState(false);
  const [loadError, setLoadError] = useState(false);
  const siteKey = process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY;

  useEffect(() => {
    if (!scriptReady || !siteKey || !window.grecaptcha || !containerRef.current || widgetIdRef.current !== null) return;

    widgetIdRef.current = window.grecaptcha.render(containerRef.current, {
      sitekey: siteKey,
      theme: "light",
      size: "normal",
      callback: (token: string) => onTokenChange(token),
      "expired-callback": () => onTokenChange(null),
      "error-callback": () => {
        onTokenChange(null);
        setLoadError(true);
      },
    });
  }, [onTokenChange, scriptReady, siteKey]);

  useEffect(() => {
    if (!refreshKey || widgetIdRef.current === null || !window.grecaptcha) return;
    window.grecaptcha.reset(widgetIdRef.current);
    onTokenChange(null);
  }, [onTokenChange, refreshKey]);

  if (!siteKey) {
    return <div className="flex items-center gap-3 border border-dashed border-[var(--line)] bg-[var(--paper-deep)] px-4 py-3 text-sm text-[var(--ink-soft)]"><ShieldCheck className="size-4 shrink-0 text-[var(--signal)]" />Proteksi anti-spam sedang disiapkan.</div>;
  }

  return (
    <div className="border border-[var(--line)] bg-[var(--paper-deep)] p-3">
      <div className="mb-3 flex items-center gap-2 font-mono-brand text-[10px] font-medium uppercase tracking-[.14em] text-[var(--ink-soft)]"><ShieldCheck className="size-3.5 text-[var(--signal)]" />verifikasi sebelum merangkai</div>
      <Script src="https://www.google.com/recaptcha/api.js?render=explicit" strategy="afterInteractive" onLoad={() => setScriptReady(true)} onError={() => setLoadError(true)} />
      <div ref={containerRef} className="min-h-[78px]" />
      {loadError && <p className="mt-2 text-xs leading-5 text-[var(--signal)]">Verifikasi tidak dapat dimuat. Periksa koneksi Anda, lalu segarkan halaman.</p>}
    </div>
  );
}
