import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { Copy, Sparkles, Menu, X, ArrowRight } from 'lucide-react';
import clsx from 'clsx';
import Sidebar from './components/Layout/Sidebar';
import ToneSlider from './components/Controls/ToneSlider';
import ContextChips from './components/Controls/ContextChips';
import ReverseMode from './components/Controls/ReverseMode';
import QuickTemplates from './components/Controls/QuickTemplates';
import FeedbackButtons from './components/UI/FeedbackButtons';
import VoiceInput from './components/Controls/VoiceInput';
import TeamSettings from './components/Settings/TeamSettings';
import SkeletonLoader from './components/UI/SkeletonLoader';
import Toast from './components/UI/Toast';
import usePersistentState from './hooks/usePersistentState';

function App() {
  const [inputText, setInputText] = useState('');
  const [outputText, setOutputText] = useState('');
  const [selectedTone, setSelectedTone] = usePersistentState('tone', 'Neutral');
  const [selectedContext, setSelectedContext] = usePersistentState('context', 'Email');
  const [selectedAudience, setSelectedAudience] = usePersistentState('audience', 'Peer');

  const [history, setHistory] = useState([]);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [showToast, setShowToast] = useState(false);
  const [isReverseMode, setIsReverseMode] = useState(false);
  const [currentTranslationId, setCurrentTranslationId] = useState(null);
  const [showTeamSettings, setShowTeamSettings] = useState(false);

  // Fetch history on mount
  const fetchHistory = useCallback(async () => {
    try {
      const res = await axios.get('/api/history');
      setHistory(res.data);
    } catch (err) {
      console.error('Failed to fetch history', err);
    }
  }, []);

  useEffect(() => {
    fetchHistory();
  }, [fetchHistory]);

  const handleTranslate = async () => {
    if (!inputText.trim()) return;

    setIsLoading(true);
    try {
      const res = await axios.post('/api/translate', {
        text: inputText,
        tone: selectedTone,
        context: selectedContext,
        audience: selectedAudience,
        reverseMode: isReverseMode
      });
      setOutputText(res.data.translation);
      setCurrentTranslationId(res.data.id);
      fetchHistory(); // Refresh sidebar
    } catch (err) {
      console.error('Translation error', err);
      // Fallback if server is down (though plan says we should use server logic)
      setOutputText("Error connecting to server. Please ensure backend is running.");
    } finally {
      setIsLoading(false);
    }
  };

  // Hotkey: Cmd/Ctrl + Enter
  useEffect(() => {
    const handleKeyDown = (e) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'Enter') {
        handleTranslate();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [inputText, selectedTone, selectedContext, selectedAudience]); // Dep array important for closure capture

  const handleCopy = async () => {
    if (!outputText) return;
    try {
      await navigator.clipboard.writeText(outputText);
      setShowToast(true);
      setTimeout(() => setShowToast(false), 2000);
    } catch (err) {
      console.error('Failed to copy', err);
    }
  };

  const handleRestore = (item) => {
    setInputText(item.originalText);
    setOutputText(item.translatedText);
    setSelectedTone(item.tone);
    setSelectedContext(item.context);
    if (item.audience) setSelectedAudience(item.audience);
    // On mobile, close sidebar after select
    if (window.innerWidth < 768) setIsSidebarOpen(false);
  };

  // Dynamic Glow based on Tone
  const getGlowColor = () => {
    switch (selectedTone) {
      case 'Ruthless': return 'border-red-900/30 shadow-[0_0_30px_-5px_theme(colors.red.900)]';
      case 'Helpful': return 'border-green-900/30 shadow-[0_0_30px_-5px_theme(colors.green.900)]';
      case 'C-Level': return 'border-purple-900/30 shadow-[0_0_30px_-5px_theme(colors.purple.900)]';
      default: return 'border-slate-800'; // Default
    }
  };

  return (
    <div className="flex h-screen bg-slate-950 text-slate-50 overflow-hidden font-sans selection:bg-indigo-500/30">

      {/* Team Settings Modal */}
      {showTeamSettings && <TeamSettings onClose={() => setShowTeamSettings(false)} />}

      <Sidebar
        isOpen={isSidebarOpen}
        history={history}
        onSelect={handleRestore}
      />

      {/* Overlay for mobile sidebar */}
      {isSidebarOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-10 md:hidden"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      {/* Main Content */}
      <div className={clsx("flex-1 flex flex-col h-full relative transition-all duration-500", getGlowColor())}>

        {/* Settings Button (Top Right) */}
        <button
          onClick={() => setShowTeamSettings(true)}
          className="fixed top-6 right-6 z-20 p-2 text-slate-400 hover:text-white transition-colors"
          title="Team Settings"
        >
          <Sparkles size={20} />
        </button>

        {/* Mobile Header */}
        <div className="md:hidden flex items-center justify-between p-4 border-b border-slate-800 bg-slate-900">
          <div className="flex items-center space-x-2">
            <button onClick={() => setIsSidebarOpen(!isSidebarOpen)} className="text-slate-400">
              {isSidebarOpen ? <X /> : <Menu />}
            </button>
            <span className="font-bold text-sm">CorpTranslator</span>
          </div>
        </div>

        {/* Split Screen */}
        <div className="flex-1 flex flex-col md:flex-row overflow-hidden">

          {/* LEFT PANEL: INPUT */}
          <div className="flex-1 flex flex-col bg-slate-900 p-6 md:p-8 relative group">
            <div className="flex items-center justify-between mb-4">
              <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Original Text</label>
              <div className="flex items-center gap-2">
                <VoiceInput onTranscript={(text) => setInputText((prev) => prev ? prev + ' ' + text : text)} />
                <button
                  onClick={() => setInputText('')}
                  className="text-xs text-slate-500 hover:text-red-400 transition-colors"
                  disabled={!inputText}
                >
                  Clear
                </button>
              </div>
            </div>
            <textarea
              className="w-full h-full bg-transparent border-none resize-none focus:ring-0 text-lg md:text-xl text-slate-300 placeholder-slate-600 leading-relaxed"
              placeholder={isReverseMode
                ? "Paste correct corporate speak here... (e.g. 'Let's circle back')"
                : "Type your raw thoughts here... (e.g., 'That idea is stupid')"
              }
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              autoFocus
            />
            <div className="absolute bottom-6 right-6 text-xs text-slate-600 pointer-events-none group-hover:text-slate-500 transition-colors">
              Cmd + Enter to translate
            </div>

            {/* Quick Templates Overlay or Bottom Panel */}
            <div className="absolute bottom-6 left-6 right-36 z-10 w-auto">
              <QuickTemplates onSelect={setInputText} />
            </div>
          </div>

          {/* MIDDLE CONTROL BAR (Desktop: Vertical / Horizontal depending on design choice) */}
          {/* Design Decision: Horizontal Bar separating Top/Bottom on Mobile, or Vertical Line on Desktop? 
                User req: "Horizontal bar sitting between Input and Output". 
                For side-by-side, this implies a central column or a floating bar.
                Let's make it a Layout Divider that holds controls.
            */}
          <div className="border-t md:border-t-0 md:border-l border-slate-800 bg-slate-950 p-4 md:P-6 flex flex-row md:flex-col items-center justify-between md:justify-center gap-4 z-10 shadow-xl">
            <div className="flex md:flex-col items-center gap-4 md:gap-8 w-full">
              <ToneSlider selectedTone={selectedTone} setSelectedTone={setSelectedTone} />
              <div className="w-px h-8 bg-slate-800 md:w-full md:h-px"></div>
              <ContextChips
                selectedContext={selectedContext}
                setSelectedContext={setSelectedContext}
                selectedAudience={selectedAudience}
                setSelectedAudience={setSelectedAudience}
              />
            </div>

            <button
              onClick={handleTranslate}
              disabled={isLoading || !inputText}
              className="md:mt-8 bg-indigo-600 hover:bg-indigo-500 text-white rounded-full p-4 md:p-4 shadow-lg shadow-indigo-900/20 transform transition-all active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed group"
            >
              {isLoading ? (
                <div className="animate-spin rounded-full h-6 w-6 border-2 border-white border-t-transparent"></div>
              ) : (
                <ArrowRight className="group-hover:translate-x-1 transition-transform" />
              )}
            </button>
          </div>

          {/* RIGHT PANEL: OUTPUT */}
          <div className="flex-1 flex flex-col bg-slate-950 p-6 md:p-8 relative border-l border-slate-800/50">
            <div className="flex items-center justify-between mb-4">
              <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Professional Output</span>
              {outputText && (
                <div className="flex items-center gap-3">
                  <FeedbackButtons translationId={currentTranslationId} />
                  <div className="w-px h-3 bg-slate-800"></div>
                  <button
                    onClick={handleCopy}
                    className="flex items-center space-x-1 text-xs text-slate-500 hover:text-indigo-400 transition-colors"
                  >
                    <Copy size={14} />
                    <span>Copy</span>
                  </button>
                </div>
              )}
            </div>

            {isLoading ? (
              <SkeletonLoader />
            ) : outputText ? (
              <div className="prose prose-invert prose-lg max-w-none text-slate-100 leading-relaxed animate-fade-in-up">
                {outputText}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center h-full text-slate-700 space-y-4">
                <Sparkles size={48} className="opacity-20" />
                <span className="text-sm">Translation will appear here...</span>
              </div>
            )}
          </div>
        </div>
      </div>

      {showToast && <Toast message="Copied to clipboard!" onClose={() => setShowToast(false)} />}
    </div>
  );
}

export default App;
