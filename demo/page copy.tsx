"use client";

import React, { useState, Suspense, useEffect, useRef } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import { Card, CardContent } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ArrowRight, Sparkles, Zap, GraduationCap, Microscope, ChevronDown, Check } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { useMindMap } from '@/context/MindMapContext';

function SearchPageContent() {
    const router = useRouter();
    const { setHistoryRoot, setCurrentNode, setSeenTopics } = useMindMap();
    const searchParams = useSearchParams();
    const subjectParam = searchParams.get('subject');

    // Curriculum State keys
    const [largeUnit, setLargeUnit] = useState('');
    const [mediumUnit, setMediumUnit] = useState('');
    const [smallUnit, setSmallUnit] = useState('');
    const [major, setMajor] = useState('');
    const [difficulty, setDifficulty] = useState([50]); // 0: Basic, 50: Applied, 100: Advanced

    // Supabase State
    const [mathSubjects, setMathSubjects] = useState<{ id: number, name: string }[]>([]);
    const [loadingSubjects, setLoadingSubjects] = useState(true);
    const [selectedSubject, setSelectedSubject] = useState<string>('');
    const [isSubjectOpen, setIsSubjectOpen] = useState(false);
    const subjectWrapperRef = useRef<HTMLDivElement>(null);

    // Curriculum State
    const [curriculum, setCurriculum] = useState<{ id: number, unit_large: string, unit_medium: string, unit_small: string }[]>([]);

    // Error State
    const [errors, setErrors] = useState({
        subject: false,
        unit: false,
        major: false
    });

    // Derived Options
    const uniqueLargeUnits = React.useMemo(() => {
        const units = new Set(curriculum.map(c => c.unit_large).filter(Boolean));
        return Array.from(units);
    }, [curriculum]);

    const uniqueMediumUnits = React.useMemo(() => {
        if (!largeUnit || largeUnit === '_none_') return [];
        const units = new Set(
            curriculum
                .filter(c => c.unit_large === largeUnit)
                .map(c => c.unit_medium)
                .filter(Boolean)
        );
        return Array.from(units);
    }, [curriculum, largeUnit]);

    const uniqueSmallUnits = React.useMemo(() => {
        if (!mediumUnit || mediumUnit === '_none_') return [];
        const units = new Set(
            curriculum
                .filter(c => c.unit_medium === mediumUnit)
                .map(c => c.unit_small)
                .filter(Boolean)
        );
        return Array.from(units);
    }, [curriculum, mediumUnit]);


    // Click outside handler
    useEffect(() => {
        function handleClickOutside(event: MouseEvent) {
            if (subjectWrapperRef.current && !subjectWrapperRef.current.contains(event.target as Node)) {
                setIsSubjectOpen(false);
            }
        }
        document.addEventListener("mousedown", handleClickOutside);
        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, []);

    // Fetch Math Subjects
    useEffect(() => {
        const fetchSubjects = async () => {
            try {
                const { data, error } = await supabase
                    .from('math_subjects')
                    .select('*')
                    .order('id', { ascending: true });

                if (error) throw error;
                if (data) {
                    setMathSubjects(data);
                }

            } catch (error) {
                console.error('Error fetching subjects:', error);
            } finally {
                setLoadingSubjects(false);
            }
        };

        fetchSubjects();
    }, []);

    // Fetch Curriculum when Subject Changes
    useEffect(() => {
        const fetchCurriculum = async () => {
            if (!selectedSubject) return;

            try {
                const { data, error } = await supabase
                    .from('math_curriculum')
                    .select('*')
                    .eq('subject', selectedSubject)
                    .order('id', { ascending: true });

                if (error) throw error;
                if (data) {
                    setCurriculum(data);
                    // Reset selections
                    setLargeUnit('');
                    setMediumUnit('');
                    setSmallUnit('');
                }
            } catch (error) {
                console.error('Error fetching curriculum:', error);
            }
        };

        fetchCurriculum();
    }, [selectedSubject]);

    const handleSearch = () => {
        // Reset errors
        setErrors({ subject: false, unit: false, major: false });

        // Navigate to result page with query params
        // Use the most specific selected unit as the topic
        // Filter out '_none_' and empty strings
        // Create a hierarchical string: "Large > Medium > Small"
        const finalTopic = [largeUnit, mediumUnit, smallUnit]
            .filter(t => t && t !== '_none_')
            .join(' > ');

        const newErrors = {
            subject: !selectedSubject,
            unit: false, // Optional now
            major: false // Optional now
        };

        if (newErrors.subject || newErrors.unit || newErrors.major) {
            setErrors(newErrors);
            return;
        }

        // UNCONDITIONAL CLEAR: Start New Session
        setHistoryRoot(null);
        setCurrentNode(null);
        setSeenTopics([]);

        const query = new URLSearchParams({
            subject: 'math', // Force math as per requirement
            selectedSubject, // Pass the specific math subject chosen
            topic: finalTopic, // Keyword
            major,
            difficulty: difficulty[0].toString()
        });
        router.push(`/result?${query.toString()}`);
    };

    const getDifficultyLabel = (val: number) => {
        if (val < 33) return { label: '기초 (생활 속 예시)', desc: '일상적 현상을 교과 원리로 설명', icon: <Sparkles className="w-5 h-5 text-green-500" />, bg: 'bg-green-100' };
        if (val > 66) return { label: '심화 (논문/전공 기초)', desc: '전문 지식 및 학술 논문 활용', icon: <Microscope className="w-5 h-5 text-purple-500" />, bg: 'bg-purple-100' };
        return { label: '응용 (교과 연계)', desc: '교과 개념을 다른 분야와 융합', icon: <GraduationCap className="w-5 h-5 text-blue-500" />, bg: 'bg-blue-100' };
    };

    const currentDiff = getDifficultyLabel(difficulty[0]);

    return (
        <div className="bg-slate-50 min-h-[calc(100vh-64px)] py-12">
            <div className="container mx-auto max-w-4xl px-4">
                <div className="text-center mb-12">
                    <div className="inline-block px-3 py-1 rounded-full bg-blue-100 text-blue-600 font-bold text-sm mb-4">
                        STEP 2. 탐구 설정
                    </div>
                    <h1 className="text-4xl font-bold text-slate-900 mb-4">
                        교과서 속 개념, 나만의 경쟁력으로.
                    </h1>
                    <p className="text-gray-500 text-lg">
                        현재 배우고 있는 내용을 입력하면, 진로와 연결된 심화 탐구 주제를 맞춤 추천해 드립니다.
                    </p>
                </div>

                <Card className="mb-8 border-none shadow-lg overflow-visible">
                    <CardContent className="p-8 space-y-8">
                        {/* Subject Selection */}
                        <div className="space-y-4">
                            <div className="space-y-2 relative" ref={subjectWrapperRef}>
                                <Label className="font-bold text-lg">어떤 과목을 공부하고 있나요?</Label>
                                <div className="relative">
                                    <Input
                                        className={`h-14 text-lg pr-10 border-slate-200 focus:border-blue-500 transition-colors ${errors.subject ? 'border-red-500 bg-red-50 placeholder:text-red-400' : 'bg-gray-50/50'
                                            }`}
                                        placeholder={loadingSubjects ? "로딩 중..." : "과목을 선택해주세요 (예: 공통 수학1)"}
                                        value={selectedSubject}
                                        onChange={(e) => {
                                            setSelectedSubject(e.target.value);
                                            setIsSubjectOpen(true);
                                            if (errors.subject) setErrors(prev => ({ ...prev, subject: false }));
                                        }}
                                        onFocus={() => setIsSubjectOpen(true)}
                                        disabled={loadingSubjects}
                                    />
                                    <div
                                        className="absolute right-4 top-4 cursor-pointer text-gray-400"
                                        onClick={() => !loadingSubjects && setIsSubjectOpen(!isSubjectOpen)}
                                    >
                                        <ChevronDown className="w-6 h-6" />
                                    </div>
                                </div>

                                {isSubjectOpen && mathSubjects.length > 0 && (
                                    <div className="absolute z-50 w-full mt-2 bg-white border border-gray-200 rounded-xl shadow-xl max-h-60 overflow-auto">
                                        {/* Matches */}
                                        {mathSubjects
                                            .filter(sub => sub.name.toLowerCase().includes(selectedSubject.toLowerCase()))
                                            .map((sub) => (
                                                <div
                                                    key={sub.id}
                                                    className="px-6 py-4 hover:bg-blue-50 cursor-pointer text-base text-slate-900 font-bold bg-blue-50/30 transition-colors flex items-center justify-between border-b border-slate-100 last:border-0"
                                                    onClick={() => {
                                                        setSelectedSubject(sub.name);
                                                        setIsSubjectOpen(false);
                                                        if (errors.subject) setErrors(prev => ({ ...prev, subject: false }));
                                                    }}
                                                >
                                                    {sub.name}
                                                    {selectedSubject === sub.name && <Check className="w-5 h-5 text-blue-600" />}
                                                </div>
                                            ))
                                        }

                                        {/* Separator if needed (optional, using bg color to distinguish matches) */}

                                        {/* Others */}
                                        {mathSubjects
                                            .filter(sub => !sub.name.toLowerCase().includes(selectedSubject.toLowerCase()))
                                            .map((sub) => (
                                                <div
                                                    key={sub.id}
                                                    className="px-6 py-4 hover:bg-blue-50 cursor-pointer text-base text-slate-500 font-medium transition-colors flex items-center justify-between border-b border-slate-100 last:border-0"
                                                    onClick={() => {
                                                        setSelectedSubject(sub.name);
                                                        setIsSubjectOpen(false);
                                                        if (errors.subject) setErrors(prev => ({ ...prev, subject: false }));
                                                    }}
                                                >
                                                    {sub.name}
                                                    {selectedSubject === sub.name && <Check className="w-5 h-5 text-blue-600" />}
                                                </div>
                                            ))
                                        }
                                    </div>
                                )}
                            </div>
                        </div>

                        <div className="border-t border-slate-100 my-6"></div>

                        {/* Hierarchical Unit Selection */}
                        <div className="space-y-4">
                            <Label className="font-bold text-lg">현재 배우고 있는 단원은 어디인가요?</Label>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                {/* Large Unit */}
                                <div className="space-y-2">
                                    <Label className="text-sm text-gray-500 font-medium">대단원</Label>
                                    <Select
                                        value={largeUnit}
                                        onValueChange={(val) => {
                                            setLargeUnit(val);
                                            setMediumUnit('');
                                            setSmallUnit('');
                                            if (errors.unit) setErrors(prev => ({ ...prev, unit: false }));
                                        }}
                                        disabled={!selectedSubject}
                                    >
                                        <SelectTrigger className={`h-12 ${errors.unit ? 'border-red-500 bg-red-50 text-red-900' : 'bg-gray-50/50'}`}>
                                            <SelectValue placeholder="대단원 선택" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="_none_">선택 안 함</SelectItem>
                                            {uniqueLargeUnits.map((unit) => (
                                                <SelectItem key={unit} value={unit}>{unit}</SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>

                                {/* Medium Unit */}
                                <div className="space-y-2">
                                    <Label className="text-sm text-gray-500 font-medium">중단원</Label>
                                    <Select
                                        value={mediumUnit}
                                        onValueChange={(val) => {
                                            setMediumUnit(val);
                                            setSmallUnit('');
                                        }}
                                        disabled={!largeUnit || largeUnit === '_none_'}
                                    >
                                        <SelectTrigger className="h-12 bg-gray-50/50">
                                            <SelectValue placeholder="중단원 선택" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="_none_" className="text-gray-500">선택 안 함</SelectItem>
                                            {uniqueMediumUnits.map((unit) => (
                                                <SelectItem key={unit} value={unit}>{unit}</SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>

                                {/* Small Unit */}
                                <div className="space-y-2">
                                    <Label className="text-sm text-gray-500 font-medium">소단원</Label>
                                    <Select
                                        value={smallUnit}
                                        onValueChange={setSmallUnit}
                                        disabled={!mediumUnit || mediumUnit === '_none_'}
                                    >
                                        <SelectTrigger className="h-12 bg-gray-50/50">
                                            <SelectValue placeholder="소단원 선택" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="_none_" className="text-gray-500">선택 안 함</SelectItem>
                                            {uniqueSmallUnits.map((unit) => (
                                                <SelectItem key={unit} value={unit}>{unit}</SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>
                            </div>
                        </div>

                        <div className="border-t border-slate-100 my-6"></div>

                        {/* Major / Career */}
                        <div className="space-y-4">
                            <Label className="font-bold text-lg">희망 진로, 관심 분야 (선택)</Label>
                            <Input
                                className={`h-14 text-lg border-slate-200 focus:border-blue-500 transition-colors bg-gray-50/50`}
                                placeholder="예: 인공지능 연구원, 데이터 사이언스, 반도체 공학 등"
                                value={major}
                                onChange={(e) => {
                                    setMajor(e.target.value);
                                    // No error tracking needed for optional field
                                }}
                            />
                        </div>

                    </CardContent>
                </Card>

                <Card className="mb-8 border-none shadow-lg">
                    <CardContent className="p-8">
                        <div className="flex items-center justify-between mb-8">
                            <h3 className="text-xl font-bold flex items-center gap-2">
                                <Zap className="text-yellow-500 fill-current" /> 탐구 난이도 조절
                            </h3>
                            <div className={`px-3 py-1 rounded-full text-sm font-bold ${currentDiff.bg} text-slate-700 flex items-center gap-2`}>
                                {currentDiff.label}
                            </div>
                        </div>

                        <div className="px-4 mb-12">
                            <Slider
                                defaultValue={[50]}
                                max={100}
                                step={1}
                                value={difficulty}
                                onValueChange={setDifficulty}
                                onValueCommit={(val) => {
                                    const value = val[0];
                                    let snapped = 50;
                                    if (value < 33) snapped = 0;
                                    else if (value > 66) snapped = 100;
                                    setDifficulty([snapped]);
                                }}
                                className="py-4"
                            />
                            <div className="flex justify-between text-sm text-gray-400 mt-2 font-medium">
                                <span>기초</span>
                                <span>응용</span>
                                <span>심화</span>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            {[
                                { type: '기초', label: '생활 속 예시', desc: '일상적 현상을 교과 원리로 설명', color: 'bg-green-50 text-green-700', val: 0 },
                                { type: '응용', label: '교과 연계', desc: '교과 개념을 다른 분야와 융합', color: 'bg-blue-50 text-blue-700', val: 50 },
                                { type: '심화', label: '논문/전공 기초', desc: '전문 지식 및 학술 논문 활용', color: 'bg-purple-50 text-purple-700', val: 100 }
                            ].map((item, idx) => (
                                <div
                                    key={idx}
                                    className={`p-4 rounded-xl border transition-all cursor-pointer hover:shadow-md ${(item.type === '기초' && difficulty[0] < 33) ||
                                        (item.type === '응용' && difficulty[0] >= 33 && difficulty[0] <= 66) ||
                                        (item.type === '심화' && difficulty[0] > 66)
                                        ? 'border-blue-500 bg-blue-50/50 ring-2 ring-blue-100'
                                        : 'border-slate-100 bg-slate-50 hover:bg-white hover:border-slate-200'
                                        }`}
                                    onClick={() => setDifficulty([item.val])}
                                >
                                    <div className="flex items-center gap-2 mb-2">
                                        <span className={`w-2 h-2 rounded-full ${item.type === '기초' ? 'bg-green-500' : item.type === '응용' ? 'bg-blue-500' : 'bg-purple-500'}`} />
                                        <span className="font-bold text-sm">{item.type} ({item.label})</span>
                                    </div>
                                    <ul className="text-xs text-gray-500 space-y-1 list-disc pl-4">
                                        <li>{item.desc}</li>
                                        <li>학생부 세특 기재에 최적화</li>
                                    </ul>
                                </div>
                            ))}
                        </div>

                        <div className="flex justify-end mt-8">
                            <Button size="lg" className="h-12 px-8 text-lg bg-blue-600 hover:bg-blue-700" onClick={handleSearch}>
                                주제 탐색하기 <ArrowRight className="ml-2 w-5 h-5" />
                            </Button>
                        </div>

                    </CardContent>
                </Card>
            </div>
        </div>
    );
}

export default function SearchPage() {
    return (
        <Suspense fallback={<div>Loading...</div>}>
            <SearchPageContent />
        </Suspense>
    );
}
