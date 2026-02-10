"use client";
import { useState } from "react";
import { ShieldAlert, Activity, ArrowLeft } from "lucide-react";
import Link from "next/link";
export default function RiskIndicator() {
  const [activity, setActivity] = useState("");
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const analyze = async () => {
    if (!activity) return;
    setLoading(true);
    setResult(null);
    try {
      const res = await fetch("/api/risk", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ activity }),
      });
      const data = await res.json();
      setResult(data);
    } catch (err) {
      console.error("Failed to fetch risk data");
    } finally {
      setLoading(false);
    }
  };
  const getBg = () => {
    if (result?.riskLevel === "High") return "from-red-900 to-black shadow-red-900/20";
    if (result?.riskLevel === "Medium") return "from-orange-800 to-black shadow-orange-800/20";
    if (result?.riskLevel === "Low") return "from-green-900 to-black shadow-green-900/20";
    return "from-[#3A1C4A] to-[#8E5AA8]";
  };
  return (
    <div className={`min-h-screen bg-gradient-to-br transition-all duration-1000 flex items-center justify-center p-6 ${getBg()}`}>
      <div className="w-full max-w-2xl bg-white/10 backdrop-blur-2xl rounded-3xl p-8 border border-white/20 shadow-2xl text-white">
        
        <div className="flex flex-col items-center mb-8 text-center">
            <h1 className="text-3xl font-black tracking-tighter uppercase mb-1">Risk Indicator</h1>
            <p className="text-white/50 text-xs tracking-widest uppercase">Behavioral Impact & Threat Matrix</p>
        </div>
        
        <textarea
          onChange={(e) => setActivity(e.target.value)}
          placeholder="Describe a habit or scenario (e.g., Smoking 5 cigarettes a day)..."
          className="w-full h-28 p-4 rounded-2xl bg-black/30 border border-white/10 mb-4 outline-none focus:ring-2 focus:ring-purple-400 placeholder:text-white/20 transition-all"
        />
        <button 
          onClick={analyze}
          disabled={loading}
          className="w-full py-4 bg-white text-[#3A1C4A] font-black uppercase tracking-widest rounded-2xl hover:bg-white/90 active:scale-95 transition-all disabled:opacity-50"
        >
          {loading ? "System Scanning..." : "Analyze Impact"}
        </button>
        {result && (
          <div className="mt-8 space-y-6 animate-in slide-in-from-bottom-4 duration-700">
            <div className="text-center p-2 bg-black/40 rounded-xl border border-white/10 font-bold uppercase tracking-widest text-xs">
              Risk: {result.riskLevel} | Safety Score: {result.healthScore}%
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-white/5 p-5 rounded-2xl border border-white/5 hover:bg-white/10 transition-colors">
                <h3 className="text-purple-300 font-bold mb-3 flex items-center gap-2 text-[10px] uppercase tracking-widest">
                  <ShieldAlert size={14} /> Immediate Risks
                </h3>
                <ul className="text-sm space-y-2 opacity-80">
                  {result.shortTerm?.map((p, i) => <li key={i} className="flex gap-2"><span>•</span>{p}</li>)}
                </ul>
              </div>
              <div className="bg-white/5 p-5 rounded-2xl border border-white/5 hover:bg-white/10 transition-colors">
                <h3 className="text-purple-300 font-bold mb-3 flex items-center gap-2 text-[10px] uppercase tracking-widest">
                  <Activity size={14} /> Long-Term Impact
                </h3>
                <ul className="text-sm space-y-2 opacity-80">
                  {result.longTerm?.map((p, i) => <li key={i} className="flex gap-2"><span>•</span>{p}</li>)}
                </ul>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}