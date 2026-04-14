"use client";

import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Star } from 'lucide-react';
import { motion } from 'framer-motion';

const testimonials = [
    {
        name: "김oo",
        school: "가온고등학교 2학년",
        text: "원래 생기부용 보고서를 직접 작성하는 편인데, 시험기간이랑 겹쳐서 세특연구소 사용해봤어요. 이제 직접 안 쓰고 계속 세특연구소 쓰려고요. 퀄리티 좋고 세특용 문장까지 정리해줘서 너무 편해요. 강추드려요.",
        role: "수학 탐구 보고서"
    },
    {
        name: "강oo",
        school: "광교고등학교 1학년",
        text: "덕분에 생기부에 수학 탐구 보고서 쉽게 넣었어요. 감사합니다 ㅎㅎㅎ",
        role: "생명과학 심화 탐구"
    },
    {
        name: "유oo",
        school: "흥덕고등학교 1학년",
        text: "수행평가용으로 사용했는데 완전 신세계에요. 비슷한 다른 사이트에서도 써봤는데 여기가 훨씬 결과가 좋은 것 같아요.",
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
                        <CardContent className="pt-8 px-8 pb-5 h-full flex flex-col">
                            <div className="flex gap-1 mb-4">
                                {[...Array(5)].map((_, i) => (
                                    <Star key={i} className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                                ))}
                            </div>
                            <p className="text-slate-600 mb-6 italic grow">"{item.text}"</p>
                            <div className="flex items-center gap-4 mt-auto">
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
