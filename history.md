# Project History

Changelog of significant work on the Credit Risk Control Tower demo. Newest entries first.

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
