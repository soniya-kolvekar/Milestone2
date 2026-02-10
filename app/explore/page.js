'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { ArrowLeft, Brain, Activity, Sparkles, AlertTriangle, RefreshCw, ArrowRight } from 'lucide-react';

export default function ExplorePage() {
    const features = [
        {
            title: "Analyse Your Mood",
            description: "Track emotional patterns and understand your daily wellbeing.",
            icon: Brain,
            href: "/feature1",
            color: "text-pink-300",
            active: true
        },
        {
            title: "Habit Tracker",
            description: "Build consistency with daily check-ins and streak monitoring.",
            icon: Activity,
            href: "/habit-tracker",
            color: "text-emerald-300",
            active: true
        },
        {
            title: "Reset My Life",
            description: "A gentle, AI-guided 7-day plan to get back on track.",
            icon: Sparkles,
            href: "/reset-my-life",
            color: "text-purple-300",
            active: true
        },
        {
            title: "Risk Indicator",
            description: "Predict potential burnout or health risks based on your history.",
            icon: AlertTriangle,
            href: "/risk-indicator",
            color: "text-orange-300",
            active: true
        },
        {
            title: "Habit Replacement",
            description: "Swap negative loops for positive routines with scientific methods.",
            icon: RefreshCw,
            href: "#",
            color: "text-blue-300",
            active: false
        }
    ];

    return (
        <div className="min-h-screen bg-gradient-to-b from-[#3A1C4A] to-[#8E5AA8] text-white p-6 md:p-12 relative overflow-hidden">

            <div className="absolute inset-0 opacity-20 blur-3xl bg-[radial-gradient(circle_at_20%_20%,#ffffff22,transparent_40%),radial-gradient(circle_at_80%_80%,#ffffff22,transparent_40%)] pointer-events-none" />

            <nav className="relative z-10 flex items-center mb-16">
                <Link href="/">
                    <Button variant="ghost" className="text-white/80 hover:text-white hover:bg-white/10 gap-2 pl-0">
                        <ArrowLeft className="w-5 h-5" />
                        Back to Home
                    </Button>
                </Link>
            </nav>

            <div className="relative z-10 max-w-4xl mx-auto text-center mb-16 space-y-4">
                <motion.h1
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="text-4xl md:text-5xl font-bold tracking-tight"
                >
                    Explore Your Toolkit
                </motion.h1>
                <motion.p
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 }}
                    className="text-lg text-purple-100/80 max-w-2xl mx-auto"
                >
                    Designed to help you understand, heal, and grow. Choose a tool to begin.
                </motion.p>
            </div>

            <div className="relative z-10 max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {features.map((feature, index) => {
                    const Icon = feature.icon;
                    return (
                        <motion.div
                            key={index}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.2 + (index * 0.1) }}
                        >
                            <Card className="bg-white/10 border-white/10 backdrop-blur-md h-full hover:bg-white/15 transition-all group overflow-hidden relative">
                                <CardContent className="p-8 flex flex-col h-full">
                                    <div className={`p-3 rounded-2xl bg-white/5 w-fit mb-6 ${feature.color} group-hover:scale-110 transition-transform`}>
                                        <Icon className="w-8 h-8" />
                                    </div>

                                    <h3 className="text-xl font-bold mb-3">{feature.title}</h3>
                                    <p className="text-purple-100/70 leading-relaxed mb-8 flex-1">
                                        {feature.description}
                                    </p>

                                    {feature.active ? (
                                        <Link href={feature.href} className="w-full">
                                            <Button className="w-full bg-white text-purple-900 font-semibold hover:bg-purple-50 group-hover:translate-x-1 transition-all flex items-center justify-center gap-2">
                                                Launch Tool <ArrowRight className="w-4 h-4" />
                                            </Button>
                                        </Link>
                                    ) : (
                                        <Button disabled className="w-full bg-white/5 text-white/40 cursor-not-allowed border border-white/5">
                                            Coming Soon
                                        </Button>
                                    )}
                                </CardContent>
                            </Card>
                        </motion.div>
                    );
                })}
            </div>
        </div>
    );
}
