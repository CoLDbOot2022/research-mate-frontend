"use client";

import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Star, Quote } from 'lucide-react';

const TESTIMONIALS = [
    { name: '김민수', role: '고2 학생', text: '막막했던 생기부 주제, 여기서 찾고 세특 꽉 채웠어요! 선생님께서도 참신하다고 칭찬해주셨습니다.' },
    { name: '이서연', role: '고1 학생', text: '관심사는 있는데 어떤 주제로 보고서를 써야할지 몰랐는데, 구체적인 방향을 잡아줘서 정말 좋았어요.' },
    { name: '박준호', role: '고3 학생', text: '수행평가 주제 정하기 너무 힘들었는데 덕분에 시간 아꼈습니다. 친구들에게도 추천하고 있어요.' },
    { name: '최지원', role: '고2 학부모', text: '아이가 수행평가 때문에 스트레스 받아했는데, TopicGen 덕분에 스스로 주제를 찾고 재미있게 탐구하네요.' },
    { name: '정우성', role: '고1 학생', text: '생기부 컨설팅 학원보다 훨씬 낫습니다. 제 관심사에 딱 맞는 주제를 찾아줘서 놀랐어요.' },
    { name: '강민지', role: '중3 학생', text: '고등학교 올라가기 전에 미리 연습해보고 있습니다. 생각보다 다루기 쉽고 결과물이 훌륭해요!' },
    { name: '윤서아', role: '고3 학부모', text: '입시 준비하는 데 정말 큰 도움이 되었습니다. 전문적인 주제들이 많아서 생기부 질이 달라졌어요.' },
    { name: '임재현', role: '고2 학생', text: '물리학 주제 찾기가 어려웠는데, 제 코딩 실력과 엮어서 멋진 탐구 보고서를 만들 수 있었습니다.' },
    { name: '한소희', role: '고1 학부모', text: '아이가 진로를 아직 못 정해서 걱정이었는데, 이것저것 해보더니 관심 분야를 찾은 것 같아요.' },
    { name: '송민호', role: '고3 학생', text: '의약 계열 지망생인데 심화 탐구 주제 퀄리티가 대박입니다. 유전자가위 관련 주제 너무 좋았어요.' },
    { name: '박지민', role: '고2 학생', text: '단순히 주제만 던져주는 게 아니라 탐구 가이드까지 주니까 보고서 쓰기가 훨씬 수월했습니다.' },
    { name: '김태희', role: '고1 학부모', text: '요즘 애들 공부하기 힘들겠다 싶었는데 이런 서비스가 있다니 다행이네요. 적극 활용시키고 있습니다.' },
    { name: '조승우', role: '고2 학생', text: '친구랑 같이 가입해서 쓰고 있어요. 서로 주제 봐주면서 하니까 더 재밌네요. 디자인도 예뻐요.' },
    { name: '이지은', role: '고3 학생', text: '마지막 학기 세특 마무리를 TopicGen과 함께 했습니다. 덕분에 수시 원서 자신있게 썼어요.' },
    { name: '홍길동', role: '교사', text: '학생들에게 주제 선정 가이드로 추천하고 있습니다. 교육적으로도 훌륭하게 설계된 서비스입니다.' },
];

export function TestimonialCarousel() {
    return (
        <div className="relative w-full overflow-hidden py-10 bg-slate-50">
            {/* Gradient Masks */}
            <div className="absolute left-0 top-0 bottom-0 w-20 bg-gradient-to-r from-slate-50 to-transparent z-10" />
            <div className="absolute right-0 top-0 bottom-0 w-20 bg-gradient-to-l from-slate-50 to-transparent z-10" />

            {/* Marquee Container */}
            <div className="flex animate-marquee hover:pause whitespace-nowrap gap-6 w-max">
                {/* Render Double for vivid infinite scroll */}
                {[...TESTIMONIALS, ...TESTIMONIALS].map((review, idx) => (
                    <Card key={idx} className="w-[350px] shrink-0 border-none shadow-sm hover:shadow-md transition-shadow bg-white inline-block whitespace-normal">
                        <CardContent className="p-6 h-full flex flex-col justify-between">
                            <div className="space-y-4">
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center space-x-3">
                                        <Avatar className="h-10 w-10 border border-gray-100">
                                            <AvatarImage src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${idx * 123}`} />
                                            <AvatarFallback>{review.name[0]}</AvatarFallback>
                                        </Avatar>
                                        <div>
                                            <p className="font-bold text-sm text-slate-800">{review.name}</p>
                                            <p className="text-xs text-blue-600 font-medium">{review.role}</p>
                                        </div>
                                    </div>
                                    <Quote className="w-5 h-5 text-gray-200 fill-gray-100" />
                                </div>

                                <p className="text-gray-600 text-sm leading-relaxed line-clamp-3">
                                    "{review.text}"
                                </p>
                            </div>

                            <div className="mt-4 flex text-yellow-400 gap-0.5">
                                {Array.from({ length: 5 }).map((_, i) => (
                                    <Star key={i} className="w-4 h-4 fill-current" />
                                ))}
                            </div>
                        </CardContent>
                    </Card>
                ))}
            </div>

            <style jsx>{`
                .animate-marquee {
                    animation: marquee 60s linear infinite;
                }
                .hover\\:pause:hover {
                    animation-play-state: paused;
                }
                @keyframes marquee {
                    0% { transform: translateX(0); }
                    100% { transform: translateX(-50%); }
                }
            `}</style>
        </div>
    );
}
