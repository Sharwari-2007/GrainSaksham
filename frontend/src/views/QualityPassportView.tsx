import React, { useRef, useState } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import { 
  Download, 
  Share2, 
  CheckCircle2, 
  ShieldCheck, 
  Lock, 
  ExternalLink, 
  FileCheck, 
  Copy, 
  Check, 
  ArrowLeft 
} from 'lucide-react';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';
import { InspectionRecord } from '../types';
import { useTranslation } from '../context/LanguageContext';

interface QualityPassportViewProps {
  inspection: InspectionRecord | null;
  onNavigate: (view: string) => void;
}

export const QualityPassportView: React.FC<QualityPassportViewProps> = ({ 
  inspection, 
  onNavigate 
}) => {
  const { t } = useTranslation();
  const passportRef = useRef<HTMLDivElement>(null);
  const [isExporting, setIsExporting] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);
  const [isPublic, setIsPublic] = useState(true);

  if (!inspection) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-20 text-center space-y-4">
        <FileCheck className="w-16 h-16 text-stone-300 mx-auto" />
        <h2 className="text-2xl font-bold text-stone-800">No Active Quality Passport Selected</h2>
        <p className="text-stone-500 text-sm">Please inspect a grain sample first to generate its digital quality passport.</p>
        <button
          onClick={() => onNavigate('scanner')}
          className="inline-flex items-center gap-2 px-6 py-3 bg-agri-800 text-white rounded-xl font-bold text-sm"
        >
          <span>Open AI Grain Scanner</span>
        </button>
      </div>
    );
  }

  const verificationUrl = `${window.location.origin}/#verify/${inspection.reportId}`;

  const handleDownloadPDF = async () => {
    if (!passportRef.current) return;
    try {
      setIsExporting(true);
      const canvas = await html2canvas(passportRef.current, {
        scale: 2,
        useCORS: true,
        logging: false,
        backgroundColor: '#ffffff'
      });
      const imgData = canvas.toDataURL('image/jpeg', 0.95);
      const pdf = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'a4'
      });
      const imgWidth = 210;
      const pageHeight = 297;
      const imgHeight = (canvas.height * imgWidth) / canvas.width;
      let heightLeft = imgHeight;
      let position = 0;

      pdf.addImage(imgData, 'JPEG', 0, position, imgWidth, imgHeight);
      pdf.save(`GrainSaksham_Passport_${inspection.reportId}.pdf`);
    } catch (err) {
      console.error('PDF export error:', err);
      alert('Could not export PDF. Please use browser print (Ctrl+P) as alternative.');
    } finally {
      setIsExporting(false);
    }
  };

  const handleCopyLink = () => {
    navigator.clipboard.writeText(verificationUrl);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2000);
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-6">
      
      {/* Top Action Bar */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <button
          type="button"
          onClick={() => onNavigate('scanner')}
          className="inline-flex items-center gap-1.5 text-xs font-bold text-stone-600 hover:text-stone-900"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Scanner</span>
        </button>

        <div className="flex flex-wrap items-center gap-3">
          {/* Public Share Toggle */}
          <div className="flex items-center gap-2 px-3 py-1.5 bg-stone-100 rounded-lg text-xs font-semibold text-stone-700">
            <Lock className="w-3.5 h-3.5 text-stone-500" />
            <span>Public Sharing:</span>
            <button
              type="button"
              onClick={() => setIsPublic(!isPublic)}
              className={`px-2 py-0.5 rounded text-[11px] font-bold ${isPublic ? 'bg-emerald-600 text-white' : 'bg-stone-300 text-stone-700'}`}
            >
              {isPublic ? 'Enabled' : 'Private'}
            </button>
          </div>

          <button
            type="button"
            onClick={handleCopyLink}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl border border-stone-300 bg-white hover:bg-stone-50 text-xs font-bold text-stone-700 shadow-soft-sm"
          >
            {copiedLink ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
            <span>{copiedLink ? 'Copied Link' : 'Copy Verification Link'}</span>
          </button>

          <button
            type="button"
            onClick={handleDownloadPDF}
            disabled={isExporting}
            className="inline-flex items-center gap-2 px-5 py-2 rounded-xl bg-agri-800 hover:bg-agri-900 disabled:bg-stone-400 text-white text-xs font-extrabold shadow-soft-sm"
          >
            <Download className="w-4 h-4 text-emerald-300" />
            <span>{isExporting ? 'Generating PDF...' : t.passport.downloadPdf}</span>
          </button>
        </div>
      </div>

      {/* ----------------- PASSPORT DOCUMENT CANVAS ----------------- */}
      <div 
        ref={passportRef}
        className="bg-white rounded-3xl p-8 sm:p-12 shadow-soft-xl border border-stone-200 space-y-8 print:border-none print:shadow-none"
      >
        {/* Certificate Header */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6 pb-6 border-b-2 border-stone-900">
          <div>
            <div className="flex items-center gap-2 text-agri-800 font-extrabold text-lg font-serif">
              <span>GrainSaksham AI</span>
              <span className="text-[10px] bg-agri-100 px-2 py-0.5 rounded border border-agri-300 uppercase tracking-widest font-sans font-bold">
                Digital Passport
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black text-stone-900 tracking-tight mt-1 font-serif">
              DIGITAL GRAIN QUALITY PASSPORT
            </h1>
            <p className="text-xs text-stone-500 mt-0.5">
              Preliminary Computer-Vision Quality Assessment Certificate • AGMARK Aligned
            </p>
          </div>

          {/* QR Code */}
          <div className="shrink-0 text-center p-3 bg-stone-50 rounded-2xl border border-stone-200">
            <QRCodeSVG 
              value={verificationUrl}
              size={96}
              level="M"
              includeMargin={false}
            />
            <span className="text-[9px] font-mono text-stone-500 block mt-1.5 uppercase">
              Scan to Verify
            </span>
          </div>
        </div>

        {/* Certificate Core Meta Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 p-5 bg-stone-50 rounded-2xl border border-stone-200 text-xs">
          <div>
            <span className="text-[10px] font-bold uppercase text-stone-500 block">Report Identifier</span>
            <span className="font-mono font-bold text-stone-900 text-sm mt-0.5 block">{inspection.reportId}</span>
          </div>
          <div>
            <span className="text-[10px] font-bold uppercase text-stone-500 block">Lot Identifier</span>
            <span className="font-bold text-stone-900 text-sm mt-0.5 block">{inspection.lotIdentifier}</span>
          </div>
          <div>
            <span className="text-[10px] font-bold uppercase text-stone-500 block">Owner / Farmer</span>
            <span className="font-bold text-stone-900 text-sm mt-0.5 block">{inspection.ownerName}</span>
          </div>
          <div>
            <span className="text-[10px] font-bold uppercase text-stone-500 block">Inspection Date</span>
            <span className="font-bold text-stone-900 text-sm mt-0.5 block">
              {new Date(inspection.createdAt).toLocaleDateString()}
            </span>
          </div>
        </div>

        {/* Commodity and Grade Summary */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-center p-6 rounded-2xl bg-gradient-to-r from-agri-900 to-emerald-950 text-white">
          <div className="md:col-span-2 space-y-1">
            <span className="text-xs text-emerald-300 font-semibold tracking-wider uppercase block">
              Grading Evaluation
            </span>
            <div className="text-2xl sm:text-3xl font-extrabold font-serif">
              {inspection.assignedGrade}
            </div>
            <p className="text-xs text-stone-300 leading-relaxed pt-1">
              {inspection.applicableStandard}
            </p>
          </div>

          <div className="text-left md:text-right border-t md:border-t-0 md:border-l border-emerald-800/60 pt-4 md:pt-0 md:pl-6 space-y-1">
            <div className="text-xs text-stone-300">Model Reliability</div>
            <div className="text-3xl font-black text-emerald-400">
              {Math.round(inspection.confidenceScore * 100)}%
            </div>
            <div className="text-[11px] text-stone-300">
              {inspection.totalKernels} kernels segmented
            </div>
          </div>
        </div>

        {/* Defect Metrics Breakdown Table */}
        <div className="space-y-3">
          <h3 className="font-bold text-sm text-stone-900 uppercase tracking-wider">
            Verified Physical Quality Parameters
          </h3>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border border-stone-200 rounded-xl overflow-hidden">
              <thead className="bg-stone-100 text-stone-700 font-bold uppercase tracking-wider border-b border-stone-200">
                <tr>
                  <th className="px-4 py-3">Parameter</th>
                  <th className="px-4 py-3">Count</th>
                  <th className="px-4 py-3">Estimated Ratio</th>
                  <th className="px-4 py-3">AGMARK Max Tolerance</th>
                  <th className="px-4 py-3">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-200">
                <tr>
                  <td className="px-4 py-3 font-semibold text-stone-900">Sound Full Kernels</td>
                  <td className="px-4 py-3">{inspection.metrics.sound_grain.count}</td>
                  <td className="px-4 py-3 font-bold text-emerald-700">{inspection.metrics.sound_grain.percentage}%</td>
                  <td className="px-4 py-3 text-stone-500">Min 90.0%</td>
                  <td className="px-4 py-3">
                    <span className="bg-emerald-100 text-emerald-900 text-[10px] font-bold px-2 py-0.5 rounded">Pass</span>
                  </td>
                </tr>
                <tr>
                  <td className="px-4 py-3 font-semibold text-stone-900">Broken & Shriveled Kernels</td>
                  <td className="px-4 py-3">{inspection.metrics.broken_shriveled.count}</td>
                  <td className="px-4 py-3 font-bold text-amber-700">{inspection.metrics.broken_shriveled.percentage}%</td>
                  <td className="px-4 py-3 text-stone-500">Max 2.0% (Gr I) / 4.0% (Gr II)</td>
                  <td className="px-4 py-3">
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded ${inspection.metrics.broken_shriveled.percentage <= 4.0 ? 'bg-emerald-100 text-emerald-900' : 'bg-red-100 text-red-900'}`}>
                      {inspection.metrics.broken_shriveled.percentage <= 4.0 ? 'Conforming' : 'Excess'}
                    </span>
                  </td>
                </tr>
                <tr>
                  <td className="px-4 py-3 font-semibold text-stone-900">Discolored & Damaged Kernels</td>
                  <td className="px-4 py-3">{inspection.metrics.discolored_damaged.count}</td>
                  <td className="px-4 py-3 font-bold text-purple-700">{inspection.metrics.discolored_damaged.percentage}%</td>
                  <td className="px-4 py-3 text-stone-500">Max 2.0% (Gr I) / 4.0% (Gr II)</td>
                  <td className="px-4 py-3">
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded ${inspection.metrics.discolored_damaged.percentage <= 4.0 ? 'bg-emerald-100 text-emerald-900' : 'bg-red-100 text-red-900'}`}>
                      {inspection.metrics.discolored_damaged.percentage <= 4.0 ? 'Conforming' : 'Excess'}
                    </span>
                  </td>
                </tr>
                <tr>
                  <td className="px-4 py-3 font-semibold text-stone-900">Foreign Extraneous Matter</td>
                  <td className="px-4 py-3">{inspection.metrics.foreign_matter.count}</td>
                  <td className="px-4 py-3 font-bold text-cyan-700">{inspection.metrics.foreign_matter.percentage}%</td>
                  <td className="px-4 py-3 text-stone-500">Max 1.0% (Gr I) / 1.5% (Gr II)</td>
                  <td className="px-4 py-3">
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded ${inspection.metrics.foreign_matter.percentage <= 1.5 ? 'bg-emerald-100 text-emerald-900' : 'bg-red-100 text-red-900'}`}>
                      {inspection.metrics.foreign_matter.percentage <= 1.5 ? 'Conforming' : 'Excess'}
                    </span>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        {/* Provenance and Integrity Disclosures */}
        <div className="p-5 rounded-2xl bg-stone-50 border border-stone-200 space-y-2 text-xs text-stone-600">
          <div className="font-bold text-stone-900 uppercase tracking-wider text-[11px]">
            Measurement Provenance & Legal Disclaimers
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-[11px] leading-relaxed pt-1">
            <div>
              <span className="font-semibold text-stone-800">Visual Defect Analysis:</span> AI-estimated via OpenCV contour segmentation and color morphology.
            </div>
            <div>
              <span className="font-semibold text-stone-800">Moisture Content:</span> {inspection.userMoisture ? `${inspection.userMoisture}% (User instrument measurement)` : 'Not measured — calibrated meter required'}.
            </div>
            <div>
              <span className="font-semibold text-stone-800">Chemical Residues:</span> Not assessed — ordinary RGB imagery cannot identify invisible mycotoxins or chemicals.
            </div>
            <div>
              <span className="font-semibold text-stone-800">Assaying Status:</span> Preliminary negotiation certificate. Does not replace statutory AGMARK laboratory assaying.
            </div>
          </div>
        </div>

        {/* Digital Signature & Seal */}
        <div className="flex items-center justify-between pt-6 border-t border-stone-200 text-xs text-stone-500">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-5 h-5 text-emerald-700" />
            <span className="font-bold text-stone-800">Digitally Verified on GrainSaksham Agricultural Ledger</span>
          </div>
          <div className="font-mono text-[11px]">
            Engine: {inspection.reportId}
          </div>
        </div>

      </div>

    </div>
  );
};
