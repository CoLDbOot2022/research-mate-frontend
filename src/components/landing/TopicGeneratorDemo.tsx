"use client";

import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Sparkles, ArrowRight } from 'lucide-react';

export function TopicGeneratorDemo() {
    return (
        <Card className="w-full max-w-sm border-0 shadow-2xl bg-white/90 backdrop-blur-sm relative overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-blue-500 to-purple-500" />
            <CardContent className="p-6 space-y-4">
                <div className="flex items-center space-x-2 text-blue-600 font-bold text-sm uppercase tracking-wider">
                    <Sparkles className="w-4 h-4" />
                    <span>AI Recommendation</span>
                </div>
                <div className="space-y-2">
                    <h3 className="text-xl font-bold text-slate-900 leading-tight">
                        미분방정식을 활용한<br />
                        감염병 확산 모델 분석
                    </h3>
                    <p className="text-sm text-slate-500">
                        전염병의 전파 양상을 SIR 모델을 통해 수학적으로 해석하고 예측합니다.
                    </p>
                </div>
                <div className="pt-2">
                    <div className="flex items-center text-sm font-medium text-blue-600">
                        추천 이유 보기 <ArrowRight className="w-4 h-4 ml-1" />
                    </div>
                </div>
            </CardContent>
        </Card>
    );
}
