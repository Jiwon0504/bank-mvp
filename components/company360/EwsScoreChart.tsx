"use client";

import {
  Line,
  LineChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
  ReferenceLine,
} from "recharts";
import type { EwsSignal } from "@/lib/types";

export function EwsScoreChart({ signals }: { signals: EwsSignal[] }) {
  const data = signals.map((s) => ({ date: s.signalDate, score: s.riskScore }));

  return (
    <ResponsiveContainer width="100%" height={220}>
      <LineChart data={data} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--border)" />
        <XAxis dataKey="date" tick={{ fontSize: 11 }} />
        <YAxis domain={[0, 100]} tick={{ fontSize: 11 }} width={32} />
        <ReferenceLine
          y={55}
          stroke="#ea580c"
          strokeDasharray="4 4"
          label={{ value: "HIGH", fontSize: 10, position: "insideTopRight", fill: "#ea580c" }}
        />
        <ReferenceLine
          y={30}
          stroke="#d97706"
          strokeDasharray="4 4"
          label={{ value: "MEDIUM", fontSize: 10, position: "insideTopRight", fill: "#d97706" }}
        />
        <Tooltip formatter={(value) => `${value}점`} />
        <Line type="monotone" dataKey="score" stroke="#334155" strokeWidth={2} dot={{ r: 3 }} />
      </LineChart>
    </ResponsiveContainer>
  );
}
