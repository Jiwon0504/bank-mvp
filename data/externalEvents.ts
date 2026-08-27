import type { ExternalEvent } from "@/lib/types";

export const externalEvents: ExternalEvent[] = [
  {
    id: "EVT-001",
    title: "원/달러 환율 8% 상승",
    description:
      "최근 4주간 원/달러 환율이 8% 상승했다. 원자재 및 부품 수입 의존도가 높은 산업의 원가 부담이 커질 것으로 예상된다.",
    eventDate: "2026-08-10",
    category: "FX",
    affectedIndustries: ["Manufacturing", "Energy", "Automotive Parts", "Textiles"],
    magnitude: "+8%",
  },
  {
    id: "EVT-002",
    title: "기준금리 0.5%p 인상",
    description:
      "중앙은행이 기준금리를 0.5%p 인상했다. 고부채 기업의 이자 부담이 확대될 것으로 예상된다.",
    eventDate: "2026-07-22",
    category: "Interest Rate",
    affectedIndustries: ["Real Estate", "Construction"],
    magnitude: "+0.5%p",
  },
  {
    id: "EVT-003",
    title: "주요 거래처(도래컴퍼니) 관련 금융사고 의심 정보 발생",
    description:
      "도래컴퍼니를 포함한 일부 물류업체의 거래 구조에 대해 외부 조사기관이 조사에 착수했다는 정보가 확인됨. " +
      "연체나 신용등급 하락 등 전통적 EWS 신호는 아직 발생하지 않았으나, 동일 거래처와 밀접하게 연결된 차주들의 " +
      "Exposure를 재점검할 필요가 있다.",
    eventDate: "2026-07-10",
    category: "Investigation/Legal",
    affectedIndustries: ["Shipping/Logistics", "Manufacturing"],
    magnitude: "조사 착수",
  },
];
