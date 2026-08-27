"use client";

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

// Bars are colored by the bucket's average EWS risk severity, not a single
// decorative color — the chart itself becomes a risk signal, consistent
// with the risk indicator used everywhere else (RiskLevelBadge).
export function RiskDistributionChart({ data }: { data: DistributionBucket[] }) {
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
            `${formatEok(Number(value))} · 평균 Risk ${item.payload.avgRiskScore}점`,
            "Exposure",
          ]}
        />
        <Bar dataKey="totalExposure" radius={[2, 2, 0, 0]}>
          {data.map((d) => (
            <Cell key={d.key} fill={RISK_STYLE[riskLevelFromScore(d.avgRiskScore)].hex} />
          ))}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  );
}
