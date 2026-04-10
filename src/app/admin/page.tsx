"use client";

import { useEffect, useState } from "react";
import { notFound, useRouter } from "next/navigation";
import { 
  Loader2, 
  MessageSquare, 
  Minus, 
  Plus, 
  Shield, 
  Users, 
  CheckCircle2, 
  Send, 
  ChevronDown, 
  ChevronUp, 
  FileText, 
  FileCheck, 
  ClipboardList 
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { api } from "@/lib/api/client";
import { getAccessToken } from "@/lib/auth";
import { track } from "@/lib/analytics";

type PackageCredit = {
  package_code: string;
  credit_balance: number;
};

type AdminReport = {
  report_id: string;
  title: string;
  user_email: string;
  created_at: string;
  status: string;
};

type AdminUser = {
  id: number;
  email: string;
  name: string | null;
  credit_balance: number;
  created_at: string;
  package_credits: PackageCredit[];
};

type InquiryMessage = {
  id: number;
  inquiry_id: number;
  is_admin: boolean;
  content: string;
  created_at: string;
};

type Inquiry = {
  id: number;
  user_id?: number;
  category: string;
  email?: string;
  content: string;
  status: string;
  created_at: string;
  messages: InquiryMessage[];
};

type AdjustResponse = {
  user_id: number;
  package_code: string;
  new_balance: number;
  delta: number;
};

export default function AdminPage() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<"users" | "inquiries" | "reports">("users");
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [inquiries, setInquiries] = useState<Inquiry[]>([]);
  const [reports, setReports] = useState<AdminReport[]>([]);
  const [loading, setLoading] = useState(true);
  
  const [adjustingKey, setAdjustingKey] = useState("");
  
  // Reply State
  const [replyTexts, setReplyTexts] = useState<Record<number, string>>({});
  const [replyingId, setReplyingId] = useState<number | null>(null);

  // Edit State
  const [editingMsgId, setEditingMsgId] = useState<number | null>(null);
  const [editingMsgText, setEditingMsgText] = useState("");
  const [submittingEditId, setSubmittingEditId] = useState<number | null>(null);

  const [expandedId, setExpandedId] = useState<number | null>(null);
  const [notAuthorized, setNotAuthorized] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    if (!getAccessToken()) {
      router.replace("/login");
      return;
    }

    const load = async () => {
      try {
        const [userData, inquiryData, reportData] = await Promise.all([
          api.get<AdminUser[]>("/admin/users"),
          api.get<Inquiry[]>("/admin/inquiries"),
          api.get<AdminReport[]>("/admin/reports/awaiting-review"),
        ]);
        setUsers(userData);
        setInquiries(inquiryData);
        setReports(reportData);
        track.adminDashboardViewed();
      } catch {
        setNotAuthorized(true);
      } finally {
        setLoading(false);
      }
    };

    load().catch(console.error);
  }, [router]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-6 h-6 animate-spin text-slate-400" />
      </div>
    );
  }

  if (notAuthorized) {
    notFound();
  }

  const adjustCredit = async (userId: number, packageCode: string, delta: number) => {
    const key = `${userId}-${packageCode}-${delta}`;
    setAdjustingKey(key);
    try {
      const res = await api.post<AdjustResponse>(`/admin/users/${userId}/credits`, {
        package_code: packageCode,
        delta,
      });
      setUsers((prev) =>
        prev.map((u) =>
          u.id === userId
            ? {
                ...u,
                credit_balance: u.credit_balance + delta,
                package_credits: u.package_credits.map((pc) =>
                  pc.package_code === packageCode
                    ? { ...pc, credit_balance: res.new_balance }
                    : pc
                ),
              }
            : u
        )
      );
    } catch {
      alert("크레딧 변경에 실패했습니다.");
    } finally {
      setAdjustingKey("");
    }
  };

  const submitAnswer = async (inquiryId: number) => {
    const text = replyTexts[inquiryId];
    if (!text || !text.trim()) return;
    
    setReplyingId(inquiryId);
    try {
      const updated = await api.post<Inquiry>(`/admin/inquiries/${inquiryId}/answer`, {
        answer: text,
      });
      setInquiries((prev) => prev.map((iq) => (iq.id === inquiryId ? updated : iq)));
      setReplyTexts((prev) => ({ ...prev, [inquiryId]: "" }));
    } catch {
      alert("답변 등록에 실패했습니다.");
    } finally {
      setReplyingId(null);
    }
  };

  const startEditing = (msg: InquiryMessage) => {
    setEditingMsgId(msg.id);
    setEditingMsgText(msg.content);
  };

  const cancelEditing = () => {
    setEditingMsgId(null);
    setEditingMsgText("");
  };

  const submitEdit = async (inquiryId: number, msgId: number) => {
    if (!editingMsgText.trim()) return;
    setSubmittingEditId(msgId);
    try {
      const updated = await api.put<Inquiry>(`/admin/inquiries/${inquiryId}/messages/${msgId}`, {
        content: editingMsgText,
      });
      setInquiries((prev) => prev.map((iq) => (iq.id === inquiryId ? updated : iq)));
      cancelEditing();
    } catch {
      alert("답변 수정에 실패했습니다.");
    } finally {
      setSubmittingEditId(null);
    }
  };

  const getPackageBalance = (user: AdminUser, code: string) => {
    return user.package_credits.find((pc) => pc.package_code === code)?.credit_balance ?? 0;
  };

  return (
    <div className="min-h-screen bg-[linear-gradient(180deg,#f1f5f9_0%,#ffffff_30%,#eef2ff_100%)] py-10 px-4">
      <div className="max-w-6xl mx-auto space-y-8">
        <div className="rounded-[2.5rem] border bg-white/80 backdrop-blur p-10 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-1">
            <div className="flex items-center gap-3">
              <div className="bg-indigo-600 rounded-2xl p-2.5">
                <Shield className="w-6 h-6 text-white" />
              </div>
              <h1 className="text-4xl font-black tracking-tight text-slate-900">Admin Dashboard</h1>
            </div>
            <p className="text-slate-500 font-medium ml-1">서비스 현황 및 고객 문의 관리</p>
          </div>
          
          <div className="flex bg-slate-100 p-1.5 rounded-2xl">
            <button 
              onClick={() => setActiveTab("users")}
              className={`px-6 py-2.5 rounded-xl text-sm font-bold transition-all ${activeTab === 'users' ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-500 hover:text-slate-800'}`}
            >
              <div className="flex items-center gap-2"><Users className="w-4 h-4" /> 유저 관리</div>
            </button>
            <button 
              onClick={() => setActiveTab("inquiries")}
              className={`px-6 py-2.5 rounded-xl text-sm font-bold transition-all ${activeTab === 'inquiries' ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-500 hover:text-slate-800'}`}
            >
              <div className="flex items-center gap-2"><MessageSquare className="w-4 h-4" /> 문의 내역 ({inquiries.filter(i => i.status === 'pending').length})</div>
            </button>
            <button 
              onClick={() => setActiveTab("reports")}
              className={`px-6 py-2.5 rounded-xl text-sm font-bold transition-all ${activeTab === 'reports' ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-500 hover:text-slate-800'}`}
            >
              <div className="flex items-center gap-2"><FileCheck className="w-4 h-4" /> 리포트 감수 ({reports.length})</div>
            </button>
          </div>
        </div>

        {activeTab === "users" ? (
          <section id="users-section">
            <Card className="rounded-[2.5rem] border-slate-200/70 shadow-xl overflow-hidden bg-white/90">
              <CardHeader className="px-10 pt-10">
                <CardTitle className="flex items-center gap-2 text-2xl font-black"><Users className="w-6 h-6" /> 가입 유저 목록</CardTitle>
              </CardHeader>
              <CardContent className="p-0">
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-slate-100 bg-slate-50/50 text-left">
                        <th className="px-10 py-5 font-bold text-slate-600 uppercase tracking-wider">사용자</th>
                        <th className="px-6 py-5 font-bold text-slate-600 uppercase tracking-wider">가입일</th>
                        <th className="px-6 py-5 font-bold text-slate-600 uppercase tracking-wider text-center">일반 리포트</th>
                        <th className="px-6 py-5 font-bold text-slate-600 uppercase tracking-wider text-center">프리미엄 리포트</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {users.map((user) => (
                        <tr key={user.id} className="hover:bg-indigo-50/30 transition-colors">
                          <td className="px-10 py-6">
                             <div className="flex flex-col">
                               <span className="font-bold text-slate-900 text-base">{user.name || "미지정"}</span>
                               <span className="text-slate-500 text-xs">{user.email}</span>
                             </div>
                          </td>
                          <td className="px-6 py-6 text-slate-500 text-xs font-mono">
                            {mounted && user.created_at ? new Date(user.created_at).toLocaleDateString("ko-KR") : "—"}
                          </td>
                          {(["basic", "premium-review"] as const).map((code) => {
                            const balance = getPackageBalance(user, code);
                            return (
                              <td key={code} className="px-6 py-6">
                                <div className="flex items-center justify-center gap-3">
                                  <Button
                                    variant="outline"
                                    size="icon"
                                    className="h-8 w-8 rounded-xl border-slate-200 hover:bg-rose-50 hover:text-rose-600 hover:border-rose-200 transition-all"
                                    disabled={adjustingKey !== "" || balance <= 0}
                                    onClick={() => adjustCredit(user.id, code, -1)}
                                  >
                                    <Minus className="w-3.5 h-3.5" />
                                  </Button>
                                  <span className={`min-w-[2.5rem] text-center font-black text-lg ${balance > 0 ? "text-slate-900" : "text-slate-300"}`}>
                                    {balance}
                                  </span>
                                  <Button
                                    variant="outline"
                                    size="icon"
                                    className="h-8 w-8 rounded-xl border-slate-200 hover:bg-indigo-50 hover:text-indigo-600 hover:border-indigo-200 transition-all"
                                    disabled={adjustingKey !== ""}
                                    onClick={() => adjustCredit(user.id, code, 1)}
                                  >
                                    <Plus className="w-3.5 h-3.5" />
                                  </Button>
                                </div>
                              </td>
                            );
                          })}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          </section>
        ) : activeTab === "inquiries" ? (
          <div className="space-y-6">
             {inquiries.length === 0 ? (
               <Card className="rounded-[2.5rem] border-dashed border-slate-300 py-32 bg-slate-50/50 flex flex-col items-center justify-center text-slate-400">
                  <MessageSquare className="w-12 h-12 mb-4 opacity-20" />
                  <p className="text-xl font-bold">도착한 문의가 없습니다.</p>
               </Card>
             ) : (
               inquiries.map((iq) => (
                 <Card key={iq.id} className={`rounded-[2rem] border-slate-200/70 shadow-sm overflow-hidden transition-all ${iq.status === 'pending' ? 'ring-2 ring-indigo-100 bg-white' : 'bg-slate-50/80 grayscale-[0.3]'}`}>
                    <div 
                      className={`cursor-pointer ${expandedId === iq.id ? 'p-8 md:p-10 pb-4 md:pb-6' : 'px-6 py-5 md:px-8 md:py-6'} transition-all`}
                      onClick={() => setExpandedId(expandedId === iq.id ? null : iq.id)}
                    >
                       <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
                          <div className="space-y-2 flex-1 max-w-[80%]">
                             <div className="flex items-center gap-3 mb-1">
                                <span className="bg-indigo-100 text-indigo-700 px-3 py-1 rounded-full text-[11px] font-black uppercase">{iq.category}</span>
                                <span className="text-slate-400 text-xs font-medium">{mounted ? new Date(iq.created_at).toLocaleString('ko-KR') : ''}</span>
                             </div>
                             {expandedId === iq.id ? (
                               <h3 className="text-xl md:text-2xl font-bold text-slate-900">{iq.email}</h3>
                             ) : (
                               <div>
                                 <h3 className="text-base font-bold text-slate-900">{iq.email}</h3>
                                 <p className="line-clamp-1 text-sm text-slate-500 mt-1.5">{iq.content}</p>
                               </div>
                             )}
                          </div>
                          
                          <div className="flex items-center gap-4 shrink-0 mt-2 md:mt-0">
                            {iq.status === 'answered' ? (
                              <span className="flex items-center gap-1.5 text-emerald-600 font-black text-sm bg-emerald-50 px-4 py-2 rounded-2xl">
                                <CheckCircle2 className="w-4 h-4" /> 답변 완료
                              </span>
                            ) : (
                              <span className="text-indigo-600 font-black text-sm bg-indigo-50 px-4 py-2 rounded-2xl">답변 대기 중</span>
                            )}
                            {expandedId === iq.id ? <ChevronUp className="w-5 h-5 text-slate-400" /> : <ChevronDown className="w-5 h-5 text-slate-400" />}
                          </div>
                       </div>
                    </div>

                    <AnimatePresence>
                      {expandedId === iq.id && (
                        <motion.div
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: "auto", opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          className="px-8 md:px-10 pb-8 md:pb-10 pt-0 overflow-hidden flex flex-col gap-4"
                        >
                           <div className="bg-slate-50/80 rounded-2xl p-6 text-slate-800 text-base leading-relaxed mb-8 border border-slate-100 mt-2">
                              {iq.content}
                           </div>

                           <div className="border-t border-slate-100 pt-8 space-y-6">
                              {iq.messages?.length > 0 && (
                                <div className="space-y-4">
                                  {iq.messages.map((msg) => (
                                    <div key={msg.id} className={`flex flex-col ${msg.is_admin ? "items-end" : "items-start"}`}>
                                      {editingMsgId === msg.id ? (
                                        <div className="w-full max-w-[85%] bg-white p-4 rounded-2xl border border-indigo-200 shadow-sm space-y-3 animate-in fade-in">
                                          <Textarea
                                            className="min-h-[100px] resize-none border-slate-200 focus:ring-indigo-500 rounded-xl"
                                            value={editingMsgText}
                                            onChange={(e) => setEditingMsgText(e.target.value)}
                                            placeholder="수정할 답변 내용을 입력하세요..."
                                          />
                                          <div className="flex justify-end gap-2">
                                            <Button variant="ghost" size="sm" className="rounded-lg" onClick={cancelEditing}>취소</Button>
                                            <Button size="sm" className="bg-indigo-600 rounded-lg px-4" disabled={submittingEditId === msg.id} onClick={() => submitEdit(iq.id, msg.id)}>
                                              {submittingEditId === msg.id ? <Loader2 className="w-4 h-4 animate-spin" /> : "저장"}
                                            </Button>
                                          </div>
                                        </div>
                                      ) : (
                                        <>
                                          <div className={`max-w-[85%] rounded-2xl p-4 ${!msg.is_admin ? "bg-white border border-slate-200 shadow-sm rounded-tl-sm" : "bg-indigo-600 text-white shadow-sm rounded-tr-sm"}`}>
                                            {!msg.is_admin && <p className="text-[10px] font-black text-indigo-600 mb-1.5 uppercase tracking-wide">사용자 추가 답변</p>}
                                            <p className="text-sm whitespace-pre-wrap break-words leading-relaxed">{msg.content}</p>
                                          </div>
                                          <div className="flex items-center gap-2 mt-1.5 px-1">
                                            <span className="text-[10px] text-slate-400">{mounted ? new Date(msg.created_at).toLocaleString("ko-KR") : ""}</span>
                                            {msg.is_admin && (
                                              <button 
                                                onClick={() => startEditing(msg)}
                                                className="text-[10px] font-bold text-slate-300 hover:text-indigo-600 transition-colors"
                                              >
                                                수정
                                              </button>
                                            )}
                                          </div>
                                        </>
                                      )}
                                    </div>
                                  ))}
                                </div>
                              )}

                              <div className="flex gap-2">
                                <Textarea 
                                  className="min-h-[50px] resize-none rounded-xl border-slate-200 bg-white" 
                                  placeholder="답변을 입력해주세요..."
                                  value={replyTexts[iq.id] || ""}
                                  onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setReplyTexts(prev => ({ ...prev, [iq.id]: e.target.value }))}
                                />
                                <Button 
                                  className="h-auto rounded-xl bg-indigo-600 px-6 shrink-0 transition-transform active:scale-95"
                                  disabled={replyingId === iq.id || !(replyTexts[iq.id]?.trim())}
                                  onClick={() => submitAnswer(iq.id)}
                                >
                                  {replyingId === iq.id ? <Loader2 className="w-5 h-5 animate-spin" /> : <Send className="w-5 h-5" />}
                                </Button>
                              </div>
                           </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                 </Card>
               ))
             )}
          </div>
        ) : (
          <section id="reports-section">
            <Card className="rounded-[2.5rem] border-slate-200/70 shadow-xl overflow-hidden bg-white/90">
              <CardHeader className="px-10 pt-10">
                <CardTitle className="flex items-center gap-2 text-2xl font-black">
                  <ClipboardList className="w-6 h-6" /> 멘토 리뷰 관리
                </CardTitle>
              </CardHeader>
              <CardContent className="p-0">
                {reports.length === 0 ? (
                  <div className="p-20 text-center text-slate-400 bg-slate-50/30 flex flex-col items-center justify-center">
                    <FileText className="w-12 h-12 mb-4 opacity-20" />
                    <p className="text-xl font-bold">현재 리뷰 대기 중인 리포트가 없습니다.</p>
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="border-b border-slate-100 bg-slate-50/80 text-left">
                          <th className="px-10 py-5 font-bold text-slate-600 uppercase tracking-wider">리포트 제목</th>
                          <th className="px-6 py-5 font-bold text-slate-600 uppercase tracking-wider">요청 유저</th>
                          <th className="px-6 py-5 font-bold text-slate-600 uppercase tracking-wider">생성일</th>
                          <th className="px-6 py-5 font-bold text-slate-600 uppercase tracking-wider text-center">상태</th>
                          <th className="px-6 py-5 font-bold text-slate-600 uppercase tracking-wider text-center">작업</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        {reports.map((report) => (
                          <tr key={report.report_id} className="hover:bg-indigo-50/30 transition-colors">
                            <td className="px-10 py-6 font-bold text-slate-900 text-base">{report.title}</td>
                            <td className="px-6 py-6 text-slate-500">{report.user_email}</td>
                            <td className="px-6 py-6 text-slate-500 text-xs font-mono">
                              {mounted ? new Date(report.created_at).toLocaleString("ko-KR") : ""}
                            </td>
                            <td className="px-6 py-6 text-center whitespace-nowrap">
                               {report.status === "awaiting_review" ? (
                                 <span className="bg-amber-100 text-amber-700 px-3 py-1 rounded-full text-[11px] font-black uppercase whitespace-nowrap">검수 대기</span>
                               ) : report.status === "review_confirmed" ? (
                                 <span className="bg-indigo-100 text-indigo-700 px-3 py-1 rounded-full text-[11px] font-black uppercase whitespace-nowrap">멘티 확인 중</span>
                               ) : (
                                 <span className="bg-emerald-100 text-emerald-700 px-3 py-1 rounded-full text-[11px] font-black uppercase whitespace-nowrap">완료</span>
                               )}
                             </td>
                            <td className="px-6 py-6 text-center">
                              <Button
                                 className={`${report.status === 'awaiting_review' ? 'bg-indigo-600 hover:bg-indigo-700' : 'bg-slate-500 hover:bg-slate-600'} rounded-2xl px-6 py-5 font-bold shadow-md transition-all active:scale-95`}
                                 onClick={() => router.push(`/admin/review/${report.report_id}`)}
                               >
                                 {report.status === "awaiting_review" ? "리뷰하기" : "보기"}
                               </Button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </CardContent>
            </Card>
          </section>
        )}
      </div>
    </div>
  );
}
