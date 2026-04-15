"use client";

import { useEffect, useState } from "react";
import { CheckCircle2, Mail, ExternalLink, Award } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

import { track } from "@/lib/analytics";

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
    name: "류한준",
    role: "CEO",
    title: "서울대학교 조선해양공학 / 인공지능반도체공학",
    highlights: [
      "서울대 벤처경영학부 전략마케팅 학회 SNEW 6기",
      "오픈스카이(OpenSky) 입시/학업 멘토 역임",
      "서울대학교 차세대 반도체 소자 연구실 전 학부연구생"
    ],
    image: ""
  },
  {
    name: "강필중",
    role: "CTO",
    title: "고려대학교 스마트보안학부",
    highlights: [
      "과학기술정보통신부 SW 마에스트로 수료",
      "국방 스타트업 챌린지 수상 (창의상)",
      "서울대학교 인공지능 대학원 현 학부연구생"
    ],
    image: ""
  }
];

export default function MentorsPage() {
  useEffect(() => { track.mentorsPageViewed(); }, []);

  return (
    <div className="min-h-screen bg-[#fdfdff] py-16 px-4">
      <div className="max-w-6xl mx-auto space-y-12">
        
        {/* Header Section */}
        <div className="text-center space-y-4 max-w-2xl mx-auto">
          <h1 className="text-3xl font-black tracking-tight text-slate-900 uppercase">
            Our Academic Mentors
          </h1>
          <div className="w-12 h-1 bg-indigo-600 mx-auto rounded-full" />
          <p className="text-slate-500 text-sm font-medium leading-relaxed">
            세특연구소는 데이터와 기술을 넘어, 각 분야 최고 전문가들의 검수를 통해 학술적 깊이와 논리적 완성도를 보장합니다.
          </p>
        </div>

        {/* Launch Phase Notice - Simplified and Smaller */}
        <div className="text-center">
          <p className="inline-block px-4 py-1.5 bg-indigo-50 text-indigo-600 text-[11px] font-bold rounded-full ring-1 ring-indigo-100/50">
            현재 런칭 단계로 대표 멘토진이 직접 검수합니다
          </p>
        </div>

        {/* Mentors Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {MENTORS.map((mentor) => (
            <Card key={mentor.name} className="group overflow-hidden border-slate-200/60 bg-white transition-all hover:shadow-md hover:-translate-y-1 rounded-[2.5rem]">
              <CardContent className="p-8">
                <div className="flex flex-col md:flex-row gap-8 items-start md:items-center">
                  {/* Avatar Section */}
                  <div className="w-24 h-24 rounded-3xl bg-slate-50 border border-slate-100 flex items-center justify-center shrink-0 shadow-sm group-hover:bg-indigo-50 transition-colors">
                    <span className="text-3xl font-black text-slate-300 group-hover:text-indigo-600 transition-colors">
                      {mentor.name[0]}
                    </span>
                  </div>
  
                  <div className="space-y-4 flex-1">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] font-black text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded-full uppercase tracking-tighter ring-1 ring-indigo-100">
                          {mentor.role}
                        </span>
                        <h3 className="text-2xl font-black text-slate-900 tracking-tight">{mentor.name}</h3>
                      </div>
                      <p className="text-sm font-bold text-slate-500">
                        {mentor.title}
                      </p>
                    </div>

                    <div className="grid gap-3">
                      {mentor.highlights.map((h, idx) => (
                        <div key={idx} className="flex gap-3 items-start text-left">
                          <div className="mt-1 rounded-full bg-emerald-50 p-1 text-emerald-600">
                            <CheckCircle2 className="w-3 h-3" />
                          </div>
                          <p className="text-[13px] text-slate-600 font-bold leading-tight">{h}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Future Pipeline Hint */}
        <div className="py-12 text-center border-2 border-dashed border-slate-100 rounded-[3rem] bg-slate-50/50">
          <p className="text-slate-400 font-bold">새로운 분야별 멘토진이 순차적으로 업데이트될 예정입니다.</p>
        </div>

      </div>
    </div>
  );
}
