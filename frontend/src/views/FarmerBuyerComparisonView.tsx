import React, { useState, useEffect } from 'react';
import { 
  Scale, 
  CheckCircle2, 
  AlertTriangle, 
  Clock, 
  MessageSquare, 
  FileCheck, 
  ShieldAlert, 
  Plus, 
  RefreshCw 
} from 'lucide-react';
import { api } from '../api';
import { GradeDispute } from '../types';
import { useAuth } from '../context/AuthContext';
import { useTranslation } from '../context/LanguageContext';

export const FarmerBuyerComparisonView: React.FC = () => {
  const { t } = useTranslation();
  const { currentUser, isFarmer, isBuyer, isAdmin } = useAuth();
  
  const [disputes, setDisputes] = useState<GradeDispute[]>([]);
  const [activeDispute, setActiveDispute] = useState<GradeDispute | null>(null);
  const [loading, setLoading] = useState(true);
  
  // New comment input
  const [newComment, setNewComment] = useState('');
  const [targetStatus, setTargetStatus] = useState<'UNDER_REVIEW' | 'REINSPECTION_REQUESTED' | 'RESOLVED'>('UNDER_REVIEW');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetchDisputes();
  }, []);

  const fetchDisputes = async () => {
    try {
      setLoading(true);
      const data = await api.getDisputes();
      setDisputes(data);
      if (data.length > 0) {
        setActiveDispute(data[0]);
      }
    } catch (err) {
      console.error('Error fetching disputes:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateStatus = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeDispute || !newComment.trim()) return;

    try {
      setSubmitting(true);
      const updated = await api.updateDisputeStatus(activeDispute.disputeId, {
        status: targetStatus,
        actor: currentUser.uid,
        action: `Status updated to ${targetStatus}`,
        comment: newComment.trim()
      });
      setActiveDispute(updated);
      setNewComment('');
      fetchDisputes();
    } catch (err) {
      console.error('Error updating dispute status:', err);
    } finally {
      setSubmitting(false);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'SUBMITTED':
        return <span className="bg-stone-100 text-stone-800 text-xs font-bold px-2.5 py-1 rounded-full border border-stone-300">Submitted</span>;
      case 'UNDER_REVIEW':
        return <span className="bg-blue-100 text-blue-900 text-xs font-bold px-2.5 py-1 rounded-full border border-blue-300">Under Review</span>;
      case 'REINSPECTION_REQUESTED':
        return <span className="bg-amber-100 text-amber-900 text-xs font-bold px-2.5 py-1 rounded-full border border-amber-300">Reinspection Requested</span>;
      case 'RESOLVED':
        return <span className="bg-emerald-100 text-emerald-900 text-xs font-bold px-2.5 py-1 rounded-full border border-emerald-300">Resolved</span>;
      default:
        return <span className="bg-stone-100 text-stone-700 text-xs font-bold px-2.5 py-1 rounded-full">{status}</span>;
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-10">
      
      {/* Header */}
      <div className="text-center max-w-3xl mx-auto space-y-3">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-100 text-amber-900 text-xs font-bold border border-amber-300">
          <Scale className="w-3.5 h-3.5 text-amber-700" />
          <span>Objective Dispute Resolution Protocol</span>
        </div>
        <h1 className="text-3xl sm:text-4xl font-black text-stone-900 font-serif tracking-tight">
          {t.disputes.title}
        </h1>
        <p className="text-stone-600 text-sm sm:text-base leading-relaxed">
          {t.disputes.subtitle}
        </p>
      </div>

      {/* Main Dispute Interface */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* Left Column: Dispute Lots Selector */}
        <div className="lg:col-span-4 bg-white rounded-3xl p-6 shadow-soft-md border border-stone-200 space-y-4">
          <h2 className="font-bold text-stone-900 text-sm uppercase tracking-wider">
            Active Quality Dispute Cases
          </h2>

          {loading ? (
            <p className="text-stone-500 text-xs py-4">Loading dispute cases...</p>
          ) : disputes.length === 0 ? (
            <p className="text-stone-500 text-xs py-4">No dispute records filed yet.</p>
          ) : (
            <div className="space-y-3">
              {disputes.map((d) => (
                <div
                  key={d.disputeId}
                  onClick={() => setActiveDispute(d)}
                  className={`p-4 rounded-2xl border text-left cursor-pointer transition-all ${
                    activeDispute?.disputeId === d.disputeId
                      ? 'border-agri-600 bg-agri-50/70 shadow-sm'
                      : 'border-stone-200 hover:border-stone-300 bg-stone-50'
                  }`}
                >
                  <div className="flex items-center justify-between gap-2 mb-1">
                    <span className="font-extrabold text-sm text-stone-900">{d.lotIdentifier}</span>
                    {getStatusBadge(d.status)}
                  </div>
                  <div className="text-xs text-stone-600 font-medium">
                    {d.farmerName} vs {d.buyerName}
                  </div>
                  <div className="text-[11px] text-stone-400 mt-1">
                    {d.mandi} • {d.crop}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Right Column: Comparison Card & Resolution Workflow */}
        {activeDispute ? (
          <div className="lg:col-span-8 bg-white rounded-3xl p-6 sm:p-8 shadow-soft-xl border border-stone-200 space-y-8">
            
            {/* Header of Active Case */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-6 border-b border-stone-200">
              <div>
                <span className="text-xs font-mono font-bold text-stone-500">Case ID: {activeDispute.disputeId}</span>
                <h3 className="text-2xl font-black text-stone-900 font-serif mt-0.5">
                  Lot: {activeDispute.lotIdentifier} ({activeDispute.crop})
                </h3>
                <span className="text-xs text-stone-500 block mt-0.5">{activeDispute.mandi}</span>
              </div>
              <div>
                {getStatusBadge(activeDispute.status)}
              </div>
            </div>

            {/* Structured 4-Step Status Workflow Indicator */}
            <div>
              <div className="text-xs font-bold text-stone-500 uppercase tracking-wider mb-3">
                {t.disputes.statusWorkflow}
              </div>
              <div className="grid grid-cols-4 gap-2 text-center text-xs">
                <div className={`p-2.5 rounded-xl border ${
                  activeDispute.status === 'SUBMITTED' || activeDispute.status === 'UNDER_REVIEW' || activeDispute.status === 'REINSPECTION_REQUESTED' || activeDispute.status === 'RESOLVED'
                    ? 'bg-emerald-50 border-emerald-400 text-emerald-900 font-bold'
                    : 'bg-stone-50 border-stone-200 text-stone-400'
                }`}>
                  1. {t.disputes.statusSubmitted}
                </div>
                <div className={`p-2.5 rounded-xl border ${
                  activeDispute.status === 'UNDER_REVIEW' || activeDispute.status === 'REINSPECTION_REQUESTED' || activeDispute.status === 'RESOLVED'
                    ? 'bg-emerald-50 border-emerald-400 text-emerald-900 font-bold'
                    : 'bg-stone-50 border-stone-200 text-stone-400'
                }`}>
                  2. {t.disputes.statusUnderReview}
                </div>
                <div className={`p-2.5 rounded-xl border ${
                  activeDispute.status === 'REINSPECTION_REQUESTED' || activeDispute.status === 'RESOLVED'
                    ? 'bg-amber-50 border-amber-400 text-amber-900 font-bold'
                    : 'bg-stone-50 border-stone-200 text-stone-400'
                }`}>
                  3. {t.disputes.statusReinspection}
                </div>
                <div className={`p-2.5 rounded-xl border ${
                  activeDispute.status === 'RESOLVED'
                    ? 'bg-emerald-100 border-emerald-500 text-emerald-950 font-extrabold'
                    : 'bg-stone-50 border-stone-200 text-stone-400'
                }`}>
                  4. {t.disputes.statusResolved}
                </div>
              </div>
            </div>

            {/* 2-Party Side-by-Side Comparison */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              
              {/* Farmer Assessment */}
              <div className="p-6 rounded-2xl bg-emerald-50/60 border border-emerald-200 space-y-4">
                <div className="flex items-center justify-between border-b border-emerald-200 pb-3">
                  <div>
                    <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-800 block">Farmer Assessment</span>
                    <span className="font-extrabold text-stone-900 text-base">{activeDispute.farmerName}</span>
                  </div>
                  <span className="text-xs font-mono font-bold text-emerald-700 bg-white px-2 py-1 rounded border border-emerald-300">
                    {activeDispute.farmerReportId}
                  </span>
                </div>

                <div className="space-y-2 text-xs">
                  <div className="flex justify-between py-1 border-b border-emerald-100">
                    <span className="text-stone-600">Assigned Grade:</span>
                    <span className="font-bold text-emerald-800">{activeDispute.farmerMeasurements.grade}</span>
                  </div>
                  <div className="flex justify-between py-1 border-b border-emerald-100">
                    <span className="text-stone-600">Sound Grain:</span>
                    <span className="font-bold text-emerald-800">{activeDispute.farmerMeasurements.soundPct}%</span>
                  </div>
                  <div className="flex justify-between py-1 border-b border-emerald-100">
                    <span className="text-stone-600">Broken Kernels:</span>
                    <span className="font-bold text-stone-800">{activeDispute.farmerMeasurements.brokenPct}%</span>
                  </div>
                  <div className="flex justify-between py-1">
                    <span className="text-stone-600">Foreign Matter:</span>
                    <span className="font-bold text-stone-800">{activeDispute.farmerMeasurements.foreignMatterPct}%</span>
                  </div>
                </div>
              </div>

              {/* Buyer Assessment */}
              <div className="p-6 rounded-2xl bg-amber-50/60 border border-amber-200 space-y-4">
                <div className="flex items-center justify-between border-b border-amber-200 pb-3">
                  <div>
                    <span className="text-[10px] font-bold uppercase tracking-wider text-amber-800 block">Buyer Assessment</span>
                    <span className="font-extrabold text-stone-900 text-base">{activeDispute.buyerName}</span>
                  </div>
                  <span className="text-xs font-mono font-bold text-amber-700 bg-white px-2 py-1 rounded border border-amber-300">
                    {activeDispute.buyerReportId}
                  </span>
                </div>

                <div className="space-y-2 text-xs">
                  <div className="flex justify-between py-1 border-b border-amber-100">
                    <span className="text-stone-600">Buyer Claim:</span>
                    <span className="font-bold text-amber-900">{activeDispute.buyerMeasurements.grade}</span>
                  </div>
                  <div className="flex justify-between py-1 border-b border-amber-100">
                    <span className="text-stone-600">Sound Grain:</span>
                    <span className="font-bold text-stone-800">{activeDispute.buyerMeasurements.soundPct}%</span>
                  </div>
                  <div className="flex justify-between py-1 border-b border-amber-100">
                    <span className="text-stone-600">Broken Kernels:</span>
                    <span className="font-bold text-amber-800">{activeDispute.buyerMeasurements.brokenPct}%</span>
                  </div>
                  <div className="flex justify-between py-1">
                    <span className="text-stone-600">Foreign Matter:</span>
                    <span className="font-bold text-amber-800">{activeDispute.buyerMeasurements.foreignMatterPct}%</span>
                  </div>
                </div>
              </div>

            </div>

            {/* Quality Discrepancy Delta Highlight */}
            <div className="p-4 rounded-xl bg-stone-50 border border-stone-200 flex items-start gap-3 text-xs text-stone-700 leading-relaxed">
              <Scale className="w-5 h-5 text-agri-700 shrink-0 mt-0.5" />
              <div>
                <span className="font-bold text-stone-900 block mb-0.5">Discrepancy Delta Analysis:</span>
                There is a <strong>{(activeDispute.buyerMeasurements.brokenPct - activeDispute.farmerMeasurements.brokenPct).toFixed(1)}% variance</strong> in broken kernel assessment. 
                The farmer's digital passport demonstrates Grade II conformance (broken &lt;4.0%), while the buyer's manual scoop claimed Grade III. 
                Joint APMC physical lot sampling is recommended.
              </div>
            </div>

            {/* Resolution Audit Trail */}
            <div className="space-y-3">
              <h4 className="font-bold text-xs uppercase tracking-wider text-stone-500">
                {t.disputes.auditTrail}
              </h4>
              <div className="space-y-3">
                {activeDispute.history.map((h, i) => (
                  <div key={i} className="p-3.5 rounded-xl bg-stone-50 border border-stone-200 text-xs space-y-1">
                    <div className="flex items-center justify-between text-stone-500 text-[11px]">
                      <span className="font-bold text-stone-800">{h.action}</span>
                      <span>{new Date(h.timestamp).toLocaleString()}</span>
                    </div>
                    <p className="text-stone-700">{h.comment}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Add Comment & Update Status Form */}
            <form onSubmit={handleUpdateStatus} className="p-5 rounded-2xl bg-stone-100/70 border border-stone-200 space-y-4">
              <h4 className="font-bold text-xs uppercase tracking-wider text-stone-800">
                {t.disputes.addComment}
              </h4>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-stone-600 mb-1">Update Dispute Status</label>
                  <select
                    value={targetStatus}
                    onChange={(e: any) => setTargetStatus(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-stone-300 text-xs font-semibold bg-white"
                  >
                    <option value="UNDER_REVIEW">Under Review (APMC Inspector Assigned)</option>
                    <option value="REINSPECTION_REQUESTED">Request Joint Digital Reinspection</option>
                    <option value="RESOLVED">Mark as Resolved (Agreed Mandi Price)</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-stone-600 mb-1">Your Role Identifier</label>
                  <input
                    type="text"
                    disabled
                    value={`${currentUser.displayName} (${currentUser.role})`}
                    className="w-full px-3 py-2 rounded-xl border border-stone-300 text-xs bg-stone-50 text-stone-500"
                  />
                </div>
              </div>

              <div>
                <textarea
                  rows={2}
                  value={newComment}
                  onChange={(e) => setNewComment(e.target.value)}
                  placeholder="Enter objective assessment notes, agreed sample size, or dockage adjustment details..."
                  className="w-full px-3 py-2 rounded-xl border border-stone-300 text-xs bg-white focus:outline-none focus:ring-2 focus:ring-agri-600"
                  required
                />
              </div>

              <button
                type="submit"
                disabled={submitting || !newComment.trim()}
                className="px-6 py-2.5 rounded-xl bg-agri-800 hover:bg-agri-900 disabled:bg-stone-300 text-white font-bold text-xs shadow-soft-sm"
              >
                {submitting ? 'Submitting...' : 'Post Dispute Response'}
              </button>
            </form>

          </div>
        ) : null}

      </div>

    </div>
  );
};
