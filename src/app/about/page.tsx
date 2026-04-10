"use client";

import React from "react";
import { 
  BookOpen, 
  CheckCircle2, 
  ShieldCheck,
  School,
  FileText,
  Target,
  Globe,
  Database
} from "lucide-react";

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-white text-slate-900 font-sans selection:bg-slate-200 selection:text-slate-900 overflow-x-hidden">
      {/* Hero Section - Formal Narrative */}
      <section className="relative pt-32 pb-20 border-b border-slate-100">
        <div className="container mx-auto px-6 max-w-5xl">
          <div className="space-y-6 animate-fade-in">
            <p className="text-blue-700 font-bold tracking-widest text-sm uppercase">about 세특연구소</p>
            <h1 className="text-4xl lg:text-5xl font-extrabold tracking-tight text-slate-900 leading-[1.2]">
              데이터와 기술로 <br />
              교육의 본질적 가치를 회복합니다
            </h1>
            <p className="text-xl text-slate-600 max-w-3xl leading-relaxed">
              세특연구소는 정보의 비대칭으로 인해 발생하는 교육 격차를 해결하기 위해 <br className="hidden md:block" />
              대한민국 최고의 기술 인재들이 모여 설립한 에듀테크 스타트업입니다.
            </p>
          </div>
        </div>
      </section>

      {/* Vision & Mission */}
      <section className="py-24">
        <div className="container mx-auto px-6 max-w-5xl">
          <div className="grid md:grid-cols-2 gap-16">
            <div className="space-y-6">
              <div className="inline-flex p-3 rounded-xl bg-slate-50 border border-slate-100">
                <Target className="w-6 h-6 text-slate-700" />
              </div>
              <h2 className="text-2xl font-bold">우리의 미션</h2>
              <p className="text-slate-600 leading-relaxed">
                우리는 단순한 입시 보조 도구를 만들지 않습니다. 학생 스스로가 자신의 학업적 성취와 탐구 과정을 논리적으로 증명할 수 있도록 돕는 정교한 가이드라인을 제공합니다. 고액 컨설팅 시장의 문턱을 낮추어 보편적인 교육 혜택을 실현하는 것이 우리의 최우선 가치입니다.
              </p>
            </div>
            <div className="space-y-6">
              <div className="inline-flex p-3 rounded-xl bg-slate-50 border border-slate-100">
                <Globe className="w-6 h-6 text-slate-700" />
              </div>
              <h2 className="text-2xl font-bold">교육의 상향 평준화</h2>
              <p className="text-slate-600 leading-relaxed">
                컨설턴트의 개인적 역량에 의존하던 기존 방식에서 벗어나, 데이터 기반의 객관적인 분석 시스템을 구축했습니다. 이를 통해 지역적, 경제적 여건에 관계없이 누구나 최상위권 수준의 학술 탐구 지원을 받을 수 있는 환경을 조성합니다.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Social Value & Impact - Report Style */}
      <section className="py-24 bg-slate-50 border-y border-slate-100">
        <div className="container mx-auto px-6 max-w-5xl">
          <div className="mb-16">
            <h2 className="text-3xl font-extrabold mb-4 italic tracking-tight">Social Value & Impact</h2>
            <div className="w-12 h-1 bg-slate-900"></div>
            <p className="mt-6 text-slate-500 font-medium leading-relaxed max-w-2xl text-lg">
              우리는 기술이 소수의 전유물이 아닌, 모두를 위한 상향 평준화의 도구가 되어야 한다고 믿습니다.
            </p>
          </div>

          <div className="grid gap-8">
            <div className="bg-white p-8 rounded-2xl border border-slate-200 shadow-sm flex flex-col md:flex-row gap-8 items-start hover:border-blue-200 transition-colors">
              <div className="shrink-0 p-4 bg-blue-50 rounded-xl">
                <Target className="w-8 h-8 text-blue-700" />
              </div>
              <div className="space-y-4">
                <h3 className="text-xl font-bold">교육 기회의 평등 실현</h3>
                <p className="text-slate-600 leading-relaxed">
                  고액 입시 컨설팅 시장의 가격 거품을 제거합니다. 우리는 분석 프로세스를 시스템화하여 기존 시장 비용의 90% 이상을 절약함으로써, 경제적 여건에 관계없이 누구나 최상위권 수준의 탐구 지원을 받을 수 있는 환경을 조성합니다.
                </p>
              </div>
            </div>

            <div className="bg-white p-8 rounded-2xl border border-slate-200 shadow-sm flex flex-col md:flex-row gap-8 items-start hover:border-indigo-200 transition-colors">
              <div className="shrink-0 p-4 bg-indigo-50 rounded-xl">
                <Globe className="w-8 h-8 text-indigo-700" />
              </div>
              <div className="space-y-4">
                <h3 className="text-xl font-bold">정보 비대칭의 완전한 해소</h3>
                <p className="text-slate-600 leading-relaxed">
                  복잡한 입시 환경에서 발생하는 정보 격차를 기술로 극복합니다. AI 기반 데이터 분석을 통해 지역적 제한 없이 수도권 최상위권 수준의 정밀한 탐구 가이드라인을 보급하여 정보의 보편화를 실현합니다.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Leadership Section - People */}
      <section className="py-32">
        <div className="container mx-auto px-6 max-w-5xl">
          <div className="mb-20 text-center md:text-left">
            <h2 className="text-3xl font-extrabold mb-4 italic tracking-tight">Leadership</h2>
            <p className="text-slate-500 font-medium">최고의 전문성을 바탕으로 교육의 새로운 표준을 설계합니다.</p>
          </div>

          <div className="grid md:grid-cols-2 gap-16">
            {/* Founder 1: Kang Pil-joong */}
            <div className="space-y-8 animate-fade-in">
              <div className="space-y-2">
                <div className="text-xs font-black text-slate-400 uppercase tracking-[0.3em] pb-1">CTO</div>
                <h3 className="text-3xl font-black tracking-tighter text-slate-900">강필중</h3>
                <p className="text-slate-700 font-bold text-lg flex items-center gap-2">
                  <School className="w-5 h-5" />
                  서울대학교 인공지능대학원 학부연구생 (現)
                </p>
              </div>
              
              <div className="space-y-4">
                <ul className="space-y-3">
                  {[
                    "서울대학교 졸업 예정 (AI/컴퓨터공학 전공)",
                    "과학기술정보통신부 소프트웨어 마에스트로 연수 과정 수료",
                    "2025 국방 스타트업 챌린지 및 공군 창업경진대회 수상 (창의상)",
                    "기존 입시 분석 알고리즘 고도화 및 루브릭 평가 시스템 설계"
                  ].map((item, idx) => (
                    <li key={idx} className="flex items-start gap-3 text-sm text-slate-500 font-medium leading-snug">
                      <div className="w-1.5 h-1.5 rounded-full bg-slate-400 mt-1.5 shrink-0" />
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            {/* Founder 2: Ryuhanjun */}
            <div className="space-y-8 animate-fade-in" style={{ animationDelay: '0.2s' }}>
              <div className="space-y-2">
                <div className="text-xs font-black text-slate-400 uppercase tracking-[0.3em] pb-1">CEO</div>
                <h3 className="text-3xl font-black tracking-tighter text-slate-900">류한준</h3>
                <p className="text-slate-700 font-bold text-lg flex items-start gap-2 leading-tight">
                  <School className="w-5 h-5 shrink-0 mt-0.5" />
                  <span>서울대학교 차세대반도체소자연구실 학부연구생 (前)</span>
                </p>
              </div>

              <div className="space-y-4">
                <ul className="space-y-3">
                  {[
                    "서울대학교 전기정보공학부 학사",
                    "서울대학교 경영대학 전략마케팅 학회 SNEW 6기",
                    "오픈스카이(OpenSky) 스쿨 입시/학업 멘토 역임 및 활동 중",
                    "용인시 청년창업 지원사업 선정 및 'Voice Guard' 서비스 출시 및 운영",
                    "복합 시스템 설계 및 학술 보고서 데이터 구조 최적화"
                  ].map((item, idx) => (
                    <li key={idx} className="flex items-start gap-3 text-sm text-slate-500 font-medium leading-snug">
                      <div className="w-1.5 h-1.5 rounded-full bg-slate-400 mt-1.5 shrink-0" />
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer - Minimalist Sign-off */}
      <footer className="pt-20 pb-12 border-t border-slate-100 bg-slate-50">
        <div className="container mx-auto px-6 max-w-5xl">
          <div className="flex flex-col md:flex-row justify-between items-center gap-8">
            <div className="space-y-2 text-center md:text-left">
              <div className="font-black text-xl tracking-tighter">COLDBOOT</div>
              <p className="text-slate-400 text-sm">교육의 상향 평준화를 꿈꾸는 콜드부트 팀</p>
            </div>
            <div className="text-slate-400 text-sm">
              © 2026 COLDBOOT Team. All rights reserved.
            </div>
          </div>
        </div>
      </footer>

      <style jsx global>{`
        @keyframes fade-in {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-fade-in {
          animation: fade-in 1.2s cubic-bezier(0.16, 1, 0.3, 1) forwards;
        }
      `}</style>
    </div>
  );
}
