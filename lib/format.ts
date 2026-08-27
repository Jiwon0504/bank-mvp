// Centralized number/unit formatting. Every screen must render money and
// scores the same way — a reviewer switching between Dashboard, Company 360
// and Investigation should never see the same figure look different.

// Money fields are stored in KRW millions (see lib/types.ts). Corporate
// lending in Korean banking is conventionally discussed in 억원 (100M KRW),
// not 백만원, so that is the default display unit.
export function formatEok(millions: number): string {
  const eok = millions / 100;
  const sign = eok < 0 ? "-" : "";
  return `${sign}${Math.abs(eok).toLocaleString("ko-KR", {
    minimumFractionDigits: 1,
    maximumFractionDigits: 1,
  })}억원`;
}

export function formatCount(value: number, unit: string): string {
  return `${value.toLocaleString("ko-KR")}${unit}`;
}

export function formatScore(value: number): string {
  return `${value}`;
}

export function formatPercent(value: number, decimals = 1): string {
  return `${value.toFixed(decimals)}%`;
}

export function formatSignedPercent(value: number, decimals = 0): string {
  const sign = value > 0 ? "+" : "";
  return `${sign}${value.toFixed(decimals)}%`;
}

export function formatSignedScore(value: number): string {
  const sign = value > 0 ? "+" : "";
  return `${sign}${value}`;
}
