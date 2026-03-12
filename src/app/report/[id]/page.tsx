"use client";

import { useEffect, useMemo, useState, useRef } from "react";
import { useParams, useRouter } from "next/navigation";
import {
  Bookmark,
  BookmarkCheck,
  Download,
  Lightbulb,
  Loader2,
  MessageSquareText,
  Save,
  ShieldCheck,
} from "lucide-react";
import ReactMarkdown from "react-markdown";
import remarkMath from "remark-math";
import rehypeKatex from "rehype-katex";
import "katex/dist/katex.min.css";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { PhaseProgress } from "@/components/common/PhaseProgress";
import { DualAIWorkflow } from "@/components/common/DualAIWorkflow";
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

type DynamicSection = {
  heading: string;
  content: string;
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
  const [sections, setSections] = useState<DynamicSection[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [loadingElapsedMs, setLoadingElapsedMs] = useState(0);
  const [generatingElapsedMs, setGeneratingElapsedMs] = useState(0);
  const [showProgressUI, setShowProgressUI] = useState(true);
  const [forceCompleteProgress, setForceCompleteProgress] = useState(false);

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
    if (!showProgressUI) return;
    const startedAt = Date.now();
    const timer = setInterval(() => setGeneratingElapsedMs(Date.now() - startedAt), 250);
    return () => clearInterval(timer);
  }, [showProgressUI, reportId]);

  useEffect(() => {
    const token = getAccessToken();
    if (!token) {
      router.replace(`/login?callback=/report/${reportId}`);
      return;
    }

    let mounted = true;
    let timer: NodeJS.Timeout | null = null;
    let finishTimer: NodeJS.Timeout | null = null;
    let wasGenerating = false;

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
        setContent((prev) => (Object.keys(prev).length > 0 && res.status === "generating" ? prev : map));
        const rawSections = res.content?.sections;
        if (Array.isArray(rawSections)) {
          const normalized = rawSections
            .filter((item): item is Record<string, unknown> => Boolean(item && typeof item === "object"))
            .map((item) => ({
              heading: typeof item.heading === "string" ? item.heading : "",
              content: typeof item.content === "string" ? item.content : "",
            }))
            .filter((item) => item.heading && item.content);
          setSections((prev) => (prev.length > 0 && res.status === "generating" ? prev : normalized));
        } else if (res.status !== "generating") {
          setSections([]);
        }

        if (res.status === "generating") {
          wasGenerating = true;
          setShowProgressUI(true);
          setForceCompleteProgress(false);
          timer = setTimeout(fetchReport, 2500);
        } else {
          if (res.status === "completed" && wasGenerating) {
            wasGenerating = false;
            setForceCompleteProgress(true);
            setShowProgressUI(true);
            finishTimer = setTimeout(() => {
              if (mounted) {
                setShowProgressUI(false);
                setLoading(false);
              }
            }, 3000);
          } else {
            setShowProgressUI(false);
            setLoading(false);
          }
        }
      } catch (e) {
        console.error(e);
        router.replace(`/login?callback=/report/${reportId}`);
        setLoading(false);
      }
    };

    fetchReport().catch(console.error);

    return () => {
      mounted = false;
      if (timer) clearTimeout(timer);
      if (finishTimer) clearTimeout(finishTimer);
    };
  }, [reportId, router]);

  const references = useMemo(() => {
    const refs = report?.content?.references;
    return Array.isArray(refs) ? refs.map(String) : [];
  }, [report?.content]);

  const hasDynamicSections = sections.length > 0;

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

  const displayProgressMeta = useMemo(() => {
    if (forceCompleteProgress) {
      return {
        progress: 100,
        phase: "finalize",
        message: "보고서 작성이 완료되었습니다. 최종 결과물을 정리 중입니다.",
      };
    }
    return progressMeta;
  }, [progressMeta, forceCompleteProgress]);

  const onSave = async () => {
    if (!report) return;
    setSaving(true);
    try {
      const updatedContent: ReportContent = { ...(report.content || {}) };
      if (sections.length > 0) {
        updatedContent.sections = sections;
      } else {
        for (const section of sectionDefs) {
          if (content[section.key]) updatedContent[section.key] = content[section.key];
        }
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

  const handleDownloadPdf = () => {
    window.print();
  };

  if (loading) {
    const progress = Math.min(98, (loadingElapsedMs / 100000) * 100)
    return (
      <div className="min-h-screen bg-[linear-gradient(180deg,#f1f5f9_0%,#ffffff_30%,#eef2ff_100%)] py-8 px-4">
        <div className="max-w-3xl mx-auto">
          <DualAIWorkflow
            title="보고서 생성 중"
            subtitle="AI 보조 연구원이 교과서 기반 보고서를 작성하고 있습니다."
            progress={displayProgressMeta?.progress ?? 0}
            writerTitle="Writer AI"
            writerSubtitle="교과서 문맥 수집 및 보고서 전문 작성"
            writerCurrentPhase={displayProgressMeta?.phase || "retrieve"}
            writerRealTimeMessage={displayProgressMeta?.message || ""}
            writerPhases={[
              { label: "retrieve & plan", description: "교과서에서 RAG 컨텍스트를 추출하고 분석 계획을 수집합니다.", threshold: 48 },
              { label: "generate", description: "교과서 내용과 탐구 계획을 밀접하게 반영하여 초안을 작성합니다.", threshold: 74 },
              { label: "rewrite", description: "AI 점검 결과에 따른 피드백을 적용해 보강 및 재작성합니다.", threshold: 94 },
              { label: "finalize", description: "최종 문서 형식을 맞추고 참고문헌을 정리합니다.", threshold: 100 },
            ]}
            reviewerTitle="Reviewer AI"
            reviewerSubtitle="8가지 루브릭 기반 품질 실시간 평가"
            reviewerCurrentPhase={displayProgressMeta?.phase || "retrieve"}
            reviewerPhases={[
              { label: "critique", description: "엄격한 루브릭을 기준으로 작성된 보고서의 품질을 채점하고 피드백을 생성합니다.", threshold: 86 },
            ]}
          />
        </div>
      </div>
    );
  }
  if (!report) return <div className="p-10 text-center">보고서를 찾을 수 없습니다.</div>;

  return (
    <div className="min-h-screen bg-[linear-gradient(180deg,#f1f5f9_0%,#ffffff_30%,#eef2ff_100%)] py-8 px-4 print:p-0 print:bg-white print:overflow-visible print:block">
      <div className="max-w-4xl mx-auto print:max-w-none print:m-0 print:overflow-visible print:block">
        <div className="flex flex-wrap items-start justify-between gap-3 mb-6 no-print">
          <div>
            <h1 className="text-2xl md:text-3xl font-black tracking-tight">보고서 상세</h1>
            <p className="text-sm text-slate-600 mt-1">상태: {report.status}</p>
            {showProgressUI && displayProgressMeta?.phase && (
              <p className="text-xs text-indigo-700 mt-1">
                실시간 단계: {displayProgressMeta.phase}
              </p>
            )}
          </div>
          <div className="flex gap-2 flex-wrap">
            <Button variant="outline" onClick={() => router.push("/my-reports")}>목록</Button>
            <Button variant="outline" onClick={onToggleBookmark}>
              {report.is_bookmarked ? <BookmarkCheck className="w-4 h-4 mr-1" /> : <Bookmark className="w-4 h-4 mr-1" />}
              {report.is_bookmarked ? "북마크 해제" : "북마크"}
            </Button>
            <Button
              variant="outline"
              onClick={() => {
                if (editMode) {
                  // Check for unsaved changes before exiting
                  const currentContent: Record<string, string> = { ...content };
                  const originalContent: Record<string, string> = {};
                  for (const section of sectionDefs) {
                    const val = report.content?.[section.key];
                    if (typeof val === "string") originalContent[section.key] = val;
                  }

                  const hasContentChanges = JSON.stringify(currentContent) !== JSON.stringify(originalContent);

                  const hasSectionChanges = JSON.stringify(sections) !== JSON.stringify(
                    Array.isArray(report.content?.sections)
                      ? report.content.sections.map(s => ({
                        heading: String(s.heading || ""),
                        content: String(s.content || "")
                      }))
                      : []
                  );

                  if (hasContentChanges || hasSectionChanges) {
                    if (!confirm("저장하지 않은 수정사항이 있습니다. 무시하고 나가시겠습니까?")) {
                      return;
                    }
                    // Reset to original data if user confirms discarding
                    setContent(originalContent);
                    const rawSections = report.content?.sections;
                    if (Array.isArray(rawSections)) {
                      setSections(rawSections.map(s => ({
                        heading: String(s.heading || ""),
                        content: String(s.content || "")
                      })));
                    } else {
                      setSections([]);
                    }
                  }
                }
              setEditMode((prev) => !prev);
            }}
            disabled={showProgressUI}
          >
            {editMode ? "보기 모드" : "편집 모드"}
          </Button>
          {editMode && (
            <Button onClick={onSave} disabled={saving || showProgressUI} className="bg-slate-900 hover:bg-slate-950">
              {saving ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Save className="w-4 h-4 mr-2" />}저장
            </Button>
          )}
        </div>
        </div>


        <div className="w-full print:block print:overflow-visible">
          <div className="relative w-full print:static print:block print:overflow-visible" style={{ perspective: "1000px" }}>
            <div className="absolute inset-0 bg-blue-100/60 rounded-3xl blur-3xl -z-10 scale-105 no-print" />

            <div className="relative bg-white rounded-xl shadow-2xl border border-slate-200 overflow-hidden print:shadow-none print:border-none print:rounded-none print:overflow-visible print:block">
              <div className="h-12 bg-slate-50 border-b border-slate-100 flex items-center justify-between px-4 no-print">
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
                  <Button 
                    variant="ghost" 
                    size="icon" 
                    className="h-8 w-8 text-slate-400 hover:text-blue-600 transition-colors"
                    onClick={handleDownloadPdf}
                  >
                    <Download className="w-4 h-4" />
                  </Button>
                </div>
              </div>
              <div className="h-1 bg-slate-100 no-print" />

              <div id="report-paper" className="print-area p-8 md:p-12 min-h-[760px] font-serif text-slate-800 bg-white relative overflow-hidden">
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

                      {report.status === "failed" && (
                        <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700 mb-6">
                          <p className="font-semibold mb-1">생성 실패</p>
                          <p>{failureInfo}</p>
                        </div>
                      )}
                      <div className="space-y-8 text-sm md:text-[15px] leading-relaxed text-justify">
                        {hasDynamicSections ? (
                          sections.map((section, idx) => (
                            <section key={`${section.heading}-${idx}`} className="space-y-3">
                              <h3 className={`text-base md:text-lg font-bold border-l-4 pl-3 mb-3 ${idx % 2 === 0 ? "text-slate-800 border-slate-800" : "text-blue-700 border-blue-600"}`}>
                                {section.heading}
                              </h3>
                              {editMode ? (
                                <textarea
                                  className="w-full min-h-40 border border-slate-200 rounded-lg p-4 bg-slate-50 font-sans text-sm"
                                  value={section.content}
                                  onChange={(e) =>
                                    setSections((prev) =>
                                      prev.map((item, itemIdx) =>
                                        itemIdx === idx ? { ...item, content: e.target.value } : item
                                      )
                                    )
                                  }
                                />
                              ) : (
                                <div className="text-slate-700 whitespace-pre-wrap">
                                  <ReactMarkdown
                                    remarkPlugins={[remarkMath]}
                                    rehypePlugins={[rehypeKatex]}
                                  >
                                    {section.content || "내용이 없습니다."}
                                  </ReactMarkdown>
                                </div>
                              )}
                            </section>
                          ))
                        ) : (
                          sectionDefs.map((section, idx) => (
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
                                <div className="text-slate-700 whitespace-pre-wrap">
                                  <ReactMarkdown
                                    remarkPlugins={[remarkMath]}
                                    rehypePlugins={[rehypeKatex]}
                                  >
                                    {content[section.key] || "내용이 없습니다."}
                                  </ReactMarkdown>
                                </div>
                              )}
                            </section>
                          ))
                        )}
                      </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
