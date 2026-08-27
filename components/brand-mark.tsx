/* Signal Ledger component: a geometric lowercase wordmark with a tangerine connection point is the first clear brand signal. */
import Link from "next/link";

export function BrandMark({ compact = false }: { compact?: boolean }) {
  return (
    <Link href="/" className="group inline-flex items-center gap-3 rounded-sm" aria-label="Pendek — beranda">
      <span aria-hidden className="relative grid size-11 shrink-0 place-items-center overflow-hidden rounded-[8px] border border-[var(--ink)] bg-[var(--paper)] shadow-[3px_3px_0_var(--signal)]"><span className="relative z-10 flex h-5 w-7 items-center justify-between"><i className="size-4 rounded-full border-[3px] border-[var(--ink)]" /><i className="size-4 rounded-full border-[3px] border-[var(--signal)]" /><b className="absolute left-[15px] h-[3px] w-3 bg-[var(--ink)]" /></span></span>
      {!compact && <span className="flex items-baseline font-mono-brand text-[1.2rem] font-medium tracking-[-0.15em] text-[var(--ink)]"><span>pend</span><i className="mx-[2px] inline-block size-[6px] rounded-full bg-[var(--signal)]" /><span>ek</span></span>}
    </Link>
  );
}
