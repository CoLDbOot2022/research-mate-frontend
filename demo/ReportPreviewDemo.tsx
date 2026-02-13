"use client";

import React from 'react';
import { Badge } from '@/components/ui/badge';
import { FileText, Download, CheckCircle2 } from 'lucide-react';

export function ReportPreviewDemo() {
    return (
        <div className="relative w-full max-w-4xl mx-auto perspective-1000">
            {/* Background Decor */}
            <div className="absolute inset-0 bg-blue-100/50 rounded-3xl blur-3xl -z-10 transform scale-110" />

            {/* Main Document Container - Tilted Effect */}
            <div className="relative bg-white rounded-xl shadow-2xl border border-slate-200 overflow-hidden transform md:rotate-x-2 transition-transform duration-500 hover:rotate-0">

                {/* Header / Toolbar */}
                <div className="h-12 bg-slate-50 border-b border-slate-100 flex items-center justify-between px-4">
                    <div className="flex items-center space-x-2">
                        <div className="w-3 h-3 rounded-full bg-red-400" />
                        <div className="w-3 h-3 rounded-full bg-yellow-400" />
                        <div className="w-3 h-3 rounded-full bg-green-400" />
                        <span className="text-xs text-slate-400 font-medium ml-2">Final_Report_Preview.pdf</span>
                    </div>
                    <div className="flex items-center space-x-2">
                        <Badge variant="outline" className="bg-blue-50 text-blue-600 border-blue-200 gap-1">
                            <CheckCircle2 className="w-3 h-3" />
                            Verified
                        </Badge>
                        <Download className="w-4 h-4 text-slate-400" />
                    </div>
                </div>

                {/* Document Content */}
                <div className="p-8 md:p-12 min-h-[600px] font-serif text-slate-800 relative bg-white">
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
                            <p className="text-slate-500 italic text-sm">Mathematical Analysis of SIR Epidemic Model using Differential Equations</p>
                            <div className="flex justify-center gap-4 mt-6 text-sm text-slate-600 font-sans font-medium">
                                <span>2학년 김수학</span>
                                <span className="text-slate-300">|</span>
                                <span>관련 교과: 미적분(도함수), 생명과학 I(방어 작용)</span>
                            </div>
                        </div>

                        {/* Report Sections */}
                        <div className="space-y-8 text-sm md:text-base leading-relaxed text-justify">

                            {/* Intro: Explicit Curriculum Link */}
                            <section>
                                <h2 className="text-lg font-bold text-slate-800 border-l-4 border-slate-800 pl-3 mb-3">1. 탐구 동기 및 교과 연계성</h2>
                                <p className="text-slate-600 text-sm">
                                    <span className="font-bold text-blue-700">'미적분'</span> 시간에 배운 <span className="bg-yellow-100 px-1 font-bold text-slate-800">순간변화율(도함수)</span>의 개념이 실제 자연 현상의 변화를 설명하는 데 어떻게 쓰이는지 궁금했다.
                                    특히 <span className="font-bold text-blue-700">'생명과학 I'</span>의 방어 작용 단원에서 배운 집단 면역의 원리를, 감염자 수의 시간적 변화율(<span className="font-serif italic">dI/dt</span>)을 이용해 수학적으로 증명해보고자 한다.
                                </p>
                            </section>

                            {/* Deep Theory: SIR Equations */}
                            <section>
                                <h2 className="text-lg font-bold text-blue-700 border-l-4 border-blue-600 pl-3 mb-4">2. 이론적 배경 (SIR 모델링)</h2>

                                <h3 className="text-sm font-bold text-slate-900 mb-2">2.1. 모델 설계 및 변수 설정</h3>
                                <p className="text-slate-700 mb-4">
                                    Kermack-McKendrick 모델을 기반으로, 전체 인구 <span className="font-serif italic">N</span>을 다음 세 집단으로 분류하였다. 외부 유입이나 출생/사망이 없는 닫힌 계(Closed System)를 가정한다.
                                </p>
                                <ul className="list-disc list-inside text-slate-600 ml-2 mb-4 space-y-1 text-sm">
                                    <li><strong className="text-slate-800">S(t)</strong>: Susceptible (감염 가능군) - 아직 병에 걸리지 않은 집단</li>
                                    <li><strong className="text-slate-800">I(t)</strong>: Infected (감염자군) - 현재 감염되어 전파 가능한 집단</li>
                                    <li><strong className="text-slate-800">R(t)</strong>: Recovered (회복군) - 회복하여 면역을 획득한 집단</li>
                                </ul>

                                <h3 className="text-sm font-bold text-slate-900 mb-2">2.2. 미분방정식의 유도</h3>
                                <div className="bg-slate-50 p-6 rounded-lg border border-slate-200 my-4 shadow-sm">
                                    <div className="flex flex-col gap-4 font-serif text-slate-800 text-center">
                                        {/* Eq 1 */}
                                        <div className="flex items-center justify-center gap-2">
                                            <div className="flex flex-col items-center">
                                                <span className="border-b border-slate-800 text-xs">d<span className="italic">S</span></span>
                                                <span className="text-xs">d<span className="italic">t</span></span>
                                            </div>
                                            <span>=</span>
                                            <span>−</span>
                                            <div className="flex flex-col items-center">
                                                <span className="border-b border-slate-800 text-xs"><span className="italic">βSI</span></span>
                                                <span className="text-xs"><span className="italic">N</span></span>
                                            </div>
                                        </div>
                                        {/* Eq 2 */}
                                        <div className="flex items-center justify-center gap-2">
                                            <div className="flex flex-col items-center">
                                                <span className="border-b border-slate-800 text-xs">d<span className="italic">I</span></span>
                                                <span className="text-xs">d<span className="italic">t</span></span>
                                            </div>
                                            <span>=</span>
                                            <div className="flex flex-col items-center">
                                                <span className="border-b border-slate-800 text-xs"><span className="italic">βSI</span></span>
                                                <span className="text-xs"><span className="italic">N</span></span>
                                            </div>
                                            <span>−</span>
                                            <span><span className="italic">γI</span></span>
                                        </div>
                                        {/* Eq 3 */}
                                        <div className="flex items-center justify-center gap-2">
                                            <div className="flex flex-col items-center">
                                                <span className="border-b border-slate-800 text-xs">d<span className="italic">R</span></span>
                                                <span className="text-xs">d<span className="italic">t</span></span>
                                            </div>
                                            <span>=</span>
                                            <span><span className="italic">γI</span></span>
                                        </div>
                                    </div>
                                    <p className="text-xs text-slate-500 mt-4 text-center border-t pt-2 font-sans">
                                        (Eq. 1-3) SIR Mathematical Model
                                    </p>
                                </div>
                                <p className="text-slate-700 mb-4">
                                    여기서 <span className="font-serif italic">β</span>는 감염률(Transmission rate), <span className="font-serif italic">γ</span>는 회복률(Recovery rate)을 의미한다.
                                    감염 가능군 <span className="font-serif italic">S</span>는 감염자와의 접촉에 비례하여 감소하므로 식 (1)과 같이 음의 변화율을 갖는다.
                                </p>

                                <h3 className="text-sm font-bold text-slate-900 mb-2">2.3. 기초감염재생산지수(<span className="font-serif italic">R<sub>0</sub></span>)와 임계점 분석</h3>
                                <p className="text-slate-700">
                                    감염병이 유행(Epidemic)하기 위한 조건은 감염자 수가 증가하는 시점, 즉 <span className="font-serif italic">dI/dt &gt; 0</span> 인 경우이다.
                                    식 (2)를 변형하면 다음과 같다.
                                </p>
                                <div className="bg-blue-50/50 p-4 rounded border border-blue-100 my-3 font-serif text-center text-sm text-blue-900">
                                    <span className="italic">I</span> ( <span className="italic">βS/N</span> − <span className="italic">γ</span> ) &gt; 0
                                    <span className="mx-2">⇒</span>
                                    <span className="font-bold"><span className="italic">S/N</span> &gt; <span className="italic">γ/β</span> = 1/<span className="italic">R<sub>0</sub></span></span>
                                </div>
                                <p className="text-slate-700">
                                    따라서 초기 감염 가능 인구 비율(<span className="font-serif italic">S/N</span>)이 <span className="font-serif italic">1/R<sub>0</sub></span> 보다 작다면 감염병은 확산되지 않고 소멸한다.
                                    이는 백신 접종을 통해 <span className="font-serif italic">S</span>를 줄임으로써 집단 면역을 달성할 수 있음을 수학적으로 시사한다.
                                </p>
                            </section>

                            {/* Results: Visualization */}
                            <section>
                                <h2 className="text-lg font-bold text-blue-700 border-l-4 border-blue-600 pl-3 mb-4">3. 시뮬레이션 결과</h2>
                                <p className="text-slate-700 mb-6">
                                    Python의 SciPy 라이브러리(odeint)를 이용하여 $R_0=2.5$ (인플루엔자 수준)일 때의 양상을 수치미분으로 시뮬레이션하였다.
                                </p>

                                <div className="bg-white p-4 rounded-lg border border-slate-200 shadow-sm">
                                    <p className="text-[11px] text-center text-slate-500 mb-4 font-bold">Figure 1. Time-Series Analysis of S-I-R Groups</p>
                                    <svg viewBox="0 0 200 80" className="w-full h-40">
                                        {/* Axis */}
                                        <line x1="20" y1="70" x2="190" y2="70" stroke="#cbd5e1" strokeWidth="0.5" />
                                        <line x1="20" y1="10" x2="20" y2="70" stroke="#cbd5e1" strokeWidth="0.5" />

                                        {/* S Curve (Susceptible - Drops) */}
                                        <path d="M20,15 C60,15 80,65 190,68" fill="none" stroke="#3b82f6" strokeWidth="2" />
                                        <text x="25" y="25" fontSize="6" fill="#3b82f6" fontWeight="bold">S</text>

                                        {/* I Curve (Infected - Peaks and drops) */}
                                        <path d="M20,68 C50,65 70,20 100,20 C130,20 150,65 190,68" fill="none" stroke="#ef4444" strokeWidth="2" />
                                        <text x="100" y="15" fontSize="6" fill="#ef4444" fontWeight="bold">I (Peak)</text>

                                        {/* R Curve (Recovered - Rises) */}
                                        <path d="M20,68 C80,68 100,50 190,25" fill="none" stroke="#22c55e" strokeWidth="2" />
                                        <text x="180" y="20" fontSize="6" fill="#22c55e" fontWeight="bold">R</text>

                                        {/* Labels */}
                                        <text x="105" y="76" fontSize="5" textAnchor="middle" fill="#64748b">Time (days)</text>
                                        <text x="10" y="40" fontSize="5" textAnchor="middle" fill="#64748b" transform="rotate(-90, 10, 40)">Population</text>
                                    </svg>
                                </div>
                            </section>

                            {/* Cut-off Visual */}
                            <div className="pt-4 opacity-50">
                                <h2 className="text-lg font-bold text-slate-800 border-l-4 border-slate-800 pl-3 mb-3">4. 결론 및 제언</h2>
                                <p className="text-slate-700">
                                    본 시뮬레이션을 통해 초기 감염자 수보다 $R_0$ 값이 전체 확산 양상에 더 지배적인 영향을 미침을...
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Bottom Fade Out Effect to imply multi-page */}
                    <div className="absolute bottom-0 left-0 right-0 h-40 bg-gradient-to-t from-white via-white/80 to-transparent pointer-events-none" />
                </div>
            </div>

            {/* Floating Badge moved slightly */}
            <div className="absolute -right-4 top-20 bg-gradient-to-br from-indigo-500 to-purple-600 text-white p-4 rounded-xl shadow-xl animate-bounce duration-1000 hidden md:block">
                <div className="text-center">
                    <p className="text-xs font-semibold opacity-80">Subject Link</p>
                    <p className="text-lg font-bold">Perfect</p>
                </div>
            </div>

        </div>
    );
}
