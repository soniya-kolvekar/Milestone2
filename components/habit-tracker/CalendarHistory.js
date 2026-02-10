
'use client';
import { useState } from 'react'; // removed unused useEffect
import { DayPicker } from 'react-day-picker';
import { format, isSameDay, parseISO } from 'date-fns';
// removed unused imports: collection, query, where, getDocs, db, auth
import useHabitStore from '../../store/useHabitStore';
import 'react-day-picker/dist/style.css';

export default function CalendarHistory() {
    // Use store state instead of local state
    const { dailyEntries, setSelectedDate, setIsModalOpen, setAnalysisResult } = useHabitStore();

    // Highlight days with entries
    const modifiers = {
        hasEntry: (date) => dailyEntries.some(log => isSameDay(parseISO(log.date), date)),
    };

    const modifiersStyles = {
        hasEntry: {
            color: '#7c3aed',
            fontWeight: 'bold',
            backgroundColor: '#f3e8ff'
        }
    };

    const handleDayClick = (date) => {
        if (!date) return;

        // Prevent selecting future dates
        if (date > new Date()) return;

        const log = dailyEntries.find(log => isSameDay(parseISO(log.date), date));

        if (log) {
            setAnalysisResult({
                insight: log.insight,
                score: log.score,
                suggestion: log.suggestion,
                mood: log.mood,
                sleep: log.sleep,
                productivity: log.productivity,
                reflection: log.reflection
            });
        } else {
            // No data for this date -> Reset current result to null/empty so modal knows
            setAnalysisResult({
                insight: null,
                score: null,
                suggestion: null,
                mood: null,
                sleep: null,
                productivity: null,
                reflection: null
            });
        }

        setSelectedDate(date);
        setIsModalOpen(true);
    };

    return (
        <div className="bg-white/50 dark:bg-black/20 backdrop-blur-md rounded-3xl p-6 shadow-sm border border-white/20 flex flex-col items-center">
            <h3 className="text-lg font-medium text-gray-600 dark:text-gray-300 mb-4 self-start">History</h3>

            <style>{`
        .rdp { --rdp-cell-size: 40px; --rdp-accent-color: #9333ea; }
        .rdp-day_selected:not([disabled]) { font-weight: bold; background-color: var(--rdp-accent-color); color: white; }
        .rdp-day_selected:hover:not([disabled]) { background-color: var(--rdp-accent-color); color: white; }
      `}</style>

            <DayPicker
                mode="single"
                modifiers={modifiers}
                modifiersStyles={modifiersStyles}
                onDayClick={handleDayClick}
                className="rounded-xl bg-white dark:bg-zinc-900 shadow-inner p-4"
            />
        </div>
    );
}
