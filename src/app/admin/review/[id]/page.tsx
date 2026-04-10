"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import {
  ChevronLeft,
  Loader2,
  Save,
  ShieldCheck,
  Send,
  ClockIcon,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { api } from "@/lib/api/client";
import { getAccessToken } from "@/lib/auth";
import { track } from "@/lib/analytics";
import { TipTapEditor, CommentData } from "@/components/editor/TipTapEditor";
import { CommentSidebar } from "@/components/editor/CommentSidebar";
import { markdownToHtml, flattenLists } from "@/lib/editor-utils";

type RejectionLog = {
  reason: string;
  created_at: string;
};

type ReportResponse = {
  report_id: string;
  status: string;
  title: string;
  content: Record<string, any> | null;
  report_type: string;
  created_at: string;
  mentor_reviewed_at: string | null;
  mentor_comment: string | null;
  section_summaries: Record<string, string> | null;
  rejection_logs: RejectionLog[] | null;
};

// Deprecated sectionDefs, will now use a single mentor_comment field
const sectionDefs = [];

export default function MentorReviewPage() {
  const router = useRouter();
  const params = useParams();
  const reportId = params.id as string;

  const [report, setReport] = useState<ReportResponse | null>(null);
  const [editTitle, setEditTitle] = useState("");
  const [editorHtml, setEditorHtml] = useState("");
  const [comments, setComments] = useState<CommentData[]>([]);
  const [activeCommentId, setActiveCommentId] = useState<string | null>(null);
  const [mentorComment, setMentorComment] = useState("");
  const [rejectionLogs, setRejectionLogs] = useState<RejectionLog[]>([]);

  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [saveAction, setSaveAction] = useState<"draft" | "send" | null>(null);

  useEffect(() => {
    if (!getAccessToken()) {
      router.replace("/login");
      return;
    }

    const load = async () => {
      try {
        const data = await api.get<ReportResponse>(`/admin/reports/${reportId}`);

        setReport(data);
        setEditTitle(data.title);
        setRejectionLogs(data.rejection_logs || []);

        setMentorComment(data.mentor_comment ?? "");

        let mergedHtml = "";
        let parsedComments: CommentData[] = [];

        if (data.content?.html && typeof data.content.html === "string") {
          mergedHtml = data.content.html;
          parsedComments = Array.isArray(data.content.comments) ? data.content.comments : [];
        } else {
          let mergedMarkdown = "";
          const rawSections = data.content?.sections;
          if (Array.isArray(rawSections) && rawSections.length > 0) {
            mergedMarkdown = rawSections.map(s => `## ${s.heading}\n\n${s.content}`).join("\n\n");
          } else if (data.content) {
            mergedMarkdown = sectionDefs
              .filter(def => typeof data.content![def.key] === "string" && data.content![def.key].trim() !== "")
              .map(def => `## ${def.label}\n\n${data.content![def.key]}`)
              .join("\n\n");
          }
          mergedHtml = markdownToHtml(mergedMarkdown);
        }

        if (mergedHtml) {
          mergedHtml = flattenLists(mergedHtml);
          if (!mergedHtml.trim().startsWith("<h1")) {
            const dateStr = new Date(data.created_at).toLocaleDateString("ko-KR");
            let metadataHtml = `<p><span style="color: #94a3b8; font-size: 0.875rem; font-weight: 500; font-family: ui-sans-serif, system-ui, sans-serif;">생성일: ${dateStr}</span></p>`;
            if (data.mentor_reviewed_at) {
              metadataHtml = `<p><span style="color: #94a3b8; font-size: 0.875rem; font-weight: 500; font-family: ui-sans-serif, system-ui, sans-serif;">생성일: ${dateStr} | </span><span style="color: #059669; font-weight: 600; font-size: 0.75rem; background-color: #ecfdf5; padding: 2px 8px; border-radius: 9999px; border: 1px solid #d1fae5; font-family: ui-sans-serif, system-ui, sans-serif;">멘토 첨삭 완료</span></p>`;
            }
            mergedHtml = `<h1>${data.title}</h1>\n${metadataHtml}\n<hr />\n${mergedHtml}`;
          }
          setEditorHtml(mergedHtml);
        }
        setComments(parsedComments);
        track.adminReviewStarted({ report_id: reportId });
      } catch (e) {
        console.error(e);
        alert("리포트를 불러오는 데 실패했습니다.");
        router.push("/admin");
      } finally {
        setLoading(false);
      }
    };

    load().catch(console.error);
  }, [reportId, router]);

  const handleSave = async (action: "draft" | "send") => {
    if (!report) return;

    setSaveAction(action);
    setSubmitting(true);
    try {
      const updatedContent = {
        ...(report.content || {}),
        html: editorHtml,
        comments: comments,
      };

      const temp = document.createElement("div");
      temp.innerHTML = editorHtml || "";
      const extractedTitle = temp.querySelector("h1")?.innerText?.trim() || report.title;

      const endpoint = action === "draft"
        ? `/admin/reports/${reportId}/save-draft`
        : `/admin/reports/${reportId}/send-to-mentee`;

      await api.post(endpoint, {
        content: updatedContent,
        mentor_comment: mentorComment,
        title: extractedTitle,
      });

      alert(action === "draft" ? "임시 저장되었습니다." : "멘티에게 피드백을 전송했습니다.");
      if (action === "send") {
        track.adminReviewCompleted({ report_id: reportId });
        router.push("/admin");
      } else {
        const updated = await api.get<ReportResponse>(`/admin/reports/${reportId}`);
        setReport(updated);
      }
    } catch (e) {
      console.error(e);
      alert("작업에 실패했습니다.");
    } finally {
      setSubmitting(false);
      setSaveAction(null);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-indigo-600" />
      </div>
    );
  }

  if (!report) return null;

  return (
    <div className="min-h-screen bg-slate-50 py-10 px-4">
      <div className="max-w-[1400px] mx-auto space-y-6">
        <div className="flex items-center justify-between no-print">
          <Button
            variant="ghost"
            className="flex items-center gap-2 text-slate-600 hover:text-slate-900"
            onClick={() => router.push("/admin")}
          >
            <ChevronLeft className="w-4 h-4" /> 관리자 대시보드
          </Button>
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium text-slate-500">리포트 ID: {reportId.slice(0, 8)}</span>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 items-start">
          {/* Editor */}
          <div className="lg:col-span-3 space-y-6">
            <div className="relative w-full print:static print:block print:overflow-visible">
              <div id="report-paper" className="print-area w-full max-w-[850px] mx-auto transition-all">
                <div className="bg-white p-8 rounded-2xl shadow-sm border border-slate-100">
                  <TipTapEditor
                    initialContent={editorHtml}
                    editable={report.status !== "completed"}
                    onChange={(html) => setEditorHtml(html)}
                    onCommentCreated={(comment) => setComments(prev => [...prev, comment])}
                    onCommentClick={(id) => setActiveCommentId(id)}
                    comments={comments}
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6 lg:col-span-1">
            <Card className="rounded-3xl border-slate-200/70 shadow-sm sticky top-6">
              <CardHeader className="bg-amber-50/50 border-b border-amber-100 py-4">
                <CardTitle className="text-lg text-amber-900">
                  <ShieldCheck className="w-5 h-5 inline-block text-amber-600 mr-2" />
                  리뷰 관리
                </CardTitle>
              </CardHeader>
              <CardContent className="p-4 space-y-6">

                {/* Inline comments sidebar */}
                <CommentSidebar
                  comments={comments}
                  activeCommentId={activeCommentId}
                  onCommentClick={(id) => setActiveCommentId(id)}
                  onCommentDelete={(id) => {
                    setComments(prev => prev.filter(c => c.id !== id));
                  }}
                  editable={report.status !== "completed"}
                />

                {/* Mentee revision request log */}
                {rejectionLogs.length > 0 && (
                  <div className="pt-4 border-t border-slate-100 space-y-3">
                    <div className="flex items-center gap-1.5 text-sm font-semibold text-rose-700">
                      <ClockIcon className="w-4 h-4" />
                      멘티 수정 요청 내역
                    </div>
                    <div className="space-y-2 max-h-[200px] overflow-y-auto">
                      {rejectionLogs.map((log, idx) => (
                        <div key={idx} className="bg-rose-50 border border-rose-100 rounded-xl p-3 space-y-1">
                          <p className="text-xs text-rose-700 leading-relaxed whitespace-pre-wrap">{log.reason}</p>
                          <p className="text-[10px] text-rose-400 font-medium">
                            {new Date(log.created_at).toLocaleString("ko-KR", {
                              year: "numeric", month: "short", day: "numeric",
                              hour: "2-digit", minute: "2-digit",
                            })}
                          </p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Single General Summary */}
                <div className="pt-4 border-t border-slate-100 space-y-4">
                  <div className="text-sm font-semibold text-slate-700">멘토 총평</div>
                  <div className="space-y-3">
                    <textarea
                      className="w-full text-sm border border-slate-200 rounded-xl p-3.5 min-h-[220px] outline-none focus:ring-2 focus:ring-amber-400 resize-none transition-all shadow-inner"
                      placeholder="리포트에 대한 종합적인 피드백을 남겨주세요."
                      value={mentorComment}
                      onChange={(e) => setMentorComment(e.target.value)}
                    />
                  </div>

                  {/* Action buttons */}
                  <div className="flex flex-col gap-2 pt-2">
                    <Button
                      variant="outline"
                      className="w-full border-slate-200 text-slate-700 rounded-xl py-5 h-auto font-semibold"
                      onClick={() => handleSave("draft")}
                      disabled={submitting}
                    >
                      {submitting && saveAction === "draft" ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Save className="w-4 h-4 mr-2" />}
                      임시 저장
                    </Button>
                    <Button
                      className="w-full bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl py-5 h-auto font-bold shadow-md"
                      onClick={() => handleSave("send")}
                      disabled={submitting}
                    >
                      {submitting && saveAction === "send" ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Send className="w-4 h-4 mr-2" />}
                      피드백 전송 (멘티 확인 요청)
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
