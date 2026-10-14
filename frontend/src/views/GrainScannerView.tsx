import React, { useState, useRef } from 'react';
import { 
  Scan, 
  Upload, 
  Camera, 
  CheckCircle2, 
  AlertTriangle, 
  AlertOctagon,
  FileText, 
  Sparkles, 
  RefreshCw, 
  ArrowRight, 
  Info, 
  Eye, 
  HelpCircle,
  FileCheck,
  TrendingUp,
  X
} from 'lucide-react';
import { useTranslation } from '../context/LanguageContext';
import { useAuth } from '../context/AuthContext';
import { api } from '../api';
import { InspectionRecord } from '../types';
import { CameraModal } from '../components/CameraModal';
import { SpeechReader } from '../components/SpeechReader';

interface GrainScannerViewProps {
  onInspectionComplete: (record: InspectionRecord) => void;
  onNavigate: (view: string) => void;
}

export const GrainScannerView: React.FC<GrainScannerViewProps> = ({ 
  onInspectionComplete, 
  onNavigate 
}) => {
  const { t } = useTranslation();
  const { currentUser } = useAuth();

  // State
  const [selectedCrop, setSelectedCrop] = useState<string>('wheat');
  const [variety, setVariety] = useState<string>('HD-2967 (Sharbati Hybrid)');
  const [lotIdentifier, setLotIdentifier] = useState<string>(`LOT-PB-SAM-${Math.floor(10 + Math.random() * 90)}`);
  const [mandiLocation, setMandiLocation] = useState<string>('Khanna Mandi, Ludhiana, Punjab');
  const [moistureReading, setMoistureReading] = useState<string>('11.8');
  
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [cameraModalOpen, setCameraModalOpen] = useState(false);
  
  // Progress & Analysis
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisStep, setAnalysisStep] = useState<string>('');
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [resultRecord, setResultRecord] = useState<InspectionRecord | null>(null);
  
  const [activeImageTab, setActiveImageTab] = useState<'annotated' | 'original'>('annotated');
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Load Pre-captured demo sample
  const handleLoadSample = async () => {
    try {
      setErrorMsg(null);
      const response = await fetch('/sample_wheat.jpg');
      const blob = await response.blob();
      const file = new File([blob], 'sample_wheat.jpg', { type: 'image/jpeg' });
      setSelectedFile(file);
      setPreviewUrl(URL.createObjectURL(file));
      setResultRecord(null);
    } catch (err) {
      console.error('Error loading sample image:', err);
      setErrorMsg('Could not load sample grain photo. Please upload your own image.');
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      if (!file.type.startsWith('image/')) {
        setErrorMsg('Please select a valid image file (JPG, PNG, WebP).');
        return;
      }
      setSelectedFile(file);
      setPreviewUrl(URL.createObjectURL(file));
      setErrorMsg(null);
      setResultRecord(null);
    }
  };

  const handleCameraCapture = (file: File, preview: string) => {
    setSelectedFile(file);
    setPreviewUrl(preview);
    setErrorMsg(null);
    setResultRecord(null);
  };

  const handleClearImage = () => {
    setSelectedFile(null);
    setPreviewUrl(null);
    setResultRecord(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleRunAnalysis = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedFile) {
      setErrorMsg('Please upload or capture a grain sample image first.');
      return;
    }

    try {
      setIsAnalyzing(true);
      setErrorMsg(null);

      // Multi-step progress animation for user feedback
      setAnalysisStep(t.scanner.step1);
      await new Promise(r => setTimeout(r, 600));

      setAnalysisStep(t.scanner.step2);
      await new Promise(r => setTimeout(r, 700));

      setAnalysisStep(t.scanner.step3);
      await new Promise(r => setTimeout(r, 700));

      setAnalysisStep(t.scanner.step4);

      const formData = new FormData();
      formData.append('file', selectedFile);
      formData.append('crop_type', selectedCrop);
      formData.append('variety', variety);
      formData.append('lot_identifier', lotIdentifier);
      formData.append('mandi_location', mandiLocation);
      if (moistureReading) {
        formData.append('user_moisture', moistureReading);
      }
      formData.append('owner_id', currentUser.uid);
      formData.append('owner_name', currentUser.displayName);

      const record = await api.analyzeGrain(formData);
      record.originalImage = previewUrl || undefined;
      setResultRecord(record);
      onInspectionComplete(record);
    } catch (err: any) {
      console.error('Inspection analysis error:', err);
      setErrorMsg(err.message || 'Inspection analysis failed. Please verify lighting and try again.');
    } finally {
      setIsAnalyzing(false);
      setAnalysisStep('');
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-10">
      
      {/* Header */}
      <div className="text-center max-w-3xl mx-auto space-y-3">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-100 text-emerald-900 text-xs font-bold border border-emerald-300">
          <Scan className="w-3.5 h-3.5 text-emerald-700" />
          <span>Computer Vision Grain Inspection</span>
        </div>
        <h1 className="text-3xl sm:text-4xl font-black text-stone-900 font-serif tracking-tight">
          {t.scanner.title}
        </h1>
        <p className="text-stone-600 text-sm sm:text-base leading-relaxed">
          {t.scanner.subtitle}
        </p>
      </div>

      {/* Main Scanner Card & Guidance */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* Left Column: Upload & Configuration Form */}
        <div className="lg:col-span-7 bg-white rounded-3xl p-6 sm:p-8 shadow-soft-md border border-stone-200 space-y-6">
          <form onSubmit={handleRunAnalysis} className="space-y-6">
            
            {/* Crop Selector */}
            <div>
              <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider mb-2">
                {t.scanner.selectCrop}
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <button
                  type="button"
                  onClick={() => setSelectedCrop('wheat')}
                  className={`p-3.5 rounded-xl border text-left text-xs font-bold transition-all ${
                    selectedCrop === 'wheat'
                      ? 'border-agri-600 bg-agri-50/80 text-agri-950 ring-2 ring-agri-600'
                      : 'border-stone-200 hover:border-stone-300 text-stone-700 bg-stone-50'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-extrabold text-sm">🌾 Wheat</span>
                    <span className="bg-emerald-600 text-white text-[9px] px-1.5 py-0.5 rounded font-mono">Validated</span>
                  </div>
                  <span className="text-[11px] text-stone-500 font-normal">AGMARK Schedule I</span>
                </button>

                <button
                  type="button"
                  onClick={() => setSelectedCrop('rice')}
                  className={`p-3.5 rounded-xl border text-left text-xs font-bold transition-all ${
                    selectedCrop === 'rice'
                      ? 'border-agri-600 bg-agri-50/80 text-agri-950 ring-2 ring-agri-600'
                      : 'border-stone-200 hover:border-stone-300 text-stone-700 bg-stone-50 opacity-80'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-extrabold text-sm">🍚 Paddy</span>
                    <span className="bg-amber-600 text-white text-[9px] px-1.5 py-0.5 rounded font-mono">Beta</span>
                  </div>
                  <span className="text-[11px] text-stone-500 font-normal">Basmati / Non-Basmati</span>
                </button>

                <button
                  type="button"
                  onClick={() => setSelectedCrop('maize')}
                  className={`p-3.5 rounded-xl border text-left text-xs font-bold transition-all ${
                    selectedCrop === 'maize'
                      ? 'border-agri-600 bg-agri-50/80 text-agri-950 ring-2 ring-agri-600'
                      : 'border-stone-200 hover:border-stone-300 text-stone-700 bg-stone-50 opacity-80'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-extrabold text-sm">🌽 Maize</span>
                    <span className="bg-amber-600 text-white text-[9px] px-1.5 py-0.5 rounded font-mono">Beta</span>
                  </div>
                  <span className="text-[11px] text-stone-500 font-normal">Yellow Feed Grain</span>
                </button>
              </div>
            </div>

            {/* Image Drop Zone & Camera Buttons */}
            <div>
              <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider mb-2">
                {t.scanner.uploadBoxTitle}
              </label>

              {previewUrl ? (
                <div className="relative rounded-2xl overflow-hidden border-2 border-stone-200 bg-stone-900 aspect-16/10 flex items-center justify-center">
                  <img
                    src={previewUrl}
                    alt="Sample Preview"
                    className="w-full h-full object-contain"
                  />
                  {/* Action buttons on top */}
                  <div className="absolute top-3 right-3 flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => setCameraModalOpen(true)}
                      className="bg-stone-900/80 hover:bg-stone-900 text-white text-xs font-semibold px-3 py-1.5 rounded-lg backdrop-blur-sm flex items-center gap-1.5"
                    >
                      <Camera className="w-3.5 h-3.5" />
                      <span>Retake</span>
                    </button>
                    <button
                      type="button"
                      onClick={handleClearImage}
                      className="bg-red-600/90 hover:bg-red-600 text-white p-1.5 rounded-lg shadow"
                      title="Remove image"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                  <div className="absolute bottom-3 left-3 bg-black/70 text-white text-[11px] px-2.5 py-1 rounded-md backdrop-blur-sm">
                    {selectedFile?.name || 'Grain Sample Image'} (Ready for AI Scan)
                  </div>
                </div>
              ) : (
                <div
                  onClick={() => fileInputRef.current?.click()}
                  className="rounded-2xl border-2 border-dashed border-stone-300 hover:border-agri-500 bg-stone-50/60 hover:bg-agri-50/40 p-8 text-center cursor-pointer transition-all duration-150 flex flex-col items-center justify-center gap-3"
                >
                  <div className="w-14 h-14 rounded-2xl bg-white shadow-soft-sm border border-stone-200 flex items-center justify-center text-agri-700">
                    <Upload className="w-7 h-7" />
                  </div>
                  <div>
                    <span className="font-bold text-stone-800 text-sm block">
                      {t.scanner.uploadBoxHint}
                    </span>
                    <span className="text-stone-500 text-xs mt-0.5 block">
                      Supports JPG, JPEG, PNG, WebP up to 12 MB
                    </span>
                  </div>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handleFileChange}
                    className="hidden"
                  />
                </div>
              )}

              {/* Auxiliary Quick Buttons: Camera & Load Pre-Captured Sample */}
              <div className="mt-3 flex flex-wrap items-center justify-between gap-3">
                <button
                  type="button"
                  onClick={() => setCameraModalOpen(true)}
                  className="inline-flex items-center gap-2 px-4 py-2 rounded-xl border border-stone-300 bg-white hover:bg-stone-50 text-stone-700 text-xs font-bold shadow-soft-sm"
                >
                  <Camera className="w-4 h-4 text-agri-700" />
                  <span>{t.scanner.useCamera}</span>
                </button>

                <button
                  type="button"
                  onClick={handleLoadSample}
                  className="inline-flex items-center gap-2 px-4 py-2 rounded-xl border border-emerald-300 bg-emerald-50 hover:bg-emerald-100 text-emerald-900 text-xs font-bold shadow-soft-sm"
                  title="Loads our verified test wheat sample image"
                >
                  <Sparkles className="w-4 h-4 text-emerald-600" />
                  <span>{t.scanner.useSample}</span>
                </button>
              </div>
            </div>

            {/* Sample Information Fields */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
              <div>
                <label className="block text-xs font-bold text-stone-700 mb-1">
                  {t.scanner.varietyLabel}
                </label>
                <input
                  type="text"
                  value={variety}
                  onChange={(e) => setVariety(e.target.value)}
                  placeholder={t.scanner.varietyPlaceholder}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-stone-300 text-sm focus:border-agri-600 bg-white"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-stone-700 mb-1">
                  {t.scanner.lotLabel}
                </label>
                <input
                  type="text"
                  value={lotIdentifier}
                  onChange={(e) => setLotIdentifier(e.target.value)}
                  placeholder={t.scanner.lotPlaceholder}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-stone-300 text-sm focus:border-agri-600 bg-white"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-stone-700 mb-1">
                  {t.scanner.mandiLabel}
                </label>
                <input
                  type="text"
                  value={mandiLocation}
                  onChange={(e) => setMandiLocation(e.target.value)}
                  placeholder={t.scanner.mandiPlaceholder}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-stone-300 text-sm focus:border-agri-600 bg-white"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-stone-700 mb-1">
                  {t.scanner.moistureLabel}
                </label>
                <input
                  type="number"
                  step="0.1"
                  min="5"
                  max="30"
                  value={moistureReading}
                  onChange={(e) => setMoistureReading(e.target.value)}
                  placeholder="e.g., 11.5"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-stone-300 text-sm focus:border-agri-600 bg-white"
                />
                <span className="text-[10px] text-stone-500 mt-0.5 block">
                  {t.scanner.moistureHint}
                </span>
              </div>
            </div>

            {/* Error Message & Non-Grain Image Detected Diagnostic Card */}
            {errorMsg && (
              <div className="p-5 rounded-2xl bg-gradient-to-r from-red-50 via-rose-50 to-orange-50 border-2 border-red-300 text-stone-800 space-y-3 shadow-soft-sm animate-fadeIn">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <div className="w-9 h-9 rounded-xl bg-red-100 flex items-center justify-center text-red-600 shrink-0 shadow-inner">
                      <AlertOctagon className="w-5 h-5" />
                    </div>
                    <div>
                      <span className="font-extrabold text-sm text-red-950 block">
                        {errorMsg.toLowerCase().includes('non-grain') || errorMsg.toLowerCase().includes('non-agricultural')
                          ? 'Non-Grain Image Rejected'
                          : 'Sample Verification Alert'}
                      </span>
                      <span className="text-[11px] text-red-700 font-semibold uppercase tracking-wider block">
                        AGMARK Computer Vision Protocol Check
                      </span>
                    </div>
                  </div>
                  <span className="bg-red-200/80 text-red-900 font-black text-[10px] px-2.5 py-1 rounded-full uppercase tracking-wider">
                    Rejected
                  </span>
                </div>

                <div className="text-xs text-stone-700 bg-white/90 rounded-xl p-3.5 border border-red-200/80 leading-relaxed space-y-1">
                  <strong className="text-red-900 block font-bold">AI Diagnostic Evaluation:</strong>
                  <p>{errorMsg}</p>
                </div>

                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-1 text-[11px] text-stone-600">
                  <span>
                    💡 <strong>Inspection Rule:</strong> Spread actual grains in a single layer on plain white paper without clutter or animals.
                  </span>
                  <button
                    type="button"
                    onClick={handleLoadSample}
                    className="inline-flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shrink-0 shadow-sm transition-all"
                  >
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>Load Real Grain Sample</span>
                  </button>
                </div>
              </div>
            )}

            {/* Submit Action */}
            <button
              type="submit"
              disabled={isAnalyzing || !selectedFile}
              className="w-full py-4 rounded-xl bg-agri-800 hover:bg-agri-900 disabled:bg-stone-300 text-white font-extrabold text-base shadow-soft-lg transition-all flex items-center justify-center gap-3"
            >
              {isAnalyzing ? (
                <>
                  <RefreshCw className="w-5 h-5 animate-spin text-emerald-300" />
                  <span>{analysisStep || t.scanner.analyzing}</span>
                </>
              ) : (
                <>
                  <Scan className="w-5 h-5 text-emerald-300" />
                  <span>{t.scanner.analyzeBtn}</span>
                </>
              )}
            </button>
          </form>
        </div>

        {/* Right Column: Capture Guidance & Protocol Checklist */}
        <div className="lg:col-span-5 space-y-6">
          <div className="bg-stone-50 rounded-3xl p-6 sm:p-7 border border-stone-200 space-y-4">
            <div className="flex items-center gap-2 text-agri-950 font-bold text-base">
              <Info className="w-5 h-5 text-agri-700" />
              <span>{t.scanner.guidanceTitle}</span>
            </div>

            <ul className="space-y-3 text-xs text-stone-700">
              <li className="flex items-start gap-2.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                <span>{t.scanner.guide1}</span>
              </li>
              <li className="flex items-start gap-2.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                <span>{t.scanner.guide2}</span>
              </li>
              <li className="flex items-start gap-2.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                <span>{t.scanner.guide3}</span>
              </li>
              <li className="flex items-start gap-2.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                <span>{t.scanner.guide4}</span>
              </li>
            </ul>

            <div className="pt-4 border-t border-stone-200/80 text-[11px] text-stone-500 leading-relaxed">
              <span className="font-semibold text-stone-700 block mb-1">Evaluation Quality Standard:</span>
              Indian Directorate of Marketing & Inspection (DMI) AGMARK Wheat Grading Rules (Schedule I).
            </div>
          </div>
        </div>

      </div>

      {/* ----------------- INSPECTION RESULTS SECTION ----------------- */}
      {resultRecord && (
        <div id="inspection-results" className="bg-white rounded-3xl p-6 sm:p-10 shadow-soft-xl border border-stone-200 space-y-8 animate-fadeIn">
          
          {/* Header of Result with Speech Reader */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-6 border-b border-stone-200">
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold uppercase tracking-wider text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                  Verified Inspection #{resultRecord.reportId}
                </span>
                <span className="text-xs text-stone-500">
                  {new Date(resultRecord.createdAt).toLocaleDateString()}
                </span>
              </div>
              <h2 className="text-2xl sm:text-3xl font-extrabold text-stone-900 mt-1 font-serif">
                {t.results.title}
              </h2>
            </div>

            {/* Accessibility Speech Synthesis Button */}
            <div className="flex items-center gap-3">
              <SpeechReader
                textToRead={`Grain inspection result for ${resultRecord.variety}. Grade assigned: ${resultRecord.assignedGrade}. Sound grain ratio: ${resultRecord.metrics.sound_grain.percentage} percent. Broken grain ratio: ${resultRecord.metrics.broken_shriveled.percentage} percent. ${resultRecord.explanation}`}
                label="Listen (बोलकर सुनें)"
              />
            </div>
          </div>

          {/* Core Grade Card & Summary */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            
            {/* Grade Badge */}
            <div className={`p-5 rounded-2xl border flex flex-col justify-between ${
              resultRecord.statusCode === 'GRADE_I'
                ? 'bg-emerald-50/80 border-emerald-300 text-emerald-950'
                : resultRecord.statusCode === 'GRADE_II'
                ? 'bg-blue-50/80 border-blue-300 text-blue-950'
                : resultRecord.statusCode === 'GRADE_III'
                ? 'bg-amber-50/80 border-amber-300 text-amber-950'
                : 'bg-red-50/80 border-red-300 text-red-950'
            }`}>
              <div>
                <span className="text-[11px] font-bold uppercase tracking-wider opacity-80 block">
                  {t.results.assignedGrade}
                </span>
                <span className="text-xl font-black mt-1 block">
                  {resultRecord.assignedGrade}
                </span>
              </div>
              <span className="text-xs font-medium opacity-90 mt-3 block">
                {resultRecord.applicableStandard}
              </span>
            </div>

            {/* Sound Grain % */}
            <div className="p-5 rounded-2xl bg-stone-50 border border-stone-200 flex flex-col justify-between">
              <div>
                <span className="text-[11px] font-bold uppercase tracking-wider text-stone-500 block">
                  {t.results.metricSound}
                </span>
                <span className="text-3xl font-black text-emerald-600 mt-1 block">
                  {resultRecord.metrics.sound_grain.percentage}%
                </span>
              </div>
              <span className="text-xs text-stone-500 mt-2 block">
                {resultRecord.metrics.sound_grain.count} of {resultRecord.totalKernels} grains
              </span>
            </div>

            {/* Broken Grain % */}
            <div className="p-5 rounded-2xl bg-stone-50 border border-stone-200 flex flex-col justify-between">
              <div>
                <span className="text-[11px] font-bold uppercase tracking-wider text-stone-500 block">
                  {t.results.metricBroken}
                </span>
                <span className="text-3xl font-black text-amber-600 mt-1 block">
                  {resultRecord.metrics.broken_shriveled.percentage}%
                </span>
              </div>
              <span className="text-xs text-stone-500 mt-2 block">
                Tolerance: &lt; 2.0% (Grade I)
              </span>
            </div>

            {/* AI Confidence & Kernels */}
            <div className="p-5 rounded-2xl bg-stone-50 border border-stone-200 flex flex-col justify-between">
              <div>
                <span className="text-[11px] font-bold uppercase tracking-wider text-stone-500 block">
                  {t.results.confidence}
                </span>
                <span className="text-3xl font-black text-agri-800 mt-1 block">
                  {Math.round(resultRecord.confidenceScore * 100)}%
                </span>
              </div>
              <span className="text-xs text-stone-500 mt-2 block">
                {resultRecord.totalKernels} kernels segmented
              </span>
            </div>

          </div>

          {/* Explanation Banner */}
          <div className="p-4 rounded-xl bg-agri-50 border border-agri-200 text-xs text-agri-950 flex items-start gap-3">
            <Info className="w-4 h-4 text-agri-700 shrink-0 mt-0.5" />
            <div className="leading-relaxed">
              <span className="font-bold block mb-0.5">Assessment Explanation:</span>
              {resultRecord.explanation}
            </div>
          </div>

          {/* Side-by-Side Images & Segmentation Legend */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-stone-900 text-base">
                Computer Vision Visual Evidence
              </h3>
              
              {/* Image Toggle on Mobile / Desktop */}
              <div className="inline-flex rounded-lg bg-stone-100 p-1 border border-stone-200">
                <button
                  type="button"
                  onClick={() => setActiveImageTab('annotated')}
                  className={`px-3 py-1 text-xs font-bold rounded-md transition-all ${
                    activeImageTab === 'annotated' ? 'bg-white shadow-sm text-agri-900' : 'text-stone-600'
                  }`}
                >
                  Annotated Detection
                </button>
                <button
                  type="button"
                  onClick={() => setActiveImageTab('original')}
                  className={`px-3 py-1 text-xs font-bold rounded-md transition-all ${
                    activeImageTab === 'original' ? 'bg-white shadow-sm text-agri-900' : 'text-stone-600'
                  }`}
                >
                  Original Photo
                </button>
              </div>
            </div>

            {/* Display Canvas / Image */}
            <div className="relative rounded-2xl overflow-hidden border border-stone-200 bg-stone-900 aspect-16/10 flex items-center justify-center">
              <img
                src={activeImageTab === 'annotated' ? (resultRecord.annotatedImage || resultRecord.originalImage) : (resultRecord.originalImage || resultRecord.annotatedImage)}
                alt="Grain Inspection Visual"
                className="w-full h-full object-contain"
              />
            </div>

            {/* Color Legend */}
            <div className="flex flex-wrap items-center justify-center gap-6 p-3 bg-stone-50 rounded-xl border border-stone-200 text-xs font-semibold text-stone-700">
              <div className="flex items-center gap-2">
                <span className="w-3.5 h-3.5 rounded-full bg-emerald-500 border border-emerald-600" />
                <span>{t.results.legendSound} ({resultRecord.metrics.sound_grain.percentage}%)</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-3.5 h-3.5 rounded-full bg-amber-500 border border-amber-600" />
                <span>{t.results.legendBroken} ({resultRecord.metrics.broken_shriveled.percentage}%)</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-3.5 h-3.5 rounded-full bg-purple-500 border border-purple-600" />
                <span>{t.results.legendDiscolored} ({resultRecord.metrics.discolored_damaged.percentage}%)</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-3.5 h-3.5 rounded-full bg-cyan-500 border border-cyan-600" />
                <span>{t.results.legendForeign} ({resultRecord.metrics.foreign_matter.percentage}%)</span>
              </div>
            </div>
          </div>

          {/* Action Navigation Buttons */}
          <div className="pt-6 border-t border-stone-200 flex flex-col sm:flex-row items-center justify-between gap-4">
            <button
              type="button"
              onClick={() => onNavigate('mandi')}
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl border-2 border-agri-700 text-agri-800 font-bold text-sm hover:bg-agri-50"
            >
              <TrendingUp className="w-4 h-4 text-agri-700" />
              <span>{t.results.comparePrices}</span>
            </button>

            <button
              type="button"
              onClick={() => onNavigate('passport')}
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-8 py-3.5 rounded-xl bg-agri-800 hover:bg-agri-900 text-white font-extrabold text-sm shadow-soft-lg"
            >
              <FileCheck className="w-5 h-5 text-emerald-300" />
              <span>{t.results.generatePassport}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>

        </div>
      )}

      {/* Camera Capture Modal */}
      <CameraModal
        isOpen={cameraModalOpen}
        onClose={() => setCameraModalOpen(false)}
        onCapture={handleCameraCapture}
      />
    </div>
  );
};
