
import { db, auth } from '@/firebase';
import { collection, query, getDocs, orderBy, addDoc, serverTimestamp, where } from 'firebase/firestore';
import { NextResponse } from 'next/server';

// We need to verify authentication on the server side ideally, but standard Firebase client SDK patterns 
// rely on client-side auth state or passing tokens. 
// Since this is a simple refactor keeping existing logic, we will assume the client passes a userId query param for GET
// or we rely on the client to handle auth and we just use the admin SDK or client SDK here?
// The previous implementation used client-side Firestore SDK directly in components/store.
// To use API routes effectively with Firebase Client SDK in Next.js App Router (server components/routes),
// we technically need to use firebase-admin for server-side operations or pass the auth token.
// However, the prompt implies "keep rest api only for sending and storing data". 
// If i use `firebase/firestore` (client SDK) in a Next.js Route Handler, it works but shares the instance.

// Let's standardise on passing 'userId' in the request for now as a simple query param or body field,
// matching the previous `fetchHabits(userId)` logic.

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
