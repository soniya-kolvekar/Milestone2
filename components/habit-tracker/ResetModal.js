'use client';
import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Loader2, Moon, Sun, Calendar, CheckCircle2, ArrowRight } from 'lucide-react';
import useHabitStore from '../../store/useHabitStore';
import { auth, db } from '../../firebase';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';

export default function ResetModal() {
    const {
        isResetModalOpen,
        setResetModalOpen,
        dailyEntries,
        resetPlan,
        setResetPlan,
        isGeneratingReset,
        setGeneratingReset
    } = useHabitStore();

    const [saveStatus, setSaveStatus] = useState('idle'); 

    useEffect(() => {
        if (isResetModalOpen && !resetPlan && !isGeneratingReset) {
            generatePlan();
        }
    }, [isResetModalOpen]);

    const generatePlan = async () => {
        setGeneratingReset(true);
        try {
          
            const recentHabits = dailyEntries.slice(0, 14);

            const res = await fetch('/api/reset-plan', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    habitData: recentHabits,
                    timeContext: new Date().toLocaleString()
                })
            });

            if (!res.ok) throw new Error("Failed to generate plan");

            const data = await res.json();
            setResetPlan(data);
        } catch (error) {
            console.error(error);
            
        } finally {
            setGeneratingReset(false);
        }
    };

    const handleSavePlan = async () => {
        if (!auth.currentUser || !resetPlan) return;
        setSaveStatus('saving');
        try {
            await addDoc(collection(db, 'users', auth.currentUser.uid, 'reset_plans'), {
                ...resetPlan,
                createdAt: serverTimestamp(),
                startDate: new Date().toISOString(),
                status: 'active'
            });
            setSaveStatus('saved');
            setTimeout(() => {
                setResetModalOpen(false);
                setSaveStatus('idle');
            }, 2000);
        } catch (error) {
            console.error("Failed to save plan:", error);
            setSaveStatus('error');
        }
    };

    if (!isResetModalOpen) return null;

    return (
        <AnimatePresence>
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
            >
                <motion.div
                    initial={{ scale: 0.9, opacity: 0, y: 20 }}
                    animate={{ scale: 1, opacity: 1, y: 0 }}
                    exit={{ scale: 0.9, opacity: 0, y: 20 }}
                    className="bg-[#1a1625] border border-white/10 w-full max-w-4xl max-h-[90vh] overflow-hidden rounded-3xl shadow-2xl flex flex-col"
                >
                    <div className="p-6 border-b border-white/10 flex justify-between items-center bg-white/5">
                        <div>
                            <h2 className="text-2xl font-bold text-white bg-gradient-to-r from-purple-200 to-pink-200 bg-clip-text text-transparent">
                                Reset My Life
                            </h2>
                            <p className="text-white/50 text-sm">A gentle, data-driven fresh start</p>
                        </div>
                        <button
                            onClick={() => setResetModalOpen(false)}
                            className="p-2 hover:bg-white/10 rounded-full transition-colors text-white/70 hover:text-white"
                        >
                            <X className="w-5 h-5" />
                        </button>
                    </div>

                 
                    <div className="flex-1 overflow-y-auto p-6 custom-scrollbar">
                        {isGeneratingReset ? (
                            <div className="h-full flex flex-col items-center justify-center py-20 text-center space-y-6">
                                <div className="relative">
                                    <div className="absolute inset-0 bg-purple-500/20 blur-xl rounded-full animate-pulse" />
                                    <Loader2 className="w-16 h-16 text-purple-400 animate-spin relative z-10" />
                                </div>
                                <div className="space-y-2">
                                    <h3 className="text-xl font-medium text-white">Analyzing your patterns...</h3>
                                    <p className="text-white/50 max-w-md">finding the best way to help you pause, breathe, and restart.</p>
                                </div>
                            </div>
                        ) : resetPlan ? (
                            <div className="space-y-8 animate-in fade-in duration-500">

                           
                                <div className="bg-purple-500/10 border border-purple-500/20 p-6 rounded-2xl">
                                    <p className="text-purple-200 text-lg italic leading-relaxed">
                                        "{resetPlan.analysis_summary}"
                                    </p>
                                </div>

                                <div className="grid md:grid-cols-2 gap-6">
                                   
                                    <div className="space-y-4">
                                        <div className="flex items-center gap-2 text-pink-300 mb-2">
                                            <Moon className="w-5 h-5" />
                                            <h3 className="font-semibold uppercase tracking-wider text-sm">Let's Pause</h3>
                                        </div>
                                        {resetPlan.stop_habits.map((habit, i) => (
                                            <motion.div
                                                key={i}
                                                initial={{ x: -20, opacity: 0 }}
                                                animate={{ x: 0, opacity: 1 }}
                                                transition={{ delay: i * 0.1 }}
                                                className="bg-white/5 p-4 rounded-xl border-l-4 border-pink-500/50 flex items-start gap-3"
                                            >
                                                <span className="text-pink-400 font-bold opacity-50">0{i + 1}</span>
                                                <p className="text-white/80 text-sm">{habit}</p>
                                            </motion.div>
                                        ))}
                                    </div>

                                    <div className="space-y-4">
                                        <div className="flex items-center gap-2 text-emerald-300 mb-2">
                                            <Sun className="w-5 h-5" />
                                            <h3 className="font-semibold uppercase tracking-wider text-sm">Let's Begin</h3>
                                        </div>
                                        {resetPlan.start_habits.map((habit, i) => (
                                            <motion.div
                                                key={i}
                                                initial={{ x: 20, opacity: 0 }}
                                                animate={{ x: 0, opacity: 1 }}
                                                transition={{ delay: i * 0.1 }}
                                                className="bg-white/5 p-4 rounded-xl border-l-4 border-emerald-500/50 flex items-start gap-3"
                                            >
                                                <span className="text-emerald-400 font-bold opacity-50">0{i + 1}</span>
                                                <p className="text-white/80 text-sm">{habit}</p>
                                            </motion.div>
                                        ))}
                                    </div>
                                </div>

                                <div>
                                    <div className="flex items-center gap-2 text-blue-300 mb-4">
                                        <Calendar className="w-5 h-5" />
                                        <h3 className="font-semibold uppercase tracking-wider text-sm">Your 7-Day Gentle Roadmap</h3>
                                    </div>
                                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                                        {resetPlan.daily_plan.map((day, i) => (
                                            <motion.div
                                                key={i}
                                                initial={{ y: 20, opacity: 0 }}
                                                animate={{ y: 0, opacity: 1 }}
                                                transition={{ delay: 0.2 + (i * 0.05) }}
                                                className={`bg-white/5 rounded-xl p-4 border border-white/10 hover:bg-white/10 transition-colors ${i === 0 ? 'ring-1 ring-blue-400/50 bg-blue-500/10' : ''}`}
                                            >
                                                <div className="flex justify-between items-start mb-2">
                                                    <span className="text-xs font-bold text-white/50 uppercase">{day.day}</span>
                                                    {i === 0 && <span className="text-[10px] bg-blue-500 text-white px-2 py-0.5 rounded-full">Start Today</span>}
                                                </div>
                                                <h4 className="font-semibold text-white mb-2">{day.theme}</h4>

                                                <div className="space-y-2">
                                                    <div className="text-xs text-white/70 flex gap-2">
                                                        <span className="text-blue-400">Do:</span> {day.action}
                                                    </div>
                                                    <div className="text-xs text-white/70 flex gap-2">
                                                        <span className="text-purple-400">Feel:</span> {day.support}
                                                    </div>
                                                </div>

                                                <div className="mt-3 pt-3 border-t border-white/10">
                                                    <p className="text-[10px] text-white/40 italic">"{day.affirmation}"</p>
                                                </div>
                                            </motion.div>
                                        ))}
                                    </div>
                                </div>

                                <div className="text-center p-4">
                                    <p className="text-white/60 text-sm italic">
                                        {resetPlan.closing_message}
                                    </p>
                                </div>

                            </div>
                        ) : (
                            <div className="text-center text-white/50 py-20">
                                Something went wrong. Please try again.
                                <button onClick={generatePlan} className="block mx-auto mt-4 text-purple-400 hover:underline">Retry</button>
                            </div>
                        )}
                    </div>

             
                    {resetPlan && (
                        <div className="p-6 border-t border-white/10 bg-white/5 flex flex-col md:flex-row justify-between items-center gap-4">
                            <span className="text-xs text-white/40 hidden md:block">
                                Saving this plan will add it to your profile history.
                            </span>
                            <div className="flex gap-3 w-full md:w-auto">
                                <button
                                    onClick={generatePlan}
                                    className="flex-1 md:flex-none px-6 py-3 rounded-xl hover:bg-white/10 text-white/80 transition-all font-medium text-sm"
                                >
                                    Regenerate
                                </button>
                                <button
                                    onClick={handleSavePlan}
                                    disabled={saveStatus === 'saving' || saveStatus === 'saved'}
                                    className={`flex-1 md:flex-none px-8 py-3 rounded-xl font-bold shadow-lg transition-all flex items-center justify-center gap-2 ${saveStatus === 'saved'
                                            ? 'bg-green-500 text-white'
                                            : 'bg-white text-purple-900 hover:scale-[1.02]'
                                        }`}
                                >
                                    {saveStatus === 'saving' ? (
                                        <Loader2 className="w-5 h-5 animate-spin" />
                                    ) : saveStatus === 'saved' ? (
                                        <>
                                            <CheckCircle2 className="w-5 h-5" />
                                            Saved!
                                        </>
                                    ) : (
                                        <>
                                            Commit to Reset <ArrowRight className="w-4 h-4" />
                                        </>
                                    )}
                                </button>
                            </div>
                        </div>
                    )}
                </motion.div>
            </motion.div>
        </AnimatePresence>
    );
}
