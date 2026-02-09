"use client";
import { useState } from "react";

export default function Page() {
  const [habit, setHabit] = useState("");
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);


  const analyzeHabit = async () => {
    setLoading(true);
    setResult(null);

    try {
      const res = await fetch("/api/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ habit }),
      });

      const data = await res.json();
      setResult(data); // data contains result + theme
    } catch (err) {
      console.error(err);
      setResult({
        result: "Error calling AI Studio",
        theme: {
          color: "#391347",
          background: "linear-gradient(135deg, #5A2A6E 0%, #B58BC6 100%)",
          font: "Marcellus, serif",
        },
      });
    }

    setLoading(false);
  };

  return (
   <div className=" h-screen flex justify-center items-center  bg-gradient-to-b from-[#3A1C4A] to-[#8E5AA8]">
      <div className=" max-w-lg py-20  p-8 bg-[#3A1C4A] backdrop-blur-md rounded-3xl  shadow-2xl ">
        <h1
          className="text-4xl font-bold mb-6 mt-10  mt-5 ml-10  text-center"
          style={{ fontFamily: "Marcellus, serif", color: "#9987a3" }}
        >
          Habit Impact Simulator
        </h1>

        <input
          className="w-full h-12 px-4 rounded-lg mb-4 text-white border border-gray-300 focus:outline-none focus:ring-2 focus:ring-purple-400"
          placeholder="Enter habit"
          value={habit}
          onChange={(e) => setHabit(e.target.value)}
        />

        <button
          className="w-full h-12 bg-[#C9A3D9] text-black rounded-lg hover:bg-[#5A2A6E] hover:text-white transition-colors mb-6 disabled:bg-gray-400"
          onClick={analyzeHabit}
          disabled={!habit || loading}
        >
          {loading ? "Analyzing..." : "Analyze Habit"}
        </button>

        {result && (
          <div
            className="p-5 rounded-xl shadow-lg mt-4"
            style={{
              background:
                result.theme?.background ||
                "linear-gradient(135deg, #5A2A6E 0%, #B58BC6 100%)",
              color: result.theme?.color || "#30113f",
              fontFamily: result.theme?.font || "Marcellus, serif",
            }}
          >
            {result.result || result.analysis || result}
          </div>
        )}
      </div>
    </div>
  );
}
