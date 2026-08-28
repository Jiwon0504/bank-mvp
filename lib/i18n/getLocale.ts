import { cookies } from "next/headers";
import { DEFAULT_LOCALE, LOCALE_COOKIE, type Locale } from "./translations";

// Server-only: reads the persisted locale preference from a plain
// (non-httpOnly) cookie so Server Components render the right language on
// the very first byte — no flash, no hydration mismatch. The cookie is
// written client-side by LanguageProvider when the user toggles language.
export async function getServerLocale(): Promise<Locale> {
  const store = await cookies();
  const value = store.get(LOCALE_COOKIE)?.value;
  return value === "en" ? "en" : DEFAULT_LOCALE;
}
