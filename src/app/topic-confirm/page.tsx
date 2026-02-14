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

function TopicConfirmContent() {
  const router = useRouter();
  const searchParams = useSearchParams();

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
      alert("기록 저장과 보고서 생성은 로그인 후 가능합니다.");
      router.push("/login");
      return;
    }
    setGeneratingReport(true);
    try {
      const res = await api.post<{ report_id: string }>("/reports/generate", { topic_id: topic.topic_id });
      router.push(`/report/${res.report_id}`);
    } catch (e) {
      console.error(e);
      setGeneratingReport(false);
      alert("보고서 생성에 실패했습니다.");
    }
  };

  if (loading) {
    const progress = Math.min(92, (elapsedMs / 2600) * 100);
    return (
      <div className="min-h-screen bg-[linear-gradient(135deg,#f8fafc_0%,#fff7ed_45%,#eef2ff_100%)] py-12 px-4">
        <div className="max-w-3xl mx-auto">
          <PhaseProgress
            title="주제를 생성하고 있습니다"
            subtitle="입력한 과목/단원/진로를 바탕으로 가장 적합한 1개 주제를 찾고 있어요."
            progress={progress}
            phases={[
              { label: "입력 분석", description: "교과 범위와 진로 키워드를 구조화합니다.", threshold: 20 },
              { label: "주제 탐색", description: "후보를 검토하고 적합도를 계산합니다.", threshold: 55 },
              { label: "최종 선택", description: "중복도를 줄이고 1개 주제로 압축합니다.", threshold: 85 },
            ]}
            funMessages={[
              "탐구 스캐너가 교과 개념과 진로 키워드를 매칭하는 중이에요.",
              "남들과 겹치지 않는 주제를 찾기 위해 중복도를 줄이고 있어요.",
              "보고서까지 자연스럽게 이어질 수 있는 주제만 남기고 있어요.",
              "잠깐만요. 지금 가장 '세특 친화적'인 조합을 고르는 중입니다.",
            ]}
            activityLogs={[
              "과목/단원 파라미터 정규화 완료",
              "진로 키워드 가중치 계산 완료",
              "주제 후보 1차 생성",
              "중복도 및 실현가능성 필터링",
              "최종 후보 1개 확정",
            ]}
            quiz={{
              question: "도함수의 의미를 가장 짧게 말하면?",
              answerHint: "함수의 순간 변화율",
            }}
            tip="주제는 하나만 보여주고, 필요하면 재추천으로 다음 후보를 확인할 수 있어요."
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
          <p className="text-slate-600 mt-2">마음에 들면 바로 보고서를 생성하고, 아니면 재추천을 요청할 수 있습니다.</p>
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
            <div className="grid md:grid-cols-2 gap-3 pt-1">
              <Button onClick={onConfirm} disabled={generatingReport} className="h-12 bg-slate-900 hover:bg-slate-950 rounded-xl">
                <CheckCircle2 className="w-4 h-4 mr-2" />
                {generatingReport ? "보고서 생성 중..." : "이 주제로 보고서 생성"}
              </Button>
              <Button variant="outline" onClick={() => fetchTopic(true)} disabled={loading || generatingReport} className="h-12 rounded-xl">
                <RefreshCcw className="w-4 h-4 mr-2" /> 다른 주제 보기
              </Button>
            </div>
            <Button variant="ghost" onClick={() => router.push("/subject")} className="w-full h-11 rounded-xl text-slate-600">
              <Wand2 className="w-4 h-4 mr-2" /> 입력값 수정하기
            </Button>
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
