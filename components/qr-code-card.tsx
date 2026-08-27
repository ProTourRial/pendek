/* Signal Ledger component: a generated visual route is presented as a compact, downloadable archival card. */
"use client";

import { Download, LoaderCircle, QrCode } from "lucide-react";
import QRCode from "qrcode";
import { useEffect, useState } from "react";

type QrCodeCardProps = {
  shortCode: string;
  shortUrl: string;
};

export function QrCodeCard({ shortCode, shortUrl }: QrCodeCardProps) {
  const [dataUrl, setDataUrl] = useState<string | null>(null);
  const [hasError, setHasError] = useState(false);

  useEffect(() => {
    let active = true;
    setDataUrl(null);
    setHasError(false);

    QRCode.toDataURL(shortUrl, {
      errorCorrectionLevel: "M",
      margin: 1,
      width: 512,
      color: { dark: "#173A34", light: "#F4F0E8" },
    })
      .then((value) => {
        if (active) setDataUrl(value);
      })
      .catch(() => {
        if (active) setHasError(true);
      });

    return () => {
      active = false;
    };
  }, [shortUrl]);

  return (
    <div className="mt-5 grid gap-4 border border-[var(--line)] bg-[var(--paper-deep)] p-3 sm:grid-cols-[120px_1fr] sm:items-center">
      <div className="grid aspect-square place-items-center border border-[var(--line)] bg-[var(--paper)] p-2 shadow-[3px_3px_0_color-mix(in_srgb,var(--ink)_12%,transparent)]">
        {dataUrl ? (
          <img src={dataUrl} alt={`QR code untuk ${shortUrl}`} width={104} height={104} className="size-[104px]" />
        ) : (
          <div className="grid size-[104px] place-items-center text-[var(--ink-soft)]">
            {hasError ? <QrCode className="size-8" /> : <LoaderCircle className="size-6 animate-spin" />}
          </div>
        )}
      </div>
      <div className="min-w-0 py-1">
        <p className="font-mono-brand text-[10px] font-medium uppercase tracking-[0.16em] text-[var(--ink-soft)]">rute / scan</p>
        <p className="mt-2 text-sm font-bold text-[var(--ink)]">Pindai untuk membuka tautan.</p>
        <p className="mt-1 font-mono-brand text-[11px] text-[var(--ink-soft)]">PNG · 512 × 512 px</p>
        {dataUrl ? (
          <a
            href={dataUrl}
            download={`pendek-${shortCode}-qr.png`}
            className="mt-4 inline-flex items-center gap-2 border-b-2 border-[var(--signal)] pb-1 font-mono-brand text-[11px] font-medium text-[var(--ink)] transition hover:text-[var(--signal)]"
          >
            <Download className="size-3.5" />
            Unduh QR PNG
          </a>
        ) : (
          <span className="mt-4 inline-flex items-center gap-2 font-mono-brand text-[11px] text-[var(--ink-soft)]">
            {hasError ? "QR belum dapat dibuat." : "Menyiapkan QR..."}
          </span>
        )}
      </div>
    </div>
  );
}
