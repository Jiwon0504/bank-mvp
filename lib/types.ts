// Core domain entity types for the Credit Risk Control Tower demo.
// These types are storage-agnostic: today they describe in-memory mock data,
// but the shape is designed to map cleanly onto real DB tables later.

export type RiskLevel = "LOW" | "MEDIUM" | "HIGH" | "CRITICAL";

export type Industry =
  | "Manufacturing"
  | "Construction"
  | "Shipping/Logistics"
  | "Retail/Wholesale"
  | "IT/Software"
  | "Energy"
  | "Automotive Parts"
  | "Textiles"
  | "F&B"
  | "Real Estate";

export type Region =
  | "Seoul"
  | "Gyeonggi"
  | "Busan"
  | "Incheon"
  | "Daegu"
  | "Ulsan"
  | "Gwangju"
  | "Chungnam";

export interface Company {
  id: string;
  name: string;
  bizRegNo: string; // 사업자등록번호 (mock)
  industry: Industry;
  region: Region;
  ceoName: string;
  establishedYear: number;
  employeeCount: number;
  creditRating: string; // e.g. "AA-", "BBB+"
  currentEwsRiskScore: number; // 0-100
  currentEwsRiskLevel: RiskLevel;
  totalExposure: number; // KRW, in millions
  importDependencyPct: number; // 0-100, used for FX event impact demo
  isWatchListed: boolean;
  tags?: string[]; // e.g. ["HIDDEN_RISK_CASE"] — demo-only markers, not a real risk field
}

export interface Loan {
  id: string;
  companyId: string;
  productType: string; // e.g. "운전자금대출", "시설자금대출", "무역금융"
  principal: number; // KRW millions
  outstandingBalance: number; // KRW millions
  interestRate: number; // %
  startDate: string;
  maturityDate: string;
  collateralType: string;
  delinquencyDays: number;
}

export interface EwsSignal {
  id: string;
  companyId: string;
  signalDate: string;
  riskScore: number; // 0-100
  riskLevel: RiskLevel;
  scoreDelta: number; // change vs previous signal
  triggerFactors: string[]; // e.g. ["매출 급감", "연체 발생"]
}

export interface FinancialStatement {
  id: string;
  companyId: string;
  fiscalYear: number;
  quarter: number; // 1-4
  revenue: number; // KRW millions
  operatingProfit: number;
  netProfit: number;
  totalAssets: number;
  totalLiabilities: number;
  totalEquity: number;
  debtRatio: number; // %
  currentRatio: number; // %
  interestCoverageRatio: number;
  accountsReceivable: number; // KRW millions — watched against revenue growth rate
  operatingCashFlow: number; // KRW millions — watched against accounting profit
}

export interface Transaction {
  id: string;
  companyId: string;
  date: string;
  type: "INFLOW" | "OUTFLOW";
  category: string; // e.g. "매출대금", "원자재대금", "인건비"
  amount: number; // KRW millions
  counterpartyId?: string;
}

export type RelationType =
  | "SUBSIDIARY"
  | "PARENT"
  | "AFFILIATE"
  | "SAME_OWNER";

export interface RelatedCompany {
  id: string;
  companyId: string;
  relatedCompanyId: string;
  relationType: RelationType;
  ownershipPct?: number;
}

export type CounterpartyRole = "CUSTOMER" | "SUPPLIER";

export interface Counterparty {
  id: string;
  companyId: string;
  counterpartyName: string;
  role: CounterpartyRole;
  annualTransactionVolume: number; // KRW millions
  concentrationPct: number; // % of company's total sales/purchases
  counterpartyCompanyId?: string; // links to Company if also a borrower
}

export interface ExternalEvent {
  id: string;
  title: string;
  description: string;
  eventDate: string;
  category: string; // e.g. "FX", "Interest Rate", "Commodity", "Policy"
  affectedIndustries: Industry[];
  magnitude: string; // e.g. "+8%", "-3%p"
}

export interface NewsItem {
  id: string;
  companyId: string;
  publishedDate: string;
  headline: string;
  source: string;
  sentiment: "POSITIVE" | "NEUTRAL" | "NEGATIVE";
  summary: string;
}

export interface RmNote {
  id: string;
  companyId: string;
  authorName: string;
  createdDate: string;
  note: string;
  tags: string[];
}

export type OverrideDecision = "AGREE" | "OVERRIDE_UP" | "OVERRIDE_DOWN";

export interface RmAssessment {
  id: string;
  companyId: string;
  ewsSignalId: string;
  authorName: string;
  createdDate: string;
  decision: OverrideDecision;
  assessedRiskLevel: RiskLevel;
  rationale: string;
  evidence: string;
  validUntil: string;
}

export type InvestigationStatus = "OPEN" | "IN_PROGRESS" | "CLOSED";

export interface Investigation {
  id: string;
  companyId: string;
  createdDate: string;
  createdBy: string;
  status: InvestigationStatus;
  reason: string;
  findings?: string;
  closedDate?: string;
}

export type ActionType =
  | "SITE_VISIT_REQUEST"
  | "CREDIT_REVIEW_REQUEST"
  | "WATCHLIST_REGISTER"
  | "INVESTIGATION_CREATE";

export type ActionStatus = "PENDING" | "IN_PROGRESS" | "DONE";

export interface Action {
  id: string;
  companyId: string;
  type: ActionType;
  status: ActionStatus;
  createdDate: string;
  createdBy: string;
  note?: string;
}

// --- Cross-institution exposure -------------------------------------------
// Demo-only, generic institution names ("금융기관 A/B/C") — never real bank names.

export interface FinancialInstitution {
  id: string;
  name: string; // e.g. "금융기관 A"
}

export interface InstitutionExposure {
  id: string;
  institutionId: string;
  companyId: string;
  exposureAmount: number; // KRW millions
  asOfDate: string;
}

// --- Risk signal timeline ---------------------------------------------------
// Explicit, ordered narrative events used to render "Risk Signal Timeline"
// views (loan execution -> financial drift -> related-party activity ->
// external event -> investigation), independent of the underlying entities.

export type RiskTimelineCategory =
  | "LOAN"
  | "FINANCIAL"
  | "TRANSACTION"
  | "RELATED_PARTY"
  | "EXTERNAL_EVENT"
  | "INVESTIGATION"
  | "EWS"
  | "RM_NOTE";

// `evidence` points at the actual records this timeline entry is about, so
// the Investigation view can show real underlying data (loan terms,
// transaction amounts, exposure figures) when a timeline entry is clicked,
// rather than just more prose.
export interface RiskTimelineEvidenceRefs {
  loanIds?: string[];
  transactionIds?: string[];
  financialStatementId?: string;
  relatedCompanyIds?: string[]; // related companies / counterparties involved
  externalEventId?: string;
  investigationId?: string;
  ewsSignalId?: string;
  rmNoteId?: string;
}

export interface RiskTimelineEvent {
  id: string;
  companyId: string;
  date: string;
  label: string;
  category: RiskTimelineCategory;
  description: string;
  whyItMatters: string; // explicit "why this connects to the risk signal"
  evidence?: RiskTimelineEvidenceRefs;
}

// --- Human-in-the-loop disposition on an investigation ----------------------
// Distinct from RmAssessment (which overrides a specific EWS score): this is
// the RM's disposition once an Investigation has been opened.

export type HiddenRiskReviewDecision =
  | "NEEDS_VERIFICATION" // 확인 필요
  | "WATCHLIST" // Watch List 등록
  | "MAINTAIN_NORMAL" // 정상 유지
  | "CREDIT_REVIEW"; // 심사부 검토 요청

export interface HumanReview {
  id: string;
  investigationId: string;
  companyId: string;
  authorName: string;
  createdDate: string;
  decision: HiddenRiskReviewDecision;
  rationale: string;
  note?: string;
}
