import React, { useState } from 'react';
import { 
  Lightbulb, 
  Settings, 
  Wind, 
  Sun, 
  Archive, 
  CheckCircle2, 
  Scan
} from 'lucide-react';
import { useTranslation } from '../context/LanguageContext';
import { SpeechReader } from '../components/SpeechReader';

export const AICoachView: React.FC<{ onNavigate: (view: string) => void }> = ({ onNavigate }) => {
  const { t } = useTranslation();
  const [activeTab, setActiveTab] = useState<'threshing' | 'cleaning' | 'moisture' | 'storage'>('threshing');

  const coachSections = {
    threshing: {
      title: "Harvester & Thresher Drum Speed Calibration",
      subtitle: "Preventing Broken & Fractured Grains at Source",
      speechText: "Harvester and thresher speed calibration guide. Broken kernels are frequently caused by overly aggressive combine cylinder speed or tight concave clearances. For wheat, maintain cylinder speed between 800 to 950 rpm.",
      points: [
        {
          title: "Optimize Cylinder RPM (800 – 950 RPM)",
          desc: "Excess cylinder peripheral speed strikes dry grains with blunt kinetic force, fracturing kernels. Lower cylinder rpm gradually in 50-rpm increments until broken grains disappear in the hopper."
        },
        {
          title: "Adjust Concave Clearance (12 – 16 mm Front, 4 – 6 mm Rear)",
          desc: "If concave gap is too tight, grains are crushed rather than rubbed free of the glumes. Widen front clearance especially in afternoon harvesting when ambient moisture is low."
        },
        {
          title: "Harvest at Ideal Crop Moisture (13% – 16%)",
          desc: "Overly dry wheat (under 10% moisture) becomes brittle and fractures easily in the auger. Harvest during morning or evening hours if midday temperatures cause severe grain shattering."
        }
      ]
    },
    cleaning: {
      title: "Post-Harvest Winnowing & Mesh Screening",
      subtitle: "Eliminating Extraneous Chaff & Weed Seeds to Elevate Mandi Grade",
      speechText: "Post harvest screening and cleaning guide. Passing your wheat lot through a standard 2.0 millimeter slotted sieve eliminates up to 90 percent of chaff, dust, and weed seeds, instantly elevating a Grade 3 lot to Grade 1 or 2.",
      points: [
        {
          title: "Standard 2.0 mm Slotted Screen Sieve",
          desc: "Passing wheat through a 2.0 mm slotted screen eliminates shriveled grains, weed seeds, and broken chips. Grade I AGMARK wheat requires foreign matter under 1.0%."
        },
        {
          title: "Air Aspiration (Winnowing Blower)",
          desc: "Lightweight glumes, straw particles, and hollow kernels can be blown away with simple air aspiration before bagging. Increases lot test weight (hectolitre weight) significantly."
        },
        {
          title: "Magnetic & Gravity De-stoning",
          desc: "Even 0.5% stone contaminants causes severe milling dockage. Simple vibration gravity separators remove heavy mud balls and pebbles."
        }
      ]
    },
    moisture: {
      title: "Safe Sun Drying & Aeration Protocols",
      subtitle: "Preventing Fungal Discoloration & Storage Mold",
      speechText: "Safe sun drying protocol. Spread grain in a 3 to 5 centimeter thin layer on clean tarpaulin for 4 to 6 hours in direct sunshine. Turn the grain every 45 minutes for uniform drying.",
      points: [
        {
          title: "Thin-Layer Sun Drying (3 – 5 cm Depth)",
          desc: "Never heap freshly harvested grain in thick piles. Spread on clean tarpaulin in direct sunlight. Turn grain every 45 minutes to ensure uniform evaporation."
        },
        {
          title: "Cooling Before Bagging",
          desc: "Allow sun-dried grain to cool in the shade for 1–2 hours before packing into gunny bags. Bagging hot grain traps condensation, causing rapid fungal black-point."
        },
        {
          title: "Target Safe Moisture (< 12.0%)",
          desc: "AGMARK and FCI mandate moisture under 12.0% for safe procurement. Grain above 12% is subject to price dockage or rejection at government centers."
        }
      ]
    },
    storage: {
      title: "Safe Storage & Bag Stacking Guidelines",
      subtitle: "Maintaining Grain Freshness and Averting Insect Damage",
      speechText: "Storage guidelines. Stack grain bags on wooden pallets at least 30 centimeters away from damp walls. Use breathable jute or woven polypropylene bags with hermetic liners.",
      points: [
        {
          title: "Wooden Pallet Dunnage (30 cm Wall Clearance)",
          desc: "Never stack bags directly on concrete or mud floors. Elevate on wooden pallets or thick plastic dunnage with at least 30 cm gap from warehouse walls."
        },
        {
          title: "Hermetic or Multi-Layer Storage Liners",
          desc: "For prolonged on-farm storage, use hermetic grain storage bags (Purdue Improved Crop Storage - PICS) to naturally suffocate weevils without chemical pesticides."
        },
        {
          title: "Regular Bimonthly Lot Aeration",
          desc: "Ensure cross-ventilation during dry sunny afternoons. Avoid opening storage rooms during humid monsoon rains to prevent moisture re-absorption."
        }
      ]
    }
  };

  const currentSection = coachSections[activeTab];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-10">
      
      {/* Header */}
      <div className="text-center max-w-3xl mx-auto space-y-3">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-purple-100 text-purple-900 text-xs font-bold border border-purple-300">
          <Lightbulb className="w-3.5 h-3.5 text-purple-700" />
          <span>Scientific Agricultural Advisory</span>
        </div>
        <h1 className="text-3xl sm:text-4xl font-black text-stone-900 font-serif tracking-tight">
          {t.coach.title}
        </h1>
        <p className="text-stone-600 text-sm sm:text-base leading-relaxed">
          {t.coach.subtitle}
        </p>
      </div>

      {/* Navigation Tabs */}
      <div className="flex flex-wrap items-center justify-center gap-3">
        <button
          onClick={() => setActiveTab('threshing')}
          className={`inline-flex items-center gap-2 px-5 py-2.5 rounded-xl font-bold text-xs transition-all ${
            activeTab === 'threshing'
              ? 'bg-agri-800 text-white shadow-soft-sm'
              : 'bg-white text-stone-700 border border-stone-200 hover:bg-stone-50'
          }`}
        >
          <Settings className="w-4 h-4" />
          <span>{t.coach.tabThreshing}</span>
        </button>

        <button
          onClick={() => setActiveTab('cleaning')}
          className={`inline-flex items-center gap-2 px-5 py-2.5 rounded-xl font-bold text-xs transition-all ${
            activeTab === 'cleaning'
              ? 'bg-agri-800 text-white shadow-soft-sm'
              : 'bg-white text-stone-700 border border-stone-200 hover:bg-stone-50'
          }`}
        >
          <Wind className="w-4 h-4" />
          <span>{t.coach.tabCleaning}</span>
        </button>

        <button
          onClick={() => setActiveTab('moisture')}
          className={`inline-flex items-center gap-2 px-5 py-2.5 rounded-xl font-bold text-xs transition-all ${
            activeTab === 'moisture'
              ? 'bg-agri-800 text-white shadow-soft-sm'
              : 'bg-white text-stone-700 border border-stone-200 hover:bg-stone-50'
          }`}
        >
          <Sun className="w-4 h-4" />
          <span>{t.coach.tabMoisture}</span>
        </button>

        <button
          onClick={() => setActiveTab('storage')}
          className={`inline-flex items-center gap-2 px-5 py-2.5 rounded-xl font-bold text-xs transition-all ${
            activeTab === 'storage'
              ? 'bg-agri-800 text-white shadow-soft-sm'
              : 'bg-white text-stone-700 border border-stone-200 hover:bg-stone-50'
          }`}
        >
          <Archive className="w-4 h-4" />
          <span>{t.coach.tabStorage}</span>
        </button>
      </div>

      {/* Content Card */}
      <div className="bg-white rounded-3xl p-8 sm:p-10 shadow-soft-xl border border-stone-200 space-y-8 animate-fadeIn">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-6 border-b border-stone-200">
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-purple-700 bg-purple-50 px-2 py-0.5 rounded border border-purple-200">
              Verified Extension Advisory
            </span>
            <h2 className="text-2xl font-black text-stone-900 font-serif mt-1">
              {currentSection.title}
            </h2>
            <p className="text-stone-500 text-xs mt-0.5">
              {currentSection.subtitle}
            </p>
          </div>

          <SpeechReader
            textToRead={currentSection.speechText}
            label="Listen to Audio Guide"
          />
        </div>

        {/* Actionable Points */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {currentSection.points.map((pt, idx) => (
            <div key={idx} className="p-6 rounded-2xl bg-stone-50 border border-stone-200 space-y-3 flex flex-col justify-between">
              <div>
                <div className="w-8 h-8 rounded-lg bg-purple-100 text-purple-800 font-bold text-xs flex items-center justify-center mb-3">
                  {idx + 1}
                </div>
                <h3 className="font-bold text-stone-900 text-sm mb-1.5">{pt.title}</h3>
                <p className="text-stone-600 text-xs leading-relaxed">{pt.desc}</p>
              </div>
              <div className="pt-3 border-t border-stone-200 flex items-center gap-1.5 text-[11px] text-emerald-700 font-semibold">
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>AGMARK Quality Boost</span>
              </div>
            </div>
          ))}
        </div>

        {/* Next Step CTA: Compare subsequent sample */}
        <div className="p-6 rounded-2xl bg-gradient-to-r from-agri-900 to-agri-950 text-white flex flex-col sm:flex-row items-center justify-between gap-6">
          <div className="space-y-1 text-center sm:text-left">
            <h3 className="font-bold text-base font-serif">Implemented these post-harvest techniques?</h3>
            <p className="text-stone-300 text-xs max-w-lg">
              Photograph your cleaned sample to verify the grade improvement on the AI Grain Scanner.
            </p>
          </div>
          <button
            onClick={() => onNavigate('scanner')}
            className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-white text-agri-950 font-bold text-xs hover:bg-stone-100 shrink-0 shadow-md"
          >
            <Scan className="w-4 h-4 text-agri-800" />
            <span>Upload New Batch</span>
          </button>
        </div>

      </div>

    </div>
  );
};
