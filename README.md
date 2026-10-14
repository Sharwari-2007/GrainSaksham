# GrainSaksham AI — AI-Powered Grain Quality Inspection & Fair-Price Assistance Platform
> **AI Hackathon 2026 Entry — AI in Agriculture & Rural Development**  
> **Tagline:** *“Know Your Grain. Prove Its Quality. Get a Fairer Price.”*

---

## 🌾 1. Project Vision & Executive Summary

In Indian agricultural mandis (APMC markets), farmers routinely experience arbitrary price deductions (often called *Karda* or dockage) ranging from **5% to 15%** of their gross crop value. Traditional quality estimation relies almost entirely on subjective, visual scoop sampling by traders. Because individual farmers have had no accessible, quantifiable proof of their harvest quality, they are forced to accept distress prices.

**GrainSaksham AI** levels the negotiation field by turning visible grain quality into **verifiable, explainable digital evidence**. Using accessible smartphones:
1. **Farmers photograph a representative sample** of harvested grain spread on a clean white surface.
2. **Computer Vision (OpenCV + Morphology)** segments individual kernels, isolates broken/shriveled kernels, detects discolored and blemished seeds, and identifies extraneous foreign matter.
3. **The AGMARK Grading Engine** evaluates the sample against the official Directorate of Marketing & Inspection (DMI) Schedule I Wheat Grading Standards.
4. **A Tamper-Evident Digital Quality Passport** is generated with a cryptographic QR code, downloadable PDF, and a public verification link with farmer privacy protection.
5. **A Fair-Price Assistant** cross-references official AGMARKNET and e-NAM benchmark prices across mandis, calculating estimated net realizations after transport costs.
6. **A Farmer–Buyer Dispute Comparison Module** arbitrates grade discrepancies through a transparent, 4-step status workflow with audit trails.
7. **An AI Quality Improvement Coach** provides scientific post-harvest agronomic advice (thresher rpm calibration, mesh screening, safe drying) with regional voice readouts (English, Hindi, Marathi).

---

## 🛠️ 2. Technology Stack Architecture

| Layer | Technologies Used | Description |
|---|---|---|
| **Frontend** | React 19, Vite, TypeScript | High-performance, mobile-first responsive single-page application |
| **Styling** | Tailwind CSS 3.4 | Curated agricultural color palette (deep forest greens, golden harvest amber, warm cream) |
| **Icons & Charts** | Lucide React, Recharts | Accessible icons and interactive price trend visualizations |
| **Certificates & QR** | QRCode.react, jsPDF, html2canvas | Client-side QR generation and vector/canvas PDF certificate export |
| **Accessibility** | Web Speech API | Native speech synthesis in English, Hindi (`hi-IN`), and Marathi (`mr-IN`) |
| **Backend API** | Python 3.13, FastAPI, Uvicorn | High-throughput REST API with CORS, multipart uploads, and error sanitization |
| **Computer Vision Engine** | OpenCV 4.x, NumPy, Pillow | Laplacian sharpness validation, CLAHE contrast tuning, Otsu segmentation, HSV color space defect classification |
| **Persistence Layer** | Thread-Safe Local JSON Store | In-memory cache + persistent JSON backing with Firestore adapter interfaces |
| **Offline Resilience** | LocalStorage Draft Queue | Queues inspection drafts locally when connectivity drops, with 1-click sync |

---

## 🚀 3. Quickstart & Installation Guide

### Prerequisites
- **Node.js**: v20.x or higher
- **Python**: v3.11 or higher

### Step 1: Clone or Navigate to Repository
```bash
cd Quality_Of_Crop
```

### Step 2: Backend Setup
```bash
# 1. Create and activate virtual environment
python -m venv .venv

# On Windows PowerShell:
.\.venv\Scripts\Activate.ps1
# On Linux/macOS:
source .venv/bin/activate

# 2. Install backend dependencies
pip install -r requirements.txt

# 3. Start the FastAPI server
cd backend
python -m uvicorn main:app --host 127.0.0.1 --port 8000 --reload
```
*The backend API will be available at:* `http://127.0.0.1:8000/api`  
*Interactive Swagger Documentation:* `http://127.0.0.1:8000/docs`

### Step 3: Frontend Setup
Open a new terminal window:
```bash
cd Quality_Of_Crop/frontend

# 1. Install frontend packages
npm install

# 2. Launch Vite Development Server
npm run dev
```
*Open your browser at:* `http://127.0.0.1:5173/`

---

## 🔬 4. Computer Vision Inspection & AGMARK Grading Workflow

### 1. Image Quality Validation
Before model execution, the input image undergoes a strict pre-flight check:
- **Sharpness Check**: Calculates the variance of the Laplacian filter:
  $$\text{Var}(\nabla^2 I) < 35.0 \implies \text{Flagged as Blurry}$$
- **Illumination Check**: Analyzes mean grayscale luminance. Images under 40 (dim) or over 235 (flash glare) are flagged with actionable photography guidance.

### 2. Grain Kernel Segmentation
- **CLAHE Enhancement**: Standardizes contrast variations across diverse phone cameras.
- **Binarization**: Otsu thresholding with background polarity auto-detection separates kernels from white or dark backdrops.
- **Morphology**: Morphological opening ($3 \times 3$ ellipse) separates touching grains and cleans dust noise.

### 3. Defect Classification Criteria
- **Foreign Matter**: Area $> 3.2 \times \text{median area}$ or aspect ratio $> 3.8$ (e.g. chaff, straw pieces).
- **Broken / Shriveled**: Surface area $< 52\%$ of median kernel area or sharp fractured cleavage.
- **Discolored / Damaged**: Abnormally dark luminance or high HSV saturation deviation (indicative of fungal black point or rain damage).
- **Sound Grain**: Normal elliptical aspect ratio, uniform golden amber hue, intact pericarp.

### 4. AGMARK Wheat Standards (DMI Schedule I)
| Grade Tier | Broken Kernels Max | Discolored Max | Foreign Matter Max | Sound Grain Min |
|---|---|---|---|---|
| **Grade I (Premium)** | $\le 2.0\%$ | $\le 2.0\%$ | $\le 1.0\%$ | $\ge 95.0\%$ |
| **Grade II (FAQ)** | $\le 4.0\%$ | $\le 4.0\%$ | $\le 1.5\%$ | $\ge 90.0\%$ |
| **Grade III (Industrial)** | $\le 6.0\%$ | $\le 6.0\%$ | $\le 2.0\%$ | $\ge 85.0\%$ |
| **Needs Cleaning** | $> 6.0\%$ | $> 6.0\%$ | $> 2.0\%$ | $< 85.0\%$ |

---

## 🛡️ 5. Authentication, Roles & Data Privacy

### Role-Based Access Control (RBAC)
- **👨‍🌾 Farmer (Ramesh Kumar)**: Upload grain photos, view explainable assessments, generate/download digital quality passports, compare mandi rates, create marketplace listings, file dockage disputes.
- **🏢 Buyer / Trader (Sunil Agrotech Mills)**: Browse verified grain listings, review linked passports, submit commercial purchase offers, submit mandi dockage assessments for joint arbitration.
- **🏛️ Administrator (Dr. Anjali Sharma)**: Senior Agricultural Quality Inspector. Calibrate AGMARK tolerance thresholds, review active dispute cases, monitor CV model confidence telemetry, audit user roles.
*(Security Rule: Non-administrators cannot grant themselves admin rights through client-side profile mutations).*

### Privacy Protection
When an inspection is verified via public QR code (`/#verify/:id`), the system **redacts the farmer's personal telephone number and exact coordinates**, showing only verified grain parameters, lot identifier, and digital seal.

---

## 🌐 6. Multilingual Accessibility & Voice Synthesis

GrainSaksham AI provides complete localization across three major Indian agricultural languages:
- **English (EN)**
- **हिंदी (Hindi - HI)**
- **मराठी (Marathi - MR)**

### Built-In Text-to-Speech (TTS)
For rural farmers who prefer auditory communication, clicking **“Listen (बोलकर सुनें)”** invokes the browser's native `window.speechSynthesis` engine with language-specific voice tags (`hi-IN`, `mr-IN`, `en-IN`), reading out the assigned grade, sound grain ratio, and agronomic coaching advice.

---

## 📊 7. REST API Endpoints Overview

| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/api/health` | Health status and CV engine telemetry |
| `POST` | `/api/inspections/analyze` | Multipart image upload and computer vision grain analysis |
| `GET` | `/api/inspections` | Retrieve inspection history (filterable by owner) |
| `GET` | `/api/inspections/{id}` | Detailed inspection record with detections and bounding boxes |
| `GET` | `/api/reports/{id}` | Full Digital Quality Passport details |
| `GET` | `/api/reports/{id}/verify` | Public QR verification endpoint with privacy masking |
| `GET` | `/api/market-prices` | Mandi modal prices (filterable by crop, state, district) |
| `GET` | `/api/listings` | Active produce marketplace listings |
| `POST` | `/api/listings` | Create new verified produce listing |
| `GET` | `/api/offers` | Retrieve buyer purchase offers |
| `POST` | `/api/offers` | Submit new buyer purchase offer |
| `GET` | `/api/disputes` | Retrieve active grade dispute records |
| `POST` | `/api/disputes/{id}/status` | Update dispute status and post comment audit entries |
| `GET` | `/api/analytics` | Aggregated grade distributions and defect averages |

---

## ⚖️ 8. Statutory Disclaimer

*NOTICE: GrainSaksham AI provides preliminary computer-vision grain quality intelligence designed to assist Indian farmers during price negotiations. Assessments are estimates of visible exterior characteristics (broken kernels, discoloration, foreign matter) and do not supersede statutory laboratory assaying certificates issued by government-notified laboratories under the Agricultural Produce (Grading and Marking) Act, 1937 or FSSAI regulations.*
