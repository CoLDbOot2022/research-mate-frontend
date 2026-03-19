"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { BookOpenText, Loader2, Sparkles, Target } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { api } from "@/lib/api/client";
import { getAccessToken } from "@/lib/auth";

type UnitMedium = {
  unit_medium: string;
  children: string[];
};

type UnitLarge = {
  unit_large: string;
  children: UnitMedium[];
};

const NONE_VALUE = "__none__";
const REPORT_TYPES = [
  { value: "general", label: "일반 리포트", description: "기본 보고서 생성", packageCode: "basic" },
  { value: "premium", label: "프리미엄 리포트", description: "검수 포함 보고서 생성", packageCode: "premium-review" },
] as const;

type PaymentSummary = {
  packages: Array<{
    code: string;
    credit_balance: number;
    claim_remaining: number;
  }>;
};

export default function SubjectPage() {
  const router = useRouter();

  const [subjects, setSubjects] = useState<string[]>([]);
  const [units, setUnits] = useState<UnitLarge[]>([]);
  const [loading, setLoading] = useState(false);
  const [fetchError, setFetchError] = useState("");

  const [subject, setSubject] = useState("");
  const [large, setLarge] = useState(NONE_VALUE);
  const [medium, setMedium] = useState(NONE_VALUE);
  const [small, setSmall] = useState(NONE_VALUE);
  const [reportType, setReportType] = useState<(typeof REPORT_TYPES)[number]["value"] | null>(null);
  const [career, setCareer] = useState("");
  const [difficulty, setDifficulty] = useState("70");
  const [packageCredits, setPackageCredits] = useState<Record<string, number>>({});

  useEffect(() => {
    if (!getAccessToken()) {
      alert("주제 추천과 보고서 생성을 위해 먼저 로그인해주세요.");
      router.push("/login?callback=/subject");
    }
  }, [router]);

  useEffect(() => {
    const load = async () => {
      setFetchError("");
      const data = await api.get<string[]>("/curriculum/subjects");
      setSubjects(data);
      if (data.length > 0) setSubject(data[0]);
    };
    load().catch(() => setFetchError("백엔드 연결에 실패했습니다. 서버 실행 상태와 API URL을 확인해주세요."));
  }, []);

  useEffect(() => {
    if (!subject) return;
    const load = async () => {
      const data = await api.get<UnitLarge[]>("/curriculum/units", { params: { subject } });
      setUnits(data);
      setLarge(NONE_VALUE);
      setMedium(NONE_VALUE);
      setSmall(NONE_VALUE);
    };
    load().catch(() => setFetchError("단원 목록을 불러오지 못했습니다."));
  }, [subject]);

  useEffect(() => {
    const token = getAccessToken();
    if (!token) {
      return;
    }

    const load = async () => {
      const summary = await api.get<PaymentSummary>("/payments/summary", { cache: "no-store" });
      setPackageCredits(
        Object.fromEntries(summary.packages.map((pkg) => [pkg.code, pkg.credit_balance]))
      );
    };

    load().catch(() => setPackageCredits({}));
  }, []);

  const mediumOptions = useMemo(() => {
    if (large === NONE_VALUE) return [];
    const found = units.find((u) => u.unit_large === large);
    return found?.children ?? [];
  }, [units, large]);

  const smallOptions = useMemo(() => {
    if (medium === NONE_VALUE) return [];
    const found = mediumOptions.find((m) => m.unit_medium === medium);
    return found?.children ?? [];
  }, [mediumOptions, medium]);

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!reportType) return;
    setLoading(true);
    const query = new URLSearchParams({
      subject,
      unit_large: large === NONE_VALUE ? "" : large,
      unit_medium: medium === NONE_VALUE ? "" : medium,
      unit_small: small === NONE_VALUE ? "" : small,
      report_type: reportType,
      career,
      difficulty,
      mode: "new",
    });
    router.push(`/topic-confirm?${query.toString()}`);
  };

  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top_left,#fef9c3_0%,#eff6ff_40%,#f8fafc_75%)] py-12 px-4">
      <div className="max-w-4xl mx-auto space-y-6">
        <div className="rounded-3xl border bg-white/80 backdrop-blur p-8 shadow-sm">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-100 text-amber-800 text-xs font-semibold mb-4">
            <Sparkles className="w-3 h-3" /> 세특연구소 Workflow
          </div>
          <h1 className="text-3xl md:text-4xl font-black tracking-tight mb-3">심화 탐구 입력</h1>
          <p className="text-slate-600">과목과 단원을 고르면 AI가 주제를 추천하고, 바로 고퀄리티 보고서 생성으로 이어집니다.</p>
        </div>

        {fetchError && (
          <div className="rounded-2xl border border-red-200 bg-red-50 text-red-700 px-4 py-3 text-sm">{fetchError}</div>
        )}

        <form onSubmit={onSubmit} className="space-y-6">
          <Card className="rounded-3xl border-slate-200/70 shadow-sm">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-xl"><BookOpenText className="w-5 h-5" /> 교과서 단원 선택</CardTitle>
            </CardHeader>
            <CardContent className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="md:col-span-3 space-y-2">
                <Label>과목</Label>
                <div className="flex flex-wrap gap-2">
                  {subjects.map((s) => (
                    <Button
                      key={s}
                      type="button"
                      variant={subject === s ? "default" : "outline"}
                      className={subject === s ? "bg-slate-900 hover:bg-slate-950" : "bg-white"}
                      onClick={() => setSubject(s)}
                    >
                      {s}
                    </Button>
                  ))}
                </div>
              </div>

              <div className="space-y-2">
                <Label>대주제 (필수)</Label>
                <div className="relative">
                  <Select
                    value={large}
                    onValueChange={(v) => {
                      setLarge(v);
                      setMedium(NONE_VALUE);
                      setSmall(NONE_VALUE);
                    }}
                  >
                    <SelectTrigger><SelectValue placeholder="대주제 선택" /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value={NONE_VALUE}>선택 안함</SelectItem>
                      {units.map((u) => (
                        <SelectItem key={u.unit_large} value={u.unit_large}>{u.unit_large}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-2">
                <Label>중주제 (선택)</Label>
                <Select
                  value={medium}
                  onValueChange={(v) => {
                    setMedium(v);
                    setSmall(NONE_VALUE);
                  }}
                >
                  <SelectTrigger><SelectValue placeholder="중주제 선택" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value={NONE_VALUE}>선택 안함</SelectItem>
                    {mediumOptions.map((m) => (
                      <SelectItem key={m.unit_medium} value={m.unit_medium}>{m.unit_medium}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>소주제 (선택)</Label>
                <Select value={small} onValueChange={setSmall}>
                  <SelectTrigger><SelectValue placeholder="소주제 선택" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value={NONE_VALUE}>선택 안함</SelectItem>
                    {smallOptions.map((s) => (
                      <SelectItem key={s} value={s}>{s}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="md:col-span-3 space-y-2">
                <Label>리포트 종류</Label>
                <div className="grid grid-cols-1 gap-2 md:grid-cols-2">
                  {REPORT_TYPES.map((type) => {
                    const remaining = packageCredits[type.packageCode];
                    const hasNoCredits = remaining !== undefined && remaining <= 0;
                    const isSelected = reportType === type.value;
                    return (
                      <button
                        key={type.value}
                        type="button"
                        disabled={hasNoCredits}
                        onClick={() => !hasNoCredits && setReportType(type.value)}
                        className={`rounded-2xl border px-4 py-3 text-left transition ${
                          hasNoCredits
                            ? "border-slate-200 bg-slate-50 text-slate-400 cursor-not-allowed opacity-60"
                            : isSelected
                            ? "border-2 border-slate-900 bg-white text-slate-900 shadow-sm"
                            : "border-slate-200 bg-white text-slate-700 hover:border-slate-300"
                        }`}
                      >
                        <div className="flex items-start justify-between gap-3">
                          <div>
                            <p className="text-sm font-semibold">{type.label}</p>
                            <p className={`mt-1 text-xs ${isSelected && !hasNoCredits ? "text-slate-600" : "text-slate-500"}`}>
                              {hasNoCredits ? "크레딧 없음 — 구매 후 이용 가능" : type.description}
                            </p>
                          </div>
                          {remaining !== undefined ? (
                            <span className={`shrink-0 rounded-full px-2.5 py-1 text-xs font-semibold ${
                              hasNoCredits ? "bg-red-50 text-red-500" : isSelected ? "bg-slate-100 text-slate-700" : "bg-slate-50 text-slate-600"
                            }`}>
                              {remaining}회 남음
                            </span>
                          ) : null}
                        </div>
                      </button>
                    );
                  })}
                </div>
                {REPORT_TYPES.every((t) => (packageCredits[t.packageCode] ?? 1) <= 0) && (
                  <p className="text-xs text-red-500 mt-1">
                    사용 가능한 크레딧이 없습니다.{" "}
                    <a href="/credits" className="underline font-medium">크레딧 구매하기 →</a>
                  </p>
                )}
              </div>
            </CardContent>
          </Card>

          <Card className="rounded-3xl border-slate-200/70 shadow-sm">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-xl"><Target className="w-5 h-5" /> 진로/관심 및 난이도</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>진로 또는 관심사</Label>
                <Input
                  value={career}
                  onChange={(e) => setCareer(e.target.value)}
                  placeholder="예: 금융공학, 의공학, 산업수학"
                  className="bg-slate-50"
                />
              </div>
              <div className="space-y-3">
                <Label>난이도 선택</Label>
                <div className="grid grid-cols-3 gap-3">
                  {[
                    { label: "기초", value: "30", desc: "기본 개념 위주" },
                    { label: "응용", value: "60", desc: "심화 개념 연결" },
                    { label: "심화", value: "90", desc: "학문적 탐구 중심" },
                  ].map((item) => (
                    <Button
                      key={item.value}
                      type="button"
                      variant={difficulty === item.value ? "default" : "outline"}
                      className={`h-auto py-3 flex flex-col gap-1 rounded-2xl border-slate-200 ${difficulty === item.value ? "bg-slate-900 text-white hover:bg-slate-800" : "bg-white hover:bg-slate-50"
                        }`}
                      onClick={() => setDifficulty(item.value)}
                    >
                      <span className="font-bold">{item.label}</span>
                      <span className={`text-[10px] ${difficulty === item.value ? "text-slate-300" : "text-slate-500"}`}>
                        {item.desc}
                      </span>
                    </Button>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>

          <Button type="submit" disabled={loading || !reportType} className="w-full h-12 text-base font-semibold rounded-xl bg-slate-900 hover:bg-slate-950 disabled:opacity-50 disabled:cursor-not-allowed">
            {loading ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" />추천 준비 중...</> : reportType ? "주제 추천받기" : "리포트 종류를 선택해주세요"}
          </Button>
        </form>
      </div>
    </div>
  );
}
