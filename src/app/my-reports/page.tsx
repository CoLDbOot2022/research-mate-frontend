"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { CalendarDays, FileText, Plus, Trash2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { api } from "@/lib/api/client";
import { getAccessToken } from "@/lib/auth";
import { track } from "@/lib/analytics";

type ReportItem = {
  report_id: string;
  title: string;
  subjects: string[];
  created_at: string;
  status: string;
  report_type?: string;
  is_bookmarked: boolean;
  progress?: number;
  phase?: string;
  status_message?: string;
  is_expired?: boolean;
};

export default function MyReportsPage() {
  const router = useRouter();
  const [reports, setReports] = useState<ReportItem[]>([]);
  const [loading, setLoading] = useState(true);

  const loadReports = async (showLoading = false) => {
    if (showLoading) setLoading(true);
    try {
      const res = await api.get<ReportItem[]>("/reports");
      setReports(res);
      if (showLoading) track.myReportsViewed(res.length);
    } catch (e) {
      console.error(e);
      // Only redirect on initial load failure or 401
      if (showLoading) router.replace("/login?callback=/my-reports");
    } finally {
      if (showLoading) setLoading(false);
    }
  };
  
  const handleDelete = async (e: React.MouseEvent, reportId: string) => {
    e.stopPropagation(); // 카드 클릭 이벤트 전파 방지
    
    if (!window.confirm("정말로 이 보고서를 삭제하시겠습니까?\n삭제된 기록은 복구할 수 없습니다.")) {
      return;
    }
    
    try {
      await api.delete(`/reports/${reportId}`);
      // 로컬 상태에서 즉시 제거 (부드러운 사용자 경험)
      setReports((prev) => prev.filter((r) => r.report_id !== reportId));
      track.reportDeleted?.(reportId); // 분석 로그 (있는 경우)
    } catch (err) {
      console.error("Failed to delete report:", err);
      alert("보고서 삭제에 실패했습니다.");
    }
  };

  useEffect(() => {
    const token = getAccessToken();
    if (!token) {
      router.replace("/login?callback=/my-reports");
      return;
    }
    loadReports(true).catch(console.error);
  }, [router]);

  // Polling for generating reports
  useEffect(() => {
    const hasGenerating = reports.some((r) => r.status === "generating");
    if (!hasGenerating) return;

    const interval = setInterval(() => {
      loadReports(false).catch(console.error);
    }, 3000); // Poll every 3 seconds

    return () => clearInterval(interval);
  }, [reports]);

  const completedCount = useMemo(() => reports.filter((r) => r.status === "completed").length, [reports]);

  return (
    <div className="min-h-screen bg-[linear-gradient(180deg,#fff7ed_0%,#ffffff_35%,#eff6ff_100%)] py-12 px-4">
      <div className="max-w-5xl mx-auto space-y-6">
        <div className="rounded-3xl border bg-white/80 backdrop-blur p-8 shadow-sm flex flex-wrap justify-between gap-4">
          <div>
            <h1 className="text-3xl font-black tracking-tight mb-2">기록 페이지</h1>
            <p className="text-slate-600 text-sm">생성한 보고서를 다시 열고 수정/검토할 수 있습니다. <span className="text-[10px] text-slate-400 font-normal ml-1">(생성 후 1년 간 열람 가능)</span></p>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-sm text-slate-600">완료 보고서 {completedCount}개</span>
            <Button onClick={() => router.push("/subject")} className="bg-slate-900 hover:bg-slate-950">
              <Plus className="w-4 h-4 mr-1" /> 새 보고서
            </Button>
          </div>
        </div>

        {loading ? (
          <div className="grid gap-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-24 bg-white/50 animate-pulse rounded-2xl border" />
            ))}
          </div>
        ) : reports.length === 0 ? (
          <Card className="rounded-3xl border-slate-200/70 shadow-sm">
            <CardContent className="p-12 text-center text-slate-500">아직 생성된 보고서가 없습니다.</CardContent>
          </Card>
        ) : (
          <div className="space-y-3">
            {reports.map((r) => (
              <Card
                key={r.report_id}
                className={`rounded-2xl border-slate-200/70 shadow-sm transition-all ${
                  r.is_expired ? "opacity-60 cursor-not-allowed bg-slate-50" : "cursor-pointer hover:shadow-md bg-white"
                }`}
                onClick={() => {
                  if (r.is_expired) return;
                  // If topic_id is missing, it is still in the topic selection/generation phase.
                  const isTopicPhase = !r.topic_id || r.status === "topic_generated";
                  
                  if (isTopicPhase) {
                    router.push(`/topic-confirm?report_id=${r.report_id}&report_type=${r.report_type || "general"}&mode=existing`);
                  } else {
                    router.push(`/report/${r.report_id}`);
                  }
                }}
              >
                <CardContent className="p-5 flex flex-col gap-4">
                  <div className="flex items-center justify-between gap-4">
                    <div className="flex items-start gap-3 flex-1 min-w-0">
                      <div className={`p-2 rounded-lg ${r.status === "generating" ? "bg-amber-100 text-amber-700 animate-pulse" : "bg-slate-100 text-slate-700"}`}>
                        <FileText className="w-4 h-4" />
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <h2 className={`font-semibold leading-snug break-words line-clamp-2 ${
                            r.title.length < 25 
                              ? "text-lg" 
                              : r.title.length < 45 
                                ? "text-base" 
                                : "text-sm"
                          }`} style={{ textWrap: 'balance' } as any}>
                            {r.title}
                          </h2>
                          {r.report_type === "premium" && (
                            <span className="text-[10px] bg-slate-900 text-white px-2 py-0.5 rounded-full font-bold uppercase tracking-wider">Premium</span>
                          )}
                        </div>
                        <p className="text-sm text-slate-500 mt-1 inline-flex items-center gap-1">
                          <CalendarDays className="w-3 h-3" /> {new Date(r.created_at).toLocaleString("ko-KR")}
                        </p>
                        <div className="flex gap-2 mt-2 flex-wrap">
                          {r.subjects.map((s) => (
                            <span key={s} className="text-xs bg-slate-100 rounded-full px-2 py-1">#{s}</span>
                          ))}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-6 shrink-0">
                      <div className="text-right">
                        {r.status === "completed" ? (
                          <div className="flex flex-col items-end gap-1">
                            <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-700 text-xs font-bold uppercase">완료</span>
                            {r.is_bookmarked && <span className="text-amber-500 text-xs font-semibold">★ 북마크됨</span>}
                          </div>
                        ) : r.status === "failed" ? (
                          <span className="px-2 py-0.5 rounded-full bg-red-100 text-red-700 text-xs font-bold uppercase">실패</span>
                        ) : r.status === "topic_generated" ? (
                          <div className="flex flex-col items-end gap-1">
                            <span className="px-2 py-0.5 rounded-full bg-blue-100 text-blue-700 text-xs font-bold uppercase">주제 선정 완료</span>
                          </div>
                        ) : r.status === "awaiting_review" ? (
                          <div className="flex flex-col items-end gap-1">
                            <span className="px-2 py-0.5 rounded-full bg-indigo-100 text-indigo-700 text-xs font-bold uppercase whitespace-nowrap">검수 대기중</span>
                          </div>
                        ) : r.status === "review_confirmed" ? (
                          <div className="flex flex-col items-end gap-1">
                            <span className="px-2 py-0.5 rounded-full bg-indigo-600 text-white px-3 py-1 rounded-full text-[11px] font-black uppercase whitespace-nowrap">멘토 리뷰 완료</span>
                          </div>
                        ) : (
                          <div className="flex flex-col items-end gap-1">
                            <span className="px-2 py-0.5 rounded-full bg-amber-100 text-amber-700 text-xs font-bold uppercase animate-pulse">생성 중</span>
                          </div>
                        )}
                        {r.is_expired && (
                          <div className="mt-1">
                            <span className="px-2 py-0.5 rounded-full bg-slate-200 text-slate-500 text-[10px] font-black uppercase">기간 만료</span>
                          </div>
                        )}
                      </div>

                      <div className="flex items-center gap-2">
                         <button
                           onClick={(e) => handleDelete(e, r.report_id)}
                           className="p-2 text-slate-300 hover:text-red-500 hover:bg-red-50 rounded-xl transition-all"
                           title="삭제"
                         >
                           <Trash2 className="w-4 h-4" />
                         </button>
                      </div>
                    </div>
                  </div>

                  {r.status === "generating" && (
                    <div className="pt-1 border-t border-slate-50">
                      <div className="flex justify-between items-center text-[11px]">
                        <span className="text-slate-500 font-medium">현재 단계: {r.phase || "준비 중"}</span>
                        <span className="text-slate-400 italic">{r.status_message || "대기 중입니다..."}</span>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
