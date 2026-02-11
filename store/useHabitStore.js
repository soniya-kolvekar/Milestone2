import { create } from 'zustand';
import { collection, query, getDocs, orderBy } from 'firebase/firestore';
import { db } from '../firebase';
import { isSameDay, subDays, parseISO } from 'date-fns';

const useHabitStore = create((set, get) => ({
    dailyEntries: [],
    selectedDate: new Date(),
    isModalOpen: false,
    isAnalyzing: false,


    currentInsight: null,
    currentScore: 0,
    currentSuggestion: null,
    currentMood: null,
    currentSleep: null,
    currentProductivity: null,
    currentReflection: null,
    streak: 0,


    setDailyEntries: (entries) => set({ dailyEntries: entries }),
    setSelectedDate: (date) => set({ selectedDate: date }),
    setIsModalOpen: (isOpen) => set({ isModalOpen: isOpen }),
    setAnalysisResult: (result) => set({
        currentInsight: result.insight,
        currentScore: result.score,
        currentSuggestion: result.suggestion,
        currentMood: result.mood,
        currentSleep: result.sleep,
        currentProductivity: result.productivity,
        currentReflection: result.reflection,
        isAnalyzing: false
    }),
    setAnalyzing: (isAnalyzing) => set({ isAnalyzing }),


    fetchHabits: async (userId) => {
        if (!userId) return;
        try {
            const q = query(
                collection(db, 'users', userId, 'daily_logs'),
                orderBy('date', 'desc')
            );
            const snapshot = await getDocs(q);
            const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));

            set({ dailyEntries: data });
            get().calculateStreak(data);

        } catch (error) {
            console.error("Failed to fetch habits:", error);
        }
    },

    calculateStreak: (entries) => {
        if (!entries.length) {
            set({ streak: 0 });
            return;
        }


        const sorted = [...entries].sort((a, b) => new Date(b.date) - new Date(a.date));
        const today = new Date();
        const yesterday = subDays(today, 1);


        const lastEntryDate = parseISO(sorted[0].date);

        if (!isSameDay(lastEntryDate, today) && !isSameDay(lastEntryDate, yesterday)) {
            set({ streak: 0 });
            return;
        }

        let streakCount = 0;
        let currentDate = lastEntryDate;


        for (let i = 0; i < sorted.length; i++) {
            const entryDate = parseISO(sorted[i].date);


            if (i === 0) {
                streakCount++;
                continue;
            }

            const expectedPrevDate = subDays(currentDate, 1);

            if (isSameDay(entryDate, expectedPrevDate)) {
                streakCount++;
                currentDate = entryDate;
            } else if (isSameDay(entryDate, currentDate)) {

                continue;
            } else {

                break;
            }
        }

        set({ streak: streakCount });
    },

    addEntry: (entry) => {
        set((state) => {
            const newEntries = [entry, ...state.dailyEntries];

            newEntries.sort((a, b) => new Date(b.date) - new Date(a.date));
            return { dailyEntries: newEntries };
        });
        get().calculateStreak(get().dailyEntries);
    },


    isResetModalOpen: false,
    isGeneratingReset: false,
    resetPlan: null,

    setResetModalOpen: (isOpen) => set({ isResetModalOpen: isOpen }),
    setGeneratingReset: (isGenerating) => set({ isGeneratingReset: isGenerating }),
    setResetPlan: (plan) => set({ resetPlan: plan }),
}));

export default useHabitStore;
