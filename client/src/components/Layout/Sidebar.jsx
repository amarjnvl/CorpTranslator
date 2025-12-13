import React from 'react';
import { Clock, ChevronRight } from 'lucide-react';
import clsx from 'clsx';

const Sidebar = ({ isOpen, history, onSelect }) => {
    return (
        <div
            className={clsx(
                "fixed inset-y-0 left-0 bg-slate-950 border-r border-slate-800 w-64 transform transition-transform duration-300 ease-in-out z-20 flex flex-col",
                isOpen ? "translate-x-0" : "-translate-x-full",
                "md:relative md:translate-x-0" // Always show on desktop
            )}
        >
            <div className="p-4 border-b border-slate-800 flex items-center space-x-2">
                <div className="w-6 h-6 bg-slate-800 rounded-md flex items-center justify-center">
                    <span className="text-slate-200 font-bold text-xs">C</span>
                </div>
                <h1 className="text-sm font-bold text-slate-200 tracking-tight">CorpTranslator</h1>
            </div>

            <div className="flex-1 overflow-y-auto py-4">
                <div className="px-4 mb-2 text-xs font-semibold text-slate-500 uppercase tracking-wider flex items-center space-x-1">
                    <Clock size={12} />
                    <span>Recent History</span>
                </div>

                <div className="space-y-0.5 px-2">
                    {history.length === 0 ? (
                        <div className="px-2 py-4 text-xs text-slate-600 italic text-center">No history yet.</div>
                    ) : (
                        history.map((item) => (
                            <button
                                key={item._id}
                                onClick={() => onSelect(item)}
                                className="w-full text-left p-2 rounded hover:bg-slate-900 group transition-colors"
                            >
                                <div className="flex items-center justify-between pointer-events-none">
                                    <span className="text-xs font-medium text-slate-400 group-hover:text-slate-200 truncate pr-2">
                                        {item.originalText}
                                    </span>
                                    <span className="text-[10px] text-slate-600 bg-slate-900 border border-slate-800 px-1 rounded uppercase">
                                        {item.tone.slice(0, 1)}
                                    </span>
                                </div>
                                <div className="text-[10px] text-slate-600 mt-0.5 truncate text-opacity-50">
                                    {new Date(item.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} • {item.context}
                                </div>
                            </button>
                        ))
                    )}
                </div>
            </div>

            <div className="p-4 border-t border-slate-800">
                <div className="flex items-center space-x-2 text-xs text-slate-600">
                    <div className="w-2 h-2 rounded-full bg-green-500"></div>
                    <span>System Operational</span>
                </div>
            </div>
        </div>
    );
};

export default Sidebar;
