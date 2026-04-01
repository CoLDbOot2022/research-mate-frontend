"use client";

import { Suspense, useCallback, useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { CheckCircle2, RefreshCcw, Sparkles, Wand2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { PhaseProgress } from "@/components/common/PhaseProgress";
import { getAccessToken } from "@/lib/auth";
import { api } from "@/lib/api/client";

type Topic = {
  topic_id: string;
  title: string;
  reasoning: string;
  description: string;
  tags: string[];
  difficulty: string;
  related_subjects: string[];
};

type GenerateReportResponse = {
  report_id: string;
  charged_package_code?: string;
  remaining_credit_balance?: number;
};

function TopicConfirmContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const reportType = searchParams.get("report_type") ?? "general";
  const reportTypeLabel = reportType === "premium" ? "프리미엄 리포트" : "일반 리포트";

  const [topic, setTopic] = useState<Topic | null>(null);
  const [loading, setLoading] = useState(true);
  const [generatingReport, setGeneratingReport] = useState(false);
  const [elapsedMs, setElapsedMs] = useState(0);

  const getRequestBody = useCallback(() => {
    return {
      subject: searchParams.get("subject") ?? "수학",
      unit_large: searchParams.get("unit_large") ?? "",
      unit_medium: searchParams.get("unit_medium") || null,
      unit_small: searchParams.get("unit_small") || null,
      career: searchParams.get("career") ?? "",
      difficulty: Number(searchParams.get("difficulty") ?? "60"),
      mode: searchParams.get("mode") ?? "new",
    };
  }, [searchParams]);

  const getRequestKey = useCallback(() => JSON.stringify(getRequestBody()), [getRequestBody]);

  useEffect(() => {
    if (!loading) return;
    const startedAt = Date.now();
    const timer = setInterval(() => setElapsedMs(Date.now() - startedAt), 150);
    return () => clearInterval(timer);
  }, [loading]);

  const fetchTopic = useCallback(async (forceRefresh = false) => {
    setLoading(true);
    try {
      const body = getRequestBody();
      const requestKey = getRequestKey();

      if (!forceRefresh && typeof window !== "undefined") {
        const cached = sessionStorage.getItem("topicConfirmCache");
        if (cached) {
          try {
            const parsed = JSON.parse(cached) as { requestKey: string; topic: Topic };
            if (parsed.requestKey === requestKey && parsed.topic) {
              setTopic(parsed.topic);
              setLoading(false);
              return;
            }
          } catch {
            // Ignore malformed cache and proceed to fetch.
          }
        }
      }

      const res = await api.post<Topic[]>("/topics/recommend", body);
      const selected = res[0] ?? null;
      setTopic(selected);
      if (selected && typeof window !== "undefined") {
        sessionStorage.setItem("topicConfirmCache", JSON.stringify({ requestKey, topic: selected }));
      }
    } catch (e) {
      console.error(e);
      setTopic(null);
    } finally {
      setLoading(false);
    }
  }, [getRequestBody, getRequestKey]);

  useEffect(() => {
    fetchTopic(false).catch(console.error);
  }, [fetchTopic]);

  const onConfirm = async () => {
    if (!topic) return;
    if (!getAccessToken()) {
      router.push("/login?callback=" + encodeURIComponent(window.location.pathname + window.location.search));
      return;
    }
    setGeneratingReport(true);
    try {
      const res = await api.post<GenerateReportResponse>("/reports/generate", {
        topic_id: topic.topic_id,
        report_type: reportType,
      });
      // Redirect back to report detail page to watch progress
      router.push(`/report/${res.report_id}`);
    } catch (e) {
      console.error(e);
      setGeneratingReport(false);
      alert("보고서 생성에 실패했습니다.");
    }
  };

  if (loading) {
    const progress = 100 * (1 - Math.pow(0.1, elapsedMs / 10000));
    const currentPhase = 
      progress < 25 ? "입력 분석" :
      progress < 65 ? "주제 탐색" : "최종 선택";

    return (
      <div className="min-h-screen bg-[linear-gradient(135deg,#f8fafc_0%,#fff7ed_45%,#eef2ff_100%)] py-12 px-4">
        <div className="max-w-3xl mx-auto">
          <PhaseProgress
            title="주제를 생성하고 있습니다"
            subtitle="입력한 과목/단원/진로를 바탕으로 가장 적합한 주제를 찾고 있어요."
            progress={progress}
            currentPhase={currentPhase}
            phases={[
              { label: "입력 분석", description: "교과 범위와 진로 키워드를 구조화합니다.", threshold: 25 },
              { label: "주제 탐색", description: "후보를 검토하고 적합도를 계산합니다.", threshold: 65 },
              { label: "최종 선택", description: "중복도를 줄이고 가장 나은 주제로 압축합니다.", threshold: 90 },
            ]}
          />
        </div>
      </div>
    );
  }

  if (!topic) {
    return (
      <div className="p-10 text-center">
        <p className="mb-4">주제 추천에 실패했습니다.</p>
        <Button onClick={() => router.push("/subject")}>다시 입력하기</Button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[linear-gradient(135deg,#f8fafc_0%,#fff7ed_45%,#eef2ff_100%)] py-12 px-4">
      <div className="max-w-4xl mx-auto space-y-6">
        <div className="rounded-3xl border bg-white/80 backdrop-blur px-8 py-7 shadow-sm">
          <p className="text-xs font-semibold text-slate-500 mb-2">추천 완료</p>
          <h1 className="text-3xl md:text-4xl font-black tracking-tight">단 하나의 추천 주제</h1>
          <p className="text-slate-600 mt-2">이 주제가 마음에 드시나요? 아래 버튼을 눌러 바로 보고서 생성을 시작해 보세요.</p>
          <p className="text-sm font-medium text-slate-500 mt-3">선택한 리포트 종류: {reportTypeLabel}</p>
        </div>

        <Card className="rounded-3xl border-slate-200/70 shadow-sm overflow-hidden">
          <div className="h-1.5 bg-gradient-to-r from-amber-400 via-orange-500 to-sky-500" />
          <CardHeader>
            <CardTitle className="flex items-center gap-2"><Sparkles className="w-5 h-5" /> {topic.title}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wide text-slate-500 mb-2">추천 이유</p>
              <p className="leading-relaxed text-slate-700">{topic.reasoning}</p>
            </div>
            <div>
              <p className="text-xs font-semibold uppercase tracking-wide text-slate-500 mb-2">탐구 방향</p>
              <p className="leading-relaxed text-slate-700">{topic.description}</p>
            </div>
            <div className="flex flex-wrap gap-2">
              {topic.tags.map((t) => (
                <span key={t} className="px-3 py-1 rounded-full bg-slate-100 text-xs font-medium">#{t}</span>
              ))}
            </div>
            <div className="flex justify-center pt-1">
              <Button onClick={onConfirm} disabled={generatingReport} className="h-12 bg-slate-900 hover:bg-slate-950 rounded-xl px-12">
                <CheckCircle2 className="w-4 h-4 mr-2" />
                {generatingReport ? "보고서 생성 중..." : `${reportTypeLabel} 생성`}
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

export default function TopicConfirmPage() {
  return (
    <Suspense fallback={<div className="p-10 text-center">불러오는 중...</div>}>
      <TopicConfirmContent />
    </Suspense>
  );
}
