import React, { useState, useEffect } from 'react';
import { 
  ShoppingBag, 
  Search, 
  Filter, 
  MapPin, 
  CheckCircle2, 
  Plus, 
  FileCheck, 
  Send, 
  X, 
  Check 
} from 'lucide-react';
import { api } from '../api';
import { Listing, BuyerOffer } from '../types';
import { useAuth } from '../context/AuthContext';
import { useTranslation } from '../context/LanguageContext';

export const BuyerMarketplaceView: React.FC<{ onNavigate: (view: string) => void }> = ({ onNavigate }) => {
  const { t } = useTranslation();
  const { currentUser, isFarmer, isBuyer } = useAuth();
  
  const [listings, setListings] = useState<Listing[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  
  // Create Listing Modal
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [newVariety, setNewVariety] = useState('HD-2967 (Sharbati)');
  const [newLotId, setNewLotId] = useState('LOT-PB-SAM-08');
  const [newQuantity, setNewQuantity] = useState(85);
  const [newPrice, setNewPrice] = useState(2520);
  const [newLocation, setNewLocation] = useState('Khanna Mandi, Punjab');
  const [newPassportId, setNewPassportId] = useState('GS-WHT-2026-8942');
  
  // Submit Offer Modal
  const [offerModalOpen, setOfferModalOpen] = useState(false);
  const [targetListing, setTargetListing] = useState<Listing | null>(null);
  const [offerPrice, setOfferPrice] = useState<number>(2480);
  const [offerQuantity, setOfferQuantity] = useState<number>(50);
  const [offerMessage, setOfferMessage] = useState<string>('We have reviewed your verified quality passport and can lift directly from your farm gate.');
  const [offerSubmitted, setOfferSubmitted] = useState(false);

  useEffect(() => {
    fetchListings();
  }, []);

  const fetchListings = async () => {
    try {
      setLoading(true);
      const data = await api.getListings();
      setListings(data);
    } catch (err) {
      console.error('Error fetching listings:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateListing = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.createListing({
        ownerId: currentUser.uid,
        ownerName: currentUser.displayName,
        crop: 'Wheat',
        variety: newVariety,
        lotIdentifier: newLotId,
        quantityQuintals: newQuantity,
        askingPricePerQuintal: newPrice,
        location: newLocation,
        qualityPassportId: newPassportId,
        qualityGrade: 'Grade I (Premium)',
        soundPct: 96.5,
        contactPhone: currentUser.phone || '+91 98765 43210'
      });
      setCreateModalOpen(false);
      fetchListings();
    } catch (err) {
      console.error('Error creating listing:', err);
    }
  };

  const handleOpenOfferModal = (listing: Listing) => {
    setTargetListing(listing);
    setOfferPrice(listing.askingPricePerQuintal);
    setOfferQuantity(listing.quantityQuintals);
    setOfferSubmitted(false);
    setOfferModalOpen(true);
  };

  const handleSubmitOffer = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!targetListing) return;
    try {
      await api.createOffer({
        listingId: targetListing.id,
        buyerId: currentUser.uid,
        buyerName: currentUser.displayName,
        offeredPricePerQuintal: offerPrice,
        offeredQuantityQuintals: offerQuantity,
        message: offerMessage
      });
      setOfferSubmitted(true);
      setTimeout(() => {
        setOfferModalOpen(false);
        setOfferSubmitted(false);
      }, 1500);
    } catch (err) {
      console.error('Error submitting offer:', err);
    }
  };

  const filtered = listings.filter(l => 
    l.variety.toLowerCase().includes(searchQuery.toLowerCase()) ||
    l.location.toLowerCase().includes(searchQuery.toLowerCase()) ||
    l.lotIdentifier.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-10">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-teal-100 text-teal-900 text-xs font-bold border border-teal-300">
            <ShoppingBag className="w-3.5 h-3.5 text-teal-700" />
            <span>Verified Agricultural Commerce</span>
          </div>
          <h1 className="text-3xl font-black text-stone-900 font-serif tracking-tight mt-1">
            {t.marketplace.title}
          </h1>
          <p className="text-stone-600 text-sm mt-0.5">
            {t.marketplace.subtitle}
          </p>
        </div>

        {/* Farmer Create Listing Button */}
        <button
          type="button"
          onClick={() => setCreateModalOpen(true)}
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-agri-800 hover:bg-agri-900 text-white font-bold text-xs shadow-soft-sm"
        >
          <Plus className="w-4 h-4" />
          <span>{t.marketplace.createListing}</span>
        </button>
      </div>

      {/* Search & Notice Bar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4">
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 text-stone-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search variety, location, or lot ID..."
            className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-stone-300 text-xs bg-white focus:outline-none focus:ring-2 focus:ring-agri-600"
          />
        </div>

        <div className="text-xs text-stone-500 bg-stone-100 px-3.5 py-2 rounded-xl flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-emerald-500" />
          <span>Demo Marketplace Prototype • Linked to Live Quality Passports</span>
        </div>
      </div>

      {/* Listings Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {loading ? (
          <div className="col-span-3 text-center py-12 text-stone-500 text-xs">
            Loading verified crop listings...
          </div>
        ) : filtered.length === 0 ? (
          <div className="col-span-3 text-center py-12 text-stone-500 text-xs">
            No produce listings match your search criteria.
          </div>
        ) : (
          filtered.map((l) => (
            <div key={l.id} className="bg-white rounded-3xl p-6 shadow-soft-md border border-stone-200 flex flex-col justify-between space-y-4 hover:shadow-soft-xl transition-all">
              <div className="space-y-3">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                      {l.qualityGrade || 'Verified Lot'}
                    </span>
                    <h3 className="font-extrabold text-stone-900 text-lg mt-1 font-serif">
                      {l.crop}: {l.variety}
                    </h3>
                  </div>
                  <div className="text-right">
                    <span className="text-xs text-stone-400 block">Asking</span>
                    <span className="font-mono font-black text-agri-800 text-base">₹{l.askingPricePerQuintal}</span>
                    <span className="text-[10px] text-stone-400 block">/ Quintal</span>
                  </div>
                </div>

                <div className="space-y-1.5 text-xs text-stone-600 pt-1 border-t border-stone-100">
                  <div className="flex justify-between">
                    <span>Available Quantity:</span>
                    <span className="font-bold text-stone-900">{l.quantityQuintals} Quintals (100 kg)</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Sound Grain Ratio:</span>
                    <span className="font-bold text-emerald-700">{l.soundPct || 96.5}%</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Lot Identifier:</span>
                    <span className="font-mono text-stone-700">{l.lotIdentifier}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Farmer:</span>
                    <span className="text-stone-800 font-semibold">{l.ownerName}</span>
                  </div>
                </div>

                <div className="flex items-center gap-1.5 text-[11px] text-stone-500 pt-1">
                  <MapPin className="w-3.5 h-3.5 text-stone-400 shrink-0" />
                  <span className="line-clamp-1">{l.location}</span>
                </div>
              </div>

              {/* Actions: View Passport or Submit Offer */}
              <div className="pt-3 border-t border-stone-100 flex items-center justify-between gap-3">
                {l.qualityPassportId && (
                  <button
                    type="button"
                    onClick={() => {
                      window.location.hash = `verify/${l.qualityPassportId}`;
                      onNavigate('verify');
                    }}
                    className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-700 hover:underline"
                  >
                    <FileCheck className="w-3.5 h-3.5" />
                    <span>View Passport</span>
                  </button>
                )}

                <button
                  type="button"
                  onClick={() => handleOpenOfferModal(l)}
                  className="ml-auto inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-agri-800 hover:bg-agri-900 text-white font-bold text-xs shadow-soft-sm"
                >
                  <Send className="w-3.5 h-3.5 text-emerald-300" />
                  <span>Make Offer</span>
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {/* ----------------- CREATE LISTING MODAL ----------------- */}
      {createModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fadeIn">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-8 shadow-2xl border border-stone-200 space-y-6">
            <div className="flex items-center justify-between pb-3 border-b border-stone-100">
              <h3 className="font-extrabold text-stone-900 text-lg font-serif">Create Grain Produce Listing</h3>
              <button onClick={() => setCreateModalOpen(false)} className="p-1 rounded-full hover:bg-stone-100">
                <X className="w-5 h-5 text-stone-500" />
              </button>
            </div>

            <form onSubmit={handleCreateListing} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-stone-700 mb-1">Variety Name</label>
                <input
                  type="text"
                  value={newVariety}
                  onChange={(e) => setNewVariety(e.target.value)}
                  className="w-full px-3.5 py-2 rounded-xl border border-stone-300 text-xs bg-white"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-stone-700 mb-1">Quantity (Quintals)</label>
                  <input
                    type="number"
                    min="1"
                    value={newQuantity}
                    onChange={(e) => setNewQuantity(Number(e.target.value))}
                    className="w-full px-3.5 py-2 rounded-xl border border-stone-300 text-xs bg-white"
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-stone-700 mb-1">Asking Price (₹ / Qtl)</label>
                  <input
                    type="number"
                    min="100"
                    value={newPrice}
                    onChange={(e) => setNewPrice(Number(e.target.value))}
                    className="w-full px-3.5 py-2 rounded-xl border border-stone-300 text-xs bg-white"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-stone-700 mb-1">Mandi / Yard Location</label>
                <input
                  type="text"
                  value={newLocation}
                  onChange={(e) => setNewLocation(e.target.value)}
                  className="w-full px-3.5 py-2 rounded-xl border border-stone-300 text-xs bg-white"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-stone-700 mb-1">Linked Quality Passport ID</label>
                <input
                  type="text"
                  value={newPassportId}
                  onChange={(e) => setNewPassportId(e.target.value)}
                  className="w-full px-3.5 py-2 rounded-xl border border-stone-300 text-xs bg-white"
                />
              </div>

              <button
                type="submit"
                className="w-full py-3 rounded-xl bg-agri-800 hover:bg-agri-900 text-white font-bold text-xs shadow-soft-sm"
              >
                Publish Produce Listing
              </button>
            </form>
          </div>
        </div>
      )}

      {/* ----------------- SUBMIT OFFER MODAL ----------------- */}
      {offerModalOpen && targetListing && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fadeIn">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 sm:p-8 shadow-2xl border border-stone-200 space-y-5">
            <div className="flex items-center justify-between pb-3 border-b border-stone-100">
              <div>
                <h3 className="font-extrabold text-stone-900 text-base font-serif">Submit Purchase Offer</h3>
                <span className="text-xs text-stone-500">{targetListing.variety} • {targetListing.lotIdentifier}</span>
              </div>
              <button onClick={() => setOfferModalOpen(false)} className="p-1 rounded-full hover:bg-stone-100">
                <X className="w-5 h-5 text-stone-500" />
              </button>
            </div>

            {offerSubmitted ? (
              <div className="py-8 text-center space-y-2">
                <Check className="w-12 h-12 text-emerald-600 mx-auto" />
                <h4 className="font-bold text-stone-900 text-base">Offer Dispatched to Farmer!</h4>
                <p className="text-stone-500 text-xs">Ramesh Kumar has been notified via the platform.</p>
              </div>
            ) : (
              <form onSubmit={handleSubmitOffer} className="space-y-4">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-stone-700 mb-1">{t.marketplace.offerPrice}</label>
                    <input
                      type="number"
                      value={offerPrice}
                      onChange={(e) => setOfferPrice(Number(e.target.value))}
                      className="w-full px-3.5 py-2 rounded-xl border border-stone-300 text-xs bg-white font-bold"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-stone-700 mb-1">{t.marketplace.offerQty}</label>
                    <input
                      type="number"
                      value={offerQuantity}
                      onChange={(e) => setOfferQuantity(Number(e.target.value))}
                      className="w-full px-3.5 py-2 rounded-xl border border-stone-300 text-xs bg-white font-bold"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-stone-700 mb-1">{t.marketplace.offerMsg}</label>
                  <textarea
                    rows={3}
                    value={offerMessage}
                    onChange={(e) => setOfferMessage(e.target.value)}
                    className="w-full px-3.5 py-2 rounded-xl border border-stone-300 text-xs bg-white"
                    required
                  />
                </div>

                <div className="p-3 rounded-xl bg-stone-50 text-[11px] text-stone-500">
                  Total offer valuation: <strong className="text-stone-900 font-mono">₹{(offerPrice * offerQuantity).toLocaleString('en-IN')}</strong>
                </div>

                <button
                  type="submit"
                  className="w-full py-3 rounded-xl bg-agri-800 hover:bg-agri-900 text-white font-bold text-xs shadow-soft-sm"
                >
                  Send Commercial Offer
                </button>
              </form>
            )}
          </div>
        </div>
      )}

    </div>
  );
};
