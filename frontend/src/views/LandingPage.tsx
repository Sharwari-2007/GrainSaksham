import React from 'react';
import { 
  Scan, 
  TrendingUp, 
  Scale, 
  Lightbulb, 
  ShoppingBag, 
  ShieldCheck, 
  CheckCircle2, 
  ArrowRight, 
  QrCode, 
  FileCheck, 
  Eye, 
  Sparkles,
  Award
} from 'lucide-react';
import { useTranslation } from '../context/LanguageContext';

interface LandingPageProps {
  onNavigate: (view: string) => void;
}

export const LandingPage: React.FC<LandingPageProps> = ({ onNavigate }) => {
  const { t } = useTranslation();

  return (
    <div className="space-y-20 pb-16">
      
      {/* ----------------- HERO SECTION ----------------- */}
      <section className="relative overflow-hidden bg-gradient-to-b from-agri-50/80 via-white to-cream-50 pt-12 pb-20 border-b border-stone-200/60">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            
            {/* Left Column: Headlines & CTA */}
            <div className="lg:col-span-7 space-y-6 text-center lg:text-left">
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-emerald-100 text-emerald-900 text-xs font-bold border border-emerald-300 shadow-soft-sm">
                <Award className="w-4 h-4 text-emerald-700" />
                <span>{t.hero.badge}</span>
              </div>

              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black text-stone-900 tracking-tight leading-[1.15] font-serif">
                {t.hero.headline}
              </h1>

              <p className="text-base sm:text-lg text-stone-600 leading-relaxed max-w-2xl mx-auto lg:mx-0">
                {t.hero.subheadline}
              </p>

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4 pt-2">
                <button
                  type="button"
                  onClick={() => onNavigate('scanner')}
                  className="w-full sm:w-auto inline-flex items-center justify-center gap-3 px-8 py-4 rounded-xl bg-agri-800 hover:bg-agri-900 text-white font-bold text-base shadow-soft-lg hover:shadow-soft-xl hover:-translate-y-0.5 transition-all duration-200"
                >
                  <Scan className="w-5 h-5 text-emerald-300" />
                  <span>{t.hero.inspectBtn}</span>
                  <ArrowRight className="w-4 h-4 text-emerald-300" />
                </button>

                <button
                  type="button"
                  onClick={() => onNavigate('mandi')}
                  className="w-full sm:w-auto inline-flex items-center justify-center gap-2.5 px-7 py-4 rounded-xl bg-white hover:bg-stone-50 text-stone-800 font-bold text-base border-2 border-stone-200 hover:border-stone-300 shadow-soft-sm hover:-translate-y-0.5 transition-all duration-200"
                >
                  <TrendingUp className="w-5 h-5 text-agri-700" />
                  <span>{t.hero.marketBtn}</span>
                </button>
              </div>

              {/* 3 Key Trust Pillars */}
              <div className="grid grid-cols-3 gap-4 pt-6 border-t border-stone-200/80">
                <div className="text-left">
                  <div className="font-bold text-sm sm:text-base text-stone-900">{t.hero.stat1}</div>
                  <div className="text-xs text-stone-500">{t.hero.stat1Sub}</div>
                </div>
                <div className="text-left">
                  <div className="font-bold text-sm sm:text-base text-stone-900">{t.hero.stat2}</div>
                  <div className="text-xs text-stone-500">{t.hero.stat2Sub}</div>
                </div>
                <div className="text-left">
                  <div className="font-bold text-sm sm:text-base text-stone-900">{t.hero.stat3}</div>
                  <div className="text-xs text-stone-500">{t.hero.stat3Sub}</div>
                </div>
              </div>
            </div>

            {/* Right Column: Hero Visual with Real Grain Sample & CV Annotation Preview */}
            <div className="lg:col-span-5 relative">
              <div className="relative mx-auto max-w-md rounded-2xl bg-white p-3 shadow-soft-xl border border-stone-200/90 overflow-hidden group">
                
                {/* Image */}
                <div className="relative aspect-4/3 rounded-xl overflow-hidden bg-stone-100">
                  <img
                    src="/sample_wheat.jpg"
                    alt="Wheat Grain Quality Inspection Sample"
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  {/* Overlay scanning effect */}
                  <div className="absolute inset-0 bg-gradient-to-b from-transparent via-emerald-400/20 to-transparent pointer-events-none animate-scan-line" />
                  
                  {/* Floating AI Quality Badge */}
                  <div className="absolute top-3 left-3 bg-white/95 backdrop-blur-md px-3 py-1.5 rounded-lg shadow-md border border-emerald-200 flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-ping" />
                    <span className="text-xs font-bold text-emerald-900">AGMARK Grade I (FAQ)</span>
                  </div>

                  {/* Floating Detection Metric */}
                  <div className="absolute bottom-3 right-3 bg-stone-900/90 backdrop-blur-md text-white px-3 py-1.5 rounded-lg shadow-md text-xs font-medium flex items-center gap-2">
                    <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                    <span>Sound Grain: 96.5%</span>
                  </div>
                </div>

                {/* Sub-Card Details */}
                <div className="mt-3 p-3 bg-agri-50/80 rounded-xl border border-agri-100 flex items-center justify-between text-xs">
                  <div>
                    <span className="font-bold text-agri-950 block">Lot #LOT-PB-SAM-08</span>
                    <span className="text-stone-500 text-[11px]">HD-2967 • Khanna Mandi</span>
                  </div>
                  <button
                    onClick={() => onNavigate('scanner')}
                    className="inline-flex items-center gap-1 text-agri-700 font-bold hover:underline"
                  >
                    <span>Inspect Sample</span>
                    <ArrowRight className="w-3 h-3" />
                  </button>
                </div>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* ----------------- PROBLEM & SOLUTION ----------------- */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto mb-12">
          <h2 className="text-3xl font-extrabold text-stone-900 font-serif">
            {t.problemSolution.title}
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Problem Card */}
          <div className="bg-red-50/50 rounded-2xl p-8 border border-red-200/80 shadow-soft-sm relative overflow-hidden">
            <div className="w-12 h-12 rounded-xl bg-red-100 text-red-700 flex items-center justify-center font-bold text-xl mb-6">
              ⚠️
            </div>
            <h3 className="text-xl font-bold text-red-950 mb-3">
              {t.problemSolution.problemTitle}
            </h3>
            <p className="text-stone-700 leading-relaxed text-sm">
              {t.problemSolution.problemDesc}
            </p>
            <ul className="mt-6 space-y-2.5 text-xs text-stone-600">
              <li className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-red-500" />
                <span>Subjective visual scoop inspections without quantifiable data</span>
              </li>
              <li className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-red-500" />
                <span>Arbitrary "Karda" (dockage) cuts reducing farmer realizations by 5%–15%</span>
              </li>
              <li className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-red-500" />
                <span>Absence of a shared, verifiable digital inspection record</span>
              </li>
            </ul>
          </div>

          {/* Solution Card */}
          <div className="bg-emerald-50/60 rounded-2xl p-8 border border-emerald-200 shadow-soft-sm relative overflow-hidden">
            <div className="w-12 h-12 rounded-xl bg-emerald-100 text-emerald-800 flex items-center justify-center font-bold text-xl mb-6">
              🌱
            </div>
            <h3 className="text-xl font-bold text-emerald-950 mb-3">
              {t.problemSolution.solutionTitle}
            </h3>
            <p className="text-stone-700 leading-relaxed text-sm">
              {t.problemSolution.solutionDesc}
            </p>
            <ul className="mt-6 space-y-2.5 text-xs text-stone-600">
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>Objective computer vision defect segmentation (broken, discolored, foreign)</span>
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>Standardized AGMARK Grade I, II, III assessment with complete provenance</span>
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>Verifiable Digital Quality Passport with tamper-proof QR code</span>
              </li>
            </ul>
          </div>
        </div>
      </section>

      {/* ----------------- HOW IT WORKS (4 STEPS) ----------------- */}
      <section className="bg-stone-50 py-16 border-y border-stone-200/70">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-14">
            <h2 className="text-3xl font-extrabold text-stone-900 font-serif">
              {t.howItWorks.title}
            </h2>
            <p className="text-stone-600 text-sm mt-2">
              A transparent, 4-step digital workflow from harvest photo to fair mandi sale
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            
            {/* Step 1 */}
            <div className="bg-white rounded-2xl p-6 shadow-soft-sm border border-stone-200 flex flex-col justify-between">
              <div>
                <div className="w-12 h-12 rounded-xl bg-agri-100 text-agri-800 flex items-center justify-center mb-5 font-extrabold text-lg">
                  1
                </div>
                <h3 className="font-bold text-base text-stone-900 mb-2">
                  {t.howItWorks.step1Title}
                </h3>
                <p className="text-stone-600 text-xs leading-relaxed">
                  {t.howItWorks.step1Desc}
                </p>
              </div>
              <div className="mt-4 pt-4 border-t border-stone-100 flex items-center gap-1.5 text-xs text-agri-700 font-medium">
                <Scan className="w-3.5 h-3.5" />
                <span>Live Camera / Gallery</span>
              </div>
            </div>

            {/* Step 2 */}
            <div className="bg-white rounded-2xl p-6 shadow-soft-sm border border-stone-200 flex flex-col justify-between">
              <div>
                <div className="w-12 h-12 rounded-xl bg-agri-100 text-agri-800 flex items-center justify-center mb-5 font-extrabold text-lg">
                  2
                </div>
                <h3 className="font-bold text-base text-stone-900 mb-2">
                  {t.howItWorks.step2Title}
                </h3>
                <p className="text-stone-600 text-xs leading-relaxed">
                  {t.howItWorks.step2Desc}
                </p>
              </div>
              <div className="mt-4 pt-4 border-t border-stone-100 flex items-center gap-1.5 text-xs text-agri-700 font-medium">
                <Eye className="w-3.5 h-3.5" />
                <span>Kernel Segmentation</span>
              </div>
            </div>

            {/* Step 3 */}
            <div className="bg-white rounded-2xl p-6 shadow-soft-sm border border-stone-200 flex flex-col justify-between">
              <div>
                <div className="w-12 h-12 rounded-xl bg-agri-100 text-agri-800 flex items-center justify-center mb-5 font-extrabold text-lg">
                  3
                </div>
                <h3 className="font-bold text-base text-stone-900 mb-2">
                  {t.howItWorks.step3Title}
                </h3>
                <p className="text-stone-600 text-xs leading-relaxed">
                  {t.howItWorks.step3Desc}
                </p>
              </div>
              <div className="mt-4 pt-4 border-t border-stone-100 flex items-center gap-1.5 text-xs text-agri-700 font-medium">
                <QrCode className="w-3.5 h-3.5" />
                <span>Verifiable QR Passport</span>
              </div>
            </div>

            {/* Step 4 */}
            <div className="bg-white rounded-2xl p-6 shadow-soft-sm border border-stone-200 flex flex-col justify-between">
              <div>
                <div className="w-12 h-12 rounded-xl bg-agri-100 text-agri-800 flex items-center justify-center mb-5 font-extrabold text-lg">
                  4
                </div>
                <h3 className="font-bold text-base text-stone-900 mb-2">
                  {t.howItWorks.step4Title}
                </h3>
                <p className="text-stone-600 text-xs leading-relaxed">
                  {t.howItWorks.step4Desc}
                </p>
              </div>
              <div className="mt-4 pt-4 border-t border-stone-100 flex items-center gap-1.5 text-xs text-agri-700 font-medium">
                <TrendingUp className="w-3.5 h-3.5" />
                <span>Fair-Price Negotiations</span>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* ----------------- CORE FEATURES SHOWCASE ----------------- */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto mb-14">
          <h2 className="text-3xl font-extrabold text-stone-900 font-serif">
            Integrated Agricultural Intelligence Modules
          </h2>
          <p className="text-stone-600 text-sm mt-2">
            Every module is tailored to solve specific friction points at rural mandis
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          
          {/* Module 1: AI Grain Scanner */}
          <div 
            onClick={() => onNavigate('scanner')}
            className="group cursor-pointer bg-white rounded-2xl p-7 shadow-soft-md border border-stone-200 hover:border-agri-400 hover:shadow-soft-xl transition-all duration-200"
          >
            <div className="w-12 h-12 rounded-xl bg-agri-100 text-agri-800 flex items-center justify-center mb-5 group-hover:bg-agri-800 group-hover:text-white transition-colors">
              <Scan className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-stone-900 mb-2 group-hover:text-agri-800 transition-colors">
              AI Grain Scanner
            </h3>
            <p className="text-stone-600 text-xs leading-relaxed">
              Real computer-vision engine prioritizing wheat inspection. Evaluates broken kernels, discoloration, and foreign matter against AGMARK Schedule I.
            </p>
            <div className="mt-4 flex items-center gap-1 text-xs font-bold text-agri-700 group-hover:translate-x-1 transition-transform">
              <span>Inspect Grain Now</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </div>
          </div>

          {/* Module 2: Digital Quality Passport */}
          <div 
            onClick={() => onNavigate('history')}
            className="group cursor-pointer bg-white rounded-2xl p-7 shadow-soft-md border border-stone-200 hover:border-agri-400 hover:shadow-soft-xl transition-all duration-200"
          >
            <div className="w-12 h-12 rounded-xl bg-emerald-100 text-emerald-800 flex items-center justify-center mb-5 group-hover:bg-emerald-800 group-hover:text-white transition-colors">
              <FileCheck className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-stone-900 mb-2 group-hover:text-emerald-800 transition-colors">
              Digital Quality Passport
            </h3>
            <p className="text-stone-600 text-xs leading-relaxed">
              Export downloadable PDF quality certificates embedded with scannable QR verification for public buyer validation and tamper detection.
            </p>
            <div className="mt-4 flex items-center gap-1 text-xs font-bold text-emerald-700 group-hover:translate-x-1 transition-transform">
              <span>View Saved Passports</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </div>
          </div>

          {/* Module 3: Mandi Market Intelligence */}
          <div 
            onClick={() => onNavigate('mandi')}
            className="group cursor-pointer bg-white rounded-2xl p-7 shadow-soft-md border border-stone-200 hover:border-agri-400 hover:shadow-soft-xl transition-all duration-200"
          >
            <div className="w-12 h-12 rounded-xl bg-blue-100 text-blue-800 flex items-center justify-center mb-5 group-hover:bg-blue-800 group-hover:text-white transition-colors">
              <TrendingUp className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-stone-900 mb-2 group-hover:text-blue-800 transition-colors">
              Fair-Price Mandi Assistant
            </h3>
            <p className="text-stone-600 text-xs leading-relaxed">
              Filter official AGMARKNET and e-NAM mandi prices across states. Calculate net farmer realizations after transport and handling.
            </p>
            <div className="mt-4 flex items-center gap-1 text-xs font-bold text-blue-700 group-hover:translate-x-1 transition-transform">
              <span>Explore Mandi Prices</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </div>
          </div>

          {/* Module 4: Grade Dispute Resolution */}
          <div 
            onClick={() => onNavigate('disputes')}
            className="group cursor-pointer bg-white rounded-2xl p-7 shadow-soft-md border border-stone-200 hover:border-agri-400 hover:shadow-soft-xl transition-all duration-200"
          >
            <div className="w-12 h-12 rounded-xl bg-amber-100 text-amber-800 flex items-center justify-center mb-5 group-hover:bg-amber-800 group-hover:text-white transition-colors">
              <Scale className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-stone-900 mb-2 group-hover:text-amber-800 transition-colors">
              Farmer–Buyer Dispute Resolution
            </h3>
            <p className="text-stone-600 text-xs leading-relaxed">
              Structured 2-party comparison between farmer digital passports and buyer mandi dockage claims, with reinspection workflows and audit trails.
            </p>
            <div className="mt-4 flex items-center gap-1 text-xs font-bold text-amber-700 group-hover:translate-x-1 transition-transform">
              <span>Compare Assessments</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </div>
          </div>

          {/* Module 5: AI Quality Improvement Coach */}
          <div 
            onClick={() => onNavigate('coach')}
            className="group cursor-pointer bg-white rounded-2xl p-7 shadow-soft-md border border-stone-200 hover:border-agri-400 hover:shadow-soft-xl transition-all duration-200"
          >
            <div className="w-12 h-12 rounded-xl bg-purple-100 text-purple-800 flex items-center justify-center mb-5 group-hover:bg-purple-800 group-hover:text-white transition-colors">
              <Lightbulb className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-stone-900 mb-2 group-hover:text-purple-800 transition-colors">
              AI Quality Improvement Coach
            </h3>
            <p className="text-stone-600 text-xs leading-relaxed">
              Tailored agronomic recommendations based on inspection findings: thresher drum speed adjustments, mesh screening protocols, and safe sun drying.
            </p>
            <div className="mt-4 flex items-center gap-1 text-xs font-bold text-purple-700 group-hover:translate-x-1 transition-transform">
              <span>Open Quality Coach</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </div>
          </div>

          {/* Module 6: Verified Produce Marketplace */}
          <div 
            onClick={() => onNavigate('marketplace')}
            className="group cursor-pointer bg-white rounded-2xl p-7 shadow-soft-md border border-stone-200 hover:border-agri-400 hover:shadow-soft-xl transition-all duration-200"
          >
            <div className="w-12 h-12 rounded-xl bg-teal-100 text-teal-800 flex items-center justify-center mb-5 group-hover:bg-teal-800 group-hover:text-white transition-colors">
              <ShoppingBag className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-stone-900 mb-2 group-hover:text-teal-800 transition-colors">
              Buyer Produce Marketplace
            </h3>
            <p className="text-stone-600 text-xs leading-relaxed">
              Connect verified farmer produce listings directly to millers and bulk buyers, backed by transparent digital quality passports.
            </p>
            <div className="mt-4 flex items-center gap-1 text-xs font-bold text-teal-700 group-hover:translate-x-1 transition-transform">
              <span>Browse Produce Lots</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </div>
          </div>

        </div>
      </section>

      {/* ----------------- CALL TO ACTION BANNER ----------------- */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="rounded-3xl bg-gradient-to-r from-agri-900 via-agri-800 to-emerald-950 p-10 sm:p-14 text-white shadow-soft-xl text-center sm:text-left flex flex-col sm:flex-row items-center justify-between gap-8 border border-agri-700/50">
          <div className="space-y-3 max-w-xl">
            <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight font-serif">
              Ready to verify your grain quality?
            </h2>
            <p className="text-stone-300 text-sm leading-relaxed">
              Upload a single photograph of your harvested grain and receive an instant preliminary quality assessment aligned with AGMARK standards.
            </p>
          </div>
          <div className="shrink-0 flex flex-col sm:flex-row gap-3">
            <button
              onClick={() => onNavigate('scanner')}
              className="inline-flex items-center justify-center gap-2 px-8 py-4 rounded-xl bg-white text-agri-900 font-extrabold text-sm hover:bg-stone-100 shadow-md transition-colors"
            >
              <Scan className="w-5 h-5 text-agri-700" />
              <span>Inspect Harvest Now</span>
            </button>
          </div>
        </div>
      </section>

    </div>
  );
};
