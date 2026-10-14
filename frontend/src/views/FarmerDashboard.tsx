import React, { useState, useEffect } from 'react';
import { 
  Scan, 
  FileCheck, 
  TrendingUp, 
  ShoppingBag, 
  Scale, 
  Plus, 
  ArrowRight, 
  Calendar, 
  CheckCircle2, 
  Sparkles,
  Search,
  UserCheck
} from 'lucide-react';
import { api } from '../api';
import { InspectionRecord } from '../types';
import { useAuth } from '../context/AuthContext';
import { useTranslation } from '../context/LanguageContext';

interface FarmerDashboardProps {
  onNavigate: (view: string) => void;
  onSelectInspection: (record: InspectionRecord) => void;
}

export const FarmerDashboard: React.FC<FarmerDashboardProps> = ({ 
  onNavigate, 
  onSelectInspection 
}) => {
  const { t } = useTranslation();
  const { currentUser } = useAuth();
  const [inspections, setInspections] = useState<InspectionRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    fetchInspections();
  }, [currentUser]);

  const fetchInspections = async () => {
    try {
      setLoading(true);
      const data = await api.getInspections(currentUser.uid);
      setInspections(data);
    } catch (err) {
      console.error('Error fetching inspections:', err);
    } finally {
      setLoading(false);
    }
  };

  const filtered = inspections.filter(i => 
    i.variety.toLowerCase().includes(searchQuery.toLowerCase()) ||
    i.lotIdentifier.toLowerCase().includes(searchQuery.toLowerCase()) ||
    i.assignedGrade.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-10">
      
      {/* Welcome Banner */}
      <div className="bg-gradient-to-r from-agri-900 via-agri-800 to-emerald-950 rounded-3xl p-8 sm:p-10 text-white shadow-soft-xl border border-agri-700/60 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div className="space-y-2">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-300 text-xs font-bold border border-emerald-500/40">
            <UserCheck className="w-3.5 h-3.5" />
            <span>Farmer Operations Console</span>
          </div>
          <h1 className="text-3xl font-black font-serif tracking-tight">
            Namaste, {currentUser.displayName}!
          </h1>
          <p className="text-stone-300 text-xs sm:text-sm max-w-xl">
            {currentUser.village}, {currentUser.district}, {currentUser.state} • {currentUser.holdingAcres} Acres Holding
          </p>
        </div>

        <button
          type="button"
          onClick={() => onNavigate('scanner')}
          className="inline-flex items-center gap-2.5 px-6 py-3.5 rounded-xl bg-white text-agri-950 hover:bg-stone-100 font-extrabold text-xs shadow-md shrink-0 transition-transform hover:scale-105"
        >
          <Scan className="w-4 h-4 text-agri-700" />
          <span>Inspect New Grain</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* Metrics Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6">
        <div className="bg-white rounded-2xl p-5 shadow-soft-sm border border-stone-200">
          <span className="text-[11px] font-bold text-stone-500 uppercase tracking-wider block">Total Inspections</span>
          <span className="text-3xl font-black text-stone-900 mt-1 block">{inspections.length}</span>
          <span className="text-[11px] text-emerald-600 font-medium mt-1 block">AGMARK Evaluated</span>
        </div>

        <div className="bg-white rounded-2xl p-5 shadow-soft-sm border border-stone-200">
          <span className="text-[11px] font-bold text-stone-500 uppercase tracking-wider block">Digital Passports</span>
          <span className="text-3xl font-black text-emerald-700 mt-1 block">{inspections.length}</span>
          <span className="text-[11px] text-stone-400 mt-1 block">QR Verified on Ledger</span>
        </div>

        <div className="bg-white rounded-2xl p-5 shadow-soft-sm border border-stone-200">
          <span className="text-[11px] font-bold text-stone-500 uppercase tracking-wider block">Mandi Benchmark</span>
          <span className="text-3xl font-black text-agri-800 mt-1 block">₹2,420</span>
          <span className="text-[11px] text-stone-400 mt-1 block">Khanna Modal / Qtl</span>
        </div>

        <div className="bg-white rounded-2xl p-5 shadow-soft-sm border border-stone-200">
          <span className="text-[11px] font-bold text-stone-500 uppercase tracking-wider block">Active Enquiries</span>
          <span className="text-3xl font-black text-blue-700 mt-1 block">1</span>
          <span className="text-[11px] text-blue-600 font-medium mt-1 block">Sunil Agrotech Mills</span>
        </div>
      </div>

      {/* Quick Action Navigation Grid */}
      <div className="space-y-4">
        <h2 className="font-extrabold text-stone-900 text-lg font-serif">Quick Actions</h2>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <button
            onClick={() => onNavigate('scanner')}
            className="p-5 rounded-2xl bg-white hover:bg-agri-50/50 border border-stone-200 hover:border-agri-300 shadow-soft-sm text-left transition-all"
          >
            <Scan className="w-6 h-6 text-agri-700 mb-2" />
            <div className="font-bold text-stone-900 text-sm">Scan New Lot</div>
            <div className="text-[11px] text-stone-500">Camera / Gallery upload</div>
          </button>

          <button
            onClick={() => onNavigate('mandi')}
            className="p-5 rounded-2xl bg-white hover:bg-blue-50/50 border border-stone-200 hover:border-blue-300 shadow-soft-sm text-left transition-all"
          >
            <TrendingUp className="w-6 h-6 text-blue-700 mb-2" />
            <div className="font-bold text-stone-900 text-sm">Compare Mandi Rates</div>
            <div className="text-[11px] text-stone-500">Official AGMARKNET feeds</div>
          </button>

          <button
            onClick={() => onNavigate('disputes')}
            className="p-5 rounded-2xl bg-white hover:bg-amber-50/50 border border-stone-200 hover:border-amber-300 shadow-soft-sm text-left transition-all"
          >
            <Scale className="w-6 h-6 text-amber-700 mb-2" />
            <div className="font-bold text-stone-900 text-sm">Dispute Dockage</div>
            <div className="text-[11px] text-stone-500">Reinspection workflow</div>
          </button>

          <button
            onClick={() => onNavigate('marketplace')}
            className="p-5 rounded-2xl bg-white hover:bg-purple-50/50 border border-stone-200 hover:border-purple-300 shadow-soft-sm text-left transition-all"
          >
            <ShoppingBag className="w-6 h-6 text-purple-700 mb-2" />
            <div className="font-bold text-stone-900 text-sm">Browse Buyers</div>
            <div className="text-[11px] text-stone-500">Sell at verified rates</div>
          </button>
        </div>
      </div>

      {/* Recent Inspections Table */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 shadow-soft-md border border-stone-200 space-y-6">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <h3 className="font-extrabold text-stone-900 text-lg font-serif">Recent Grain Inspections</h3>
            <p className="text-stone-500 text-xs">History of all digital grain assessments and quality passports</p>
          </div>

          <div className="relative w-full sm:w-64">
            <Search className="w-4 h-4 text-stone-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search inspections..."
              className="w-full pl-9 pr-3 py-1.5 rounded-xl border border-stone-300 text-xs bg-white"
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border border-stone-200 rounded-2xl overflow-hidden">
            <thead className="bg-stone-100 text-stone-700 font-bold uppercase tracking-wider border-b border-stone-200">
              <tr>
                <th className="px-4 py-3.5">Report ID</th>
                <th className="px-4 py-3.5">Produce & Variety</th>
                <th className="px-4 py-3.5">Lot ID</th>
                <th className="px-4 py-3.5">Assigned Grade</th>
                <th className="px-4 py-3.5">Sound Ratio</th>
                <th className="px-4 py-3.5">Date</th>
                <th className="px-4 py-3.5">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-200">
              {loading ? (
                <tr>
                  <td colSpan={7} className="px-4 py-8 text-center text-stone-500">
                    Loading your inspections...
                  </td>
                </tr>
              ) : filtered.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-4 py-8 text-center text-stone-500">
                    No inspections found. Click "Inspect New Grain" to start.
                  </td>
                </tr>
              ) : (
                filtered.map((item) => (
                  <tr key={item.inspectionId} className="hover:bg-stone-50 transition-colors">
                    <td className="px-4 py-3.5 font-mono font-bold text-stone-900">
                      {item.reportId}
                    </td>
                    <td className="px-4 py-3.5">
                      <span className="font-bold text-stone-800 capitalize">{item.cropType}</span>
                      <span className="text-[11px] text-stone-500 block">{item.variety}</span>
                    </td>
                    <td className="px-4 py-3.5 font-mono text-stone-600">
                      {item.lotIdentifier}
                    </td>
                    <td className="px-4 py-3.5">
                      <span className={`text-[11px] font-bold px-2 py-0.5 rounded border ${
                        item.statusCode === 'GRADE_I'
                          ? 'bg-emerald-50 text-emerald-800 border-emerald-300'
                          : 'bg-blue-50 text-blue-800 border-blue-300'
                      }`}>
                        {item.assignedGrade}
                      </span>
                    </td>
                    <td className="px-4 py-3.5 font-bold text-emerald-700">
                      {item.metrics.sound_grain.percentage}%
                    </td>
                    <td className="px-4 py-3.5 text-stone-500">
                      {new Date(item.createdAt).toLocaleDateString()}
                    </td>
                    <td className="px-4 py-3.5">
                      <button
                        type="button"
                        onClick={() => {
                          onSelectInspection(item);
                          onNavigate('passport');
                        }}
                        className="inline-flex items-center gap-1 text-[11px] font-bold text-agri-700 hover:text-agri-900 bg-agri-50 px-2.5 py-1 rounded-lg border border-agri-200"
                      >
                        <FileCheck className="w-3.5 h-3.5" />
                        <span>View Passport</span>
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
};
