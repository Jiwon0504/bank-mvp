"use client";

import { useState } from "react";
import Link from "next/link";
import { RiskLevelBadge } from "@/components/shared/RiskLevelBadge";
import { formatEok } from "@/lib/format";
import { cn } from "@/lib/utils";
import {
  getCompanyById,
  getCompanyExposure,
} from "@/lib/repository/companyRepository";
import {
  getRelatedCompanies,
  getCounterpartiesByCompany,
} from "@/lib/repository/relationshipRepository";
import type { Company } from "@/lib/types";

interface NodeInfo {
  company: Company;
  role: string;
  relationDetail: string;
}

function GraphNode({
  info,
  selected,
  onSelect,
}: {
  info: NodeInfo;
  selected: boolean;
  onSelect: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onSelect}
      aria-pressed={selected}
      className={cn(
        "flex min-w-[180px] flex-col rounded-md border bg-card p-3 text-left transition hover:border-foreground/40",
        selected && "border-foreground ring-1 ring-foreground/20"
      )}
    >
      <span className="text-[10px] font-medium tracking-wide text-muted-foreground">
        {info.role}
      </span>
      <span className="font-medium">{info.company.name}</span>
      <span className="text-xs text-muted-foreground">{info.company.industry}</span>
      <div className="mt-1">
        <RiskLevelBadge level={info.company.currentEwsRiskLevel} />
      </div>
    </button>
  );
}

function level1For(companyId: string): NodeInfo[] {
  const relations = getRelatedCompanies(companyId);
  const relatedCompanies = relations
    .map((r) => {
      const otherId = r.companyId === companyId ? r.relatedCompanyId : r.companyId;
      const company = getCompanyById(otherId);
      if (!company) return null;
      const detail = r.ownershipPct
        ? `${r.relationType} · 지분 ${r.ownershipPct}%`
        : r.relationType;
      return { company, role: "관계사", relationDetail: detail };
    })
    .filter((n): n is NodeInfo => Boolean(n));

  const counterpartyCompanies = getCounterpartiesByCompany(companyId)
    .filter((c) => c.counterpartyCompanyId)
    .map((c) => {
      const company = getCompanyById(c.counterpartyCompanyId as string);
      if (!company) return null;
      const roleLabel = c.role === "CUSTOMER" ? "고객" : "공급처";
      return {
        company,
        role: "주요 거래처",
        relationDetail: `${roleLabel} · 집중도 ${c.concentrationPct}% · 연 거래액 ${formatEok(
          c.annualTransactionVolume
        )}`,
      };
    })
    .filter((n): n is NodeInfo => Boolean(n));

  return [...relatedCompanies, ...counterpartyCompanies];
}

// A simple, dependency-free relationship tree (root -> level1 -> level2),
// deliberately not a full force-directed graph — the scenario this renders
// is small and fixed, so a plain nested layout reads more clearly than a
// generic graph library would for a 3-4 node case. Nodes are click targets
// (not links) so selecting one shows relation/Exposure/Risk detail inline
// without leaving the Investigation view.
export function RiskGraphSimple({ companyId }: { companyId: string }) {
  const [selected, setSelected] = useState<NodeInfo | null>(null);

  const root = getCompanyById(companyId);
  if (!root) return null;

  const level1 = level1For(companyId);
  const seen = new Set([companyId, ...level1.map((l) => l.company.id)]);

  if (level1.length === 0) {
    return (
      <p className="text-sm text-muted-foreground">연결된 관계사/거래처 데이터가 없습니다.</p>
    );
  }

  const rootInfo: NodeInfo = { company: root, role: "차주 (중심)", relationDetail: "본인" };

  return (
    <div className="space-y-3">
      <GraphNode
        info={rootInfo}
        selected={selected?.company.id === root.id}
        onSelect={() => setSelected(rootInfo)}
      />
      <div className="ml-6 space-y-4 border-l-2 border-dashed border-muted-foreground/30 pl-6">
        {level1.map((info) => {
          const level2 = level1For(info.company.id).filter((l) => !seen.has(l.company.id));
          return (
            <div key={info.company.id} className="space-y-2">
              <GraphNode
                info={info}
                selected={selected?.company.id === info.company.id}
                onSelect={() => setSelected(info)}
              />
              {level2.length > 0 && (
                <div className="ml-6 flex flex-wrap gap-2 border-l-2 border-dashed border-muted-foreground/20 pl-6">
                  {level2.map((l) => (
                    <GraphNode
                      key={l.company.id}
                      info={{ ...l, role: `2차 ${l.role}` }}
                      selected={selected?.company.id === l.company.id}
                      onSelect={() => setSelected(l)}
                    />
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {selected && (
        <div className="rounded-md border bg-muted/20 p-3 text-sm">
          <div className="flex items-center justify-between">
            <p className="font-medium">{selected.company.name}</p>
            <Link
              href={`/companies/${selected.company.id}`}
              className="text-xs font-medium hover:underline"
            >
              전체 프로필 보기 →
            </Link>
          </div>
          <dl className="mt-2 grid grid-cols-2 gap-2 sm:grid-cols-4">
            <div>
              <dt className="text-xs text-muted-foreground">관계 유형</dt>
              <dd className="font-medium">{selected.relationDetail}</dd>
            </div>
            <div>
              <dt className="text-xs text-muted-foreground">당행 Exposure</dt>
              <dd className="font-medium tabular-nums">
                {formatEok(getCompanyExposure(selected.company.id))}
              </dd>
            </div>
            <div>
              <dt className="text-xs text-muted-foreground">EWS Risk Score</dt>
              <dd className="flex items-center gap-1.5 font-medium tabular-nums">
                {selected.company.currentEwsRiskScore}
                <RiskLevelBadge level={selected.company.currentEwsRiskLevel} />
              </dd>
            </div>
            <div>
              <dt className="text-xs text-muted-foreground">산업 / 지역</dt>
              <dd className="font-medium">
                {selected.company.industry} · {selected.company.region}
              </dd>
            </div>
          </dl>
        </div>
      )}
    </div>
  );
}
