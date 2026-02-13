"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { api } from "@/lib/api/client";

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
    const load = async () => {
      try {
        const res = await api.get<ReportItem[]>("/reports");
        setReports(res);
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    };
    load().catch(console.error);
  }, []);

  return (
    <div className="container mx-auto px-4 py-12 min-h-screen">
      <div className="max-w-4xl mx-auto">
        <div className="flex justify-between items-center mb-6 gap-3">
          <div>
            <h1 className="text-3xl font-bold">기록 페이지</h1>
            <p className="text-slate-500">생성된 심화 탐구 보고서를 확인할 수 있습니다.</p>
          </div>
          <Button onClick={() => router.push("/subject")}>새 보고서 만들기</Button>
        </div>

        {loading ? (
          <p className="text-slate-500">불러오는 중...</p>
        ) : reports.length === 0 ? (
          <Card>
            <CardContent className="p-10 text-center text-slate-500">아직 생성된 보고서가 없습니다.</CardContent>
          </Card>
        ) : (
          <div className="space-y-3">
            {reports.map((r) => (
              <Card key={r.report_id} className="cursor-pointer" onClick={() => router.push(`/report/${r.report_id}`)}>
                <CardContent className="p-5 flex items-center justify-between gap-4">
                  <div>
                    <h2 className="font-semibold text-lg">{r.title}</h2>
                    <p className="text-sm text-slate-500">
                      {new Date(r.created_at).toLocaleString("ko-KR")} · 상태: {r.status}
                    </p>
                    <div className="flex gap-2 mt-2 flex-wrap">
                      {r.subjects.map((s) => (
                        <span key={s} className="text-xs bg-slate-100 rounded-full px-2 py-1">#{s}</span>
                      ))}
                    </div>
                  </div>
                  <div className="text-sm text-slate-500">{r.is_bookmarked ? "★" : ""}</div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
