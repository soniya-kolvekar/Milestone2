"use client";
import { useState } from "react";

export default function Page() {
  const [habit, setHabit] = useState("");
  const [result, setResult] = useState("");
  const [loading, setLoading] = useState(false);

  const analyzeHabit = async () => {
    setLoading(true);
    setResult("");

    try {
      const res = await fetch("/api/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ habit }),
      });

      const data = await res.json();
      setResult(data.result);
    } catch (err) {
      console.error(err);
      setResult("Error calling AI Studio");
    }

    setLoading(false);
  };

  return (
    <main style={{ padding: 20 }}>
      <h1>Habit Impact Simulator</h1>
      <input
        value={habit}
        onChange={(e) => setHabit(e.target.value)}
        placeholder="Enter habit"
      />
      <button onClick={analyzeHabit} disabled={!habit || loading}>
        {loading ? "Analyzing..." : "Analyze"}
      </button>
      {result && <p>{result}</p>}
    </main>
  );
}
