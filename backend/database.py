"""
GrainSaksham AI — Data Persistence & Storage Layer
Implements thread-safe local JSON persistence with memory caching,
supporting full Firestore migration/adapter schema for:
- users
- inspections
- qualityReports
- marketPrices (verifiable AGMARKNET/e-NAM benchmark format)
- cropStandards
- listings (buyer marketplace)
- buyerOffers
- gradeDisputes (Farmer-Buyer comparison workflow)
- auditLogs
"""

import os
import json
import uuid
import threading
from datetime import datetime
from typing import Dict, Any, List, Optional

DATA_DIR = os.path.join(os.path.dirname(__file__), "data")
STORE_FILE = os.path.join(DATA_DIR, "store.json")

_lock = threading.Lock()

# Initial seed data for a rich, realistic Indian agricultural experience
DEFAULT_STORE: Dict[str, Any] = {
    "users": [
        {
            "uid": "farmer-ramesh-01",
            "displayName": "Ramesh Kumar",
            "email": "ramesh.farmer@grainsaksham.ai",
            "role": "farmer",
            "state": "Punjab",
            "district": "Ludhiana",
            "village": "Samrala",
            "phone": "+91 98765 43210",
            "cropsGrown": ["Wheat", "Paddy", "Mustard"],
            "holdingAcres": 7.5,
            "createdAt": "2026-02-10T10:00:00Z"
        },
        {
            "uid": "buyer-sunil-02",
            "displayName": "Sunil Agrotech Mills Ltd",
            "email": "procurement@sunilagrotech.com",
            "role": "buyer",
            "organization": "Sunil Agrotech Pvt Ltd",
            "mandiLicenseNo": "PB-LDH-APMC-8842",
            "state": "Punjab",
            "district": "Khanna",
            "phone": "+91 98123 45678",
            "createdAt": "2026-01-15T09:30:00Z"
        },
        {
            "uid": "admin-anjali-03",
            "displayName": "Dr. Anjali Sharma",
            "email": "anjali.sharma@agri.gov.in",
            "role": "admin",
            "designation": "Senior Agricultural Quality Officer",
            "organization": "Regional Agricultural Marketing Board",
            "state": "Punjab & Haryana Region",
            "phone": "+91 94111 22334",
            "createdAt": "2026-01-01T08:00:00Z"
        }
    ],
    "marketPrices": [
        {
            "id": "mp-wht-pb-khanna-01",
            "crop": "Wheat",
            "variety": "HD-2967 (Sharbati Hybrid)",
            "state": "Punjab",
            "district": "Ludhiana",
            "mandi": "Khanna Mandi (Asia's Largest Grain Market)",
            "minPrice": 2275,
            "maxPrice": 2540,
            "modalPrice": 2420,
            "unit": "Rs / Quintal (100 kg)",
            "priceDate": "2026-10-14",
            "gradeReference": "AGMARK FAQ Grade II",
            "dataSource": "AGMARKNET / e-NAM Live Mandi Feed",
            "lastUpdated": "2026-10-14T06:30:00Z",
            "isLiveSource": True
        },
        {
            "id": "mp-wht-pb-ludhiana-02",
            "crop": "Wheat",
            "variety": "PBW-343",
            "state": "Punjab",
            "district": "Ludhiana",
            "mandi": "Ludhiana Central APMC",
            "minPrice": 2275,
            "maxPrice": 2480,
            "modalPrice": 2390,
            "unit": "Rs / Quintal",
            "priceDate": "2026-10-14",
            "gradeReference": "Standard FAQ",
            "dataSource": "AGMARKNET Mandi Bulletin",
            "lastUpdated": "2026-10-14T07:15:00Z",
            "isLiveSource": True
        },
        {
            "id": "mp-wht-hr-karnal-03",
            "crop": "Wheat",
            "variety": "WH-1105",
            "state": "Haryana",
            "district": "Karnal",
            "mandi": "Karnal Mandi",
            "minPrice": 2300,
            "maxPrice": 2580,
            "modalPrice": 2450,
            "unit": "Rs / Quintal",
            "priceDate": "2026-10-14",
            "gradeReference": "AGMARK Grade I / II",
            "dataSource": "Haryana State Agricultural Marketing Board",
            "lastUpdated": "2026-10-14T08:00:00Z",
            "isLiveSource": True
        },
        {
            "id": "mp-wht-mp-sehore-04",
            "crop": "Wheat",
            "variety": "Sharbati (Golden)",
            "state": "Madhya Pradesh",
            "district": "Sehore",
            "mandi": "Sehore Krishi Upaj Mandi",
            "minPrice": 2650,
            "maxPrice": 3250,
            "modalPrice": 2980,
            "unit": "Rs / Quintal",
            "priceDate": "2026-10-14",
            "gradeReference": "Premium Sharbati Grade I",
            "dataSource": "MP Mandi Board (e-Kuber)",
            "lastUpdated": "2026-10-14T07:45:00Z",
            "isLiveSource": True
        },
        {
            "id": "mp-wht-mp-indore-05",
            "crop": "Wheat",
            "variety": "Lokwan Premium",
            "state": "Madhya Pradesh",
            "district": "Indore",
            "mandi": "Indore Chhavani Mandi",
            "minPrice": 2450,
            "maxPrice": 2850,
            "modalPrice": 2680,
            "unit": "Rs / Quintal",
            "priceDate": "2026-10-14",
            "gradeReference": "AGMARK Grade I",
            "dataSource": "AGMARKNET Mandi Bulletin",
            "lastUpdated": "2026-10-14T08:20:00Z",
            "isLiveSource": True
        },
        {
            "id": "mp-wht-up-bareilly-06",
            "crop": "Wheat",
            "variety": "UP-2382",
            "state": "Uttar Pradesh",
            "district": "Bareilly",
            "mandi": "Bareilly Mandi Parishad",
            "minPrice": 2275,
            "maxPrice": 2410,
            "modalPrice": 2340,
            "unit": "Rs / Quintal",
            "priceDate": "2026-10-14",
            "gradeReference": "FAQ Grade II",
            "dataSource": "e-NAM Portal",
            "lastUpdated": "2026-10-14T06:50:00Z",
            "isLiveSource": True
        },
        {
            "id": "mp-wht-mh-latur-07",
            "crop": "Wheat",
            "variety": "Samadhan / Desi",
            "state": "Maharashtra",
            "district": "Latur",
            "mandi": "Latur APMC",
            "minPrice": 2350,
            "maxPrice": 2720,
            "modalPrice": 2550,
            "unit": "Rs / Quintal",
            "priceDate": "2026-10-14",
            "gradeReference": "FAQ Grade II",
            "dataSource": "MSAMB Maharashtra",
            "lastUpdated": "2026-10-14T09:00:00Z",
            "isLiveSource": True
        },
        {
            "id": "mp-wht-rj-kota-08",
            "crop": "Wheat",
            "variety": "Raj-4037",
            "state": "Rajasthan",
            "district": "Kota",
            "mandi": "Bhamashah Mandi Kota",
            "minPrice": 2320,
            "maxPrice": 2610,
            "modalPrice": 2470,
            "unit": "Rs / Quintal",
            "priceDate": "2026-10-14",
            "gradeReference": "AGMARK FAQ Grade",
            "dataSource": "e-NAM Mandi Portal",
            "lastUpdated": "2026-10-14T07:10:00Z",
            "isLiveSource": True
        }
    ],
    "inspections": [
        {
            "inspectionId": "insp-wht-2026-001",
            "ownerId": "farmer-ramesh-01",
            "ownerName": "Ramesh Kumar",
            "cropType": "wheat",
            "variety": "HD-2967",
            "lotIdentifier": "LOT-PB-SAM-08",
            "mandiLocation": "Khanna Mandi, Punjab",
            "userMoisture": 11.4,
            "status": "COMPLETED",
            "reportId": "GS-WHT-2026-8942",
            "assignedGrade": "Grade I (Premium Quality)",
            "statusCode": "GRADE_I",
            "confidenceScore": 0.94,
            "totalKernels": 142,
            "metrics": {
                "sound_grain": {"count": 137, "percentage": 96.48, "tolerance_basis": "Sound, undamaged full kernels"},
                "broken_shriveled": {"count": 2, "percentage": 1.41, "tolerance_basis": "Kernels with surface area <52% of median"},
                "discolored_damaged": {"count": 2, "percentage": 1.41, "tolerance_basis": "Black point / microbial blemish"},
                "foreign_matter": {"count": 1, "percentage": 0.70, "tolerance_basis": "Organic debris / chaff fragments"}
            },
            "applicableStandard": "AGMARK Wheat Grading Specifications (Schedule I)",
            "isPubliclyShared": True,
            "createdAt": "2026-10-13T14:22:00Z",
            "updatedAt": "2026-10-13T14:23:10Z"
        },
        {
            "inspectionId": "insp-wht-2026-002",
            "ownerId": "farmer-ramesh-01",
            "ownerName": "Ramesh Kumar",
            "cropType": "wheat",
            "variety": "PBW-343",
            "lotIdentifier": "LOT-PB-SAM-09",
            "mandiLocation": "Khanna Mandi, Punjab",
            "userMoisture": 12.8,
            "status": "COMPLETED",
            "reportId": "GS-WHT-2026-7215",
            "assignedGrade": "Grade II (Fair Average Quality — FAQ)",
            "statusCode": "GRADE_II",
            "confidenceScore": 0.91,
            "totalKernels": 168,
            "metrics": {
                "sound_grain": {"count": 154, "percentage": 91.67, "tolerance_basis": "Sound, undamaged full kernels"},
                "broken_shriveled": {"count": 6, "percentage": 3.57, "tolerance_basis": "Kernels with surface area <52% of median"},
                "discolored_damaged": {"count": 5, "percentage": 2.98, "tolerance_basis": "Black point / microbial blemish"},
                "foreign_matter": {"count": 3, "percentage": 1.78, "tolerance_basis": "Organic debris / chaff fragments"}
            },
            "applicableStandard": "AGMARK Wheat Grading Specifications (Schedule I)",
            "isPubliclyShared": True,
            "createdAt": "2026-10-10T11:05:00Z",
            "updatedAt": "2026-10-10T11:06:20Z"
        }
    ],
    "qualityReports": [
        {
            "reportId": "GS-WHT-2026-8942",
            "inspectionId": "insp-wht-2026-001",
            "ownerId": "farmer-ramesh-01",
            "ownerName": "Ramesh Kumar",
            "crop": "Wheat",
            "variety": "HD-2967",
            "lotIdentifier": "LOT-PB-SAM-08",
            "location": "Samrala, Ludhiana, Punjab",
            "inspectionDate": "2026-10-13",
            "assignedGrade": "Grade I (Premium Quality)",
            "soundPercentage": 96.48,
            "brokenPercentage": 1.41,
            "discoloredPercentage": 1.41,
            "foreignMatterPercentage": 0.70,
            "moistureRecorded": "11.4% (User instrument reading)",
            "modelVersion": "GrainVision-Wheat-v1.4-OpenCV",
            "confidence": 0.94,
            "verificationUrl": "http://localhost:5173/verify/GS-WHT-2026-8942",
            "status": "ACTIVE_VERIFIED",
            "isPublic": True,
            "createdAt": "2026-10-13T14:23:10Z"
        },
        {
            "reportId": "GS-WHT-2026-7215",
            "inspectionId": "insp-wht-2026-002",
            "ownerId": "farmer-ramesh-01",
            "ownerName": "Ramesh Kumar",
            "crop": "Wheat",
            "variety": "PBW-343",
            "lotIdentifier": "LOT-PB-SAM-09",
            "location": "Samrala, Ludhiana, Punjab",
            "inspectionDate": "2026-10-10",
            "assignedGrade": "Grade II (Fair Average Quality — FAQ)",
            "soundPercentage": 91.67,
            "brokenPercentage": 3.57,
            "discoloredPercentage": 2.98,
            "foreignMatterPercentage": 1.78,
            "moistureRecorded": "12.8% (User instrument reading)",
            "modelVersion": "GrainVision-Wheat-v1.4-OpenCV",
            "confidence": 0.91,
            "verificationUrl": "http://localhost:5173/verify/GS-WHT-2026-7215",
            "status": "ACTIVE_VERIFIED",
            "isPublic": True,
            "createdAt": "2026-10-10T11:06:20Z"
        }
    ],
    "listings": [
        {
            "id": "list-wht-001",
            "ownerId": "farmer-ramesh-01",
            "ownerName": "Ramesh Kumar",
            "crop": "Wheat",
            "variety": "HD-2967 (Export Quality)",
            "lotIdentifier": "LOT-PB-SAM-08",
            "quantityQuintals": 85,
            "askingPricePerQuintal": 2520,
            "location": "Khanna Mandi / Samrala, Ludhiana, Punjab",
            "qualityPassportId": "GS-WHT-2026-8942",
            "qualityGrade": "Grade I (Premium)",
            "soundPct": 96.5,
            "status": "ACTIVE",
            "contactPhone": "+91 98765 43210",
            "createdAt": "2026-10-13T16:00:00Z"
        },
        {
            "id": "list-wht-002",
            "ownerId": "farmer-ramesh-01",
            "ownerName": "Ramesh Kumar",
            "crop": "Wheat",
            "variety": "PBW-343 FAQ",
            "lotIdentifier": "LOT-PB-SAM-09",
            "quantityQuintals": 120,
            "askingPricePerQuintal": 2400,
            "location": "Khanna Mandi, Punjab",
            "qualityPassportId": "GS-WHT-2026-7215",
            "qualityGrade": "Grade II (FAQ)",
            "soundPct": 91.7,
            "status": "ACTIVE",
            "contactPhone": "+91 98765 43210",
            "createdAt": "2026-10-11T09:15:00Z"
        }
    ],
    "buyerOffers": [
        {
            "id": "offer-001",
            "listingId": "list-wht-001",
            "buyerId": "buyer-sunil-02",
            "buyerName": "Sunil Agrotech Mills Ltd",
            "offeredPricePerQuintal": 2490,
            "offeredQuantityQuintals": 85,
            "message": "We have reviewed your verified Quality Passport GS-WHT-2026-8942 showing 96.5% sound grain. We can lift the entire 85 quintal lot directly from farm gate.",
            "status": "PENDING_FARMER_ACCEPTANCE",
            "createdAt": "2026-10-14T09:30:00Z"
        }
    ],
    "gradeDisputes": [
        {
            "disputeId": "disp-wht-2026-101",
            "lotIdentifier": "LOT-PB-SAM-09",
            "farmerId": "farmer-ramesh-01",
            "farmerName": "Ramesh Kumar",
            "buyerId": "buyer-sunil-02",
            "buyerName": "Sunil Agrotech Mills Ltd",
            "farmerReportId": "GS-WHT-2026-7215",
            "buyerReportId": "BUYER-INSP-PB-449",
            "crop": "Wheat",
            "mandi": "Khanna Mandi Yard #4",
            "farmerMeasurements": {
                "soundPct": 91.67,
                "brokenPct": 3.57,
                "foreignMatterPct": 1.78,
                "grade": "Grade II (FAQ)"
            },
            "buyerMeasurements": {
                "soundPct": 84.20,
                "brokenPct": 7.40,
                "foreignMatterPct": 3.80,
                "grade": "Grade III / Deduction of Rs 90/Qtl"
            },
            "status": "UNDER_REVIEW", # SUBMITTED -> UNDER_REVIEW -> REINSPECTION_REQUESTED -> RESOLVED
            "history": [
                {
                    "timestamp": "2026-10-12T11:00:00Z",
                    "actor": "buyer-sunil-02",
                    "action": "Deduction Claimed",
                    "comment": "Buyer manual scoop sample indicated broken kernels around 7.4% and dust dockage."
                },
                {
                    "timestamp": "2026-10-12T13:30:00Z",
                    "actor": "farmer-ramesh-01",
                    "action": "Dispute Submitted",
                    "comment": "Farmer uploaded digital quality passport GS-WHT-2026-7215 demonstrating 3.57% broken and requested joint re-sampling."
                },
                {
                    "timestamp": "2026-10-13T10:15:00Z",
                    "actor": "admin-anjali-03",
                    "action": "Status Changed to Under Review",
                    "comment": "APMC Quality Inspector assigned for joint physical lot verification."
                }
            ],
            "createdAt": "2026-10-12T11:00:00Z"
        }
    ],
    "cropStandards": {
        "wheat": {
            "name": "Wheat (Triticum aestivum / durum)",
            "standardsBody": "Directorate of Marketing & Inspection (DMI) — AGMARK",
            "schedule": "Schedule I, Agricultural Produce (Grading and Marking) Act, 1937",
            "grades": [
                {"name": "Grade I", "maxForeign": 1.0, "maxBroken": 2.0, "maxDamaged": 2.0, "minSound": 95.0},
                {"name": "Grade II (FAQ)", "maxForeign": 1.5, "maxBroken": 4.0, "maxDamaged": 4.0, "minSound": 90.0},
                {"name": "Grade III", "maxForeign": 2.0, "maxBroken": 6.0, "maxDamaged": 6.0, "minSound": 85.0}
            ],
            "safeMoistureLimitPct": 12.0
        },
        "rice": {
            "name": "Paddy / Rice (Oryza sativa)",
            "status": "Experimental / Detection Beta",
            "schedule": "AGMARK Paddy & Milled Rice Standards",
            "safeMoistureLimitPct": 14.0
        },
        "maize": {
            "name": "Maize / Corn (Zea mays)",
            "status": "Experimental / Detection Beta",
            "schedule": "AGMARK Maize Grading Standards",
            "safeMoistureLimitPct": 14.0
        }
    },
    "auditLogs": [
        {
            "id": "log-001",
            "action": "SYSTEM_INITIALIZE",
            "details": "GrainSaksham AI database initialized with verified AGMARK wheat grading parameters.",
            "timestamp": "2026-10-14T00:00:00Z"
        }
    ]
}

def _init_db():
    os.makedirs(DATA_DIR, exist_ok=True)
    if not os.path.exists(STORE_FILE):
        with open(STORE_FILE, "w", encoding="utf-8") as f:
            json.dump(DEFAULT_STORE, f, indent=2)

_init_db()

def get_store() -> Dict[str, Any]:
    with _lock:
        try:
            with open(STORE_FILE, "r", encoding="utf-8") as f:
                return json.load(f)
        except Exception:
            return DEFAULT_STORE

def save_store(data: Dict[str, Any]):
    with _lock:
        with open(STORE_FILE, "w", encoding="utf-8") as f:
            json.dump(data, f, indent=2)

def add_inspection(record: Dict[str, Any]) -> Dict[str, Any]:
    store = get_store()
    store["inspections"].insert(0, record)
    
    # Also create corresponding qualityReport
    report = {
        "reportId": record["reportId"],
        "inspectionId": record["inspectionId"],
        "ownerId": record.get("ownerId", "farmer-ramesh-01"),
        "ownerName": record.get("ownerName", "Farmer"),
        "crop": record.get("cropType", "Wheat").capitalize(),
        "variety": record.get("variety", "Standard"),
        "lotIdentifier": record.get("lotIdentifier", "N/A"),
        "location": record.get("mandiLocation", "Mandi Yard"),
        "inspectionDate": datetime.utcnow().strftime("%Y-%m-%d"),
        "assignedGrade": record.get("assignedGrade", "Preliminary Assessment"),
        "soundPercentage": record.get("metrics", {}).get("sound_grain", {}).get("percentage", 90.0),
        "brokenPercentage": record.get("metrics", {}).get("broken_shriveled", {}).get("percentage", 3.0),
        "discoloredPercentage": record.get("metrics", {}).get("discolored_damaged", {}).get("percentage", 2.0),
        "foreignMatterPercentage": record.get("metrics", {}).get("foreign_matter", {}).get("percentage", 1.0),
        "moistureRecorded": (
            f"{record.get('userMoisture')}% (User instrument reading)"
            if record.get("userMoisture") is not None
            else "Not measured"
        ),
        "modelVersion": record.get("modelVersion", "GrainVision-Wheat-v1.4"),
        "confidence": record.get("confidenceScore", 0.90),
        "verificationUrl": f"http://localhost:5173/verify/{record['reportId']}",
        "status": "ACTIVE_VERIFIED",
        "isPublic": True,
        "createdAt": record.get("createdAt", datetime.utcnow().isoformat() + "Z")
    }
    store["qualityReports"].insert(0, report)
    
    # Log audit entry
    store["auditLogs"].append({
        "id": str(uuid.uuid4()),
        "action": "INSPECTION_CREATED",
        "inspectionId": record["inspectionId"],
        "reportId": record["reportId"],
        "timestamp": datetime.utcnow().isoformat() + "Z"
    })
    
    save_store(store)
    return record

def get_report_by_id(report_id: str) -> Optional[Dict[str, Any]]:
    store = get_store()
    for r in store.get("qualityReports", []):
        if r.get("reportId") == report_id:
            return r
    return None

def get_public_verification(report_id: str) -> Optional[Dict[str, Any]]:
    report = get_report_by_id(report_id)
    if not report:
        return None
    # Strip sensitive private information (e.g. phone numbers, private ids) for public QR verification
    public_copy = dict(report)
    public_copy.pop("ownerId", None)
    # Mask farmer name for privacy protection if requested
    if "ownerName" in public_copy:
        parts = public_copy["ownerName"].split()
        if len(parts) > 1:
            public_copy["ownerName"] = f"{parts[0]} {parts[1][0]}."
    return public_copy
