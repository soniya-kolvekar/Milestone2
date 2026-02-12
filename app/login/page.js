"use client";

import { login, createAccount, resetEmail, logout } from "../core/auth";
import { useRouter, useSearchParams } from "next/navigation";
import { useState, useEffect, Suspense } from "react";

export default function Login() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-[#3A1C4A] flex items-center justify-center text-white">Loading...</div>}>
      <LoginForm />
    </Suspense>
  );
}

function LoginForm() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const router = useRouter();
  const searchParams = useSearchParams();

  useEffect(() => {
    const signupStatus = searchParams.get("signup");
    const emailParam = searchParams.get("email");

    if (signupStatus === "success") {
      setSuccess("Account created successfully! Please log in.");
    }
    if (emailParam) {
      setEmail(emailParam);
    }
  }, [searchParams]);

  const handleLogout = async () => {
    try {
      await logout();
      setEmail("");
      setPassword("");
      router.replace("/");
    } catch (err) {
      console.error("Logout failed", err);
    }
  };
  const [hoverBg, setHoverBg] = useState(false);
  return (
    <div onMouseEnter={() => setHoverBg(true)}
      onMouseLeave={() => setHoverBg(false)}
      className={`min-h-screen transition-all duration-700 ease-in-out
        ${hoverBg
          ? "bg-gradient-to-b from-[#5A2A6E] to-[#B58BC6]"
          : "bg-gradient-to-b from-[#3A1C4A] to-[#8E5AA8]"
        }
      `}>

      <div className="flex flex-col items-center justify-center min-h-screen px-4 py-16">
        <h1 className="text-white text-4xl md:text-6xl font-bold font-[marcellus] mb-8 text-center">
          Habit Consequence Simulator
        </h1>

        <div className="w-full max-w-md flex flex-col items-center">
          <h6 className="text-white/70 mb-8">Enter your credentials</h6>

          {success && (
            <p className="text-green-400 mb-4 font-semibold text-center">{success}</p>
          )}
          {error && (
            <p className="text-red-400 mb-4 font-semibold text-center">{error}</p>
          )}

          <div className="w-full space-y-5">
            <input
              className="w-full h-13 bg-white/10 border border-white/20 text-white placeholder:text-white/50 rounded-xl px-7 focus:outline-none focus:border-purple-400 backdrop-blur-sm"
              type="email"
              placeholder="Email*"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />

            <input
              className="w-full h-13 bg-white/10 border border-white/20 text-white placeholder:text-white/50 rounded-xl px-7 focus:outline-none focus:border-purple-400 backdrop-blur-sm"
              type="password"
              placeholder="Password*"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>

          <button
            className="w-full max-w-[200px] h-13 bg-[#C9A3D9] rounded-xl mt-8 text-[#3A1C4A] font-bold hover:bg-white transition-all shadow-lg"
            onClick={async () => {
              try {
                await login(email, password);
                router.replace("/explore");
              } catch (err) {
                setError("Invalid email or password");
              }
            }}
          >
            Login
          </button>

          <div className="flex items-center gap-2 mt-8">
            <h6 className="text-white/60">
              Don't have an account?
            </h6>
            <button
              className="text-white underline hover:text-[#C9A3D9] transition"
              onClick={() => router.replace("/signup")}
            >
              Sign Up!
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}