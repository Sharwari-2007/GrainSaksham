import React, { useState } from 'react';
import { 
  ShieldCheck, 
  Users, 
  Sliders, 
  Save 
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export const AdminDashboardView: React.FC = () => {
  const { currentUser, isAdmin } = useAuth();
  
  // State for standards configuration
  const [grade1BrokenMax, setGrade1BrokenMax] = useState(2.0);
  const [grade1ForeignMax, setGrade1ForeignMax] = useState(1.0);
  const [grade2BrokenMax, setGrade2BrokenMax] = useState(4.0);
  const [grade2ForeignMax, setGrade2ForeignMax] = useState(1.5);
  const [savedSuccess, setSavedSuccess] = useState(false);

  // Security check: restrict admin dashboard
  if (!isAdmin) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-20 text-center space-y-4">
        <ShieldCheck className="w-16 h-16 text-amber-500 mx-auto" />
        <h2 className="text-2xl font-black text-stone-900 font-serif">Administrative Authorization Required</h2>
        <p className="text-stone-600 text-sm">
          This governance workspace is restricted to authorized Agricultural Quality Officers and system administrators.
        </p>
        <p className="text-xs text-stone-400">
          Tip: You can switch to the Dr. Anjali Sharma demo administrator profile in the top-right header menu.
        </p>
      </div>
    );
  }

  const handleSaveStandards = (e: React.FormEvent) => {
    e.preventDefault();
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 2500);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-10 animate-fadeIn">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-6 border-b border-stone-200">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-100 text-amber-900 text-xs font-bold border border-amber-300">
            <ShieldCheck className="w-3.5 h-3.5 text-amber-700" />
            <span>Administrator & Quality Governance Console</span>
          </div>
          <h1 className="text-3xl font-black text-stone-900 font-serif tracking-tight mt-1">
            Agricultural Quality Governance
          </h1>
          <p className="text-stone-500 text-xs mt-0.5">
            Logged in as {currentUser.displayName} • {currentUser.designation}
          </p>
        </div>

        <div className="flex items-center gap-3">
          <span className="text-xs font-semibold px-3 py-1.5 rounded-xl bg-emerald-50 text-emerald-800 border border-emerald-300 flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span>OpenCV Inference Engine Online</span>
          </span>
        </div>
      </div>

      {/* Governance Overview Metrics */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6">
        <div className="bg-white rounded-2xl p-5 shadow-soft-sm border border-stone-200">
          <span className="text-[11px] font-bold text-stone-500 uppercase tracking-wider block">Registered Users</span>
          <span className="text-3xl font-black text-stone-900 mt-1 block">3</span>
          <span className="text-[11px] text-stone-400 mt-1 block">1 Farmer, 1 Buyer, 1 Admin</span>
        </div>

        <div className="bg-white rounded-2xl p-5 shadow-soft-sm border border-stone-200">
          <span className="text-[11px] font-bold text-stone-500 uppercase tracking-wider block">Avg Model Confidence</span>
          <span className="text-3xl font-black text-emerald-700 mt-1 block">94.2%</span>
          <span className="text-[11px] text-emerald-600 font-medium mt-1 block">High Segmentation Fidelity</span>
        </div>

        <div className="bg-white rounded-2xl p-5 shadow-soft-sm border border-stone-200">
          <span className="text-[11px] font-bold text-stone-500 uppercase tracking-wider block">Avg Inference Latency</span>
          <span className="text-3xl font-black text-agri-800 mt-1 block">185 ms</span>
          <span className="text-[11px] text-stone-400 mt-1 block">FastAPI Local Daemon</span>
        </div>

        <div className="bg-white rounded-2xl p-5 shadow-soft-sm border border-stone-200">
          <span className="text-[11px] font-bold text-stone-500 uppercase tracking-wider block">Active Grade Disputes</span>
          <span className="text-3xl font-black text-amber-700 mt-1 block">1</span>
          <span className="text-[11px] text-amber-600 font-medium mt-1 block">Under Joint Mandi Review</span>
        </div>
      </div>

      {/* ----------------- AGMARK QUALITY STANDARDS TUNING ----------------- */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 shadow-soft-md border border-stone-200 space-y-6">
        <div className="flex items-center justify-between pb-4 border-b border-stone-100">
          <div>
            <h3 className="font-extrabold text-stone-900 text-lg font-serif">
              AGMARK Grading Tolerance Configuration
            </h3>
            <p className="text-stone-500 text-xs">
              Calibrate threshold tolerances based on regional Mandi Board gazette notifications
            </p>
          </div>
          <Sliders className="w-5 h-5 text-stone-400" />
        </div>

        <form onSubmit={handleSaveStandards} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            
            {/* Grade I Limits */}
            <div className="p-5 rounded-2xl bg-emerald-50/60 border border-emerald-200 space-y-4">
              <span className="font-extrabold text-xs text-emerald-900 uppercase tracking-wider block">
                Grade I (Premium Quality) Maximum Limits
              </span>
              <div className="grid grid-cols-2 gap-3 text-xs">
                <div>
                  <label className="block text-stone-700 font-bold mb-1">Max Broken (%)</label>
                  <input
                    type="number"
                    step="0.1"
                    value={grade1BrokenMax}
                    onChange={(e) => setGrade1BrokenMax(Number(e.target.value))}
                    className="w-full px-3 py-1.5 rounded-lg border border-emerald-300 bg-white font-bold"
                  />
                </div>
                <div>
                  <label className="block text-stone-700 font-bold mb-1">Max Foreign (%)</label>
                  <input
                    type="number"
                    step="0.1"
                    value={grade1ForeignMax}
                    onChange={(e) => setGrade1ForeignMax(Number(e.target.value))}
                    className="w-full px-3 py-1.5 rounded-lg border border-emerald-300 bg-white font-bold"
                  />
                </div>
              </div>
            </div>

            {/* Grade II Limits */}
            <div className="p-5 rounded-2xl bg-blue-50/60 border border-blue-200 space-y-4">
              <span className="font-extrabold text-xs text-blue-900 uppercase tracking-wider block">
                Grade II (Fair Average Quality — FAQ) Limits
              </span>
              <div className="grid grid-cols-2 gap-3 text-xs">
                <div>
                  <label className="block text-stone-700 font-bold mb-1">Max Broken (%)</label>
                  <input
                    type="number"
                    step="0.1"
                    value={grade2BrokenMax}
                    onChange={(e) => setGrade2BrokenMax(Number(e.target.value))}
                    className="w-full px-3 py-1.5 rounded-lg border border-blue-300 bg-white font-bold"
                  />
                </div>
                <div>
                  <label className="block text-stone-700 font-bold mb-1">Max Foreign (%)</label>
                  <input
                    type="number"
                    step="0.1"
                    value={grade2ForeignMax}
                    onChange={(e) => setGrade2ForeignMax(Number(e.target.value))}
                    className="w-full px-3 py-1.5 rounded-lg border border-blue-300 bg-white font-bold"
                  />
                </div>
              </div>
            </div>

          </div>

          <div className="flex items-center justify-between pt-2">
            <span className="text-[11px] text-stone-500">
              Changes apply instantly to incoming grain scanner inspections.
            </span>
            <button
              type="submit"
              className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-agri-800 hover:bg-agri-900 text-white font-bold text-xs shadow-soft-sm"
            >
              <Save className="w-4 h-4 text-emerald-300" />
              <span>{savedSuccess ? 'Tolerances Updated!' : 'Save Standard Tolerances'}</span>
            </button>
          </div>
        </form>
      </div>

      {/* ----------------- USER ACCESS & ROLES TABLE ----------------- */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 shadow-soft-md border border-stone-200 space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-stone-100">
          <div>
            <h3 className="font-extrabold text-stone-900 text-base font-serif">
              Platform Accounts & Role Assignments
            </h3>
            <p className="text-stone-500 text-xs">
              Role escalation protection: Only verified administrators can alter authorization tiers.
            </p>
          </div>
          <Users className="w-5 h-5 text-stone-400" />
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border border-stone-200 rounded-2xl overflow-hidden">
            <thead className="bg-stone-100 text-stone-700 font-bold uppercase tracking-wider border-b border-stone-200">
              <tr>
                <th className="px-4 py-3">User</th>
                <th className="px-4 py-3">Email</th>
                <th className="px-4 py-3">Role Tier</th>
                <th className="px-4 py-3">Jurisdiction / Location</th>
                <th className="px-4 py-3">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-200">
              <tr>
                <td className="px-4 py-3 font-bold text-stone-900">Ramesh Kumar</td>
                <td className="px-4 py-3 text-stone-600">ramesh.farmer@grainsaksham.ai</td>
                <td className="px-4 py-3">
                  <span className="bg-emerald-100 text-emerald-900 font-bold px-2 py-0.5 rounded text-[10px]">Farmer</span>
                </td>
                <td className="px-4 py-3 text-stone-600">Samrala, Ludhiana, Punjab</td>
                <td className="px-4 py-3 text-emerald-700 font-semibold">Active</td>
              </tr>
              <tr>
                <td className="px-4 py-3 font-bold text-stone-900">Sunil Agrotech Mills</td>
                <td className="px-4 py-3 text-stone-600">procurement@sunilagrotech.com</td>
                <td className="px-4 py-3">
                  <span className="bg-blue-100 text-blue-900 font-bold px-2 py-0.5 rounded text-[10px]">Buyer / Trader</span>
                </td>
                <td className="px-4 py-3 text-stone-600">Khanna Mandi, Punjab</td>
                <td className="px-4 py-3 text-emerald-700 font-semibold">Licensed APMC</td>
              </tr>
              <tr>
                <td className="px-4 py-3 font-bold text-stone-900">Dr. Anjali Sharma</td>
                <td className="px-4 py-3 text-stone-600">anjali.sharma@agri.gov.in</td>
                <td className="px-4 py-3">
                  <span className="bg-amber-100 text-amber-900 font-bold px-2 py-0.5 rounded text-[10px]">Administrator</span>
                </td>
                <td className="px-4 py-3 text-stone-600">Regional Marketing Board</td>
                <td className="px-4 py-3 text-emerald-700 font-semibold">Authorized Inspector</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
};
