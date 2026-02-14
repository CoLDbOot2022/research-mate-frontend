"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { CalendarDays, FileText, Plus } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { api } from "@/lib/api/client";
import { getAccessToken } from "@/lib/auth";

type ReportItem = {
  report_id: string;
  title: string;
  subjects: string[];
  created_at: string;
  status: string;
  is_bookmarked: boolean;
};

export default function MyReportsPage() {
  const router = useRouter();
  const [reports, setReports] = useState<ReportItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = getAccessToken();
    if (!token) {
      router.replace("/login");
      return;
    }

    const load = async () => {
      try {
        const res = await api.get<ReportItem[]>("/reports");
        setReports(res);
      } catch (e) {
        console.error(e);
        router.replace("/login");
      } finally {
        setLoading(false);
      }
    };
    load().catch(console.error);
  }, [router]);

  const completedCount = useMemo(() => reports.filter((r) => r.status === "completed").length, [reports]);

  return (
    <div className="min-h-screen bg-[linear-gradient(180deg,#fff7ed_0%,#ffffff_35%,#eff6ff_100%)] py-12 px-4">
      <div className="max-w-5xl mx-auto space-y-6">
        <div className="rounded-3xl border bg-white/80 backdrop-blur p-8 shadow-sm flex flex-wrap justify-between gap-4">
          <div>
            <h1 className="text-3xl font-black tracking-tight mb-2">기록 페이지</h1>
            <p className="text-slate-600">생성한 보고서를 다시 열고 수정/검토할 수 있습니다.</p>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-sm text-slate-600">완료 보고서 {completedCount}개</span>
            <Button onClick={() => router.push("/subject")} className="bg-slate-900 hover:bg-slate-950">
              <Plus className="w-4 h-4 mr-1" /> 새 보고서
            </Button>
          </div>
        </div>

        {loading ? (
          <p className="text-slate-500">불러오는 중...</p>
        ) : reports.length === 0 ? (
          <Card className="rounded-3xl border-slate-200/70 shadow-sm">
            <CardContent className="p-12 text-center text-slate-500">아직 생성된 보고서가 없습니다.</CardContent>
          </Card>
        ) : (
          <div className="space-y-3">
            {reports.map((r) => (
              <Card
                key={r.report_id}
                className="cursor-pointer rounded-2xl border-slate-200/70 shadow-sm hover:shadow-md transition-all"
                onClick={() => router.push(`/report/${r.report_id}`)}
              >
                <CardContent className="p-5 flex items-center justify-between gap-4">
                  <div className="flex items-start gap-3">
                    <div className="p-2 rounded-lg bg-slate-100 text-slate-700"><FileText className="w-4 h-4" /></div>
                    <div>
                      <h2 className="font-semibold text-lg leading-snug">{r.title}</h2>
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
                  <div className="text-right text-sm text-slate-500">
                    <p>{r.status}</p>
                    {r.is_bookmarked && <p className="text-amber-600">★ 북마크</p>}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
