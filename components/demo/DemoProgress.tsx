import Link from "next/link";
import { cn } from "@/lib/utils";

// A pure, server-rendered progress rail — no client JS / scroll-spy.
// `active` marks which step(s) belong to the current page so a presenter
// always knows "where am I in the story." Styled as a plain numbered
// sequence (like a document review checklist), not a colorful stepper —
// this sits inside a real-looking risk system, not a product tour.
//
// `steps` is passed in (translated) by the caller rather than imported
// here, so this stays a plain Server Component — the caller already has
// the server-resolved translation dictionary.
export function DemoProgress({
  active,
  steps,
}: {
  active: number[];
  steps: readonly string[];
}) {
  return (
    <div className="flex items-center gap-0 overflow-x-auto border-b py-2 text-xs">
      {steps.map((label, i) => {
        const n = i + 1;
        const isActive = active.includes(n);
        return (
          <div key={n} className="flex items-center">
            {i > 0 && <span className="mx-2 h-px w-3 bg-border" />}
            <span
              className={cn(
                "flex items-center gap-1.5 whitespace-nowrap",
                isActive ? "font-semibold text-foreground" : "text-muted-foreground"
              )}
            >
              <span
                className={cn(
                  "flex size-4 items-center justify-center rounded-full border text-[10px]",
                  isActive ? "border-foreground bg-foreground text-background" : "border-border"
                )}
              >
                {n}
              </span>
              {label}
            </span>
          </div>
        );
      })}
    </div>
  );
}

export function StepBadge({ n }: { n: number }) {
  return (
    <span className="mr-2 inline-flex size-5 items-center justify-center rounded-full border border-foreground/30 text-[10px] font-semibold text-muted-foreground">
      {n}
    </span>
  );
}

// `label` is the fully-composed, already-translated string (e.g. "다음: ... →"
// / "Next: ... →") — this component stays presentation-only.
export function NextStepLink({ href, label }: { href: string; label: string }) {
  return (
    <Link
      href={href}
      className="mt-3 inline-flex items-center gap-1 text-sm font-medium text-foreground hover:underline"
    >
      {label}
    </Link>
  );
}
