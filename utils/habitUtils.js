
import { isSameDay, subDays, parseISO } from 'date-fns';

export const calculateStreak = (entries) => {
    if (!entries || !entries.length) {
        return 0;
    }

    const sorted = [...entries].sort((a, b) => new Date(b.date) - new Date(a.date));
    const today = new Date();
    const yesterday = subDays(today, 1);

    const lastEntryDate = parseISO(sorted[0].date);

    if (!isSameDay(lastEntryDate, today) && !isSameDay(lastEntryDate, yesterday)) {
        return 0;
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

    return streakCount;
};
