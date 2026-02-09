"use client";

import { login, createAccount, resetEmail, logout } from "../core/auth";
import { useRouter } from "next/navigation";
import { useState } from "react";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const router = useRouter();

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
   <div  onMouseEnter={() => setHoverBg(true)}
      onMouseLeave={() => setHoverBg(false)}
      className={`min-h-screen transition-all duration-700 ease-in-out
        ${
          hoverBg
            ? "bg-gradient-to-b from-[#5A2A6E] to-[#B58BC6]"
            : "bg-gradient-to-b from-[#3A1C4A] to-[#8E5AA8]"
        }
      `}>

      <h1 className="text-black text-6xl ml-50 font-bold font-[marcellus] py-16">
        Habit Consequence Simulator
      </h1>

      <div className="flex flex-row ml-50">
        <div className="  w-full -mt-7 ml-5">
          <h6 className="text-white ">Enter your credentials</h6>
        </div>

        <div className="flex flex-col -ml-335">
          {error && (
            <p className="text-red-600 mb-3 font-semibold">{error}</p>
          )}

          <input
            className="md:w-90 w-70 h-13 bg-[#E3E8F0] text-black rounded-[5px] mt-10 px-7"
            type="email"
            placeholder="Email*"
            onChange={(e) => setEmail(e.target.value)}
          />

          <input
            className="md:w-90 w-70 h-13 bg-[#E3E8F0] text-black rounded-[5px] mt-5 px-7"
            type="password"
            placeholder="xxxxxx"
            onChange={(e) => setPassword(e.target.value)}
          />

          <button
            className="md:w-50 w-40 h-13 bg-[#C9A3D9] rounded-[5px] mt-5 text-black hover:text-white justify-center items-center md:mx-20 hover:bg-[#5A2A6E]"
            onClick={async () => {
              try {
                await login(email, password);
                router.replace("/home");     
              } catch (err) {
                setError("Invalid email or password");
              }
            }}
          >
            Login
          </button>

          <button
            className="md:w-50 w-40 h-13 bg-[#C9A3D9] rounded-[5px] mt-5 text-black hover:text-white justify-center items-center md:mx-20 hover:bg-[#5A2A6E]"
            onClick={async () => {
              try {
                await createAccount(email, password);
                router.replace("/signup");
              } catch {
                setError("Signup failed");
              }
            }}
          >
            Sign Up
          </button>

          <button
            className="md:w-50 w-50 h-13 bg-[#C9A3D9] rounded-[5px] mt-5 text-black hover:text-white justify-center items-center md:mx-20 hover:bg-[#5A2A6E]"
            onClick={async () => {
              try {
                await resetEmail(email);
                alert("Reset email sent");
              } catch {
                setError("Reset failed");
              }
            }}
          >
            Send Reset Email
          </button>

        

          <div className="flex flex-row">
            <h6 className="text-gray-500 ml-10 mt-5">
              Don't have an account?
            </h6>
            <h6
              className="text-white underline mt-5 ml-2"
              onClick={() => router.replace("/signup")}
            >
              Sign Up!
            </h6>
          </div>
        </div>

      
      </div>
    </div>
  );
}