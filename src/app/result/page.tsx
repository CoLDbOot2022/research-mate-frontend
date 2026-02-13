"use client";

import React, { Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Check, RefreshCw, ArrowLeft, BookOpen, TrendingUp, Activity } from 'lucide-react';

function ResultContent() {
    const searchParams = useSearchParams();
    const router = useRouter();

    // Get params
    const subject = searchParams.get('subject') || 'Mathematics';
    // const topic = searchParams.get('topic') || 'Calculus';
    const major = searchParams.get('major') || 'General Science';

    // Mock Recommendations (would come from API)
    const recommendations = [
        {
            id: '1',
            title: 'Analysis of SIR Model',
            description: 'Use differential equations to model disease spread across populations over time.',
            reasoning: 'Connects your interest in Math with real-world biological applications (Epidemiology).',
            level: 'Advanced',
            tags: ['Calculus', 'Biology', 'Modeling'],
            color: 'bg-purple-100 text-purple-700',
        },
        {
            id: '2',
            title: 'Optimization in Logistics',
            description: 'Apply linear programming to solve complex supply chain routing problems.',
            reasoning: 'Perfect application of optimization theories for business and engineering contexts.',
            level: 'Applied',
            tags: ['Optimization', 'Business', 'Engineering'],
            color: 'bg-blue-100 text-blue-700',
        },
        {
            id: '3',
            title: 'Fluid Dynamics Simulation',
            description: 'Model fluid flow behavior using Navier-Stokes equations in 3D space.',
            reasoning: 'Excellent challenge for students aiming for Physics or Mechanical Engineering.',
            level: 'Advanced',
            tags: ['Physics', 'Simulation', 'Calculus'],
            color: 'bg-purple-100 text-purple-700',
        }
    ];

    const handleSelect = (id: string) => {
        // Navigate to report generation/display
        // In a real app, this might trigger a POST to generate the report first
        router.push(`/report?id=${id}`);
    };

    return (
        <div className="min-h-screen bg-slate-50 py-12 px-4 sm:px-6 lg:px-8 font-sans">
            <div className="max-w-5xl mx-auto">
                <div className="mb-8">
                    <Button variant="ghost" className="mb-4 pl-0 hover:pl-2 transition-all" onClick={() => router.back()}>
                        <ArrowLeft className="mr-2 h-4 w-4" /> Back to Search
                    </Button>
                    <h1 className="text-3xl font-bold text-slate-900">Recommended Research Topics</h1>
                    <p className="text-slate-600 mt-2 text-lg">
                        Based on your interest in <span className="font-semibold text-blue-600">{subject}</span>
                        {major ? <span> and <span className="font-semibold text-indigo-600">{major}</span></span> : ''}.
                    </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {recommendations.map((rec) => (
                        <Card key={rec.id} className="flex flex-col border-none shadow-lg hover:shadow-xl transition-shadow duration-300">
                            <CardHeader className="pb-4">
                                <div className="flex justify-between items-start mb-2">
                                    <Badge className={`${rec.color} hover:bg-opacity-80 border-none px-3 py-1 text-xs uppercase tracking-wide`}>
                                        {rec.level}
                                    </Badge>
                                </div>
                                <CardTitle className="text-xl font-bold text-slate-800 leading-tight">
                                    {rec.title}
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="flex-grow space-y-4">
                                <p className="text-slate-600 text-sm leading-relaxed">
                                    {rec.description}
                                </p>
                                <div className="bg-slate-50 p-3 rounded-lg border border-slate-100">
                                    <p className="text-xs font-semibold text-slate-500 mb-1 flex items-center">
                                        <TrendingUp className="w-3 h-3 mr-1" /> Why this topic?
                                    </p>
                                    <p className="text-xs text-slate-700 italic">
                                        "{rec.reasoning}"
                                    </p>
                                </div>
                                <div className="flex flex-wrap gap-2 mt-2">
                                    {rec.tags.map(tag => (
                                        <span key={tag} className="px-2 py-1 bg-gray-100 text-gray-500 text-xs rounded-md font-medium">
                                            #{tag}
                                        </span>
                                    ))}
                                </div>
                            </CardContent>
                            <CardFooter className="pt-6 border-t border-slate-100">
                                <Button
                                    className="w-full bg-blue-600 hover:bg-blue-700 text-white shadow-md transition-all h-11 text-base font-medium"
                                    onClick={() => handleSelect(rec.id)}
                                >
                                    Select Topic
                                </Button>
                            </CardFooter>
                        </Card>
                    ))}
                </div>

                <div className="mt-12 text-center">
                    <Button variant="outline" className="gap-2 text-slate-500 border-slate-300 hover:text-blue-600 hover:border-blue-300 bg-white">
                        <RefreshCw className="w-4 h-4" />
                        Regenerate Recommendations
                    </Button>
                </div>
            </div>
        </div>
    );
}

export default function ResultPage() {
    return (
        <Suspense fallback={<div className="flex items-center justify-center min-h-screen text-slate-400">Loading recommendations...</div>}>
            <ResultContent />
        </Suspense>
    );
}
