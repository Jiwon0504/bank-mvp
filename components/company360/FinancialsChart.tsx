"use client";

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

export function FinancialsChart({ statements }: { statements: FinancialStatement[] }) {
  const data = statements.map((s) => ({
    period: `${s.fiscalYear} Q${s.quarter}`,
    매출: s.revenue,
    매출채권: s.accountsReceivable,
    영업현금흐름: s.operatingCashFlow,
  }));

  return (
    <ResponsiveContainer width="100%" height={260}>
      <LineChart data={data} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--border)" />
        <XAxis dataKey="period" tick={{ fontSize: 11 }} />
        <YAxis tick={{ fontSize: 11 }} width={48} />
        <Tooltip formatter={(value) => formatEok(Number(value))} />
        <Legend wrapperStyle={{ fontSize: 12 }} />
        <Line type="monotone" dataKey="매출" stroke="#334155" strokeWidth={2} dot={false} />
        <Line type="monotone" dataKey="매출채권" stroke="#d97706" strokeWidth={2} dot={false} />
        <Line
          type="monotone"
          dataKey="영업현금흐름"
          stroke="#b91c1c"
          strokeWidth={2}
          dot={false}
        />
      </LineChart>
    </ResponsiveContainer>
  );
}
