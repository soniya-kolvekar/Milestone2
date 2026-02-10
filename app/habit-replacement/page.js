"use client";
import { useState } from "react";
import { Sparkles, ArrowRight, CheckCircle2, RefreshCcw, Leaf, Layers, Footprints } from "lucide-react";

export default function HabitReplacement() {
    const [habit, setHabit] = useState("");
    const [result, setResult] = useState(null);
    const [loading, setLoading] = useState(false);

    const generateReplacement = async () => {
        if (!habit) return;
        setLoading(true);
        setResult(null);

        try {
            const res = await fetch("/api/habit-replacement", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ habit }),
            });
            const data = await res.json();
            setResult(data);
        } catch (err) {
            console.error("Failed to fetch replacement", err);
        } finally {
            setLoading(false);
        }
    };

    const getBg = () => {
        if (result) return "from-[#3A1C4A] to-black shadow-purple-900/20";
        return "from-[#3A1C4A] to-[#8E5AA8]";
    };

    return (
        <div className={`min-h-screen bg-gradient-to-br transition-all duration-1000 flex items-center justify-center p-6 ${getBg()}`}>
            <div className="w-full max-w-2xl bg-white/10 backdrop-blur-2xl rounded-3xl p-8 border border-white/20 shadow-2xl text-white">

                <div className="flex flex-col items-center mb-8 text-center">
                    <h1 className="text-3xl font-black tracking-tighter uppercase mb-1">Habit Transformer</h1>
                    <p className="text-white/50 text-xs tracking-widest uppercase">Positive Replacement Generator</p>
                </div>

                <textarea
                    onChange={(e) => setHabit(e.target.value)}
                    placeholder="Describe the habit you want to replace (e.g., Late night scrolling)..."
                    className="w-full h-28 p-4 rounded-2xl bg-black/30 border border-white/10 mb-4 outline-none focus:ring-2 focus:ring-purple-400 placeholder:text-white/20 transition-all"
                />

                <button
                    onClick={generateReplacement}
                    disabled={loading || !habit}
                    className="w-full py-4 bg-white text-[#3A1C4A] font-black uppercase tracking-widest rounded-2xl hover:bg-white/90 active:scale-95 transition-all disabled:opacity-50 flex items-center justify-center gap-2"
                >
                    {loading ? "Designing Plan..." : "Generate Replacement"}
                </button>

                {result && (
                    <div className="mt-8 space-y-6 animate-in slide-in-from-bottom-4 duration-700">

                        {/* Replacement Hero */}
                        <div className="text-center p-4 bg-black/40 rounded-xl border border-white/10">
                            <div className="uppercase tracking-widest text-[10px] text-purple-400 font-bold mb-1">Suggested Replacement</div>
                            <div className="text-xl font-bold text-white">{result.replacement}</div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {/* Gradual Plan */}
                            <div className="bg-white/5 p-5 rounded-2xl border border-white/5 hover:bg-white/10 transition-colors">
                                <h3 className="text-purple-300 font-bold mb-3 flex items-center gap-2 text-[10px] uppercase tracking-widest">
                                    <Layers size={14} /> Gradual Strategy
                                </h3>
                                <ul className="text-sm space-y-3 opacity-80">
                                    {result.plan?.map((step, i) => (
                                        <li key={i} className="flex gap-2 items-start">
                                            <span className="bg-white/10 w-5 h-5 rounded-full flex items-center justify-center text-[10px] shrink-0 mt-0.5">{i + 1}</span>
                                            <span>{step}</span>
                                        </li>
                                    ))}
                                </ul>
                            </div>

                            {/* Micro Steps */}
                            <div className="bg-white/5 p-5 rounded-2xl border border-white/5 hover:bg-white/10 transition-colors">
                                <h3 className="text-purple-300 font-bold mb-3 flex items-center gap-2 text-[10px] uppercase tracking-widest">
                                    <Footprints size={14} /> Daily Micro-Steps
                                </h3>
                                <ul className="text-sm space-y-2 opacity-80">
                                    {result.microSteps?.map((step, i) => (
                                        <li key={i} className="flex gap-2 items-start">
                                            <CheckCircle2 size={14} className="text-purple-500 shrink-0 mt-0.5" />
                                            <span>{step}</span>
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
