"use client";

import { useEffect, useState } from "react";
import { Mail, UserRound } from "lucide-react";
import { useRouter } from "next/navigation";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { api } from "@/lib/api/client";
import { clearAccessToken, getAccessToken } from "@/lib/auth";
import { track } from "@/lib/analytics";

const BASE_URL = process.env.NEXT_PUBLIC_API_URL || "";

type MeResponse = {
  id: number;
  email: string;
  name?: string;
};

type PaymentSummary = {
  credit_balance: number;
  packages: Array<{
    code: string;
    credit_balance: number;
    claim_remaining: number;
  }>;
};

export default function MyPage() {
  const router = useRouter();
  const [me, setMe] = useState<MeResponse | null>(null);
  const [basicCreditBalance, setBasicCreditBalance] = useState(0);
  const [premiumCreditBalance, setPremiumCreditBalance] = useState(0);
  const [summaryError, setSummaryError] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = getAccessToken();
    if (!token) {
      router.replace("/login");
      return;
    }

    const load = async () => {
      try {
        const res = await fetch(`${BASE_URL}/auth/me`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (!res.ok) {
          throw new Error("unauthorized");
        }

        const data = (await res.json()) as MeResponse;
        setMe(data);
        track.myPageViewed();
      } catch {
        clearAccessToken();
        router.replace("/login");
        return;
      }

      try {
        const summary = await api.get<PaymentSummary>("/payments/summary", { cache: "no-store" });
        setBasicCreditBalance(summary.packages.find((pkg) => pkg.code === "basic")?.credit_balance ?? 0);
        setPremiumCreditBalance(summary.packages.find((pkg) => pkg.code === "premium-review")?.credit_balance ?? 0);
        setSummaryError("");
      } catch (error) {
        setSummaryError(typeof error === "string" ? error : "크레딧 정보를 불러오지 못했습니다.");
      } finally {
        setLoading(false);
      }
    };

    load().catch(() => {
      clearAccessToken();
      router.replace("/login");
      setLoading(false);
    });
  }, [router]);

  const displayName = me?.name || me?.email || "사용자";

  return (
    <div className="min-h-screen bg-[linear-gradient(180deg,#f8fbff_0%,#ffffff_32%,#f8fafc_100%)] px-4 py-12">
      <div className="mx-auto max-w-5xl space-y-6">
        <section className="rounded-[2rem] border border-slate-200 bg-white px-8 py-10 shadow-sm">
          <p className="text-sm font-semibold text-blue-600">MY PAGE</p>
          <h1 className="mt-3 text-3xl font-black tracking-tight text-slate-950">내 계정과 크레딧 현황</h1>
        </section>

        <section className="grid gap-6 md:grid-cols-[1.1fr_0.9fr]">
          <Card className="rounded-[2rem] border-slate-200 shadow-sm">
            <CardHeader>
              <CardTitle className="text-xl font-bold text-slate-900">기본 정보</CardTitle>
              <CardDescription>현재 로그인한 사용자 정보를 표시합니다.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="rounded-2xl bg-slate-50 p-4">
                <div className="flex items-center gap-3 text-slate-900">
                  <UserRound className="h-5 w-5 text-slate-500" />
                  <div>
                    <p className="text-xs font-medium text-slate-500">이름</p>
                    <p className="text-base font-semibold">{loading ? "불러오는 중..." : displayName}</p>
                  </div>
                </div>
              </div>
              <div className="rounded-2xl bg-slate-50 p-4">
                <div className="flex items-center gap-3 text-slate-900">
                  <Mail className="h-5 w-5 text-slate-500" />
                  <div>
                    <p className="text-xs font-medium text-slate-500">이메일</p>
                    <p className="text-base font-semibold">{loading ? "불러오는 중..." : me?.email || "-"}</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="rounded-[2rem] border-slate-200 shadow-sm">
            <CardHeader>
              <CardTitle className="text-xl font-bold text-slate-900">크레딧 현황</CardTitle>
              <CardDescription>요금제별로 적립된 보유 크레딧을 표시합니다.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-5">
              {summaryError ? (
                <div className="rounded-[1.5rem] border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
                  {summaryError}
                </div>
              ) : null}
              <div className="space-y-3 rounded-[1.5rem] border border-dashed border-slate-300 p-4">
                <p className="text-sm text-slate-600">요금제별 보유 크레딧</p>
                <div className="space-y-2">
                  <div className="flex items-center justify-between rounded-xl bg-slate-50 px-4 py-3 text-sm">
                    <span className="font-medium text-slate-700">기본 요금제</span>
                    <span className="font-bold text-slate-950">{loading ? "..." : summaryError ? "확인 필요" : `${basicCreditBalance}회 보유`}</span>
                  </div>
                  <div className="flex items-center justify-between rounded-xl bg-slate-50 px-4 py-3 text-sm">
                    <span className="font-medium text-slate-700">프리미엄 검수 요금제</span>
                    <span className="font-bold text-slate-950">{loading ? "..." : summaryError ? "확인 필요" : `${premiumCreditBalance}회 보유`}</span>
                  </div>
                </div>
              </div>

              <Button className="h-11 w-full rounded-xl bg-blue-600 font-bold hover:bg-blue-700" onClick={() => router.push("/credits")}>
                이용권 충전
              </Button>
            </CardContent>
          </Card>
        </section>
      </div>
    </div>
  );
}
