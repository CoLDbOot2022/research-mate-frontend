"use client";

import { useEffect, useMemo, useState } from "react";
import { CheckCircle2, Loader2, Sparkles, HelpCircle, Check, X, ArrowRight } from "lucide-react";
import { QUIZ_BANK, type Quiz } from "@/lib/constants/quiz";

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
  realTimeMessage?: string;
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
  realTimeMessage,
  activityLogs = [],
  quiz,
}: Props) {
  const safeProgress = Math.max(0, Math.min(100, Math.round(progress)));
  const [messageIndex, setMessageIndex] = useState(0);

  // Randomly select a quiz from the bank on mount
  const [currentInteractiveQuiz, setCurrentInteractiveQuiz] = useState<Quiz | null>(null);
  const [selectedIdx, setSelectedIdx] = useState<number | null>(null);

  useEffect(() => {
    const randomIndex = Math.floor(Math.random() * QUIZ_BANK.length);
    setCurrentInteractiveQuiz(QUIZ_BANK[randomIndex]);
  }, []);

  const currentMessage = useMemo(() => {
    if (realTimeMessage) return realTimeMessage;
    if (funMessages.length === 0) return "";
    return funMessages[messageIndex % funMessages.length];
  }, [realTimeMessage, funMessages, messageIndex]);

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

  const handleNextQuiz = () => {
    let nextIndex = Math.floor(Math.random() * QUIZ_BANK.length);
    // Try to avoid showing the same question twice in a row
    if (currentInteractiveQuiz) {
      const currentIndex = QUIZ_BANK.indexOf(currentInteractiveQuiz);
      if (nextIndex === currentIndex && QUIZ_BANK.length > 1) {
        nextIndex = (nextIndex + 1) % QUIZ_BANK.length;
      }
    }
    setCurrentInteractiveQuiz(QUIZ_BANK[nextIndex]);
    setSelectedIdx(null);
  };

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

      {safeProgress >= 95 && (
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
              className={`rounded-xl border p-3 transition-colors ${done ? "border-emerald-200 bg-emerald-50" : active ? "border-blue-200 bg-blue-50" : "border-slate-200 bg-slate-50"
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

      {currentInteractiveQuiz && (
        <div className="mt-4 rounded-2xl border border-amber-200 bg-amber-50/50 p-4 md:p-5 shadow-sm">
          <div className="flex items-center justify-between gap-2 mb-3">
            <div className="flex items-center gap-2">
              <div className="p-1.5 rounded-lg bg-amber-100 text-amber-700">
                <HelpCircle className="w-4 h-4" />
              </div>
              <p className="text-sm font-bold text-amber-900">잠깐 퀴즈</p>
            </div>
            {selectedIdx !== null && (
              <button
                onClick={handleNextQuiz}
                className="text-xs font-bold bg-amber-200 text-amber-900 px-3 py-1.5 rounded-lg hover:bg-amber-300 transition-colors flex items-center gap-1"
              >
                다음 문제 <ArrowRight className="w-3 h-3" />
              </button>
            )}
          </div>

          <p className="text-[15px] text-slate-800 font-semibold mb-4 leading-snug">
            {currentInteractiveQuiz.question}
          </p>

          <div className="grid grid-cols-2 gap-3">
            {currentInteractiveQuiz.options.map((option, idx) => {
              const isSelected = selectedIdx === idx;
              const isCorrect = idx === currentInteractiveQuiz.answerIndex;
              const showResult = selectedIdx !== null;

              return (
                <button
                  key={idx}
                  disabled={showResult}
                  onClick={() => setSelectedIdx(idx)}
                  className={`
                    group relative flex items-center justify-between p-3 rounded-xl border-2 transition-all duration-300 text-sm font-bold
                    ${!showResult
                      ? "border-amber-200 bg-white text-amber-900 hover:border-amber-400 hover:shadow-md active:scale-95"
                      : isSelected
                        ? isCorrect
                          ? "border-emerald-500 bg-emerald-50 text-emerald-700"
                          : "border-red-500 bg-red-50 text-red-700"
                        : isCorrect
                          ? "border-emerald-200 bg-emerald-50/50 text-emerald-600 opacity-80"
                          : "border-slate-100 bg-slate-50 text-slate-400 opacity-50"
                    }
                  `}
                >
                  <span className="flex-1 text-center">{option}</span>
                  {showResult && isCorrect && <Check className="w-4 h-4 shrink-0" />}
                  {showResult && isSelected && !isCorrect && <X className="w-4 h-4 shrink-0" />}
                </button>
              );
            })}
          </div>

          {selectedIdx !== null && (
            <div className={`mt-4 animate-in fade-in slide-in-from-top-2 duration-500 text-center`}>
              {selectedIdx === currentInteractiveQuiz.answerIndex ? (
                <p className="text-xs font-bold text-emerald-600 flex items-center gap-1.5 justify-center">
                  <span className="text-lg">🎉</span> 정답입니다! 연구 역량이 +1 상승했습니다.
                </p>
              ) : (
                <p className="text-xs font-bold text-red-500 flex items-center gap-1.5 justify-center">
                  <span className="text-lg">😢</span> 아쉬워요! 정답은 "{currentInteractiveQuiz.options[currentInteractiveQuiz.answerIndex]}"입니다.
                </p>
              )}
            </div>
          )}
        </div>
      )}

      {tip && <p className="text-xs text-slate-500 mt-5 text-center italic">Tip: {tip}</p>}
    </div>
  );
}
