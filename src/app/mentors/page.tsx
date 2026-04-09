"use client";

import { useEffect, useState } from "react";
import { CheckCircle2, Mail, ExternalLink, Award } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

type Mentor = {
  name: string;
  hanja?: string;
  role: string;
  title: string;
  highlights: string[];
  image: string;
};

const MENTORS: Mentor[] = [
  {
    name: "강필중",
    hanja: "姜必中",
    role: "AI 원천기술 및 보고서 평가 로직 설계",
    title: "서울대학교 인공지능대학원 학부연구생 (現)",
    highlights: [
      "서울대학교 졸업 예정 (AI/컴퓨터공학 전공)",
      "생성형 AI 기반 교육 보조 엔진 핵심 알고리즘 개발",
      "학생 맞춤형 주제 추천 및 루브릭 평가 시스템 설계"
    ],
    image: "/mentors/kpj.png"
  },
  {
    name: "류한준",
    hanja: "柳韓俊",
    role: "메모리 반도체 및 HW/SW 시스템 최적화",
    title: "서울대학교 반도체시스템공학 학부연구생 (前)",
    highlights: [
      "서울대학교 전기정보공학부 학사",
      "서울대학교 경영대학 전략마케팅 학회 SNEW 6기",
      "복합 시스템 설계 및 학술 보고서 데이터 구조 최적화"
    ],
    image: "/mentors/rhj.png"
  }
];

export default function MentorsPage() {
  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top_right,_rgba(99,102,241,0.08),_transparent_25%),_radial-gradient(circle_at_bottom_left,_rgba(59,130,246,0.08),_transparent_25%),_#fdfdff] py-16 px-4">
      <div className="max-w-5xl mx-auto space-y-16">
        
        {/* Header Section */}
        <div className="text-center space-y-4">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-50 text-indigo-600 border border-indigo-100 mb-2">
            <Award className="w-4 h-4" />
            <span className="text-xs font-bold uppercase tracking-wider">Academic Mentors</span>
          </div>
          <h1 className="text-4xl md:text-5xl font-black tracking-tight text-slate-900">
            전문가와 함께하는<br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-blue-500">프리미엄 리서치 케어</span>
          </h1>
          <p className="max-w-2xl mx-auto text-slate-600 text-lg leading-relaxed">
            서울대학교 연구진들이 직접 설계한 보고서 생성 엔진과 루브릭 평가를 통해,<br className="hidden md:block" />
            단순한 생성 AI를 넘어 학술적 깊이가 있는 탐구를 돕습니다.
          </p>
        </div>

        {/* Mentors Grid */}
        <div className="grid md:grid-cols-2 gap-8">
          {MENTORS.map((mentor) => (
            <Card key={mentor.name} className="group relative overflow-hidden border-slate-200/60 bg-white/70 backdrop-blur-sm transition-all hover:shadow-xl hover:-translate-y-1 rounded-[2.5rem]">
              <div className="absolute top-0 right-0 p-8 opacity-[0.03] group-hover:scale-110 transition-transform">
                <Award className="w-40 h-40 text-slate-900" />
              </div>
              
              <CardContent className="p-8 md:p-10">
                <div className="flex flex-col md:flex-row gap-8 items-start md:items-center">
                  {/* Avatar Placeholder */}
                  <div className="w-24 h-24 rounded-3xl bg-gradient-to-br from-slate-100 to-slate-200 border border-slate-200 flex items-center justify-center shrink-0 shadow-inner group-hover:from-indigo-50 group-hover:to-blue-50 transition-colors">
                    <span className="text-2xl font-black text-slate-400 group-hover:text-indigo-600 transition-colors">
                      {mentor.name[0]}
                    </span>
                  </div>

                  <div className="space-y-2">
                    <div className="flex items-center gap-3">
                      <h3 className="text-2xl font-black text-slate-900">{mentor.name}</h3>
                      {mentor.hanja && <span className="text-sm font-medium text-slate-400">{mentor.hanja}</span>}
                    </div>
                    <p className="text-sm font-bold text-indigo-600 bg-indigo-50 inline-block px-3 py-1 rounded-lg">
                      {mentor.title}
                    </p>
                  </div>
                </div>

                <div className="mt-8 space-y-6">
                  <div className="space-y-3">
                    <p className="text-xs font-black uppercase tracking-widest text-slate-400">Core Expertise</p>
                    <p className="text-slate-700 font-bold leading-relaxed">
                      {mentor.role}
                    </p>
                  </div>

                  <div className="space-y-4">
                    <p className="text-xs font-black uppercase tracking-widest text-slate-400">Academic Background</p>
                    <div className="grid gap-3">
                      {mentor.highlights.map((h, idx) => (
                        <div key={idx} className="flex gap-3 items-start group/item">
                          <div className="mt-1 rounded-full bg-emerald-50 p-1 text-emerald-600 group-hover/item:bg-emerald-100 transition-colors">
                            <CheckCircle2 className="w-3 h-3" />
                          </div>
                          <p className="text-sm text-slate-600 font-medium leading-relaxed">{h}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="mt-10 pt-8 border-t border-slate-100 flex items-center justify-between">
                   <button className="flex items-center gap-2 text-xs font-bold text-slate-400 hover:text-indigo-600 transition-colors">
                     <Mail className="w-3.5 h-3.5" />
                     Contact Mentor
                   </button>
                   <button className="flex items-center gap-2 text-xs font-bold text-slate-400 hover:text-indigo-600 transition-colors uppercase tracking-widest">
                     Details
                     <ExternalLink className="w-3.5 h-3.5" />
                   </button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Bottom CTA */}
        <div className="rounded-[3rem] bg-slate-900 p-10 md:p-14 text-center text-white relative overflow-hidden shadow-2xl">
          <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_50%_0%,_rgba(59,130,246,0.3),_transparent_70%)]" />
          <div className="relative z-10 space-y-6">
            <h2 className="text-2xl md:text-3xl font-black tracking-tight">
              더 깊이 있는 심화 탐구가 필요한가요?
            </h2>
            <p className="text-slate-400 text-sm md:text-base max-w-xl mx-auto leading-relaxed">
              프리미엄 요금제를 이용하시면 서울대 멘토들이 설계한 심화 루브릭 평가와 전용 AI 교정 에이전트의 밀착 가이드를 받으실 수 있습니다.
            </p>
            <div className="pt-4">
              <button className="bg-white text-slate-900 font-bold px-8 py-3 rounded-2xl hover:bg-slate-100 transition-all hover:scale-105">
                프리미엄 서비스 알아보기
              </button>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
