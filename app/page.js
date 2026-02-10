"use client";

import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import Link from "next/link";
import Image from "next/image";
import { useEffect, useState } from "react";
import { User } from "lucide-react";

export default function LandingPage() {
  const [mounted, setMounted] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    setMounted(true);

    const handleScroll = () => {
      if (window.scrollY > 20) {
        setIsScrolled(true);
      } else {
        setIsScrolled(false);
      }
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  if (!mounted) return null;

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#3A1C4A] to-[#8E5AA8] text-white relative overflow-hidden">
      {/* subtle glow background */}
      <div className="absolute inset-0 opacity-30 blur-3xl bg-[radial-gradient(circle_at_20%_20%,#ffffff22,transparent_40%),radial-gradient(circle_at_80%_0%,#ffffff22,transparent_40%)]" />

      {/* Navbar */}
      <nav
        className={`fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-8 py-4 transition-all duration-300 ${isScrolled
            ? "bg-[#3A1C4A]/80 backdrop-blur-md shadow-lg py-3"
            : "bg-transparent"
          }`}
      >
        <Link href="/" className="flex items-center">
          <Image
            src="/logo.jpeg"
            alt="HabitLens Logo"
            width={40}
            height={40}
            className="object-contain rounded-full"
            priority
          />
          <span className="ml-3 font-semibold text-lg tracking-tight">HabitLens</span>
        </Link>
        <div className="flex items-center space-x-4">
          <Link href="/login">
            <Button variant="ghost" className="text-white/80 hover:text-white hover:bg-white/10 rounded-xl px-4 py-2">Login</Button>
          </Link>
          <Link href="/signup">
            <Button className="bg-white/90 text-purple-800 hover:bg-white rounded-xl shadow-lg px-4 py-2">
              Get Started
            </Button>
          </Link>
          <Link href="/profile">
            <Button variant="ghost" size="icon" className="text-white/80 hover:text-white hover:bg-white/10 rounded-full">
              <User className="w-6 h-6" />
            </Button>
          </Link>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative z-10 flex flex-col items-center text-center px-6 pt-24 pb-20">
        <motion.h2
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7 }}
          className="text-4xl md:text-6xl font-semibold leading-tight max-w-3xl tracking-tight"
        >
          Understand Your Habits.
          <br className="hidden md:block" />
          Shape Your Future.
        </motion.h2>

        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.7 }}
          className="mt-6 text-lg md:text-xl text-purple-100/90 max-w-2xl leading-relaxed"
        >
          A calm, intelligent space that helps you see how small daily actions
          quietly influence your health, focus, and emotional well‑being over
          time.
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4, duration: 0.7 }}
          className="mt-10 flex flex-col sm:flex-row gap-4"
        >
          <Link href="/feature1">
            <Button className="bg-white text-purple-800 text-lg px-8 py-4 rounded-2xl shadow-xl hover:scale-[1.02] transition-transform">
              Try Simulation
            </Button>
          </Link>
          <Link href="/explore">
            <Button
              variant="ghost"
              className="border border-white/30 text-white text-lg px-8 py-4 rounded-2xl hover:bg-white/10"
            >
              Explore Features
            </Button>
          </Link>
        </motion.div>

        {/* glass preview panel */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6, duration: 0.8 }}
          className="mt-16 w-full max-w-4xl"
        >
          <div className="rounded-3xl bg-white/10 backdrop-blur-2xl border border-white/20 p-8 shadow-2xl">
            <p className="text-purple-100 text-sm uppercase tracking-widest mb-4">
              Future Insight Preview
            </p>
            <div className="grid md:grid-cols-3 gap-4 text-left">
              {[
                "Sleep improves focus by 18%",
                "Reduced screen time lowers stress",
                "Daily walks increase energy levels",
              ].map((item, i) => (
                <div
                  key={i}
                  className="rounded-2xl bg-black/20 border border-white/10 p-4 text-sm text-purple-50"
                >
                  {item}
                </div>
              ))}
            </div>
          </div>
        </motion.div>
      </section>

      {/* Features Section */}
      <section className="relative z-10 px-8 pb-28 grid md:grid-cols-3 gap-6 max-w-6xl mx-auto">
        {[
          {
            title: "Consequence Prediction",
            desc: "Quietly understand the short‑ and long‑term impact of everyday habits.",
          },
          {
            title: "Future Timeline",
            desc: "See gentle projections of where your current routine may lead.",
          },
          {
            title: "Guided Improvement",
            desc: "Receive small, realistic steps toward a healthier daily rhythm.",
          },
        ].map((feature, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.12 }}
            viewport={{ once: true }}
          >
            <Card className="bg-white/10 border-white/20 backdrop-blur-xl rounded-3xl shadow-xl hover:bg-white/15 transition-colors">
              <CardContent className="p-7">
                <h3 className="text-xl font-semibold mb-2 tracking-tight">
                  {feature.title}
                </h3>
                <p className="text-purple-100/90 leading-relaxed">
                  {feature.desc}
                </p>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </section>

      {/* CTA Section */}
      <section className="relative z-10 text-center pb-24 px-6">
        <h3 className="text-3xl md:text-4xl font-semibold tracking-tight">
          Begin with one small change
        </h3>
        <p className="mt-4 text-purple-100/90">
          Your future is shaped quietly by what you do today.
        </p>
        <Link href="/signup">
          <Button className="mt-8 bg-white text-purple-800 text-lg px-10 py-4 rounded-2xl shadow-xl hover:scale-[1.02] transition-transform">
            Create Free Account
          </Button>
        </Link>
      </section>

      {/* Footer */}
      <footer className="relative z-10 border-t border-white/20 text-center py-8 text-purple-200/80 text-sm">
        © {new Date().getFullYear()} HabitScope · Designed for mindful growth
      </footer>
    </div>
  );
}