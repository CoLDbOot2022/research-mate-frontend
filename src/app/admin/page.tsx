"use client";

import { useEffect, useState } from "react";
import { notFound, useRouter } from "next/navigation";
import { ClipboardList, Loader2, Minus, Plus, Shield, Users } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { api } from "@/lib/api/client";
import { getAccessToken } from "@/lib/auth";

type PackageCredit = {
  package_code: string;
  credit_balance: number;
};

type AdminUser = {
  id: number;
  email: string;
  name: string | null;
  credit_balance: number;
  created_at: string;
  package_credits: PackageCredit[];
};

type AdjustResponse = {
  user_id: number;
  package_code: string;
  new_balance: number;
  delta: number;
};

type AwaitingReport = {
  report_id: string;
  title: string;
  user_email: string;
  created_at: string;
  status: string;
};

const PACKAGE_LABELS: Record<string, string> = {
  basic: "일반 리포트",
  "premium-review": "프리미엄 리포트",
};

export default function AdminPage() {
  const router = useRouter();
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [awaitingReports, setAwaitingReports] = useState<AwaitingReport[]>([]);
  const [loading, setLoading] = useState(true);
  const [adjustingKey, setAdjustingKey] = useState("");

  const [notAuthorized, setNotAuthorized] = useState(false);

  useEffect(() => {
    if (!getAccessToken()) {
      router.replace("/login");
      return;
    }

    const load = async () => {
      try {
        const [userData, reportData] = await Promise.all([
          api.get<AdminUser[]>("/admin/users"),
          api.get<AwaitingReport[]>("/admin/reports/awaiting-review")
        ]);
        setUsers(userData);
        setAwaitingReports(reportData);
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

  const getPackageBalance = (user: AdminUser, code: string) => {
    return user.package_credits.find((pc) => pc.package_code === code)?.credit_balance ?? 0;
  };


  return (
    <div className="min-h-screen bg-[linear-gradient(180deg,#f1f5f9_0%,#ffffff_30%,#eef2ff_100%)] py-10 px-4">
      <div className="max-w-6xl mx-auto space-y-6">
        <div className="rounded-3xl border bg-white/80 backdrop-blur p-8 shadow-sm">
          <div className="flex items-center gap-3 mb-2">
            <Shield className="w-6 h-6 text-indigo-600" />
            <h1 className="text-3xl font-black tracking-tight">관리자 대시보드</h1>
          </div>
          <p className="text-slate-600">가입된 유저 {users.length}명의 크레딧 현황을 관리합니다.</p>
        </div>

        <Card className="rounded-3xl border-slate-200/70 shadow-sm overflow-hidden">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-xl">
              <Users className="w-5 h-5" /> 유저 목록
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-slate-100 bg-slate-50/80 text-left">
                    <th className="px-6 py-3 font-semibold text-slate-600">ID</th>
                    <th className="px-6 py-3 font-semibold text-slate-600">이메일</th>
                    <th className="px-6 py-3 font-semibold text-slate-600">이름</th>
                    <th className="px-6 py-3 font-semibold text-slate-600">가입일</th>
                    <th className="px-6 py-3 font-semibold text-slate-600 text-center">일반 리포트</th>
                    <th className="px-6 py-3 font-semibold text-slate-600 text-center">프리미엄 리포트</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {users.map((user) => (
                    <tr key={user.id} className="hover:bg-slate-50/60 transition-colors">
                      <td className="px-6 py-4 text-slate-500 font-mono text-xs">{user.id}</td>
                      <td className="px-6 py-4 font-medium text-slate-800">{user.email}</td>
                      <td className="px-6 py-4 text-slate-600">{user.name || "—"}</td>
                      <td className="px-6 py-4 text-slate-500 text-xs">
                        {user.created_at ? new Date(user.created_at).toLocaleDateString("ko-KR") : "—"}
                      </td>
                      {(["basic", "premium-review"] as const).map((code) => {
                        const balance = getPackageBalance(user, code);
                        return (
                          <td key={code} className="px-6 py-4">
                            <div className="flex items-center justify-center gap-2">
                              <Button
                                variant="outline"
                                size="icon"
                                className="h-7 w-7 rounded-full border-slate-200"
                                disabled={adjustingKey !== "" || balance <= 0}
                                onClick={() => adjustCredit(user.id, code, -1)}
                              >
                                <Minus className="w-3 h-3" />
                              </Button>
                              <span className={`min-w-[2rem] text-center font-bold text-base ${balance > 0 ? "text-slate-900" : "text-slate-400"}`}>
                                {balance}
                              </span>
                              <Button
                                variant="outline"
                                size="icon"
                                className="h-7 w-7 rounded-full border-slate-200"
                                disabled={adjustingKey !== ""}
                                onClick={() => adjustCredit(user.id, code, 1)}
                              >
                                <Plus className="w-3 h-3" />
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

        <Card className="rounded-3xl border-slate-200/70 shadow-sm overflow-hidden">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-xl">
              <ClipboardList className="w-5 h-5" /> 멘토 리뷰 대기 목록
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            {awaitingReports.length === 0 ? (
              <div className="p-10 text-center text-slate-500 bg-slate-50/30">
                현재 리뷰 대기 중인 리포트가 없습니다.
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-slate-100 bg-slate-50/80 text-left">
                      <th className="px-6 py-3 font-semibold text-slate-600">리포트 제목</th>
                      <th className="px-6 py-3 font-semibold text-slate-600">요청 유저</th>
                      <th className="px-6 py-3 font-semibold text-slate-600">생성일</th>
                      <th className="px-6 py-3 font-semibold text-slate-600 text-center">작업</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {awaitingReports.map((report) => (
                      <tr key={report.report_id} className="hover:bg-slate-50/60 transition-colors">
                        <td className="px-6 py-4 font-medium text-slate-800">{report.title}</td>
                        <td className="px-6 py-4 text-slate-500">{report.user_email}</td>
                        <td className="px-6 py-4 text-slate-500 text-xs text-nowrap">
                          {new Date(report.created_at).toLocaleString("ko-KR")}
                        </td>
                        <td className="px-6 py-4 text-center">
                          <Button
                            size="sm"
                            className="bg-indigo-600 hover:bg-indigo-700 rounded-full px-4"
                            onClick={() => router.push(`/admin/review/${report.report_id}`)}
                          >
                            리뷰하기
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
      </div>
    </div>
  );
}
