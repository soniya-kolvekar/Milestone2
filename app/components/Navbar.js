"use client";
import Link from "next/link";
import { useState, useEffect } from "react";
export default function Navbar() {
    const [scrolled, setScrolled] = useState(false);
    useEffect(() => {
        const handleScroll = () => {
            setScrolled(window.scrollY > 20);
        };
        window.addEventListener("scroll", handleScroll);
        return () => window.removeEventListener("scroll", handleScroll);
    }, []);
   return (
        <nav
            className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 px-6 py-4 flex items-center justify-between ${scrolled
                    ? "bg-black/30 backdrop-blur-md border-b border-white/10"
                    : "bg-transparent"
                }`}
        >
            <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[#C9A3D9] to-[#5A2A6E] flex items-center justify-center">
                    <span className="text-white font-bold text-xl">H</span>
                </div>
                <span className="text-white font-bold text-xl tracking-tight max-md:hidden">
                    Habit Consequence
                </span>
            </div>

            <div className="flex items-center gap-8">
                <Link
                    href="/login"
                    className="px-6 py-2 rounded-full border border-white/20 text-white font-medium hover:bg-white/10 transition-all"
                >
                    Login
                </Link>
                <Link
                    href="/signup"
                    className="px-6 py-2 rounded-full bg-gradient-to-r from-[#C9A3D9] to-[#8E5AA8] text-black font-semibold hover:shadow-[0_0_20px_rgba(201,163,217,0.4)] transition-all"
                >
                    Get Started
                </Link>
            </div>
        </nav>
    );
}
