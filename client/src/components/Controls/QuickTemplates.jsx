import React from 'react';
import { CalendarX, TrendingUp, Clock, Activity, Zap } from 'lucide-react';
import { templateData } from '../../data/templateData';

const iconMap = {
    CalendarX,
    TrendingUp,
    Clock,
    Activity
};

function QuickTemplates({ onSelect }) {
    return (
        <div className="flex flex-col gap-3 w-full animate-fade-in-up delay-100">
            <div className="flex items-center gap-2 text-xs font-semibold text-slate-500 uppercase tracking-wider">
                <Zap size={14} className="text-amber-400" />
                <span>Quick Replies</span>
            </div>

            <div className="grid grid-cols-2 gap-2">
                {templateData.map((template) => {
                    const Icon = iconMap[template.icon];
                    return (
                        <button
                            key={template.id}
                            onClick={() => onSelect(template.prompt)}
                            className="flex items-center gap-2 p-2 bg-slate-900 border border-slate-800 rounded-lg hover:bg-indigo-900/20 hover:border-indigo-500/30 transition-all text-left group"
                        >
                            <div className="p-1.5 rounded-md bg-slate-800 text-slate-400 group-hover:text-indigo-400 group-hover:bg-indigo-900/20 transition-colors">
                                <Icon size={14} />
                            </div>
                            <span className="text-xs font-medium text-slate-300 group-hover:text-slate-100 transition-colors">
                                {template.label}
                            </span>
                        </button>
                    );
                })}
            </div>
        </div>
    );
}

export default QuickTemplates;
