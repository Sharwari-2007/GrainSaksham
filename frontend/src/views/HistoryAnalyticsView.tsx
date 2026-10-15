import React, { useState, useEffect } from 'react';
import { 
  History, 
  Filter, 
  Search, 
  FileCheck, 
  WifiOff, 
  RefreshCw, 
  Trash2 
} from 'lucide-react';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer, 
  PieChart, 
  Pie, 
  Cell, 
  Legend 
} from 'recharts';
import { api, OfflineDraft } from '../api';
import { InspectionRecord } from '../types';
import { useTranslation } from '../context/LanguageContext';

interface HistoryAnalyticsViewProps {
  onSelectInspection: (record: InspectionRecord) => void;
  onNavigate: (view: string) => void;
}

export const HistoryAnalyticsView: React.FC<HistoryAnalyticsViewProps> = ({ 
  onSelectInspection, 
  onNavigate 
}) => {
  const { t } = useTranslation();
  const [inspections, setInspections] = useState<InspectionRecord[]>([]);
  const [offlineDrafts, setOfflineDrafts] = useState<OfflineDraft[]>(() => api.getOfflineDrafts());
  const [loading, setLoading] = useState(true);
  const [syncingId, setSyncingId] = useState<string | null>(null);

  // Filters
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');

  const loadData = async () => {
    try {
      const data = await api.getInspections();
      setInspections(data);
      setOfflineDrafts(api.getOfflineDrafts());
    } catch (err) {
      console.error('Failed to load inspections:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    let isMounted = true;
    const fetchInspections = async () => {
      try {
        const data = await api.getInspections();
        if (isMounted) {
          setInspections(data);
          setOfflineDrafts(api.getOfflineDrafts());
        }
      } catch (err) {
        if (isMounted) {
          console.error('Failed to load inspections:', err);
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    fetchInspections();

    return () => {
      isMounted = false;
    };
  }, []);

  const handleSyncDraft = async (draft: OfflineDraft) => {
    try {
      setSyncingId(draft.id);
      // Convert base64 to file
      const arr = draft.imageBase64.split(',');
      const mime = arr[0].match(/:(.*?);/)?.[1] || 'image/jpeg';
      const bstr = atob(arr[1]);
      let n = bstr.length;
      const u8arr = new Uint8Array(n);
      while (n--) u8arr[n] = bstr.charCodeAt(n);
      const file = new File([u8arr], draft.imageFileName || 'draft_grain.jpg', { type: mime });

      const formData = new FormData();
      formData.append('file', file);
      formData.append('crop_type', draft.cropType);
      formData.append('variety', draft.variety);
      formData.append('lot_identifier', draft.lotIdentifier);
      formData.append('mandi_location', draft.mandiLocation);
      if (draft.userMoisture) {
        formData.append('user_moisture', String(draft.userMoisture));
      }

      await api.analyzeGrain(formData);
      api.removeOfflineDraft(draft.id);
      loadData();
    } catch (err: any) {
      alert(`Sync failed: ${err.message || 'Server still offline'}`);
    } finally {
      setSyncingId(null);
    }
  };

  const handleDeleteDraft = (id: string) => {
    api.removeOfflineDraft(id);
    setOfflineDrafts(api.getOfflineDrafts());
  };

  // Chart data calculations
  const gradeShares = [
    { name: 'Grade I (Premium)', value: inspections.filter(i => i.statusCode === 'GRADE_I').length || 2, color: '#16a34a' },
    { name: 'Grade II (FAQ)', value: inspections.filter(i => i.statusCode === 'GRADE_II').length || 1, color: '#2563eb' },
    { name: 'Grade III (Industrial)', value: inspections.filter(i => i.statusCode === 'GRADE_III').length || 0, color: '#d97706' },
  ];

  const defectMetrics = [
    { name: 'Sound Grain', pct: 94.2, fill: '#16a34a' },
    { name: 'Broken / Shriveled', pct: 2.8, fill: '#f59e0b' },
    { name: 'Discolored / Blemish', pct: 2.1, fill: '#a855f7' },
    { name: 'Foreign Extraneous', pct: 0.9, fill: '#06b6d4' },
  ];

  const filtered = inspections.filter(i => {
    const matchesSearch = i.variety.toLowerCase().includes(search.toLowerCase()) ||
                          i.lotIdentifier.toLowerCase().includes(search.toLowerCase()) ||
                          i.reportId.toLowerCase().includes(search.toLowerCase());
    const matchesStatus = statusFilter === 'ALL' || i.statusCode === statusFilter;
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-10">
      
      {/* Header */}
      <div className="text-center max-w-3xl mx-auto space-y-3">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-100 text-emerald-900 text-xs font-bold border border-emerald-300">
          <History className="w-3.5 h-3.5 text-emerald-700" />
          <span>Longitudinal Quality Ledger</span>
        </div>
        <h1 className="text-3xl sm:text-4xl font-black text-stone-900 font-serif tracking-tight">
          {t.history.title}
        </h1>
        <p className="text-stone-600 text-sm sm:text-base leading-relaxed">
          {t.history.subtitle}
        </p>
      </div>

      {/* ----------------- OFFLINE DRAFTS QUEUE (IF ANY) ----------------- */}
      {offlineDrafts.length > 0 && (
        <div className="bg-amber-50/80 rounded-3xl p-6 border border-amber-300 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-amber-900 font-bold text-sm">
              <WifiOff className="w-4 h-4 text-amber-700" />
              <span>Offline Inspection Drafts Queue ({offlineDrafts.length})</span>
            </div>
            <span className="text-[11px] text-amber-700">Stored in browser local storage</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {offlineDrafts.map((d) => (
              <div key={d.id} className="p-4 rounded-2xl bg-white border border-amber-200 flex items-center justify-between gap-4">
                <div>
                  <span className="font-bold text-xs text-stone-900 block">{d.variety} • {d.lotIdentifier}</span>
                  <span className="text-[11px] text-stone-500 block">{new Date(d.timestamp).toLocaleString()}</span>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleSyncDraft(d)}
                    disabled={syncingId === d.id}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-agri-800 text-white text-xs font-bold"
                  >
                    <RefreshCw className={`w-3.5 h-3.5 ${syncingId === d.id ? 'animate-spin' : ''}`} />
                    <span>Sync</span>
                  </button>
                  <button
                    onClick={() => handleDeleteDraft(d.id)}
                    className="p-1.5 text-red-600 hover:bg-red-50 rounded-lg"
                    title="Delete draft"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ----------------- ANALYTICS VISUALIZATIONS ----------------- */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        
        {/* Quality Grade Distribution Pie Chart */}
        <div className="bg-white rounded-3xl p-6 sm:p-8 shadow-soft-md border border-stone-200 space-y-4">
          <h3 className="font-extrabold text-stone-900 text-base font-serif">
            {t.history.chartGrades}
          </h3>
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={gradeShares}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={90}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {gradeShares.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Defect Distribution Bar Chart */}
        <div className="bg-white rounded-3xl p-6 sm:p-8 shadow-soft-md border border-stone-200 space-y-4">
          <h3 className="font-extrabold text-stone-900 text-base font-serif">
            {t.history.chartDefects}
          </h3>
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={defectMetrics} margin={{ top: 20, right: 20, left: 0, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis dataKey="name" fontSize={11} stroke="#94a3b8" />
                <YAxis fontSize={11} stroke="#94a3b8" unit="%" />
                <Tooltip />
                <Bar dataKey="pct" radius={[6, 6, 0, 0]}>
                  {defectMetrics.map((entry, index) => (
                    <Cell key={`bar-${index}`} fill={entry.fill} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

      </div>

      {/* ----------------- INSPECTIONS HISTORY LOG TABLE ----------------- */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 shadow-soft-md border border-stone-200 space-y-6">
        
        {/* Table Filters */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="relative w-full sm:w-72">
            <Search className="w-4 h-4 text-stone-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search variety, report ID, lot..."
              className="w-full pl-10 pr-3.5 py-2 rounded-xl border border-stone-300 text-xs bg-white"
            />
          </div>

          <div className="flex items-center gap-2">
            <Filter className="w-4 h-4 text-stone-400" />
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-3.5 py-2 rounded-xl border border-stone-300 text-xs font-semibold text-stone-700 bg-white"
            >
              <option value="ALL">All Grades</option>
              <option value="GRADE_I">Grade I (Premium)</option>
              <option value="GRADE_II">Grade II (FAQ)</option>
              <option value="GRADE_III">Grade III</option>
            </select>
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border border-stone-200 rounded-2xl overflow-hidden">
            <thead className="bg-stone-100 text-stone-700 font-bold uppercase tracking-wider border-b border-stone-200">
              <tr>
                <th className="px-4 py-3.5">Report ID</th>
                <th className="px-4 py-3.5">Produce Lot</th>
                <th className="px-4 py-3.5">Assigned Grade</th>
                <th className="px-4 py-3.5">Sound Ratio</th>
                <th className="px-4 py-3.5">Broken Ratio</th>
                <th className="px-4 py-3.5">Confidence</th>
                <th className="px-4 py-3.5">Date</th>
                <th className="px-4 py-3.5">Passport</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-200">
              {loading ? (
                <tr>
                  <td colSpan={8} className="px-4 py-8 text-center text-stone-500">
                    Loading inspection ledger...
                  </td>
                </tr>
              ) : filtered.length === 0 ? (
                <tr>
                  <td colSpan={8} className="px-4 py-8 text-center text-stone-500">
                    No inspections match current filters.
                  </td>
                </tr>
              ) : (
                filtered.map((item) => (
                  <tr key={item.inspectionId} className="hover:bg-stone-50 transition-colors">
                    <td className="px-4 py-3.5 font-mono font-bold text-stone-900">{item.reportId}</td>
                    <td className="px-4 py-3.5">
                      <div className="font-bold text-stone-900">{item.variety}</div>
                      <div className="text-[10px] text-stone-500 font-mono">{item.lotIdentifier}</div>
                    </td>
                    <td className="px-4 py-3.5 font-semibold text-emerald-800">{item.assignedGrade}</td>
                    <td className="px-4 py-3.5 font-bold text-emerald-700">{item.metrics.sound_grain.percentage}%</td>
                    <td className="px-4 py-3.5 font-bold text-amber-700">{item.metrics.broken_shriveled.percentage}%</td>
                    <td className="px-4 py-3.5 font-mono">{Math.round(item.confidenceScore * 100)}%</td>
                    <td className="px-4 py-3.5 text-stone-500">{new Date(item.createdAt).toLocaleDateString()}</td>
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
                        <span>Passport</span>
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
