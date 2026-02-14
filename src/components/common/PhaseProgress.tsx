"use client";

import { useEffect, useMemo, useState } from "react";
import { CheckCircle2, Loader2, Sparkles } from "lucide-react";

type Phase = {
  label: string;
  description: string;
  threshold: number;
};

type Props = {
  title: string;
  subtitle?: string;
  progress: number;
  phases: Phase[];
  tip?: string;
  funMessages?: string[];
  activityLogs?: string[];
  quiz?: {
    question: string;
    answerHint: string;
  };
};

export function PhaseProgress({
  title,
  subtitle,
  progress,
  phases,
  tip,
  funMessages = [],
  activityLogs = [],
  quiz,
}: Props) {
  const safeProgress = Math.max(0, Math.min(100, Math.round(progress)));
  const [messageIndex, setMessageIndex] = useState(0);

  const currentMessage = useMemo(() => {
    if (funMessages.length === 0) return "";
    return funMessages[messageIndex % funMessages.length];
  }, [funMessages, messageIndex]);

  useEffect(() => {
    if (funMessages.length <= 1) return;
    const timer = setInterval(() => {
      setMessageIndex((prev) => prev + 1);
    }, 1700);
    return () => clearInterval(timer);
  }, [funMessages.length]);

  const visibleLogs = useMemo(() => {
    if (activityLogs.length === 0) return [];
    const ratio = safeProgress / 100;
    const count = Math.max(1, Math.min(activityLogs.length, Math.ceil(activityLogs.length * ratio)));
    return activityLogs.slice(0, count);
  }, [activityLogs, safeProgress]);

  return (
    <div className="rounded-3xl border border-slate-200 bg-white/90 backdrop-blur p-6 md:p-8 shadow-sm">
      <div className="flex items-start justify-between gap-3 mb-4">
        <div>
          <h3 className="text-xl md:text-2xl font-black tracking-tight">{title}</h3>
          {subtitle && <p className="text-sm text-slate-600 mt-1">{subtitle}</p>}
        </div>
        <div className="inline-flex items-center gap-2 text-xs px-3 py-1 rounded-full bg-slate-100 text-slate-700">
          <Loader2 className="w-3 h-3 animate-spin" /> 처리 중
        </div>
      </div>

      <div className="mb-3">
        <div className="h-2 rounded-full bg-slate-200 overflow-hidden">
          <div className="h-full bg-gradient-to-r from-blue-500 via-indigo-500 to-cyan-500 transition-all duration-500" style={{ width: `${safeProgress}%` }} />
        </div>
        <p className="text-right text-xs text-slate-500 mt-1">{safeProgress}%</p>
      </div>

      {safeProgress >= 96 && (
        <div className="rounded-xl border border-emerald-200 bg-emerald-50 px-3 py-2 mb-3 animate-pulse">
          <p className="text-sm text-emerald-800 font-semibold inline-flex items-center gap-1">
            <CheckCircle2 className="w-4 h-4" /> 마무리 단계입니다. 곧 완료됩니다.
          </p>
        </div>
      )}

      {currentMessage && (
        <div className="rounded-xl border border-indigo-200 bg-indigo-50/80 px-3 py-2 mb-3">
          <p className="text-sm text-indigo-900 font-medium">{currentMessage}</p>
        </div>
      )}

      <div className="flex gap-1 mb-3" aria-hidden="true">
        <span className="h-1.5 flex-1 rounded-full bg-blue-300 animate-pulse" />
        <span className="h-1.5 flex-1 rounded-full bg-indigo-300 animate-pulse [animation-delay:150ms]" />
        <span className="h-1.5 flex-1 rounded-full bg-cyan-300 animate-pulse [animation-delay:300ms]" />
      </div>

      <div className="grid gap-2">
        {phases.map((phase) => {
          const done = safeProgress >= phase.threshold;
          const active = !done && safeProgress >= phase.threshold - 20;
          return (
            <div
              key={phase.label}
              className={`rounded-xl border p-3 transition-colors ${
                done ? "border-emerald-200 bg-emerald-50" : active ? "border-blue-200 bg-blue-50" : "border-slate-200 bg-slate-50"
              }`}
            >
              <p className="text-sm font-semibold text-slate-800">{phase.label}</p>
              <p className="text-xs text-slate-600 mt-0.5">{phase.description}</p>
            </div>
          );
        })}
      </div>

      {visibleLogs.length > 0 && (
        <div className="mt-4 rounded-xl border border-slate-200 bg-white p-3">
          <p className="text-xs font-semibold text-slate-500 mb-2">실시간 처리 로그</p>
          <div className="space-y-1.5">
            {visibleLogs.map((log, idx) => (
              <p key={`${log}-${idx}`} className="text-xs text-slate-700 inline-flex items-center gap-1">
                <Sparkles className="w-3 h-3 text-indigo-500" /> {log}
              </p>
            ))}
          </div>
        </div>
      )}

      {quiz && (
        <div className="mt-4 rounded-xl border border-amber-200 bg-amber-50 p-3">
          <p className="text-xs font-semibold text-amber-800 mb-1">잠깐 퀴즈</p>
          <p className="text-sm text-amber-900 font-medium">{quiz.question}</p>
          <p className="text-xs text-amber-700 mt-1">힌트: {quiz.answerHint}</p>
        </div>
      )}

      {tip && <p className="text-xs text-slate-500 mt-4">Tip: {tip}</p>}
    </div>
  );
}
