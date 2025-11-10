
import React from 'react';

interface SeoScoreGaugeProps {
    score: number;
    justification: string;
}

export const SeoScoreGauge: React.FC<SeoScoreGaugeProps> = ({ score, justification }) => {
    const radius = 52;
    const circumference = 2 * Math.PI * radius;
    const offset = circumference - (score / 100) * circumference;

    const getColor = (s: number) => {
        if (s > 80) return 'text-emerald-400';
        if (s > 50) return 'text-amber-400';
        return 'text-rose-500';
    };

    const getTrackColor = (s: number) => {
        if (s > 80) return 'stroke-emerald-400';
        if (s > 50) return 'stroke-amber-400';
        return 'stroke-rose-500';
    }

    return (
        <div className="bg-slate-800 p-4 rounded-lg flex flex-col items-center justify-center border border-slate-700/50">
             <div className="relative w-28 h-28 sm:w-32 sm:h-32">
                <svg className="w-full h-full" viewBox="0 0 120 120">
                    <circle
                        className="stroke-current text-slate-700"
                        strokeWidth="8"
                        fill="transparent"
                        r={radius}
                        cx="60"
                        cy="60"
                    />
                    <circle
                        className={`stroke-current ${getTrackColor(score)} transition-all duration-1000 ease-out`}
                        strokeWidth="8"
                        strokeDasharray={circumference}
                        strokeDashoffset={offset}
                        strokeLinecap="round"
                        fill="transparent"
                        r={radius}
                        cx="60"
                        cy="60"
                        transform="rotate(-90 60 60)"
                    />
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                    <span className={`text-3xl sm:text-4xl font-extrabold ${getColor(score)}`}>{score}</span>
                    <span className="text-xs font-bold text-slate-400">SEO SCORE</span>
                </div>
            </div>
            <p className="text-center text-xs sm:text-sm text-slate-400 mt-3 max-w-xs">{justification}</p>
        </div>
    );
};