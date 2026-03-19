"use client";

import { useEffect, useState } from "react";
import { Check, CheckCircle2, CreditCard, LoaderCircle } from "lucide-react";
import { useRouter } from "next/navigation";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { api } from "@/lib/api/client";
import { getAccessToken } from "@/lib/auth";

type PaymentPackage = {
  code: string;
  name: string;
  description: string;
  credits: number;
  amount: number;
  original_amount: number;
  badge: string;
  claim_limit: number;
  claim_count: number;
  claim_remaining: number;
};

type PaymentSummary = {
  customer_key: string;
  credit_balance: number;
  usage_count: number;
  packages: PaymentPackage[];
};

type PromotionClaimResponse = {
  order_id: string;
  amount: number;
  credit_balance: number;
  credits_added: number;
  package_code: string;
  package_credit_balance?: number;
  package_claim_count: number;
  package_claim_remaining: number;
};

const FALLBACK_SUMMARY: PaymentSummary = {
  customer_key: "",
  credit_balance: 0,
  usage_count: 0,
  packages: [
    {
      code: "basic",
      name: "기본 요금제",
      description: "심화 탐구 보고서 생성 3회",
      credits: 3,
      amount: 0,
      original_amount: 29000,
      badge: "입문용",
      claim_limit: 3,
      claim_count: 0,
      claim_remaining: 3,
    },
    {
      code: "premium-review",
      name: "프리미엄 검수 요금제",
      description: "프리미엄 검수 포함 보고서 생성 3회",
      credits: 3,
      amount: 0,
      original_amount: 99000,
      badge: "추천",
      claim_limit: 1,
      claim_count: 0,
      claim_remaining: 1,
    },
  ],
};

export default function CreditsPage() {
  const router = useRouter();
  const [summary, setSummary] = useState<PaymentSummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [claimingCode, setClaimingCode] = useState("");
  const [message, setMessage] = useState("");
  const [messageTone, setMessageTone] = useState<"success" | "neutral">("neutral");
  const [showSuccessModal, setShowSuccessModal] = useState(false);

  useEffect(() => {
    const token = getAccessToken();
    if (!token) {
      router.replace("/login");
      return;
    }

    const load = async () => {
      try {
        const data = await api.get<PaymentSummary>("/payments/summary", { cache: "no-store" });
        setSummary(data);
        setMessage("");
        setMessageTone("neutral");
      } catch {
        setSummary(FALLBACK_SUMMARY);
        setMessageTone("neutral");
        setMessage("실시간 이용 현황을 불러오지 못했습니다. 구매 요청은 그대로 시도할 수 있습니다.");
      } finally {
        setLoading(false);
      }
    };

    load().catch(() => {
      setSummary(FALLBACK_SUMMARY);
      setLoading(false);
    });
  }, [router]);

  const claimPromotion = async (packageCode: string) => {
    setClaimingCode(packageCode);
    setMessage("");

    try {
      const result = await api.post<PromotionClaimResponse>("/payments/promotions/claim", {
        package_code: packageCode,
      });

      setSummary((prev) =>
        prev
          ? {
              ...prev,
              credit_balance: result.credit_balance,
              packages: prev.packages.map((pkg) =>
                pkg.code === result.package_code
                  ? {
                      ...pkg,
                      claim_count: result.package_claim_count,
                      claim_remaining: result.package_claim_remaining,
                    }
                  : pkg
              ),
            }
          : prev
      );
      setMessage("");
      setMessageTone("success");
      setShowSuccessModal(true);
    } catch (error) {
      setMessageTone("neutral");
      setMessage(typeof error === "string" ? error : "이용권 지급에 실패했습니다.");
    } finally {
      setClaimingCode("");
    }
  };

  const totalRemainingClaims = summary?.packages.reduce((acc, pkg) => acc + pkg.claim_remaining, 0) ?? 0;

  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top_left,_rgba(59,130,246,0.16),_transparent_26%),linear-gradient(180deg,#f8fbff_0%,#ffffff_38%,#f8fafc_100%)] px-4 py-12">
      <div className="mx-auto max-w-6xl space-y-8">
        <section className="overflow-hidden rounded-[2rem] border border-slate-200 bg-white shadow-sm">
          <div className="grid gap-8 px-8 py-10 lg:grid-cols-[1.2fr_0.8fr] lg:px-10">
            <div className="space-y-4">
              <div className="space-y-3">
                <h1 className="text-3xl font-black tracking-tight text-slate-950 md:text-4xl">
                  필요한 만큼 크레딧을 선택하고
                  <br />
                  바로 이용을 시작하세요
                </h1>
                <p className="max-w-2xl text-base leading-7 text-slate-600">
                  현재는 결제 대신 0원 구매 방식으로 이용권을 지급하고 있습니다. 버튼을 누르면 해당
                  요금제가 즉시 적용되고 크레딧이 바로 반영됩니다.
                </p>
              </div>
            </div>

            <div className="rounded-[1.75rem] bg-slate-950 p-6 text-white shadow-lg">
              <div className="flex items-center gap-3">
                <div className="rounded-2xl bg-white/10 p-3">
                  <CreditCard className="h-6 w-6" />
                </div>
                <div>
                  <p className="text-sm text-slate-300">이용 현황</p>
                  <p className="text-2xl font-black tracking-tight">이용횟수 {loading ? "확인 중..." : `${summary?.usage_count ?? 0}회`}</p>
                </div>
              </div>
              <div className="mt-6 grid gap-3 text-sm text-slate-200">
                <div className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3">
                  기본 요금제 {summary?.packages.find((pkg) => pkg.code === "basic")?.claim_remaining ?? 0}회 / 프리미엄 {summary?.packages.find((pkg) => pkg.code === "premium-review")?.claim_remaining ?? 0}회 남음
                </div>
                <div className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3">
                  전체 남은 지급 가능 횟수 {loading ? "확인 중..." : `${totalRemainingClaims}회`}
                </div>
                <div className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3">
                  지급 직후 마이페이지에서 즉시 확인 가능
                </div>
              </div>
            </div>
          </div>
        </section>

        {message && (
          <div
            className={`rounded-2xl px-4 py-3 text-sm font-medium ${
              messageTone === "success" ? "border border-emerald-200 bg-emerald-50 text-emerald-800" : "border border-slate-200 bg-white text-slate-700"
            }`}
          >
            {message}
          </div>
        )}

        <section className="grid gap-6 lg:grid-cols-2">
          {(summary?.packages || []).map((plan) => (
            <Card key={plan.code} className="overflow-hidden rounded-[2rem] border-slate-200 py-0 shadow-sm">
              <div className={`h-2 w-full bg-gradient-to-r ${plan.code === "basic" ? "from-blue-600 via-cyan-500 to-sky-400" : "from-slate-900 via-slate-700 to-indigo-600"}`} />
              <CardHeader className="space-y-4 px-7 pt-7">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <CardTitle className="text-2xl font-black tracking-tight text-slate-950">{plan.name}</CardTitle>
                    <CardDescription className="mt-2 text-sm text-slate-500">{plan.description}</CardDescription>
                  </div>
                  <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-700">
                    {plan.badge}
                  </span>
                </div>
              </CardHeader>

              <CardContent className="space-y-6 px-7 pb-7">
                <div className="rounded-[1.5rem] bg-slate-50 p-5">
                  <p className="text-sm font-semibold text-rose-500">
                    현재 적용가 {plan.amount.toLocaleString("ko-KR")}원 (남은 횟수 {plan.claim_remaining}회 / {plan.claim_limit}회)
                  </p>
                  <div className="mt-3 flex items-end gap-3">
                    <span className="text-5xl font-black tracking-tight text-slate-950">
                      {plan.amount.toLocaleString("ko-KR")}원
                    </span>
                    <span className="pb-1 text-sm text-slate-400 line-through">
                      {plan.original_amount.toLocaleString("ko-KR")}원
                    </span>
                  </div>
                  <p className="mt-3 text-sm text-slate-500">{plan.credits}회 이용권이 버튼 클릭 즉시 반영됩니다.</p>
                </div>

                <div className="space-y-3">
                  {[
                    `${plan.credits}회 크레딧 지급`,
                    "0원 구매처럼 즉시 처리",
                    `${plan.name} 최대 ${plan.claim_limit}회 지급`,
                    `현재 ${plan.claim_remaining}회 남음`,
                    "적립 직후 마이페이지에서 확인 가능",
                  ].map((item) => (
                    <div key={item} className="flex items-start gap-3 text-sm text-slate-700">
                      <div className="mt-0.5 rounded-full bg-emerald-50 p-1 text-emerald-600">
                        <Check className="h-3.5 w-3.5" />
                      </div>
                      <span>{item}</span>
                    </div>
                  ))}
                </div>

                <Button
                  className="h-12 w-full rounded-2xl bg-slate-900 text-base font-bold hover:bg-slate-800"
                  onClick={() => claimPromotion(plan.code)}
                  disabled={loading || claimingCode === plan.code || plan.claim_remaining <= 0}
                >
                  {claimingCode === plan.code ? (
                    <>
                      <LoaderCircle className="h-4 w-4 animate-spin" />
                      지급 처리 중...
                    </>
                  ) : plan.claim_remaining <= 0 ? (
                    "지급 한도 도달"
                  ) : (
                    "0원으로 구매하기"
                  )}
                </Button>
              </CardContent>
            </Card>
          ))}
        </section>
      </div>

      {showSuccessModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/45 px-4">
          <div className="w-full max-w-md rounded-[2rem] bg-white p-8 shadow-2xl">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-emerald-50 text-emerald-600">
              <CheckCircle2 className="h-8 w-8" />
            </div>
            <div className="mt-5 text-center">
              <h2 className="text-2xl font-black tracking-tight text-slate-950">구매가 완료되었습니다. 지금 바로 이용하세요!</h2>
              <p className="mt-2 text-sm text-slate-600">지급된 크레딧으로 기록 페이지에서 바로 이어서 확인할 수 있습니다.</p>
            </div>
            <div className="mt-6 flex gap-3">
              <Button variant="outline" className="h-11 flex-1 rounded-xl" onClick={() => setShowSuccessModal(false)}>
                닫기
              </Button>
              <Button className="h-11 flex-1 rounded-xl bg-slate-900 font-bold hover:bg-slate-800" onClick={() => router.push("/my-reports")}>
                기록 페이지로 이동
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
