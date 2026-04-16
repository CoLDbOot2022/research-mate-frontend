"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useRouter, usePathname } from "next/navigation";
import { 
  BookOpen, 
  ChevronDown, 
  CircleUserRound, 
  CreditCard, 
  LogOut, 
  Shield, 
  UserRound,
  Menu,
  X,
  CreditCard as CreditIcon,
  LayoutDashboard
} from "lucide-react";

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
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

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
        setIsMobileMenuOpen(false);
      }
    };

    document.addEventListener("mousedown", handlePointerDown);
    document.addEventListener("keydown", handleEscape);

    return () => {
      document.removeEventListener("mousedown", handlePointerDown);
      document.removeEventListener("keydown", handleEscape);
    };
  }, []);

  // Close mobile menu on route change
  useEffect(() => {
    setIsMobileMenuOpen(false);
  }, [pathname]);

  const logout = () => {
    clearAccessToken();
    setMe(null);
    setIsMenuOpen(false);
    setIsMobileMenuOpen(false);
    router.push("/");
  };

  const displayName = me?.name || me?.email || "사용자";

  const navLinks = [
    { href: "/about", label: "Our Vision" },
    { href: "/mentors", label: "Mentors" },
    { href: "/guide", label: "이용 가이드 및 가격 안내" },
  ];

  return (
    <header className="sticky top-0 z-50 w-full bg-white/90 backdrop-blur-md border-b border-slate-100 no-print">
      <div className="container mx-auto px-4 h-16 flex items-center justify-between">
        <Link href="/" className="flex items-center space-x-2 shrink-0 relative z-50">
          <div className="flex items-center justify-center">
            <img src="/logo.png" alt="세특연구소 로고" className="w-8 h-8 object-contain" />
          </div>
          <span className="font-bold text-xl text-slate-900 tracking-tight">세특연구소</span>
        </Link>
 
        {/* PC: Main Navigation (Left-aligned next to logo) */}
        <nav className="hidden md:flex items-center space-x-8 ml-10">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={`text-sm font-semibold transition-colors ${pathname === link.href ? "text-blue-600" : "text-slate-600 hover:text-blue-600"}`}
            >
              {link.label}
            </Link>
          ))}
        </nav>
 
        {/* Spacer: Grows on desktop to push user actions to the right */}
        <div className="flex-grow" />
 
        {/* Actions Container (Right-aligned) */}
        <div className="flex items-center space-x-3 md:space-x-8 flex-nowrap shrink-0">
          {/* PC & Mobile: Service Action Links */}
          <div className="hidden md:flex items-center space-x-8">
            <Link
              href="/subject"
              className={`text-sm font-semibold transition-all hover:text-blue-600 relative group ${pathname === "/subject" ? "text-blue-600" : "text-slate-600"}`}
            >
              주제 추천받기
              <span className={`absolute -bottom-1 left-0 w-0 h-0.5 bg-blue-600 transition-all group-hover:w-full ${pathname === "/subject" ? "w-full" : ""}`} />
            </Link>

            {me && (
              <Link
                href="/my-reports"
                className={`text-sm font-semibold transition-all hover:text-blue-600 relative group ${pathname === "/my-reports" ? "text-blue-600" : "text-slate-600"}`}
              >
                기록 페이지
                <span className={`absolute -bottom-1 left-0 w-0 h-0.5 bg-blue-600 transition-all group-hover:w-full ${pathname === "/my-reports" ? "w-full" : ""}`} />
              </Link>
            )}
          </div>

          {/* Vertical Separator - Clear distinction between service and auth */}
          <div className="hidden md:block h-6 w-[1px] bg-slate-200 shrink-0" />

          <div className="flex items-center space-x-2 md:space-x-4">
            {me ? (
              <div className="relative" ref={menuRef}>
                <Button
                  variant="outline"
                  size="sm"
                  className="h-10 rounded-full border-slate-200 px-3 flex items-center gap-1 bg-white shadow-sm"
                  onClick={() => setIsMenuOpen((prev) => !prev)}
                >
                  <UserRound className="w-4 h-4" />
                  <span className="hidden max-w-[100px] truncate lg:inline">{displayName}</span>
                  <ChevronDown className={`w-3 h-3 text-slate-400 transition-transform ${isMenuOpen ? "rotate-180" : ""}`} />
                </Button>

                {isMenuOpen && (
                  <div className="absolute right-0 top-12 w-64 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-xl animate-in fade-in slide-in-from-top-2 duration-200">
                    <div className="border-b border-slate-100 bg-slate-50/80 px-4 py-3">
                      <p className="text-sm font-semibold text-slate-900">{displayName}님</p>
                      <p className="mt-1 text-xs text-slate-500 truncate">{me.email}</p>
                    </div>

                    <div className="py-1">
                      <button
                        type="button"
                        className="flex w-full items-center gap-3 px-4 py-3 text-left text-sm font-medium text-slate-700 transition-colors hover:bg-slate-50"
                        onClick={() => {
                          setIsMenuOpen(false);
                          router.push("/my-reports");
                        }}
                      >
                        <LayoutDashboard className="w-4 h-4 text-slate-400" />
                        기록 페이지
                      </button>
                      <button
                        type="button"
                        className="flex w-full items-center gap-3 px-4 py-3 text-left text-sm font-medium text-slate-700 transition-colors hover:bg-slate-50"
                        onClick={() => {
                          setIsMenuOpen(false);
                          router.push("/my-page");
                        }}
                      >
                        <CircleUserRound className="w-4 h-4 text-slate-400" />
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
                        <CreditCard className="w-4 h-4 text-slate-400" />
                        이용권 충전
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
                    </div>

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
              <div className="flex items-center gap-1 shrink-0">
                <Button variant="ghost" size="sm" className="h-8 text-[11px] md:text-sm font-bold text-slate-600 hover:text-blue-600 hover:bg-white rounded-full px-2" onClick={() => router.push("/login")}>로그인</Button>
                <Button size="sm" className="h-8 text-[11px] md:text-sm bg-blue-600 hover:bg-blue-700 font-bold px-2.5 rounded-full shadow-sm" onClick={() => router.push("/register")}>회원가입</Button>
              </div>
            )}

            {/* Mobile Menu Button - Kept flexible and visible */}
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="flex md:hidden p-2 text-slate-700 hover:bg-slate-100 active:bg-slate-200 rounded-full transition-all active:scale-95 relative z-50 items-center justify-center border border-slate-200 bg-white shadow-sm shrink-0"
              aria-label="메뉴 열기"
            >
              {isMobileMenuOpen ? (
                <X className="w-5 h-5 text-slate-900" />
              ) : (
                <Menu className="w-5 h-5" />
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu Overlay */}
      {isMobileMenuOpen && (
        <div className="fixed inset-0 z-40 bg-white md:hidden animate-in fade-in duration-200 overflow-y-auto">
          <div className="flex flex-col pt-24 px-6 pb-12">
            <div className="space-y-1 mb-8">
              <p className="text-xs font-bold text-blue-600 uppercase tracking-widest px-4 mb-3">Service Menu</p>
              {navLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`block px-4 py-4 rounded-2xl text-xl font-bold transition-all ${
                    pathname === link.href ? "bg-blue-50 text-blue-900" : "text-slate-800 hover:bg-slate-50"
                  }`}
                >
                  {link.label}
                </Link>
              ))}
              <Link
                href="/subject"
                className={`block px-4 py-4 rounded-2xl text-xl font-bold transition-all ${
                  pathname === "/subject" ? "bg-blue-50 text-blue-900" : "text-slate-800 hover:bg-slate-50"
                }`}
              >
                주제 추천받기
              </Link>
              {me && (
                <Link
                  href="/my-reports"
                  className={`block px-4 py-4 rounded-2xl text-xl font-bold transition-all ${
                    pathname === "/my-reports" ? "bg-blue-50 text-blue-900" : "text-slate-800 hover:bg-slate-50"
                  }`}
                >
                  기록 페이지
                </Link>
              )}
            </div>

            <div className="mt-auto pt-8 border-t border-slate-100">
              <div className="grid grid-cols-2 gap-3">
                <Button 
                  variant="outline" 
                  className="rounded-2xl h-14 font-bold border-slate-200"
                  onClick={() => router.push("/support")}
                >
                  문의하기
                </Button>
                {me ? (
                  <Button 
                    variant="outline" 
                    className="rounded-2xl h-14 font-bold border-rose-100 text-rose-600 hover:bg-rose-50"
                    onClick={logout}
                  >
                    로그아웃
                  </Button>
                ) : (
                  <Button 
                    className="rounded-2xl h-14 font-bold bg-slate-900"
                    onClick={() => router.push("/login")}
                  >
                    로그인
                  </Button>
                )}
              </div>
            </div>
            
            <div className="mt-8 text-center px-4">
              <p className="text-sm text-slate-400">© 2024 세특연구소. All rights reserved.</p>
            </div>
          </div>
        </div>
      )}
    </header>
  );
}
