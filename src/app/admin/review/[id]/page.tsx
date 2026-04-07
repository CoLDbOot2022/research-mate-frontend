"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import {
  ChevronLeft,
  Loader2,
  Save,
  ShieldCheck,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { api } from "@/lib/api/client";
import { getAccessToken } from "@/lib/auth";
import { TipTapEditor, CommentData } from "@/components/editor/TipTapEditor";
import { CommentSidebar } from "@/components/editor/CommentSidebar";
import { markdownToHtml, flattenLists } from "@/lib/editor-utils";
import { v4 as uuidv4 } from "uuid";

type ReportResponse = {
  report_id: string;
  status: string;
  title: string;
  content: Record<string, any> | null;
  report_type: string;
  created_at: string;
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
];

export default function MentorReviewPage() {
  const router = useRouter();
  const params = useParams();
  const reportId = params.id as string;

  const [report, setReport] = useState<ReportResponse | null>(null);
  const [editTitle, setEditTitle] = useState("");
  const [editorHtml, setEditorHtml] = useState("");
  const [comments, setComments] = useState<CommentData[]>([]);
  const [activeCommentId, setActiveCommentId] = useState<string | null>(null);
  const [mentorComment, setMentorComment] = useState(""); // General summary comment
  
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!getAccessToken()) {
      router.replace("/login");
      return;
    }

    const load = async () => {
      try {
        const data = await api.get<ReportResponse>(`/reports/${reportId}`);
        setReport(data);
        setEditTitle(data.title);
        
        let mergedHtml = "";
        let parsedComments: CommentData[] = [];

        if (data.content?.html && typeof data.content.html === "string") {
          mergedHtml = data.content.html;
          parsedComments = Array.isArray(data.content.comments) ? data.content.comments : [];
        } else {
          // Backward compatibility: Convert markdown sections to HTML
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

  const handleSubmit = async () => {
    if (!report) return;

    setSubmitting(true);
    try {
      const updatedContent = { 
        ...(report.content || {}), 
        html: editorHtml,
        comments: comments,
      };

      await api.post(`/admin/reports/${reportId}/review`, {
        content: updatedContent,
        mentor_comment: mentorComment || "멘토 리뷰가 완료되었습니다.",
      });
      
      if (editTitle !== report.title) {
        await api.patch(`/reports/${reportId}`, {
          content: updatedContent,
          title: editTitle
        });
      }

      alert("리뷰가 성공적으로 제출되었습니다.");
      router.push("/admin");
    } catch (e) {
      console.error(e);
      alert("리뷰 제출에 실패했습니다.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleCommentAdd = (quote: string, range: { from: number, to: number }) => {
    const text = prompt("코멘트를 입력하세요:");
    if (!text) return;

    const id = uuidv4();
    const newComment: CommentData = {
      id,
      text,
      quote,
      createdAt: Date.now(),
    };

    setComments(prev => [...prev, newComment]);
    
    // We also need to tell the editor to set the mark!
    // But how do we access editor.chain().setComment(id)?
    // The cleanest way is to dispatch a custom event or let TipTapEditor handle the Mark internally,
    // actually, if we pass a callback that receives the id, but TipTapEditor calls onCommentAdd AFTER getting the text.
    // Let's modify TipTapEditor to accept a ref or a command to add mark, or we just rely on `document.execCommand`? No.
    // Wait! TipTapEditor is doing the command. Let's fix TipTapEditor so it asks for the text and sets the mark natively!
  };

  // Temporarily pass an event listener or handle this via window event.
  // Actually, let's fix TipTapEditor in a moment to handle the prompt and mark internally,
  // then it fires `onCommentAdd({ id, text, quote })` to the parent so parent can just save it.

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
          <div className="lg:col-span-3 space-y-6">
            <div className="relative w-full print:static print:block print:overflow-visible">
              <div id="report-paper" className="print-area w-full max-w-[850px] mx-auto transition-all">
                <div className="max-w-[850px] mx-auto">
                {/* 
                  Instead of passing handleCommentAdd, we'll let TipTapEditor ask for the text, 
                  generate the ID, apply the mark, and then inform us so we just save it to state.
                */}
                <TipTapEditor
                  initialContent={editorHtml}
                  editable={true}
                  onChange={(html) => setEditorHtml(html)}
                  onCommentCreated={(comment) => setComments(prev => [...prev, comment])}
                  onCommentClick={(id) => setActiveCommentId(id)}
                  comments={comments}
                />
                </div>
              </div>
            </div>
          </div>

          <div className="space-y-6 lg:col-span-1">
            <Card className="rounded-3xl border-slate-200/70 shadow-sm sticky top-6">
              <CardHeader className="bg-amber-50/50 border-b border-amber-100 py-4">
                <CardTitle className="text-lg text-amber-900">
                  <ShieldCheck className="w-5 h-5 inline-block text-amber-600 mr-2" />
                  리뷰 관리
                </CardTitle>
              </CardHeader>
              <CardContent className="p-4 space-y-6">
                
                <CommentSidebar 
                  comments={comments} 
                  activeCommentId={activeCommentId} 
                  onCommentClick={(id) => setActiveCommentId(id)}
                  onCommentDelete={(id) => {
                    setComments(prev => prev.filter(c => c.id !== id));
                    // Note: Ideally we should unset the mark in the editor as well.
                    // To do that easily, we can emit an event or recreate editor HTML,
                    // but for now deleting the comment removes it from sidebar.
                  }}
                  editable={true}
                />

                <div className="pt-4 border-t border-slate-100 space-y-4">
                  <div className="text-sm font-semibold text-slate-700">리뷰 총평 남기기</div>
                  <textarea
                    className="w-full text-sm border-slate-200 rounded-lg p-3 min-h-[100px] outline-none focus:ring-2 focus:ring-amber-400"
                    placeholder="리뷰 총평을 작성하세요 (선택)"
                    value={mentorComment}
                    onChange={(e) => setMentorComment(e.target.value)}
                  />
                  <Button
                    className="w-full bg-slate-900 hover:bg-slate-950 text-white rounded-xl py-6 h-auto font-bold shadow-lg"
                    onClick={handleSubmit}
                    disabled={submitting}
                  >
                    {submitting ? <Loader2 className="w-5 h-5 animate-spin mr-2" /> : <Save className="w-5 h-5 mr-2" />}
                    피드백 완료 (저장)
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
