"use client";

import { useLanguage } from "@/lib/i18n/LanguageProvider";
import type { Locale } from "@/lib/i18n/translations";
import { cn } from "@/lib/utils";

const OPTIONS: { value: Locale; label: string }[] = [
  { value: "ko", label: "한국어" },
  { value: "en", label: "English" },
];

// Two explicit text-labeled buttons (not a single ambiguous icon toggle) so
// the current selection is never conveyed by color alone.
export function LanguageToggle() {
  const { locale, setLocale } = useLanguage();

  return (
    <div role="group" aria-label="Language" className="flex items-center gap-0.5 rounded-md border p-0.5 text-xs">
      {OPTIONS.map((opt) => (
        <button
          key={opt.value}
          type="button"
          aria-pressed={locale === opt.value}
          onClick={() => setLocale(opt.value)}
          className={cn(
            "rounded-[4px] px-2 py-1 font-medium transition-colors",
            locale === opt.value
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
