"use client";

import { Suspense } from "react";
import { AlertTriangle } from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

function CreditsFailContent() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const code = searchParams.get("code");
  const message = searchParams.get("message");

  return (
    <div className="min-h-screen bg-[linear-gradient(180deg,#fff7ed_0%,#ffffff_32%,#f8fafc_100%)] px-4 py-12">
      <div className="mx-auto max-w-2xl">
        <Card className="rounded-[2rem] border-slate-200 shadow-sm">
          <CardHeader className="text-center">
            <div className="mx-auto rounded-full bg-amber-50 p-4 text-amber-600">
              <AlertTriangle className="h-8 w-8" />
            </div>
            <CardTitle className="text-3xl font-black tracking-tight text-slate-950">결제가 완료되지 않았습니다</CardTitle>
            <CardDescription>결제창에서 취소했거나 승인 전에 오류가 발생했습니다.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-3 rounded-[1.5rem] bg-slate-50 p-5 text-sm text-slate-700">
              <div className="flex items-center justify-between gap-4">
                <span>오류 코드</span>
                <span className="font-semibold text-slate-900">{code || "-"}</span>
              </div>
              <div className="flex items-center justify-between gap-4">
                <span>메시지</span>
                <span className="max-w-[60%] text-right font-semibold text-slate-900">{message || "-"}</span>
              </div>
            </div>

            <div className="flex gap-3">
              <Button className="h-11 flex-1 rounded-xl bg-slate-900 hover:bg-slate-800" onClick={() => router.push("/credits")}>
                다시 시도
              </Button>
              <Button variant="outline" className="h-11 flex-1 rounded-xl" onClick={() => router.push("/my-page")}>
                마이페이지로 이동
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

export default function CreditsFailPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-[linear-gradient(180deg,#fff7ed_0%,#ffffff_32%,#f8fafc_100%)]" />}>
      <CreditsFailContent />
    </Suspense>
  );
}
