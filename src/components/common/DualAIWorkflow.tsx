"use client";

import { useEffect, useMemo, useState } from "react";
import { CheckCircle2, Loader2, Sparkles, HelpCircle, Check, X, ArrowRight, Lightbulb, Bot } from "lucide-react";
import { QUIZ_BANK, type Quiz } from "@/lib/constants/quiz";

type Phase = {
  label: string;
  description: string;
  threshold: number;
};

type Props = {
  title: string;
  subtitle?: string;
  progress?: number;
  phases?: Phase[];
  currentPhase?: string;
  funMessages?: string[];
  hidePercentage?: boolean;
  writerTitle?: string;
  writerSubtitle?: string;
  writerPhases?: Phase[];
  writerCurrentPhase?: string;
  writerRealTimeMessage?: string;

  reviewerTitle?: string;
  reviewerSubtitle?: string;
  reviewerPhases?: Phase[];
  reviewerCurrentPhase?: string;
  reviewerRealTimeMessage?: string;
};

export function DualAIWorkflow({
  title,
  subtitle,
  progress,
  phases,
  currentPhase,
  funMessages = [],
  hidePercentage,
  writerTitle,
  writerSubtitle,
  writerPhases,
  writerCurrentPhase,
  writerRealTimeMessage,
  reviewerTitle,
  reviewerSubtitle,
  reviewerPhases,
  reviewerCurrentPhase,
  reviewerRealTimeMessage,
}: Props) {
  const safeProgress = Math.max(0, Math.min(100, Math.round(progress ?? 0)));
  const [messageIndex, setMessageIndex] = useState(0);

  // Randomly select a quiz from the bank on mount
  const [currentInteractiveQuiz, setCurrentInteractiveQuiz] = useState<Quiz | null>(null);
  const [selectedIdx, setSelectedIdx] = useState<number | null>(null);

  const RESEARCH_TIPS = [
    "탐구 질문(Research Question)은 '왜?' 보다는 '어떻게?' 혹은 '무엇에 영향을 주는가?'처럼 구체적일수록 좋아요.",
    "이론적 배경을 쓸 때는 교과서의 핵심 개념과 실제 선행 연구를 연결하는 것이 대학 입시에서 핵심 평가 포인트입니다.",
    "실험이나 조사가 어렵다면 빅데이터 분석이나 시뮬레이션 프로그램을 활용하는 것도 훌륭한 탐구 방법입니다.",
    "보고서의 마지막에는 탐구의 한계점을 꼭 적어주세요. 자신의 연구를 객관적으로 돌아보는 능력을 보여줄 수 있습니다.",
    "참고문헌은 구글 학술검색(Google Scholar)이나 RISS를 활용해 출처를 명확히 밝히는 습관을 들여보세요.",
  ];

  useEffect(() => {
    const randomIndex = Math.floor(Math.random() * QUIZ_BANK.length);
    setCurrentInteractiveQuiz(QUIZ_BANK[randomIndex]);
  }, []);

  const currentTip = useMemo(() => {
    return RESEARCH_TIPS[messageIndex % RESEARCH_TIPS.length];
  }, [messageIndex]);

  useEffect(() => {
    const timer = setInterval(() => {
      setMessageIndex((prev) => prev + 1);
    }, 4500);
    return () => clearInterval(timer);
  }, []);

  const handleNextQuiz = () => {
    let nextIndex = Math.floor(Math.random() * QUIZ_BANK.length);
    if (currentInteractiveQuiz) {
      const currentIndex = QUIZ_BANK.indexOf(currentInteractiveQuiz);
      if (nextIndex === currentIndex && QUIZ_BANK.length > 1) {
        nextIndex = (nextIndex + 1) % QUIZ_BANK.length;
      }
    }
    setCurrentInteractiveQuiz(QUIZ_BANK[nextIndex]);
    setSelectedIdx(null);
  };

  // Find active step index
  // Find active step index based on backend string phase matching
  const activeStepIdx = phases ? phases.findIndex((p) => p.label === currentPhase) : -1;

  const writerActiveStepIdx = writerPhases ? writerPhases.findIndex((p) => {
    if (safeProgress >= 100 || !writerCurrentPhase || writerCurrentPhase === "completed" || writerCurrentPhase === "failed") return false;
    
    // Explicit phase mapping
    if (p.label === writerCurrentPhase) return true;
    if (p.label === "retrieve & plan" && ["queued", "retrieve", "plan"].includes(writerCurrentPhase)) return true;
    return false;
  }) : -1;

  const reviewerActiveStepIdx = reviewerPhases ? reviewerPhases.findIndex((p) => {
    if (safeProgress >= 100 || !reviewerCurrentPhase || reviewerCurrentPhase === "completed" || reviewerCurrentPhase === "failed") return false;
    return p.label === reviewerCurrentPhase;
  }) : -1;

  const showDualAIPanels = writerPhases || reviewerPhases;

  return (
    <div className="rounded-3xl border border-slate-200 bg-white/95 backdrop-blur-xl p-8 md:p-12 shadow-2xl">
      <div className="flex items-start justify-between gap-4 mb-4">
        <div>
          <h3 className="text-2xl md:text-3xl font-black tracking-tight text-slate-900">{title}</h3>
          {subtitle && <p className="text-sm text-slate-500 mt-2 font-medium">{subtitle}</p>}
        </div>
        <div className="inline-flex flex-col items-end gap-2">
          <div className="inline-flex items-center gap-2 text-xs font-bold px-4 py-2 rounded-full bg-indigo-50 text-indigo-700 border border-indigo-100 uppercase tracking-wider animate-pulse">
            <Loader2 className="w-4 h-4 animate-spin" /> Processing
          </div>
        </div>
      </div>
      
      {/* Safe to leave banner */}
      <div className="mb-8 p-4 rounded-xl bg-blue-50/50 border border-blue-100 flex items-start gap-3">
        <div className="bg-blue-100 p-1.5 rounded-full text-blue-600 shrink-0 mt-0.5">
          <CheckCircle2 className="w-4 h-4" />
        </div>
        <div>
          <p className="text-sm font-bold text-slate-900">보고서 작성에는 약 3~5분 정도 소요됩니다.</p>
          <p className="text-xs text-slate-700 mt-1">이 페이지를 벗어나도 <b>보고서는 백그라운드에서 안전하게 계속 생성됩니다.</b> 자유롭게 다른 작업을 하셔도 좋습니다.</p>
        </div>
      </div>      {phases && (
        <div className={`grid gap-8 mb-10 ${showDualAIPanels ? "md:grid-cols-2" : ""}`}>
          <div className="relative space-y-2">
            {phases.map((phase, idx) => {
              const isDone = activeStepIdx > idx || currentPhase === "completed";
              const isActive = activeStepIdx === idx && currentPhase !== "completed";
              const isPending = activeStepIdx < idx;

              return (
                <div key={phase.label} className="relative flex group">
                  {/* Connector Line */}
                  {idx !== phases.length - 1 && (
                    <div 
                      className={`absolute left-4 top-10 w-0.5 h-full -ml-px transition-colors duration-500 ${
                        isDone ? "bg-emerald-400" : "bg-slate-100"
                      }`} 
                    />
                  )}

                  {/* Step Circle */}
                  <div className="relative flex-shrink-0 z-10 mr-5">
                    <div 
                      className={`w-8 h-8 rounded-full border-2 flex items-center justify-center transition-all duration-500 ${
                        isDone 
                          ? "bg-emerald-500 border-emerald-500 text-white scale-110 shadow-[0_0_15px_rgba(16,185,129,0.3)]" 
                          : isActive 
                            ? "bg-white border-indigo-500 text-indigo-600 scale-125 shadow-[0_0_20px_rgba(99,102,241,0.2)]" 
                            : "bg-white border-slate-200 text-slate-300"
                      }`}
                    >
                      {isDone ? (
                        <Check className="w-4 h-4 stroke-[3px]" />
                      ) : isActive ? (
                        <div className="w-2 h-2 rounded-full bg-indigo-600 animate-ping" />
                      ) : (
                        <span className="text-xs font-bold leading-none">{idx + 1}</span>
                      )}
                    </div>
                  </div>

                  {/* Step Content */}
                  <div className={`pb-8 transition-opacity duration-300 ${isPending ? "opacity-40" : "opacity-100"}`}>
                    <div className="flex items-center gap-2">
                      <h4 className={`font-bold transition-colors uppercase ${isActive ? "text-indigo-600 text-lg" : isDone ? "text-slate-700" : "text-slate-400"}`}>
                        {phase.label}
                      </h4>
                      {isActive && <Sparkles className="w-4 h-4 text-amber-400 animate-spin-slow" />}
                    </div>
                    <p className={`text-xs mt-1 leading-relaxed ${isActive ? "text-indigo-900 font-medium" : "text-slate-500"}`}>
                      {isActive ? (funMessages?.[messageIndex % (funMessages?.length || 1)] || phase.description) : phase.description}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {showDualAIPanels && (
        <div className="grid gap-6 mb-10 md:grid-cols-2">
          {/* Writer AI Panel */}
          {writerPhases && (
            <div className={`rounded-2xl border transition-all duration-500 overflow-hidden ${writerActiveStepIdx !== -1 && writerCurrentPhase !== "completed" ? "bg-indigo-50/40 border-indigo-200 shadow-sm" : "bg-slate-50 border-slate-100"}`}>
              <div className={`px-5 py-4 border-b flex items-center justify-between ${writerActiveStepIdx !== -1 && writerCurrentPhase !== "completed" ? "bg-indigo-100/50 border-indigo-100" : "bg-slate-100/50 border-slate-100"}`}>
                <div>
                  <h4 className={`text-sm font-bold flex items-center gap-2 ${writerActiveStepIdx !== -1 && writerCurrentPhase !== "completed" ? "text-indigo-900" : "text-slate-600"}`}>
                    <Sparkles className={`w-4 h-4 ${writerActiveStepIdx !== -1 && writerCurrentPhase !== "completed" ? "text-indigo-600" : "text-slate-400"}`} />
                    {writerTitle || "Writer AI (보고서 작성)"}
                  </h4>
                  {writerSubtitle && <p className="text-[10px] text-slate-500 mt-0.5">{writerSubtitle}</p>}
                </div>
                {writerActiveStepIdx !== -1 && writerCurrentPhase !== "completed" && (
                  <span className="flex items-center gap-1.5 text-[10px] font-bold bg-indigo-600 text-white px-2 py-0.5 rounded-full uppercase tracking-wider animate-pulse">
                    <div className="w-1.5 h-1.5 bg-white rounded-full animate-ping" />
                    Working
                  </span>
                )}
              </div>
              <div className="p-5 space-y-4">
                {writerPhases.map((phase, idx) => {
                  const isDone = safeProgress >= phase.threshold || writerCurrentPhase === "completed";
                  const isActive = writerActiveStepIdx === idx && !isDone;
                  const isPending = !isDone && !isActive;
                  const isLooping = phase.label === "rewrite" && isActive;

                  return (
                    <div key={phase.label} className="relative flex group">
                      {idx !== writerPhases.length - 1 && (
                        <div className={`absolute left-3 top-8 w-0.5 h-full -ml-px transition-colors duration-500 ${isDone ? "bg-indigo-300" : "bg-slate-200/50"}`} />
                      )}
                      <div className="relative flex-shrink-0 z-10 mr-4">
                        <div className={`w-6 h-6 rounded-full flex items-center justify-center transition-all duration-500 ${isDone ? "bg-indigo-100 text-indigo-600" : isActive ? "bg-indigo-600 text-white scale-110 shadow-md shadow-indigo-200/50" : "bg-white border border-slate-200 text-slate-300"} ${isLooping ? "ring-2 ring-indigo-200 animate-pulse" : ""}`}>
                          {isDone ? <CheckCircle2 className="w-4 h-4" /> : isActive ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <span className="text-[10px] font-bold">{idx + 1}</span>}
                        </div>
                      </div>
                      <div className={`pb-2 transition-opacity duration-300 flex-1 ${isPending ? "opacity-40" : "opacity-100"}`}>
                        <div className="flex items-center justify-between">
                          <h5 className={`text-xs font-bold uppercase transition-colors ${isActive ? "text-indigo-800" : isDone ? "text-slate-700" : "text-slate-400"}`}>
                            {phase.label}
                          </h5>
                          {isLooping && (
                            <span className="text-[9px] font-black bg-purple-100 text-purple-700 px-1.5 py-[1px] rounded uppercase tracking-wider flex items-center gap-1">
                              {writerRealTimeMessage?.match(/\[(\d+차)\]/)?.[1] || "Loop"}
                            </span>
                          )}
                        </div>
                        <p className={`text-[11px] mt-0.5 pr-2 leading-relaxed ${isActive ? "text-indigo-700/90 font-medium" : "text-slate-500"}`}>
                          {isActive ? (writerRealTimeMessage || phase.description) : phase.description}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Reviewer AI Panel */}
          {reviewerPhases && (
            <div className={`rounded-2xl border flex flex-col transition-all duration-500 overflow-hidden ${reviewerCurrentPhase === "critique" ? "bg-emerald-50/40 border-emerald-200 shadow-sm" : reviewerCurrentPhase === "rewrite" ? "bg-violet-50/40 border-violet-200 shadow-sm" : reviewerCurrentPhase === "finalize" || reviewerCurrentPhase === "completed" || safeProgress === 100 ? "bg-blue-50/40 border-blue-200" : "bg-slate-50 border-slate-100"}`}>
              <div className={`px-5 py-4 shrink-0 border-b flex items-start gap-3 ${reviewerCurrentPhase === "critique" ? "bg-emerald-100/30 border-emerald-100" : reviewerCurrentPhase === "rewrite" ? "bg-violet-100/30 border-violet-100" : "bg-slate-100/50 border-slate-100"}`}>
                
                {/* Persona Avatar */}
                <div className="relative">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center border-2 ${reviewerCurrentPhase === "critique" ? "bg-emerald-600 border-emerald-200" : reviewerCurrentPhase === "rewrite" ? "bg-violet-500 border-violet-200" : reviewerCurrentPhase === "finalize" || reviewerCurrentPhase === "completed" || safeProgress === 100 ? "bg-blue-500 border-blue-200" : "bg-slate-300 border-slate-200"}`}>
                    <Bot className="w-5 h-5 text-white" />
                  </div>
                  {reviewerCurrentPhase === "critique" && (
                    <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-green-500 border-2 border-white rounded-full animate-pulse" />
                  )}
                  {reviewerCurrentPhase === "rewrite" && (
                    <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-violet-500 border-2 border-white rounded-full" />
                  )}
                </div>

                <div className="flex-1 pt-0.5">
                  <div className="flex items-center justify-between">
                    <h4 className={`text-sm font-bold flex items-center gap-2 ${reviewerCurrentPhase === "critique" ? "text-emerald-900" : reviewerCurrentPhase === "rewrite" ? "text-violet-900" : reviewerCurrentPhase === "finalize" || reviewerCurrentPhase === "completed" || safeProgress === 100 ? "text-blue-900" : "text-slate-600"}`}>
                      {reviewerTitle || "Reviewer AI"}
                    </h4>
                  </div>
                  {reviewerSubtitle && <p className={`text-[10px] mt-0.5 ${reviewerCurrentPhase === "critique" ? "text-emerald-700/70" : reviewerCurrentPhase === "rewrite" ? "text-violet-700/70" : "text-slate-500"}`}>{reviewerSubtitle}</p>}
                </div>
              </div>
              
              <div className="p-8 flex-1 flex flex-col items-center justify-center text-center min-h-[250px]">
                {reviewerCurrentPhase === "critique" ? (
                  <div className="flex flex-col items-center animate-in fade-in zoom-in duration-500">
                    <div className="w-16 h-16 rounded-2xl bg-emerald-100 flex items-center justify-center mb-5 relative ring-4 ring-emerald-50">
                      <div className="absolute inset-0 border-[3px] border-emerald-300 border-t-emerald-600 rounded-2xl animate-spin" />
                      <Bot className="w-8 h-8 text-emerald-600 relative z-10" />
                      <div className="absolute -bottom-1 -right-1 flex h-4 w-4 z-20">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                        <span className="relative inline-flex rounded-full h-4 w-4 bg-emerald-500 border-2 border-white"></span>
                      </div>
                    </div>
                    <div className="mb-2">
                       <span className="font-black text-emerald-700 text-sm tracking-widest uppercase flex items-center justify-center gap-1.5">
                         <Sparkles className="w-3.5 h-3.5" />
                         {reviewerRealTimeMessage?.match(/\[(\d+차)\]/)?.[1] ? `${reviewerRealTimeMessage.match(/\[(\d+차)\]/)?.[1]} Evaluating` : "Evaluating"}
                       </span>
                    </div>
                    <p className="text-xs text-emerald-800/80 max-w-[220px] leading-relaxed mx-auto font-medium">
                       {reviewerRealTimeMessage || "작성된 보고서의 품질을 엄격한 루브릭으로 다각도 분석 중입니다..."}
                    </p>
                  </div>
                ) : reviewerCurrentPhase === "rewrite" ? (
                  <div className="flex flex-col items-center animate-in fade-in zoom-in duration-500">
                    <div className="w-16 h-16 rounded-2xl bg-violet-100 flex items-center justify-center mb-5 relative">
                      <Bot className="w-8 h-8 text-violet-600" />
                      <div className="absolute -bottom-1 -right-1 bg-violet-500 rounded-full w-5 h-5 border-2 border-white flex items-center justify-center text-white">
                        <Sparkles className="w-3 h-3" />
                      </div>
                    </div>
                    <div className="mb-2">
                       <span className="font-black text-violet-700 text-sm tracking-widest uppercase">
                         Enhancing Quality
                       </span>
                    </div>
                    <p className="text-xs text-violet-800/80 max-w-[240px] leading-relaxed mx-auto font-medium">
                       보고서의 학술적 깊이를 더하기 위해 추가 피드백을 전달했습니다. 보다 완성도 높은 결과물을 다듬고 있습니다.
                    </p>
                  </div>
                ) : reviewerCurrentPhase === "finalize" || reviewerCurrentPhase === "completed" || safeProgress === 100 ? (
                  <div className="flex flex-col items-center animate-in fade-in zoom-in duration-500">
                    <div className="w-16 h-16 rounded-2xl bg-blue-50 flex items-center justify-center mb-5 relative">
                      <Bot className="w-8 h-8 text-blue-500" />
                      <div className="absolute -bottom-1.5 -right-1.5 bg-blue-500 rounded-full w-5 h-5 border-2 border-white flex items-center justify-center text-white">
                        <CheckCircle2 className="w-3.5 h-3.5" />
                      </div>
                    </div>
                    <div className="mb-2">
                       <span className="font-black text-blue-700 text-sm tracking-widest uppercase">
                         Evaluation Passed
                       </span>
                    </div>
                    <p className="text-xs text-slate-500 max-w-[220px] leading-relaxed mx-auto">
                       모든 품질 평가 기준을 통과했습니다.
                    </p>
                  </div>
                ) : (
                  <div className="flex flex-col items-center animate-in fade-in zoom-in duration-500">
                    <div className="w-16 h-16 rounded-2xl bg-slate-100 flex items-center justify-center mb-5">
                      <Bot className="w-8 h-8 text-slate-300" />
                    </div>
                    <div className="mb-2">
                       <span className="font-black text-slate-400 text-sm tracking-widest uppercase">
                         Standby
                       </span>
                    </div>
                    <p className="text-xs text-slate-400 max-w-[220px] leading-relaxed mx-auto">
                       Writer AI가 초안을 넘길 때까지 대기 중입니다.
                    </p>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      )}

      <div className="grid md:grid-cols-2 gap-6 pt-6 border-t border-slate-100">
        <div className="space-y-4">
          <div className="rounded-2xl border border-amber-100 bg-amber-50/50 p-8 shadow-sm relative overflow-hidden group h-full flex flex-col justify-center min-h-[200px]">
            <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:scale-110 transition-transform">
              <Lightbulb className="w-16 h-16 text-amber-500" />
            </div>
            <div className="flex items-center gap-2 mb-3">
              <span className="text-[10px] font-black text-amber-600 uppercase tracking-widest bg-amber-100 px-2 py-0.5 rounded-md">Research Tip</span>
            </div>
            <p className="text-sm text-slate-700 font-bold leading-relaxed pr-10">
              {currentTip}
            </p>
          </div>
        </div>

        <div className="h-full">
          {currentInteractiveQuiz && (
            <div className="rounded-2xl border border-amber-100 bg-amber-50/30 p-8 shadow-sm h-full flex flex-col">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <div className="p-1.5 rounded-xl bg-amber-100 text-amber-700">
                    <HelpCircle className="w-3.5 h-3.5" />
                  </div>
                  <p className="text-xs font-black text-amber-900 uppercase tracking-tight">연구 상식 퀴즈</p>
                </div>
                {selectedIdx !== null && (
                  <button onClick={handleNextQuiz} className="text-[10px] font-black bg-white/80 border border-amber-200 text-amber-900 px-3 py-1 rounded-lg hover:bg-white transition-all shadow-xs flex items-center gap-1">
                    다음 <ArrowRight className="w-3 h-3" />
                  </button>
                )}
              </div>

              <p className="text-sm text-slate-800 font-black mb-4 leading-snug">
                {currentInteractiveQuiz.question}
              </p>

              <div className="grid grid-cols-2 gap-2 mt-auto">
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
                        flex items-center justify-center p-2.5 rounded-xl border-2 transition-all duration-300 text-[11px] font-black
                        ${!showResult
                          ? "border-amber-100 bg-white text-amber-900 hover:border-amber-300 hover:shadow-sm"
                          : isSelected
                            ? isCorrect ? "border-emerald-500 bg-emerald-50 text-emerald-700" : "border-red-500 bg-red-50 text-red-700"
                            : isCorrect ? "border-emerald-200 bg-emerald-50/50 text-emerald-600 opacity-60" : "border-slate-50 bg-transparent text-slate-300 opacity-40"
                        }
                      `}
                    >
                      {option}
                    </button>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
