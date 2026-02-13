'use client'

import { useState, useTransition } from 'react'
import { updateProfile } from '@/app/auth/actions'
import { Loader2, GraduationCap, School, BookOpen, Briefcase } from 'lucide-react'

export default function OnboardingForm() {
    const [isPending, startTransition] = useTransition()
    const [error, setError] = useState<string | null>(null)
    const [schoolLevel, setSchoolLevel] = useState('elementary')

    async function handleSubmit(formData: FormData) {
        setError(null)
        startTransition(async () => {
            const result = await updateProfile(null, formData)
            if (result?.error) {
                setError(result.error)
            }
        })
    }

    return (
        <div className="w-full max-w-lg space-y-8 bg-white p-8 rounded-2xl shadow-[0_2px_15px_-3px_rgba(0,0,0,0.07),0_10px_20px_-2px_rgba(0,0,0,0.04)] ring-1 ring-gray-900/5">
            <div className="text-center">
                <h2 className="text-3xl font-bold tracking-tight text-gray-900">
                    Complete your profile
                </h2>
                <p className="mt-2 text-sm text-gray-600">
                    Tell us a bit about yourself so we can personalize your research experience.
                </p>
            </div>

            <form action={handleSubmit} className="mt-8 space-y-6">
                <div className="space-y-5">
                    <div>
                        <label htmlFor="name" className="block text-sm font-medium leading-6 text-gray-900">
                            Full Name
                        </label>
                        <div className="relative mt-2">
                            <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                                <span className="text-gray-400 text-sm">Aa</span>
                            </div>
                            <input
                                id="name"
                                name="name"
                                type="text"
                                required
                                className="block w-full rounded-md border-0 py-2.5 pl-10 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
                                placeholder="Jane Doe"
                            />
                        </div>
                    </div>

                    <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
                        <div>
                            <label htmlFor="school_level" className="block text-sm font-medium leading-6 text-gray-900">
                                School Level
                            </label>
                            <div className="relative mt-2">
                                <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                                    <School className="h-5 w-5 text-gray-400" />
                                </div>
                                <select
                                    id="school_level"
                                    name="school_level"
                                    required
                                    value={schoolLevel}
                                    onChange={(e) => setSchoolLevel(e.target.value)}
                                    className="block w-full rounded-md border-0 py-2.5 pl-10 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
                                >
                                    <option value="elementary">Elementary School</option>
                                    <option value="middle">Middle School</option>
                                    <option value="high">High School</option>
                                </select>
                            </div>
                        </div>

                        <div>
                            <label htmlFor="grade" className="block text-sm font-medium leading-6 text-gray-900">
                                Grade
                            </label>
                            <div className="relative mt-2">
                                <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                                    <GraduationCap className="h-5 w-5 text-gray-400" />
                                </div>
                                <select
                                    id="grade"
                                    name="grade"
                                    required
                                    className="block w-full rounded-md border-0 py-2.5 pl-10 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
                                >
                                    {schoolLevel === 'elementary' ? (
                                        Array.from({ length: 6 }, (_, i) => i + 1).map((g) => (
                                            <option key={g} value={g}>{g}th Grade</option>
                                        ))
                                    ) : (
                                        Array.from({ length: 3 }, (_, i) => i + 1).map((g) => (
                                            <option key={g} value={g}>{g}rd Grade</option> // using 'rd' generic suffix logic or just number
                                        ))
                                    )}
                                    {/* Fallback rendering for nicer suffixes if needed, but simple numbers are fine */}
                                </select>
                            </div>
                        </div>
                    </div>

                    <div>
                        <label htmlFor="career_interest" className="block text-sm font-medium leading-6 text-gray-900">
                            Dream Career / Interest
                        </label>
                        <div className="relative mt-2">
                            <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                                <Briefcase className="h-5 w-5 text-gray-400" />
                            </div>
                            <input
                                id="career_interest"
                                name="career_interest"
                                type="text"
                                required
                                className="block w-full rounded-md border-0 py-2.5 pl-10 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
                                placeholder="e.g. Scientist, Engineer, Doctor..."
                            />
                        </div>
                    </div>
                </div>

                {error && (
                    <div className="rounded-md bg-red-50 p-4">
                        <div className="flex">
                            <div className="ml-3">
                                <h3 className="text-sm font-medium text-red-800">
                                    Error
                                </h3>
                                <div className="mt-2 text-sm text-red-700">
                                    <p>{error}</p>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                <button
                    type="submit"
                    disabled={isPending}
                    className="flex w-full justify-center rounded-lg bg-indigo-600 px-3 py-2.5 text-sm font-semibold leading-6 text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                >
                    {isPending ? <Loader2 className="animate-spin h-5 w-5" /> : 'Complete Profile'}
                </button>
            </form>
        </div>
    )
}
