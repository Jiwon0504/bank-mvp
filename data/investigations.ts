import type { Investigation } from "@/lib/types";
import { SCENARIO_COMPANY_IDS } from "./companies";

export const investigations: Investigation[] = [
  {
    id: "INV-001",
    companyId: SCENARIO_COMPANY_IDS.seramTech,
    createdDate: "2026-07-18",
    createdBy: "여신관리팀 박준혁 팀장",
    status: "IN_PROGRESS",
    reason:
      "주요 거래처 도래컴퍼니 관련 외부 조사 착수 이후, 세림테크의 매출채권 급증·현금흐름 악화 및 관계사 간 " +
      "단기 자금이동 패턴이 함께 확인되어 연결 리스크 검증이 필요하다고 판단됨.",
  },
];
