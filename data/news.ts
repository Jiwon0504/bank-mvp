import type { NewsItem } from "@/lib/types";
import { SCENARIO_COMPANY_IDS } from "./companies";

const { seramTech, dorae } = SCENARIO_COMPANY_IDS;

export const news: NewsItem[] = [
  {
    id: "NEWS-001",
    companyId: seramTech,
    publishedDate: "2026-04-12",
    headline: "세림테크, 신규 설비투자로 생산능력 확충",
    source: "가상경제신문(mock)",
    sentiment: "POSITIVE",
    summary: "세림테크가 신규 생산라인 증설을 발표하며 매출 성장 기대감이 커지고 있다는 내용의 가상 기사.",
  },
  {
    id: "NEWS-002",
    companyId: dorae,
    publishedDate: "2026-07-11",
    headline: "물류업체 도래컴퍼니 관련 자금흐름 의혹, 조사 착수",
    source: "가상시사저널(mock)",
    sentiment: "NEGATIVE",
    summary:
      "도래컴퍼니의 거래 구조와 관련하여 외부 조사기관이 조사에 착수했다는 가상 보도. 구체적 위법 여부는 확인되지 않았다.",
  },
  {
    id: "NEWS-003",
    companyId: dorae,
    publishedDate: "2026-07-19",
    headline: "도래컴퍼니 관련 조사, 거래 기업으로 확인 범위 확대 검토",
    source: "가상경제신문(mock)",
    sentiment: "NEGATIVE",
    summary:
      "조사기관이 도래컴퍼니의 주요 거래 기업들에 대한 자금 흐름도 함께 들여다보고 있다는 가상 보도.",
  },
];
