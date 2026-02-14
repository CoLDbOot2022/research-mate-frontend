"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import { BookOpen, Loader2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { setAccessToken } from "@/lib/auth";
import GoogleLoginButton from "@/components/auth/GoogleLoginButton";

const BASE_URL = process.env.NEXT_PUBLIC_API_URL || "";

export default function LoginPage() {
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const body = new URLSearchParams();
      body.set("username", email);
      body.set("password", password);

      const res = await fetch(`${BASE_URL}/auth/token`, {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: body.toString(),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data?.detail || "로그인에 실패했습니다.");
      }

      if (data.access_token) {
        setAccessToken(data.access_token);
      }
      router.push("/subject");
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "로그인 중 오류가 발생했습니다.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 px-4">
      <Card className="max-w-md w-full border-0 shadow-2xl bg-white rounded-3xl">
        <CardHeader className="space-y-3 text-center pb-8">
          <div className="flex justify-center">
            <div className="p-3 bg-blue-600 text-white rounded-2xl">
              <BookOpen className="w-8 h-8" />
            </div>
          </div>
          <CardTitle className="text-3xl font-bold text-slate-900">Research-Mate 로그인</CardTitle>
          <CardDescription className="text-slate-500">계정으로 로그인해 보고서를 저장하고 관리하세요.</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={onSubmit} className="space-y-4">
            <div className="grid gap-2">
              <Label htmlFor="email" className="text-slate-700 font-medium">이메일</Label>
              <Input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required className="h-12 border-slate-200" />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="password" className="text-slate-700 font-medium">비밀번호</Label>
              <Input id="password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} required className="h-12 border-slate-200" />
            </div>
            {error && <p className="text-sm text-red-600">{error}</p>}
            <Button type="submit" className="w-full bg-blue-600 hover:bg-blue-700 h-12 text-lg font-bold mt-2" disabled={loading}>
              {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : "로그인하기"}
            </Button>
            <div className="relative py-2">
              <div className="border-t" />
              <span className="absolute left-1/2 -translate-x-1/2 -translate-y-1/2 top-1/2 bg-white px-2 text-xs text-slate-500">또는</span>
            </div>
            <GoogleLoginButton onSuccess={() => router.push("/subject")} />
            <div className="text-center text-sm text-slate-500 pt-2">
              아직 계정이 없으신가요?{" "}
              <Button variant="link" className="p-0 text-blue-600 font-bold" onClick={() => router.push("/register")} type="button">
                회원가입
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
