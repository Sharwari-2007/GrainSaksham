import { InspectionRecord, MarketPrice, QualityPassport, Listing, BuyerOffer, GradeDispute } from './types';

const isLocalVite = typeof window !== 'undefined' && 
  (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') && 
  window.location.port === '5173';

const API_BASE_URL = isLocalVite ? 'http://127.0.0.1:8000/api' : '/api';

// Offline Draft Storage Key
const OFFLINE_DRAFTS_KEY = 'grainsaksham_offline_drafts';

export interface OfflineDraft {
  id: string;
  timestamp: string;
  cropType: string;
  variety: string;
  lotIdentifier: string;
  mandiLocation: string;
  userMoisture?: number | null;
  imageFileName: string;
  imageBase64: string;
  synced: boolean;
}

export const api = {
  // Health
  checkHealth: async () => {
    try {
      const res = await fetch(`${API_BASE_URL}/health`);
      return await res.json();
    } catch {
      return { status: 'offline', cv_engine: 'local-fallback' };
    }
  },

  // Inspections
  analyzeGrain: async (formData: FormData): Promise<InspectionRecord> => {
    try {
      const res = await fetch(`${API_BASE_URL}/inspections/analyze`, {
        method: 'POST',
        body: formData,
      });
      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        throw new Error(errorData.detail || `Server returned error status ${res.status}`);
      }
      return await res.json();
    } catch (err: any) {
      // If network failed, save as offline draft
      console.warn('Backend call failed, checking offline fallback:', err);
      throw err;
    }
  },

  getInspections: async (ownerId?: string): Promise<InspectionRecord[]> => {
    try {
      const url = ownerId ? `${API_BASE_URL}/inspections?owner_id=${ownerId}` : `${API_BASE_URL}/inspections`;
      const res = await fetch(url);
      if (!res.ok) throw new Error('Failed to load inspections');
      return await res.json();
    } catch {
      console.warn('Falling back to local cached inspections');
      return [];
    }
  },

  getInspectionDetail: async (id: string): Promise<InspectionRecord | null> => {
    try {
      const res = await fetch(`${API_BASE_URL}/inspections/${id}`);
      if (!res.ok) throw new Error('Inspection not found');
      return await res.json();
    } catch {
      return null;
    }
  },

  // Market Prices
  getMarketPrices: async (crop?: string, state?: string, district?: string): Promise<MarketPrice[]> => {
    try {
      const params = new URLSearchParams();
      if (crop) params.append('crop', crop);
      if (state) params.append('state', state);
      if (district) params.append('district', district);
      
      const res = await fetch(`${API_BASE_URL}/market-prices?${params.toString()}`);
      if (!res.ok) throw new Error('Failed to fetch prices');
      const data = await res.json();
      return data.prices || [];
    } catch {
      return [];
    }
  },

  // Quality Passports
  getQualityReport: async (reportId: string): Promise<QualityPassport | null> => {
    try {
      const res = await fetch(`${API_BASE_URL}/reports/${reportId}`);
      if (!res.ok) throw new Error('Report not found');
      return await res.json();
    } catch {
      return null;
    }
  },

  getPublicVerification: async (reportId: string): Promise<any> => {
    try {
      const res = await fetch(`${API_BASE_URL}/reports/${reportId}/verify`);
      if (!res.ok) throw new Error('Verification failed');
      return await res.json();
    } catch (err: any) {
      throw new Error(err.message || 'Verification could not be established');
    }
  },

  // Marketplace Listings
  getListings: async (crop?: string): Promise<Listing[]> => {
    try {
      const url = crop ? `${API_BASE_URL}/listings?crop=${crop}` : `${API_BASE_URL}/listings`;
      const res = await fetch(url);
      if (!res.ok) throw new Error('Failed to fetch listings');
      return await res.json();
    } catch {
      return [];
    }
  },

  createListing: async (listing: Partial<Listing>): Promise<Listing> => {
    const res = await fetch(`${API_BASE_URL}/listings`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(listing)
    });
    if (!res.ok) throw new Error('Failed to create listing');
    return await res.json();
  },

  deleteListing: async (id: string): Promise<void> => {
    await fetch(`${API_BASE_URL}/listings/${id}`, { method: 'DELETE' });
  },

  // Buyer Offers
  getOffers: async (listingId?: string): Promise<BuyerOffer[]> => {
    try {
      const url = listingId ? `${API_BASE_URL}/offers?listing_id=${listingId}` : `${API_BASE_URL}/offers`;
      const res = await fetch(url);
      if (!res.ok) throw new Error('Failed to fetch offers');
      return await res.json();
    } catch {
      return [];
    }
  },

  createOffer: async (offer: Partial<BuyerOffer>): Promise<BuyerOffer> => {
    const res = await fetch(`${API_BASE_URL}/offers`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(offer)
    });
    if (!res.ok) throw new Error('Failed to send offer');
    return await res.json();
  },

  // Grade Disputes
  getDisputes: async (): Promise<GradeDispute[]> => {
    try {
      const res = await fetch(`${API_BASE_URL}/disputes`);
      if (!res.ok) throw new Error('Failed to fetch disputes');
      return await res.json();
    } catch {
      return [];
    }
  },

  createDispute: async (dispute: any): Promise<GradeDispute> => {
    const res = await fetch(`${API_BASE_URL}/disputes`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(dispute)
    });
    if (!res.ok) throw new Error('Failed to register dispute');
    return await res.json();
  },

  updateDisputeStatus: async (disputeId: string, payload: { status: string; actor: string; action: string; comment: string }): Promise<GradeDispute> => {
    const res = await fetch(`${API_BASE_URL}/disputes/${disputeId}/status`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
    if (!res.ok) throw new Error('Failed to update dispute status');
    return await res.json();
  },

  // Analytics
  getAnalytics: async () => {
    try {
      const res = await fetch(`${API_BASE_URL}/analytics`);
      if (!res.ok) throw new Error('Analytics failed');
      return await res.json();
    } catch {
      return null;
    }
  },

  // Standards
  getStandards: async () => {
    try {
      const res = await fetch(`${API_BASE_URL}/standards`);
      return await res.json();
    } catch {
      return {};
    }
  },

  // ----------------- OFFLINE DRAFT STORAGE -----------------
  saveOfflineDraft: (draft: Omit<OfflineDraft, 'id' | 'timestamp' | 'synced'>): OfflineDraft => {
    const drafts = api.getOfflineDrafts();
    const newDraft: OfflineDraft = {
      ...draft,
      id: `draft-${Date.now()}`,
      timestamp: new Date().toISOString(),
      synced: false
    };
    drafts.unshift(newDraft);
    localStorage.setItem(OFFLINE_DRAFTS_KEY, JSON.stringify(drafts));
    return newDraft;
  },

  getOfflineDrafts: (): OfflineDraft[] => {
    try {
      const raw = localStorage.getItem(OFFLINE_DRAFTS_KEY);
      return raw ? JSON.parse(raw) : [];
    } catch {
      return [];
    }
  },

  removeOfflineDraft: (id: string) => {
    const drafts = api.getOfflineDrafts().filter(d => d.id !== id);
    localStorage.setItem(OFFLINE_DRAFTS_KEY, JSON.stringify(drafts));
  }
};
