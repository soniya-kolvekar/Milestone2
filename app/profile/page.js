"use client";
import { useState, useEffect } from "react";
import { auth, db } from "../../firebase";
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';
import {
    doc,
    getDoc,
    collection,
    query,
    orderBy,
    getDocs,
    updateDoc,
    setDoc,
    onSnapshot,
    deleteDoc,
} from "firebase/firestore";
import { onAuthStateChanged, signOut } from "firebase/auth";
import { useRouter } from "next/navigation";

export default function Profile() {
    const [user, setUser] = useState(null);
    const [userData, setUserData] = useState(null);
    const [habits, setHabits] = useState([]);
    const [loading, setLoading] = useState(true);
    const [habitsLoading, setHabitsLoading] = useState(true);
    const [editingName, setEditingName] = useState(false);
    const [newName, setNewName] = useState("");
    const [error, setError] = useState("");
    const router = useRouter();

    useEffect(() => {
        let unsubscribeUser;
        let unsubscribeHabits;

        const unsubscribeAuth = onAuthStateChanged(auth, async (currentUser) => {
            if (!currentUser) {
                router.push("/login");
                return;
            }
            setUser(currentUser);
            setError("");


            setLoading(false);

            unsubscribeUser = onSnapshot(doc(db, "users", currentUser.uid), (doc) => {
                if (doc.exists()) {
                    const data = doc.data();
                    setUserData(data);
                    setNewName(data.name || currentUser.email?.split("@")[0] || "");
                } else {
                    const validName = currentUser.email?.split("@")[0] || "";
                    setUserData({ name: validName, email: currentUser.email });
                    setNewName(validName);
                }
            }, (err) => {
                console.error("User listener error:", err);
                if (err.code !== 'unavailable') {
                    setError(`Sync Error: ${err.message}`);
                }
            });


            unsubscribeHabits = onSnapshot(collection(db, "users", currentUser.uid, "habits"), (snapshot) => {
                const habitsList = snapshot.docs.map(doc => ({
                    id: doc.id,
                    ...doc.data()
                })).sort((a, b) => (b.timestamp?.toDate() || 0) - (a.timestamp?.toDate() || 0));

                setHabits(habitsList);
                setHabitsLoading(false);
            }, (err) => {
                console.error("Habits listener error:", err);
                setHabitsLoading(false);
                if (err.code !== 'unavailable') {
                    setError(`Habits Sync Error: ${err.message}`);
                }
            });
        });

        return () => {
            unsubscribeAuth();
            if (unsubscribeUser) unsubscribeUser();
            if (unsubscribeHabits) unsubscribeHabits();
        };
    }, [router]);

    const handleUpdateName = async () => {
        if (!user || !newName.trim()) return;
        setError("");


        const oldName = userData?.name;
        setUserData(prev => ({ ...prev, name: newName }));
        setEditingName(false);

        try {
            await setDoc(doc(db, "users", user.uid), {
                name: newName,
                email: user.email,
            }, { merge: true });

            alert("Name updated successfully!");
        } catch (error) {
            console.error("Error updating name:", error);

            if (error.code !== 'unavailable') {
                setUserData(prev => ({ ...prev, name: oldName }));
                setError("Failed to update name. Please try again.");
            } else {
                alert("Saved locally! Changes will sync once you are back online.");
            }
        }
    };

    const handleDeleteHabit = async (habitId) => {
        try {
            await deleteDoc(doc(db, "users", user.uid, "habits", habitId));
        } catch (error) {
            console.error("Error deleting habit:", error);
            setError("Failed to delete entry. Please try again.");
        }
    };

    const handleLogout = async () => {
        await signOut(auth);
        router.push("/login");
    };

    if (loading) {
        return (
            <div className="min-h-screen flex justify-center items-center bg-gradient-to-b from-[#3A1C4A] to-[#8E5AA8] text-white">
                Loading Profile...
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-b from-[#3A1C4A] to-[#8E5AA8] p-8">
            <div className="max-w-4xl mx-auto">

                {error && (
                    <div className="mb-6 bg-red-500/20 border border-red-500/50 text-red-200 p-4 rounded-xl backdrop-blur-sm flex justify-between items-center animate-pulse">
                        <div className="flex items-center gap-3">
                            <span>{error}</span>
                            <button
                                onClick={() => {
                                    setError("");
                                    fetchUserData(user);
                                    fetchHabits(user.uid);
                                }}
                                className="bg-white/20 hover:bg-white/30 px-3 py-1 rounded-lg text-xs font-semibold transition"
                            >
                                Retry
                            </button>
                        </div>
                        <button onClick={() => setError("")} className="text-white hover:text-red-300">✕</button>
                    </div>
                )}


                <div className="flex justify-between items-center mb-10 bg-[#3A1C4A]/50 backdrop-blur-md p-6 rounded-2xl shadow-xl border border-white/10">
                    <div className="flex items-center gap-4">
                        <div className="w-16 h-16 rounded-full bg-gradient-to-br from-purple-400 to-pink-400 flex items-center justify-center text-2xl font-bold text-white shadow-lg">
                            {userData?.name?.charAt(0).toUpperCase() || "U"}
                        </div>
                        <div>
                            {editingName ? (
                                <div className="flex gap-2">
                                    <input
                                        value={newName}
                                        onChange={(e) => setNewName(e.target.value)}
                                        className="bg-white/10 border border-white/20 rounded px-2 py-1 text-white focus:outline-none focus:border-purple-400"
                                    />
                                    <button
                                        onClick={handleUpdateName}
                                        className="text-sm bg-purple-500 hover:bg-purple-600 px-3 py-1 rounded text-white transition"
                                    >
                                        Save
                                    </button>
                                    <button
                                        onClick={() => setEditingName(false)}
                                        className="text-sm bg-gray-500 hover:bg-gray-600 px-3 py-1 rounded text-white transition"
                                    >
                                        Cancel
                                    </button>
                                </div>
                            ) : (
                                <div className="flex items-center gap-3">
                                    <h1 className="text-3xl font-bold text-white font-[Marcellus]">
                                        {userData?.name || user?.email?.split("@")[0] || "User"}
                                    </h1>
                                    <button
                                        onClick={() => setEditingName(true)}
                                        className="text-white/80 hover:text-white transition text-sm bg-white/10 px-3 py-1 rounded"
                                    >
                                        Edit
                                    </button>
                                </div>
                            )}
                            <p className="text-white/60 text-sm">{userData?.email}</p>
                        </div>
                    </div>
                    <button
                        onClick={handleLogout}
                        className="bg-[#C9A3D9] text-[#3A1C4A] px-6 py-2 rounded-lg font-semibold hover:bg-white transition shadow-lg"
                    >
                        Logout
                    </button>
                </div>


                <h2 className="text-2xl font-bold text-white mb-6 font-[Marcellus] pl-2 border-l-4 border-[#C9A3D9]">
                    Analysis History
                </h2>

                {habitsLoading ? (
                    <div className="flex flex-col items-center justify-center py-20 bg-[#3A1C4A]/30 rounded-xl gap-4">
                        <div className="w-10 h-10 border-4 border-[#C9A3D9] border-t-transparent rounded-full animate-spin"></div>
                        <p className="text-white/60 animate-pulse font-[Marcellus]">Loading your history...</p>
                    </div>
                ) : habits.length === 0 ? (
                    <div className="text-white/70 text-center py-10 bg-[#3A1C4A]/30 rounded-xl">
                        No habits analyzed yet. <a href="/feature1" className="text-[#C9A3D9] hover:underline">Start analyzing!</a>
                    </div>
                ) : (
                    <div className="grid gap-6">
                        {habits.map((habit) => (
                            <div
                                key={habit.id}
                                className="bg-[#3A1C4A] backdrop-blur-md rounded-xl p-6 shadow-lg border border-white/5 hover:border-white/20 transition duration-300"
                            >
                                <div className="flex justify-between items-start mb-4">
                                    <h3 className="text-xl font-semibold text-[#C9A3D9]">
                                        {habit.habit}
                                    </h3>
                                    <div className="flex gap-4 items-center">
                                        <span className="text-xs text-white/40">
                                            {habit.timestamp?.toDate().toLocaleDateString()}
                                        </span>
                                        <button
                                            onClick={() => handleDeleteHabit(habit.id)}
                                            className="text-white/70 hover:text-red-400 transition text-sm bg-white/10 hover:bg-red-500/20 px-4 py-1.5 rounded-lg border border-white/10 hover:border-red-500/50"
                                        >
                                            Delete
                                        </button>
                                    </div>
                                </div>
                                <div
                                    className="text-white/80 leading-relaxed text-sm bg-black/20 p-4 rounded-lg"
                                    style={{ whiteSpace: "pre-wrap" }}
                                >
                                    {habit.analysis}
                                </div>
                            </div>
                        ))}
                    </div>
                )}
                <nav className="relative mt-4 z-10 flex items-center mb-2">
                    <Link href="/explore">
                        <Button variant="ghost" className="text-white/80 hover:text-white hover:bg-white/10 gap-2 pl-0">
                            <ArrowLeft className="w-5 h-5" />
                            Back
                        </Button>
                    </Link>
                </nav>
            </div>
        </div>
    );
}
