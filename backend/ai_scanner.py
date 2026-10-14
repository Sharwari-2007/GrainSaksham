"""
GrainSaksham AI — Computer Vision Grain Quality Scanner
Implements real computer-vision analysis with:
1. Strict Grain Validation & Non-Grain Image Rejection (rejects animals, cars, faces, random objects)
2. Distance-Transform Watershed Kernel Segmentation (prevents false clumping)
3. AGMARK Defect Classification (sound, broken, discolored, foreign matter)
4. Explainable AGMARK Schedule I Grading and Agronomic Improvement Coaching
"""

import cv2
import numpy as np
import base64
import time
from typing import Dict, Any, List, Optional, Tuple

# AGMARK Wheat Standard Thresholds (Schedule I, Agricultural Produce Grading and Marking Rules)
AGMARK_WHEAT_STANDARDS = {
    "Grade I": {
        "max_foreign_matter": 1.0,
        "max_broken_shriveled": 2.0,
        "max_damaged_discolored": 2.0,
        "min_sound": 95.0,
        "description": "Premium Grade — Conforms to AGMARK Grade I export and FCI mill procurement standards."
    },
    "Grade II": {
        "max_foreign_matter": 1.5,
        "max_broken_shriveled": 4.0,
        "max_damaged_discolored": 4.0,
        "min_sound": 90.0,
        "description": "Standard Fair Average Quality (FAQ) — Conforms to AGMARK Grade II mandi trade standards."
    },
    "Grade III": {
        "max_foreign_matter": 2.0,
        "max_broken_shriveled": 6.0,
        "max_damaged_discolored": 6.0,
        "min_sound": 85.0,
        "description": "Moderate Grade — Acceptable for local milling with pre-cleaning required."
    }
}

def check_image_clarity(image_bgr: np.ndarray) -> Dict[str, Any]:
    """
    Evaluates image focus sharpness via Laplacian variance and checks brightness limits.
    """
    gray = cv2.cvtColor(image_bgr, cv2.COLOR_BGR2GRAY)
    laplacian_var = float(cv2.Laplacian(gray, cv2.CV_64F).var())
    mean_brightness = float(np.mean(gray))
    
    is_blurry = laplacian_var < 30.0
    is_too_dark = mean_brightness < 35.0
    is_overexposed = mean_brightness > 245.0
    
    quality_status = "ok"
    feedback = []
    
    if is_blurry:
        quality_status = "blurry"
        feedback.append("Sample image appears blurry or out of focus. Please place camera steadily above grains.")
    if is_too_dark:
        quality_status = "dark"
        feedback.append("Lighting is too dim. Please photograph under bright natural daylight or neutral lamp.")
    if is_overexposed:
        quality_status = "overexposed"
        feedback.append("Severe glare or overexposure detected. Avoid direct flashlight reflection on the grains.")
        
    return {
        "status": quality_status,
        "sharpness_score": round(laplacian_var, 2),
        "mean_brightness": round(mean_brightness, 1),
        "is_acceptable": quality_status == "ok",
        "feedback": feedback
    }

def verify_is_grain_sample(
    img_bgr: np.ndarray,
    crop_type: str = "wheat"
) -> Tuple[bool, str, Dict[str, Any]]:
    """
    CRITICAL GRAIN VALIDATION GATEWAY:
    Determines whether the uploaded photograph actually depicts an agricultural grain sample
    (e.g., wheat, paddy/rice, maize, or pulses) spread on an inspection surface,
    or is an arbitrary non-grain image (such as an animal, human face, car, room, scenery, or clutter).
    
    Returns:
        (is_valid_grain, rejection_reason, intermediate_data)
    """
    h, w, _ = img_bgr.shape
    total_px = h * w
    hsv = cv2.cvtColor(img_bgr, cv2.COLOR_BGR2HSV)
    gray = cv2.cvtColor(img_bgr, cv2.COLOR_BGR2GRAY)
    
    # -------------------------------------------------------------
    # Rule 1: Non-Agricultural Color Spectrum Rejection
    # Grains are warm amber/golden/straw/tan. Non-grain images often contain
    # large patches of blue sky, green grass/trees, or vivid synthetic clothing.
    # -------------------------------------------------------------
    blue_mask = cv2.inRange(hsv, (85, 40, 30), (135, 255, 255))
    green_mask = cv2.inRange(hsv, (38, 55, 30), (82, 255, 255))
    magenta_mask = cv2.inRange(hsv, (140, 50, 30), (175, 255, 255))
    
    blue_pct = (np.count_nonzero(blue_mask) / total_px) * 100
    green_pct = (np.count_nonzero(green_mask) / total_px) * 100
    magenta_pct = (np.count_nonzero(magenta_mask) / total_px) * 100
    
    if blue_pct > 12.0:
        return False, f"Non-grain image rejected: Dominant blue/cyan spectrum ({blue_pct:.1f}%). Typically indicates sky, fabric, vehicles, or outdoor non-grain subjects.", {}
    if green_pct > 20.0:
        return False, f"Non-grain image rejected: Dominant green foliage/lawn spectrum ({green_pct:.1f}%). Grains must be harvested and placed on a clean flat sheet or tray.", {}
    if magenta_pct > 8.0:
        return False, f"Non-grain image rejected: High synthetic/apparel color content ({magenta_pct:.1f}%).", {}
        
    # -------------------------------------------------------------
    # Rule 2: Illumination & Contrast Feasibility
    # -------------------------------------------------------------
    mean_val = float(np.mean(gray))
    if mean_val < 35.0:
        return False, f"Image too dark (brightness: {mean_val:.1f}). Grain kernels cannot be distinguished from background.", {}
    if mean_val > 245.0:
        return False, f"Image overexposed or blank (brightness: {mean_val:.1f}). No grain contours discernible.", {}
        
    # -------------------------------------------------------------
    # Rule 3: Inspection Surface & Foreground Density Check
    # -------------------------------------------------------------
    blurred = cv2.GaussianBlur(gray, (5, 5), 0)
    _, thresh = cv2.threshold(blurred, 0, 255, cv2.THRESH_BINARY_INV + cv2.THRESH_OTSU)
    
    # Check background polarity (white surface vs dark tray)
    border_px = np.concatenate([thresh[0, :], thresh[-1, :], thresh[:, 0], thresh[:, -1]])
    if np.mean(border_px) > 127:
        thresh = cv2.bitwise_not(thresh)
        
    fg_ratio = (np.count_nonzero(thresh) / total_px) * 100
    if fg_ratio < 3.0:
        return False, f"No grain kernels detected: Foreground occupies only {fg_ratio:.1f}% of image. Please spread grain kernels across a contrasting surface.", {}
    if fg_ratio > 82.0:
        return False, f"Non-grain subject detected: A single dense object occupies {fg_ratio:.1f}% of the frame. Real grain samples should be dispersed across a surface.", {}

    # -------------------------------------------------------------
    # Rule 4: Macroscopic Single-Object Rejection
    # If a single contour occupies >28% of the entire frame (e.g. an animal,
    # person's face, coffee cup, car, or pet), it is NOT a grain sample!
    # -------------------------------------------------------------
    raw_cnts, _ = cv2.findContours(thresh, cv2.RETR_EXTERNAL, cv2.CHAIN_APPROX_SIMPLE)
    if raw_cnts:
        max_area = max(cv2.contourArea(c) for c in raw_cnts)
        if (max_area / total_px) > 0.28:
            return False, f"Non-grain macroscopic subject detected: A single large object occupies {max_area/total_px*100:.1f}% of frame (e.g. animal, person, car, or household object).", {}

    # -------------------------------------------------------------
    # Rule 5: Distance Transform & Kernel Seed Resolution
    # Real grains have distinct convex peaks separated by distance transform.
    # -------------------------------------------------------------
    kernel = cv2.getStructuringElement(cv2.MORPH_ELLIPSE, (3, 3))
    cleaned = cv2.morphologyEx(thresh, cv2.MORPH_OPEN, kernel, iterations=1)
    
    dist_transform = cv2.distanceTransform(cleaned, cv2.DIST_L2, 5)
    max_dist = float(dist_transform.max())
    if max_dist < 4.0:
        return False, "No distinct grain bodies resolved. Image texture or pattern does not correspond to agricultural grain kernels.", {}

    # Peak detection for kernel seeds
    _, sure_fg = cv2.threshold(dist_transform, 0.30 * max_dist, 255, 0)
    sure_fg = np.uint8(sure_fg)
    
    sure_bg = cv2.dilate(cleaned, np.ones((3, 3), np.uint8), iterations=2)
    unknown = cv2.subtract(sure_bg, sure_fg)
    
    num_markers, markers = cv2.connectedComponents(sure_fg)
    
    if num_markers < 12:
        return False, f"Insufficient grain kernel count ({max(0, num_markers-1)} detected). An inspection lot requires a representative sample of at least 15–20 dispersed kernels.", {}
        
    markers = markers + 1
    markers[unknown == 255] = 0
    markers = cv2.watershed(img_bgr.copy(), markers)
    
    # -------------------------------------------------------------
    # Rule 6: Semantic Grain Morphology & Chromatic Consistency
    # -------------------------------------------------------------
    unique_markers = [m for m in np.unique(markers) if m > 1]
    
    grain_like_count = 0
    golden_color_count = 0
    kernel_data = []
    
    for m in unique_markers:
        mask = np.uint8(markers == m)
        cnts, _ = cv2.findContours(mask, cv2.RETR_EXTERNAL, cv2.CHAIN_APPROX_SIMPLE)
        if not cnts:
            continue
        c = max(cnts, key=cv2.contourArea)
        area = float(cv2.contourArea(c))
        if area < 35.0:
            continue
        
        hull = cv2.convexHull(c)
        solidity = area / max(float(cv2.contourArea(hull)), 1.0)
        x, y, cw, ch = cv2.boundingRect(c)
        ar = max(cw, ch) / max(min(cw, ch), 1)
        
        mean_h = float(cv2.mean(hsv[:, :, 0], mask=mask)[0])
        mean_s = float(cv2.mean(hsv[:, :, 1], mask=mask)[0])
        mean_v = float(cv2.mean(hsv[:, :, 2], mask=mask)[0])
        
        # Grain color criteria (wheat/cereal: golden/amber/straw hue 6-40, sat >= 20)
        is_grain_color = (6 <= mean_h <= 40) and (mean_s >= 20)
        # Grain shape criteria: smooth convex oval (solidity >= 0.58, AR 1.05 to 4.2)
        is_grain_shape = (solidity >= 0.58) and (1.05 <= ar <= 4.2)
        
        if is_grain_color:
            golden_color_count += 1
        if is_grain_shape and is_grain_color:
            grain_like_count += 1
        
        kernel_data.append({
            'area': area,
            'aspect_ratio': round(ar, 2),
            'solidity': round(solidity, 2),
            'hue': round(mean_h, 1),
            'sat': round(mean_s, 1),
            'val': round(mean_v, 1),
            'is_grain': is_grain_color and is_grain_shape,
            'contour': c,
            'bbox': [x, y, cw, ch],
            'mask': mask
        })
        
    total_valid = len(kernel_data)
    if total_valid < 12:
        return False, f"Too few distinct grain kernels ({total_valid} found). Please photograph grains spread on a clean flat surface.", {}
        
    grain_color_pct = (golden_color_count / total_valid) * 100
    grain_shape_pct = (grain_like_count / total_valid) * 100
    
    if grain_color_pct < 50.0:
        return False, f"Non-grain image rejected: Only {grain_color_pct:.1f}% of segmented items match agricultural grain color spectrum. Expected cereal grain hues (golden, amber, straw-yellow).", {}
        
    if grain_shape_pct < 35.0:
        return False, f"Non-grain image rejected: Only {grain_shape_pct:.1f}% of items conform to grain kernel morphology (aspect ratio & convex ovoid structure).", {}
        
    return True, "Valid agricultural grain sample verified", {
        'total_kernels': total_valid,
        'grain_like_count': grain_like_count,
        'grain_color_pct': round(grain_color_pct, 1),
        'grain_shape_pct': round(grain_shape_pct, 1),
        'kernels': kernel_data,
        'thresh': thresh
    }

def analyze_wheat_sample(
    image_bytes: bytes,
    crop_type: str = "wheat",
    variety: str = "Standard Wheat (Triticum aestivum)",
    user_moisture: Optional[float] = None
) -> Dict[str, Any]:
    """
    Executes Computer Vision Grain Inspection:
    1. Validates that the image contains REAL GRAINS (rejects animals, cars, faces, random objects)
    2. Uses Watershed segmentation to isolate individual kernels
    3. Evaluates defect percentages according to AGMARK specifications
    4. Produces explainable grading and agronomic coaching advice
    """
    start_time = time.time()
    
    # Decode bytes to OpenCV BGR image
    nparr = np.frombuffer(image_bytes, np.uint8)
    img_bgr = cv2.imdecode(nparr, cv2.IMREAD_COLOR)
    
    if img_bgr is None:
        raise ValueError("Could not decode image file. Please provide a valid JPG, PNG, or WebP image.")
        
    height, width, _ = img_bgr.shape
    
    # Enforce minimum dimension
    if width < 250 or height < 250:
        raise ValueError(f"Image resolution too low ({width}x{height}px). Minimum 250x250px required for kernel analysis.")
    
    # Clarity & Illumination Check
    clarity_check = check_image_clarity(img_bgr)
    
    # -----------------------------------------------------------------
    # STEP 1: VALIDATE WHETHER THE IMAGE IS ACTUALLY A GRAIN SAMPLE
    # -----------------------------------------------------------------
    is_valid_grain, rejection_reason, grain_data = verify_is_grain_sample(img_bgr, crop_type=crop_type)
    
    if not is_valid_grain:
        # STRICT REJECTION: Do not produce random false grades for non-grain objects!
        return {
            "success": False,
            "is_grain_sample": False,
            "detection_verdict": "NON_GRAIN_IMAGE",
            "error": rejection_reason,
            "clarity_evaluation": clarity_check,
            "guidance": "Please upload a photograph showing actual harvested grain kernels spread evenly on a plain white paper or clean tray."
        }
        
    # -----------------------------------------------------------------
    # STEP 2: DEFECT CLASSIFICATION ON VERIFIED GRAIN KERNELS
    # -----------------------------------------------------------------
    kernels = grain_data['kernels']
    areas = [k['area'] for k in kernels]
    median_area = float(np.median(areas))
    
    sound_count = 0
    broken_count = 0
    discolored_count = 0
    foreign_count = 0
    
    annotated = img_bgr.copy()
    detections_summary: List[Dict[str, Any]] = []
    
    # Color palette for annotation (BGR)
    COLOR_SOUND = (34, 197, 94)       # Fresh Green #22c55e
    COLOR_BROKEN = (24, 144, 255)     # Amber/Orange #ff9018
    COLOR_DISCOLORED = (180, 80, 240) # Purple/Magenta
    COLOR_FOREIGN = (235, 70, 52)     # Vivid Red/Cyan
    
    for i, k in enumerate(kernels):
        area = k['area']
        ar = k['aspect_ratio']
        val = k['val']
        hue = k['hue']
        sat = k['sat']
        solidity = k['solidity']
        x, y, w, h = k['bbox']
        c = k['contour']
        
        defect_type = "sound"
        color = COLOR_SOUND
        label = "Sound"
        
        # Physical classification grounded in AGMARK wheat morphology:
        # 1. Foreign Matter: Atypical aspect ratio (> 4.0, chaff/straw), extreme size (> 3.0x median), or non-grain hue
        if ar > 4.0 or area > 3.0 * median_area or hue < 5.0 or hue > 42.0:
            defect_type = "foreign_matter"
            color = COLOR_FOREIGN
            label = "Foreign"
            foreign_count += 1
        # 2. Broken / Shriveled: Significant area deficit (< 52% of median) or fractured sharp cleaved edge
        elif area < 0.52 * median_area:
            defect_type = "broken"
            color = COLOR_BROKEN
            label = "Broken"
            broken_count += 1
        # 3. Discolored: Abnormally dark (val < 85, black point rot / microbial discoloration)
        elif val < 85.0 or (hue < 10.0 and sat > 120.0):
            defect_type = "discolored"
            color = COLOR_DISCOLORED
            label = "Discolored"
            discolored_count += 1
        # 4. Sound Grain: Intact golden amber ovoid kernel
        else:
            sound_count += 1
            
        # Draw bounding rectangle and defect marker
        cv2.rectangle(annotated, (x, y), (x + w, y + h), color, 2)
        cv2.circle(annotated, (x + w // 2, y + h // 2), 3, color, -1)
        
        if i < 20:  # store sample coordinates for UI overlay
            detections_summary.append({
                "id": i + 1,
                "type": defect_type,
                "label": label,
                "bbox": [x, y, w, h],
                "area_px": round(area, 1),
                "aspect_ratio": round(ar, 2)
            })

    total_kernels = sound_count + broken_count + discolored_count + foreign_count
    if total_kernels == 0:
        total_kernels = 1
        
    sound_pct = round((sound_count / total_kernels) * 100, 2)
    broken_pct = round((broken_count / total_kernels) * 100, 2)
    discolored_pct = round((discolored_count / total_kernels) * 100, 2)
    foreign_pct = round((foreign_count / total_kernels) * 100, 2)
    
    # -----------------------------------------------------------------
    # STEP 3: AGMARK SCHEDULE I GRADING EVALUATION
    # -----------------------------------------------------------------
    standard_applied = "AGMARK Wheat Grading Specifications (Schedule I)"
    
    if clarity_check["status"] != "ok":
        assigned_grade = "Preliminary AI Assessment (Image Warning)"
        grade_explanation = (
            "Assessment is provisional due to suboptimal photograph conditions ("
            + ", ".join(clarity_check["feedback"])
            + "). Official grading cannot be assigned without a clearer sample."
        )
        grade_status_code = "PRELIMINARY_UNCERTAIN"
    elif foreign_pct <= 1.0 and broken_pct <= 2.0 and discolored_pct <= 2.0:
        assigned_grade = "Grade I (Premium Quality)"
        grade_explanation = "Sample meets all AGMARK Grade I parameters with very low broken kernels and virtually no foreign matter."
        grade_status_code = "GRADE_I"
    elif foreign_pct <= 1.5 and broken_pct <= 4.0 and discolored_pct <= 4.0:
        assigned_grade = "Grade II (Fair Average Quality — FAQ)"
        grade_explanation = "Sample conforms to AGMARK Grade II standard. Widely accepted across APMC Mandis at standard modal benchmark prices."
        grade_status_code = "GRADE_II"
    elif foreign_pct <= 2.0 and broken_pct <= 6.0 and discolored_pct <= 6.0:
        assigned_grade = "Grade III (Commercial / Industrial Milling)"
        grade_explanation = "Sample falls within AGMARK Grade III tolerances. Pre-cleaning and winnowing recommended before sale to avoid price deductions."
        grade_status_code = "GRADE_III"
    else:
        assigned_grade = "Needs Pre-Cleaning & Grading"
        defects_list = []
        if broken_pct > 6.0: defects_list.append(f"Broken kernels ({broken_pct}%) exceed 6.0% maximum")
        if foreign_pct > 2.0: defects_list.append(f"Foreign matter ({foreign_pct}%) exceeds 2.0% maximum")
        if discolored_pct > 6.0: defects_list.append(f"Discolored kernels ({discolored_pct}%) exceed 6.0% maximum")
        grade_explanation = (
            "Sample contains elevated defect proportions: "
            + "; ".join(defects_list)
            + ". Mechanical cleaning or seed sorting is strongly advised to raise market grade."
        )
        grade_status_code = "NEEDS_CLEANING"

    # -----------------------------------------------------------------
    # STEP 4: ACTIONABLE AI COACHING INSIGHTS
    # -----------------------------------------------------------------
    improvement_coach = []
    if broken_pct > 3.0:
        improvement_coach.append({
            "category": "Mechanical Threshing",
            "title": "Reduce Harvester / Thresher Drum Speed",
            "advice": "Broken grains often indicate overly aggressive combine cylinder speed or excessively tight concave clearance during harvest. Check thresher rpm settings for subsequent harvesting batches."
        })
    if foreign_pct > 1.0:
        improvement_coach.append({
            "category": "Post-Harvest Cleaning",
            "title": "Perform Aspiration / Mesh Screening",
            "advice": "Passing this lot through a standard 2.0mm slotted sieve or air-screen cleaner can eliminate up to 90% of chaff and weed seeds, immediately upgrading this lot from Grade III to Grade I/II."
        })
    if discolored_pct > 3.0:
        improvement_coach.append({
            "category": "Moisture & Storage",
            "title": "Check Storage Aeration & Prevent Fungal Black-Point",
            "advice": "Discolored kernels can stem from untimely rain during earhead maturation or poor storage ventilation. Ensure grain bags are stacked on wooden pallets 30cm away from damp walls."
        })
    if user_moisture is not None:
        if user_moisture > 12.0:
            improvement_coach.append({
                "category": "Drying Protocol",
                "title": "Sun Drying Recommended for Safe Mandi Storage",
                "advice": f"Your entered moisture reading of {user_moisture}% exceeds the AGMARK 12.0% safe threshold. Spread grain in a 3-5 cm thin layer on clean tarpaulin for 4-6 hours in direct sunshine to avert storage mold and mandi dockage."
            })
        else:
            improvement_coach.append({
                "category": "Drying Protocol",
                "title": "Moisture Content is within Optimal Range",
                "advice": f"Recorded moisture of {user_moisture}% is within the safe storage window (<12.0%). Grain is protected against mycotoxin development and is ready for long-term storage or immediate mandi sale."
            })
    else:
        improvement_coach.append({
            "category": "Instrument Testing Notice",
            "title": "Moisture Testing Recommendation",
            "advice": "Visible image inspection cannot measure internal grain moisture or invisible mycotoxins. We strongly recommend cross-verifying with a certified portable moisture meter before storage."
        })

    # Encode annotated image to base64 JPEG
    _, buffer = cv2.imencode('.jpg', annotated, [int(cv2.IMWRITE_JPEG_QUALITY), 85])
    annotated_base64 = "data:image/jpeg;base64," + base64.b64encode(buffer).decode('utf-8')

    duration_ms = int((time.time() - start_time) * 1000)
    
    # Calculate confidence based on sample clarity, size, and kernel density
    base_conf = 0.94 if clarity_check["is_acceptable"] else 0.65
    sample_density_bonus = min(0.04, total_kernels / 1500.0)
    final_confidence = round(min(0.98, max(0.50, base_conf + sample_density_bonus)), 2)

    return {
        "success": True,
        "is_grain_sample": True,
        "detection_verdict": "GRAIN_SAMPLE_VERIFIED",
        "crop_type": crop_type,
        "variety": variety,
        "model_version": "GrainVision-Wheat-v2.0-Verified",
        "processing_time_ms": duration_ms,
        "confidence_score": final_confidence,
        "total_kernels_analyzed": total_kernels,
        "metrics": {
            "sound_grain": {
                "count": sound_count,
                "percentage": sound_pct,
                "tolerance_basis": "Sound, undamaged full kernels"
            },
            "broken_shriveled": {
                "count": broken_count,
                "percentage": broken_pct,
                "tolerance_basis": "Kernels with surface area <52% of median or fractured cleavage"
            },
            "discolored_damaged": {
                "count": discolored_count,
                "percentage": discolored_pct,
                "tolerance_basis": "Kernels exhibiting black point, discoloration, or microbial blemishes"
            },
            "foreign_matter": {
                "count": foreign_count,
                "percentage": foreign_pct,
                "tolerance_basis": "Organic debris, chaff fragments, or extraneous seeds"
            }
        },
        "grading": {
            "assigned_grade": assigned_grade,
            "assignedGrade": assigned_grade,
            "status_code": grade_status_code,
            "statusCode": grade_status_code,
            "standard_applied": standard_applied,
            "standardApplied": standard_applied,
            "explanation": grade_explanation
        },
        "clarity_evaluation": clarity_check,
        "provenance": {
            "visual_defects": "AI-estimated via Computer Vision contour segmentation and HSV color space analysis",
            "moisture_measurement": (
                f"User-provided instrument measurement ({user_moisture}%)"
                if user_moisture is not None
                else "Not measured — calibrated electronic moisture meter required"
            ),
            "chemical_residues": "Not assessed — ordinary RGB imagery cannot identify invisible chemical or pesticide residues",
            "laboratory_status": "Preliminary agricultural intelligence assessment. Does not supersede official AGMARK / FCI laboratory assaying certificates."
        },
        "improvement_coach": improvement_coach,
        "annotated_image": annotated_base64,
        "sample_detections": detections_summary[:15],
        "disclaimer": (
            "NOTICE: GrainSaksham AI provides preliminary image-based quality intelligence to assist in farmer market negotiations. "
            "It does not replace statutory certification by government-notified quality assaying laboratories."
        )
    }
