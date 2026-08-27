/* Signal Ledger component: every major moment gets a visible route, node, and endpoint rather than generic decoration. */
import { ArrowRight } from "lucide-react";

export function RouteSignal({ label, className = "" }: { label: string; className?: string }) {
  return (
    <div className={`flex items-center gap-2 font-mono-brand text-[9px] font-medium uppercase tracking-[0.18em] text-[var(--ink-soft)] ${className}`}>
      <span className="grid size-4 shrink-0 place-items-center rounded-full border border-[var(--signal)] bg-[var(--paper)]"><span className="size-1.5 rounded-full bg-[var(--signal)]" /></span>
      <span className="routing-line route-pulse h-px min-w-7 flex-1" />
      <ArrowRight className="size-3.5 shrink-0 text-[var(--signal)]" strokeWidth={1.8} />
      <span>{label}</span>
    </div>
  );
}
