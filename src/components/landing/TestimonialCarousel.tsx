"use client";

import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Star } from 'lucide-react';
import { motion } from 'framer-motion';

const testimonials = [
    {
        name: "김민수",
        school: "서울고등학교 2학년",
        text: "주제 선정하는 게 매번 고역이었는데, TopicGen 덕분에 이번 생기부 수행평가에서 과목 선생님께 칭찬받았어요!",
        role: "수학 탐구 보고서"
    },
    {
        name: "이지연",
        school: "강남여자고등학교 3학년",
        text: "진로와 연관된 심화 주제를 찾기가 어려웠는데, AI가 제 꿈에 딱 맞는 보고서 방향을 제시해줘서 정말 큰 도움이 됐습니다.",
        role: "생명과학 심화 탐구"
    },
    {
        name: "박준혁",
        school: "부산중앙고등학교 1학년",
        text: "처음 쓰는 심화 보고서라 막막했지만 가이드가 친절해서 끝까지 완성할 수 있었습니다. 강력 추천해요!",
        role: "정보통신 융합 탐구"
    }
];

export function TestimonialCarousel() {
    return (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {testimonials.map((item, idx) => (
                <motion.div
                    key={idx}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: idx * 0.1 }}
                >
                    <Card className="border-0 shadow-lg h-full">
                        <CardContent className="p-8">
                            <div className="flex gap-1 mb-4">
                                {[...Array(5)].map((_, i) => (
                                    <Star key={i} className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                                ))}
                            </div>
                            <p className="text-slate-600 mb-6 italic">"{item.text}"</p>
                            <div className="flex items-center gap-4">
                                <Avatar className="w-10 h-10">
                                    <AvatarFallback className="bg-blue-100 text-blue-600 font-bold">{item.name[0]}</AvatarFallback>
                                </Avatar>
                                <div>
                                    <div className="text-sm font-bold text-slate-900">{item.name}</div>
                                    <div className="text-xs text-slate-400">{item.school}</div>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </motion.div>
            ))}
        </div>
    );
}
