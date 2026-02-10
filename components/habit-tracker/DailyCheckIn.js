
'use client';
import { useState } from 'react';
import useHabitStore from '../../store/useHabitStore';
import { Loader2, Smile, Frown, Meh, Sun, Cloud, CloudRain } from 'lucide-react';
import { db, auth } from '../../firebase';
import { addDoc, collection, serverTimestamp } from 'firebase/firestore';

export default function DailyCheckIn() {
    const { setAnalysisResult, setAnalyzing, isAnalyzing, addEntry, dailyEntries } = useHabitStore();

    const [formData, setFormData] = useState({
        sleep: 0,
        screenTime: 0,
        productivity: 0,
        exercise: 0,
        mood: '',
        reflection: ''
    });

    // Check if check-in is already done for today
    const todayStr = new Date().toISOString().split('T')[0];
    const hasCheckedInToday = dailyEntries.some(entry => entry.date === todayStr);

    if (hasCheckedInToday) {
        return (
            <div className="bg-white/10 backdrop-blur-md rounded-3xl p-8 shadow-sm border border-white/20 text-center h-full flex flex-col items-center justify-center">
                <div className="w-16 h-16 bg-green-500 rounded-full flex items-center justify-center mb-4 shadow-lg shadow-green-500/30">
                    <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7" />
                    </svg>
                </div>
                <h2 className="text-2xl font-bold text-white mb-2">Check-in Complete!</h2>
                <p className="text-white/70 max-w-xs">You've already reflected on your day. Come back tomorrow for a fresh start.</p>
            </div>
        );
    }

    const moodOptions = [
        { label: 'Great', icon: Sun, color: 'text-yellow-400' },
        { label: 'Good', icon: Smile, color: 'text-green-400' },
        { label: 'Neutral', icon: Meh, color: 'text-gray-300' },
        { label: 'Low', icon: Cloud, color: 'text-blue-300' },
        { label: 'Rough', icon: CloudRain, color: 'text-blue-500' },
    ];

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!auth.currentUser) {
            alert("Please log in to track habits.");
            return;
        }

        if (!formData.mood) {
            alert("Please select a mood.");
            return;
        }

        setAnalyzing(true);

        try {
            // 1. Get AI Analysis
            const res = await fetch('/api/habit-advice', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    habitData: formData,
                    promptContext: "User is feeling " + formData.mood
                }),
            });

            const aiData = await res.json();

            if (aiData.error) throw new Error(aiData.error);

            // 3. Update Store immediately (Optimistic UI)
            console.log("AI Data received:", aiData);
            setAnalysisResult(aiData);

            const newEntry = {
                ...formData,
                ...aiData,
                date: new Date().toISOString().split('T')[0], // YYYY-MM-DD
                timestamp: serverTimestamp() // Note: serverTimestamp might be problematic for local store logic if not handled, but strictly speaking checking date string is enough for streak
            };
            addEntry(newEntry);

            // 2. Save to Firebase
            try {
                const userId = auth.currentUser.uid;
                await addDoc(collection(db, 'users', userId, 'daily_logs'), {
                    ...formData,
                    ...aiData,
                    date: new Date().toISOString().split('T')[0], // YYYY-MM-DD
                    timestamp: serverTimestamp()
                });
                console.log("Saved to Firebase successfully");
            } catch (firebaseError) {
                console.error("Firebase save failed:", firebaseError);
                // We don't block the UI update if save fails, but maybe alert user?
                // alert("Note: Result shown but failed to save to history.");
            }

        } catch (error) {
            console.error("Check-in failed:", error);
            alert("Something went wrong. Please try again.");
        } finally {
            setAnalyzing(false);
        }
    };

    return (
        <div className="bg-white/10 backdrop-blur-md rounded-3xl p-6 shadow-sm border border-white/20">
            <h2 className="text-2xl font-semibold mb-6 text-white font-sans">Daily Check-in</h2>

            <form onSubmit={handleSubmit} className="space-y-6">
                {/* Sliders for quant data */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                        <label className="block text-sm font-medium mb-2 text-white/80">Hours of Sleep ({formData.sleep})</label>
                        <input
                            type="range" min="0" max="12" step="0.5"
                            value={formData.sleep}
                            onChange={(e) => setFormData({ ...formData, sleep: parseFloat(e.target.value) })}
                            className="w-full accent-purple-400 h-2 bg-white/20 rounded-lg appearance-none cursor-pointer"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium mb-2 text-white/80">Productivity ({formData.productivity}/10)</label>
                        <input
                            type="range" min="0" max="10"
                            value={formData.productivity}
                            onChange={(e) => setFormData({ ...formData, productivity: parseInt(e.target.value) })}
                            className="w-full accent-purple-400 h-2 bg-white/20 rounded-lg appearance-none cursor-pointer"
                        />
                    </div>
                </div>

                {/* Mood Selection */}
                <div>
                    <label className="block text-sm font-medium mb-3 text-white/80">How are you feeling?</label>
                    <div className="flex justify-between gap-2 overflow-x-auto pb-2">
                        {moodOptions.map((option) => {
                            const Icon = option.icon;
                            const isSelected = formData.mood === option.label;
                            return (
                                <button
                                    key={option.label}
                                    type="button"
                                    onClick={() => setFormData({ ...formData, mood: option.label })}
                                    className={`flex flex-col items-center gap-2 p-3 rounded-2xl transition-all ${isSelected
                                        ? 'bg-purple-500/50 ring-2 ring-purple-400 text-white'
                                        : 'hover:bg-white/10 text-white/70'
                                        }`}
                                >
                                    <Icon className={`w-8 h-8 ${isSelected ? option.color : 'text-current'}`} />
                                    <span className="text-xs font-medium">{option.label}</span>
                                </button>
                            )
                        })}
                    </div>
                </div>

                {/* Reflection */}
                <div>
                    <label className="block text-sm font-medium mb-2 text-white/80">Emotional Reflection</label>
                    <textarea
                        value={formData.reflection}
                        onChange={(e) => setFormData({ ...formData, reflection: e.target.value })}
                        placeholder="What's weighing on your mind today?"
                        className="w-full p-4 rounded-2xl bg-white/10 border-none focus:ring-2 focus:ring-purple-400 transition-all font-light text-white placeholder-white/40"
                        rows={3}
                    />
                </div>

                <button
                    type="submit"
                    disabled={isAnalyzing}
                    className="w-full py-4 rounded-xl bg-[#C9A3D9] text-[#30113f] font-bold shadow-lg hover:bg-[#d6b4e6] hover:scale-[1.02] transition-all disabled:opacity-70 disabled:hover:scale-100 flex items-center justify-center gap-2"
                >
                    {isAnalyzing ? (
                        <>
                            <Loader2 className="animate-spin w-5 h-5" />
                            Analyzing Habits...
                        </>
                    ) : (
                        "Save & Analyze"
                    )}
                </button>
            </form>
        </div>
    );
}
