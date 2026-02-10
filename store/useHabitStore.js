import { create } from 'zustand';
import { collection, query, getDocs, orderBy } from 'firebase/firestore';
import { db } from '../firebase';
import { isSameDay, subDays, parseISO } from 'date-fns';

const useHabitStore = create((set, get) => ({
    dailyEntries: [], // Array of entry objects
    selectedDate: new Date(),
    isModalOpen: false,
    isAnalyzing: false,

    // Current analysis result
    currentInsight: null,
    currentScore: 0,
    currentSuggestion: null,
    currentMood: null,
    currentSleep: null,
    currentProductivity: null,
    currentReflection: null,
    streak: 0,

    // Actions
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

    // Fetch from Firebase
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
            get().calculateStreak(data); // Calculate streak after fetching

        } catch (error) {
            console.error("Failed to fetch habits:", error);
        }
    },

    calculateStreak: (entries) => {
        if (!entries.length) {
            set({ streak: 0 });
            return;
        }

        // Sort descending just in case
        const sorted = [...entries].sort((a, b) => new Date(b.date) - new Date(a.date));
        const today = new Date();
        const yesterday = subDays(today, 1);

        // Check if the most recent entry is today or yesterday
        // If the last entry is older than yesterday, streak is broken -> 0
        const lastEntryDate = parseISO(sorted[0].date);

        if (!isSameDay(lastEntryDate, today) && !isSameDay(lastEntryDate, yesterday)) {
            set({ streak: 0 });
            return;
        }

        let streakCount = 0;
        let currentDate = lastEntryDate; // Start checking from the most recent valid streak day

        // Iterate through entries to find consecutive days
        for (let i = 0; i < sorted.length; i++) {
            const entryDate = parseISO(sorted[i].date);

            // If it's the first one we're checking (which we validated above is today or yesterday)
            if (i === 0) {
                streakCount++;
                continue;
            }

            const expectedPrevDate = subDays(currentDate, 1);

            if (isSameDay(entryDate, expectedPrevDate)) {
                streakCount++;
                currentDate = entryDate; // Move back one day
            } else if (isSameDay(entryDate, currentDate)) {
                // Multiple entries on same day, ignore
                continue;
            } else {
                // Gap found
                break;
            }
        }

        set({ streak: streakCount });
    },

    addEntry: (entry) => {
        set((state) => {
            const newEntries = [entry, ...state.dailyEntries];
            // Re-sort just in case, though usually adds to top
            newEntries.sort((a, b) => new Date(b.date) - new Date(a.date));

            // Trigger streak calc
            // We can't call get().calculateStreak inside set directly cleanly without getting state first or using a separate call.
            // Correct pattern: Update state, then calculate. 
            // However, Zustand set returns void. 
            // We'll trust the fetch refresh for perfect accuracy, but for immediate UI:
            return { dailyEntries: newEntries };
        });
        get().calculateStreak(get().dailyEntries);
    },
}));

export default useHabitStore;
