import React, { useState } from 'react';
import { Volume2, VolumeX } from 'lucide-react';
import { useTranslation } from '../context/LanguageContext';

interface SpeechReaderProps {
  textToRead: string;
  label?: string;
  className?: string;
}

export const SpeechReader: React.FC<SpeechReaderProps> = ({ textToRead, label = "Listen to Findings", className = "" }) => {
  const { language } = useTranslation();
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isSupported] = useState(() => typeof window !== 'undefined' && 'speechSynthesis' in window);

  const handleToggleSpeech = () => {
    if (!isSupported) return;

    if (isSpeaking) {
      window.speechSynthesis.cancel();
      setIsSpeaking(false);
      return;
    }

    window.speechSynthesis.cancel(); // Stop any pending speech
    const utterance = new SpeechSynthesisUtterance(textToRead);

    // Set voice language based on current app language
    if (language === 'hi') {
      utterance.lang = 'hi-IN';
    } else if (language === 'mr') {
      utterance.lang = 'mr-IN';
    } else {
      utterance.lang = 'en-IN';
    }
    
    utterance.rate = 0.95; // slightly slower for rural clarity
    utterance.pitch = 1.0;

    utterance.onstart = () => setIsSpeaking(true);
    utterance.onend = () => setIsSpeaking(false);
    utterance.onerror = () => setIsSpeaking(false);

    window.speechSynthesis.speak(utterance);
  };

  if (!isSupported) {
    return null;
  }

  return (
    <button
      type="button"
      onClick={handleToggleSpeech}
      aria-label={isSpeaking ? "Stop audio readout" : label}
      title={isSpeaking ? "Stop audio playback" : label}
      className={`inline-flex items-center gap-2 px-3 py-2 text-sm font-medium rounded-lg transition-all duration-150 ${
        isSpeaking
          ? 'bg-amber-100 text-amber-900 border border-amber-300 animate-pulse'
          : 'bg-emerald-50 text-emerald-800 hover:bg-emerald-100 border border-emerald-200'
      } ${className}`}
    >
      {isSpeaking ? (
        <>
          <VolumeX className="w-4 h-4 text-amber-700" />
          <span>Stop Audio</span>
        </>
      ) : (
        <>
          <Volume2 className="w-4 h-4 text-emerald-700" />
          <span>{label}</span>
        </>
      )}
    </button>
  );
};
