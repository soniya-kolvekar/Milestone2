
'use client';
import { useEffect, useState, useCallback } from 'react';
import DailyCheckIn from './DailyCheckIn';
import LifeBalanceMeter from './LifeBalanceMeter';
import CalendarHistory from './CalendarHistory';
import DayDetailModal from './DayDetailModal';
import { auth } from '../../firebase';
import { onAuthStateChanged } from 'firebase/auth';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import { calculateStreak } from '../../utils/habitUtils';

export default function Dashboard() {
    const [user, setUser] = useState(null);
    const [dailyEntries, setDailyEntries] = useState([]);
    const [streak, setStreak] = useState(0);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedDate, setSelectedDate] = useState(new Date());

    const [analysisResult, setAnalysisResult] = useState({
        insight: null,
        score: null,
        suggestion: null,
        mood: null,
        sleep: null,
        productivity: null,
        reflection: null
    });

    const fetchHabits = useCallback(async (userId) => {
        try {
            const res = await fetch(`/api/habits?userId=${userId}`);
            if (res.ok) {
                const data = await res.json();
                setDailyEntries(data);
                setStreak(calculateStreak(data));

                // If we have data, set the most recent one as current insight if it's today
                if (data.length > 0) {
                    // Check if the most recent entry is today
                    const latest = data[0];
                    const today = new Date().toISOString().split('T')[0];
                    if (latest.date === today) {
                        setAnalysisResult({
                            insight: latest.insight,
                            score: latest.score,
                            suggestion: latest.suggestion,
                            mood: latest.mood,
                            sleep: latest.sleep,
                            productivity: latest.productivity,
                            reflection: latest.reflection
                        });
                    }
                }
            }
        } catch (error) {
            console.error("Failed to fetch habits:", error);
        }
    }, []);

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
            setUser(currentUser);
            if (currentUser) {
                fetchHabits(currentUser.uid);
            } else {
                setDailyEntries([]);
                setStreak(0);
            }
        });
        return () => unsubscribe();
    }, [fetchHabits]);

    const handleEntryAdded = () => {
        if (user) {
            fetchHabits(user.uid);
        }
    };

    const handleSelectDate = (date) => {
        setSelectedDate(date);
        setIsModalOpen(true);
        // Find entry for this date
        // Note: date from calendar is a Date object, entry.date is YYYY-MM-DD string
        // We need to compare carefully.
        const dateStr = date.toISOString().split('T')[0];
        // However, local time zone issues might arise with simple toISOString split if not careful.
        // Let's rely on the comparison logic from CalendarHistory or similar, 
        // but here we just need to pass data to the modal.

        // Actually, CalendarHistory was doing the finding.
        // Let's pass the finder logic or let CalendarHistory pass the found data back up?
        // Better: Dashboard holds the state. CalendarHistory notifies "User selected Date X".
        // Dashboard finds the data and opens modal.

        // Wait, prior implementation had CalendarHistory setting the analysis result in store.
        // Let's replicate that logic here or inside CalendarHistory?
        // Standard React pattern: Lift state up.
        // Dashboard has `dailyEntries`. CalendarHistory receives `dailyEntries`.
        // CalendarHistory calls `onSelectDate(date, entryData)`.
    };

    // Derived state for modal
    // Actually, let's keep it simple. `analysisResult` is effectively "Current View"
    // But we have `modalData`.
    // Let's change `handleSelectDate` to update `modalData` specific state if needed, 
    // or just reuse `analysisResult` if that's what the modal uses? 
    // The original code used `currentInsight` etc from store for BOTH the "Today's Insight" card AND the Modal.
    // That implies clicking the calendar changed the "Today's Insight" card too? 
    // Yes, `handleDayClick` in `CalendarHistory.js` called `setAnalysisResult`.

    // So we need `analysisResult` to be the "currently selected or latest" data.

    return (
        <div className="min-h-screen bg-gradient-to-b from-[#3A1C4A] to-[#8E5AA8] text-gray-800 dark:text-gray-200 p-4 md:p-8 font-sans">

            <div className="max-w-6xl mx-auto space-y-8">

                <header className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <Link href="/explore" className="flex items-center gap-2 text-white/70 hover:text-white transition-colors w-fit">
                        <ArrowLeft className="w-5 h-5" /> Back to Explore
                    </Link>
                    <div className="flex items-center gap-3 bg-white/10 px-4 py-2 rounded-full backdrop-blur-sm border border-white/20 shadow-sm">
                        <span className="text-sm font-semibold text-purple-200">Streak:</span>
                        <span className="text-xl font-bold text-white">🔥 {streak} Days</span>
                    </div>
                </header>
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">

                    <div className="lg:col-span-5 space-y-6">
                        <DailyCheckIn
                            dailyEntries={dailyEntries}
                            onEntryAdded={handleEntryAdded}
                            setAnalysisResult={setAnalysisResult}
                        />
                    </div>

                    <div className="lg:col-span-7 space-y-6">

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="h-64">
                                <LifeBalanceMeter score={analysisResult.score || 0} />
                            </div>

                            <div className="bg-white/10 backdrop-blur-md rounded-3xl p-6 shadow-sm border border-white/20 flex flex-col justify-center text-white h-64">
                                <h3 className="text-sm font-semibold uppercase tracking-wider text-purple-200 mb-3">Today's Insight</h3>
                                {analysisResult.insight ? (
                                    <div className="space-y-3 animate-in fade-in slide-in-from-bottom-2 duration-500 overflow-y-auto">
                                        <p className="text-lg leading-relaxed italic text-white/90">"{analysisResult.insight}"</p>
                                        <div className="pt-3 border-t border-white/20">
                                            <span className="text-xs font-bold text-purple-200 uppercase">Suggestion</span>
                                            <p className="text-sm text-white/80">{analysisResult.suggestion}</p>
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

                        <CalendarHistory
                            dailyEntries={dailyEntries}
                            setAnalysisResult={setAnalysisResult}
                            setIsModalOpen={setIsModalOpen}
                            setSelectedDate={setSelectedDate}
                        />

                    </div>
                </div>
            </div>

            <DayDetailModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                data={analysisResult}
            />
        </div>
    );
}
