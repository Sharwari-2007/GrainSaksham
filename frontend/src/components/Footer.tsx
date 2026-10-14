import React from 'react';
import { Sprout, ShieldAlert, Award, FileText, CheckCircle2 } from 'lucide-react';
import { useTranslation } from '../context/LanguageContext';

export const Footer: React.FC<{ onNavigate: (view: string) => void }> = ({ onNavigate }) => {
  const { t } = useTranslation();

  return (
    <footer className="bg-stone-900 text-stone-300 pt-16 pb-12 border-t border-stone-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-10 mb-12">
          
          {/* Brand & Vision */}
          <div className="md:col-span-2 space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-agri-700 flex items-center justify-center">
                <Sprout className="w-6 h-6 text-emerald-300" />
              </div>
              <span className="font-extrabold text-xl text-white tracking-tight font-serif">
                GrainSaksham <span className="text-emerald-400 font-sans font-bold text-sm bg-emerald-950/80 px-2 py-0.5 rounded border border-emerald-800">AI</span>
              </span>
            </div>
            <p className="text-stone-400 text-sm leading-relaxed max-w-md">
              “Know Your Grain. Prove Its Quality. Get a Fairer Price.”
              Empowering Indian farmers with explainable computer-vision grain quality inspection,
              tamper-evident digital quality passports, and transparent APMC mandi price comparison.
            </p>
            <div className="flex items-center gap-4 text-xs text-stone-400 pt-2">
              <span className="inline-flex items-center gap-1.5 bg-stone-800 px-2.5 py-1 rounded-md text-emerald-400">
                <Award className="w-3.5 h-3.5" /> AI Hackathon 2026 Entry
              </span>
              <span className="inline-flex items-center gap-1.5 bg-stone-800 px-2.5 py-1 rounded-md text-amber-400">
                <CheckCircle2 className="w-3.5 h-3.5" /> AGMARK Schedule I Standards
              </span>
            </div>
          </div>

          {/* Quick Navigation */}
          <div>
            <h4 className="text-white font-semibold text-sm uppercase tracking-wider mb-4">
              Platform Features
            </h4>
            <ul className="space-y-2 text-sm">
              <li>
                <button onClick={() => onNavigate('scanner')} className="hover:text-emerald-400 transition-colors">
                  AI Grain Quality Scanner
                </button>
              </li>
              <li>
                <button onClick={() => onNavigate('mandi')} className="hover:text-emerald-400 transition-colors">
                  Mandi Benchmark Prices
                </button>
              </li>
              <li>
                <button onClick={() => onNavigate('disputes')} className="hover:text-emerald-400 transition-colors">
                  Grade Dispute Resolution
                </button>
              </li>
              <li>
                <button onClick={() => onNavigate('coach')} className="hover:text-emerald-400 transition-colors">
                  AI Quality Improvement Coach
                </button>
              </li>
              <li>
                <button onClick={() => onNavigate('marketplace')} className="hover:text-emerald-400 transition-colors">
                  Verified Produce Marketplace
                </button>
              </li>
            </ul>
          </div>

          {/* Regulatory Standards & Contacts */}
          <div>
            <h4 className="text-white font-semibold text-sm uppercase tracking-wider mb-4">
              Quality Framework
            </h4>
            <ul className="space-y-2 text-sm text-stone-400">
              <li className="flex items-start gap-2">
                <FileText className="w-4 h-4 text-emerald-500 mt-0.5 shrink-0" />
                <span>AGMARK Wheat Grading Rules (Schedule I)</span>
              </li>
              <li className="flex items-start gap-2">
                <FileText className="w-4 h-4 text-emerald-500 mt-0.5 shrink-0" />
                <span>e-NAM & AGMARKNET Price Feeds</span>
              </li>
              <li className="flex items-start gap-2">
                <FileText className="w-4 h-4 text-emerald-500 mt-0.5 shrink-0" />
                <span>National Agricultural Market Portal</span>
              </li>
            </ul>
          </div>
        </div>

        {/* Essential Statutory AI Disclaimer */}
        <div className="bg-stone-800/80 rounded-2xl p-5 border border-stone-700 mb-8 flex items-start gap-3.5">
          <ShieldAlert className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
          <div className="text-xs text-stone-400 leading-relaxed">
            <span className="font-semibold text-amber-300 block mb-0.5">Statutory Agricultural Intelligence Disclaimer:</span>
            GrainSaksham AI provides preliminary image-based grain quality intelligence designed to assist Indian farmers during price negotiations.
            Assessments are computer-vision estimates of visible exterior characteristics (broken kernels, discoloration, foreign matter) and do not 
            supersede statutory laboratory assaying certificates issued by government-notified laboratories under the Agricultural Produce (Grading and Marking) Act, 1937 
            or FSSAI regulations. Invisible parameters such as moisture and chemical residues require certified physical meters and laboratory assaying.
          </div>
        </div>

        {/* Copyright */}
        <div className="pt-6 border-t border-stone-800 flex flex-col sm:flex-row items-center justify-between text-xs text-stone-500 gap-4">
          <p>© 2026 GrainSaksham AI — Built for AI Hackathon 2026: AI in Agriculture & Rural Development.</p>
          <div className="flex items-center gap-6">
            <span>Privacy Guard & Data Provenance</span>
            <span>AGMARK Compliance Standards</span>
            <span>Version 1.4.0</span>
          </div>
        </div>
      </div>
    </footer>
  );
};
