import React, { useEffect, useState } from 'react';
import { 
  ShieldCheck, 
  AlertCircle, 
  ArrowLeft, 
  Lock
} from 'lucide-react';
import { api } from '../api';

interface PublicVerificationViewProps {
  reportId: string;
  onBack: () => void;
}

export const PublicVerificationView: React.FC<PublicVerificationViewProps> = ({ 
  reportId, 
  onBack 
}) => {
  const [data, setData] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchVerification = async () => {
      try {
        setLoading(true);
        const result = await api.getPublicVerification(reportId);
        setData(result);
      } catch (err: any) {
        setError(err.message || 'Verification record not found or report expired');
      } finally {
        setLoading(false);
      }
    };
    if (reportId) {
      fetchVerification();
    }
  }, [reportId]);

  if (loading) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-20 text-center space-y-4">
        <div className="w-12 h-12 border-4 border-agri-700 border-t-transparent rounded-full animate-spin mx-auto" />
        <p className="text-stone-600 text-sm font-semibold">Verifying Digital Quality Passport on Ledger...</p>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-16 text-center space-y-4">
        <AlertCircle className="w-14 h-14 text-red-500 mx-auto" />
        <h2 className="text-2xl font-bold text-stone-900">Certificate Not Found</h2>
        <p className="text-stone-600 text-sm">{error || 'This report identifier could not be verified on the ledger.'}</p>
        <button
          onClick={onBack}
          className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-stone-800 text-white text-xs font-bold"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Return to Application</span>
        </button>
      </div>
    );
  }

  const passport = data.passport;

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 py-10 space-y-8 animate-fadeIn">
      
      {/* Return button */}
      <div>
        <button
          onClick={onBack}
          className="inline-flex items-center gap-2 text-xs font-bold text-stone-600 hover:text-stone-900"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to GrainSaksham AI</span>
        </button>
      </div>

      {/* Verified Seal Card */}
      <div className="bg-white rounded-3xl p-8 sm:p-10 shadow-soft-xl border border-emerald-200 space-y-8">
        
        {/* Verification Status Header */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-6 border-b border-stone-200">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-emerald-100 flex items-center justify-center text-emerald-800 shrink-0">
              <ShieldCheck className="w-7 h-7" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-extrabold uppercase tracking-wider text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                  Authentic Verification Record
                </span>
                <span className="text-[11px] text-stone-400">
                  ID: {passport.reportId}
                </span>
              </div>
              <h1 className="text-2xl font-black text-stone-900 font-serif mt-0.5">
                Public Quality Verification
              </h1>
            </div>
          </div>

          <div className="text-right text-xs text-stone-500">
            <div>Verified at:</div>
            <div className="font-semibold text-stone-800">{new Date(data.verificationTimestamp).toLocaleDateString()}</div>
          </div>
        </div>

        {/* Privacy Shield Notice */}
        <div className="p-3.5 bg-stone-50 rounded-xl border border-stone-200 flex items-center gap-2.5 text-xs text-stone-600">
          <Lock className="w-4 h-4 text-stone-500 shrink-0" />
          <span>
            Privacy Protection Active: Farmer contact details and direct coordinates are redacted in public view.
          </span>
        </div>

        {/* Grain & Grade Badge */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 p-5 rounded-2xl bg-gradient-to-r from-agri-900 to-agri-950 text-white">
          <div className="sm:col-span-2">
            <span className="text-[11px] text-emerald-400 font-bold uppercase tracking-wider block">
              Produce Lot
            </span>
            <div className="text-2xl font-black font-serif mt-0.5">
              {passport.crop}: {passport.variety}
            </div>
            <div className="text-xs text-stone-300 mt-1 flex items-center gap-3">
              <span>Lot: {passport.lotIdentifier}</span>
              <span>•</span>
              <span>{passport.location}</span>
            </div>
          </div>

          <div className="sm:text-right border-t sm:border-t-0 sm:border-l border-emerald-800/80 pt-3 sm:pt-0 sm:pl-4">
            <span className="text-[11px] text-emerald-400 font-bold uppercase tracking-wider block">
              Assigned Grade
            </span>
            <div className="text-xl font-extrabold text-white mt-0.5">
              {passport.assignedGrade}
            </div>
            <div className="text-xs text-stone-300 mt-1">
              {Math.round(passport.confidence * 100)}% AI Reliability
            </div>
          </div>
        </div>

        {/* Breakdown Parameters */}
        <div className="space-y-3">
          <h3 className="font-bold text-xs uppercase tracking-wider text-stone-500">
            Verified Defect Measurements
          </h3>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div className="p-4 rounded-xl bg-stone-50 border border-stone-200">
              <span className="text-[10px] font-bold text-stone-500 block">Sound Grain</span>
              <span className="text-2xl font-black text-emerald-700 mt-1 block">{passport.soundPercentage}%</span>
            </div>
            <div className="p-4 rounded-xl bg-stone-50 border border-stone-200">
              <span className="text-[10px] font-bold text-stone-500 block">Broken Kernels</span>
              <span className="text-2xl font-black text-amber-700 mt-1 block">{passport.brokenPercentage}%</span>
            </div>
            <div className="p-4 rounded-xl bg-stone-50 border border-stone-200">
              <span className="text-[10px] font-bold text-stone-500 block">Discolored Grains</span>
              <span className="text-2xl font-black text-purple-700 mt-1 block">{passport.discoloredPercentage}%</span>
            </div>
            <div className="p-4 rounded-xl bg-stone-50 border border-stone-200">
              <span className="text-[10px] font-bold text-stone-500 block">Foreign Matter</span>
              <span className="text-2xl font-black text-cyan-700 mt-1 block">{passport.foreignMatterPercentage}%</span>
            </div>
          </div>
        </div>

        {/* Statutory Disclaimer */}
        <div className="p-4 rounded-xl bg-emerald-50/60 border border-emerald-200 text-xs text-emerald-950 leading-relaxed">
          <span className="font-bold block mb-0.5">GrainSaksham Verification Notice:</span>
          {data.disclaimer} Aligned with AGMARK Wheat Grading Rules (Schedule I). Does not replace statutory laboratory assaying certificates.
        </div>

      </div>

    </div>
  );
};
