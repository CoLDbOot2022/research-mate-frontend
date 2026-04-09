"use client";

import { useEffect, useState } from "react";
import { AlertCircle, Check, CheckCircle2, CreditCard, LoaderCircle } from "lucide-react";
import { useRouter } from "next/navigation";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { api } from "@/lib/api/client";
import { getAccessToken } from "@/lib/auth";
import { track } from "@/lib/analytics";

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
  credit_balance?: number;
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
      amount: 19000,
      original_amount: 49000,
      badge: "입문용",
      claim_limit: 9999,
      claim_count: 0,
      claim_remaining: 9999,
    },
    {
      code: "premium-review",
      name: "프리미엄 검수 요금제",
      description: "프리미엄 검수 포함 보고서 생성 3회",
      credits: 3,
      amount: 59000,
      original_amount: 159000,
      badge: "추천",
      claim_limit: 9999,
      claim_count: 0,
      claim_remaining: 9999,
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
  const [mounted, setMounted] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);

  useEffect(() => {
    setMounted(true);
    const token = getAccessToken();
    if (!token) {
      router.replace("/login");
      return;
    }
    track.creditsPageViewed();

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
                      credit_balance: result.package_credit_balance ?? (pkg.credit_balance ?? 0) + result.credits_added,
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
      track.creditPurchaseCompleted({
        package_code: packageCode,
        amount: result.amount,
        credits_added: result.credits_added,
      });
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
        <div className="rounded-3xl border border-amber-200 bg-amber-50/50 p-6 flex gap-4 shadow-sm">
          <AlertCircle className="w-6 h-6 text-amber-600 shrink-0 mt-0.5" />
          <div className="text-sm text-amber-900 leading-relaxed">
            <p className="font-bold text-base mb-1">이용권 구매 전 필독 사항</p>
            <p className="opacity-90">
              현재 세특연구소는 [수학] 심화 탐구만 공식 지원하고 있습니다.<br />
              <span className="mt-1 block font-medium">
                지원 과목: 공통 수학1/2, 기본 수학1/2, 대수, 확률과 통계, 미적분1/2, 인공지능 수학, 기하
              </span>
              융합수학, 경제수학 등 위 목록에 없는 과목과 타 교과목(사회, 과학 등)은 현재 서비스 준비 중이오니, 이용권 구매 시 지원 여부를 반드시 확인해 주시기 바랍니다.
            </p>
          </div>
        </div>

        <section className="overflow-hidden rounded-[2rem] border border-slate-200 bg-white shadow-sm">
          <div className="grid gap-8 px-8 py-10 lg:grid-cols-[1.2fr_0.8fr] lg:px-10">
            <div className="space-y-4">
              <div className="space-y-3">
                <h1 className="text-3xl font-black tracking-tight text-slate-950 md:text-4xl">
                  필요한 만큼 이용권을 선택하고
                  <br />
                  바로 보고서 생성을 시작하세요
                </h1>
                <p className="max-w-2xl text-base leading-7 text-slate-600">
                  결제 즉시 계정으로 이용권이 충전되며, 보유하신 이용권으로 세특연구소의 맞춤형 심화 탐구 서비스를 자유롭게 이용하실 수 있습니다.
                </p>
              </div>
            </div>

            <div className="rounded-[1.75rem] bg-slate-950 p-6 text-white shadow-lg flex flex-col justify-center gap-5">
              <div className="flex items-center gap-3 mb-1">
                <div className="rounded-2xl bg-white/10 p-2.5">
                  <CreditCard className="h-5 w-5" />
                </div>
                <p className="text-sm font-bold text-slate-300">내 보유 이용권 현황</p>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="rounded-2xl bg-white/5 border border-white/10 p-4">
                  <p className="text-xs text-slate-400 mb-1.5 font-medium">기본 요금제</p>
                  <p className="text-2xl font-black text-white">
                    {mounted && !loading ? `${summary?.packages.find(p => p.code === "basic")?.credit_balance ?? 0}회` : "..."}
                  </p>
                </div>
                <div className="rounded-2xl bg-white/5 border border-white/10 p-4">
                  <p className="text-xs text-emerald-400 mb-1.5 font-bold">프리미엄 검수</p>
                  <p className="text-2xl font-black text-emerald-400">
                    {mounted && !loading ? `${summary?.packages.find(p => p.code === "premium-review")?.credit_balance ?? 0}회` : "..."}
                  </p>
                </div>
              </div>

              <div className="grid gap-2 text-sm text-slate-300 mt-1">
                <div className="rounded-xl border border-white/10 bg-white/5 px-3 py-2.5 text-xs text-slate-400">
                  ✓ 결제 직후 마이페이지에서 상세 사용 내역 확인 가능
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
            <Card key={plan.code} className="overflow-hidden rounded-[2rem] border-slate-200 py-0 shadow-sm flex flex-col h-full">
              <div className={`h-2 w-full bg-gradient-to-r ${plan.code === "basic" ? "from-blue-600 via-cyan-500 to-sky-400" : "from-slate-900 via-slate-700 to-indigo-600"}`} />
              <CardHeader className="space-y-4 px-7 pt-7 shrink-0">
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

              <CardContent className="space-y-6 px-7 pb-7 flex flex-col flex-1">
                <div className="rounded-[1.5rem] bg-slate-50 p-5">
                  <p className="text-sm font-semibold text-emerald-500">
                    약 {Math.round(((plan.original_amount - plan.amount) / plan.original_amount) * 100)}% 특별 할인 프로모션
                  </p>
                  <div className="mt-3 flex items-end gap-3">
                    <span className="text-5xl font-black tracking-tight text-slate-950">
                      {mounted ? plan.amount.toLocaleString("ko-KR") : "..."}원
                    </span>
                    <span className="pb-1 text-sm text-slate-400 line-through">
                      {mounted ? plan.original_amount.toLocaleString("ko-KR") : "..."}원
                    </span>
                  </div>
                  <p className="mt-3 text-sm text-slate-500">
                    {plan.credits}회 이용권이 결제 즉시 반영됩니다.
                  </p>
                  {plan.code === "premium-review" && (
                    <p className="mt-2.5 text-xs font-bold text-rose-500 leading-relaxed break-keep">
                      ※ 현재 프리미엄 요금제 할인은 선착순 모집 이벤트로 진행 중이며, 모집 한도 도달 시 예고 없이 조기 마감될 수 있습니다.
                    </p>
                  )}
                </div>

                <div className="space-y-3 mb-4">
                  {[
                    `심화 탐구 첨삭 및 생성 튜터링 ${plan.credits}회 크레딧`,
                    "결제 즉시 바로 이용 가능",
                    "보유 크레딧 무기한 이용 가능",
                    "결제 내역 마이페이지 즉시 확인",
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
                  className={`mt-auto h-12 w-full rounded-2xl text-base font-bold shadow-sm transition-all ${
                    plan.code === "basic" 
                      ? "bg-slate-900 hover:bg-slate-800 text-white" 
                      : "bg-indigo-600 hover:bg-indigo-700 text-white shadow-indigo-200"
                  }`}
                  onClick={() => {
                    const planAmount = summary?.packages.find(p => p.code === plan.code)?.amount ?? plan.amount;
                    track.creditPurchaseInitiated({ package_code: plan.code, amount: planAmount });
                    claimPromotion(plan.code);
                  }}
                  disabled={loading || claimingCode === plan.code}
                >
                  {claimingCode === plan.code ? (
                    <>
                      <LoaderCircle className="mr-2 h-4 w-4 animate-spin" />
                      결제 진행 중...
                    </>
                  ) : (
                    `${mounted ? plan.amount.toLocaleString("ko-KR") : "..."}원 결제하기`
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
