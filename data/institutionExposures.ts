import type { InstitutionExposure } from "@/lib/types";
import { SCENARIO_COMPANY_IDS } from "./companies";

// Cross-institution exposure for the Hidden Risk Case scenario.
// Amounts are demo-fabricated, not copied from any real matter.
export const institutionExposures: InstitutionExposure[] = [
  // 세림테크
  {
    id: "IE-001",
    institutionId: "INST-A",
    companyId: SCENARIO_COMPANY_IDS.seramTech,
    exposureAmount: 4200,
    asOfDate: "2026-08-20",
  },
  {
    id: "IE-002",
    institutionId: "INST-B",
    companyId: SCENARIO_COMPANY_IDS.seramTech,
    exposureAmount: 700,
    asOfDate: "2026-08-20",
  },
  {
    id: "IE-003",
    institutionId: "INST-C",
    companyId: SCENARIO_COMPANY_IDS.seramTech,
    exposureAmount: 1900,
    asOfDate: "2026-08-20",
  },
  // 하늬산업
  {
    id: "IE-004",
    institutionId: "INST-A",
    companyId: SCENARIO_COMPANY_IDS.haneui,
    exposureAmount: 900,
    asOfDate: "2026-08-20",
  },
  {
    id: "IE-005",
    institutionId: "INST-C",
    companyId: SCENARIO_COMPANY_IDS.haneui,
    exposureAmount: 500,
    asOfDate: "2026-08-20",
  },
  // 청우머티리얼
  {
    id: "IE-006",
    institutionId: "INST-A",
    companyId: SCENARIO_COMPANY_IDS.cheongwoo,
    exposureAmount: 1100,
    asOfDate: "2026-08-20",
  },
  {
    id: "IE-007",
    institutionId: "INST-B",
    companyId: SCENARIO_COMPANY_IDS.cheongwoo,
    exposureAmount: 400,
    asOfDate: "2026-08-20",
  },
  {
    id: "IE-008",
    institutionId: "INST-C",
    companyId: SCENARIO_COMPANY_IDS.cheongwoo,
    exposureAmount: 300,
    asOfDate: "2026-08-20",
  },
  // 도래컴퍼니
  {
    id: "IE-009",
    institutionId: "INST-B",
    companyId: SCENARIO_COMPANY_IDS.dorae,
    exposureAmount: 300,
    asOfDate: "2026-08-20",
  },
];
