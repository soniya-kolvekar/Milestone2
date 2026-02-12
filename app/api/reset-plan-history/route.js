
import { db } from '@/firebase';
import { collection, addDoc, serverTimestamp, query, where, orderBy, limit, getDocs, doc, updateDoc, getDoc } from 'firebase/firestore';
import { NextResponse } from 'next/server';

export async function GET(request) {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');

    if (!userId) {
        return NextResponse.json({ error: 'UserId is required' }, { status: 400 });
    }

    try {
        const q = query(
            collection(db, 'users', userId, 'reset_plans'),
            where('status', '==', 'active'),
            orderBy('createdAt', 'desc'),
            limit(1)
        );

        const snapshot = await getDocs(q);

        if (snapshot.empty) {
            return NextResponse.json(null);
        }

        const docData = snapshot.docs[0].data();
        return NextResponse.json({ id: snapshot.docs[0].id, ...docData });

    } catch (error) {
        console.error("Error fetching reset plan:", error);
        return NextResponse.json({ error: 'Failed to fetch plan' }, { status: 500 });
    }
}

export async function POST(request) {
    try {
        const body = await request.json();
        const { userId, plan } = body;

        if (!userId || !plan) {
            return NextResponse.json({ error: 'UserId and plan data are required' }, { status: 400 });
        }

        // Optional: Mark previous active plans as archived?
        // For now, simpler to just rely on "latest active" logic in GET.

        const docRef = await addDoc(collection(db, 'users', userId, 'reset_plans'), {
            ...plan,
            createdAt: serverTimestamp(),
            startDate: new Date().toISOString(),
            status: 'active'
        });

        return NextResponse.json({ id: docRef.id, message: 'Plan saved successfully' });
    } catch (error) {
        console.error("Error saving reset plan:", error);
        return NextResponse.json({ error: 'Failed to save plan' }, { status: 500 });
    }
}

export async function PUT(request) {
    try {
        const body = await request.json();
        const { userId, planId, action, dayIndex, completed } = body;

        if (!userId || !planId) {
            return NextResponse.json({ error: 'UserId and PlanId required' }, { status: 400 });
        }

        const planRef = doc(db, 'users', userId, 'reset_plans', planId);

        if (action === 'archive') {
            await updateDoc(planRef, { status: 'archived' });
            return NextResponse.json({ message: 'Plan archived' });
        }

        if (dayIndex !== undefined && completed !== undefined) {
            // Firestore array updates for specific index are tricky without reading first or using map.
            // Let's read, modify, and write back for safety/simplicity given the array size (7 items).
            const planSnap = await getDoc(planRef);
            if (!planSnap.exists()) {
                return NextResponse.json({ error: 'Plan not found' }, { status: 404 });
            }

            const currentPlan = planSnap.data();
            const updatedDailyPlan = [...currentPlan.daily_plan];

            if (updatedDailyPlan[dayIndex]) {
                updatedDailyPlan[dayIndex] = {
                    ...updatedDailyPlan[dayIndex],
                    completed: completed
                };

                await updateDoc(planRef, { daily_plan: updatedDailyPlan });
                return NextResponse.json({ message: 'Progress updated', daily_plan: updatedDailyPlan });
            } else {
                return NextResponse.json({ error: 'Day index out of bounds' }, { status: 400 });
            }
        }

        return NextResponse.json({ error: 'Invalid update action' }, { status: 400 });

    } catch (error) {
        console.error("Error updating reset plan:", error);
        return NextResponse.json({ error: 'Failed to update plan' }, { status: 500 });
    }
}
