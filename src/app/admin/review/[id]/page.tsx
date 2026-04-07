"use client";

import { useEffect, useRef, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import {
  ChevronLeft,
  Loader2,
  Save,
  ShieldCheck,
  Send,
  MessageCircle,
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

type FeedbackMessage = {
  id: number;
  sender_type: "mentor" | "mentee";
  content: string;
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
  
  const [messages, setMessages] = useState<FeedbackMessage[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [sendingMessage, setSendingMessage] = useState(false);
  
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [saveAction, setSaveAction] = useState<"draft" | "send" | null>(null);
  const chatEndRef = useRef<HTMLDivElement>(null);

  // ── Auto-scroll Chat ────────────────────────────────────────────────────────
  useEffect(() => {
    if (chatEndRef.current) {
        chatEndRef.current.scrollTop = chatEndRef.current.scrollHeight;
    }
  }, [messages]);

  useEffect(() => {
    if (!getAccessToken()) {
      router.replace("/login");
      return;
    }

    const load = async () => {
      try {
        const [data, msgs] = await Promise.all([
          api.get<ReportResponse>(`/admin/reports/${reportId}`),
          api.get<FeedbackMessage[]>(`/admin/reports/${reportId}/feedback`)
        ]);
        
        setReport(data);
        setEditTitle(data.title);
        setMessages(msgs);
        
        if (data.mentor_comment) setMentorComment(data.mentor_comment);
        
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

      // Extract title from <h1> in editorHtml
      const temp = document.createElement("div");
      temp.innerHTML = editorHtml || "";
      const extractedTitle = temp.querySelector("h1")?.innerText?.trim() || report.title;

      const endpoint = action === "draft" 
        ? `/admin/reports/${reportId}/save-draft` 
        : `/admin/reports/${reportId}/send-to-mentee`;

      await api.post(endpoint, {
        content: updatedContent,
        mentor_comment: mentorComment || "멘토 리뷰가 진행 중입니다.",
      });
      
      if (extractedTitle && extractedTitle !== report.title) {
        await api.patch(`/reports/${reportId}`, {
          content: updatedContent,
          title: extractedTitle
        });
      }

      alert(action === "draft" ? "임시 저장되었습니다." : "멘티에게 피드백을 전송했습니다.");
      if (action === "send") router.push("/admin");
      else {
          // Refresh report info
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

  const handleSendMessage = async () => {
    if (!newMessage.trim() || sendingMessage) return;
    setSendingMessage(true);
    try {
      const msg = await api.post<FeedbackMessage>(`/admin/reports/${reportId}/feedback`, {
        content: newMessage
      });
      setMessages(prev => [...prev, msg]);
      setNewMessage("");
    } catch (e) {
      console.error(e);
      alert("메시지 전송에 실패했습니다.");
    } finally {
      setSendingMessage(false);
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
                  editable={report.status !== "completed"}
                />

                <div className="pt-4 border-t border-slate-100 space-y-4">
                  <div className="text-sm font-semibold text-slate-700">리뷰 총평 남기기</div>
                  <textarea
                    className="w-full text-sm border-slate-200 rounded-lg p-3 min-h-[100px] outline-none focus:ring-2 focus:ring-amber-400"
                    placeholder="리뷰 총평을 작성하세요 (선택)"
                    value={mentorComment}
                    onChange={(e) => setMentorComment(e.target.value)}
                  />
                  <div className="flex flex-col gap-2">
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

                <div className="pt-6 border-t border-slate-100 flex flex-col gap-4">
                  <div className="flex items-center gap-2 text-sm font-bold text-slate-700">
                    <MessageCircle className="w-4 h-4 text-indigo-500" />
                    멘티와 대화하기
                  </div>
                  
                  <div ref={chatEndRef} className="bg-slate-50/80 rounded-xl p-3 max-h-[300px] overflow-y-auto space-y-3 border border-slate-100 scroll-smooth">
                        {messages.length === 0 ? (
                            <div className="h-full flex flex-col items-center justify-center text-center p-6 gap-3">
                                <MessageCircle className="w-10 h-10 text-slate-200" />
                                <p className="text-sm text-slate-400 font-medium">멘토에게 수정 요청이나 궁금한 점을 남겨보세요.</p>
                            </div>
                        ) : (
                            messages.map((m) => (
                                <div key={m.id} className={`flex flex-col ${m.sender_type === "mentor" ? "items-end" : "items-start"}`}>
                                    <div className={`max-w-[85%] px-4 py-2.5 rounded-2xl text-xs shadow-sm leading-relaxed ${
                                        m.sender_type === "mentor"
                                            ? "bg-indigo-600 text-white rounded-tr-none"
                                            : "bg-white text-slate-700 border border-slate-200 rounded-tl-none"
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

                  <div className="flex gap-2">
                    <Input 
                      placeholder="메시지 입력..." 
                      className="text-xs rounded-lg py-4 border-slate-200"
                      value={newMessage}
                      onChange={(e) => setNewMessage(e.target.value)}
                      onKeyDown={(e) => e.key === "Enter" && handleSendMessage()}
                    />
                    <Button 
                      size="icon" 
                      className="shrink-0 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg"
                      onClick={handleSendMessage}
                      disabled={sendingMessage || !newMessage.trim()}
                    >
                      <Send className="w-4 h-4" />
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
