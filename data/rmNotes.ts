import type { RmNote } from "@/lib/types";
import { SCENARIO_COMPANY_IDS } from "./companies";

export const rmNotes: RmNote[] = [
  {
    id: "NOTE-SRT-1",
    companyId: SCENARIO_COMPANY_IDS.seramTech,
    authorName: "이수민 심사역",
    createdDate: "2026-05-20",
    note:
      "최근 대규모 신규 수주가 확인되어 매출 성장 지속 전망. 현재 시점에서는 Watch 필요성 낮다고 판단.",
    tags: ["정기점검"],
  },
  {
    id: "NOTE-SRT-2",
    companyId: SCENARIO_COMPANY_IDS.seramTech,
    authorName: "이수민 심사역",
    createdDate: "2026-06-30",
    note:
      "매출채권 잔액이 다소 늘었으나 신규 수주 물량 반영으로 설명 가능한 수준. 추가 모니터링만 유지.",
    tags: ["정기점검", "재무모니터링"],
  },
];
