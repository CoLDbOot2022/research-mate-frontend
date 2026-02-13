"use client";

import React, { useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { useRouter } from 'next/navigation';
import { Star, FileText, Users, ThumbsUp, ArrowRight } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useMindMap } from '@/context/MindMapContext';
import { TopicGeneratorDemo } from '@/components/landing/TopicGeneratorDemo';
import { TestimonialCarousel } from '@/components/landing/TestimonialCarousel';
import { ReportPreviewDemo } from '@/components/landing/ReportPreviewDemo';

export default function LandingPage() {
  const router = useRouter();
  const { setHistoryRoot, setCurrentNode, setSeenTopics } = useMindMap();

  // Reset Mind Map State when visiting Landing Page (New Session)
  useEffect(() => {
    setHistoryRoot(null);
    setCurrentNode(null);
    setSeenTopics([]);
  }, [setHistoryRoot, setCurrentNode, setSeenTopics]);

  return (
    <div className="flex flex-col min-h-screen bg-white">
      {/* Hero Section */}
      <section className="bg-gradient-to-b from-blue-50 to-white py-20 lg:py-32">
        <div className="container mx-auto px-4 md:px-6">
          <div className="grid gap-6 lg:grid-cols-2 lg:gap-12 items-center">
            <div className="space-y-4">
              <div className="inline-block rounded-lg bg-blue-100 px-3 py-1 text-sm font-medium text-blue-800 mb-2">
                생기부 완벽 대비
              </div>
              <h1 className="text-4xl font-extrabold tracking-tighter sm:text-5xl xl:text-6xl/none text-slate-900">
                심화 보고서 주제,<br />
                이제 <span className="text-blue-600">쉽게 찾으세요</span>
              </h1>
              <p className="text-gray-500 md:text-xl max-w-[600px]">
                학년, 과목, 관심사에 맞춘 AI 기반 추천 서비스로 당신만의 경쟁력을 만드세요.
                수행평가부터 세특까지, 막막했던 주제 선정을 도와드립니다.
              </p>
              <div className="flex gap-3 pt-4">
                <Button size="lg" className="h-12 px-8 text-lg bg-blue-600 hover:bg-blue-700" onClick={() => router.push('/subject')}>
                  주제 추천받기
                </Button>
                <Button size="lg" variant="outline" className="h-12 px-8 text-lg">
                  이용 가이드
                </Button>
              </div>
              <div className="flex items-center gap-2 text-sm text-gray-500 pt-2">
                <div className="flex -space-x-2">
                  <Avatar className="w-8 h-8 border-2 border-white"><AvatarFallback>U1</AvatarFallback></Avatar>
                  <Avatar className="w-8 h-8 border-2 border-white"><AvatarFallback>U2</AvatarFallback></Avatar>
                  <Avatar className="w-8 h-8 border-2 border-white"><AvatarFallback>U3</AvatarFallback></Avatar>
                </div>
                <p>이미 <span className="font-bold text-black">5,000+</span> 명의 학생들이 사용 중</p>
              </div>
            </div>
            <div className="flex justify-center">
              {/* Illustration / Demo */}
              <TopicGeneratorDemo />
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-12 bg-slate-50 border-y">
        <div className="container mx-auto px-4 md:px-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
            <div className="bg-white p-6 rounded-2xl shadow-sm">
              <div className="flex justify-center mb-4">
                <div className="p-3 bg-blue-100 text-blue-600 rounded-xl">
                  <FileText className="w-8 h-8" />
                </div>
              </div>
              <h3 className="text-3xl font-bold mb-1">15,000+</h3>
              <p className="text-gray-500">누적 추천 주제</p>
            </div>
            <div className="bg-white p-6 rounded-2xl shadow-sm">
              <div className="flex justify-center mb-4">
                <div className="p-3 bg-indigo-100 text-indigo-600 rounded-xl">
                  <Users className="w-8 h-8" />
                </div>
              </div>
              <h3 className="text-3xl font-bold mb-1">5,200+</h3>
              <p className="text-gray-500">이용 학생 수</p>
            </div>
            <div className="bg-white p-6 rounded-2xl shadow-sm">
              <div className="flex justify-center mb-4">
                <div className="p-3 bg-purple-100 text-purple-600 rounded-xl">
                  <ThumbsUp className="w-8 h-8" />
                </div>
              </div>
              <h3 className="text-3xl font-bold mb-1">98%</h3>
              <p className="text-gray-500">사용자 만족도</p>
            </div>
          </div>
        </div>
      </section>

      {/* Steps Section */}
      <section className="py-20">
        <div className="container mx-auto px-4 md:px-6">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold tracking-tight mb-4">어떻게 작동하나요?</h2>
            <p className="text-gray-500">단 3단계로 끝나는 심화 탐구 주제 선정 프로세스를 경험해보세요.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              { title: '1. 교과 및 관심사 분석', desc: '희망 진로와 관심 키워드를 교과 성취 기준과 결합하여, 나의 탐구 방향성을 정밀하게 분석합니다.', icon: '📊' },
              { title: '2. 심화 탐구 주제 추천', desc: '남들과 다른 차별화된 심화 탐구 주제를 도출하고, 생기부 경쟁력을 극대화할 수 있는 솔루션을 제안합니다.', icon: '💡' },
              { title: '3. 보고서 가이드 제공', desc: '단순 주제 추천을 넘어, 배경 이론부터 보고서 초안 생성까지 완성도 높은 탐구 보고서 작성을 돕습니다.', icon: '📝' },
            ].map((step, idx) => (
              <Card key={idx} className="border-0 shadow-lg hover:shadow-xl transition-shadow">
                <CardContent className="p-8">
                  <div className="text-4xl mb-6 bg-blue-50 w-16 h-16 rounded-2xl flex items-center justify-center text-blue-600">
                    {step.icon}
                  </div>
                  <h3 className="text-xl font-bold mb-3">{step.title}</h3>
                  <p className="text-gray-500 leading-relaxed">{step.desc}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Report Preview Section - NEW */}
      <section className="py-24 bg-slate-50 overflow-hidden">
        <div className="container mx-auto px-4">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <div className="inline-block px-4 py-1.5 rounded-full bg-blue-100 text-blue-700 text-sm font-bold mb-6">
              실제 결과물 예시
            </div>
            <h2 className="text-3xl font-bold mb-4 text-slate-900">
              대학 수준의 <span className="text-blue-600">고퀄리티 탐구 보고서</span>
            </h2>
            <p className="text-lg text-slate-600">
              주제 선정 동기부터 심화 이론, 실험 데이터 분석, 결론 도출까지.<br />
              TopicGen AI가 논리적이고 체계적인 보고서 초안을 완성해 드립니다.
            </p>
          </div>

          <div className="flex justify-center">
            <ReportPreviewDemo />
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="py-24 bg-white">
        <div className="container mx-auto px-4 md:px-6">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold tracking-tight mb-4">학생들의 실제 후기</h2>
            <p className="text-gray-500">TopicGen과 함께 성공적인 입시 결과를 만들어가는 학생들의 이야기입니다.</p>
          </div>

          <div className="w-full">
            <TestimonialCarousel />
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 bg-blue-600 text-white text-center">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold mb-6">지금 바로 나만의 주제를 찾아보세요</h2>
          <p className="text-blue-100 mb-8 max-w-2xl mx-auto">입시 준비, 더 이상 혼자 고민하지 마세요. TopicGen이 함께합니다.</p>
          <Button variant="secondary" size="lg" className="h-14 px-10 text-lg font-bold" onClick={() => router.push('/subject')}>
            무료로 주제 추천받기
          </Button>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-white py-12 border-t text-sm text-gray-500">
        <div className="container mx-auto px-4 flex flex-col md:flex-row justify-between items-center">
          <div className="flex items-center space-x-2 mb-4 md:mb-0">
            <span className="font-bold text-lg text-slate-800">TopicGen</span>
          </div>
          <div className="flex gap-6">
            <a href="#" className="hover:text-black">이용약관</a>
            <a href="#" className="hover:text-black">개인정보처리방침</a>
            <a href="#" className="hover:text-black">고객센터</a>
          </div>
          <div className="mt-4 md:mt-0">
            © 2024 TopicGen. All rights reserved.
          </div>
        </div>
      </footer>
    </div>
  );
}
