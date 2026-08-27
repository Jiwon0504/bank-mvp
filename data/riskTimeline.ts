import type { RiskTimelineEvent } from "@/lib/types";
import { SCENARIO_COMPANY_IDS } from "./companies";

const { seramTech, haneui, cheongwoo, dorae } = SCENARIO_COMPANY_IDS;

// Explicit narrative ordering for the Hidden Risk Case scenario, rendered as
// a timeline in the Risk Investigation view. Each entry's `evidence` points
// at real records (loans, transactions, financial statements, etc.) so a
// click on the timeline can show actual underlying data, not just prose.
export const riskTimeline: RiskTimelineEvent[] = [
  {
    id: "TL-01",
    companyId: seramTech,
    date: "2023-03-15",
    label: "대출 실행",
    category: "LOAN",
    description: "금융기관 A로부터 운전자금대출 62억원 실행.",
    whyItMatters:
      "이 시점 자체는 위험 신호가 아니지만, 이후 신호를 해석하는 기준선(baseline)이 됩니다 — 대출 실행 이후 연체는 한 번도 발생하지 않았습니다.",
    evidence: { loanIds: ["LN-SRT-01"] },
  },
  {
    id: "TL-02",
    companyId: seramTech,
    date: "2024-06-10",
    label: "무역금융 추가 실행",
    category: "LOAN",
    description: "무역금융 19억원 추가 실행.",
    whyItMatters:
      "추가 여신으로 당행 Exposure가 확대되어, 이후 위험 신호가 실제 리스크로 이어질 경우 영향 규모가 커집니다.",
    evidence: { loanIds: ["LN-SRT-02"] },
  },
  {
    id: "TL-03",
    companyId: seramTech,
    date: "2024-12-31",
    label: "매출 증가 확인",
    category: "FINANCIAL",
    description: "2024년 매출이 전년 대비 지속 증가, 외형상 양호한 성장세.",
    whyItMatters:
      "매출 증가 자체는 긍정적 신호입니다. 다만 다음 분기부터 매출채권 증가 속도와 비교했을 때 의미가 달라집니다 (다음 항목 참고).",
    evidence: { financialStatementId: "FS-SRT-4" },
  },
  {
    id: "TL-04",
    companyId: seramTech,
    date: "2025-09-30",
    label: "매출채권 증가율이 매출 증가율을 상회",
    category: "FINANCIAL",
    description:
      "매출채권이 매출 증가 속도보다 훨씬 빠르게 증가. 동시에 영업현금흐름은 악화 추세로 전환.",
    whyItMatters:
      "매출은 늘었지만 실제 현금으로 회수되지 않고 매출채권으로만 쌓이는 패턴입니다. 연체·이자 납부에는 영향이 없어 전통적 EWS는 이 괴리를 포착하지 못합니다.",
    evidence: { financialStatementId: "FS-SRT-7" },
  },
  {
    id: "TL-05",
    companyId: seramTech,
    date: "2026-05-20",
    label: "담당자 정기점검 메모",
    category: "RM_NOTE",
    description: "신규 수주 확인으로 Watch 필요성 낮다고 판단 (당시 시점 기준).",
    whyItMatters:
      "이 시점 판단은 신규 수주라는 근거가 있었으나, 이후 관계회사 자금이동과 외부 Event가 함께 나타나 재검토가 필요해졌습니다.",
    evidence: { rmNoteId: "NOTE-SRT-1" },
  },
  {
    id: "TL-06",
    companyId: seramTech,
    date: "2026-07-08",
    label: "관계회사 간 단기 자금이동 발생",
    category: "RELATED_PARTY",
    description:
      "세림테크 → 하늬산업 → 청우머티리얼 → 세림테크로 이어지는 유사 금액의 자금이동이 5일 내 순차 발생.",
    whyItMatters:
      "9~9.5억원대의 유사한 금액이 3개사를 거쳐 원래 회사로 되돌아오는 구조는, 정상적인 상거래보다 자금 순환 목적일 가능성을 시사하는 대표적 패턴입니다.",
    evidence: {
      transactionIds: ["TX-SRT-06", "TX-HN-01", "TX-HN-02", "TX-CW-01", "TX-CW-02", "TX-SRT-07"],
      relatedCompanyIds: [haneui, cheongwoo],
    },
  },
  {
    id: "TL-07",
    companyId: seramTech,
    date: "2026-07-10",
    label: "외부 Event: 주요 거래처 관련 조사 착수",
    category: "EXTERNAL_EVENT",
    description: "주요 거래처 도래컴퍼니 관련 금융사고 의심 정보 및 외부 조사 착수 확인.",
    whyItMatters:
      "세림테크 매출의 42%가 도래컴퍼니 한 곳에 집중되어 있어, 도래컴퍼니 관련 이슈는 세림테크 매출·현금흐름에 직접적인 영향을 줄 수 있습니다.",
    evidence: { externalEventId: "EVT-003", relatedCompanyIds: [dorae] },
  },
  {
    id: "TL-08",
    companyId: seramTech,
    date: "2026-07-18",
    label: "Investigation 시작",
    category: "INVESTIGATION",
    description: "연결 리스크 검증을 위한 Investigation(INV-001) 개설.",
    whyItMatters:
      "위 신호들은 개별로는 EWS 임계치를 넘지 않지만, 재무·거래·관계사·외부 Event가 동시에 나타나 결합 검증이 필요하다고 판단되어 Investigation이 개설되었습니다.",
    evidence: { investigationId: "INV-001" },
  },
];
