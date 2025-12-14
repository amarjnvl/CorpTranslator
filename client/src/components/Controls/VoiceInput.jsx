import React, { useState, useEffect } from 'react';
import { Mic, MicOff } from 'lucide-react';

const VoiceInput = ({ onTranscript, className }) => {
  const [isListening, setIsListening] = useState(false);
  const [recognition, setRecognition] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
      const recognitionInstance = new SpeechRecognition();
      recognitionInstance.continuous = false;
      recognitionInstance.interimResults = false;
      recognitionInstance.lang = 'en-US';

      recognitionInstance.onstart = () => setIsListening(true);
      recognitionInstance.onend = () => setIsListening(false);
      
      recognitionInstance.onresult = (event) => {
        const transcript = event.results[0][0].transcript;
        onTranscript(transcript);
      };

      recognitionInstance.onerror = (event) => {
        console.error('Speech recognition error', event.error);
        setError('Voice input failed. Please check permissions.');
        setIsListening(false);
      };

      setRecognition(recognitionInstance);
    } else {
      setError('Voice input not supported in this browser.');
    }
  }, [onTranscript]);

  const toggleListening = () => {
    if (!recognition) return;
    
    if (isListening) {
      recognition.stop();
    } else {
      setError(null);
      recognition.start();
    }
  };

  if (!recognition) return null;

  return (
    <div className={`relative ${className}`}>
      <button
        onClick={toggleListening}
        className={`p-2 rounded-full transition-all duration-300 ${
          isListening 
            ? 'bg-red-500/20 text-red-500 hover:bg-red-500/30 ring-2 ring-red-500/50 animate-pulse' 
            : 'bg-slate-800 text-slate-400 hover:text-indigo-400 hover:bg-slate-700'
        }`}
        title={isListening ? "Stop Recording" : "Start Voice Input"}
      >
        {isListening ? <MicOff size={16} /> : <Mic size={16} />}
      </button>
      {error && (
        <span className="absolute left-full ml-2 top-1/2 -translate-y-1/2 text-xs text-red-400 whitespace-nowrap bg-slate-900 border border-slate-800 px-2 py-1 rounded shadow-xl">
          {error}
        </span>
      )}
    </div>
  );
};

export default VoiceInput;
