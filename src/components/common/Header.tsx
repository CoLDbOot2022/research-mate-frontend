"use client";

import React from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { useRouter, usePathname } from 'next/navigation';
import { BookOpen } from 'lucide-react';

export function Header() {
    const router = useRouter();
    const pathname = usePathname();

    // Don't show header on landing page (if desired) or simple pages
    // But usually it's better to show it.

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
                    <Link href="/subject" className={`text-sm font-semibold transition-colors ${pathname === '/subject' ? 'text-blue-600' : 'text-slate-600 hover:text-blue-600'}`}>
                        주제 추천받기
                    </Link>
                    <Link href="/my-reports" className={`text-sm font-semibold transition-colors ${pathname === '/my-reports' ? 'text-blue-600' : 'text-slate-600 hover:text-blue-600'}`}>
                        기록 페이지
                    </Link>
                </nav>

                <div className="flex items-center space-x-3">
                    <Button size="sm" className="bg-blue-600 hover:bg-blue-700 font-bold px-5" onClick={() => router.push('/subject')}>
                        탐구 시작
                    </Button>
                </div>
            </div>
        </header>
    );
}
