"use client";

import { CheckCircle2, MessageSquareText, ShieldCheck } from "lucide-react";

type ReportPremiumBannerProps = {
  reportType: "general" | "premium";
  status: string;
  mentorReviewedAt: string | null;
  mentorComment: string | null;
};

export function ReportPremiumBanner({
  reportType,
  status,
  mentorReviewedAt,
  mentorComment,
}: ReportPremiumBannerProps) {
  return (
    <div className="space-y-4 no-print">
      {/* Premium awaiting review */}
      {reportType === "premium" && status === "awaiting_review" && (
        <div className="rounded-2xl border-2 border-indigo-200 bg-gradient-to-br from-indigo-50 to-blue-50 p-6 flex items-start gap-4 shadow-sm relative overflow-hidden">
          <div className="absolute top-0 right-0 w-36 h-36 bg-indigo-100 rounded-full blur-3xl opacity-40 -mr-12 -mt-12 pointer-events-none" />
          <div className="bg-indigo-100 p-3 rounded-xl flex-shrink-0 animate-pulse shadow-inner">
            <MessageSquareText className="w-5 h-5 text-indigo-700" />
          </div>
          <div className="space-y-1 relative z-10">
            <h3 className="text-base font-bold text-indigo-900 flex items-center gap-2">
              대학생 멘토가 피드백 중입니다
              <span className="flex h-2 w-2 relative">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-indigo-400 opacity-75" />
                <span className="relative inline-flex rounded-full h-2 w-2 bg-indigo-500" />
              </span>
            </h3>
            <p className="text-sm text-indigo-700 leading-relaxed">
              AI가 작성한 초안을 바탕으로 명문대 멘토들이 세부 오류를 교정하고 심층 코멘트를 달아주고 있습니다. 리뷰 완료 시 알림으로 안내해 드립니다.
            </p>
          </div>
        </div>
      )}

      {/* Premium review completed */}
      {reportType === "premium" && status === "completed" && mentorReviewedAt && (
        <div className="rounded-2xl border-2 border-emerald-200 bg-gradient-to-br from-emerald-50 to-teal-50 p-6 flex items-start gap-4 shadow-sm relative overflow-hidden">
          <div className="absolute top-0 right-0 w-36 h-36 bg-emerald-100 rounded-full blur-3xl opacity-40 -mr-12 -mt-12 pointer-events-none" />
          <div className="bg-emerald-100 p-3 rounded-xl flex-shrink-0 shadow-inner">
            <CheckCircle2 className="w-5 h-5 text-emerald-700" />
          </div>
          <div className="space-y-1 relative z-10">
            <h3 className="text-base font-bold text-emerald-900">
              최종 문서가 완성되었습니다
            </h3>
            <p className="text-sm text-emerald-700 leading-relaxed">
              멘토 리뷰가 반영된 최종 프리미엄 보고서입니다. 우측 코멘트 패널에서 전문가 피드백을 확인해보세요.
            </p>
          </div>
        </div>
      )}

      {/* Mentor general comment */}
      {mentorComment && (
        <div className="rounded-2xl border border-amber-200 bg-gradient-to-r from-amber-50 to-orange-50 p-5 flex gap-4 shadow-sm">
          <div className="flex-shrink-0">
            <ShieldCheck className="w-5 h-5 text-amber-500 mt-0.5" />
          </div>
          <div>
            <p className="text-xs font-black text-amber-700 uppercase tracking-widest mb-1.5">
              전문가 멘토 총평
            </p>
            <p className="text-sm text-slate-700 leading-relaxed whitespace-pre-wrap">
              {mentorComment}
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
