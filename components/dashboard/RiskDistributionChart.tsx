"use client";

import { useTheme } from "next-themes";
import {
  Bar,
  BarChart,
  Cell,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import type { DistributionBucket } from "@/lib/repository/dashboardRepository";
import { RISK_STYLE, riskLevelFromScore } from "@/lib/riskStyle";
import { formatEok } from "@/lib/format";
import { useLanguage } from "@/lib/i18n/LanguageProvider";

// Bars are colored by the bucket's average EWS risk severity, not a single
// decorative color — the chart itself becomes a risk signal, consistent
// with the risk indicator used everywhere else (RiskLevelBadge). Colors
// switch to the lighter dark-mode palette once the theme is resolved
// client-side; `resolvedTheme` is undefined on the server and on the first
// client render, so that first render always matches the server (light),
// avoiding a hydration mismatch.
export function RiskDistributionChart({ data }: { data: DistributionBucket[] }) {
  const { resolvedTheme } = useTheme();
  const isDark = resolvedTheme === "dark";
  const { locale } = useLanguage();
  const avgLabel = locale === "ko" ? "평균 Risk" : "avg. Risk";
  const scoreUnit = locale === "ko" ? "점" : "";

  return (
    <ResponsiveContainer width="100%" height={260}>
      <BarChart data={data} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--border)" />
        <XAxis
          dataKey="key"
          tick={{ fontSize: 11 }}
          interval={0}
          angle={-20}
          textAnchor="end"
          height={50}
        />
        <YAxis tick={{ fontSize: 11 }} width={48} />
        <Tooltip
          formatter={(value, _name, item) => [
            `${formatEok(Number(value), locale)} · ${avgLabel} ${item.payload.avgRiskScore}${scoreUnit}`,
            "Exposure",
          ]}
        />
        <Bar dataKey="totalExposure" radius={[2, 2, 0, 0]}>
          {data.map((d) => {
            const style = RISK_STYLE[riskLevelFromScore(d.avgRiskScore)];
            return <Cell key={d.key} fill={isDark ? style.darkHex : style.hex} />;
          })}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  );
}
