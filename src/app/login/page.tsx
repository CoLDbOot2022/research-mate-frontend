"use client";

import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useRouter } from 'next/navigation';
import { BookOpen } from 'lucide-react';

export default function LoginPage() {
    const router = useRouter();

    return (
        <div className="min-h-screen flex items-center justify-center bg-slate-50 px-4">
            <Card className="max-w-md w-full border-0 shadow-2xl bg-white">
                <CardHeader className="space-y-3 text-center pb-8">
                    <div className="flex justify-center">
                        <div className="p-3 bg-blue-600 text-white rounded-2xl">
                            <BookOpen className="w-8 h-8" />
                        </div>
                    </div>
                    <CardTitle className="text-3xl font-bold text-slate-900">Research-Mate</CardTitle>
                    <CardDescription className="text-slate-500">당신만의 주제를 찾기 위해 로그인해 주세요.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="grid gap-2">
                        <Label htmlFor="email" className="text-slate-700 font-medium">이메일</Label>
                        <Input id="email" type="email" placeholder="name@example.com" className="h-12 border-slate-200" />
                    </div>
                    <div className="grid gap-2">
                        <div className="flex items-center justify-between">
                            <Label htmlFor="password" text-slate-700 font-medium>비밀번호</Label>
                            <Button variant="link" className="px-0 text-xs text-slate-400">비밀번호 찾기</Button>
                        </div>
                        <Input id="password" type="password" className="h-12 border-slate-200" />
                    </div>
                    <Button className="w-full bg-blue-600 hover:bg-blue-700 h-12 text-lg font-bold mt-2" onClick={() => router.push('/')}>
                        로그인하기
                    </Button>
                    <div className="text-center text-sm text-slate-500 pt-6">
                        아직 계정이 없으신가요?{" "}
                        <Button variant="link" className="p-0 text-blue-600 font-bold" onClick={() => router.push('/register')}>
                            무료 회원가입
                        </Button>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
