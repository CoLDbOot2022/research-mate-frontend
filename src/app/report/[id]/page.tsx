"use client";

import { useEffect, useMemo, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import {
  Bookmark,
  BookmarkCheck,
  Download,
  Loader2,
  MessageSquareText,
  Save,
  ShieldCheck,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { PhaseProgress } from "@/components/common/PhaseProgress";
import { Input } from "@/components/ui/input";
import { getAccessToken } from "@/lib/auth";
import { api } from "@/lib/api/client";

type ReportContent = Record<string, unknown>;

type ReportResponse = {
  report_id: string;
  status: "generating" | "completed" | "failed";
  title: string;
  content: ReportContent | null;
  created_at: string;
  is_bookmarked: boolean;
  progress?: number | null;
  phase?: string | null;
  status_message?: string | null;
};

type ChatMessage = {
  role: "user" | "assistant";
  text: string;
};

const sectionDefs = [
  { key: "abstract", label: "초록" },
  { key: "introduction", label: "1. 탐구 동기 및 목적" },
  { key: "background", label: "2. 이론적 배경" },
  { key: "methodology", label: "3. 탐구 방법" },
  { key: "analysis", label: "4. 분석 및 해석" },
  { key: "limitations", label: "5. 한계 및 보완점" },
  { key: "conclusion", label: "6. 결론" },
] as const;

export default function ReportDetailPage() {
  const router = useRouter();
  const params = useParams();
  const reportId = params.id as string;

  const [report, setReport] = useState<ReportResponse | null>(null);
  const [content, setContent] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [loadingElapsedMs, setLoadingElapsedMs] = useState(0);
  const [generatingElapsedMs, setGeneratingElapsedMs] = useState(0);

  const [chatInput, setChatInput] = useState("");
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
  const [chatLoading, setChatLoading] = useState(false);

  const isGenerating = report?.status === "generating";

  useEffect(() => {
    if (!loading) return;
    const startedAt = Date.now();
    const timer = setInterval(() => setLoadingElapsedMs(Date.now() - startedAt), 200);
    return () => clearInterval(timer);
  }, [loading]);

  useEffect(() => {
    if (!isGenerating) return;
    const startedAt = Date.now();
    const timer = setInterval(() => setGeneratingElapsedMs(Date.now() - startedAt), 250);
    return () => clearInterval(timer);
  }, [isGenerating, reportId]);

  useEffect(() => {
    const token = getAccessToken();
    if (!token) {
      router.replace("/login");
      return;
    }

    let mounted = true;
    let timer: NodeJS.Timeout | null = null;

    const fetchReport = async () => {
      try {
        const res = await api.get<ReportResponse>(`/reports/${reportId}`);
        if (!mounted) return;

        setReport(res);
        const map: Record<string, string> = {};
        for (const section of sectionDefs) {
          const value = res.content?.[section.key];
          if (typeof value === "string") map[section.key] = value;
        }
        setContent((prev) => (Object.keys(prev).length > 0 && isGenerating ? prev : map));

        if (res.status === "generating") {
          timer = setTimeout(fetchReport, 2500);
        } else {
          setLoading(false);
        }
      } catch (e) {
        console.error(e);
        router.replace("/login");
        setLoading(false);
      }
    };

    fetchReport().catch(console.error);

    return () => {
      mounted = false;
      if (timer) clearTimeout(timer);
    };
  }, [reportId, isGenerating, router]);

  const references = useMemo(() => {
    const refs = report?.content?.references;
    return Array.isArray(refs) ? refs.map(String) : [];
  }, [report?.content]);

  const quality = useMemo(() => {
    const q = report?.content?.quality;
    return q && typeof q === "object" ? (q as Record<string, unknown>) : null;
  }, [report?.content]);

  const pipeline = useMemo(() => {
    const p = report?.content?.pipeline;
    return p && typeof p === "object" ? (p as Record<string, unknown>) : null;
  }, [report?.content]);

  const failureInfo = useMemo(() => {
    if (report?.status !== "failed") return "";
    const err = report?.content?.error;
    if (typeof err === "string" && err.trim()) return err;
    return "보고서 생성 중 오류가 발생했습니다. 다시 생성해 주세요.";
  }, [report?.status, report?.content]);

  const progressMeta = useMemo(() => {
    const direct = {
      progress: typeof report?.progress === "number" ? report.progress : null,
      phase: typeof report?.phase === "string" ? report.phase : "",
      message: typeof report?.status_message === "string" ? report.status_message : "",
    };
    if (direct.progress !== null || direct.phase || direct.message) {
      return direct;
    }
    const meta = report?.content?.__meta;
    if (!meta || typeof meta !== "object") return null;
    const obj = meta as Record<string, unknown>;
    return {
      progress: typeof obj.progress === "number" ? obj.progress : null,
      phase: typeof obj.phase === "string" ? obj.phase : "",
      message: typeof obj.message === "string" ? obj.message : "",
    };
  }, [report?.content, report?.progress, report?.phase, report?.status_message]);

  const onSave = async () => {
    if (!report) return;
    setSaving(true);
    try {
      const updatedContent: ReportContent = { ...(report.content || {}) };
      for (const section of sectionDefs) {
        if (content[section.key]) updatedContent[section.key] = content[section.key];
      }
      const updated = await api.patch<ReportResponse>(`/reports/${report.report_id}`, { content: updatedContent });
      setReport(updated);
      setEditMode(false);
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
      await api.patch(`/reports/${report.report_id}/bookmark`, { is_bookmarked: next });
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
      setChatMessages((prev) => [...prev, { role: "assistant", text: "답변 생성에 실패했습니다." }]);
    } finally {
      setChatLoading(false);
    }
  };

  if (loading) {
    const progress = Math.min(90, (loadingElapsedMs / 2500) * 100);
    return (
      <div className="min-h-screen bg-[linear-gradient(180deg,#f1f5f9_0%,#ffffff_30%,#eef2ff_100%)] py-8 px-4">
        <div className="max-w-3xl mx-auto">
          <PhaseProgress
            title="보고서 데이터를 불러오는 중"
            subtitle="작성된 섹션과 품질 지표를 동기화하고 있어요."
            progress={progress}
            phases={[
              { label: "보고서 조회", description: "저장된 보고서를 확인합니다.", threshold: 30 },
              { label: "섹션 파싱", description: "본문과 메타 정보를 구성합니다.", threshold: 60 },
              { label: "편집 준비", description: "채팅/저장 가능한 상태로 준비합니다.", threshold: 85 },
            ]}
            funMessages={[
              "문서 서식을 정리해서 읽기 좋은 상태로 만드는 중이에요.",
              "품질 점수와 참고 문맥을 연결하고 있어요.",
              "채팅 조교가 보고서 문맥을 미리 학습하고 있어요.",
            ]}
            activityLogs={[
              "보고서 메타데이터 조회 성공",
              "본문 섹션 맵핑 진행 중",
              "품질/파이프라인 정보 결합",
              "편집기 초기화 완료",
            ]}
            quiz={{
              question: "연구 보고서에서 '한계' 섹션이 중요한 이유는?",
              answerHint: "결과 해석의 신뢰 범위를 명확히 함",
            }}
          />
        </div>
      </div>
    );
  }
  if (!report) return <div className="p-10 text-center">보고서를 찾을 수 없습니다.</div>;

  return (
    <div className="min-h-screen bg-[linear-gradient(180deg,#f1f5f9_0%,#ffffff_30%,#eef2ff_100%)] py-8 px-4">
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-wrap items-start justify-between gap-3 mb-6">
          <div>
            <h1 className="text-2xl md:text-3xl font-black tracking-tight">보고서 상세</h1>
              <p className="text-sm text-slate-600 mt-1">상태: {report.status}</p>
              {isGenerating && progressMeta?.phase && (
                <p className="text-xs text-indigo-700 mt-1">
                  실시간 단계: {progressMeta.phase} ({progressMeta.progress ?? 0}%)
                </p>
              )}
            </div>
          <div className="flex gap-2 flex-wrap">
            <Button variant="outline" onClick={() => router.push("/my-reports")}>목록</Button>
            <Button variant="outline" onClick={onToggleBookmark}>
              {report.is_bookmarked ? <BookmarkCheck className="w-4 h-4 mr-1" /> : <Bookmark className="w-4 h-4 mr-1" />}
              {report.is_bookmarked ? "북마크 해제" : "북마크"}
            </Button>
            <Button variant="outline" onClick={() => setEditMode((prev) => !prev)} disabled={isGenerating}>
              {editMode ? "보기 모드" : "편집 모드"}
            </Button>
            <Button onClick={onSave} disabled={saving || isGenerating || !editMode} className="bg-slate-900 hover:bg-slate-950">
              {saving ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Save className="w-4 h-4 mr-2" />}저장
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-[2fr_1fr] gap-6">
          <div className="relative w-full" style={{ perspective: "1000px" }}>
            <div className="absolute inset-0 bg-blue-100/60 rounded-3xl blur-3xl -z-10 scale-105" />

            <div className="relative bg-white rounded-xl shadow-2xl border border-slate-200 overflow-hidden">
              <div className="h-12 bg-slate-50 border-b border-slate-100 flex items-center justify-between px-4">
                <div className="flex items-center space-x-2">
                  <div className="w-3 h-3 rounded-full bg-red-400" />
                  <div className="w-3 h-3 rounded-full bg-yellow-400" />
                  <div className="w-3 h-3 rounded-full bg-green-400" />
                  <span className="text-xs text-slate-400 font-medium ml-2">Report_{report.report_id.slice(0, 8)}.pdf</span>
                </div>
                <div className="flex items-center gap-2 text-xs">
                  <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full bg-blue-50 text-blue-700 border border-blue-200">
                    <ShieldCheck className="w-3 h-3" /> Verified
                  </span>
                  <Download className="w-4 h-4 text-slate-400" />
                </div>
              </div>

              <div className="p-8 md:p-12 min-h-[760px] font-serif text-slate-800 bg-white relative overflow-hidden">
                <div className="max-w-3xl mx-auto space-y-8">
                  <div className="text-center border-b pb-6 mb-8">
                    <h2 className="text-2xl md:text-3xl font-bold text-slate-900 leading-tight">{report.title}</h2>
                    <p className="text-slate-500 italic text-xs mt-2">Advanced Subject Exploration Report</p>
                    <div className="flex justify-center gap-4 mt-5 text-xs text-slate-600 font-sans font-medium">
                      <span>생성일: {new Date(report.created_at).toLocaleString("ko-KR")}</span>
                      <span className="text-slate-300">|</span>
                      <span>LangGraph: {String(pipeline?.langgraph_enabled ?? "-")}</span>
                    </div>
                  </div>

                  {isGenerating ? (
                    <PhaseProgress
                      title="LangGraph 보고서 생성 중"
                      subtitle="교과서 RAG, 계획, 생성, 비평, 재작성 단계를 순차 실행합니다."
                      progress={progressMeta?.progress ?? Math.min(96, (generatingElapsedMs / 42000) * 100)}
                      phases={[
                        { label: "RAG 수집", description: "교과서 문맥과 관련 근거를 수집합니다.", threshold: 18 },
                        { label: "탐구 계획", description: "연구 질문과 분석 절차를 설계합니다.", threshold: 38 },
                        { label: "초안 생성", description: "구조화된 보고서 본문을 작성합니다.", threshold: 62 },
                        { label: "비평/개선", description: "품질 점검 후 재작성 루프를 수행합니다.", threshold: 88 },
                      ]}
                      funMessages={[
                        progressMeta?.message || "처리 상태를 동기화하는 중입니다.",
                        "RAG가 교과서 근거를 추출해 논리의 뼈대를 세우는 중입니다.",
                        "AI 비평 에이전트가 문장 밀도와 근거 연결을 검사하고 있어요.",
                        "점수가 기준에 못 미치면 자동으로 재작성 라운드를 진행합니다.",
                        "거의 완료됐어요. 결론의 설득력을 마지막으로 점검하고 있습니다.",
                      ]}
                      activityLogs={[
                        progressMeta?.phase ? `현재 단계: ${progressMeta.phase}` : "현재 단계 동기화 중",
                        "Textbook RAG 컨텍스트 검색 완료",
                        "탐구 계획 노드 실행 완료",
                        "초안 생성 노드 실행 완료",
                        "비평 노드 점수 계산 중",
                        "필요 시 재작성 루프 적용",
                        "최종 품질 검증 및 저장 준비",
                      ]}
                      quiz={{
                        question: "RAG의 핵심 장점은?",
                        answerHint: "모델이 외부 근거를 참조해 사실성을 높임",
                      }}
                      tip="생성 중에도 페이지를 닫지 않아도 됩니다. 기록 페이지에서 다시 확인할 수 있어요."
                    />
                  ) : (
                    <>
                    {report.status === "failed" && (
                      <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700 mb-6">
                        <p className="font-semibold mb-1">생성 실패</p>
                        <p>{failureInfo}</p>
                      </div>
                    )}
                    <div className="space-y-8 text-sm md:text-[15px] leading-relaxed text-justify">
                      {sectionDefs.map((section, idx) => (
                        <section key={section.key}>
                          <h3 className={`text-base md:text-lg font-bold border-l-4 pl-3 mb-3 ${idx % 2 === 0 ? "text-slate-800 border-slate-800" : "text-blue-700 border-blue-600"}`}>
                            {section.label}
                          </h3>
                          {editMode ? (
                            <textarea
                              className="w-full min-h-40 border border-slate-200 rounded-lg p-4 bg-slate-50 font-sans text-sm"
                              value={content[section.key] ?? ""}
                              onChange={(e) => setContent((prev) => ({ ...prev, [section.key]: e.target.value }))}
                            />
                          ) : (
                            <p className="text-slate-700 whitespace-pre-wrap">{content[section.key] || "내용이 없습니다."}</p>
                          )}
                        </section>
                      ))}
                    </div>
                    </>
                  )}
                </div>

                <div className="absolute bottom-0 left-0 right-0 h-28 bg-gradient-to-t from-white via-white/70 to-transparent pointer-events-none" />
              </div>
            </div>
          </div>

          <div className="space-y-6">
            <Card className="rounded-3xl border-slate-200/70 shadow-sm">
              <CardHeader>
                <CardTitle className="text-lg">품질 지표</CardTitle>
              </CardHeader>
              <CardContent className="text-sm text-slate-700 space-y-2">
                <p>평가 점수: {String(quality?.score ?? "-")}</p>
                <p>승인 여부: {String(quality?.approved ?? "-")}</p>
                <p>리비전 횟수: {String(pipeline?.revisions ?? "-")}</p>
              </CardContent>
            </Card>

            <Card className="rounded-3xl border-slate-200/70 shadow-sm">
              <CardHeader>
                <CardTitle className="text-lg">참고 문맥</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2 text-sm text-slate-700">
                {references.length === 0 ? <p>표시할 참고 문맥이 없습니다.</p> : references.map((r) => <p key={r}>{r}</p>)}
              </CardContent>
            </Card>

            <Card className="rounded-3xl border-slate-200/70 shadow-sm h-[420px] flex flex-col">
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2"><MessageSquareText className="w-4 h-4" /> AI 대화</CardTitle>
              </CardHeader>
              <CardContent className="flex flex-col gap-3 flex-1 min-h-0">
                <div className="border rounded-xl p-3 flex-1 overflow-y-auto space-y-2 bg-slate-50">
                  {chatMessages.length === 0 && <p className="text-sm text-slate-500">문장 개선, 근거 보강, 논리 점검을 요청해보세요.</p>}
                  {chatMessages.map((m, idx) => (
                    <div key={`${m.role}-${idx}`} className={`text-sm p-2 rounded-lg ${m.role === "user" ? "bg-amber-100" : "bg-white"}`}>
                      <p className="font-medium mb-1">{m.role === "user" ? "나" : "AI"}</p>
                      <p className="whitespace-pre-wrap">{m.text}</p>
                    </div>
                  ))}
                  {chatLoading && <p className="text-sm text-slate-500">AI 응답 생성 중...</p>}
                </div>

                <div className="flex gap-2">
                  <Input
                    value={chatInput}
                    onChange={(e) => setChatInput(e.target.value)}
                    placeholder="예: 분석 섹션을 더 엄밀하게 고쳐줘"
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
      </div>
    </div>
  );
}
