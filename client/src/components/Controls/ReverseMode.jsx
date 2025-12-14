import React from 'react';
import { RefreshCw } from 'lucide-react';
import clsx from 'clsx';

/**
 * Toggle switch for Reverse Translator mode (decode exec-speak).
 * When enabled, translates corporate jargon into plain English.
 */
function ReverseMode({ isReverse, setIsReverse }) {
    return (
        <div className="flex items-center gap-3">
            <button
                onClick={() => setIsReverse(!isReverse)}
                className={clsx(
                    "flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-medium transition-all duration-300",
                    isReverse
                        ? "bg-amber-500/20 text-amber-400 border border-amber-500/30 shadow-[0_0_15px_-3px_theme(colors.amber.500)]"
                        : "bg-slate-800 text-slate-400 border border-slate-700 hover:border-slate-600"
                )}
                title="Toggle Reverse Mode: Decode corporate jargon into plain English"
            >
                <RefreshCw
                    size={14}
                    className={clsx(
                        "transition-transform duration-300",
                        isReverse && "rotate-180"
                    )}
                />
                <span>{isReverse ? "Decode Mode" : "Translate Mode"}</span>
            </button>

            {isReverse && (
                <span className="text-[10px] text-amber-500/70 animate-pulse">
                    🕵️ Decoding exec-speak...
                </span>
            )}
        </div>
    );
}

export default ReverseMode;
