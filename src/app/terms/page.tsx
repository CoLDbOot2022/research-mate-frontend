import React from "react";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

export default function TermsPage() {
  return (
    <div className="min-h-screen bg-slate-50 py-12 px-4">
      <div className="max-w-4xl mx-auto bg-white rounded-3xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="p-8 md:p-16">
          <Link href="/" className="inline-flex items-center text-sm font-semibold text-slate-500 hover:text-slate-900 mb-12 transition-colors">
            <ArrowLeft className="w-4 h-4 mr-2" />
            홈으로 돌아가기
          </Link>
          
          <div className="space-y-12">
            <header className="border-b border-slate-100 pb-10">
              <h1 className="text-4xl font-black tracking-tighter text-slate-900 mb-4">
                세특연구소 서비스 이용약관
              </h1>
              <p className="text-xl font-bold text-indigo-600">환불 및 유효기간 정책</p>
            </header>
            
            <div className="space-y-10 text-slate-700 leading-relaxed text-base md:text-lg">
              <section>
                <div className="flex items-start gap-4 mb-4">
                  <span className="flex-shrink-0 w-8 h-8 rounded-full bg-indigo-50 text-indigo-600 flex items-center justify-center font-black text-sm">01</span>
                  <h2 className="text-2xl font-black text-slate-900">환불의 기본 원칙</h2>
                </div>
                <div className="pl-12">
                  <p>세특연구소의 모든 서비스는 <strong className="text-slate-900">'심화 탐구 보고서 가이드 3회 생성권'</strong>이 포함된 패키지로 제공됩니다. 환불 금액은 이용자가 실제 결제한 할인가를 기준으로 산정하며, 서비스의 핵심인 AI 생성 기능의 이용 횟수와 멘토링 서비스의 품질 보장 여부에 따라 결정됩니다.</p>
                </div>
              </section>

              <section>
                <div className="flex items-start gap-4 mb-6">
                  <span className="flex-shrink-0 w-8 h-8 rounded-full bg-indigo-50 text-indigo-600 flex items-center justify-center font-black text-sm">02</span>
                  <h2 className="text-2xl font-black text-slate-900">사용 횟수에 따른 환불 기준</h2>
                </div>
                <div className="pl-12 space-y-6">
                  <p className="font-medium text-slate-600 underline underline-offset-4 decoration-slate-200">서비스 이용 정도에 따라 다음과 같이 차등 환불을 진행합니다.</p>
                  
                  <div className="grid gap-6">
                    <div className="bg-slate-50/80 p-6 rounded-2xl border border-slate-100">
                      <h4 className="font-black text-slate-900 mb-3 flex items-center gap-2">
                        <div className="w-1.5 h-1.5 rounded-full bg-indigo-400" />
                        가. 기본 요금제 (할인가 19,000원 기준)
                      </h4>
                      <ul className="space-y-3 pl-3">
                        <li className="flex gap-3"><span className="text-slate-400 font-bold">•</span> <span><strong>미사용 시</strong>: 결제 후 7일 이내에 생성권을 전혀 사용하지 않은 경우 전액(19,000원)을 환불합니다.</span></li>
                        <li className="flex gap-3"><span className="text-slate-400 font-bold">•</span> <span><strong>1회 사용 시</strong>: 3회 중 1회의 보고서만 생성한 경우, 할인가의 50%인 <strong>9,500원</strong>을 환불합니다.</span></li>
                        <li className="flex gap-3"><span className="text-slate-400 font-bold">•</span> <span><strong>2회 이상 사용 시</strong>: 전체 패키지 분량의 3분의 2 이상을 소비한 것으로 간주하여 환불이 불가능합니다.</span></li>
                      </ul>
                    </div>
                    
                    <div className="bg-slate-50/80 p-6 rounded-2xl border border-slate-100 shadow-sm shadow-indigo-100/50">
                      <h4 className="font-black text-slate-900 mb-3 flex items-center gap-2">
                        <div className="w-1.5 h-1.5 rounded-full bg-indigo-400" />
                        나. 프리미엄 요금제 (할인가 59,000원 기준)
                      </h4>
                      <ul className="space-y-3 pl-3">
                        <li className="flex gap-3"><span className="text-slate-400 font-bold">•</span> <span><strong>미사용 시</strong>: 결제 후 7일 이내에 생성권을 전혀 사용하지 않은 경우 전액(59,000원)을 환불합니다.</span></li>
                        <li className="flex gap-3"><span className="text-slate-400 font-bold">•</span> <span><strong>1회 사용 시</strong>: 3회 중 1회의 보고서만 생성(및 멘토 매칭 진행)한 경우, 할인가의 50%인 <strong>29,500원</strong>을 환불합니다.</span></li>
                        <li className="flex gap-3"><span className="text-slate-400 font-bold">•</span> <span><strong>2회 이상 사용 시</strong>: 보고서 생성 및 멘토링 서비스가 2회 이상 진행된 이후에는 환불이 불가능합니다.</span></li>
                      </ul>

                    </div>
                  </div>
                </div>
              </section>

              <section>
                <div className="flex items-start gap-4 mb-4">
                  <span className="flex-shrink-0 w-8 h-8 rounded-full bg-indigo-50 text-indigo-600 flex items-center justify-center font-black text-sm">03</span>
                  <h2 className="text-2xl font-black text-slate-900">서비스 품질 보장에 따른 전액 환불 (SLA)</h2>
                </div>
                <div className="pl-12 space-y-4">
                  <p>이용자의 학습 흐름이 끊기지 않도록 다음과 같은 운영 지연 발생 시에는 사용 횟수와 관계없이 해당 상품 결제액 전액을 환불합니다.</p>
                  <ul className="space-y-4">
                    <li className="flex gap-4 p-4 rounded-xl bg-rose-50/50 border border-rose-100">
                      <div className="font-black text-rose-600 shrink-0">매칭 지연</div>
                      <p className="text-sm">프리미엄 서비스에서 AI 보고서 생성 완료 후 <strong className="text-rose-700">24시간 이내</strong>에 대학생 멘토 매칭이 완료되지 않을 경우 전액 환불을 요청할 수 있습니다.</p>
                    </li>
                    <li className="flex gap-4 p-4 rounded-xl bg-amber-50/50 border border-amber-100">
                      <div className="font-black text-amber-600 shrink-0">피드백 지연</div>
                      <p className="text-sm">멘토 매칭이 완료된 시점으로부터 <strong className="text-amber-700">48시간 이내</strong>에 멘토의 검수 및 최종 피드백이 완료되지 않을 경우 전액 환불을 진행합니다.</p>
                    </li>
                  </ul>
                </div>
              </section>

              <section>
                <div className="flex items-start gap-4 mb-4">
                  <span className="flex-shrink-0 w-8 h-8 rounded-full bg-indigo-50 text-indigo-600 flex items-center justify-center font-black text-sm">04</span>
                  <h2 className="text-2xl font-black text-slate-900">서비스 유효기간 및 소멸</h2>
                </div>
                <div className="pl-12">
                  <ul className="space-y-3">
                    <li className="flex gap-3"><span className="text-indigo-400 font-bold">•</span> <span><strong>이용 기간</strong>: 모든 상품의 유효기간은 구매일로부터 1년(365일)입니다.</span></li>
                    <li className="flex gap-3"><span className="text-indigo-400 font-bold">•</span> <span><strong>권리 소멸</strong>: 구매 후 1년이 경과하면 잔여 생성권과 자동으로 연계되는 멘토 매칭 권한은 모두 소멸됩니다. 유효기간 만료로 인한 소멸 시에는 미사용 회차에 대한 환불이나 이월이 지원되지 않습니다.</span></li>
                  </ul>
                </div>
              </section>

              <section>
                <div className="flex items-start gap-4 mb-4">
                  <span className="flex-shrink-0 w-8 h-8 rounded-full bg-indigo-50 text-indigo-600 flex items-center justify-center font-black text-sm">05</span>
                  <h2 className="text-2xl font-black text-slate-900">환불 신청 및 처리 절차</h2>
                </div>
                <div className="pl-12">
                  <ul className="space-y-4">
                    <li className="flex gap-3"><span className="text-slate-400 font-bold">•</span> <span>환불 신청은 고객센터를 통해 접수하며, 시스템 로그를 통해 보고서 생성 횟수, 멘토 매칭 시각, 피드백 완료 시각을 엄격히 대조하여 판정합니다.</span></li>
                    <li className="flex gap-3"><span className="text-slate-400 font-bold">•</span> <span>환불 조건에 부합할 경우, 접수일로부터 3영업일 이내에 동일한 결제 수단으로 환급 처리를 진행합니다.</span></li>
                  </ul>
                </div>
              </section>
            </div>
            
            <footer className="pt-12 border-t border-slate-100 text-center">
              <p className="text-sm text-slate-400">© 2026 ColdBoot. 모든 권리 보유.</p>
            </footer>
          </div>
        </div>
      </div>
    </div>
  );
}
