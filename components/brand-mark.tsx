/* Signal Ledger component: a geometric lowercase wordmark with a tangerine connection point is the first clear brand signal. */
import Image from "next/image";
import Link from "next/link";

export function BrandMark({ compact = false }: { compact?: boolean }) {
  return (
    <Link href="/" className="group inline-flex items-center gap-3 rounded-sm" aria-label="Pendek — beranda">
      <span className="relative grid size-11 shrink-0 place-items-center overflow-hidden rounded-[8px] border border-[var(--ink)] bg-[var(--paper)] shadow-[3px_3px_0_var(--signal)]">
        <Image src="/manus-storage/pendek-logo-mark_e4f472f2.png" alt="Mark Pendek" width={44} height={44} className="absolute inset-0 size-full object-cover" priority />
        <span aria-hidden className="relative z-10 flex h-5 w-6 items-center justify-between opacity-0"><i className="size-3 rounded-full border-2 border-[var(--ink)]" /><i className="size-3 rounded-full border-2 border-[var(--signal)]" /></span>
      </span>
      {!compact && <span className="flex items-baseline font-mono-brand text-[1.2rem] font-medium tracking-[-0.15em] text-[var(--ink)]"><span>pend</span><i className="mx-[2px] inline-block size-[6px] rounded-full bg-[var(--signal)]" /><span>ek</span></span>}
    </Link>
  );
}
