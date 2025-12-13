import React from 'react';
import clsx from 'clsx';
import { Mail, MessageSquare, Ticket, Users } from 'lucide-react';

const contexts = [
    { id: 'Email', icon: Mail },
    { id: 'Slack', icon: MessageSquare },
    { id: 'Jira', icon: Ticket },
];

const ContextChips = ({ selectedContext, setSelectedContext, selectedAudience, setSelectedAudience }) => {
    const audiences = ['Peer', 'Boss', 'Client'];

    return (
        <div className="flex flex-wrap items-end gap-6 w-full md:w-auto">
            {/* Context Selector */}
            <div className="flex flex-col space-y-2">
                <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Context</label>
                <div className="flex space-x-2">
                    {contexts.map((ctx) => {
                        const Icon = ctx.icon;
                        return (
                            <button
                                key={ctx.id}
                                onClick={() => setSelectedContext(ctx.id)}
                                className={clsx(
                                    "flex items-center space-x-2 px-3 py-1.5 rounded-full border text-xs font-medium transition-all",
                                    selectedContext === ctx.id
                                        ? "bg-slate-800 border-slate-600 text-white"
                                        : "bg-transparent border-slate-800 text-slate-500 hover:border-slate-700 hover:text-slate-300"
                                )}
                            >
                                <Icon size={14} />
                                <span>{ctx.id}</span>
                            </button>
                        );
                    })}
                </div>
            </div>

            {/* Audience Selector (Small Dropdown/Pills) */}
            <div className="flex flex-col space-y-2">
                <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Audience</label>
                <div className="flex bg-slate-900 rounded-md border border-slate-800 p-0.5">
                    {audiences.map((aud) => (
                        <button
                            key={aud}
                            onClick={() => setSelectedAudience(aud)}
                            className={clsx(
                                "px-3 py-1 text-[10px] font-medium rounded transition-colors",
                                selectedAudience === aud ? "bg-slate-700 text-white" : "text-slate-500 hover:text-slate-300"
                            )}
                        >
                            {aud}
                        </button>
                    ))}
                </div>
            </div>

        </div>
    );
};

export default ContextChips;
