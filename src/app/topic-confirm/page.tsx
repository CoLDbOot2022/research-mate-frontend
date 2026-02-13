"use client";

import { Suspense, useCallback, useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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

  const fetchTopic = useCallback(async () => {
    setLoading(true);
    try {
      const body = {
        subject: searchParams.get("subject") ?? "수학",
        unit_large: searchParams.get("unit_large") ?? "",
        unit_medium: searchParams.get("unit_medium") || null,
        unit_small: searchParams.get("unit_small") || null,
        career: searchParams.get("career") ?? "",
        difficulty: Number(searchParams.get("difficulty") ?? "60"),
        mode: searchParams.get("mode") ?? "new",
      };
      const res = await api.post<Topic[]>("/topics/recommend", body);
      setTopic(res[0] ?? null);
    } catch (e) {
      console.error(e);
      setTopic(null);
    } finally {
      setLoading(false);
    }
  }, [searchParams]);

  useEffect(() => {
    fetchTopic().catch(console.error);
  }, [fetchTopic]);

  const onConfirm = async () => {
    if (!topic) return;
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
    return <div className="p-10 text-center text-slate-500">주제를 생성하는 중입니다...</div>;
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
    <div className="container mx-auto px-4 py-12 min-h-screen">
      <div className="max-w-3xl mx-auto space-y-6">
        <Button variant="ghost" onClick={() => router.push("/subject")}>입력 수정</Button>

        <Card>
          <CardHeader>
            <CardTitle>추천 주제 (1개)</CardTitle>
          </CardHeader>
          <CardContent className="space-y-5">
            <div>
              <p className="text-sm text-slate-500 mb-1">제목</p>
              <h2 className="text-2xl font-bold">{topic.title}</h2>
            </div>
            <div>
              <p className="text-sm text-slate-500 mb-1">추천 이유</p>
              <p>{topic.reasoning}</p>
            </div>
            <div>
              <p className="text-sm text-slate-500 mb-1">탐구 방향</p>
              <p>{topic.description}</p>
            </div>
            <div className="flex flex-wrap gap-2">
              {topic.tags.map((t) => (
                <span key={t} className="px-3 py-1 rounded-full bg-slate-100 text-sm">#{t}</span>
              ))}
            </div>
            <div className="flex flex-col md:flex-row gap-3 pt-2">
              <Button onClick={onConfirm} disabled={generatingReport} className="flex-1 h-11">
                {generatingReport ? "보고서 생성 중..." : "이 주제로 보고서 생성"}
              </Button>
              <Button variant="outline" onClick={() => fetchTopic()} disabled={loading || generatingReport} className="flex-1 h-11">
                다른 주제 보기
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
