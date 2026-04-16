"use client";

import React from 'react';
import { motion } from 'framer-motion';
import { ShieldCheck, BookOpen, Database, Award } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';

export const AcademicAuthoritySection = () => {
  const pillars = [
    {
      title: '탐구의 뿌리',
      subtitle: '2022 교육부 국가 성취기준',
      desc: '교육부 고시 제2022-33호 성취기준을 시스템의 뿌리로 분석·반영하여 교과 학습과의 완벽한 연계성을 보장합니다.',
      icon: <BookOpen className="w-8 h-8 text-blue-600" />,
      color: 'bg-blue-50'
    },
    {
      title: '평가의 눈',
      subtitle: '입학사정관 평가 메커니즘',
      desc: '상위권 대학의 학생부 종합전형 평가 지표를 AI 로직에 이식하여, 대학 입사관이 선호하는 학업 역량과 자기주도성이 돋보이는 서술 구조를 유지합니다.',
      icon: <ShieldCheck className="w-8 h-8 text-indigo-600" />,
      color: 'bg-indigo-50'
    },
    {
      title: '탐구의 깊이',
      subtitle: '최신 학술 근거 RAG 시스템',
      desc: '단순한 지식 나열을 넘어, 교과서 심화 문맥과 최신 연구 동향을 결합하여 학생의 심화 학습 역량을 극대화하는 증거 중심의 내용을 생성합니다.',
      icon: <Database className="w-8 h-8 text-cyan-600" />,
      color: 'bg-cyan-50'
    }
  ];

  return (
    <section className="py-24 bg-white relative overflow-hidden">
      {/* Background Decoration */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none opacity-20">
        <div className="absolute -top-24 -right-24 w-96 h-96 bg-blue-100 rounded-full blur-3xl" />
        <div className="absolute top-1/2 -left-24 w-72 h-72 bg-indigo-100 rounded-full blur-3xl" />
      </div>

      <div className="container mx-auto px-4 relative z-10">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center max-w-3xl mx-auto mb-20"
        >
          <div className="flex items-center justify-center gap-2 mb-4">
            <Award className="w-5 h-5 text-blue-600" />
            <span className="text-blue-600 font-bold tracking-widest text-sm uppercase">Academic Standards</span>
          </div>
          <h2 className="text-3xl md:text-4xl font-extrabold text-slate-900 mb-6 tracking-tight">
            검증된 교육 표준, <span className="text-blue-600">압도적인 전문성</span>
          </h2>
          <p className="text-lg text-slate-600 leading-relaxed">
            세특연구소는 단순히 글을 쓰는 AI가 아닙니다.<br className="hidden md:block" />
            대한민국 대입의 핵심 메커니즘을 시스템화하여 가장 신뢰할 수 있는 탐구의 정석을 제시합니다.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {pillars.map((pillar, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: idx * 0.1 }}
            >
              <Card className="h-full border-0 shadow-xl shadow-slate-200/50 hover:shadow-2xl hover:shadow-blue-200/40 transition-all duration-300 group overflow-hidden">
                <CardContent className="p-10 flex flex-col items-center text-center h-full">
                  <div className={`${pillar.color} w-20 h-20 rounded-3xl flex items-center justify-center mb-8 transform group-hover:scale-110 group-hover:rotate-3 transition-transform duration-500`}>
                    {pillar.icon}
                  </div>
                  <div className="mb-4">
                    <span className="text-xs font-bold text-blue-500 uppercase tracking-widest mb-2 block">{pillar.title}</span>
                    <h3 className="text-xl font-bold text-slate-900 group-hover:text-blue-600 transition-colors">{pillar.subtitle}</h3>
                  </div>
                  <p className="text-slate-500 leading-relaxed text-sm md:text-base">
                    {pillar.desc}
                  </p>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};
