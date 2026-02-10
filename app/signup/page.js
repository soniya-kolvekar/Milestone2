"use client";

import { createAccount } from "../core/auth";
import { useRouter } from "next/navigation";
import { useState } from "react";

export default function SignUp() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const router = useRouter();

  const handleSignUp = async () => {
    setError("");
    if (password !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }
    if (password.length < 6) {
      setError("Password should be at least 6 characters");
      return;
    }

    try {
      await createAccount(email, password);
      router.replace("/login");
    } catch (err) {
      console.error(err);
      if (err.code === 'auth/email-already-in-use') {
        setError("This email is already registered. Please log in instead.");
      } else {
        setError(err.message || "Failed to create account.");
      }
    }
  };

  return (
    <div className=" bg-gradient-to-b from-[#5A2A6E] to-[#B58BC6] min-h-screen">
      <div className="flex flex-col items-center justify-center min-h-screen px-4 py-16">
        <h1 className="text-white text-4xl md:text-6xl font-bold font-[marcellus] mb-8 text-center leading-tight">
          Habit Consequence Simulator
        </h1>

        <div className="w-full max-w-md flex flex-col items-center">
          <h6 className="text-white/70 mb-8">Enter your credentials</h6>

          {error && <p className="text-red-400 mb-4 font-semibold text-center">{error}</p>}

          <div className="w-full space-y-5">
            <input
              className="w-full h-13 bg-white/10 border border-white/20 text-white placeholder:text-white/50 rounded-xl px-7 focus:outline-none focus:border-purple-400 backdrop-blur-sm"
              type="email"
              placeholder="Email*"
              onChange={(e) => setEmail(e.target.value)}
            />
            <input
              className="w-full h-13 bg-white/10 border border-white/20 text-white placeholder:text-white/50 rounded-xl px-7 focus:outline-none focus:border-purple-400 backdrop-blur-sm"
              type="password"
              placeholder="Set Password"
              onChange={(e) => setPassword(e.target.value)}
            />
            <input
              className="w-full h-13 bg-white/10 border border-white/20 text-white placeholder:text-white/50 rounded-xl px-7 focus:outline-none focus:border-purple-400 backdrop-blur-sm"
              type="password"
              placeholder="Confirm Password"
              onChange={(e) => setConfirmPassword(e.target.value)}
            />
          </div>

          <div className="w-full flex flex-col items-center gap-4 mt-8">
            <button
              className="w-full max-w-[200px] h-13 bg-[#C9A3D9] rounded-xl text-[#3A1C4A] font-bold hover:bg-white transition-all shadow-lg"
              onClick={handleSignUp}
            >
              Sign Up
            </button>
            <button
              className="w-full max-w-[200px] h-13 bg-white/10 border border-white/10 rounded-xl text-white hover:bg-white/20 transition-all font-semibold"
              onClick={() => router.replace('/')}
            >
              Back
            </button>
          </div>
        </div>
      </div>

    </div>

  );
}
