"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, Send, MessageSquare, Clock, CheckCircle2, ChevronDown, ChevronUp, Loader2 } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { api } from "@/lib/api/client";
import { getAccessToken } from "@/lib/auth";

type InquiryMessage = {
  id: number;
  inquiry_id: number;
  is_admin: boolean;
  content: string;
  created_at: string;
};

type Inquiry = {
  id: number;
  category: string;
  content: string;
  status: string;
  created_at: string;
  messages: InquiryMessage[];
};

const CATEGORIES = [
  { value: "feedback", label: "서비스 피드백" },
  { value: "bug", label: "버그 제보" },
  { value: "feature", label: "기능 제안" },
  { value: "other", label: "기타 문의" },
];

export default function SupportPage() {
  const router = useRouter();
  const [inquiries, setInquiries] = useState<Inquiry[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [expandedId, setExpandedId] = useState<number | null>(null);

  // Form State
  const [category, setCategory] = useState("feedback");
  const [content, setContent] = useState("");
  
  // Reply State
  const [replyTexts, setReplyTexts] = useState<Record<number, string>>({});
  const [replyingId, setReplyingId] = useState<number | null>(null);

  const isLoggedIn = !!getAccessToken();

  useEffect(() => {
    if (!isLoggedIn) {
      router.push("/login?redirect=/support");
      return;
    }
    loadInquiries();
  }, [isLoggedIn, router]);

  const loadInquiries = async () => {
    try {
      const data = await api.get<Inquiry[]>("/inquiry/me");
      setInquiries(data);
    } catch (error) {
      console.error("Failed to load inquiries:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!content.trim()) return;

    setSubmitting(true);
    try {
      await api.post("/inquiry", {
        category,
        content,
      });
      
      setContent("");
      await loadInquiries();
      alert("문의가 성공적으로 접수되었습니다.");
    } catch (error) {
      alert("문의 접수에 실패했습니다. 다시 시도해주세요.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleReply = async (inquiryId: number) => {
    const text = replyTexts[inquiryId];
    if (!text || !text.trim()) return;
    
    setReplyingId(inquiryId);
    try {
      const updated = await api.post<Inquiry>(`/inquiry/${inquiryId}/reply`, { content: text });
      setInquiries((prev) => prev.map((iq) => (iq.id === inquiryId ? updated : iq)));
      setReplyTexts((prev) => ({ ...prev, [inquiryId]: "" }));
    } catch (error) {
      alert("답변 등록에 실패했습니다.");
    } finally {
      setReplyingId(null);
    }
  };

  if (!isLoggedIn) return null;

  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top_right,_rgba(59,130,246,0.08),_transparent_25%),linear-gradient(180deg,#f8fafc_0%,#ffffff_100%)] px-4 py-12">
      <div className="mx-auto max-w-4xl space-y-8">
        {/* Header */}
        <div className="flex items-center justify-between">
          <Button variant="ghost" className="gap-2 text-slate-600 hover:text-slate-900" onClick={() => router.back()}>
            <ArrowLeft className="h-4 w-4" /> 뒤로가기
          </Button>
          <div className="text-right">
            <h1 className="text-3xl font-black tracking-tight text-slate-900">고객 지원 센터</h1>
            <p className="mt-1 text-sm text-slate-500">세특연구소 팀에게 소중한 의견을 들려주세요.</p>
          </div>
        </div>

        <div className="grid gap-8 lg:grid-cols-[1fr_1.2fr]">
          {/* New Inquiry Form */}
          <Card className="h-fit rounded-[2rem] border-slate-200 shadow-sm">
            <CardHeader>
              <CardTitle className="text-xl">새 문의하기</CardTitle>
              <CardDescription>궁금한 점이나 제안하고 싶은 내용을 남겨주세요.</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-5">
                <div className="space-y-2">
                  <Label>문의 유형</Label>
                  <Select value={category} onValueChange={setCategory}>
                    <SelectTrigger className="rounded-xl border-slate-200 bg-slate-50/50">
                      <SelectValue placeholder="유형 선택" />
                    </SelectTrigger>
                    <SelectContent>
                      {CATEGORIES.map((cat) => (
                        <SelectItem key={cat.value} value={cat.value}>{cat.label}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>상세 내용</Label>
                  <Textarea 
                    placeholder="내용을 입력해주세요..." 
                    className="min-h-[160px] resize-none rounded-xl border-slate-200 bg-slate-50/50 p-4" 
                    required
                    value={content}
                    onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setContent(e.target.value)}
                  />
                </div>

                <Button 
                  type="submit" 
                  disabled={submitting} 
                  className="w-full h-12 rounded-xl bg-blue-600 font-bold text-white hover:bg-blue-700 shadow-lg shadow-blue-200/50"
                >
                  {submitting ? <Loader2 className="h-5 w-5 animate-spin" /> : <><Send className="mr-2 h-4 w-4" /> 문의 보내기</>}
                </Button>
              </form>
            </CardContent>
          </Card>

          {/* Inquiry History */}
          <div className="space-y-6">
            <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
              <Clock className="w-5 h-5 text-blue-500" /> 내 문의 내역
            </h2>

            {!isLoggedIn ? (
              <Card className="rounded-[2rem] border-dashed border-slate-300 bg-slate-50/30">
                <CardContent className="flex flex-col items-center justify-center py-16 text-center">
                  <div className="mb-4 rounded-full bg-white p-4 shadow-sm">
                    <MessageSquare className="h-8 w-8 text-slate-400" />
                  </div>
                  <p className="font-semibold text-slate-900">로그인이 필요합니다</p>
                  <p className="mt-2 text-sm text-slate-500">문의 내역을 확인하시려면 로그인을 해주세요.</p>
                  <Button variant="outline" className="mt-6 rounded-xl" onClick={() => router.push("/login")}>
                    로그인하러 가기
                  </Button>
                </CardContent>
              </Card>
            ) : loading ? (
              <div className="flex justify-center py-20">
                <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
              </div>
            ) : inquiries.length === 0 ? (
              <div className="text-center py-20 bg-slate-50/50 rounded-[2rem] border border-dashed border-slate-200">
                <p className="text-slate-500">아직 접수된 문의가 없습니다.</p>
              </div>
            ) : (
              <div className="space-y-4">
                {inquiries.map((inquiry) => (
                  <Card key={inquiry.id} className="overflow-hidden rounded-2xl border-slate-200 shadow-sm transition-all hover:border-blue-200">
                    <div 
                      className="cursor-pointer px-6 py-5 flex items-center justify-between"
                      onClick={() => setExpandedId(expandedId === inquiry.id ? null : inquiry.id)}
                    >
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-bold text-blue-600 uppercase tracking-wider bg-blue-50 px-2 py-0.5 rounded">
                            {CATEGORIES.find(c => c.value === inquiry.category)?.label || inquiry.category}
                          </span>
                          <span className="text-xs text-slate-400">
                            {new Date(inquiry.created_at).toLocaleDateString("ko-KR")}
                          </span>
                        </div>
                        <p className={`font-medium text-slate-900 ${expandedId === inquiry.id ? "whitespace-pre-wrap mt-3 text-sm leading-relaxed" : "line-clamp-1"}`}>
                          {inquiry.content}
                        </p>
                      </div>
                      <div className="flex items-center gap-4">
                        {inquiry.status === "answered" ? (
                          <span className="flex items-center gap-1 text-xs font-bold text-emerald-600 shrink-0">
                            <CheckCircle2 className="w-3 h-3" /> 답변 완료
                          </span>
                        ) : (
                          <span className="text-xs font-bold text-slate-400 shrink-0">답변 대기</span>
                        )}
                        {expandedId === inquiry.id ? <ChevronUp className="w-4 h-4 text-slate-400 shrink-0" /> : <ChevronDown className="w-4 h-4 text-slate-400 shrink-0" />}
                      </div>
                    </div>

                    <AnimatePresence>
                      {expandedId === inquiry.id && (
                        <motion.div
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: "auto", opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          className="bg-slate-50/50 px-6 pb-6 pt-0 overflow-hidden flex flex-col gap-4"
                        >
                          <div className="space-y-4 pt-4 border-t border-slate-100">
                            {inquiry.messages?.map((msg) => (
                              <div key={msg.id} className={`flex flex-col ${msg.is_admin ? "items-start" : "items-end"}`}>
                                <div className={`max-w-[85%] rounded-2xl p-4 ${msg.is_admin ? "bg-white border border-slate-200 shadow-sm rounded-tl-sm" : "bg-blue-600 text-white shadow-sm rounded-tr-sm"}`}>
                                  {msg.is_admin && <p className="text-[10px] font-black text-blue-600 mb-1.5 uppercase tracking-wide">관리자 답변</p>}
                                  <p className="text-sm whitespace-pre-wrap break-words leading-relaxed">{msg.content}</p>
                                </div>
                                <span className="text-[10px] text-slate-400 mt-1.5 px-1">{new Date(msg.created_at).toLocaleString("ko-KR")}</span>
                              </div>
                            ))}
                            
                            {inquiry.messages?.length === 0 && (
                              <div className="rounded-xl bg-slate-100 p-4 border border-slate-200 text-center">
                                <p className="text-xs font-medium text-slate-500">현재 팀에서 문의 내용을 검토 중입니다.</p>
                              </div>
                            )}
                          </div>

                          <div className="mt-4 flex gap-2">
                            <Textarea 
                              className="min-h-[50px] resize-none rounded-xl border-slate-200 bg-white" 
                              placeholder="추가 문의사항을 입력해주세요..."
                              value={replyTexts[inquiry.id] || ""}
                              onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setReplyTexts(prev => ({ ...prev, [inquiry.id]: e.target.value }))}
                            />
                            <Button 
                              className="h-auto rounded-xl bg-slate-900 px-4 shrink-0 transition-transform active:scale-95"
                              disabled={replyingId === inquiry.id || !(replyTexts[inquiry.id]?.trim())}
                              onClick={() => handleReply(inquiry.id)}
                            >
                              {replyingId === inquiry.id ? <Loader2 className="w-5 h-5 animate-spin" /> : <Send className="w-5 h-5" />}
                            </Button>
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </Card>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
