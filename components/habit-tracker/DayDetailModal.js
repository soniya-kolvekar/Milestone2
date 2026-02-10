
'use client';
import { X } from 'lucide-react';

export default function DayDetailModal({ isOpen, onClose, data }) {
    if (!isOpen || !data) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm transition-opacity">
            <div className="bg-white dark:bg-zinc-900 w-full max-w-md rounded-3xl shadow-2xl overflow-hidden border border-gray-100 dark:border-zinc-800 animate-in fade-in zoom-in duration-300">

                {/* Header */}
                <div className="p-6 bg-gradient-to-r from-purple-100 to-indigo-100 dark:from-purple-900/30 dark:to-indigo-900/30 relative">
                    <button
                        onClick={onClose}
                        className="absolute top-4 right-4 p-2 bg-white/50 hover:bg-white rounded-full transition-colors dark:bg-black/20 dark:hover:bg-black/40"
                    >
                        <X className="w-5 h-5 text-gray-600 dark:text-gray-300" />
                    </button>

                    <h2 className="text-2xl font-bold text-purple-900 dark:text-purple-100 mb-1">{data.date || 'Today'}</h2>
                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/60 dark:bg-black/20 text-sm font-medium text-purple-700 dark:text-purple-300">
                        Score: {data.score}/100
                    </div>
                </div>

                {/* Body */}
                <div className="p-6 space-y-6 max-h-[70vh] overflow-y-auto">

                    {!data.score ? (
                        <div className="flex flex-col items-center justify-center py-10 text-center space-y-4">
                            <div className="w-16 h-16 bg-gray-100 dark:bg-zinc-800 rounded-full flex items-center justify-center">
                                <span className="text-2xl">📭</span>
                            </div>
                            <div>
                                <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">No Data Found</h3>
                                <p className="text-gray-500 dark:text-gray-400 text-sm max-w-[200px] mx-auto mt-1">
                                    You didn't track your habits on this day.
                                </p>
                            </div>
                        </div>
                    ) : (
                        <>
                            {/* Insight */}
                            <div className="space-y-2">
                                <h3 className="text-sm uppercase tracking-wider font-semibold text-gray-500">Daily Insight</h3>
                                <p className="text-gray-800 dark:text-gray-200 leading-relaxed font-light text-lg">
                                    "{data.insight}"
                                </p>
                            </div>

                            {/* Suggestion Box */}
                            <div className="bg-indigo-50 dark:bg-indigo-900/10 p-4 rounded-2xl border border-indigo-100 dark:border-indigo-800/50">
                                <h3 className="text-xs font-bold text-indigo-500 uppercase mb-2">My Suggestion</h3>
                                <p className="text-indigo-900 dark:text-indigo-200">{data.suggestion}</p>
                            </div>

                            {/* Metrics Grid */}
                            <div className="grid grid-cols-2 gap-4">
                                <div className="bg-gray-50 dark:bg-zinc-800/50 p-4 rounded-2xl">
                                    <span className="block text-xs text-gray-500 mb-1">Mood</span>
                                    <span className="font-medium text-gray-900 dark:text-gray-100">{data.mood}</span>
                                </div>
                                <div className="bg-gray-50 dark:bg-zinc-800/50 p-4 rounded-2xl">
                                    <span className="block text-xs text-gray-500 mb-1">Sleep</span>
                                    <span className="font-medium text-gray-900 dark:text-gray-100">{data.sleep} hrs</span>
                                </div>
                                <div className="bg-gray-50 dark:bg-zinc-800/50 p-4 rounded-2xl">
                                    <span className="block text-xs text-gray-500 mb-1">Productivity</span>
                                    <span className="font-medium text-gray-900 dark:text-gray-100">{data.productivity}/10</span>
                                </div>
                                <div className="bg-gray-50 dark:bg-zinc-800/50 p-4 rounded-2xl">
                                    <span className="block text-xs text-gray-500 mb-1">Reflection</span>
                                    <span className="font-medium text-gray-900 dark:text-gray-100 line-clamp-1">{data.reflection}</span>
                                </div>
                            </div>
                        </>
                    )}

                </div>
            </div>
        </div>
    );
}
