"use client";

import { Suspense, useEffect, useRef, useState } from "react";
import { CheckCircle2 } from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { api } from "@/lib/api/client";
import { track } from "@/lib/analytics";

type ConfirmResponse = {
  order_id: string;
  amount: number;
  credit_balance: number;
  credits_added: number;
  method?: string | null;
  easy_pay_provider?: string | null;
  approved_at?: string | null;
};

function CreditsSuccessContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const confirmedRef = useRef(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [result, setResult] = useState<ConfirmResponse | null>(null);

  useEffect(() => {
    if (confirmedRef.current) {
      return;
    }

    const paymentKey = searchParams.get("paymentKey");
    const orderId = searchParams.get("orderId");
    const amount = Number(searchParams.get("amount"));

    if (!paymentKey || !orderId || Number.isNaN(amount)) {
      setError("결제 승인 정보가 올바르지 않습니다.");
      setLoading(false);
      return;
    }

    confirmedRef.current = true;

    const confirm = async () => {
      try {
        const data = await api.post<ConfirmResponse>("/payments/confirm", {
          paymentKey,
          orderId,
          amount,
        });
        setResult(data);
        track.creditPurchaseCompleted({
          package_code: orderId.split("_")[0] ?? "unknown",
          amount,
          credits_added: data.credits_added,
        });
      } catch (message) {
        setError(typeof message === "string" ? message : "결제 승인에 실패했습니다.");
      } finally {
        setLoading(false);
      }
    };

    confirm().catch(() => {
      setError("결제 승인에 실패했습니다.");
      setLoading(false);
    });
  }, [searchParams]);

  return (
    <div className="min-h-screen bg-[linear-gradient(180deg,#f0fdf4_0%,#ffffff_32%,#f8fafc_100%)] px-4 py-12">
      <div className="mx-auto max-w-2xl">
        <Card className="rounded-[2rem] border-slate-200 shadow-sm">
          <CardHeader className="text-center">
            <div className="mx-auto rounded-full bg-emerald-50 p-4 text-emerald-600">
              <CheckCircle2 className="h-8 w-8" />
            </div>
            <CardTitle className="text-3xl font-black tracking-tight text-slate-950">
              {loading ? "결제 승인 중..." : error ? "결제 승인 실패" : "결제가 완료되었습니다"}
            </CardTitle>
            <CardDescription>
              {loading
                ? "토스페이먼츠 승인 결과를 확인하고 있습니다."
                : error || "승인 완료 후 크레딧이 즉시 반영되었습니다."}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {!loading && result && (
              <div className="space-y-3 rounded-[1.5rem] bg-slate-50 p-5">
                <div className="flex items-center justify-between text-sm text-slate-600">
                  <span>주문번호</span>
                  <span className="font-semibold text-slate-900">{result.order_id}</span>
                </div>
                <div className="flex items-center justify-between text-sm text-slate-600">
                  <span>결제금액</span>
                  <span className="font-semibold text-slate-900">{result.amount.toLocaleString("ko-KR")}원</span>
                </div>
                <div className="flex items-center justify-between text-sm text-slate-600">
                  <span>추가된 크레딧</span>
                  <span className="font-semibold text-slate-900">+{result.credits_added}회</span>
                </div>
                <div className="flex items-center justify-between text-sm text-slate-600">
                  <span>현재 잔여 크레딧</span>
                  <span className="font-semibold text-slate-900">{result.credit_balance}회</span>
                </div>
                <div className="flex items-center justify-between text-sm text-slate-600">
                  <span>결제수단</span>
                  <span className="font-semibold text-slate-900">{result.easy_pay_provider || result.method || "-"}</span>
                </div>
              </div>
            )}

            <div className="flex gap-3">
              <Button className="h-11 flex-1 rounded-xl bg-slate-900 hover:bg-slate-800" onClick={() => router.push("/my-page")}>
                마이페이지로 이동
              </Button>
              <Button variant="outline" className="h-11 flex-1 rounded-xl" onClick={() => router.push("/credits")}>
                다시 충전하기
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

export default function CreditsSuccessPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-[linear-gradient(180deg,#f0fdf4_0%,#ffffff_32%,#f8fafc_100%)]" />}>
      <CreditsSuccessContent />
    </Suspense>
  );
}
