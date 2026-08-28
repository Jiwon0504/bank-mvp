"use client";

import { useSyncExternalStore } from "react";
import { useTheme } from "next-themes";
import { cn } from "@/lib/utils";

const OPTIONS: { value: "light" | "dark"; label: string }[] = [
  { value: "light", label: "Light" },
  { value: "dark", label: "Dark" },
];

const noopSubscribe = () => () => {};

// Standard hydration-safe "is this the client, post-mount" read: the server
// snapshot is `false`, the client snapshot is `true`, so the very first
// client render matches the server exactly (no theme-dependent styling) and
// then corrects itself — without the classic effect+setState pattern.
function useIsMounted(): boolean {
  return useSyncExternalStore(noopSubscribe, () => true, () => false);
}

// Two explicit text-labeled buttons, matching LanguageToggle's shape, so
// current mode is never conveyed by color alone.
export function ThemeToggle() {
  const { theme, setTheme } = useTheme();
  const mounted = useIsMounted();

  const current = mounted ? theme : undefined;

  return (
    <div role="group" aria-label="Theme" className="flex items-center gap-0.5 rounded-md border p-0.5 text-xs">
      {OPTIONS.map((opt) => (
        <button
          key={opt.value}
          type="button"
          aria-pressed={current === opt.value}
          aria-label={`${opt.label} mode`}
          onClick={() => setTheme(opt.value)}
          className={cn(
            "rounded-[4px] px-2 py-1 font-medium transition-colors",
            current === opt.value
              ? "bg-foreground text-background"
              : "text-muted-foreground hover:text-foreground"
          )}
        >
          {opt.label}
        </button>
      ))}
    </div>
  );
}
