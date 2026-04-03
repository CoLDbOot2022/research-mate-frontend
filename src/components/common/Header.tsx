"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useRouter, usePathname } from "next/navigation";
import { BookOpen, ChevronDown, CircleUserRound, CreditCard, LogOut, Shield, UserRound } from "lucide-react";

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
  const menuRef = useRef<HTMLDivElement | null>(null);

  const [me, setMe] = useState<MeResponse | null>(null);
  const [isMenuOpen, setIsMenuOpen] = useState(false);

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

  useEffect(() => {
    const handlePointerDown = (event: MouseEvent) => {
      if (!menuRef.current?.contains(event.target as Node)) {
        setIsMenuOpen(false);
      }
    };

    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setIsMenuOpen(false);
      }
    };

    document.addEventListener("mousedown", handlePointerDown);
    document.addEventListener("keydown", handleEscape);

    return () => {
      document.removeEventListener("mousedown", handlePointerDown);
      document.removeEventListener("keydown", handleEscape);
    };
  }, []);

  const logout = () => {
    clearAccessToken();
    setMe(null);
    setIsMenuOpen(false);
    router.push("/");
  };

  const displayName = me?.name || me?.email || "사용자";

  return (
    <header className="sticky top-0 z-50 w-full bg-white/80 backdrop-blur-md border-b border-slate-100 no-print">
      <div className="container mx-auto px-4 h-16 flex items-center justify-between">
        <Link href="/" className="flex items-center space-x-2">
          <div className="flex items-center justify-center">
            <img src="/logo.png" alt="세특연구소 로고" className="w-8 h-8 object-contain" />
          </div>
          <span className="font-bold text-xl text-slate-900 tracking-tight">세특연구소</span>
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
            <div className="relative" ref={menuRef}>
              <Button
                variant="outline"
                size="sm"
                className="h-10 rounded-full border-slate-200 px-3"
                onClick={() => setIsMenuOpen((prev) => !prev)}
              >
                <UserRound className="w-4 h-4" />
                <span className="hidden max-w-28 truncate sm:inline">{displayName}</span>
                <ChevronDown className={`w-4 h-4 transition-transform ${isMenuOpen ? "rotate-180" : ""}`} />
              </Button>

              {isMenuOpen && (
                <div className="absolute right-0 top-12 w-64 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-xl">
                  <div className="border-b border-slate-100 bg-slate-50/80 px-4 py-3">
                    <p className="text-sm font-semibold text-slate-900">{displayName}님</p>
                    <p className="mt-1 text-xs text-slate-500">{me.email}</p>
                  </div>

                  <button
                    type="button"
                    className="flex w-full items-center gap-3 px-4 py-3 text-left text-sm font-medium text-slate-700 transition-colors hover:bg-slate-50"
                    onClick={() => {
                      setIsMenuOpen(false);
                      router.push("/my-page");
                    }}
                  >
                    <CircleUserRound className="w-4 h-4" />
                    마이페이지
                  </button>

                  <button
                    type="button"
                    className="flex w-full items-center gap-3 px-4 py-3 text-left text-sm font-medium text-slate-700 transition-colors hover:bg-slate-50"
                    onClick={() => {
                      setIsMenuOpen(false);
                      router.push("/credits");
                    }}
                  >
                    <CreditCard className="w-4 h-4" />
                    크레딧 충전
                  </button>

                  {me.email === "coldbootcp@gmail.com" && (
                    <button
                      type="button"
                      className="flex w-full items-center gap-3 px-4 py-3 text-left text-sm font-medium text-indigo-700 transition-colors hover:bg-indigo-50"
                      onClick={() => {
                        setIsMenuOpen(false);
                        router.push("/admin");
                      }}
                    >
                      <Shield className="w-4 h-4" />
                      관리자
                    </button>
                  )}

                  <button
                    type="button"
                    className="flex w-full items-center gap-3 border-t border-slate-100 px-4 py-3 text-left text-sm font-medium text-rose-600 transition-colors hover:bg-rose-50"
                    onClick={logout}
                  >
                    <LogOut className="w-4 h-4" />
                    로그아웃
                  </button>
                </div>
              )}
            </div>
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
