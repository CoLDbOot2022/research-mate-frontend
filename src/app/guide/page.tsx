"use client";

import React from "react";
import { 
  CreditCard, 
  Lightbulb, 
  PenTool, 
  SearchCheck, 
  FileDown, 
  ArrowRight,
  ChevronLeft
} from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import Image from "next/image";

const STEPS = [
  {
    title: "심화 탐구 주제 입력",
    description: "관심 과목과 단원을 선택하고, 본인의 진로 키워드와 난이도를 입력하여 탐구의 방향성을 설정합니다.",
    icon: <CreditCard className="w-8 h-8" />,
    color: "bg-blue-50 text-blue-600",
    ring: "ring-blue-100",
    mockupUrl: "/images/guide/step1.png"
  },
  {
    title: "실시간 주제 탐색 및 분석",
    description: "입력된 키워드를 바탕으로 AI가 교과 과정 연계성을 분석하고 최적의 탐구 후보군을 실시간으로 탐색합니다.",
    icon: <SearchCheck className="w-8 h-8" />,
    color: "bg-sky-50 text-sky-600",
    ring: "ring-sky-100",
    mockupUrl: "/images/guide/step2.png"
  },
  {
    title: "최적의 탐구 주제 추천",
    description: "분석된 후보 중 학생의 생활기록부 경쟁력을 가장 높여줄 수 있는 단 하나의 정밀 주제를 제안받습니다.",
    icon: <Lightbulb className="w-8 h-8" />,
    color: "bg-amber-50 text-amber-600",
    ring: "ring-amber-100",
    mockupUrl: "/images/guide/step3.png"
  },
  {
    title: "AI 보고서 초안 생성",
    description: "선정된 주제에 대해 Dual AI 시스템이 논리적인 구조와 학술적인 근거를 갖춘 고품질 초안을 생성합니다.",
    icon: <PenTool className="w-8 h-8" />,
    color: "bg-indigo-50 text-indigo-600",
    ring: "ring-indigo-100",
    mockupUrl: "/images/guide/step4.png"
  },
  {
    title: "전문 멘토 정밀 검수",
    description: "명문대 출신 전공 멘토가 보고서의 논리를 점검하고, 문장 단위의 세밀한 피드백과 첨삭을 제공합니다.",
    icon: <SearchCheck className="w-8 h-8" />,
    color: "bg-emerald-50 text-emerald-600",
    ring: "ring-emerald-100",
    isPremium: true,
    mockupUrl: "/images/guide/step5.png"
  },
  {
    title: "기록 페이지 및 파일 관리",
    description: "완성된 보고서를 확인하고 저장하거나, 생성된 모든 기록을 전용 페이지에서 안전하게 관리하고 삭제할 수 있습니다.",
    icon: <FileDown className="w-8 h-8" />,
    color: "bg-slate-50 text-slate-600",
    ring: "ring-slate-100",
    mockupUrl: "/images/guide/step6.png"
  }
];


export default function GuidePage() {
  return (
    <div className="min-h-screen bg-[#fdfdff] py-20 px-4">
      <div className="max-w-4xl mx-auto space-y-16">
        
        {/* Navigation & Header */}
        <div className="space-y-8">
          <Link href="/mentors" className="inline-flex items-center gap-2 text-slate-400 hover:text-indigo-600 font-bold transition-colors group">
            <ChevronLeft className="w-5 h-5 transition-transform group-hover:-translate-x-1" />
            멘토진 페이지로 돌아가기
          </Link>
          
          <div className="space-y-4">
            <h1 className="text-4xl font-black tracking-tight text-slate-900">
              세특연구소 이용 가이드
            </h1>
            <p className="text-lg text-slate-500 font-medium leading-relaxed max-w-2xl">
              실구매 전 서비스 이용 흐름을 확인하세요. <br />
              복잡한 탐구 보고서 작성을 기술과 데이터로 쉽고 정밀하게 도와드립니다.
            </p>
          </div>
        </div>

        {/* Pricing Table Section */}
        <section className="pt-8 pb-12">
          <div className="text-center space-y-4 mb-16">
            <h2 className="text-3xl font-black tracking-tight text-slate-900">
              함께 선택하는 합리적인 요금제
            </h2>
            <p className="text-slate-500 font-bold max-w-lg mx-auto leading-relaxed">
              탐구 보고서 가이드부터 멘토링까지, <br />
              본인에게 꼭 필요한 서비스를 선택해보세요.
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-8 max-w-5xl mx-auto">
            {/* Basic Plan */}
            <div className="relative group overflow-hidden bg-white rounded-[2.5rem] border border-slate-200 p-10 shadow-sm transition-all hover:shadow-xl hover:-translate-y-1 flex flex-col h-full">
              <div className="space-y-6">
                <div className="flex justify-between items-start">
                  <div>
                    <h4 className="text-xl font-black text-slate-900 mb-1">기본 요금제 (3회권)</h4>
                    <p className="text-slate-400 text-sm font-bold">심화 탐구 보고서 생성 3회</p>
                  </div>
                  <span className="bg-slate-100 text-slate-600 text-[10px] font-black px-3 py-1.5 rounded-full ring-1 ring-slate-200">
                    입문용
                  </span>
                </div>

                <div className="flex items-baseline gap-2">
                  <span className="text-4xl font-black text-slate-900">19,000원</span>
                  <span className="text-slate-400 text-sm line-through">49,000원</span>
                </div>

                <div className="space-y-3 pt-4">
                  {[
                    "심화 탐구 보고서 생성 3회",
                    "입금 확인 후 24시간 내 이용 가능",
                    "보유 이용권 유효기간 1년 (365일)",
                    "입금 내역 마이페이지에서 확인 가능"
                  ].map((item, i) => (
                    <div key={i} className="flex gap-3 text-sm text-slate-700 font-bold">
                      <div className="w-5 h-5 rounded-full bg-slate-50 flex items-center justify-center shrink-0">
                        <ArrowRight className="w-3 h-3 text-slate-400" />
                      </div>
                      {item}
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Premium Plan */}
            <div className="relative group overflow-hidden bg-white rounded-[2.5rem] border-2 border-indigo-100 p-10 shadow-indigo-100 shadow-lg transition-all hover:shadow-2xl hover:shadow-indigo-100 hover:-translate-y-1 flex flex-col h-full">
              <div className="absolute top-0 right-0 px-6 py-2 bg-indigo-600 text-white text-[11px] font-black rounded-bl-3xl">
                MOST POPULAR
              </div>
              <div className="space-y-6">
                <div className="flex justify-between items-start">
                  <div>
                    <h4 className="text-xl font-black text-indigo-600 mb-1">프리미엄 검수 요금제 (3회권)</h4>
                    <p className="text-indigo-400 text-sm font-bold">프리미엄 검수 및 피드백 포함</p>
                  </div>
                  <span className="bg-indigo-50 text-indigo-600 text-[10px] font-black px-3 py-1.5 rounded-full ring-1 ring-indigo-100">
                    추천
                  </span>
                </div>

                <div className="flex items-baseline gap-2">
                  <span className="text-4xl font-black text-slate-900">59,000원</span>
                  <span className="text-slate-400 text-sm line-through">159,000원</span>
                </div>

                <div className="space-y-3 pt-4">
                  {[
                    "심화 탐구 보고서 생성 및 명문대 멘토의 검수 피드백 3회",
                    "입금 확인 후 24시간 내 이용 가능",
                    "보유 이용권 유효기간 1년 (365일)",
                    "입금 내역 마이페이지에서 확인 가능"
                  ].map((item, i) => (
                    <div key={i} className="flex gap-3 text-sm text-slate-700 font-bold">
                      <div className="w-5 h-5 rounded-full bg-indigo-50 flex items-center justify-center shrink-0">
                        <ArrowRight className="w-3 h-3 text-indigo-500" />
                      </div>
                      {item}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </section>

        <div className="border-t border-slate-100 w-full" />

        {/* Vertical Steps Section */}
        <div className="relative space-y-12">
          <div className="text-center space-y-4 mb-12">
            <h2 className="text-3xl font-black tracking-tight text-slate-900">
              세특연구소 서비스 이용 흐름
            </h2>
          </div>
          {/* Connector Line */}
          <div className="absolute left-[44px] top-32 bottom-8 w-1 bg-slate-100 rounded-full hidden md:block" />

          {STEPS.map((step, idx) => (
            <div key={idx} className="relative flex flex-col md:flex-row gap-8 group animate-fade-in" style={{ animationDelay: `${idx * 0.1}s` }}>
              {/* Icon Container */}
              <div className={`relative z-10 w-22 h-22 md:w-24 md:h-24 shrink-0 rounded-[2.5rem] ${step.color} ${step.ring} ring-8 flex items-center justify-center shadow-sm transition-transform group-hover:scale-105`}>
                {step.icon}
                <div className="absolute -top-2 -right-2 w-8 h-8 bg-white border-2 border-slate-100 rounded-full flex items-center justify-center text-xs font-black text-slate-400 shadow-sm">
                  {idx + 1}
                </div>
              </div>

              {/* Content Container */}
              <div className="flex-1 space-y-6 pt-2">
                <div className="space-y-3">
                  <div className="flex items-center gap-3">
                    <h3 className="text-2xl font-black text-slate-900 tracking-tight">
                      {step.title}
                    </h3>
                    {step.isPremium && (
                      <span className="text-[10px] font-black text-indigo-600 bg-indigo-50 px-2.5 py-1 rounded-lg uppercase tracking-wider ring-1 ring-indigo-100">
                        PREMIUM ONLY
                      </span>
                    )}
                  </div>
                  <p className="text-slate-600 leading-relaxed font-bold text-lg">
                    {step.description}
                  </p>
                </div>

                {/* Mockup Display */}
                {step.mockupUrl && (
                  <div className="relative">
                    <div className="relative w-full max-w-2xl overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm transition-all hover:shadow-md">
                      <Image
                        src={step.mockupUrl}
                        alt={`${step.title} mockup`}
                        width={1200}
                        height={800}
                        className="w-full h-auto object-contain"
                      />
                    </div>
                  </div>
                )}

                
                {idx < STEPS.length - 1 && (
                  <div className="pt-4 md:hidden">
                    <ArrowRight className="w-6 h-6 text-slate-200 mx-auto rotate-90" />
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>



      </div>

      <style jsx global>{`
        @keyframes fade-in {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-fade-in {
          animation: fade-in 0.8s cubic-bezier(0.16, 1, 0.3, 1) forwards;
          opacity: 0;
        }
      `}</style>
    </div>
  );
}
