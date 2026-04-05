"use client";

import { useEffect, useMemo, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";
import "katex/dist/katex.min.css";
import { flattenLists, markdownToHtml } from "@/lib/editor-utils";
import { DualAIWorkflow } from "@/components/common/DualAIWorkflow";
import { getAccessToken } from "@/lib/auth";
import { api } from "@/lib/api/client";
import type { CommentData } from "@/components/editor/TipTapEditor";

import { ReportHeader } from "@/components/report/ReportHeader";
import { ReportPremiumBanner } from "@/components/report/ReportPremiumBanner";
import { ReportEditorPanel } from "@/components/report/ReportEditorPanel";

// ─── Types ────────────────────────────────────────────────────────────────────

type ReportContent = Record<string, unknown>;

type ReportResponse = {
  report_id: string;
  status: "generating" | "completed" | "failed" | "awaiting_review";
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
  const [comments, setComments] = useState<CommentData[]>([]);
  const [activeCommentId, setActiveCommentId] = useState<string | null>(null);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [showProgressUI, setShowProgressUI] = useState(true);
  const [forceCompleteProgress, setForceCompleteProgress] = useState(false);

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
        const res = await api.get<ReportResponse>(`/reports/${reportId}`);
        if (!mounted) return;

        setReport(res);

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

          // Prepend title + metadata block if not already present
          if (!mergedHtml.trim().startsWith("<h1")) {
            const dateStr = new Date(res.created_at).toLocaleDateString("ko-KR");
            const metadataHtml = res.mentor_reviewed_at
              ? `<p><span style="color:#94a3b8;font-size:0.875rem;font-weight:500;font-family:ui-sans-serif,system-ui,sans-serif">생성일: ${dateStr} | </span><span style="color:#059669;font-weight:600;font-size:0.75rem;background-color:#ecfdf5;padding:2px 8px;border-radius:9999px;border:1px solid #d1fae5;font-family:ui-sans-serif,system-ui,sans-serif">멘토 첨삭 완료</span></p>`
              : `<p><span style="color:#94a3b8;font-size:0.875rem;font-weight:500;font-family:ui-sans-serif,system-ui,sans-serif">생성일: ${dateStr}</span></p>`;
            mergedHtml = `<h1>${res.title}</h1>\n${metadataHtml}\n<hr />\n${mergedHtml}`;
          }
          setEditorHtml(mergedHtml);
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
      const temp = document.createElement("div");
      temp.innerHTML = editorHtml || "";
      const docTitle = temp.querySelector("h1")?.innerText?.trim() || "제목 없음";

      const updatedContent: ReportContent = {
        ...(report.content || {}),
        html: editorHtml,
        comments,
      };

      const payload: { content: ReportContent; title?: string } = { content: updatedContent };
      if (docTitle && docTitle !== report.title) payload.title = docTitle;

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

  // ── Render: generating overlay ─────────────────────────────────────────────
  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 py-8 px-4">
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

  if (!report) {
    return (
      <div className="min-h-screen flex items-center justify-center text-slate-500">
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
          disabled={showProgressUI || report.status === "generating"}
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

          <ReportEditorPanel
            editorHtml={editorHtml}
            editMode={editMode}
            comments={comments}
            activeCommentId={activeCommentId}
            failed={report.status === "failed"}
            failureInfo={failureInfo}
            onChange={setEditorHtml}
            onCommentClick={setActiveCommentId}
          />
        </div>
      </div>
    </div>
  );
}
