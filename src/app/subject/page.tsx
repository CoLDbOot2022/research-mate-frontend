"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";

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

  const [subject, setSubject] = useState("수학");
  const [large, setLarge] = useState("");
  const [medium, setMedium] = useState("");
  const [small, setSmall] = useState("");
  const [career, setCareer] = useState("");
  const [difficulty, setDifficulty] = useState("60");

  useEffect(() => {
    const load = async () => {
      const data = await api.get<string[]>("/curriculum/subjects");
      setSubjects(data);
      if (data.length > 0) setSubject(data[0]);
    };
    load().catch(console.error);
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
    load().catch(console.error);
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
    <div className="container mx-auto px-4 py-12 min-h-screen">
      <div className="max-w-3xl mx-auto">
        <h1 className="text-3xl font-bold mb-2">심화 탐구 설정</h1>
        <p className="text-slate-600 mb-8">
          과목, 단원(대주제/중주제/소주제), 진로 또는 관심사를 입력하면 주제를 1개만 추천합니다.
        </p>

        <form onSubmit={onSubmit} className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>교과서 단원 선택</CardTitle>
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
                  <SelectTrigger>
                    <SelectValue placeholder="대주제 선택" />
                  </SelectTrigger>
                  <SelectContent>
                    {units.map((u) => (
                      <SelectItem key={u.unit_large} value={u.unit_large}>
                        {u.unit_large}
                      </SelectItem>
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
                  <SelectTrigger>
                    <SelectValue placeholder="중주제 선택" />
                  </SelectTrigger>
                  <SelectContent>
                    {mediumOptions.map((m) => (
                      <SelectItem key={m.unit_medium} value={m.unit_medium}>
                        {m.unit_medium}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>소주제 (선택)</Label>
                <Select value={small} onValueChange={setSmall} disabled={!medium}>
                  <SelectTrigger>
                    <SelectValue placeholder="소주제 선택" />
                  </SelectTrigger>
                  <SelectContent>
                    {smallOptions.map((s) => (
                      <SelectItem key={s} value={s}>
                        {s}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>진로/관심 및 난이도</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>진로 또는 관심사</Label>
                <Input
                  value={career}
                  onChange={(e) => setCareer(e.target.value)}
                  placeholder="예: 의공학, 데이터사이언스, 수학교육"
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
                />
              </div>
            </CardContent>
          </Card>

          <Button type="submit" disabled={loading} className="w-full h-12 text-base font-semibold">
            {loading ? "추천 준비 중..." : "주제 1개 추천받기"}
          </Button>
        </form>
      </div>
    </div>
  );
}
