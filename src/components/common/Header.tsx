"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter, usePathname } from "next/navigation";
import { BookOpen, LogOut, UserRound } from "lucide-react";

import { Button } from "@/components/ui/button";
import { clearAccessToken, getAccessToken } from "@/lib/auth";

const BASE_URL = process.env.NEXT_PUBLIC_API_URL || "";

type MeResponse = {
  id: number;
  email: string;
  name?: string;
};

export function Header() {
  const router = useRouter();
  const pathname = usePathname();

  const [me, setMe] = useState<MeResponse | null>(null);

  useEffect(() => {
    const token = getAccessToken();
    if (!token) {
      setMe(null);
      return;
    }

    const load = async () => {
      try {
        const res = await fetch(`${BASE_URL}/auth/me`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        if (!res.ok) throw new Error("unauthorized");
        const data = (await res.json()) as MeResponse;
        setMe(data);
      } catch {
        clearAccessToken();
        setMe(null);
      }
    };

    load().catch(() => {
      clearAccessToken();
      setMe(null);
    });
  }, [pathname]);

  const logout = () => {
    clearAccessToken();
    setMe(null);
    router.push("/");
  };

  return (
    <header className="sticky top-0 z-50 w-full bg-white/80 backdrop-blur-md border-b border-slate-100">
      <div className="container mx-auto px-4 h-16 flex items-center justify-between">
        <Link href="/" className="flex items-center space-x-2">
          <div className="p-1.5 bg-blue-600 text-white rounded-lg">
            <BookOpen className="w-5 h-5" />
          </div>
          <span className="font-bold text-xl text-slate-900 tracking-tight">Research-Mate</span>
        </Link>

        <nav className="hidden md:flex items-center space-x-8">
          <Link
            href="/subject"
            className={`text-sm font-semibold transition-colors ${pathname === "/subject" ? "text-blue-600" : "text-slate-600 hover:text-blue-600"}`}
          >
            주제 추천받기
          </Link>
          {me && (
            <Link
              href="/my-reports"
              className={`text-sm font-semibold transition-colors ${pathname === "/my-reports" ? "text-blue-600" : "text-slate-600 hover:text-blue-600"}`}
            >
              기록 페이지
            </Link>
          )}
        </nav>

        <div className="flex items-center space-x-2">
          {me ? (
            <>
              <div className="hidden sm:flex items-center gap-1 text-sm text-slate-700 px-2">
                <UserRound className="w-4 h-4" /> {me.name || me.email}
              </div>
              <Button variant="outline" size="sm" onClick={logout}>
                <LogOut className="w-4 h-4 mr-1" /> 로그아웃
              </Button>
            </>
          ) : (
            <>
              <Button variant="ghost" size="sm" onClick={() => router.push("/login")}>로그인</Button>
              <Button size="sm" className="bg-blue-600 hover:bg-blue-700 font-bold px-4" onClick={() => router.push("/register")}>회원가입</Button>
            </>
          )}
        </div>
      </div>
    </header>
  );
}
