"use client";

import React from 'react';
import { Badge } from '@/components/ui/badge';
import { Download, CheckCircle2, Microscope, GraduationCap } from 'lucide-react';
import { motion } from 'framer-motion';

export function ReportPreviewDemo() {
    return (
        <div className="relative w-full max-w-4xl mx-auto" style={{ perspective: '1000px' }}>
            {/* Background Decor */}
            <div className="absolute inset-0 bg-blue-100/50 rounded-3xl blur-3xl -z-10 transform scale-110" />

            {/* Main Document Container - Tilted Effect */}
            <motion.div
                className="relative bg-white rounded-xl shadow-2xl border border-slate-200 overflow-hidden"
                initial={{ rotateX: 2 }}
                whileHover={{ rotateX: 0 }}
                transition={{ duration: 0.5 }}
                viewport={{ once: true }}
            >
                {/* Header / Toolbar */}
                <div className="h-12 bg-slate-50 border-b border-slate-100 flex items-center justify-between px-4">
                    <div className="flex items-center space-x-2">
                        <div className="w-3 h-3 rounded-full bg-red-400" />
                        <div className="w-3 h-3 rounded-full bg-yellow-400" />
                        <div className="w-3 h-3 rounded-full bg-green-400" />
                        <span className="text-xs text-slate-400 font-medium ml-2">Final_Report_Preview.pdf</span>
                    </div>
                    <div className="flex items-center space-x-2">
                        <Badge variant="outline" className="bg-blue-50 text-blue-600 border-blue-200 gap-1 text-[10px]">
                            <CheckCircle2 className="w-3 h-3" />
                            Verified
                        </Badge>
                        <Download className="w-4 h-4 text-slate-400" />
                    </div>
                </div>

                {/* Document Content */}
                <div className="p-8 md:p-12 min-h-[600px] font-serif text-slate-800 relative bg-white overflow-hidden">
                    <div className="max-w-3xl mx-auto space-y-8">
                        {/* Report Header */}
                        <div className="text-center border-b pb-6 mb-8">
                            <div className="flex justify-center mb-4">
                                <Badge variant="secondary" className="bg-slate-100 text-slate-600">수학·과학 융합 탐구</Badge>
                            </div>
                            <h1 className="text-2xl md:text-3xl font-bold mb-3 text-slate-900 leading-tight">
                                <span className="text-blue-700">미분방정식</span>을 활용한 감염병 확산(SIR) 모델 분석과<br />
                                집단 면역 임계점(<span className="italic">H_c</span>)의 수학적 도출
                            </h1>
                            <p className="text-slate-500 italic text-[10px] md:text-xs">Mathematical Analysis of SIR Epidemic Model using Differential Equations</p>
                            <div className="flex justify-center gap-4 mt-6 text-xs text-slate-600 font-sans font-medium">
                                <span>2학년 김수학</span>
                                <span className="text-slate-300">|</span>
                                <span>관련 교과: 미적분, 생명과학 I</span>
                            </div>
                        </div>

                        {/* Report Sections */}
                        <div className="space-y-8 text-xs md:text-sm leading-relaxed text-justify">
                            <section>
                                <h2 className="text-sm md:text-base font-bold text-slate-800 border-l-4 border-slate-800 pl-3 mb-3">1. 탐구 동기 및 교과 연계성</h2>
                                <p className="text-slate-600">
                                    <span className="font-bold text-blue-700">'미적분'</span> 시간에 배운 <span className="bg-yellow-100 px-1 font-bold text-slate-800">순간변화율(도함수)</span>의 개념이 실제 자연 현상의 변화를 설명하는 데 어떻게 쓰이는지 궁금했다. 생명과학 원리를 수학적으로 증명해보고자 한다.
                                </p>
                            </section>

                            <section>
                                <h2 className="text-sm md:text-base font-bold text-blue-700 border-l-4 border-blue-600 pl-3 mb-4">2. 이론적 배경 (SIR 모델링)</h2>
                                <div className="bg-slate-50 p-6 rounded-lg border border-slate-200 my-4 shadow-sm">
                                    <div className="flex flex-col gap-4 font-serif text-slate-800 text-center">
                                        <div className="flex items-center justify-center gap-2">
                                            <div className="flex flex-col items-center">
                                                <span className="border-b border-slate-800 text-[10px]">dS</span>
                                                <span className="text-[10px]">dt</span>
                                            </div>
                                            <span>=</span>
                                            <span>−</span>
                                            <div className="flex flex-col items-center">
                                                <span className="border-b border-slate-800 text-[10px]">βSI</span>
                                                <span className="text-[10px]">N</span>
                                            </div>
                                        </div>
                                        <div className="flex items-center justify-center gap-2">
                                            <div className="flex flex-col items-center">
                                                <span className="border-b border-slate-800 text-[10px]">dI</span>
                                                <span className="text-[10px]">dt</span>
                                            </div>
                                            <span>=</span>
                                            <div className="flex flex-col items-center border-b border-slate-800 text-[10px]">βSI/N</div>
                                            <span>−</span>
                                            <span className="text-[10px]">γI</span>
                                        </div>
                                    </div>
                                    <p className="text-[9px] text-slate-500 mt-4 text-center border-t pt-2 font-sans">
                                        (Eq. 1-2) SIR Mathematical Model
                                    </p>
                                </div>
                            </section>

                            <section>
                                <h2 className="text-sm md:text-base font-bold text-blue-700 border-l-4 border-blue-600 pl-3 mb-4">3. 시뮬레이션 결과</h2>
                                <div className="bg-white p-4 rounded-lg border border-slate-100 shadow-sm">
                                    <svg viewBox="0 0 200 80" className="w-full h-40">
                                        <line x1="20" y1="70" x2="190" y2="70" stroke="#cbd5e1" strokeWidth="0.5" />
                                        <line x1="20" y1="10" x2="20" y2="70" stroke="#cbd5e1" strokeWidth="0.5" />
                                        <path d="M20,15 C60,15 80,65 190,68" fill="none" stroke="#3b82f6" strokeWidth="2" />
                                        <path d="M20,68 C50,65 70,20 100,20 C130,20 150,65 190,68" fill="none" stroke="#ef4444" strokeWidth="2" />
                                        <path d="M20,68 C80,68 100,50 190,25" fill="none" stroke="#22c55e" strokeWidth="2" />
                                    </svg>
                                </div>
                            </section>
                        </div>
                    </div>

                    {/* Bottom Fade Out Effect to imply multi-page */}
                    <div className="absolute bottom-0 left-0 right-0 h-40 bg-gradient-to-t from-white via-white/80 to-transparent pointer-events-none" />
                </div>
            </motion.div>

            {/* Floating Badge */}
            <div className="absolute -right-4 top-20 bg-gradient-to-br from-indigo-500 to-purple-600 text-white p-4 rounded-xl shadow-xl hidden md:block z-20">
                <div className="text-center">
                    <p className="text-[10px] font-semibold opacity-80">Subject Link</p>
                    <p className="text-base font-bold">Perfect</p>
                </div>
            </div>
        </div>
    );
}
