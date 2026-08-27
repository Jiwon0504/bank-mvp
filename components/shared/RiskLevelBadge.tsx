import type { RiskLevel } from "@/lib/types";
import { RISK_STYLE } from "@/lib/riskStyle";
import { cn } from "@/lib/utils";

// A small severity dot + label rather than a filled color pill — reads as
// a risk indicator in a review system, not a marketing badge.
export function RiskLevelBadge({ level, className }: { level: RiskLevel; className?: string }) {
  const style = RISK_STYLE[level];
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 text-xs font-semibold tracking-wide",
        style.text,
        className
      )}
    >
      <span className={cn("size-1.5 rounded-full", style.dot)} />
      {style.label}
    </span>
  );
}
