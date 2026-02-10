
'use client';
import { useEffect, useState } from 'react';
import useHabitStore from '../../store/useHabitStore';
import DailyCheckIn from './DailyCheckIn';
import LifeBalanceMeter from './LifeBalanceMeter';
import CalendarHistory from './CalendarHistory';
import DayDetailModal from './DayDetailModal';
import ResetButton from './ResetButton';
import ResetModal from './ResetModal';
import { auth } from '../../firebase';
import { onAuthStateChanged } from 'firebase/auth';

export default function Dashboard() {
    const {
        currentScore, currentInsight, currentSuggestion,
        currentMood, currentSleep, currentProductivity, currentReflection,
        isModalOpen, setIsModalOpen, streak, fetchHabits
    } = useHabitStore();
    const [user, setUser] = useState(null);

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
            setUser(currentUser);
            if (currentUser) {
                fetchHabits(currentUser.uid);
            }
        });
        return () => unsubscribe();
    }, [fetchHabits]);


    const modalData = {
        score: currentScore,
        insight: currentInsight,
        suggestion: currentSuggestion,
        mood: currentMood,
        sleep: currentSleep,
        productivity: currentProductivity,
        reflection: currentReflection
    };

    return (
        <div className="min-h-screen bg-gradient-to-b from-[#3A1C4A] to-[#8E5AA8] text-gray-800 dark:text-gray-200 p-4 md:p-8 font-sans">

            <div className="max-w-6xl mx-auto space-y-8">

                <header className="flex flex-col md:flex-row md:items-center justify-end gap-4">
                    <div className="flex items-center gap-3 bg-white/10 px-4 py-2 rounded-full backdrop-blur-sm border border-white/20 shadow-sm">
                        <span className="text-sm font-semibold text-purple-200">Streak:</span>
                        <span className="text-xl font-bold text-white">🔥 {streak} Days</span>
                    </div>
                    <ResetButton />
                </header>
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">

                    <div className="lg:col-span-5 space-y-6">
                        <DailyCheckIn />
                    </div>

                    <div className="lg:col-span-7 space-y-6">

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="h-64">
                                <LifeBalanceMeter score={currentScore} />
                            </div>

                            <div className="bg-white/10 backdrop-blur-md rounded-3xl p-6 shadow-sm border border-white/20 flex flex-col justify-center text-white h-64">
                                <h3 className="text-sm font-semibold uppercase tracking-wider text-purple-200 mb-3">Today's Insight</h3>
                                {currentInsight ? (
                                    <div className="space-y-3 animate-in fade-in slide-in-from-bottom-2 duration-500 overflow-y-auto">
                                        <p className="text-lg leading-relaxed italic text-white/90">"{currentInsight}"</p>
                                        <div className="pt-3 border-t border-white/20">
                                            <span className="text-xs font-bold text-purple-200 uppercase">Suggestion</span>
                                            <p className="text-sm text-white/80">{currentSuggestion}</p>
                                        </div>
                                    </div>
                                ) : (
                                    <div className="flex flex-col items-center justify-center h-full text-white/50 text-center">
                                        <div className="w-12 h-12 rounded-full bg-white/10 mb-3" />
                                        <p>Check in to see your AI insight</p>
                                    </div>
                                )}
                            </div>
                        </div>

                        <CalendarHistory />

                    </div>
                </div>
            </div>

            <DayDetailModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                data={modalData}
            />
            <ResetModal />
        </div>
    );
}
