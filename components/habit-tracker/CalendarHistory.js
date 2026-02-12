
'use client';
import { DayPicker } from 'react-day-picker';
import { isSameDay, parseISO } from 'date-fns';
import 'react-day-picker/dist/style.css';
import useHabitStore from '../../store/useHabitStore';

export default function CalendarHistory() {

    const { dailyEntries, setSelectedDate, setIsModalOpen, setAnalysisResult } = useHabitStore();

    // Safety check for dailyEntries
    const safeEntries = Array.isArray(dailyEntries) ? dailyEntries : [];

    const modifiers = {
        hasEntry: (date) => safeEntries.some(log => isSameDay(parseISO(log.date), date)),
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
        if (date > new Date()) return;

        const log = safeEntries.find(log => isSameDay(parseISO(log.date), date));

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
