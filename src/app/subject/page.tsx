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

type UnitMedium = {
  unit_medium: string;
  children: string[];
};

type UnitLarge = {
  unit_large: string;
  children: UnitMedium[];
};

export default function SubjectPage() {
  const router = useRouter();

  const [subjects, setSubjects] = useState<string[]>([]);
  const [units, setUnits] = useState<UnitLarge[]>([]);
  const [loading, setLoading] = useState(false);
  const [fetchError, setFetchError] = useState("");

  const [subject, setSubject] = useState("수학");
  const [large, setLarge] = useState("");
  const [medium, setMedium] = useState("");
  const [small, setSmall] = useState("");
  const [career, setCareer] = useState("");
  const [difficulty, setDifficulty] = useState("70");

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
      setLarge("");
      setMedium("");
      setSmall("");
    };
    load().catch(() => setFetchError("단원 목록을 불러오지 못했습니다."));
  }, [subject]);

  const mediumOptions = useMemo(() => {
    const found = units.find((u) => u.unit_large === large);
    return found?.children ?? [];
  }, [units, large]);

  const smallOptions = useMemo(() => {
    const found = mediumOptions.find((m) => m.unit_medium === medium);
    return found?.children ?? [];
  }, [mediumOptions, medium]);

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!large) {
      alert("대주제(대단원)는 반드시 선택해야 합니다.");
      return;
    }

    setLoading(true);
    const query = new URLSearchParams({
      subject,
      unit_large: large,
      unit_medium: medium,
      unit_small: small,
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
            <Sparkles className="w-3 h-3" /> Research-Mate Workflow
          </div>
          <h1 className="text-3xl md:text-4xl font-black tracking-tight mb-3">심화 탐구 입력</h1>
          <p className="text-slate-600">과목과 단원을 고르면 AI가 주제 1개를 추천하고, 바로 고퀄리티 보고서 생성으로 이어집니다.</p>
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
                <Select
                  value={large}
                  onValueChange={(v) => {
                    setLarge(v);
                    setMedium("");
                    setSmall("");
                  }}
                >
                  <SelectTrigger><SelectValue placeholder="대주제 선택" /></SelectTrigger>
                  <SelectContent>
                    {units.map((u) => (
                      <SelectItem key={u.unit_large} value={u.unit_large}>{u.unit_large}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>중주제 (선택)</Label>
                <Select
                  value={medium}
                  onValueChange={(v) => {
                    setMedium(v);
                    setSmall("");
                  }}
                  disabled={!large}
                >
                  <SelectTrigger><SelectValue placeholder="중주제 선택" /></SelectTrigger>
                  <SelectContent>
                    {mediumOptions.map((m) => (
                      <SelectItem key={m.unit_medium} value={m.unit_medium}>{m.unit_medium}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>소주제 (선택)</Label>
                <Select value={small} onValueChange={setSmall} disabled={!medium}>
                  <SelectTrigger><SelectValue placeholder="소주제 선택" /></SelectTrigger>
                  <SelectContent>
                    {smallOptions.map((s) => (
                      <SelectItem key={s} value={s}>{s}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
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
              <div className="space-y-2">
                <Label>난이도 (1~100)</Label>
                <Input
                  type="number"
                  min={1}
                  max={100}
                  value={difficulty}
                  onChange={(e) => setDifficulty(e.target.value)}
                  className="bg-slate-50"
                />
              </div>
            </CardContent>
          </Card>

          <Button type="submit" disabled={loading} className="w-full h-12 text-base font-semibold rounded-xl bg-slate-900 hover:bg-slate-950">
            {loading ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" />추천 준비 중...</> : "주제 1개 추천받기"}
          </Button>
        </form>
      </div>
    </div>
  );
}
