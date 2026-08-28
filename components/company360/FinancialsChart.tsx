"use client";

import { useTheme } from "next-themes";
import {
  Line,
  LineChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
  Legend,
} from "recharts";
import type { FinancialStatement } from "@/lib/types";
import { formatEok } from "@/lib/format";
import { useLanguage } from "@/lib/i18n/LanguageProvider";

// Line colors are theme-aware: `resolvedTheme` is undefined on the server
// and on the first client render, so the first render always matches the
// server (light palette), avoiding a hydration mismatch; it corrects to
// the dark palette right after mount if needed.
export function FinancialsChart({ statements }: { statements: FinancialStatement[] }) {
  const { resolvedTheme } = useTheme();
  const isDark = resolvedTheme === "dark";
  const { t, locale } = useLanguage();
  const legend = t.company.financials.chartLegend;

  const data = statements.map((s) => ({
    period: `${s.fiscalYear} Q${s.quarter}`,
    [legend.revenue]: s.revenue,
    [legend.receivables]: s.accountsReceivable,
    [legend.cashFlow]: s.operatingCashFlow,
  }));

  return (
    <ResponsiveContainer width="100%" height={260}>
      <LineChart data={data} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--border)" />
        <XAxis dataKey="period" tick={{ fontSize: 11 }} />
        <YAxis tick={{ fontSize: 11 }} width={48} />
        <Tooltip formatter={(value) => formatEok(Number(value), locale)} />
        <Legend wrapperStyle={{ fontSize: 12 }} />
        <Line
          type="monotone"
          dataKey={legend.revenue}
          stroke={isDark ? "#cbd5e1" : "#334155"}
          strokeWidth={2}
          dot={false}
        />
        <Line
          type="monotone"
          dataKey={legend.receivables}
          stroke={isDark ? "#fbbf24" : "#d97706"}
          strokeWidth={2}
          dot={false}
        />
        <Line
          type="monotone"
          dataKey={legend.cashFlow}
          stroke={isDark ? "#f87171" : "#b91c1c"}
          strokeWidth={2}
          dot={false}
        />
      </LineChart>
    </ResponsiveContainer>
  );
}
