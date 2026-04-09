"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { Loader2, MessageCircle, Send, Check, History, Layout, FileText, Split } from "lucide-react";
import "katex/dist/katex.min.css";
import { flattenLists, markdownToHtml } from "@/lib/editor-utils";
import { DualAIWorkflow } from "@/components/common/DualAIWorkflow";
import { getAccessToken } from "@/lib/auth";
import { api } from "@/lib/api/client";
import type { CommentData } from "@/components/editor/TipTapEditor";

import { ReportHeader } from "@/components/report/ReportHeader";
import { ReportPremiumBanner } from "@/components/report/ReportPremiumBanner";
import { ReportEditorPanel } from "@/components/report/ReportEditorPanel";
import { ReportDiffView } from "@/components/report/ReportDiffView";
import { CommentSidebar } from "@/components/editor/CommentSidebar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";

// ─── Types ────────────────────────────────────────────────────────────────────

type ReportContent = Record<string, unknown>;

type FeedbackMessage = {
  id: number;
  sender_type: "mentor" | "mentee";
  content: string;
  created_at: string;
};

type ReportResponse = {
  report_id: string;
  status: "generating" | "completed" | "failed" | "awaiting_review" | "review_confirmed";
  title: string;
  content: ReportContent | null;
  created_at: string;
  is_bookmarked: boolean;
  progress?: number | null;
  phase?: string | null;
  status_message?: string | null;
  report_type: "general" | "premium";
  mentor_comment: string | null;
  original_content: ReportContent | null;
  mentor_reviewed_at: string | null;
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

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function ReportDetailPage() {
  const router = useRouter();
  const params = useParams();
  const reportId = params.id as string;

  // ── State ──────────────────────────────────────────────────────────────────
  const [report, setReport] = useState<ReportResponse | null>(null);
  const [editorHtml, setEditorHtml] = useState("");
  const [originalHtml, setOriginalHtml] = useState("");
  const [comments, setComments] = useState<CommentData[]>([]);
  const [activeCommentId, setActiveCommentId] = useState<string | null>(null);

  const [activeTab, setActiveTab] = useState("mentor");
  const [messages, setMessages] = useState<FeedbackMessage[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [sendingMessage, setSendingMessage] = useState(false);
  const [accepting, setAccepting] = useState(false);
  const [rejecting, setRejecting] = useState(false);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [showProgressUI, setShowProgressUI] = useState(true);
  const [forceCompleteProgress, setForceCompleteProgress] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  // ── Auto-scroll Chat ────────────────────────────────────────────────────────
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  // ── Loading timer ──────────────────────────────────────────────────────────
  const [loadingElapsedMs, setLoadingElapsedMs] = useState(0);
  useEffect(() => {
    if (!loading) return;
    const startedAt = Date.now();
    const timer = setInterval(() => setLoadingElapsedMs(Date.now() - startedAt), 200);
    return () => clearInterval(timer);
  }, [loading]);

  // ── Fetch & poll ──────────────────────────────────────────────────────────
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
        const [res, msgs] = await Promise.all([
            api.get<ReportResponse>(`/reports/${reportId}`),
            api.get<FeedbackMessage[]>(`/reports/${reportId}/feedback`).catch(() => [])
        ]);
        
        if (!mounted) return;

        setReport(res);
        setMessages(msgs);

        // ── Build editor HTML ───────────────────────────────────────────────
        let mergedHtml = "";
        let parsedComments: CommentData[] = [];

        if (res.content?.html && typeof res.content.html === "string") {
          mergedHtml = res.content.html;
          parsedComments = Array.isArray(res.content.comments)
            ? (res.content.comments as CommentData[])
            : [];
        } else {
          // Legacy: build from section fields
          const map: Record<string, string> = {};
          for (const s of sectionDefs) {
            const v = res.content?.[s.key];
            if (typeof v === "string") map[s.key] = v;
          }

          let markdownSrc = "";
          const rawSections = res.content?.sections;
          if (Array.isArray(rawSections)) {
            const normalised = rawSections
              .filter((x): x is Record<string, unknown> => Boolean(x && typeof x === "object"))
              .map((x) => ({
                heading: typeof x.heading === "string" ? x.heading : "",
                content: typeof x.content === "string" ? x.content : "",
              }))
              .filter((x) => x.heading && x.content);
            markdownSrc = normalised.map((s) => `## ${s.heading}\n\n${s.content}`).join("\n\n");
          } else {
            markdownSrc = sectionDefs
              .filter((d) => typeof map[d.key] === "string" && map[d.key].trim() !== "")
              .map((d) => `## ${d.label}\n\n${map[d.key]}`)
              .join("\n\n");
          }

          if (markdownSrc) mergedHtml = markdownToHtml(markdownSrc);
        }

        if (mergedHtml) {
          mergedHtml = flattenLists(mergedHtml);

          // Strip existing metadata if present to avoid duplication
          mergedHtml = mergedHtml.replace(/<p><span[^>]*>생성일:.*?<\/span><\/p>/g, "").trim();
          mergedHtml = mergedHtml.replace(/<p>.*?생성일:.*?<\/p>/gi, "").trim();
          mergedHtml = mergedHtml.replace(/<hr[^>]*>/i, "").trim();
          mergedHtml = mergedHtml.replace(/^<h1>.*?<\/h1>/i, "").trim();

          // Construct Integrated Notion-style Header
          const dateStr = new Date(res.created_at).toLocaleDateString("ko-KR");
          let metadataHtml = `<p><span>생성일: ${dateStr}</span></p>`;
          if (res.mentor_reviewed_at) {
              metadataHtml = `<p><span>생성일: ${dateStr} | </span><span style="color: #059669; font-weight: 600; font-size: 0.75rem; background-color: #ecfdf5; padding: 2px 8px; border-radius: 9999px; border: 1px solid #d1fae5;">멘토 첨삭 완료</span></p>`;
          }

          mergedHtml = `<h1>${res.title}</h1>\n${metadataHtml}\n<hr />\n${mergedHtml}`;
          setEditorHtml(mergedHtml);
        }

        // ── Build original HTML ─────────────────────────────────────────────
        const targetOriginal = res.original_content || res.content;
        if (targetOriginal) {
            let origHtml = "";
            if (targetOriginal.html && typeof targetOriginal.html === "string") {
                origHtml = targetOriginal.html;
            } else {
                // Fallback for legacy content
                const rawSections = (targetOriginal as any).sections;
                if (Array.isArray(rawSections)) {
                    origHtml = markdownToHtml(rawSections.map((s: any) => `## ${s.heading}\n\n${s.content}`).join("\n\n"));
                }
            }
            if (origHtml) {
                origHtml = flattenLists(origHtml);
                
                // Strip existing metadata if present
                origHtml = origHtml.replace(/<p><span[^>]*>생성일:.*?<\/span><\/p>/g, "").trim();
                origHtml = origHtml.replace(/<p>.*?생성일:.*?<\/p>/gi, "").trim();
                origHtml = origHtml.replace(/<hr[^>]*>/i, "").trim();
                origHtml = origHtml.replace(/^<h1>.*?<\/h1>/i, "").trim();

                const dateStr = new Date(res.created_at).toLocaleDateString("ko-KR");
                let metadataHtml = `<p><span>생성일: ${dateStr}</span></p>`;
                if (res.mentor_reviewed_at) {
                    metadataHtml = `<p><span>생성일: ${dateStr} | </span><span style="color: #059669; font-weight: 600; font-size: 0.75rem; background-color: #ecfdf5; padding: 2px 8px; border-radius: 9999px; border: 1px solid #d1fae5;">멘토 첨삭 완료</span></p>`;
                }

                origHtml = `<h1>${res.title}</h1>\n${metadataHtml}\n<hr />\n${origHtml}`;
                setOriginalHtml(origHtml);
            }
        }

        setComments(parsedComments);

        // ── Polling logic ───────────────────────────────────────────────────
        if (res.status === "generating") {
          wasGenerating = true;
          setShowProgressUI(true);
          setForceCompleteProgress(false);
          timer = setTimeout(fetchReport, 2500);
        } else {
          if ((res.status === "completed" || res.status === "awaiting_review") && wasGenerating) {
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

  // ── Derived state ──────────────────────────────────────────────────────────
  const failureInfo = useMemo(() => {
    if (report?.status !== "failed") return "";
    const err = report?.content?.error;
    return typeof err === "string" && err.trim() ? err : "보고서 생성 중 오류가 발생했습니다. 다시 생성해 주세요.";
  }, [report?.status, report?.content]);

  const progressMeta = useMemo(() => {
    const direct = {
      progress: typeof report?.progress === "number" ? report.progress : null,
      phase: typeof report?.phase === "string" ? report.phase : "",
      message: typeof report?.status_message === "string" ? report.status_message : "",
    };
    if (direct.progress !== null || direct.phase || direct.message) return direct;

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
        message:
          report?.report_type === "premium"
            ? "보고서 작성이 완료되었습니다. 멘토에게 전송 중입니다."
            : "보고서 작성이 완료되었습니다. 최종 결과물을 정리 중입니다.",
      };
    }
    return progressMeta;
  }, [progressMeta, forceCompleteProgress, report?.report_type]);

  // ── Handlers ───────────────────────────────────────────────────────────────
  const onSave = async () => {
    if (!report) return;
    setSaving(true);
    try {
      const updatedContent: ReportContent = {
        ...(report.content || {}),
        html: editorHtml,
        comments,
      };

      // Extract title from <h1> in editorHtml
      const temp = document.createElement("div");
      temp.innerHTML = editorHtml || "";
      const extractedTitle = temp.querySelector("h1")?.innerText?.trim() || report.title;

      const payload: { content: ReportContent; title?: string } = { content: updatedContent };
      if (extractedTitle && extractedTitle !== report.title) payload.title = extractedTitle;

      const updated = await api.patch<ReportResponse>(`/reports/${report.report_id}`, payload);
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

  const handleSendMessage = async () => {
    if (!newMessage.trim() || sendingMessage) return;
    setSendingMessage(true);
    try {
      const msg = await api.post<FeedbackMessage>(`/reports/${reportId}/feedback`, {
        content: newMessage,
      });
      setMessages((prev) => [...prev, msg]);
      setNewMessage("");
    } catch (e) {
      console.error(e);
      alert("메시지 전송에 실패했습니다.");
    } finally {
      setSendingMessage(false);
    }
  };

  const onAcceptReview = async () => {
    if (!report || !confirm("멘토의 피드백을 수락하고 최종 보고서로 확정하시겠습니까?\n확정 후에는 원본 비교와 멘토 채팅 기능이 사라지며, 보고서를 직접 자유롭게 수정할 수 있게 됩니다.")) return;
    setAccepting(true);
    try {
      await api.post(`/reports/${reportId}/accept-review`);
      // Re-fetch report
      const updated = await api.get<ReportResponse>(`/reports/${reportId}`);
      setReport(updated);
      setActiveTab("mentor");
    } catch (e) {
      console.error(e);
      alert("수락 처리에 실패했습니다.");
    } finally {
      setAccepting(false);
    }
  };

  const onRejectReview = async () => {
    if (!report || !confirm("멘토에게 수정 요청을 보내시겠습니까?")) return;
    setRejecting(true);
    try {
      await api.post(`/reports/${reportId}/reject-review`);
      // Re-fetch report and messages
      const [updated, msgs] = await Promise.all([
          api.get<ReportResponse>(`/reports/${reportId}`),
          api.get<FeedbackMessage[]>(`/reports/${reportId}/feedback`)
      ]);
      setReport(updated);
      setMessages(msgs);
      alert("수정 요청이 전달되었습니다. 멘토가 다시 검토 후 안내해 드릴 예정입니다.");
    } catch (e) {
      console.error(e);
      alert("수정 요청에 실패했습니다.");
    } finally {
      setRejecting(false);
    }
  };

  // ── Render: Loading & State logic ───────────────────────────────────────────
  if (loading && !report) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="text-center space-y-4">
          <Loader2 className="w-10 h-10 animate-spin mx-auto text-indigo-500" />
          <p className="text-slate-500 font-medium animate-pulse">보고서 데이터를 불러오는 중...</p>
        </div>
      </div>
    );
  }

  if (report?.status === "generating" || (showProgressUI && (report?.status === "completed" || report?.status === "awaiting_review"))) {
    return (
      <div className="min-h-screen bg-slate-50 py-8 px-4">
        <div className="max-w-3xl mx-auto">
          <DualAIWorkflow
            title={report?.status === "generating" ? "보고서 생성 중" : "보고서 생성 완료!"}
            subtitle={report?.status === "generating" ? "AI 보조 연구원이 교과서 기반 보고서를 작성하고 있습니다." : "최종 결과물을 정리하고 있습니다."}
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

  if (!report) {
    return (
      <div className="min-h-screen flex items-center justify-center text-slate-500 bg-slate-50">
        <div className="text-center space-y-2">
          <Loader2 className="w-8 h-8 animate-spin mx-auto text-slate-300" />
          <p className="text-sm">보고서를 찾을 수 없습니다.</p>
        </div>
      </div>
    );
  }

  // ── Render: report ─────────────────────────────────────────────────────────
  return (
    <div className="min-h-screen bg-slate-50 py-8 px-4 print:p-0 print:bg-white print:overflow-visible print:block">
      <div className="max-w-[1400px] mx-auto print:max-w-none print:m-0 print:overflow-visible print:block">

        <ReportHeader
          title={report.title}
          reportType={report.report_type}
          status={report.status}
          isBookmarked={report.is_bookmarked}
          editMode={editMode}
          saving={saving}
          disabled={showProgressUI}
          onBack={() => router.push("/my-reports")}
          onToggleBookmark={onToggleBookmark}
          onDownloadPdf={() => window.print()}
          onToggleEdit={() => setEditMode((prev) => !prev)}
          onSave={onSave}
        />

        <div className="space-y-5">
          <ReportPremiumBanner
            reportType={report.report_type}
            status={report.status}
            mentorReviewedAt={report.mentor_reviewed_at}
            mentorComment={report.mentor_comment}
          />

          {report.status === "review_confirmed" || report.status === "awaiting_review" ? (
            <div className="grid grid-cols-1 xl:grid-cols-4 gap-6 items-start">
              <div className="xl:col-span-3">
                <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                  <div className="flex items-center justify-between mb-4 bg-white p-2 rounded-2xl border border-slate-100 shadow-sm">
                    <TabsList className="bg-slate-100/50 p-1 gap-1 h-auto rounded-xl">
                      <TabsTrigger value="original" className="rounded-lg py-2 px-4 data-[state=active]:bg-white data-[state=active]:text-slate-900 data-[state=active]:shadow-sm text-sm font-medium transition-all">
                        <History className="w-4 h-4 mr-2" /> 원본
                      </TabsTrigger>
                      <TabsTrigger value="diff" className="rounded-lg py-2 px-4 data-[state=active]:bg-white data-[state=active]:text-slate-900 data-[state=active]:shadow-sm text-sm font-medium transition-all">
                        <Split className="w-4 h-4 mr-2" /> 비교하기
                      </TabsTrigger>
                      <TabsTrigger value="mentor" className="rounded-lg py-2 px-4 data-[state=active]:bg-white data-[state=active]:text-slate-900 data-[state=active]:shadow-sm text-sm font-medium transition-all">
                        <Layout className="w-4 h-4 mr-2" /> 멘토 수정본
                      </TabsTrigger>
                    </TabsList>
                    
                    <div className="flex items-center gap-2">
                        {report.status === "review_confirmed" && (
                            <Button 
                                variant="outline"
                                className="border-indigo-200 text-indigo-600 hover:bg-rose-50 hover:text-rose-600 hover:border-rose-200 font-bold rounded-xl px-4 transition-all"
                                onClick={onRejectReview}
                                disabled={rejecting || accepting}
                            >
                                {rejecting ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <History className="w-4 h-4 mr-2" />}
                                수정 요청하기
                            </Button>
                        )}
                        <Button 
                            className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl px-6"
                            onClick={onAcceptReview}
                            disabled={accepting || rejecting || report.status !== "review_confirmed"}
                        >
                            {accepting ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Check className="w-4 h-4 mr-2" />}
                            {report.status === "review_confirmed" ? "피드백 수락 및 확정" : "멘토 검토 대기 중"}
                        </Button>
                    </div>
                  </div>

                  <TabsContent value="original" className="mt-0 focus-visible:outline-none">
                    <ReportPaper 
                      createdAt={report.created_at}
                    >
                        <ReportEditorPanel
                          editorHtml={originalHtml}
                          editMode={false}
                          comments={[]} 
                          activeCommentId={null}
                          failed={false}
                          onChange={() => {}}
                          onCommentClick={() => {}}
                          noWrapper={true} 
                          showCommentControls={false}
                        />
                    </ReportPaper>
                  </TabsContent>

                  <TabsContent value="diff" className="mt-0 focus-visible:outline-none">
                    <ReportPaper 
                      createdAt={report.created_at}
                    >
                        <ReportDiffView oldHtml={originalHtml} newHtml={editorHtml} />
                    </ReportPaper>
                  </TabsContent>
                  
                  <TabsContent value="mentor" className="mt-0 focus-visible:outline-none">
                    <div className="w-full">
                        <ReportPaper 
                          createdAt={report.created_at}
                          showMentorBadge={Boolean(report.mentor_reviewed_at)}
                        >
                            <ReportEditorPanel
                                editorHtml={editorHtml}
                                editMode={false}
                                comments={comments}
                                activeCommentId={activeCommentId}
                                failed={false}
                                failureInfo={failureInfo}
                                onChange={setEditorHtml}
                                onCommentClick={setActiveCommentId}
                                noWrapper={true} 
                                showCommentControls={false}
                            />
                        </ReportPaper>
                    </div>
                  </TabsContent>
                </Tabs>
              </div>

              <div className="xl:col-span-1 space-y-6 sticky top-24 h-[calc(100vh-120px)] flex flex-col min-h-0">
                 {/* Mentor Comments (Global) */}
                 <div className="bg-white rounded-3xl border border-slate-200/70 shadow-sm overflow-hidden flex flex-col flex-1 min-h-0">
                    <div className="px-4 py-4 border-b border-slate-100 bg-slate-50/50 flex items-center gap-2">
                        <FileText className="w-5 h-5 text-indigo-500" />
                        <span className="font-bold text-slate-800">멘토 피드백</span>
                    </div>
                    <div className="flex-1 overflow-y-auto p-2">
                        <CommentSidebar
                            comments={comments}
                            activeCommentId={activeCommentId}
                            onCommentClick={setActiveCommentId}
                            editable={false}
                        />
                    </div>
                 </div>

                 {/* Mentor Chat (Global) - Fixed height for chat, more space for comments */}
                 <div className="bg-white rounded-3xl border border-slate-200/70 shadow-sm overflow-hidden flex flex-col h-[400px] shrink-0">
                    <div className="px-4 py-4 border-b border-slate-100 bg-slate-50/50 flex items-center gap-2">
                        <MessageCircle className="w-5 h-5 text-indigo-500" />
                        <span className="font-bold text-slate-800">멘토와 대화</span>
                    </div>
                    
                    <div ref={scrollRef} className="flex-1 overflow-y-auto p-4 space-y-4 scroll-smooth">
                        {messages.length === 0 ? (
                            <div className="h-full flex flex-col items-center justify-center text-center p-6 gap-3">
                                <MessageCircle className="w-10 h-10 text-slate-200" />
                                <p className="text-sm text-slate-400 font-medium text-balance">멘토에게 궁금한 점을 남겨보세요.</p>
                            </div>
                        ) : (
                            messages.map((m) => (
                                <div key={m.id} className={`flex flex-col ${m.sender_type === "mentee" ? "items-end" : "items-start"}`}>
                                    <div className={`max-w-[85%] px-4 py-2.5 rounded-2xl text-sm shadow-sm leading-relaxed ${
                                        m.sender_type === "mentee"
                                            ? "bg-indigo-600 text-white rounded-tr-none"
                                            : "bg-slate-100 text-slate-700 rounded-tl-none"
                                    }`}>
                                        {m.content}
                                    </div>
                                    <span className="text-[10px] text-slate-400 mt-1.5 px-1 font-medium">
                                        {new Date(m.created_at).toLocaleTimeString("ko-KR", { hour: "2-digit", minute: "2-digit" })}
                                    </span>
                                </div>
                            ))
                        )}
                    </div>

                    <div className="p-4 border-t border-slate-100 bg-white">
                        <div className="flex gap-2 bg-slate-100 rounded-2xl p-1.5 border border-slate-200/50">
                            <Input 
                                placeholder="메시지 입력..." 
                                className="border-none bg-transparent focus-visible:ring-0 text-sm py-5 h-auto shadow-none"
                                value={newMessage}
                                onChange={(e) => setNewMessage(e.target.value)}
                                onKeyDown={(e) => e.key === "Enter" && handleSendMessage()}
                            />
                            <Button 
                                size="icon" 
                                className="rounded-xl h-[44px] w-[44px] bg-indigo-600 hover:bg-indigo-700 text-white shrink-0 shadow-sm"
                                onClick={handleSendMessage}
                                disabled={sendingMessage || !newMessage.trim()}
                            >
                                <Send className="w-5 h-5" />
                            </Button>
                        </div>
                    </div>
                 </div>
              </div>
            </div>
          ) : (
            <ReportPaper 
                createdAt={report.created_at}
                showMentorBadge={report.status === "completed" && report.report_type === "premium"}
            >
                <ReportEditorPanel
                  editorHtml={editorHtml}
                  editMode={editMode && report.status === "completed"}
                  comments={comments}
                  activeCommentId={activeCommentId}
                  failed={report.status === "failed"}
                  failureInfo={failureInfo}
                  onChange={setEditorHtml}
                  onCommentClick={setActiveCommentId}
                  noWrapper={true}
                  showCommentControls={false}
                />
            </ReportPaper>
          )}
        </div>
      </div>
    </div>
  );
}

// ─── Component: ReportPaper ──────────────────────────────────────────────────

function ReportPaper({ 
  children, 
}: { 
  children: React.ReactNode; 
  createdAt?: string; 
  showMentorBadge?: boolean;
}) {
    return (
        <div id="report-paper-unified" className="w-full max-w-[850px] mx-auto bg-white p-8 sm:p-12 rounded-2xl shadow-sm border border-slate-100 min-h-[500px] transition-all duration-300">
            <div className="prose prose-slate max-w-none focus:outline-none min-h-[500px] prose-h1:text-4xl prose-h1:font-black prose-h1:tracking-tight prose-h1:mb-2 prose-h2:text-2xl prose-p:leading-relaxed prose-headings:font-bold">
                <div className="report-content-body">
                    {children}
                </div>
            </div>
        </div>
    );
}
