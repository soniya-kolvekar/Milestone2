
import { db, auth } from '@/firebase';
import { collection, query, getDocs, orderBy, addDoc, serverTimestamp, where } from 'firebase/firestore';
import { NextResponse } from 'next/server';

export async function GET(request) {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');

    if (!userId) {
        return NextResponse.json({ error: 'UserId is required' }, { status: 400 });
    }

    try {
        const q = query(
            collection(db, 'users', userId, 'daily_logs'),
            orderBy('date', 'desc')
        );
        const snapshot = await getDocs(q);
        const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));

        return NextResponse.json(data);
    } catch (error) {
        console.error("Error fetching habits:", error);
        return NextResponse.json({ error: 'Failed to fetch habits' }, { status: 500 });
    }
}

export async function POST(request) {
    try {
        const body = await request.json();
        const { userId, habitData } = body;

        if (!userId || !habitData) {
            return NextResponse.json({ error: 'UserId and habit data are required' }, { status: 400 });
        }

        const docRef = await addDoc(collection(db, 'users', userId, 'daily_logs'), {
            ...habitData,
            timestamp: serverTimestamp()
        });

        return NextResponse.json({ id: docRef.id, ...habitData });
    } catch (error) {
        console.error("Error adding habit:", error);
        return NextResponse.json({ error: 'Failed to add habit' }, { status: 500 });
    }
}
