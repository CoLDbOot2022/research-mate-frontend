import React from "react";
import Link from "next/link";
import { ArrowLeft, ShieldCheck } from "lucide-react";

export default function PrivacyPage() {
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
              <div className="flex items-center gap-3 mb-4">
                <ShieldCheck className="w-8 h-8 text-emerald-500" />
                <h1 className="text-4xl font-black tracking-tighter text-slate-900">
                  개인정보처리방침
                </h1>
              </div>
              <p className="text-slate-500 leading-relaxed">
                세특연구소(이하 ‘회사’)는 「개인정보 보호법」 제30조에 따라 정보주체의 개인정보를 보호하고 이와 관련한 고충을 신속하고 원활하게 처리할 수 있도록 다음과 같이 개인정보처리방침을 수립·공개합니다.
              </p>
            </header>
            
            <div className="space-y-10 text-slate-700 leading-relaxed text-base md:text-lg">
              <section>
                <h2 className="text-2xl font-black text-slate-900 mb-4 flex items-center gap-3">
                  <span className="text-emerald-500">제1조</span> 개인정보의 처리 목적
                </h2>
                <div className="space-y-4 pl-1">
                  <p>회사는 다음의 목적을 위하여 개인정보를 처리합니다. 처리하고 있는 개인정보는 다음의 목적 이외의 용도로는 이용되지 않으며, 이용 목적이 변경되는 경우에는 「개인정보 보호법」 제18조에 따라 별도의 동의를 받는 등 필요한 조치를 이행할 예정입니다.</p>
                  <ul className="space-y-3 pl-5 list-disc marker:text-emerald-400">
                    <li><strong>서비스 제공</strong>: AI 기반 심화 탐구 보고서 가이드 생성, 대학생 멘토링 매칭 및 피드백 제공, 교육 컨설팅 등</li>
                    <li><strong>회원 가입 및 관리</strong>: 회원제 서비스 이용에 따른 본인 확인, 개인 식별, 불량 회원의 부정 이용 방지와 비인가 사용 방지, 가입 의사 확인, 분쟁 조정을 위한 기록 보존, 불만 처리 등 민원 처리, 고지 사항 전달</li>
                    <li><strong>결제 및 환불 처리</strong>: 유료 서비스 이용에 따른 대금 결제, 환불 절차 이행</li>
                  </ul>
                </div>
              </section>

              <section>
                <h2 className="text-2xl font-black text-slate-900 mb-4 flex items-center gap-3">
                  <span className="text-emerald-500">제2조</span> 처리하는 개인정보 항목 및 보유 기간
                </h2>
                <div className="space-y-4 pl-1">
                  <p>회사는 법령에 따른 개인정보 보유·이용 기간 또는 정보주체로부터 개인정보를 수집 시에 동의받은 개인정보 보유·이용 기간 내에서 개인정보를 처리·보유합니다. 각각의 개인정보 처리 및 보유 기간은 다음과 같습니다.</p>
                  
                  <div className="grid gap-4">
                    <div className="bg-slate-50/80 p-5 rounded-2xl border border-slate-100">
                      <h4 className="font-bold text-slate-900 mb-2">회원 가입 및 관리</h4>
                      <p className="text-sm">회원 탈퇴 시까지. 다만, 관계 법령 위반에 따른 수사·조사 등이 진행 중인 경우 해당 수사·조사 종료 시까지 보유합니다.</p>
                    </div>
                    <div className="bg-slate-50/80 p-5 rounded-2xl border border-slate-100">
                      <h4 className="font-bold text-slate-900 mb-2">재화 또는 서비스 제공</h4>
                      <p className="text-sm mb-3">재화·서비스 공급 완료 및 요금 결제·정산 완료 시까지 보유합니다. 단, 관계 법령에 따라 다음 기간 동안 보관합니다.</p>
                      <ul className="text-xs space-y-1.5 text-slate-500">
                        <li>• 표시/광고에 관한 기록: 6개월</li>
                        <li>• 계약 또는 청약철회, 대금결제, 재화 공급 기록: 5년</li>
                        <li>• 소비자 불만 또는 분쟁처리에 관한 기록: 3년</li>
                      </ul>
                    </div>
                  </div>
                </div>
              </section>

              <section>
                <h2 className="text-2xl font-black text-slate-900 mb-4 flex items-center gap-3">
                  <span className="text-emerald-500">제3조</span> 개인정보의 제3자 제공
                </h2>
                <div className="space-y-4 pl-1">
                  <p>회사는 정보주체의 개인정보를 제1조(개인정보의 처리 목적)에서 명시한 범위 내에서만 처리하며, 정보주체의 동의, 법률의 특별한 규정 등 「개인정보 보호법」 제17조 및 제18조에 해당하는 경우에만 개인정보를 제3자에게 제공합니다.</p>
                  <div className="overflow-hidden rounded-2xl border border-slate-100">
                    <table className="w-full text-sm text-left">
                      <thead className="bg-slate-50 text-slate-500 font-bold">
                        <tr>
                          <th className="px-4 py-3">제공받는 자</th>
                          <th className="px-4 py-3">제공 목적</th>
                          <th className="px-4 py-3">제공 항목</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        <tr>
                          <td className="px-4 py-4 font-bold text-slate-900">대학생 멘토</td>
                          <td className="px-4 py-4 text-slate-600">보고서 검수 및 피드백 제공</td>
                          <td className="px-4 py-4 text-slate-600 whitespace-pre-wrap">성명, 학교, 학년, 탐구 주제 및 초안</td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                  <p className="text-sm text-slate-500 italic">* 보유 및 이용기간: 멘토링 서비스 완료 후 즉시 파기</p>
                </div>
              </section>

              <section>
                <h2 className="text-2xl font-black text-slate-900 mb-4 flex items-center gap-3">
                  <span className="text-emerald-500">제4조</span> 만 14세 미만 아동의 개인정보 보호
                </h2>
                <div className="pl-1 space-y-3">
                  <p>회사는 만 14세 미만 아동의 개인정보를 수집할 때 법정대리인의 동의를 얻습니다.</p>
                  <p>회사는 법정대리인의 동의를 얻기 위하여 아동에게 법정대리인의 성명, 연락처 등 최소한의 정보를 요구할 수 있으며, 관련 법령에 따라 동의 여부를 확인합니다.</p>
                </div>
              </section>

              <section>
                <h2 className="text-2xl font-black text-slate-900 mb-4 flex items-center gap-3">
                  <span className="text-emerald-500">제5조</span> 권리·의무 및 행사 방법
                </h2>
                <div className="pl-1 space-y-3">
                  <p>정보주체(혹은 법정대리인)는 언제든지 등록되어 있는 자신의 개인정보를 조회하거나 수정할 수 있으며 가입 해지를 요청할 수도 있습니다.</p>
                  <p>제1항에 따른 권리 행사는 서면, 전자우편, 모사전송(FAX) 등을 통하여 하실 수 있으며 회사는 이에 대해 지체 없이 조치하겠습니다.</p>
                </div>
              </section>

              <section>
                <h2 className="text-2xl font-black text-slate-900 mb-4 flex items-center gap-3">
                  <span className="text-emerald-500">제6조</span> 개인정보의 파기 절차 및 방법
                </h2>
                <div className="pl-1 space-y-3">
                  <p>회사는 개인정보 보유 기간의 경과, 처리 목적 달성 등 개인정보가 불필요하게 되었을 때에는 지체 없이 해당 개인정보를 파기합니다.</p>
                  <p>전자적 파일 형태의 정보는 기록을 재생할 수 없는 기술적 방법을 사용하며, 종이 문서에 출력된 개인정보는 분쇄기로 분쇄하거나 소각을 통하여 파기합니다.</p>
                </div>
              </section>

              <section>
                <h2 className="text-2xl font-black text-slate-900 mb-4 flex items-center gap-3">
                  <span className="text-emerald-500">제7조</span> 개인정보의 안전성 확보 조치
                </h2>
                <div className="pl-1 space-y-4">
                  <p>회사는 개인정보의 안전성 확보를 위해 다음과 같은 조치를 취하고 있습니다.</p>
                  <ul className="space-y-3 pl-5 list-disc marker:text-emerald-400">
                    <li><strong>관리적 조치</strong>: 내부관리계획 수립 및 시행, 정기적 직원/팀원 교육 등</li>
                    <li><strong>기술적 조치</strong>: 개인정보처리시스템 등의 접근 권한 관리, 비밀번호 및 주요 정보의 암호화, 보안 프로그램 설치</li>
                  </ul>
                </div>
              </section>

              <section>
                <h2 className="text-2xl font-black text-slate-900 mb-4 flex items-center gap-3">
                  <span className="text-emerald-500">제8조</span> 개인정보 보호책임자
                </h2>
                <div className="pl-1 space-y-4">
                  <p>회사는 개인정보 처리에 관한 업무를 총괄해서 책임지고, 정보주체의 불만 처리 및 피해 구제 등을 위하여 아래와 같이 개인정보 보호책임자를 지정하고 있습니다.</p>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="bg-slate-50/50 p-4 rounded-xl border border-slate-100 text-sm">
                      <p className="text-slate-400 mb-1">성명</p>
                      <p className="font-bold text-slate-900">강필중</p>
                    </div>
                    <div className="bg-slate-50/50 p-4 rounded-xl border border-slate-100 text-sm">
                      <p className="text-slate-400 mb-1">이메일</p>
                      <p className="font-bold text-blue-600 underline">coldbootcp@gmail.com</p>
                    </div>
                  </div>
                </div>
              </section>

              <section>
                <h2 className="text-2xl font-black text-slate-900 mb-4 flex items-center gap-3">
                  <span className="text-emerald-500">제9조</span> 권익침해 구제 방법
                </h2>
                <div className="pl-1 space-y-4">
                  <p>정보주체는 아래의 기관에 대해 개인정보 침해에 대한 피해 구제, 상담 등을 문의하실 수 있습니다.</p>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="bg-slate-50/50 p-4 rounded-xl border border-slate-100 text-sm">
                      <p className="font-bold text-slate-900 mb-1">개인정보침해신고센터</p>
                      <p className="text-slate-500">privacy.kisa.or.kr / 국번없이 118</p>
                    </div>
                    <div className="bg-slate-50/50 p-4 rounded-xl border border-slate-100 text-sm">
                      <p className="font-bold text-slate-900 mb-1">개인정보분쟁조정위원회</p>
                      <p className="text-slate-500">kopis.go.kr / 국번없이 1833-6972</p>
                    </div>
                    <div className="bg-white p-4 rounded-xl border border-slate-100 text-sm">
                      <p className="font-bold text-slate-900 mb-1">대검찰청 사이버수사과</p>
                      <p className="text-slate-500">spo.go.kr / 국번없이 1301</p>
                    </div>
                    <div className="bg-white p-4 rounded-xl border border-slate-100 text-sm">
                      <p className="font-bold text-slate-900 mb-1">경찰청 사이버범죄신고시스템</p>
                      <p className="text-slate-500">ecrm.police.go.kr / 국번없이 182</p>
                    </div>
                  </div>
                </div>
              </section>

              <section>
                <h2 className="text-2xl font-black text-slate-900 mb-4 flex items-center gap-3">
                  <span className="text-emerald-500">제10조</span> 개인정보 처리방침 변경
                </h2>
                <div className="pl-1">
                  <p>이 개인정보 처리방침은 2026년 4월 1일부터 적용됩니다.</p>
                </div>
              </section>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
