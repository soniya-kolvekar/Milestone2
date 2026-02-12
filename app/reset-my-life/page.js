'use client';
import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Loader2, Moon, Sun, Calendar, CheckCircle2, ArrowRight, ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import { auth } from '../../firebase';
import { onAuthStateChanged } from 'firebase/auth';

export default function ResetLifePage() {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const [habitData, setHabitData] = useState([]);

    const [isGenerating, setIsGenerating] = useState(false);
    const [resetPlan, setResetPlan] = useState(null);
    const [activePlan, setActivePlan] = useState(null);
    const [saveStatus, setSaveStatus] = useState('idle');

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
            setUser(currentUser);
            if (currentUser) {
                await Promise.all([
                    fetchHabits(currentUser.uid),
                    fetchActivePlan(currentUser.uid)
                ]);
            }
            setLoading(false);
        });
        return () => unsubscribe();
    }, []);

    const fetchHabits = async (userId) => {
        try {
            const res = await fetch(`/api/habits?userId=${userId}`);
            if (res.ok) {
                const data = await res.json();
                setHabitData(data.slice(0, 14));
            }
        } catch (error) {
            console.error("Error fetching habits:", error);
        }
    };

    const fetchActivePlan = async (userId) => {
        try {
            const res = await fetch(`/api/reset-plan-history?userId=${userId}`);
            if (res.ok) {
                const data = await res.json();
                if (data) {
                    setActivePlan(data);
                }
            }
        } catch (error) {
            console.error("Error fetching active plan:", error);
        }
    };

    const generatePlan = async () => {
        setIsGenerating(true);
        setResetPlan(null);
        try {
            const res = await fetch('/api/reset-plan', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    habitData: habitData,
                    timeContext: new Date().toLocaleString()
                })
            });

            if (!res.ok) throw new Error("Failed to generate plan");

            const data = await res.json();
            setResetPlan(data);
        } catch (error) {
            console.error(error);
            alert("Failed to generate plan. Please try again.");
        } finally {
            setIsGenerating(false);
        }
    };

    const handleSavePlan = async () => {
        if (!user || !resetPlan) return;
        setSaveStatus('saving');
        try {
            const res = await fetch('/api/reset-plan-history', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    userId: user.uid,
                    plan: resetPlan
                })
            });

            if (res.ok) {
                setSaveStatus('saved');
                const savedData = await res.json();
                setActivePlan({ id: savedData.id, ...resetPlan, status: 'active', startDate: new Date().toISOString() });
                setTimeout(() => {
                    setResetPlan(null);
                    setSaveStatus('idle');
                }, 1000);
            } else {
                throw new Error("Failed to save");
            }
        } catch (error) {
            console.error("Failed to save plan:", error);
            setSaveStatus('error');
            alert("Failed to save plan. Please try again.");
        }
    };

    const toggleDayCompletion = async (dayIndex, currentStatus) => {
        if (!user || !activePlan?.id) return;

        const updatedDailyPlan = [...activePlan.daily_plan];
        updatedDailyPlan[dayIndex] = { ...updatedDailyPlan[dayIndex], completed: !currentStatus };
        setActivePlan({ ...activePlan, daily_plan: updatedDailyPlan });

        try {
            const res = await fetch('/api/reset-plan-history', {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    userId: user.uid,
                    planId: activePlan.id,
                    dayIndex: dayIndex,
                    completed: !currentStatus
                })
            });

            if (!res.ok) {

                updatedDailyPlan[dayIndex] = { ...updatedDailyPlan[dayIndex], completed: currentStatus };
                setActivePlan({ ...activePlan, daily_plan: updatedDailyPlan });
                console.error("Failed to update status");
            }
        } catch (error) {
            console.error("Error updating status:", error);

            updatedDailyPlan[dayIndex] = { ...updatedDailyPlan[dayIndex], completed: currentStatus };
            setActivePlan({ ...activePlan, daily_plan: updatedDailyPlan });
        }
    };

    const renderPlanContent = (plan, isInteractive) => (
        <>
            <div className="bg-purple-500/10 border border-purple-500/20 p-6 rounded-2xl">
                <p className="text-purple-200 text-lg italic leading-relaxed text-center">
                    "{plan.analysis_summary}"
                </p>
            </div>

            <div className="grid md:grid-cols-2 gap-6">
                <div className="bg-white/5 p-6 rounded-2xl border border-white/10">
                    <div className="flex items-center gap-2 text-pink-300 mb-6 border-b border-white/10 pb-3">
                        <Moon className="w-5 h-5" />
                        <h3 className="font-semibold uppercase tracking-wider text-sm">Let's Pause</h3>
                    </div>
                    <div className="space-y-4">
                        {plan.stop_habits.map((habit, i) => (
                            <motion.div
                                key={i}
                                initial={{ x: -20, opacity: 0 }}
                                animate={{ x: 0, opacity: 1 }}
                                transition={{ delay: i * 0.1 }}
                                className="flex items-start gap-4 p-3 hover:bg-white/5 rounded-xl transition-colors"
                            >
                                <span className="text-pink-400 font-bold opacity-50 bg-pink-500/10 w-8 h-8 flex items-center justify-center rounded-full text-sm">0{i + 1}</span>
                                <p className="text-white/90 text-sm py-1">{habit}</p>
                            </motion.div>
                        ))}
                    </div>
                </div>

                <div className="bg-white/5 p-6 rounded-2xl border border-white/10">
                    <div className="flex items-center gap-2 text-emerald-300 mb-6 border-b border-white/10 pb-3">
                        <Sun className="w-5 h-5" />
                        <h3 className="font-semibold uppercase tracking-wider text-sm">Let's Begin</h3>
                    </div>
                    <div className="space-y-4">
                        {plan.start_habits.map((habit, i) => (
                            <motion.div
                                key={i}
                                initial={{ x: 20, opacity: 0 }}
                                animate={{ x: 0, opacity: 1 }}
                                transition={{ delay: i * 0.1 }}
                                className="flex items-start gap-4 p-3 hover:bg-white/5 rounded-xl transition-colors"
                            >
                                <span className="text-emerald-400 font-bold opacity-50 bg-emerald-500/10 w-8 h-8 flex items-center justify-center rounded-full text-sm">0{i + 1}</span>
                                <p className="text-white/90 text-sm py-1">{habit}</p>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </div>

            <div>
                <div className="flex items-center gap-2 text-blue-300 mb-6 mt-8">
                    <Calendar className="w-6 h-6" />
                    <h3 className="text-xl font-bold">Your 7-Day Gentle Roadmap</h3>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                    {plan.daily_plan.map((day, i) => {
                        const isCompleted = isInteractive && day.completed;
                        return (
                            <motion.div
                                key={i}
                                initial={{ y: 20, opacity: 0 }}
                                animate={{ y: 0, opacity: 1 }}
                                transition={{ delay: 0.2 + (i * 0.05) }}
                                className={`rounded-xl p-5 border transition-all hover:-translate-y-1 relative overflow-hidden ${isCompleted
                                    ? 'bg-emerald-500/10 border-emerald-500/30'
                                    : i === 0 && !isInteractive
                                        ? 'ring-2 ring-blue-400/50 bg-blue-500/10 border-white/10'
                                        : 'bg-white/5 border-white/10 hover:bg-white/10'
                                    }`}
                            >
                                {isInteractive && (
                                    <div className="absolute top-3 right-3">
                                        <button
                                            onClick={() => toggleDayCompletion(i, day.completed)}
                                            className={`w-6 h-6 rounded-full border flex items-center justify-center transition-all ${isCompleted
                                                ? 'bg-emerald-500 border-emerald-500 text-white'
                                                : 'border-white/30 hover:border-white/60'
                                                }`}
                                        >
                                            {isCompleted && <CheckCircle2 className="w-4 h-4" />}
                                        </button>
                                    </div>
                                )}

                                <div className="flex justify-between items-start mb-3">
                                    <span className={`text-xs font-bold uppercase tracking-widest ${isCompleted ? 'text-emerald-400' : 'text-white/50'}`}>
                                        {day.day}
                                    </span>
                                    {!isInteractive && i === 0 && <span className="text-[10px] bg-blue-500 text-white px-2 py-0.5 rounded-full font-medium">Start Today</span>}
                                </div>
                                <h4 className={`font-bold mb-3 text-lg ${isCompleted ? 'text-emerald-100 line-through opacity-70' : 'text-white'}`}>
                                    {day.theme}
                                </h4>

                                <div className={`space-y-3 mb-4 ${isCompleted ? 'opacity-60' : ''}`}>
                                    <div className="text-sm text-white/80 bg-black/20 p-2 rounded-lg">
                                        <span className="text-blue-300 font-semibold block text-xs mb-1 uppercase">Action</span> {day.action}
                                    </div>
                                    <div className="text-sm text-white/80 bg-black/20 p-2 rounded-lg">
                                        <span className="text-purple-300 font-semibold block text-xs mb-1 uppercase">Mindset</span> {day.support}
                                    </div>
                                </div>

                                <div className="pt-3 border-t border-white/10">
                                    <p className="text-xs text-white/50 italic text-center">"{day.affirmation}"</p>
                                </div>
                            </motion.div>
                        );
                    })}
                </div>
            </div>
        </>
    );

    if (loading) {
        return <div className="min-h-screen bg-[#1a1625] flex items-center justify-center text-white"><Loader2 className="animate-spin w-8 h-8" /></div>;
    }

    if (!user) {
        return (
            <div className="min-h-screen bg-[#1a1625] flex flex-col items-center justify-center text-white space-y-4 p-4 text-center">
                <h1 className="text-2xl font-bold">Please Log In</h1>
                <p className="text-white/60">You need to be logged in to access your habit data.</p>
                <Link href="/login" className="bg-purple-600 px-6 py-2 rounded-xl hover:bg-purple-500 transition-colors">Go to Login</Link>
            </div>
        )
    }

    return (
        <div className="min-h-screen bg-gradient-to-b from-[#3A1C4A] to-[#8E5AA8] text-white p-6 md:p-12 relative overflow-hidden">
            <div className="absolute inset-0 opacity-20 blur-3xl bg-[radial-gradient(circle_at_20%_20%,#ffffff22,transparent_40%),radial-gradient(circle_at_80%_80%,#ffffff22,transparent_40%)] pointer-events-none" />

            <div className="relative z-10 max-w-5xl mx-auto">
                <nav className="mb-8">
                    <Link href="/explore" className="flex items-center gap-2 text-white/70 hover:text-white transition-colors w-fit">
                        <ArrowLeft className="w-5 h-5" /> Back to Explore
                    </Link>
                </nav>

                <div className="text-center mb-12">
                    <h1 className="text-4xl md:text-5xl font-bold tracking-tight mb-4 bg-gradient-to-r from-purple-200 to-pink-200 bg-clip-text text-transparent">
                        Reset My Life
                    </h1>
                    <p className="text-lg text-purple-100/80 max-w-2xl mx-auto">
                        A gentle, data-driven space to pause, reflect, and restart your journey.
                    </p>
                </div>

                {isGenerating && (
                    <div className="flex flex-col items-center justify-center py-20 space-y-6">
                        <div className="relative">
                            <div className="absolute inset-0 bg-purple-500/20 blur-xl rounded-full animate-pulse" />
                            <Loader2 className="w-16 h-16 text-purple-400 animate-spin relative z-10" />
                        </div>
                        <p className="text-xl text-white/80 animate-pulse">Designing your personalized roadmap...</p>
                    </div>
                )}

                {!isGenerating && resetPlan && (
                    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-8 duration-700">
                        {renderPlanContent(resetPlan, false)}

                        <div className="flex flex-col items-center gap-4 py-12 border-t border-white/10 mt-12 bg-black/20 rounded-3xl p-8">
                            <p className="text-white/60 text-sm italic max-w-lg text-center">
                                "{resetPlan.closing_message}"
                            </p>

                            <div className="flex gap-4 mt-4">
                                <button
                                    onClick={() => setResetPlan(null)}
                                    className="px-8 py-3 rounded-xl bg-white/10 text-white hover:bg-white/20 font-medium transition-all"
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={handleSavePlan}
                                    className="px-8 py-3 rounded-xl bg-white text-purple-900 font-bold shadow-lg hover:scale-105 transition-all flex items-center gap-2"
                                >
                                    {saveStatus === 'saving' ? (
                                        <Loader2 className="w-5 h-5 animate-spin" />
                                    ) : saveStatus === 'saved' ? (
                                        <>
                                            <CheckCircle2 className="w-5 h-5" /> Saved!
                                        </>
                                    ) : (
                                        <>
                                            Commit to Reset <ArrowRight className="w-5 h-5" />
                                        </>
                                    )}
                                </button>
                            </div>
                        </div>
                    </div>
                )}

                {!isGenerating && !resetPlan && activePlan && (
                    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-8 duration-700">
                        <div className="flex items-center justify-between mb-8">
                            <div>
                                <span className="text-purple-300 text-sm font-semibold tracking-wider uppercase">Current Plan</span>
                                <h2 className="text-3xl font-bold text-white mt-1">Your Journey in Progress</h2>
                            </div>
                            <button
                                onClick={() => setActivePlan(null)}
                                className="px-6 py-2 rounded-xl bg-white/10 text-white text-sm hover:bg-white/20 transition-all border border-white/10"
                            >
                                Start New Plan
                            </button>
                        </div>

                        {renderPlanContent(activePlan, true)}

                        <div className="py-8 text-center">
                            <Link href="/explore">
                                <button className="px-8 py-3 rounded-xl bg-white/10 text-white hover:bg-white/20 font-medium transition-all">
                                    Back to Dashboard
                                </button>
                            </Link>
                        </div>
                    </div>
                )}

                {!isGenerating && !resetPlan && !activePlan && (
                    <div className="flex flex-col items-center justify-center py-12 space-y-6 bg-white/5 backdrop-blur-md rounded-3xl border border-white/10 p-8 shadow-xl">
                        <div className="w-16 h-16 bg-purple-500/20 rounded-full flex items-center justify-center">
                            <Calendar className="w-8 h-8 text-purple-300" />
                        </div>
                        <h2 className="text-2xl font-semibold">Ready for a fresh start?</h2>
                        <p className="text-white/60 text-center max-w-md">
                            We'll analyze your last few days of habits to create a kind, actionable 7-day plan just for you.
                        </p>
                        <button
                            onClick={generatePlan}
                            className="bg-white text-purple-900 px-8 py-4 rounded-xl font-bold shadow-lg hover:scale-105 transition-all flex items-center gap-2"
                        >
                            Generate My Reset Plan <ArrowRight className="w-5 h-5" />
                        </button>
                    </div>
                )}

            </div>
        </div>
    );
}
