// Single source of truth for all UI-chrome strings (labels, headings,
// buttons, column headers, status labels, static guidance text). This does
// NOT translate synthetic business data (company names, RM notes, event
// descriptions, generated risk-analysis prose, timeline narrative text) —
// those stay as authored, per the demo's data/workflow being off-limits.
export type Locale = "ko" | "en";

export const LOCALE_COOKIE = "NEXT_LOCALE";
export const DEFAULT_LOCALE: Locale = "ko";

export interface Dictionary {
  nav: {
    dashboard: string;
    events: string;
    demoTag: string;
  };
  demoSteps: readonly [string, string, string, string, string, string, string, string, string];
  common: {
    detail: string;
    back: string;
    none: string;
    self: string;
    relatedCompany: string;
    counterparty: string;
    customer: string;
    supplier: string;
    scoreUnit: string;
  };
  dashboard: {
    title: string;
    subtitle: string;
    kpi: {
      priorityCandidates: string;
      highRisk: string;
      detectedSignals: string;
      newSignals: string;
      investigations: string;
      totalExposure: string;
      totalBorrowers: string;
    };
    unitCompany: string;
    unitCase: string;
    unitSignal: string;
    investigationBreakdownLabel: string;
    industryChart: string;
    regionChart: string;
    borrowerTable: string;
    columns: {
      company: string;
      industry: string;
      region: string;
      ewsRisk: string;
      score: string;
      connectedRisk: string;
      connectedScore: string;
      exposure: string;
    };
    priorityTag: string;
    priorityCandidatesTitle: string;
    priorityCandidatesSubtitle: string;
    noPriorityCandidates: string;
    ewsLabel: string;
    connectedLabel: string;
    signalsFoundLabel: string;
  };
  company: {
    performing: string;
    delinquentStatus: string;
    watchList: string;
    hiddenRiskCase: string;
    whyRisky: string;
    normalStatusNote: string;
    ceoPrefix: string;
    establishedPrefix: string;
    employeesSuffix: string;
    creditRatingPrefix: string;
    exposureLoans: {
      title: string;
      exposureLabel: string;
      loanCountLabel: string;
      loanCountUnit: string;
      importDependency: string;
      columns: {
        product: string;
        principal: string;
        balance: string;
        rate: string;
        collateral: string;
        delinquency: string;
        maturity: string;
      };
    };
    ews: {
      title: string;
      deltaPrefix: string;
      noHistory: string;
    };
    financials: {
      title: string;
      noData: string;
      nextTimelineLabel: string;
      columns: {
        period: string;
        revenue: string;
        receivables: string;
        cashFlow: string;
        netProfit: string;
        debtRatio: string;
      };
      chartLegend: {
        revenue: string;
        receivables: string;
        cashFlow: string;
      };
    };
    transactions: {
      title: string;
      noData: string;
      inflow: string;
      outflow: string;
      columns: {
        date: string;
        type: string;
        category: string;
        amount: string;
      };
    };
    relations: {
      title: string;
      relatedCompaniesLabel: string;
      counterpartiesLabel: string;
      noRelated: string;
      noCounterparty: string;
      concentration: string;
    };
    externalSignals: {
      title: string;
      noNews: string;
    };
    rmNotes: {
      title: string;
      noNotes: string;
    };
  };
  investigation: {
    breadcrumbBack: string;
    title: string;
    subtitleQuote: string;
    modelRisk: string;
    timeline: {
      title: string;
      noData: string;
      showEvidence: string;
      hideEvidence: string;
      whyConnected: string;
      relatedLoans: string;
      executedOn: string;
      balanceLabel: string;
      principalLabel: string;
      financialStatement: string;
      relatedTransactions: string;
      total: string;
      relatedCompaniesExposure: string;
      externalEvent: string;
      investigationLabel: string;
      rmNote: string;
      categories: {
        LOAN: string;
        FINANCIAL: string;
        TRANSACTION: string;
        RELATED_PARTY: string;
        EXTERNAL_EVENT: string;
        INVESTIGATION: string;
        EWS: string;
        RM_NOTE: string;
      };
      nextLinkLabel: string;
      financialLabels: {
        revenue: string;
        receivables: string;
        cashFlow: string;
        netProfit: string;
      };
    };
    graph: {
      title: string;
      noData: string;
      rootRole: string;
      secondaryPrefix: string;
      viewProfile: string;
      relationType: string;
      exposureLabel: string;
      riskScore: string;
      industryRegion: string;
      nextLinkLabel: string;
      annualVolumeLabel: string;
      ownershipLabel: string;
    };
    crossExposure: {
      title: string;
      subtitle: string;
      noData: string;
      totalLabel: string;
      columns: {
        company: string;
        institution: string;
        exposure: string;
        asOf: string;
      };
    };
    externalEvent: {
      title: string;
      noData: string;
      showDetail: string;
      hideDetail: string;
      affectedNetworkLabel: string;
      viewIndustryImpact: string;
      nextLinkLabel: string;
      whySelf: string;
      whyCounterparty: string;
      whyRelated: string;
    };
    summary: {
      title: string;
      referenceTag: string;
      disclaimer: string;
      priorityQuestionsTitle: string;
      sectionTitles: readonly [string, string, string, string, string, string];
      nextLinkLabel: string;
    };
    assistant: {
      title: string;
      referenceTag: string;
      disclaimer: string;
      placeholder: string;
      send: string;
      sending: string;
      emptyState: string;
      userLabel: string;
      assistantLabel: string;
      errorPrefix: string;
    };
    actionHeading: {
      title: string;
      subtitle: string;
    };
    humanReview: {
      title: string;
      subtitle: string;
      noInvestigationYet: string;
      decisionLabel: string;
      decisionPlaceholder: string;
      decisions: {
        NEEDS_VERIFICATION: string;
        WATCHLIST: string;
        MAINTAIN_NORMAL: string;
        CREDIT_REVIEW: string;
      };
      rationaleLabel: string;
      rationalePlaceholder: string;
      evidenceLabel: string;
      evidencePlaceholder: string;
      submit: string;
    };
    action: {
      title: string;
      subtitle: string;
      createdBannerPrefix: string;
      updatedBannerPrefix: string;
      noActions: string;
      noteLabel: string;
      notePlaceholder: string;
      types: {
        SITE_VISIT_REQUEST: string;
        CREDIT_REVIEW_REQUEST: string;
        WATCHLIST_REGISTER: string;
        INVESTIGATION_CREATE: string;
      };
      statusStart: string;
      statusComplete: string;
    };
    workflow: {
      title: string;
      statusLabel: string;
      startButton: string;
      updatedBannerPrefix: string;
      closeSectionTitle: string;
      evidenceTitle: string;
      evidenceEmpty: string;
      findingTypeLabel: string;
      findingTypePlaceholder: string;
      findingTypes: {
        CONFIRMED_NORMAL: string;
        NEEDS_FURTHER_VERIFICATION: string;
        POTENTIAL_IMPAIRMENT_RISK: string;
        SUSPECTED_FRAUD: string;
        EXTERNAL_EVENT_IMPACT: string;
      };
      findingDetailLabel: string;
      findingDetailPlaceholder: string;
      finalJudgmentLabel: string;
      finalJudgmentPlaceholder: string;
      closeButton: string;
      closedSummaryTitle: string;
      closedByPrefix: string;
      noInvestigationYet: string;
    };
    manage: {
      summary: string;
      noInvestigations: string;
      newInvestigation: string;
    };
  };
  events: {
    title: string;
    subtitle: string;
    affectedCountPrefix: string;
    affectedCountSuffix: string;
    viewAffected: string;
    detail: {
      back: string;
      descriptionTitle: string;
      affectedTitlePrefix: string;
      affectedTitleSuffix: string;
      affectedSubtitle: string;
      noAffected: string;
      columns: {
        company: string;
        industry: string;
        importDependency: string;
        ewsRisk: string;
        exposure: string;
      };
    };
  };
}

export const translations: Record<Locale, Dictionary> = {
  ko: {
    nav: {
      dashboard: "Dashboard",
      events: "External Event Impact",
      demoTag: "DEMO · Synthetic Data",
    },
    demoSteps: [
      "Hidden Risk Case 발견",
      "세림테크 선택",
      "정상 여신 확인",
      "Risk Signal 확인",
      "Risk Timeline",
      "관계망 Graph",
      "External Event 연결",
      "AI Investigation Summary",
      "Action 선택",
    ],
    common: {
      detail: "상세보기 →",
      back: "뒤로",
      none: "-",
      self: "본인 산업",
      relatedCompany: "관계사",
      counterparty: "주요 거래처",
      customer: "고객",
      supplier: "공급처",
      scoreUnit: "점",
    },
    dashboard: {
      title: "Credit Risk Dashboard",
      subtitle: "EWS 결과와 내/외부 데이터를 연결한 여신 리스크 현황 · synthetic mock data",
      kpi: {
        priorityCandidates: "우선 Investigation 대상",
        highRisk: "High Risk 차주 수 (EWS)",
        detectedSignals: "탐지된 Risk Signal 수",
        newSignals: "신규 Risk Signal (14일)",
        investigations: "Investigation 진행 건수",
        totalExposure: "전체 여신 규모",
        totalBorrowers: "전체 차주 수",
      },
      unitCompany: "개사",
      unitCase: "건",
      unitSignal: "개 신호",
      investigationBreakdownLabel: "OPEN / IN_PROGRESS / CLOSED",
      industryChart: "산업별 Risk 분포 (Exposure 기준)",
      regionChart: "지역별 Risk 분포 (Exposure 기준)",
      borrowerTable: "차주 목록 (연결 Risk 우선순위 · Score 높은 순)",
      columns: {
        company: "기업명",
        industry: "산업",
        region: "지역",
        ewsRisk: "EWS Risk",
        score: "EWS Score",
        connectedRisk: "Connected Risk",
        connectedScore: "Connected Score",
        exposure: "Exposure",
      },
      priorityTag: "우선순위",
      priorityCandidatesTitle: "우선 Investigation 대상",
      priorityCandidatesSubtitle:
        "EWS는 현재 정상(LOW/MEDIUM)으로 보고 있지만, 재무·거래·관계사·외부 이벤트 데이터를 연결하면 위험 신호가 확인되는 차주입니다. 연체 이력이 있는 차주는 이미 EWS로 포착되어 제외됩니다.",
      noPriorityCandidates: "현재 데이터 기준으로 우선 확인이 필요한 차주가 없습니다.",
      ewsLabel: "EWS",
      connectedLabel: "Connected",
      signalsFoundLabel: "탐지된 Signal",
    },
    company: {
      performing: "Performing (연체 없음)",
      delinquentStatus: "연체 발생",
      watchList: "Watch List",
      hiddenRiskCase: "Hidden Risk Case",
      whyRisky: "왜 위험한가? →",
      normalStatusNote:
        "현재 정상 여신으로 관리되고 있으나, 아래 연결된 재무·거래·관계사 데이터에서 주의가 필요한 신호가 함께 나타납니다.",
      ceoPrefix: "대표",
      establishedPrefix: "설립",
      employeesSuffix: "명",
      creditRatingPrefix: "신용등급",
      exposureLoans: {
        title: "Exposure & 대출",
        exposureLabel: "당행 Exposure",
        loanCountLabel: "대출 건수",
        loanCountUnit: "건",
        importDependency: "수입 의존도",
        columns: {
          product: "상품",
          principal: "원금",
          balance: "잔액",
          rate: "금리",
          collateral: "담보",
          delinquency: "연체",
          maturity: "만기",
        },
      },
      ews: {
        title: "EWS Risk Score",
        deltaPrefix: "전기 대비",
        noHistory: "EWS 이력 데이터 없음",
      },
      financials: {
        title: "재무제표 (매출 / 매출채권 / 영업현금흐름)",
        noData: "재무 데이터 없음",
        nextTimelineLabel: "Risk Timeline에서 이 신호들이 어떻게 이어지는지 확인하기",
        columns: {
          period: "기간",
          revenue: "매출",
          receivables: "매출채권",
          cashFlow: "영업현금흐름",
          netProfit: "순이익",
          debtRatio: "부채비율",
        },
        chartLegend: {
          revenue: "매출",
          receivables: "매출채권",
          cashFlow: "영업현금흐름",
        },
      },
      transactions: {
        title: "거래 내역",
        noData: "거래 데이터 없음",
        inflow: "입금",
        outflow: "출금",
        columns: {
          date: "일자",
          type: "구분",
          category: "분류",
          amount: "금액",
        },
      },
      relations: {
        title: "관계사 / 주요 거래처",
        relatedCompaniesLabel: "관계사",
        counterpartiesLabel: "주요 거래처",
        noRelated: "관계사 데이터 없음",
        noCounterparty: "거래처 데이터 없음",
        concentration: "집중도",
      },
      externalSignals: {
        title: "외부 시그널 (News)",
        noNews: "관련 뉴스 없음",
      },
      rmNotes: {
        title: "담당자 메모",
        noNotes: "담당자 메모 없음",
      },
    },
    investigation: {
      breadcrumbBack: "←",
      title: "Risk Investigation",
      subtitleQuote: "“정상 여신인데 왜 위험한가?” — 연결된 데이터 소스를 종합한 근거 기반 설명입니다.",
      modelRisk: "Model Risk",
      timeline: {
        title: "Risk Signal Timeline",
        noData: "이 차주에 대한 Risk Signal Timeline 데이터가 없습니다.",
        showEvidence: "근거 보기 ▼",
        hideEvidence: "근거 숨기기 ▲",
        whyConnected: "왜 Risk Signal과 연결되는가 — ",
        relatedLoans: "관련 대출",
        executedOn: "실행일",
        balanceLabel: "잔액",
        principalLabel: "원금",
        financialStatement: "재무제표",
        relatedTransactions: "관련 거래 (거래일 · 금액) — 합계",
        total: "합계",
        relatedCompaniesExposure: "관련 회사 · Exposure",
        externalEvent: "외부 Event",
        investigationLabel: "Investigation",
        rmNote: "담당자 메모",
        categories: {
          LOAN: "대출",
          FINANCIAL: "재무",
          TRANSACTION: "거래",
          RELATED_PARTY: "관계사",
          EXTERNAL_EVENT: "외부 Event",
          INVESTIGATION: "Investigation",
          EWS: "EWS",
          RM_NOTE: "담당자 메모",
        },
        nextLinkLabel: "다음: 관계사·거래처 관계망 Graph 확인하기 →",
        financialLabels: {
          revenue: "매출",
          receivables: "매출채권",
          cashFlow: "영업현금흐름",
          netProfit: "순이익",
        },
      },
      graph: {
        title: "Risk Propagation Graph",
        noData: "연결된 관계사/거래처 데이터가 없습니다.",
        rootRole: "차주 (중심)",
        secondaryPrefix: "2차 ",
        viewProfile: "전체 프로필 보기 →",
        relationType: "관계 유형",
        exposureLabel: "당행 Exposure",
        riskScore: "EWS Risk Score",
        industryRegion: "산업 / 지역",
        nextLinkLabel: "다음: 이 관계망에 영향을 준 External Event 확인하기 →",
        annualVolumeLabel: "연 거래액",
        ownershipLabel: "지분",
      },
      crossExposure: {
        title: "Cross-Institution Exposure (참고)",
        subtitle: "기준, 금융권 전체(가상) Exposure — 실제 금융기관명이 아닌 데모용 명칭(금융기관 A/B/C) 사용",
        noData: "Cross-institution exposure 데이터 없음.",
        totalLabel: "그룹 전체 금융권 Exposure 합계",
        columns: {
          company: "기업",
          institution: "금융기관",
          exposure: "Exposure",
          asOf: "기준일",
        },
      },
      externalEvent: {
        title: "External Event 연결",
        noData: "이 차주의 연결망(본인/관계사/주요 거래처)에 영향을 주는 외부 Event가 없습니다.",
        showDetail: "영향 상세 보기 ▼",
        hideDetail: "닫기 ▲",
        affectedNetworkLabel: "영향받는 연결망 · 합계 Exposure",
        viewIndustryImpact: "이 이벤트의 산업 전체 영향 보기 →",
        nextLinkLabel: "다음: AI Investigation Summary로 전체 근거 종합해서 보기 →",
        whySelf: "본인 업종({industry})이 이 이벤트의 영향 산업에 포함되어 직접 영향 가능성이 있습니다.",
        whyCounterparty:
          "주요 거래처({name})가 영향 산업에 속해 있어, 해당 거래처에 문제가 발생하면 매출·자금 흐름에 직접 영향을 줄 수 있습니다.",
        whyRelated: "관계사({name})가 영향 산업에 속해 있어, 관계사 리스크가 그룹 내로 전이될 가능성이 있습니다.",
      },
      summary: {
        title: "AI Investigation Summary",
        referenceTag: "System-generated reference",
        disclaimer:
          "규칙 기반 자동 요약이며(현재 버전은 AI 생성이 아닌 결정론적 로직, 향후 Claude API로 교체 예정), 최종 판단은 아래 담당자 기록을 따릅니다. “위험하다”가 아니라 확인이 필요한 신호만 표현합니다.",
        priorityQuestionsTitle: "현재 가장 먼저 확인해야 할 사항",
        sectionTitles: [
          "1. 현재 상태",
          "2. 발견된 위험 신호",
          "3. 서로 연결되는 근거",
          "4. 아직 확인되지 않은 사항",
          "5. 추가 조사가 필요한 이유",
          "6. 담당자가 검토할 수 있는 Action",
        ],
        nextLinkLabel: "다음: 담당자 판단 기록하고 Action 선택하기 →",
      },
      assistant: {
        title: "AI Assistant",
        referenceTag: "Powered by Claude",
        disclaimer:
          "이 차주의 내부 데이터를 근거로 Claude API가 실시간으로 답변합니다. 의사결정을 지원하기 위한 참고 자료이며, 자동 심사·승인 결과가 아닙니다.",
        placeholder: "예: 이 차주의 매출채권이 급증한 이유가 뭐야?",
        send: "질문하기",
        sending: "답변 생성 중...",
        emptyState: "아직 질문이 없습니다. 이 차주에 대해 자유롭게 질문해보세요.",
        userLabel: "나",
        assistantLabel: "AI Assistant",
        errorPrefix: "오류: ",
      },
      actionHeading: {
        title: "담당자의 판단과 Action",
        subtitle: "— 이 기록이 공식 결정입니다",
      },
      humanReview: {
        title: "Human-in-the-loop 판단",
        subtitle: "EWS Model Risk 및 위 참고 요약과 무관하게, 담당자의 독립적인 판단을 기록합니다.",
        noInvestigationYet: "Human-in-the-loop 판단을 기록하려면 먼저 Investigation을 개설하세요 (아래).",
        decisionLabel: "담당자 판단",
        decisionPlaceholder: "판단을 선택하세요",
        decisions: {
          NEEDS_VERIFICATION: "확인 필요",
          WATCHLIST: "Watch List 등록",
          MAINTAIN_NORMAL: "정상 유지",
          CREDIT_REVIEW: "심사부 검토",
        },
        rationaleLabel: "판단 근거",
        rationalePlaceholder: "예: 최근 대규모 신규 수주가 확인되어 현재 Risk를 Watch 상태로 판단",
        evidenceLabel: "Evidence / 비고",
        evidencePlaceholder: "근거 자료, 참고사항 등",
        submit: "제출",
      },
      action: {
        title: "Action",
        subtitle: "판단을 실행 가능한 조치로 연결합니다.",
        createdBannerPrefix: "✓ Action 생성됨 — ",
        updatedBannerPrefix: "✓ Action 상태 변경됨 — ",
        noActions: "생성된 Action이 없습니다.",
        noteLabel: "비고 (선택)",
        notePlaceholder: "Action 관련 참고사항",
        types: {
          SITE_VISIT_REQUEST: "현장 확인 요청",
          CREDIT_REVIEW_REQUEST: "심사부 검토 요청",
          WATCHLIST_REGISTER: "Watch List 등록",
          INVESTIGATION_CREATE: "Investigation 생성",
        },
        statusStart: "진행 시작",
        statusComplete: "완료 처리",
      },
      workflow: {
        title: "Investigation 진행 상태",
        statusLabel: "현재 상태",
        startButton: "조사 착수 (진행중으로 전환)",
        updatedBannerPrefix: "✓ 상태 변경됨 — ",
        closeSectionTitle: "Investigation 종료",
        evidenceTitle: "지금까지 기록된 Human-in-the-loop 판단",
        evidenceEmpty: "아직 기록된 Human-in-the-loop 판단이 없습니다.",
        findingTypeLabel: "최종 분류",
        findingTypePlaceholder: "분류를 선택하세요",
        findingTypes: {
          CONFIRMED_NORMAL: "정상 거래로 확인",
          NEEDS_FURTHER_VERIFICATION: "추가 확인 필요",
          POTENTIAL_IMPAIRMENT_RISK: "잠재 부실 위험",
          SUSPECTED_FRAUD: "사기/거래 실재성 의심",
          EXTERNAL_EVENT_IMPACT: "외부 이벤트 영향",
        },
        findingDetailLabel: "세부 조사 내용",
        findingDetailPlaceholder: "확인한 근거, 조사 경과 등",
        finalJudgmentLabel: "최종 판단 (필수)",
        finalJudgmentPlaceholder:
          "예: 최근 매출채권 증가는 신규 대형 거래처向 매출 확대로 확인, 정상 거래로 판단",
        closeButton: "Investigation 종료",
        closedSummaryTitle: "종료 요약",
        closedByPrefix: "종료자: ",
        noInvestigationYet: "아직 개설된 Investigation이 없습니다. 아래에서 새 Investigation을 개설하세요.",
      },
      manage: {
        summary: "Investigation 관리 (개설 이력 / 새 Investigation 개설)",
        noInvestigations: "개설된 Investigation이 없습니다.",
        newInvestigation: "+ 새 Investigation 개설",
      },
    },
    events: {
      title: "External Event Impact",
      subtitle:
        "외부 이벤트를 선택하면 영향을 받을 가능성이 있는 산업/차주를 보여줍니다 (예: 환율 상승 → 수입 의존 산업 → 해당 차주 → 예상 Risk Signal)",
      affectedCountPrefix: "영향 가능 차주: ",
      affectedCountSuffix: "개사",
      viewAffected: "영향받는 차주 보기 →",
      detail: {
        back: "← External Event Impact",
        descriptionTitle: "이벤트 설명",
        affectedTitlePrefix: "영향 가능 차주 (",
        affectedTitleSuffix: "개사)",
        affectedSubtitle: "이벤트 영향 산업에 속한 차주 목록입니다. 실제 영향 여부는 개별 확인이 필요합니다.",
        noAffected: "영향받는 차주가 없습니다.",
        columns: {
          company: "기업명",
          industry: "산업",
          importDependency: "수입 의존도",
          ewsRisk: "EWS Risk",
          exposure: "Exposure",
        },
      },
    },
  },
  en: {
    nav: {
      dashboard: "Dashboard",
      events: "External Event Impact",
      demoTag: "DEMO · Synthetic Data",
    },
    demoSteps: [
      "Spot a Hidden Risk Case",
      "Select 세림테크",
      "Confirm performing status",
      "Check the Risk Signal",
      "Risk Timeline",
      "Relationship Graph",
      "Connect an External Event",
      "AI Investigation Summary",
      "Choose an Action",
    ],
    common: {
      detail: "Details →",
      back: "Back",
      none: "-",
      self: "Own industry",
      relatedCompany: "Related company",
      counterparty: "Key counterparty",
      customer: "Customer",
      supplier: "Supplier",
      scoreUnit: "",
    },
    dashboard: {
      title: "Credit Risk Dashboard",
      subtitle: "Credit risk view linking EWS results with internal/external data · synthetic mock data",
      kpi: {
        priorityCandidates: "Priority Investigation Candidates",
        highRisk: "High Risk Borrowers (EWS)",
        detectedSignals: "Detected Risk Signals",
        newSignals: "New Risk Signals (14d)",
        investigations: "Investigations In Progress",
        totalExposure: "Total Exposure",
        totalBorrowers: "Total Borrowers",
      },
      unitCompany: "",
      unitCase: "",
      unitSignal: " signals",
      investigationBreakdownLabel: "OPEN / IN_PROGRESS / CLOSED",
      industryChart: "Risk Distribution by Industry (by Exposure)",
      regionChart: "Risk Distribution by Region (by Exposure)",
      borrowerTable: "Borrowers (ranked by Connected Risk priority, then Score)",
      columns: {
        company: "Company",
        industry: "Industry",
        region: "Region",
        ewsRisk: "EWS Risk",
        score: "EWS Score",
        connectedRisk: "Connected Risk",
        connectedScore: "Connected Score",
        exposure: "Exposure",
      },
      priorityTag: "Priority",
      priorityCandidatesTitle: "Priority Investigation Candidates",
      priorityCandidatesSubtitle:
        "EWS currently reads these as normal (LOW/MEDIUM), but connecting financial, transaction, related-party, and external-event data surfaces a risk signal. Borrowers with delinquency history are excluded — EWS already catches those.",
      noPriorityCandidates: "No borrowers currently need priority review based on the connected data.",
      ewsLabel: "EWS",
      connectedLabel: "Connected",
      signalsFoundLabel: "Signals found",
    },
    company: {
      performing: "Performing (no delinquency)",
      delinquentStatus: "Delinquent",
      watchList: "Watch List",
      hiddenRiskCase: "Hidden Risk Case",
      whyRisky: "Why is this risky? →",
      normalStatusNote:
        "Currently managed as a performing loan, but the connected financial / transaction / related-party data below shows signals that need attention.",
      ceoPrefix: "CEO",
      establishedPrefix: "Founded",
      employeesSuffix: " employees",
      creditRatingPrefix: "Credit rating",
      exposureLoans: {
        title: "Exposure & Loans",
        exposureLabel: "Bank Exposure",
        loanCountLabel: "Loan count",
        loanCountUnit: "",
        importDependency: "Import dependency",
        columns: {
          product: "Product",
          principal: "Principal",
          balance: "Balance",
          rate: "Rate",
          collateral: "Collateral",
          delinquency: "Delinquency",
          maturity: "Maturity",
        },
      },
      ews: {
        title: "EWS Risk Score",
        deltaPrefix: "vs. previous",
        noHistory: "No EWS history available",
      },
      financials: {
        title: "Financial Statements (Revenue / Receivables / Operating Cash Flow)",
        noData: "No financial data available",
        nextTimelineLabel: "See how these signals connect in the Risk Timeline",
        columns: {
          period: "Period",
          revenue: "Revenue",
          receivables: "Receivables",
          cashFlow: "Op. Cash Flow",
          netProfit: "Net Profit",
          debtRatio: "Debt Ratio",
        },
        chartLegend: {
          revenue: "Revenue",
          receivables: "Receivables",
          cashFlow: "Op. Cash Flow",
        },
      },
      transactions: {
        title: "Transaction History",
        noData: "No transaction data available",
        inflow: "Inflow",
        outflow: "Outflow",
        columns: {
          date: "Date",
          type: "Type",
          category: "Category",
          amount: "Amount",
        },
      },
      relations: {
        title: "Related Companies / Key Counterparties",
        relatedCompaniesLabel: "Related companies",
        counterpartiesLabel: "Key counterparties",
        noRelated: "No related-company data available",
        noCounterparty: "No counterparty data available",
        concentration: "Concentration",
      },
      externalSignals: {
        title: "External Signals (News)",
        noNews: "No related news",
      },
      rmNotes: {
        title: "RM Notes",
        noNotes: "No RM notes",
      },
    },
    investigation: {
      breadcrumbBack: "←",
      title: "Risk Investigation",
      subtitleQuote: "“Why is a performing loan risky?” — an evidence-based explanation synthesizing connected data sources.",
      modelRisk: "Model Risk",
      timeline: {
        title: "Risk Signal Timeline",
        noData: "No Risk Signal Timeline data for this borrower.",
        showEvidence: "Show evidence ▼",
        hideEvidence: "Hide evidence ▲",
        whyConnected: "Why this connects to the risk signal — ",
        relatedLoans: "Related loans",
        executedOn: "Executed",
        balanceLabel: "Balance",
        principalLabel: "principal",
        financialStatement: "Financial statement",
        relatedTransactions: "Related transactions (date · amount) — total",
        total: "Total",
        relatedCompaniesExposure: "Related companies · Exposure",
        externalEvent: "External Event",
        investigationLabel: "Investigation",
        rmNote: "RM note",
        categories: {
          LOAN: "Loan",
          FINANCIAL: "Financial",
          TRANSACTION: "Transaction",
          RELATED_PARTY: "Related party",
          EXTERNAL_EVENT: "External Event",
          INVESTIGATION: "Investigation",
          EWS: "EWS",
          RM_NOTE: "RM note",
        },
        nextLinkLabel: "Next: check the related-company / counterparty Risk Propagation Graph →",
        financialLabels: {
          revenue: "Revenue",
          receivables: "Receivables",
          cashFlow: "Op. cash flow",
          netProfit: "Net profit",
        },
      },
      graph: {
        title: "Risk Propagation Graph",
        noData: "No related-company or counterparty data available.",
        rootRole: "Borrower (center)",
        secondaryPrefix: "2nd-degree ",
        viewProfile: "View full profile →",
        relationType: "Relation type",
        exposureLabel: "Bank Exposure",
        riskScore: "EWS Risk Score",
        industryRegion: "Industry / Region",
        nextLinkLabel: "Next: check the External Event that affected this network →",
        annualVolumeLabel: "annual volume",
        ownershipLabel: "ownership",
      },
      crossExposure: {
        title: "Cross-Institution Exposure (reference)",
        subtitle: "basis; system-wide (simulated) Exposure — uses demo institution names (금융기관 A/B/C), not real ones",
        noData: "No cross-institution exposure data available.",
        totalLabel: "Total group-wide financial-system Exposure",
        columns: {
          company: "Company",
          institution: "Institution",
          exposure: "Exposure",
          asOf: "As of",
        },
      },
      externalEvent: {
        title: "Connected External Events",
        noData: "No external events affect this borrower's network (self / related companies / key counterparties).",
        showDetail: "Show impact detail ▼",
        hideDetail: "Close ▲",
        affectedNetworkLabel: "Affected network · total Exposure",
        viewIndustryImpact: "View this event's full industry impact →",
        nextLinkLabel: "Next: see the full picture in the AI Investigation Summary →",
        whySelf: "This borrower's own industry ({industry}) is among the industries affected by this event, so it may be directly affected.",
        whyCounterparty:
          "Key counterparty ({name}) is in an affected industry — if that counterparty runs into trouble, it could directly affect revenue and cash flow.",
        whyRelated: "Related company ({name}) is in an affected industry, so its risk could transfer within the group.",
      },
      summary: {
        title: "AI Investigation Summary",
        referenceTag: "System-generated reference",
        disclaimer:
          "This is a rule-based automated summary (currently deterministic logic, not AI-generated — a Claude API version is planned). The final decision follows the RM record below. It states signals that need verification, not a verdict of “risky.”",
        priorityQuestionsTitle: "What to check first, right now",
        sectionTitles: [
          "1. Current status",
          "2. Risk signals found",
          "3. How they connect",
          "4. Not yet verified",
          "5. Why further review is needed",
          "6. Actions the RM can consider",
        ],
        nextLinkLabel: "Next: record the RM's judgment and choose an Action →",
      },
      assistant: {
        title: "AI Assistant",
        referenceTag: "Powered by Claude",
        disclaimer:
          "Claude API answers in real time based on this borrower's internal data. This is decision-support reference material, not an automated review or approval result.",
        placeholder: "e.g., Why did this borrower's receivables spike?",
        send: "Ask",
        sending: "Generating answer...",
        emptyState: "No questions yet. Ask anything about this borrower.",
        userLabel: "You",
        assistantLabel: "AI Assistant",
        errorPrefix: "Error: ",
      },
      actionHeading: {
        title: "RM Judgment & Action",
        subtitle: "— this record is the official decision",
      },
      humanReview: {
        title: "Human-in-the-loop Judgment",
        subtitle: "Records the RM's independent judgment, regardless of EWS Model Risk or the reference summary above.",
        noInvestigationYet: "Open an Investigation first (below) to record a human-in-the-loop judgment.",
        decisionLabel: "RM Judgment",
        decisionPlaceholder: "Select a judgment",
        decisions: {
          NEEDS_VERIFICATION: "Needs verification",
          WATCHLIST: "Add to Watch List",
          MAINTAIN_NORMAL: "Keep as normal",
          CREDIT_REVIEW: "Credit review",
        },
        rationaleLabel: "Rationale",
        rationalePlaceholder: "e.g., a large new order was confirmed, so risk is currently assessed as Watch",
        evidenceLabel: "Evidence / notes",
        evidencePlaceholder: "Supporting materials, notes, etc.",
        submit: "Submit",
      },
      action: {
        title: "Action",
        subtitle: "Turns the judgment into an actionable step.",
        createdBannerPrefix: "✓ Action created — ",
        updatedBannerPrefix: "✓ Action status updated — ",
        noActions: "No Actions created yet.",
        noteLabel: "Note (optional)",
        notePlaceholder: "Notes related to this Action",
        types: {
          SITE_VISIT_REQUEST: "Request Site Visit",
          CREDIT_REVIEW_REQUEST: "Request Credit Review",
          WATCHLIST_REGISTER: "Add to Watch List",
          INVESTIGATION_CREATE: "Create Investigation",
        },
        statusStart: "Start",
        statusComplete: "Complete",
      },
      workflow: {
        title: "Investigation Status",
        statusLabel: "Current status",
        startButton: "Start investigation (move to In Progress)",
        updatedBannerPrefix: "✓ Status updated — ",
        closeSectionTitle: "Close Investigation",
        evidenceTitle: "Human-in-the-loop judgments recorded so far",
        evidenceEmpty: "No Human-in-the-loop judgment recorded yet.",
        findingTypeLabel: "Final classification",
        findingTypePlaceholder: "Select a classification",
        findingTypes: {
          CONFIRMED_NORMAL: "Confirmed normal",
          NEEDS_FURTHER_VERIFICATION: "Needs further verification",
          POTENTIAL_IMPAIRMENT_RISK: "Potential impairment risk",
          SUSPECTED_FRAUD: "Suspected fraud / transaction not genuine",
          EXTERNAL_EVENT_IMPACT: "External event impact",
        },
        findingDetailLabel: "Investigation detail",
        findingDetailPlaceholder: "Evidence reviewed, investigation notes, etc.",
        finalJudgmentLabel: "Final judgment (required)",
        finalJudgmentPlaceholder:
          "e.g., receivables growth confirmed as expansion with a new major customer — assessed as a normal transaction",
        closeButton: "Close investigation",
        closedSummaryTitle: "Closing summary",
        closedByPrefix: "Closed by: ",
        noInvestigationYet: "No investigation opened yet. Open a new one below.",
      },
      manage: {
        summary: "Manage Investigations (history / open a new one)",
        noInvestigations: "No Investigations opened yet.",
        newInvestigation: "+ Open new Investigation",
      },
    },
    events: {
      title: "External Event Impact",
      subtitle:
        "Select an external event to see which industries / borrowers could be affected (e.g., FX rate rises → import-dependent industries → those borrowers → expected Risk Signal)",
      affectedCountPrefix: "Potentially affected borrowers: ",
      affectedCountSuffix: "",
      viewAffected: "View affected borrowers →",
      detail: {
        back: "← External Event Impact",
        descriptionTitle: "Event description",
        affectedTitlePrefix: "Potentially Affected Borrowers (",
        affectedTitleSuffix: ")",
        affectedSubtitle: "Borrowers in industries affected by this event. Actual impact needs individual verification.",
        noAffected: "No affected borrowers.",
        columns: {
          company: "Company",
          industry: "Industry",
          importDependency: "Import Dependency",
          ewsRisk: "EWS Risk",
          exposure: "Exposure",
        },
      },
    },
  },
};
