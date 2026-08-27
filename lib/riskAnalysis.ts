// Rule-based (not LLM-based) synthesis of "why is this company risky" across
// connected data sources. This is a deterministic placeholder for the future
// Claude-powered Investigation Summary — same output shape, so the UI layer
// does not need to change when that lands. Language is deliberately hedged
// ("검증 필요", "확인 필요") — this tool never asserts fraud or default.

import { getCompanyById, getLoansByCompany, getLatestEwsSignal, getFinancialsByCompany, getCompanyExposure } from "@/lib/repository/companyRepository";
import { getRelatedCompanyIds, getCounterpartiesByCompany } from "@/lib/repository/relationshipRepository";
import { getNewsByCompany } from "@/lib/repository/eventRepository";
import { formatEok } from "@/lib/format";

export interface InvestigationSummary {
  priorityQuestions: string[];
  currentStatus: string[];
  riskSignalsFound: string[];
  connectingEvidence: string[];
  unverifiedItems: string[];
  whyFurtherReviewNeeded: string[];
  suggestedActions: string[];
}

export function generateInvestigationSummary(companyId: string): InvestigationSummary | null {
  const company = getCompanyById(companyId);
  if (!company) return null;

  const loans = getLoansByCompany(companyId);
  const latestSignal = getLatestEwsSignal(companyId);
  const statements = getFinancialsByCompany(companyId);
  const relatedIds = getRelatedCompanyIds(companyId);
  const counterparties = getCounterpartiesByCompany(companyId);
  const negativeNews = getNewsByCompany(companyId).filter((n) => n.sentiment === "NEGATIVE");

  const hasDelinquency = loans.some((l) => l.delinquencyDays > 0);

  const currentStatus: string[] = [
    `현재 EWS Risk Score ${latestSignal?.riskScore ?? company.currentEwsRiskScore}점 (${
      latestSignal?.riskLevel ?? company.currentEwsRiskLevel
    }), 연체 ${hasDelinquency ? "발생" : "없음"}.`,
    `당행 Exposure ${formatEok(getCompanyExposure(companyId))}, 신용등급 ${company.creditRating}.`,
  ];

  const riskSignalsFound: string[] = [];
  let arOutpacesRevenue = false;
  let cashFlowDivergence = false;
  let revenueGrowth = 0;
  let arGrowth = 0;
  let latestCashFlow = 0;

  if (statements.length >= 2) {
    const first = statements[0];
    const last = statements[statements.length - 1];
    revenueGrowth = ((last.revenue - first.revenue) / first.revenue) * 100;
    arGrowth = ((last.accountsReceivable - first.accountsReceivable) / first.accountsReceivable) * 100;
    latestCashFlow = last.operatingCashFlow;

    if (arGrowth > revenueGrowth * 1.5 && arGrowth > 20) {
      arOutpacesRevenue = true;
      riskSignalsFound.push(
        `매출은 ${revenueGrowth.toFixed(0)}% 증가했으나 매출채권은 ${arGrowth.toFixed(
          0
        )}% 증가 — 매출 증가 속도보다 채권 누적 속도가 훨씬 빠름 (검증 필요).`
      );
    }
    if (last.operatingCashFlow < 0 && last.netProfit > 0) {
      cashFlowDivergence = true;
      riskSignalsFound.push(
        `최근 분기 영업현금흐름 ${formatEok(last.operatingCashFlow)}(음수)이지만 회계상 순이익은 ${formatEok(last.netProfit)}(양수) — 회계상 이익과 실제 현금흐름 간 괴리 (검증 필요).`
      );
    }
  }

  const concentrated = counterparties.filter((c) => c.concentrationPct >= 35);
  for (const cp of concentrated) {
    riskSignalsFound.push(
      `매출의 ${cp.concentrationPct}%가 단일 거래처(${cp.counterpartyName})에 집중 — 해당 거래처 이슈 발생 시 직접 영향 가능성 (확인 필요).`
    );
  }

  if (relatedIds.length > 0) {
    riskSignalsFound.push(
      `관계회사 ${relatedIds.length}개사와 연결 확인 — 관계회사 간 자금이동 패턴 별도 확인 필요.`
    );
  }

  if (negativeNews.length > 0) {
    riskSignalsFound.push(
      `외부 보도 ${negativeNews.length}건에서 부정적 sentiment 확인 (예: "${negativeNews[0].headline}") — 사실관계 확인 필요.`
    );
  }

  const connectingEvidence: string[] = [];
  if (concentrated.length > 0 && relatedIds.length > 0) {
    connectingEvidence.push(
      "매출이 집중된 거래처 관련 이슈와 관계회사 간 자금이동 시점이 근접 — 단순 우연인지, 구조적 연결인지 검증 필요."
    );
  }
  if ((arOutpacesRevenue || cashFlowDivergence) && negativeNews.length > 0) {
    connectingEvidence.push(
      "재무제표상 현금흐름 악화가 나타난 시점과 외부 부정적 보도 시점이 시간적으로 근접."
    );
  }
  if (riskSignalsFound.length >= 2 && (latestSignal?.riskLevel === "LOW" || latestSignal?.riskLevel === "MEDIUM")) {
    connectingEvidence.push(
      "개별 신호는 EWS 임계치를 넘지 않지만, 여러 데이터 소스에서 동시에 약한 신호가 관측되어 결합 리스크로 볼 근거가 있음."
    );
  }

  const unverifiedItems: string[] = [];
  if (relatedIds.length > 0) {
    unverifiedItems.push("관계회사 간 자금이동의 실제 거래 목적(정상 상거래 vs 단순 자금 순환) 미확인.");
  }
  if (concentrated.length > 0) {
    unverifiedItems.push("집중 거래처 관련 이슈의 사실관계 및 본 차주와의 직접적 연관성 미확인.");
  }
  if (arOutpacesRevenue) {
    unverifiedItems.push("매출채권 증가가 일시적 수주 확대에 따른 것인지, 회수 지연에 따른 것인지 미확인.");
  }
  if (unverifiedItems.length === 0) {
    unverifiedItems.push("현재까지 확인된 데이터만으로는 추가로 확인이 필요한 특이사항이 발견되지 않음.");
  }

  const whyFurtherReviewNeeded: string[] = [];
  if (riskSignalsFound.length > 0) {
    whyFurtherReviewNeeded.push(
      "전통적 EWS는 연체·신용등급 등 후행 지표 중심이라, 관계사·거래처 연결에서 발생하는 위험을 포착하지 못할 수 있음."
    );
  }
  if (riskSignalsFound.length >= 2) {
    whyFurtherReviewNeeded.push(
      "복수의 약한 신호가 동시에 나타나 개별로는 위험도가 낮아도 결합 시 검증 우선순위가 높아짐."
    );
  }
  if (whyFurtherReviewNeeded.length === 0) {
    whyFurtherReviewNeeded.push("현재 특별한 추가 조사 필요성은 낮으나, 정기 모니터링은 유지 권장.");
  }

  const suggestedActions: string[] = [];
  if (riskSignalsFound.length > 0) {
    suggestedActions.push("현장 확인 요청 — 신규 수주 및 매출채권 회수 현황 실사");
    suggestedActions.push("심사부 검토 요청 — 관계회사 자금이동 및 집중 거래처 관련 소명 자료 요청");
    suggestedActions.push("Watch List 등록 — 추가 신호 발생 시 즉시 대응 가능하도록");
  } else {
    suggestedActions.push("특별 조치 불필요 — 정기 모니터링 유지");
  }

  // Ranked follow-up questions — each one is generated only when its
  // underlying signal actually fired above, and cites the same figures, so
  // this is a derived view of the detected signals, not added commentary.
  const priorityQuestionCandidates: string[] = [];
  if (arOutpacesRevenue) {
    priorityQuestionCandidates.push(
      `매출은 ${revenueGrowth.toFixed(0)}% 늘었는데 매출채권은 ${arGrowth.toFixed(
        0
      )}% 늘었다 — 매출채권 회수가 실제로 지연되고 있는지, 세금계산서·수금 내역으로 확인했는가?`
    );
  }
  if (cashFlowDivergence) {
    priorityQuestionCandidates.push(
      `영업현금흐름이 ${formatEok(latestCashFlow)}로 적자인데 회계상 순이익은 흑자다 — 현금이 실제로 어디에 묶여 있는지 확인했는가?`
    );
  }
  if (concentrated.length > 0) {
    priorityQuestionCandidates.push(
      `매출의 ${concentrated[0].concentrationPct}%가 ${concentrated[0].counterpartyName} 한 곳에 집중되어 있다 — 이 거래처向 매출의 실제 거래 증빙(계약서·운송장)을 확인했는가?`
    );
  }
  if (relatedIds.length > 0) {
    priorityQuestionCandidates.push(
      `관계회사 ${relatedIds.length}개사와 최근 자금이동이 있었다 — 이 자금이동에 실제 상거래 목적(계약서·인보이스)이 있는지 확인했는가?`
    );
  }
  if (negativeNews.length > 0) {
    priorityQuestionCandidates.push(
      `"${negativeNews[0].headline}" 관련 부정적 보도가 있다 — 사실관계와 본 차주에 대한 직접적 영향 여부를 확인했는가?`
    );
  }
  const priorityQuestions =
    priorityQuestionCandidates.length > 0
      ? priorityQuestionCandidates.slice(0, 3)
      : ["현재 데이터 기준으로는 즉시 확인이 필요한 항목이 없습니다. 정기 모니터링을 유지하십시오."];

  return {
    priorityQuestions,
    currentStatus,
    riskSignalsFound,
    connectingEvidence,
    unverifiedItems,
    whyFurtherReviewNeeded,
    suggestedActions,
  };
}
