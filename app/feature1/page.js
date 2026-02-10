"use client";
import { useState, useEffect } from "react";
import { auth, db } from "../../firebase";
import { doc, collection, addDoc, serverTimestamp } from "firebase/firestore";
import { onAuthStateChanged } from "firebase/auth";

export default function Page() {
  const [habit, setHabit] = useState("");
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [user, setUser] = useState(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
    });
    return () => unsubscribe();
  }, []);


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

      if (user) {
        try {
          await addDoc(collection(db, "users", user.uid, "habits"), {
            habit: habit,
            analysis: data.result || data.analysis || data,
            theme: data.theme || null,
            timestamp: serverTimestamp(),
          });
          console.log("Habit saved to profile!");
        } catch (error) {
          console.error("Error saving habit:", error);
          if (error.code === 'unavailable') {
            alert("Offline: Your habit analysis has been completed but could not be saved to your profile at this moment.");
          }
        }
      } else {
        alert("Note: You are not logged in. Your habit analysis will not be saved to your profile history.");
      }
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
    <div className="min-h-screen flex justify-center items-center bg-gradient-to-b from-[#3A1C4A] to-[#8E5AA8] p-4 overflow-y-auto">
      <div className="w-full max-w-4xl py-10 p-8 bg-[#3A1C4A] backdrop-blur-md rounded-3xl shadow-2xl">
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
              whiteSpace: "pre-wrap",
              wordBreak: "break-word",
            }}
          >
            {result.result || result.analysis || result}
          </div>
        )}
      </div>
    </div>
  );
}
