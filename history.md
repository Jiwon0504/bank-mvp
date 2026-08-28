# Project History

Changelog of significant work on the Credit Risk Control Tower demo. Newest entries first.

## 2026-08-28 — AI Assistant (Claude API, free-form Q&A)

Goal: let an RM ask an open-ended natural-language question about one borrower and get a real
Claude-generated answer, grounded in that borrower's actual mock data — the last of the three
items the business-gap review's TOP-5 list had flagged as unimplemented (AI Assistant,
Investigation close-out workflow — done the previous session — and Model Risk Override, still
outstanding).

**What changed**

- **`lib/aiAssistant.ts` (new)** — `buildCompanyContext(companyId)` renders everything the app
  already tracks about one borrower (profile, EWS score history, financial statements, loans,
  `detectRiskSignals()` output, the portfolio-scan EWS-vs-Connected comparison, related companies,
  counterparties, news, related external events, the Risk Signal Timeline, RM notes,
  cross-institution exposure, and any Investigation/Human-in-the-loop/Action history) into one
  plain-text context block, using the exact same repository/`lib/riskSignals.ts`/`lib/riskScan.ts`
  functions the rest of the UI calls — the assistant's view of a company can't drift from what's
  on screen. Also exports `ASSISTANT_SYSTEM_PROMPT`, which scopes the model to decision *support*
  (never a credit decision or a fraud/default assertion), instructs it to answer only from the
  supplied context and say so when the context doesn't cover the question, and to cite concrete
  figures rather than generalities. Deliberately a separate module from `lib/riskAnalysis.ts` (the
  existing rule-based Investigation Summary, whose own docstring already earmarks it as "a
  deterministic placeholder for the future Claude-powered Investigation Summary") — that is a
  fixed 6-section report shape and a different, already-shipped feature; this is open-ended chat,
  so it gets its own module rather than overloading that one.
- **`app/api/assistant/route.ts` (new)** — the only place in the app that calls the Anthropic SDK.
  `POST { companyId, question, locale, history }` -> builds the context, calls
  `claude-opus-5` with `ASSISTANT_SYSTEM_PROMPT` + the per-company context as `system` (the context
  block is cache-tagged with `cache_control: {type: "ephemeral"}` so a second question about the
  same company within the TTL reuses it), appends prior turns + the new question (with an explicit
  "respond in Korean/English" instruction matching the current UI locale) as `messages`, and
  returns `{ answer }`. Typed error handling per the Anthropic SDK's exception hierarchy
  (`AuthenticationError` -> `RateLimitError` -> `APIError`) instead of string-matching.
- **`components/investigation/AiAssistant.tsx` (new)** — client component (needs local chat state),
  mounted in a new "AI Assistant" Card on the Investigation page, right after the existing
  rule-based "AI Investigation Summary" card so the two are visibly distinct (one is
  `System-generated reference`, the other `Powered by Claude`). Keeps the running Q&A thread in
  component state only — same in-memory-only convention as everything else in this demo, resets on
  navigation/refresh. Enter submits (Shift+Enter for a newline); the component itself never touches
  the Anthropic SDK, it only calls the Route Handler above.
- **`lib/i18n/translations.ts`**: new `investigation.assistant` dictionary (title, disclaimer,
  placeholder, send/sending labels, empty state, error prefix, user/assistant labels) in both
  `ko`/`en` — UI chrome, not model output; the model's own answers are generated per-request and
  intentionally not run through the translation layer (the route handler asks Claude to answer in
  whichever language the current UI locale is, rather than translating a fixed string).
- Installed `@anthropic-ai/sdk`. The Route Handler constructs a bare `new Anthropic()`, which
  resolves credentials from the environment (`ANTHROPIC_API_KEY` / `ANTHROPIC_AUTH_TOKEN` / an
  `ant auth login` profile) — no key is hardcoded or committed anywhere.

**Verification**

- `npx tsc --noEmit`, `npx eslint .`, and `npm run build` all clean; new `/api/assistant` route
  appears in the build's route list.
- Full route sweep (all 4 scenario companies) in both `ko`/`en`, 200 with no error markers; the new
  card renders with the correct locale's button/label text in both.
- Exercised the live endpoint directly against the real Claude API (not mocked): asked 세림테크-
  specific questions in both Korean and English and got answers that correctly cited the actual
  generated figures (매출채권 growth, operating-cash-flow sign flip, the 42% counterparty
  concentration in 도래컴퍼니, the EWS-vs-Connected gap, RM note history) with appropriate hedging
  language, not fabricated numbers. Also confirmed the error paths: missing `companyId`/`question`
  -> 400, unknown `companyId` -> 404.

## 2026-08-28 — Investigation close-out workflow

Goal: give an opened Investigation an actual lifecycle instead of staying OPEN forever —
picks up the backend groundwork already laid the previous session (`updateInvestigationStatus`,
`updateActionStatus`, the bound Server Actions in `actions.ts`, the `InvestigationFindingType`/
`ActionStatus` types) which compiled against translation keys that didn't exist yet
(`lib/i18n/translations.ts` was missing the entire `workflow` dictionary and three `action` keys
— `tsc` failed on exactly those two spots before this session started).

**What changed**

- **`lib/i18n/translations.ts`**: added the missing `action.updatedBannerPrefix` /
  `action.statusStart` / `action.statusComplete` and the full `investigation.workflow` dictionary
  (status label, start button, close-out form labels/placeholders, the 5 `InvestigationFindingType`
  labels, closed-summary strings) to both `ko` and `en` — the interface already declared these,
  only the value objects were incomplete.
- **`components/investigation/InvestigationWorkflow.tsx` (new)**: renders whichever step of
  OPEN → IN_PROGRESS → CLOSED is currently valid for the company's latest Investigation — a
  "start" button while OPEN, the close-out form (finding-type select + optional detail + required
  final judgment) while IN_PROGRESS, and a read-only closed summary once CLOSED. The IN_PROGRESS
  view also recaps every Human-in-the-loop judgment recorded so far (`evidenceTitle`/
  `evidenceEmpty`), so the RM has that context in view right above the field where they write the
  final judgment. Same "plain native `<select>`/`<textarea>` posting straight to a Server Action"
  shape as the existing `HumanReviewForm`, deliberately not a new pattern.
- **`app/investigation/[companyId]/page.tsx`**: new Investigation-status Card (using the component
  above) placed right before the Human-in-the-loop card; reads a new `investigationStatus` search
  param for its confirmation banner. The Action list now shows a status Badge plus a
  next-step button per Action (진행 시작 while PENDING, 완료 처리 while IN_PROGRESS, nothing once
  DONE) bound to `updateActionStatusAction` the same `.bind()`-per-button way `createActionAction`
  already works; reads a new `actionUpdated` search param for its own banner.

**Note on the confirmation banners**: both `startInvestigationProgressAction` and
`closeInvestigationAction` redirect with a literal `?investigationStatus=<requested status>` —
that param reflects what was *requested*, not a re-read of the post-write state. Since
`updateInvestigationStatus` silently no-ops on an invalid transition or a missing required field
(a deliberate choice from the previous session — "this mock backend has no error-surfacing channel
beyond the confirmation banner"), a request that *should* fail would still show a success-looking
banner. In practice this can't happen through the UI (the transition is only ever offered for the
investigation's actual current status, and `findingType`/`finalJudgment` are `required` on the
form), so it's left as-is rather than adding error UI that no other form in this demo has either.

**Verification**

- `npx tsc --noEmit`, `npx eslint .`, and `npm run build` all clean.
- Full route sweep (all 4 scenario companies) in both `ko` and `en`, 200 with no error markers.
- Exercised the actual state machine via direct HTTP round-trips against the running dev server
  (not just rendering): opened a new Investigation on 도래컴퍼니 (OPEN), transitioned it to
  IN_PROGRESS via the real bound Server Action, confirmed the close-out form and Human-in-the-loop
  evidence recap render for it; separately drove 세림테크's existing IN_PROGRESS Investigation
  (INV-001) all the way to CLOSED with a real `findingType`/`finalJudgment` submission and
  confirmed the closed-summary view renders the right labels; created a new Action and drove it
  PENDING → IN_PROGRESS via its bound status button, confirming the button label and next bound
  status update correctly (완료 처리, bound to DONE) after the first transition. All against the
  in-memory `store` (resets on server restart, confirmed no seed/data files were touched).

## 2026-08-27 — Portfolio-wide Hidden-Risk scan (TOP-5 #1)

Goal (from the business-gap review's TOP-5 list, item #1): stop pre-tagging four scripted
companies as "Hidden Risk Case" and instead run the same Risk Signal detection logic against
every borrower in the portfolio, so the Dashboard surfaces whoever the data actually implicates
— scripted or not.

**What changed**

- **`lib/riskSignals.ts` (new)** — `detectRiskSignals(companyId)`, six uniform, explainable
  detectors run against *any* company's real data:
  1. `AR_OUTPACES_REVENUE` — accounts receivable growing much faster than revenue between a
     company's earliest and latest `FinancialStatement` (>1.5× revenue growth and >20% absolute).
  2. `CASHFLOW_PROFIT_DIVERGENCE` — latest operating cash flow negative while net profit is
     positive.
  3. `COUNTERPARTY_CONCENTRATION` — any single counterparty at ≥35% of sales/purchases (weight
     scales mildly with how far past 35% it is).
  4. `RELATED_PARTY_FUND_MOVEMENT` — has a registered related company **and** at least one
     transaction actually tagged as a related-party fund flow (category containing "관계사") —
     having a related company alone isn't a signal; money moving between them is.
  5. `EXTERNAL_EVENT_EXPOSURE` — reuses the existing `getExternalEventsRelatedToCompany` (same
     function the Investigation page's External Event card uses); a same-industry-only match
     scores low (8), a match via a named related company/counterparty scores higher (15).
  6. `NEGATIVE_NEWS` — any NEGATIVE-sentiment news item about the company.
  Every fired signal carries a Korean explanation citing the actual figures (e.g. "매출은 5%
  증가했으나 매출채권은 27% 증가...") — this is generated data output, same convention as
  `lib/riskAnalysis.ts`'s existing prose, so it isn't translated by the language switcher either.
- **`lib/riskScan.ts` (new)** — `scanCompany()` sums the fired signals' weights into a capped
  0-100 "Connected Risk Score", maps it to LOW/MEDIUM/HIGH/CRITICAL with the *same thresholds*
  `riskLevelFromScore` already uses for EWS, and compares that Connected Level against the
  company's existing EWS Level. A company is a **priority Investigation candidate** only when:
  EWS currently reads LOW/MEDIUM (a HIGH/CRITICAL EWS company is already flagged, not "hidden"),
  the connected view is strictly more severe (`gapRank >= 1`), there's no delinquency (a
  delinquent loan is already visible the traditional way), and at least one real signal fired.
  `scanPortfolio()` runs this over `getAllCompanies()` — all 34, no exceptions.
- **Removed the tag-based path entirely**: `Company.tags` no longer carries `"HIDDEN_RISK_CASE"`
  anywhere in `data/companies.ts`; `getHiddenRiskCaseCompanies()` is deleted from
  `companyRepository.ts`. `app/companies/[id]/page.tsx` and `app/investigation/[companyId]/page.tsx`
  now compute `isHiddenRiskCase` via `scanCompany(company).isPriorityCandidate` instead of reading
  a tag — the guided 9-step walkthrough (DemoProgress, the "정상 여신인데..." nudge, etc.) now
  activates for whichever companies the scan actually flags, scripted or not.
- **Dashboard (`app/page.tsx`, `lib/repository/dashboardRepository.ts`)**: added
  `portfolioScan`, `detectedSignalCount`, `priorityCandidates` to `DashboardSummary`. Two new
  KPI tiles ("우선 Investigation 대상", "탐지된 Risk Signal 수") alongside the existing four. The
  old single-company "Hidden Risk Case" card is replaced with a **Priority Investigation
  Candidates** section listing every flagged company with its EWS vs. Connected score/level side
  by side and the full bullet list of *why* (the signal explanations). The full borrower table
  gained "Connected Risk" / "Connected Score" columns and is now sorted by `gapRank` (biggest
  EWS-vs-connected gap first) instead of raw EWS score — that's the "Risk 우선순위 Ranking" step
  of the requested flow. Clicking any row/candidate goes to the existing Company 360 page,
  unchanged.
- **One deliberate, non-random mock-data addition** (`data/counterparties.ts`): 미래푸드
  (CMP-013)'s largest counterparty concentration is nudged from its randomly-generated 11% to
  45%, with `annualTransactionVolume` recomputed via the exact same `annualRevenue × concentration`
  formula already used for every other counterparty. This guarantees the demo reliably shows at
  least one clean, single-signal organic case beyond the scripted group — no tag, no special-case
  branch anywhere, the scan finds it purely because the number itself now clears 35%.
- **Bug fix, discovered while building this** (`data/financials.ts`): `floatBetween()`'s default
  `decimals` is 1, which is fine for wide ranges (e.g. debt ratio 40-220) but was silently
  quantizing narrow ratio ranges — operating-margin (0.02-0.12) rounds to just two buckets (0.0 or
  0.1), which forced `operatingProfit` (and therefore `netProfit`/`operatingCashFlow`) to exactly
  0 for roughly **a third of all 30 generic companies**, and the accounts-receivable ratio
  (0.15-0.3) to effectively two values (20% or 30%) instead of a real spread. Added explicit
  `decimals: 3` to those four `floatBetween()` calls. Verified via a temporary debug endpoint
  (removed before finishing) that this fully eliminated the degenerate zero-rows and gave every
  company non-degenerate, differentiable figures — without this fix, the new scan's financial
  signals would have been meaningless for a third of the portfolio.

**Why this design**

- Signal detection needed to be *the same function* run over every company, not different logic
  for "the scripted ones" vs "everyone else" — otherwise "no pre-tagging" would just move the
  special-casing from a data tag into code.
- The EWS-vs-Connected **gap** (not the connected score alone) is what makes a company "hidden."
  A company already at EWS HIGH/CRITICAL isn't hidden even if the connected score also lands
  high — it's just correctly flagged already. This is why 도래컴퍼니, despite being a real
  character in the scripted narrative (via `EVT-003` and negative news), does **not** appear as
  its own priority candidate: its EWS (46, MEDIUM) roughly matches what the connected signals
  independently suggest (~23, LOW) — there's no gap to surface, and that's the correct
  output, not a missing case.
- Weights were picked so a single strong, unambiguous signal is sufficient (concentration ≥35%,
  or the AR/cash-flow pair together) to cross a level boundary, while one weak, broad signal
  (same-industry-only external-event exposure, worth 8) alone is not — this is why dozens of
  Manufacturing/Energy/Automotive-Parts/Textiles companies pick up a small "Connected: LOW (8)"
  from the FX-rate event without being falsely flagged as priority candidates.
- `lib/riskAnalysis.ts` (the existing per-company Investigation Summary) was deliberately **not**
  refactored to share code with `lib/riskSignals.ts`, even though the checks are conceptually
  similar — this task's brief is additive ("don't break existing features"), and merging them
  would have meant touching a working, already-shipped file's internals for a benefit (avoiding
  some logic duplication) that wasn't asked for. The two modules are intentionally independent.

**Result, verified against the actual generated data**: the scan flags exactly 5 companies as
priority candidates — 하늬산업 (EWS LOW 29 → Connected CRITICAL 90, 4 signals), 세림테크 (MEDIUM 34
→ CRITICAL 100, 4 signals), 청우머티리얼 (MEDIUM 31 → CRITICAL 90, 4 signals) — all three
re-derived purely from their existing data now that the tag is gone — plus two organic
discoveries: 서진산업/CMP-012 (LOW 15 → MEDIUM 38, via a large naturally-occurring AR/revenue
divergence) and 미래푸드/CMP-013 (LOW 26 → MEDIUM 38, via the one deliberate concentration
nudge above). 44 signals fire across the full 34-company portfolio in total; most non-candidate
companies show either zero signals or one weak external-event match that correctly doesn't
change their level.

**Verification**

- `npx tsc --noEmit`, `npx eslint .`, and `npm run build` all clean.
- Full route sweep (all 4 scripted companies + both new organic candidates + a generic company +
  all 3 events) in both `ko` and `en` — all 200, no error markers.
- Confirmed via HTTP round-trip that `/companies/CMP-012` (never tagged) now shows the guided
  "정상 여신으로 관리되고 있으나..." walkthrough, and `/companies/CMP-DR` (도래컴퍼니, previously
  tagged) no longer does — the guide now follows the computed flag, not the old tag.
- Confirmed existing features unaffected: Risk Signal Timeline, Risk Propagation Graph,
  Human-in-the-loop, Cross-Institution Exposure, External Event card, and both the KO/EN and
  Light/Dark switches all still render correctly on the scripted group's pages.
- Explicitly out of scope this round (per instruction): AI Assistant, Investigation
  close-out workflow, and Model Risk Override remain unimplemented.

## 2026-08-27 — Language (KO/EN) switcher and Light/Dark theme

Goal: add a language toggle and a theme toggle to the nav, without touching any Risk
Investigation data/workflow or the existing screen structure.

**Translation architecture**
- `lib/i18n/translations.ts`: single `Dictionary` interface, `ko`/`en` objects covering every
  UI-chrome string — nav, Dashboard (KPIs, chart titles, table columns), Company 360 (all
  section titles, table columns, status text, "why risky" copy), Investigation (Risk Signal
  Timeline, Risk Propagation Graph, Cross-Institution Exposure, External Event, AI Investigation
  Summary section titles, Human-in-the-loop decision labels, Action type labels), External Event
  Impact pages, and the 9-step demo guide labels (folded in from the now-deleted
  `lib/demoSteps.ts`).
- Deliberately does **not** translate synthetic business data: company names, RM notes, news,
  external-event descriptions, risk-timeline narrative text, and the generated AI Investigation
  Summary prose (`lib/riskAnalysis.ts`) all stay in Korean regardless of UI language — that's
  content/data, not interface chrome, and the brief explicitly ruled out touching it.
- Split read path: Server Components (`app/**/page.tsx`) read the locale straight from a cookie
  via `lib/i18n/getLocale.ts` (`getServerLocale()`, using `next/headers` `cookies()`) and index
  into `translations` directly — no context needed. Client components (nav, timeline, graph,
  external-event card, forms) use `lib/i18n/LanguageProvider.tsx`'s `useLanguage()` context so
  their text updates instantly on toggle.
- Toggling calls `document.cookie` (plain `NEXT_LOCALE` cookie, 1yr) then `router.refresh()` —
  Server Components re-render with the new locale on refresh while Client Components already
  updated instantly via context, so both halves land in sync without a full page reload. Cookie
  persists across refresh and navigation; default (no cookie) is Korean.
- `lib/format.ts`'s `formatEok()` gained a `locale` param: Korean shows amounts in 억원 (the
  Korean corporate-lending convention); English shows the same figures as `KRW {millions}M` — no
  literal Korean unit leaking into an English screen. Threaded through every call site (~11
  files). Money embedded inside the Korean-only generated analysis prose intentionally keeps the
  Korean default (that prose isn't translated at all).

**Theme architecture**
- Added `next-themes` (`attribute="class"`, `defaultTheme="light"`, `enableSystem={false}`),
  wraps the app in `app/layout.tsx`; `<html suppressHydrationWarning>` per its required setup.
- `lib/riskStyle.ts`: each risk level's text class gained a `dark:` variant (e.g.
  `text-amber-700 dark:text-amber-400`) for AA-ish contrast on the dark background, plus a
  `darkHex` alongside `hex` for the two Recharts-based charts (`RiskDistributionChart`,
  `FinancialsChart`, `EwsScoreChart`), which pick light/dark hex via `useTheme().resolvedTheme`
  (undefined pre-mount on both server and first client render, so no hydration mismatch).
- Manually swept every hardcoded light-only color utility introduced in earlier passes
  (delinquency/negative-cash-flow red, inflow slate, concentration amber, the Action-created
  emerald banner) and added matching `dark:` variants.
- `components/layout/ThemeToggle.tsx` and `LanguageToggle.tsx`: two explicit text-labeled
  buttons each (Light/Dark, 한국어/English) rather than a single ambiguous icon — state is never
  conveyed by color alone, both are real `<button>` elements with `aria-pressed` (+`aria-label`
  on the theme buttons). `ThemeToggle` reads mounted-state via `useSyncExternalStore` (not
  `useEffect`+`setState`, which a newer `react-hooks` lint rule now flags) so neither button is
  styled "active" until after mount — the first client render matches the server exactly.

**Nav active state**
- `components/layout/NavBar.tsx` become a client component using `usePathname()`; the active
  item gets `aria-current="page"` plus a subtle background + bold (not color alone). Verified
  Dashboard highlights on `/` and External Event Impact highlights on `/events` and `/events/[id]`.

**Verification**
- `npx tsc --noEmit`, `npx eslint .`, and `npm run build` all clean (all 6 routes now correctly
  render as dynamic `ƒ`, since locale requires a per-request cookie read).
- Full route sweep (all 4 scenario companies + generic company + all 3 events) returns 200 with
  no error markers, in both `ko` (default, no cookie) and `en` (`NEXT_LOCALE=en` cookie) — checked
  via direct HTTP round-trips, including the Risk Timeline evidence panels, Risk Propagation
  Graph detail panel, External Event card, Human-in-the-loop decision labels, and the
  Action-created confirmation banner.
- Caught and fixed a real bug this way: the Cross-Institution/External-Event Exposure figures
  were showing a bare "억원" unit even on the English page before `formatEok` was made
  locale-aware — confirmed fixed by re-checking the same HTTP round-trip after the change.

## 2026-08-27 — Interaction pass: click-to-evidence, priority questions, real Action feedback

Goal: make the demo presentable to an actual financial-institution audience — same 9-step
Risk Investigation flow and synthetic data structure, but every screen element that *looks*
clickable now actually surfaces real underlying data instead of just navigating away or
sitting static.

**Header / navigation**
- Removed the "synthetic data only · 의사결정 지원용 데모 (자동 의사결정 아님)" disclaimer text;
  replaced with a small `DEMO · Synthetic Data` badge, top right.
- Extracted nav into `components/layout/NavBar.tsx` (client component) so Dashboard / External
  Event Impact show a clear active state (`aria-current="page"`, subtle background + bold).

**Risk Signal Timeline (Investigation page) — now click-to-evidence**
- `RiskTimelineEvent` (lib/types.ts) gained an `evidence` reference block (loan/transaction/
  financial-statement/related-company/external-event/investigation/ews-signal/rm-note ids) and
  a `whyItMatters` field. `data/riskTimeline.ts` was filled in with real references to existing
  records (LN-SRT-01/02, TX-SRT-*, FS-SRT-4/7, REL companies, EVT-003, INV-001, NOTE-SRT-1).
- New `resolveTimelineEvidence()` in `lib/repository/investigationRepository.ts` turns those
  references into actual records; new lookup helpers added to companyRepository/
  transactionRepository/noteRepository (`getLoanById`, `getFinancialStatementById`,
  `getEwsSignalById`, `getTransactionsByIds`, `getRmNoteById`).
- New `components/investigation/RiskTimelineInteractive.tsx`: clicking a timeline entry expands
  an evidence panel showing the real loan terms / transaction amounts / financial figures /
  related-company Exposure + risk score, plus the "why this connects to the risk signal" text.

**Risk Propagation Graph — now click-to-detail**
- `components/risk-graph/RiskGraphSimple.tsx` rewritten as a client component. Nodes are click
  targets (not links); selecting one shows relation type (SAME_OWNER/AFFILIATE/counterparty
  concentration), 당행 Exposure, EWS score, industry/region inline, with a "전체 프로필 보기"
  link for anyone who wants the full Company 360 page.

**External Event card — now click-to-expand with real Exposure**
- `getExternalEventsRelatedToCompany()` (eventRepository) now returns each matched company's
  Exposure, risk score and risk level, not just the relation label.
- `components/investigation/ExternalEventCard.tsx` rewritten as a client component: click an
  event to expand affected companies (within this borrower's group) with Exposure + an explicit
  per-company "why this relates" sentence. Defaults to expanding the most specific match
  (counterparty > related company > same-industry-only) so the 도래컴퍼니 investigation event
  opens by default instead of the generic FX event.

**AI Investigation Summary — priority questions**
- `lib/riskAnalysis.ts` gained `priorityQuestions`: 2-3 ranked follow-up questions, generated
  only from signals that actually fired (AR-vs-revenue divergence, cash-flow divergence,
  counterparty concentration, related-party movement, negative news), citing the same figures
  already computed for the rest of the summary — not added commentary.
- Rendered as a "현재 가장 먼저 확인해야 할 사항" callout at the top of the AI Summary card.

**Action buttons — real confirmation state**
- First attempt used `useActionState` with one `.bind()`-per-button server action. This hung the
  entire dev server on submit (verified directly: the stuck POST blocked unrelated GET requests
  too) — a bad interaction between this pattern and Next.js 16 canary / Turbopack. Reverted.
- Final approach: plain bound server actions (unchanged mechanism from before), each action now
  ends with `redirect(`/investigation/{companyId}?created={type}#action`)`. The page reads
  `searchParams.created` and renders a "✓ Action 생성됨 — {label}" banner server-side. No client
  hooks involved; verified via direct HTTP round-trip (66ms response, no hang) before shipping.

**Verification**
- `npx tsc --noEmit`, `npx eslint .`, and `npm run build` all clean.
- Full route sweep (all 4 scenario companies + generic companies + all 3 events) returns 200
  with no error markers.
- Manually verified via raw HTTP: Investigation creation, Human Review submission, and Action
  creation (with redirect + confirmation banner) all complete in well under 100ms.
