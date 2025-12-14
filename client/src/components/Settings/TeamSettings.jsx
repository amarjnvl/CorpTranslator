import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { X, Save, ShieldAlert } from 'lucide-react';

const TeamSettings = ({ onClose }) => {
    const [bannedWords, setBannedWords] = useState('');
    const [requiredPhrases, setRequiredPhrases] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [msg, setMsg] = useState(null);

    useEffect(() => {
        fetchSettings();
    }, []);

    const fetchSettings = async () => {
        try {
            const res = await axios.get('/api/team');
            setBannedWords(res.data.bannedWords ? res.data.bannedWords.join(', ') : '');
            setRequiredPhrases(res.data.requiredPhrases ? res.data.requiredPhrases.join(', ') : '');
        } catch (err) {
            console.error('Failed to load team settings', err);
        }
    };

    const handleSave = async () => {
        setIsLoading(true);
        try {
            // Parse comma-separated strings into arrays
            const banned = bannedWords.split(',').map(s => s.trim()).filter(s => s);
            const required = requiredPhrases.split(',').map(s => s.trim()).filter(s => s);

            await axios.post('/api/team', {
                bannedWords: banned,
                requiredPhrases: required
            });
            setMsg('Saved!');
            setTimeout(() => setMsg(null), 2000);
        } catch (err) {
            setMsg('Error saving.');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm animate-fade-in">
            <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-lg p-6 shadow-2xl relative">
                <button
                    onClick={onClose}
                    className="absolute top-4 right-4 text-slate-500 hover:text-white transition-colors"
                >
                    <X size={20} />
                </button>

                <h2 className="text-xl font-bold text-slate-100 mb-6 flex items-center gap-2">
                    <ShieldAlert className="text-indigo-500" />
                    Team Brand Dictionary
                </h2>

                <div className="space-y-6">
                    <div>
                        <label className="block text-xs font-semibold text-slate-500 uppercase mb-2">
                            Banned Words (comma separated)
                        </label>
                        <textarea
                            value={bannedWords}
                            onChange={(e) => setBannedWords(e.target.value)}
                            className="w-full bg-slate-950 border border-slate-800 rounded-lg p-3 text-sm text-red-300 focus:outline-none focus:border-red-500/50"
                            placeholder="e.g. synergistic, circle back, leverage"
                            rows={3}
                        />
                    </div>

                    <div>
                        <label className="block text-xs font-semibold text-slate-500 uppercase mb-2">
                            Required Phrases (comma separated)
                        </label>
                        <textarea
                            value={requiredPhrases}
                            onChange={(e) => setRequiredPhrases(e.target.value)}
                            className="w-full bg-slate-950 border border-slate-800 rounded-lg p-3 text-sm text-green-300 focus:outline-none focus:border-green-500/50"
                            placeholder="e.g. customer-obsessed, data-driven"
                            rows={3}
                        />
                    </div>
                </div>

                <div className="mt-8 flex items-center justify-end gap-3">
                    {msg && <span className="text-sm text-green-400 animate-pulse">{msg}</span>}
                    <button
                        onClick={handleSave}
                        disabled={isLoading}
                        className="bg-indigo-600 hover:bg-indigo-500 text-white px-4 py-2 rounded-lg text-sm font-medium flex items-center gap-2 transition-colors disabled:opacity-50"
                    >
                        {isLoading ? <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <Save size={16} />}
                        Save Rules
                    </button>
                </div>
            </div>
        </div>
    );
};

export default TeamSettings;
