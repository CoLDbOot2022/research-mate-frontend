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

const MENTORS: Mentor[] = [];

export default function MentorsPage() {
  useEffect(() => { track.mentorsPageViewed(); }, []);

  return (
    <div className="min-h-screen bg-[#fdfdff] py-16 px-4">
      <div className="max-w-6xl mx-auto space-y-12">
        
        {/* Header Section - Simplified */}
        <div className="text-center space-y-3">
          <h1 className="text-3xl font-black tracking-tight text-slate-900 uppercase">
            Our Academic Mentors
          </h1>
          <div className="w-12 h-1 bg-indigo-600 mx-auto rounded-full" />
        </div>

        {/* Mentors Grid - More columns, smaller cards */}
        {MENTORS.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {MENTORS.map((mentor) => (
              <Card key={mentor.name} className="group overflow-hidden border-slate-200/60 bg-white transition-all hover:shadow-md hover:-translate-y-1 rounded-3xl">
                <CardContent className="p-6">
                  <div className="flex flex-col items-center text-center space-y-4">
                    {/* Avatar - Smaller */}
                    <div className="w-16 h-16 rounded-2xl bg-slate-50 border border-slate-100 flex items-center justify-center shrink-0 shadow-sm group-hover:bg-indigo-50 transition-colors">
                      <span className="text-xl font-black text-slate-400 group-hover:text-indigo-600 transition-colors">
                        {mentor.name[0]}
                      </span>
                    </div>
   
                    <div className="space-y-1">
                      <div className="flex items-center justify-center gap-1.5">
                        <h3 className="text-lg font-bold text-slate-900">{mentor.name}</h3>
                        {mentor.hanja && <span className="text-[10px] font-medium text-slate-300">{mentor.hanja}</span>}
                      </div>
                      <p className="text-[10px] font-bold text-indigo-600 bg-indigo-50/50 px-2.5 py-1 rounded-lg">
                        {mentor.title}
                      </p>
                    </div>
   
                    <div className="w-full pt-4 border-t border-slate-50 space-y-3">
                      <div className="grid gap-2">
                        {mentor.highlights.map((h, idx) => (
                          <div key={idx} className="flex gap-2 items-start text-left">
                            <div className="mt-1 rounded-full bg-emerald-50 p-0.5 text-emerald-600">
                              <CheckCircle2 className="w-2.5 h-2.5" />
                            </div>
                            <p className="text-[11px] text-slate-500 font-medium leading-tight">{h}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <div className="py-20 text-center border-2 border-dashed border-slate-100 rounded-[3rem] bg-slate-50/50">
            <p className="text-slate-400 font-bold">새로운 멘토진이 순차적으로 업데이트될 예정입니다.</p>
          </div>
        )}

      </div>
    </div>
  );
}
