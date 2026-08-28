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
  ReferenceLine,
} from "recharts";
import type { EwsSignal } from "@/lib/types";
import { useLanguage } from "@/lib/i18n/LanguageProvider";

export function EwsScoreChart({ signals }: { signals: EwsSignal[] }) {
  const { resolvedTheme } = useTheme();
  const isDark = resolvedTheme === "dark";
  const { locale } = useLanguage();
  const scoreUnit = locale === "ko" ? "점" : "";

  const data = signals.map((s) => ({ date: s.signalDate, score: s.riskScore }));
  const highColor = isDark ? "#fb923c" : "#ea580c";
  const mediumColor = isDark ? "#fbbf24" : "#d97706";

  return (
    <ResponsiveContainer width="100%" height={220}>
      <LineChart data={data} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--border)" />
        <XAxis dataKey="date" tick={{ fontSize: 11 }} />
        <YAxis domain={[0, 100]} tick={{ fontSize: 11 }} width={32} />
        <ReferenceLine
          y={55}
          stroke={highColor}
          strokeDasharray="4 4"
          label={{ value: "HIGH", fontSize: 10, position: "insideTopRight", fill: highColor }}
        />
        <ReferenceLine
          y={30}
          stroke={mediumColor}
          strokeDasharray="4 4"
          label={{ value: "MEDIUM", fontSize: 10, position: "insideTopRight", fill: mediumColor }}
        />
        <Tooltip formatter={(value) => `${value}${scoreUnit}`} />
        <Line
          type="monotone"
          dataKey="score"
          stroke={isDark ? "#cbd5e1" : "#334155"}
          strokeWidth={2}
          dot={{ r: 3 }}
        />
      </LineChart>
    </ResponsiveContainer>
  );
}
