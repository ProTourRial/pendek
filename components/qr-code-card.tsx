/* Signal Ledger component: QR customization stays local in the browser, preserving the product’s precise route-card language. */
"use client";

import { Download, ImagePlus, LoaderCircle, QrCode, RotateCcw, X } from "lucide-react";
import QRCode from "qrcode";
import { ChangeEvent, useEffect, useId, useState } from "react";

type QrCodeCardProps = { shortCode: string; shortUrl: string };
const COLOR_PRESETS = ["#173A34", "#0B3A66", "#5A2A5F", "#3C4C25"];
const QR_SIZE = 1024;

function loadImage(source: string) {
  return new Promise<HTMLImageElement>((resolve, reject) => {
    const image = new Image();
    image.onload = () => resolve(image);
    image.onerror = reject;
    image.src = source;
  });
}

export function QrCodeCard({ shortCode, shortUrl }: QrCodeCardProps) {
  const [dataUrl, setDataUrl] = useState<string | null>(null);
  const [hasError, setHasError] = useState(false);
  const [foreground, setForeground] = useState(COLOR_PRESETS[0]);
  const [logoUrl, setLogoUrl] = useState<string | null>(null);
  const [logoError, setLogoError] = useState<string | null>(null);
  const fileInputId = useId();

  useEffect(() => {
    let active = true;
    setDataUrl(null); setHasError(false);
    async function renderQr() {
      try {
        const qrImage = await loadImage(await QRCode.toDataURL(shortUrl, { errorCorrectionLevel: "H", margin: 2, width: QR_SIZE, color: { dark: foreground, light: "#F4F0E8" } }));
        const canvas = document.createElement("canvas");
        canvas.width = QR_SIZE; canvas.height = QR_SIZE;
        const context = canvas.getContext("2d");
        if (!context) throw new Error("Canvas tidak tersedia.");
        context.drawImage(qrImage, 0, 0, QR_SIZE, QR_SIZE);
        if (logoUrl) {
          const logo = await loadImage(logoUrl);
          const plateSize = Math.round(QR_SIZE * 0.23); const logoSize = Math.round(QR_SIZE * 0.16);
          const plateX = (QR_SIZE - plateSize) / 2; const plateY = (QR_SIZE - plateSize) / 2;
          context.fillStyle = "#F4F0E8"; context.fillRect(plateX, plateY, plateSize, plateSize);
          context.drawImage(logo, (QR_SIZE - logoSize) / 2, (QR_SIZE - logoSize) / 2, logoSize, logoSize);
        }
        if (active) setDataUrl(canvas.toDataURL("image/png"));
      } catch { if (active) setHasError(true); }
    }
    void renderQr();
    return () => { active = false; };
  }, [foreground, logoUrl, shortUrl]);

  function handleLogoChange(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith("image/")) { setLogoError("Pilih file gambar PNG, JPG, atau WebP."); return; }
    if (file.size > 1_000_000) { setLogoError("Ukuran logo maksimal 1 MB."); return; }
    const reader = new FileReader();
    reader.onload = () => { setLogoUrl(typeof reader.result === "string" ? reader.result : null); setLogoError(null); };
    reader.onerror = () => setLogoError("Logo tidak dapat dibaca.");
    reader.readAsDataURL(file);
    event.target.value = "";
  }

  return <div className="mt-5 border border-[var(--line)] bg-[var(--paper-deep)] p-3"><div className="grid gap-4 sm:grid-cols-[140px_1fr] sm:items-start"><div className="grid aspect-square place-items-center border border-[var(--line)] bg-[var(--paper)] p-2 shadow-[3px_3px_0_color-mix(in_srgb,var(--ink)_12%,transparent)]">{dataUrl ? <img src={dataUrl} alt={`QR code untuk ${shortUrl}`} width={124} height={124} className="size-[124px]" /> : <div className="grid size-[124px] place-items-center text-[var(--ink-soft)]">{hasError ? <QrCode className="size-8" /> : <LoaderCircle className="size-6 animate-spin" />}</div>}</div><div className="min-w-0 py-1"><p className="font-mono-brand text-[10px] font-medium uppercase tracking-[.16em] text-[var(--ink-soft)]">rute / scan kustom</p><p className="mt-2 text-sm font-bold text-[var(--ink)]">Pindai untuk membuka tautan.</p><p className="mt-1 font-mono-brand text-[11px] text-[var(--ink-soft)]">PNG · 1024 × 1024 px · logo hanya di perangkat ini</p>{dataUrl ? <a href={dataUrl} download={`pendek-${shortCode}-qr.png`} className="mt-4 inline-flex items-center gap-2 border-b-2 border-[var(--signal)] pb-1 font-mono-brand text-[11px] font-medium text-[var(--ink)] transition hover:text-[var(--signal)]"><Download className="size-3.5" />Unduh QR PNG</a> : <span className="mt-4 inline-flex items-center gap-2 font-mono-brand text-[11px] text-[var(--ink-soft)]">{hasError ? "QR belum dapat dibuat." : "Merangkai QR..."}</span>}</div></div><div className="mt-5 grid gap-4 border-t border-[var(--line)] pt-4 sm:grid-cols-2"><label className="block"><span className="font-mono-brand text-[10px] font-medium uppercase tracking-[.14em] text-[var(--ink-soft)]">warna rute</span><span className="mt-2 flex items-center gap-2"><input type="color" value={foreground} onChange={(event) => setForeground(event.target.value)} className="size-9 cursor-pointer rounded-[3px] border border-[var(--line)] bg-transparent p-1" aria-label="Pilih warna QR code" /><input value={foreground.toUpperCase()} onChange={(event) => /^#[0-9A-Fa-f]{6}$/.test(event.target.value) && setForeground(event.target.value)} maxLength={7} className="h-9 w-28 border-b border-[var(--line)] bg-transparent font-mono-brand text-xs text-[var(--ink)] outline-none focus:border-[var(--signal)]" /></span><span className="mt-2 flex gap-2">{COLOR_PRESETS.map((color) => <button key={color} type="button" onClick={() => setForeground(color)} className={`size-5 rounded-full border-2 transition active:scale-90 ${foreground === color ? "border-[var(--signal)] scale-110" : "border-[var(--paper)]"}`} style={{ backgroundColor: color }} aria-label={`Pilih warna ${color}`} />)}</span></label><div><span className="font-mono-brand text-[10px] font-medium uppercase tracking-[.14em] text-[var(--ink-soft)]">logo tengah opsional</span><div className="mt-2 flex items-center gap-2">{logoUrl ? <><img src={logoUrl} alt="Pratinjau logo QR" className="size-9 rounded-[3px] border border-[var(--line)] object-cover" /><button type="button" onClick={() => setLogoUrl(null)} className="inline-flex h-9 items-center gap-1.5 border-b-2 border-[var(--signal)] px-1 font-mono-brand text-[11px] font-medium text-[var(--ink)] transition hover:text-[var(--signal)]"><RotateCcw className="size-3.5" />hapus</button></> : <label htmlFor={fileInputId} className="inline-flex h-9 items-center gap-2 rounded-[3px] border border-[var(--line)] bg-[var(--paper)] px-3 font-mono-brand text-[11px] font-medium text-[var(--ink)] transition hover:border-[var(--signal)] hover:text-[var(--signal)]"><ImagePlus className="size-3.5" />unggah logo<input id={fileInputId} type="file" accept="image/png,image/jpeg,image/webp" onChange={handleLogoChange} className="sr-only" /></label>}</div>{logoError && <p className="mt-2 text-xs text-[var(--signal)]">{logoError}</p>}<p className="mt-2 text-xs leading-5 text-[var(--ink-soft)]">Gunakan logo sederhana; koreksi error tingkat tinggi menjaga QR tetap mudah dipindai.</p></div></div></div>;
}
