export type Role = 'farmer' | 'buyer' | 'admin';

export interface User {
  uid: string;
  displayName: string;
  email: string;
  role: Role;
  state?: string;
  district?: string;
  village?: string;
  phone?: string;
  organization?: string;
  designation?: string;
  cropsGrown?: string[];
  holdingAcres?: number;
  mandiLicenseNo?: string;
  createdAt: string;
}

export interface MetricDetail {
  count: number;
  percentage: number;
  tolerance_basis: string;
}

export interface InspectionMetrics {
  sound_grain: MetricDetail;
  broken_shriveled: MetricDetail;
  discolored_damaged: MetricDetail;
  foreign_matter: MetricDetail;
}

export interface CoachTip {
  category: string;
  title: string;
  advice: string;
}

export interface InspectionRecord {
  inspectionId: string;
  reportId: string;
  ownerId: string;
  ownerName: string;
  cropType: string;
  variety: string;
  lotIdentifier: string;
  mandiLocation: string;
  userMoisture?: number | null;
  status: 'COMPLETED' | 'PENDING' | 'FAILED';
  assignedGrade: string;
  statusCode: string;
  confidenceScore: number;
  totalKernels: number;
  metrics: InspectionMetrics;
  applicableStandard: string;
  explanation: string;
  improvementCoach?: CoachTip[];
  provenance?: {
    visual_defects: string;
    moisture_measurement: string;
    chemical_residues: string;
    laboratory_status: string;
  };
  clarityEvaluation?: {
    status: string;
    sharpness_score: number;
    mean_brightness: number;
    is_acceptable: boolean;
    feedback: string[];
  };
  sampleDetections?: Array<{
    id: number;
    type: string;
    label: string;
    bbox: number[];
    area_px: number;
    aspect_ratio: number;
  }>;
  annotatedImage?: string;
  originalImage?: string;
  isPubliclyShared: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface QualityPassport {
  reportId: string;
  inspectionId: string;
  ownerId?: string;
  ownerName: string;
  crop: string;
  variety: string;
  lotIdentifier: string;
  location: string;
  inspectionDate: string;
  assignedGrade: string;
  soundPercentage: number;
  brokenPercentage: number;
  discoloredPercentage: number;
  foreignMatterPercentage: number;
  moistureRecorded: string;
  modelVersion: string;
  confidence: number;
  verificationUrl: string;
  status: string;
  isPublic: boolean;
  createdAt: string;
}

export interface MarketPrice {
  id: string;
  crop: string;
  variety: string;
  state: string;
  district: string;
  mandi: string;
  minPrice: number;
  maxPrice: number;
  modalPrice: number;
  unit: string;
  priceDate: string;
  gradeReference: string;
  dataSource: string;
  lastUpdated: string;
  isLiveSource: boolean;
}

export interface Listing {
  id: string;
  ownerId: string;
  ownerName: string;
  crop: string;
  variety: string;
  lotIdentifier: string;
  quantityQuintals: number;
  askingPricePerQuintal: number;
  location: string;
  qualityPassportId?: string;
  qualityGrade?: string;
  soundPct?: number;
  status: 'ACTIVE' | 'SOLD' | 'PAUSED';
  contactPhone?: string;
  createdAt: string;
}

export interface BuyerOffer {
  id: string;
  listingId: string;
  buyerId: string;
  buyerName: string;
  offeredPricePerQuintal: number;
  offeredQuantityQuintals: number;
  message: string;
  status: 'PENDING_FARMER_ACCEPTANCE' | 'ACCEPTED' | 'REJECTED';
  createdAt: string;
}

export interface DisputeAction {
  timestamp: string;
  actor: string;
  action: string;
  comment: string;
}

export interface GradeDispute {
  disputeId: string;
  lotIdentifier: string;
  farmerId: string;
  farmerName: string;
  buyerId: string;
  buyerName: string;
  farmerReportId: string;
  buyerReportId: string;
  crop: string;
  mandi: string;
  farmerMeasurements: {
    soundPct: number;
    brokenPct: number;
    foreignMatterPct: number;
    grade: string;
  };
  buyerMeasurements: {
    soundPct: number;
    brokenPct: number;
    foreignMatterPct: number;
    grade: string;
  };
  status: 'SUBMITTED' | 'UNDER_REVIEW' | 'REINSPECTION_REQUESTED' | 'RESOLVED';
  history: DisputeAction[];
  createdAt: string;
}
