import Link from "next/link";
import { cn } from "@/lib/utils";
import { DEMO_STEPS } from "@/lib/demoSteps";

// A pure, server-rendered progress rail — no client JS / scroll-spy.
// `active` marks which step(s) belong to the current page so a presenter
// always knows "where am I in the story." Styled as a plain numbered
// sequence (like a document review checklist), not a colorful stepper —
// this sits inside a real-looking risk system, not a product tour.
export function DemoProgress({ active }: { active: number[] }) {
  return (
    <div className="flex items-center gap-0 overflow-x-auto border-b py-2 text-xs">
      {DEMO_STEPS.map((s, i) => {
        const isActive = active.includes(s.n);
        return (
          <div key={s.n} className="flex items-center">
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
                {s.n}
              </span>
              {s.label}
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

export function NextStepLink({ href, label }: { href: string; label: string }) {
  return (
    <Link
      href={href}
      className="mt-3 inline-flex items-center gap-1 text-sm font-medium text-foreground hover:underline"
    >
      다음: {label} →
    </Link>
  );
}
