import React from 'react';
import clsx from 'clsx';

const tones = ['Helpful', 'Neutral', 'Firm', 'Ruthless', 'C-Level'];

const ToneSlider = ({ selectedTone, setSelectedTone }) => {
    return (
        <div className="flex flex-col space-y-2 w-full md:w-auto">
            <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Tone</label>
            <div className="flex items-center bg-slate-900 p-1 rounded-lg border border-slate-800">
                {tones.map((tone) => (
                    <button
                        key={tone}
                        onClick={() => setSelectedTone(tone)}
                        className={clsx(
                            "flex-1 px-4 py-1.5 text-xs font-medium rounded-md transition-all duration-200",
                            selectedTone === tone
                                ? "bg-slate-700 text-white shadow-sm"
                                : "text-slate-500 hover:text-slate-300 hover:bg-slate-800/50"
                        )}
                    >
                        {tone}
                    </button>
                ))}
            </div>
        </div>
    );
};

export default ToneSlider;
