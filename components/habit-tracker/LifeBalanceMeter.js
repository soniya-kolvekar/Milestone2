
'use client';
import { PieChart, Pie, Cell, ResponsiveContainer } from 'recharts';

export default function LifeBalanceMeter({ score, label = "Life Balance" }) {
    const data = [
        { name: 'Score', value: score },
        { name: 'Remaining', value: 100 - score },
    ];

    // Determine color and status based on score
    let statusColor = '#4ade80'; // Green (Thriving) - bright for dark bg
    let statusText = 'Thriving';

    if (score < 40) {
        statusColor = '#f87171'; // Red (Needs Care)
        statusText = 'Needs Care';
    } else if (score < 70) {
        statusColor = '#fbbf24'; // Amber (Stable)
        statusText = 'Stable';
    }

    return (
        <div className="flex flex-col items-center justify-center p-6 bg-white/10 backdrop-blur-md rounded-3xl shadow-sm border border-white/20 h-full text-white">
            <h3 className="text-lg font-medium text-purple-200 mb-2">{label}</h3>

            <div className="relative w-48 h-48">
                <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                        <Pie
                            data={data}
                            cx="50%"
                            cy="50%"
                            innerRadius={60}
                            outerRadius={80}
                            startAngle={180}
                            endAngle={0}
                            paddingAngle={5}
                            dataKey="value"
                            stroke="none"
                            isAnimationActive={true}
                        >
                            <Cell key="score" fill={statusColor} />
                            <Cell key="remaining" fill="rgba(255,255,255,0.1)" />
                        </Pie>
                    </PieChart>
                </ResponsiveContainer>

                {/* Center Text */}
                <div className="absolute inset-0 flex flex-col items-center justify-center pt-8">
                    <span className="text-4xl font-bold text-white">{score}</span>
                    <span className="text-sm font-medium" style={{ color: statusColor }}>{statusText}</span>
                </div>
            </div>

            <p className="text-xs text-center text-white/60 mt-2 px-4">
                Based on your sleep, mood, and activity levels.
            </p>
        </div>
    );
}
