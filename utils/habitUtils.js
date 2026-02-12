
import { isSameDay, subDays, parseISO } from 'date-fns';

export const calculateStreak = (entries) => {
    if (!entries || !entries.length) {
        return 0;
    }

    const sorted = [...entries].sort((a, b) => new Date(b.date) - new Date(a.date));
    const today = new Date();
    const yesterday = subDays(today, 1);

    const lastEntryDate = parseISO(sorted[0].date);

    // If the last entry wasn't today or yesterday, streak is broken (0)
    // UNLESS the user just added an entry for today, but we are fetching from DB and it might not be updated yet? 
    // Actually, we pass the updated list to this function.
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
            // Multiple entries on same day, ignore
            continue;
        } else {
            // Gap found
            break;
        }
    }

    return streakCount;
};
