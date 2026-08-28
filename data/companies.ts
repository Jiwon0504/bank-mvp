import type { Company, Industry, Region } from "@/lib/types";
import { createRng, pick, intBetween } from "./random";
import { riskLevelFromScore } from "@/lib/riskStyle";

const INDUSTRIES: Industry[] = [
  "Manufacturing",
  "Construction",
  "Shipping/Logistics",
  "Retail/Wholesale",
  "IT/Software",
  "Energy",
  "Automotive Parts",
  "Textiles",
  "F&B",
  "Real Estate",
];

const REGIONS: Region[] = [
  "Seoul",
  "Gyeonggi",
  "Busan",
  "Incheon",
  "Daegu",
  "Ulsan",
  "Gwangju",
  "Chungnam",
];

const NAME_PREFIXES = [
  "한빛",
  "대원",
  "성진",
  "우진",
  "동아",
  "미래",
  "삼정",
  "청솔",
  "우리",
  "태양",
  "신흥",
  "한강",
  "동방",
  "금호",
  "서진",
  "가온",
  "다솜",
  "이든",
  "해오름",
  "새길",
];

const NAME_SUFFIXES = [
  "산업",
  "정밀",
  "테크",
  "물류",
  "화학",
  "전자",
  "머티리얼",
  "에너지",
  "푸드",
  "글로벌",
  "메탈",
  "건설",
  "시스템",
  "바이오",
  "파트너스",
];

function generateGenericCompanies(count: number): Company[] {
  const rng = createRng(20260827);
  const companies: Company[] = [];
  const usedNames = new Set<string>();

  for (let i = 0; i < count; i++) {
    let name = "";
    do {
      name = `${pick(rng, NAME_PREFIXES)}${pick(rng, NAME_SUFFIXES)}`;
    } while (usedNames.has(name));
    usedNames.add(name);

    const score = intBetween(rng, 5, 92);
    const industry = pick(rng, INDUSTRIES);
    const isImportHeavy =
      industry === "Manufacturing" ||
      industry === "Energy" ||
      industry === "Automotive Parts" ||
      industry === "Textiles";

    companies.push({
      id: `CMP-${String(i + 1).padStart(3, "0")}`,
      name,
      bizRegNo: `${intBetween(rng, 100, 999)}-${intBetween(rng, 10, 99)}-${intBetween(
        rng,
        10000,
        99999
      )}`,
      industry,
      region: pick(rng, REGIONS),
      ceoName: `${pick(rng, ["김", "이", "박", "최", "정", "강", "조"])}${pick(
        rng,
        ["민준", "서연", "지훈", "예은", "도윤", "하은", "성민"]
      )}`,
      establishedYear: intBetween(rng, 1985, 2018),
      employeeCount: intBetween(rng, 15, 850),
      creditRating: pick(rng, [
        "AA",
        "AA-",
        "A+",
        "A",
        "A-",
        "BBB+",
        "BBB",
        "BBB-",
        "BB+",
        "BB",
      ]),
      currentEwsRiskScore: score,
      currentEwsRiskLevel: riskLevelFromScore(score),
      totalExposure: intBetween(rng, 300, 18000),
      importDependencyPct: isImportHeavy
        ? intBetween(rng, 35, 85)
        : intBetween(rng, 0, 30),
      isWatchListed: score >= 55 && rng() > 0.5,
    });
  }

  return companies;
}

// --- Hidden Risk Case scenario ---------------------------------------------
// Fully synthetic. Inspired in spirit by publicly-discussed patterns where
// multiple lenders extended credit to the same borrower group and
// traditional delinquency-based EWS signals did not fire until an external
// investigation surfaced the issue. No real institution, company, or person
// is represented here.

export const SCENARIO_COMPANY_IDS = {
  seramTech: "CMP-SRT",
  haneui: "CMP-HN",
  cheongwoo: "CMP-CW",
  dorae: "CMP-DR",
} as const;

const scenarioCompanies: Company[] = [
  {
    id: SCENARIO_COMPANY_IDS.seramTech,
    name: "세림테크",
    bizRegNo: "214-81-55302",
    industry: "Manufacturing",
    region: "Gyeonggi",
    ceoName: "윤성호",
    establishedYear: 2011,
    employeeCount: 128,
    creditRating: "BBB+",
    currentEwsRiskScore: 34,
    currentEwsRiskLevel: "MEDIUM",
    totalExposure: 7600, // = sum of LN-SRT-01/02 outstandingBalance (this bank's own book)
    importDependencyPct: 18,
    isWatchListed: false,
  },
  {
    id: SCENARIO_COMPANY_IDS.haneui,
    name: "하늬산업",
    bizRegNo: "301-86-22147",
    industry: "Manufacturing",
    region: "Gyeonggi",
    ceoName: "윤성호", // same CEO as 세림테크 — modeled same-owner relation
    establishedYear: 2016,
    employeeCount: 24,
    creditRating: "BBB-",
    currentEwsRiskScore: 29,
    currentEwsRiskLevel: "LOW",
    totalExposure: 1320, // = LN-HN-01 outstandingBalance
    importDependencyPct: 12,
    isWatchListed: false,
  },
  {
    id: SCENARIO_COMPANY_IDS.cheongwoo,
    name: "청우머티리얼",
    bizRegNo: "137-87-90512",
    industry: "Manufacturing",
    region: "Incheon",
    ceoName: "박도현",
    establishedYear: 2014,
    employeeCount: 41,
    creditRating: "BBB",
    currentEwsRiskScore: 31,
    currentEwsRiskLevel: "MEDIUM",
    totalExposure: 2600, // = LN-CW-01 outstandingBalance
    importDependencyPct: 22,
    isWatchListed: false,
  },
  {
    id: SCENARIO_COMPANY_IDS.dorae,
    name: "도래컴퍼니",
    bizRegNo: "405-88-77219",
    industry: "Shipping/Logistics",
    region: "Incheon",
    ceoName: "한지원",
    establishedYear: 2013,
    employeeCount: 33,
    creditRating: "BB+",
    currentEwsRiskScore: 46,
    currentEwsRiskLevel: "MEDIUM",
    totalExposure: 2950, // = LN-DR-01 outstandingBalance
    importDependencyPct: 8,
    isWatchListed: false,
    // Not a "hidden risk" pre-classification — this is an independent fact
    // (the external investigation event, EVT-003, is what references it);
    // whether 도래컴퍼니 itself surfaces as a scan priority candidate is
    // computed the same way as any other company (see lib/riskScan.ts).
    tags: ["UNDER_EXTERNAL_INVESTIGATION"],
  },
];

export const genericCompanies = generateGenericCompanies(30);
export const companies: Company[] = [...genericCompanies, ...scenarioCompanies];
