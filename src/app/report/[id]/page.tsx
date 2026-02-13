"use client";

import { useEffect, useMemo, useState } from "react";
import { useParams, useRouter } from "next/navigation";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { api } from "@/lib/api/client";

type ReportContent = {
  introduction: string;
  background: string;
  methodology: string;
  conclusion: string;
};

type ReportResponse = {
  report_id: string;
  status: "generating" | "completed" | "failed";
  title: string;
  content: ReportContent | null;
  created_at: string;
  is_bookmarked: boolean;
};

type ChatMessage = {
  role: "user" | "assistant";
  text: string;
};

const defaultContent: ReportContent = {
  introduction: "",
  background: "",
  methodology: "",
  conclusion: "",
};

export default function ReportDetailPage() {
  const router = useRouter();
  const params = useParams();
  const reportId = params.id as string;

  const [report, setReport] = useState<ReportResponse | null>(null);
  const [content, setContent] = useState<ReportContent>(defaultContent);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [chatInput, setChatInput] = useState("");
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
  const [chatLoading, setChatLoading] = useState(false);

  const isGenerating = report?.status === "generating";

  useEffect(() => {
    let mounted = true;
    let timer: NodeJS.Timeout | null = null;

    const fetchReport = async () => {
      try {
        const res = await api.get<ReportResponse>(`/reports/${reportId}`);
        if (!mounted) return;

        setReport(res);
        setContent((prev) => {
          if (isGenerating && prev.introduction) return prev;
          return {
            introduction: res.content?.introduction ?? "",
            background: res.content?.background ?? "",
            methodology: res.content?.methodology ?? "",
            conclusion: res.content?.conclusion ?? "",
          };
        });

        if (res.status === "generating") {
          timer = setTimeout(fetchReport, 2500);
        } else {
          setLoading(false);
        }
      } catch (e) {
        console.error(e);
        setLoading(false);
      }
    };

    fetchReport().catch(console.error);

    return () => {
      mounted = false;
      if (timer) clearTimeout(timer);
    };
  }, [reportId, isGenerating]);

  const sections = useMemo(
    () => [
      { key: "introduction" as const, label: "1. 서론" },
      { key: "background" as const, label: "2. 이론적 배경" },
      { key: "methodology" as const, label: "3. 탐구 방법" },
      { key: "conclusion" as const, label: "4. 결론" },
    ],
    []
  );

  const onSave = async () => {
    if (!report) return;
    setSaving(true);
    try {
      const updated = await api.patch<ReportResponse>(`/reports/${report.report_id}`, { content });
      setReport(updated);
      alert("보고서가 저장되었습니다.");
    } catch (e) {
      console.error(e);
      alert("저장에 실패했습니다.");
    } finally {
      setSaving(false);
    }
  };

  const onToggleBookmark = async () => {
    if (!report) return;
    const next = !report.is_bookmarked;
    try {
      await apiRequestBookmark(report.report_id, next);
      setReport({ ...report, is_bookmarked: next });
    } catch (e) {
      console.error(e);
    }
  };

  const onChatSend = async () => {
    const message = chatInput.trim();
    if (!message || !report) return;

    setChatMessages((prev) => [...prev, { role: "user", text: message }]);
    setChatInput("");
    setChatLoading(true);

    try {
      const res = await api.post<{ reply: string }>(`/reports/${report.report_id}/chat`, { message });
      setChatMessages((prev) => [...prev, { role: "assistant", text: res.reply }]);
    } catch (e) {
      console.error(e);
      setChatMessages((prev) => [
        ...prev,
        { role: "assistant", text: "답변 생성에 실패했습니다. 잠시 후 다시 시도해주세요." },
      ]);
    } finally {
      setChatLoading(false);
    }
  };

  if (loading) {
    return <div className="p-10 text-center">보고서를 불러오는 중...</div>;
  }

  if (!report) {
    return <div className="p-10 text-center">보고서를 찾을 수 없습니다.</div>;
  }

  return (
    <div className="container mx-auto px-4 py-8 min-h-screen">
      <div className="flex items-center justify-between mb-6 gap-3 flex-wrap">
        <div>
          <h1 className="text-2xl font-bold">{report.title}</h1>
          <p className="text-sm text-slate-500">상태: {report.status}</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => router.push("/my-reports")}>목록</Button>
          <Button variant="outline" onClick={onToggleBookmark}>
            {report.is_bookmarked ? "북마크 해제" : "북마크"}
          </Button>
          <Button onClick={onSave} disabled={saving || isGenerating}>
            {saving ? "저장 중..." : "수정 저장"}
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-[2fr_1fr] gap-6">
        <Card>
          <CardHeader>
            <CardTitle>{isGenerating ? "보고서 생성 중" : "보고서 편집"}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {isGenerating ? (
              <p className="text-slate-600">교과서 기반 분석으로 보고서를 생성하고 있습니다. 잠시만 기다려주세요.</p>
            ) : (
              sections.map((s) => (
                <div key={s.key} className="space-y-2">
                  <label className="font-semibold">{s.label}</label>
                  <textarea
                    className="w-full min-h-40 border rounded-md p-3"
                    value={content[s.key]}
                    onChange={(e) =>
                      setContent((prev) => ({
                        ...prev,
                        [s.key]: e.target.value,
                      }))
                    }
                  />
                </div>
              ))
            )}
          </CardContent>
        </Card>

        <Card className="h-[70vh] flex flex-col">
          <CardHeader>
            <CardTitle>AI 대화</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col gap-3 flex-1 min-h-0">
            <div className="border rounded-md p-3 flex-1 overflow-y-auto space-y-3 bg-slate-50">
              {chatMessages.length === 0 && (
                <p className="text-sm text-slate-500">보고서 완성 후 문장 개선, 근거 보강, 표현 교정을 요청할 수 있습니다.</p>
              )}
              {chatMessages.map((m, idx) => (
                <div
                  key={`${m.role}-${idx}`}
                  className={`text-sm p-2 rounded-md ${m.role === "user" ? "bg-blue-100" : "bg-white"}`}
                >
                  <p className="font-medium mb-1">{m.role === "user" ? "나" : "AI"}</p>
                  <p className="whitespace-pre-wrap">{m.text}</p>
                </div>
              ))}
              {chatLoading && <p className="text-sm text-slate-500">AI가 답변 작성 중...</p>}
            </div>

            <div className="flex gap-2">
              <Input
                value={chatInput}
                onChange={(e) => setChatInput(e.target.value)}
                placeholder="예: 결론 문단을 더 논리적으로 고쳐줘"
                onKeyDown={(e) => {
                  if (e.key === "Enter") onChatSend();
                }}
              />
              <Button onClick={onChatSend} disabled={chatLoading || isGenerating}>전송</Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

async function apiRequestBookmark(reportId: string, isBookmarked: boolean) {
  return api.patch(`/reports/${reportId}/bookmark`, { is_bookmarked: isBookmarked });
}
