import React, { useState, useEffect } from 'react';
import { 
  TrendingUp, 
  Calculator, 
  Filter, 
  Info 
} from 'lucide-react';
import { 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer, 
  Legend 
} from 'recharts';
import { api } from '../api';
import { MarketPrice } from '../types';
import { useTranslation } from '../context/LanguageContext';

export const MandiComparisonView: React.FC = () => {
  const { t } = useTranslation();
  const [prices, setPrices] = useState<MarketPrice[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Filters
  const [selectedCrop, setSelectedCrop] = useState<string>('Wheat');
  const [selectedState, setSelectedState] = useState<string>('All');
  
  // Calculator state
  const [calcQuantity, setCalcQuantity] = useState<number>(85); // Quintals
  const [calcSelectedPrice, setCalcSelectedPrice] = useState<number>(2420); // Rs / Qtl
  const [calcTransportCost, setCalcTransportCost] = useState<number>(4500); // Rs total transport

  // Historical trend data
  const trendData = [
    { date: '08 Oct', min: 2275, modal: 2380, max: 2490 },
    { date: '09 Oct', min: 2275, modal: 2390, max: 2510 },
    { date: '10 Oct', min: 2280, modal: 2400, max: 2520 },
    { date: '11 Oct', min: 2280, modal: 2410, max: 2540 },
    { date: '12 Oct', min: 2285, modal: 2415, max: 2550 },
    { date: '13 Oct', min: 2290, modal: 2420, max: 2560 },
    { date: '14 Oct', min: 2295, modal: 2420, max: 2580 },
  ];

  useEffect(() => {
    let isMounted = true;
    const loadPrices = async () => {
      try {
        const cropQuery = selectedCrop !== 'All' ? selectedCrop : undefined;
        const stateQuery = selectedState !== 'All' ? selectedState : undefined;
        const data = await api.getMarketPrices(cropQuery, stateQuery);
        if (isMounted) {
          setPrices(data);
          if (data.length > 0 && !calcSelectedPrice) {
            setCalcSelectedPrice(data[0].modalPrice);
          }
        }
      } catch (err) {
        if (isMounted) {
          console.error('Error fetching market prices:', err);
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    loadPrices();

    return () => {
      isMounted = false;
    };
  }, [selectedCrop, selectedState, calcSelectedPrice]);

  // Calculations
  const grossValue = calcQuantity * calcSelectedPrice;
  const netValue = Math.max(0, grossValue - calcTransportCost);

  const states = ['All', 'Punjab', 'Haryana', 'Madhya Pradesh', 'Uttar Pradesh', 'Maharashtra', 'Rajasthan'];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-10">
      
      {/* Header */}
      <div className="text-center max-w-3xl mx-auto space-y-3">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-100 text-blue-900 text-xs font-bold border border-blue-300">
          <TrendingUp className="w-3.5 h-3.5 text-blue-700" />
          <span>AGMARKNET & e-NAM Verified Feeds</span>
        </div>
        <h1 className="text-3xl sm:text-4xl font-black text-stone-900 font-serif tracking-tight">
          {t.mandi.title}
        </h1>
        <p className="text-stone-600 text-sm sm:text-base leading-relaxed">
          {t.mandi.subtitle}
        </p>
      </div>

      {/* ----------------- FAIR-PRICE CALCULATOR ----------------- */}
      <div className="bg-gradient-to-r from-agri-900 via-agri-800 to-emerald-950 rounded-3xl p-6 sm:p-8 text-white shadow-soft-xl border border-agri-700 space-y-6">
        <div className="flex items-center gap-2">
          <Calculator className="w-5 h-5 text-emerald-300" />
          <h2 className="text-lg font-bold font-serif">{t.mandi.calculatorTitle}</h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div>
            <label className="block text-xs font-bold text-emerald-200 mb-1.5">
              {t.mandi.calcQuantity}
            </label>
            <input
              type="number"
              min="1"
              value={calcQuantity}
              onChange={(e) => setCalcQuantity(Number(e.target.value) || 0)}
              className="w-full px-4 py-2.5 rounded-xl bg-white/10 border border-emerald-500/50 text-white font-bold text-sm focus:outline-none focus:ring-2 focus:ring-emerald-400"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-emerald-200 mb-1.5">
              {t.mandi.calcPrice}
            </label>
            <input
              type="number"
              min="100"
              value={calcSelectedPrice}
              onChange={(e) => setCalcSelectedPrice(Number(e.target.value) || 0)}
              className="w-full px-4 py-2.5 rounded-xl bg-white/10 border border-emerald-500/50 text-white font-bold text-sm focus:outline-none focus:ring-2 focus:ring-emerald-400"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-emerald-200 mb-1.5">
              {t.mandi.calcTransport}
            </label>
            <input
              type="number"
              min="0"
              value={calcTransportCost}
              onChange={(e) => setCalcTransportCost(Number(e.target.value) || 0)}
              className="w-full px-4 py-2.5 rounded-xl bg-white/10 border border-emerald-500/50 text-white font-bold text-sm focus:outline-none focus:ring-2 focus:ring-emerald-400"
            />
          </div>
        </div>

        {/* Calculation Result Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2 border-t border-emerald-800/80">
          <div className="p-4 rounded-2xl bg-white/10 border border-emerald-500/30">
            <span className="text-xs text-emerald-200 font-medium block">{t.mandi.grossRealization}</span>
            <span className="text-2xl sm:text-3xl font-black text-white mt-1 block">
              ₹ {grossValue.toLocaleString('en-IN')}
            </span>
            <span className="text-[11px] text-stone-300 block mt-1">
              At ₹{calcSelectedPrice} / Qtl for {calcQuantity} Qtl
            </span>
          </div>

          <div className="p-4 rounded-2xl bg-emerald-500/20 border border-emerald-400/40">
            <span className="text-xs text-emerald-200 font-medium block">{t.mandi.netRealization}</span>
            <span className="text-2xl sm:text-3xl font-black text-emerald-300 mt-1 block">
              ₹ {netValue.toLocaleString('en-IN')}
            </span>
            <span className="text-[11px] text-emerald-100 block mt-1">
              After ₹{calcTransportCost.toLocaleString('en-IN')} transport & handling deduction
            </span>
          </div>
        </div>
      </div>

      {/* ----------------- HISTORICAL PRICE TREND CHART ----------------- */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 shadow-soft-md border border-stone-200 space-y-4">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <h3 className="font-extrabold text-stone-900 text-lg font-serif">
              7-Day Wheat Modal Price Trend (Punjab & Haryana Region)
            </h3>
            <p className="text-stone-500 text-xs mt-0.5">
              Daily Minimum, Modal, and Maximum Benchmark Rates in Rs / Quintal
            </p>
          </div>
          <span className="text-xs font-semibold px-2.5 py-1 rounded bg-stone-100 text-stone-700">
            AGMARKNET Daily Bulletin
          </span>
        </div>

        <div className="h-72 w-full pt-4">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={trendData} margin={{ top: 10, right: 20, left: 0, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
              <XAxis dataKey="date" stroke="#94a3b8" fontSize={12} />
              <YAxis stroke="#94a3b8" fontSize={12} domain={['dataMin - 50', 'dataMax + 50']} />
              <Tooltip 
                contentStyle={{ backgroundColor: '#ffffff', borderRadius: '12px', border: '1px solid #e2e8f0' }}
              />
              <Legend />
              <Line type="monotone" dataKey="modal" stroke="#15803d" strokeWidth={3} name="Modal Price (₹)" dot={{ r: 4 }} activeDot={{ r: 7 }} />
              <Line type="monotone" dataKey="max" stroke="#2563eb" strokeWidth={2} strokeDasharray="4 4" name="Max Price (₹)" />
              <Line type="monotone" dataKey="min" stroke="#d97706" strokeWidth={2} strokeDasharray="4 4" name="Min Price (₹)" />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* ----------------- MANDI BENCHMARK PRICES TABLE ----------------- */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 shadow-soft-md border border-stone-200 space-y-6">
        
        {/* Table Filters */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <Filter className="w-4 h-4 text-stone-500" />
            <span className="font-bold text-sm text-stone-900">Filter Mandi Feed</span>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            {/* State filter */}
            <select
              value={selectedState}
              onChange={(e) => setSelectedState(e.target.value)}
              className="px-3.5 py-2 rounded-xl border border-stone-300 text-xs font-semibold text-stone-700 bg-white"
            >
              {states.map((s) => (
                <option key={s} value={s}>{s === 'All' ? 'All States' : s}</option>
              ))}
            </select>

            {/* Crop filter */}
            <select
              value={selectedCrop}
              onChange={(e) => setSelectedCrop(e.target.value)}
              className="px-3.5 py-2 rounded-xl border border-stone-300 text-xs font-semibold text-stone-700 bg-white"
            >
              <option value="Wheat">Wheat</option>
              <option value="Paddy">Paddy / Rice</option>
              <option value="Maize">Maize / Corn</option>
              <option value="Mustard">Mustard Seed</option>
            </select>
          </div>
        </div>

        {/* Price Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border border-stone-200 rounded-2xl overflow-hidden">
            <thead className="bg-stone-100 text-stone-700 font-bold uppercase tracking-wider border-b border-stone-200">
              <tr>
                <th className="px-4 py-3.5">Mandi & Location</th>
                <th className="px-4 py-3.5">Variety & Quality Grade</th>
                <th className="px-4 py-3.5">Min Price</th>
                <th className="px-4 py-3.5">Modal Benchmark</th>
                <th className="px-4 py-3.5">Max Price</th>
                <th className="px-4 py-3.5">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-200">
              {loading ? (
                <tr>
                  <td colSpan={6} className="px-4 py-8 text-center text-stone-500">
                    Loading verified mandi prices...
                  </td>
                </tr>
              ) : prices.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-4 py-8 text-center text-stone-500">
                    No mandi price records found matching filter criteria.
                  </td>
                </tr>
              ) : (
                prices.map((p) => (
                  <tr key={p.id} className="hover:bg-agri-50/50 transition-colors">
                    <td className="px-4 py-3.5">
                      <div className="font-bold text-stone-900">{p.mandi}</div>
                      <div className="text-[11px] text-stone-500">{p.district}, {p.state}</div>
                    </td>
                    <td className="px-4 py-3.5">
                      <div className="font-semibold text-stone-800">{p.variety}</div>
                      <div className="text-[10px] text-emerald-700 font-medium">{p.gradeReference}</div>
                    </td>
                    <td className="px-4 py-3.5 font-mono text-stone-600">₹ {p.minPrice}</td>
                    <td className="px-4 py-3.5">
                      <span className="font-mono font-black text-sm text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                        ₹ {p.modalPrice}
                      </span>
                      <span className="text-[10px] text-stone-400 block mt-0.5">/ Qtl</span>
                    </td>
                    <td className="px-4 py-3.5 font-mono text-stone-600">₹ {p.maxPrice}</td>
                    <td className="px-4 py-3.5">
                      <button
                        type="button"
                        onClick={() => {
                          setCalcSelectedPrice(p.modalPrice);
                          window.scrollTo({ top: 150, behavior: 'smooth' });
                        }}
                        className="px-3 py-1.5 rounded-lg bg-stone-100 hover:bg-agri-100 text-agri-900 font-bold text-[11px] border border-stone-300"
                      >
                        Use in Calculator
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Mandi Disclaimer */}
        <div className="p-4 rounded-xl bg-stone-50 border border-stone-200 text-xs text-stone-600 flex items-start gap-2.5">
          <Info className="w-4 h-4 text-stone-500 shrink-0 mt-0.5" />
          <p className="leading-relaxed">
            {t.mandi.disclaimer} Data provided courtesy of AGMARKNET and National Agriculture Market (e-NAM) daily bulletins.
          </p>
        </div>

      </div>

    </div>
  );
};
