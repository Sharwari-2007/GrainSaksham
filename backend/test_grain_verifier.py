import cv2
import numpy as np

def verify_and_segment_grain_sample(img_bgr, crop_type='wheat'):
    """
    Validates whether the uploaded image is an actual agricultural grain sample
    (such as wheat, paddy, maize, pulses) or an arbitrary non-grain photograph
    (such as an animal, person, car, furniture, or outdoor scenery).
    """
    h, w, _ = img_bgr.shape
    total_px = h * w
    hsv = cv2.cvtColor(img_bgr, cv2.COLOR_BGR2HSV)
    gray = cv2.cvtColor(img_bgr, cv2.COLOR_BGR2GRAY)
    
    # 1. Non-agricultural color checks (sky, trees, foliage, bright synthetic materials)
    blue_mask = cv2.inRange(hsv, (85, 40, 30), (135, 255, 255))
    green_mask = cv2.inRange(hsv, (38, 55, 30), (82, 255, 255))
    magenta_mask = cv2.inRange(hsv, (140, 50, 30), (175, 255, 255))
    
    blue_pct = (np.count_nonzero(blue_mask) / total_px) * 100
    green_pct = (np.count_nonzero(green_mask) / total_px) * 100
    magenta_pct = (np.count_nonzero(magenta_mask) / total_px) * 100
    
    if blue_pct > 12.0:
        return False, f"Non-agricultural image detected: Excessive blue/cyan spectrum ({blue_pct:.1f}%). Typically indicates sky, fabric, vehicles, or outdoor non-grain scenery.", {}
    if green_pct > 20.0:
        return False, f"Non-agricultural image detected: Excessive green foliage/grass spectrum ({green_pct:.1f}%). Grains must be harvested and inspected on a clean surface.", {}
    if magenta_pct > 8.0:
        return False, f"Non-agricultural image detected: High synthetic/clothing color content ({magenta_pct:.1f}%).", {}
        
    # 2. Contrast and Illumination Check
    mean_val = float(np.mean(gray))
    if mean_val < 35.0:
        return False, f"Image too dark (mean brightness: {mean_val:.1f}). Sample must be photographed under adequate daylight or neutral illumination.", {}
    if mean_val > 245.0:
        return False, f"Image overexposed or blank white (mean brightness: {mean_val:.1f}). Grains cannot be discerned.", {}
        
    # 3. Surface & Threshold Segmentation
    blurred = cv2.GaussianBlur(gray, (5, 5), 0)
    _, thresh = cv2.threshold(blurred, 0, 255, cv2.THRESH_BINARY_INV + cv2.THRESH_OTSU)
    
    # Border polarity check
    border_px = np.concatenate([thresh[0, :], thresh[-1, :], thresh[:, 0], thresh[:, -1]])
    if np.mean(border_px) > 127:
        thresh = cv2.bitwise_not(thresh)
        
    fg_ratio = (np.count_nonzero(thresh) / total_px) * 100
    if fg_ratio < 3.0:
        return False, f"No grain kernels detected: Foreground objects occupy only {fg_ratio:.1f}% of frame. Please spread grains on a contrasting surface.", {}
    if fg_ratio > 82.0:
        return False, f"Non-grain subject detected: Single dense surface or close-up subject occupies {fg_ratio:.1f}% of image. Grains must be spread on an inspection sheet.", {}

    # Check for a single massive macroscopic object (>25% of total frame, e.g. animal body, face, vehicle)
    raw_cnts, _ = cv2.findContours(thresh, cv2.RETR_EXTERNAL, cv2.CHAIN_APPROX_SIMPLE)
    if raw_cnts:
        max_area = max(cv2.contourArea(c) for c in raw_cnts)
        if (max_area / total_px) > 0.28:
            return False, f"Non-grain macroscopic subject detected: A single large object occupies {max_area/total_px*100:.1f}% of frame (e.g., animal, person, car, or household object).", {}

    # 4. Distance transform to separate touching grains & count kernel peaks
    kernel = cv2.getStructuringElement(cv2.MORPH_ELLIPSE, (3, 3))
    cleaned = cv2.morphologyEx(thresh, cv2.MORPH_OPEN, kernel, iterations=1)
    
    dist_transform = cv2.distanceTransform(cleaned, cv2.DIST_L2, 5)
    max_dist = float(dist_transform.max())
    if max_dist < 4.0:
        return False, "No distinct grain bodies resolved. Image texture does not match agricultural grain kernels.", {}

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
    
    # 5. Semantic Grain Morphology & Chromatic Verification
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
        
        # Grain color criteria (wheat/cereal: golden/amber/straw hue 7-40, sat 20-245)
        is_grain_color = (6 <= mean_h <= 40) and (mean_s >= 20)
        # Grain shape criteria: smooth oval (solidity >= 0.60, AR between 1.1 and 4.2)
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
    
    # Statistical validation: In a genuine grain sample, majority of kernels must match cereal grain chromaticity & morphology
    if grain_color_pct < 50.0:
        return False, f"Non-grain image rejected: Only {grain_color_pct:.1f}% of segmented items match agricultural grain color spectrum. Expected cereal grain hues (golden, amber, straw-yellow).", {}
        
    if grain_shape_pct < 35.0:
        return False, f"Non-grain image rejected: Only {grain_shape_pct:.1f}% of items conform to grain kernel morphology (aspect ratio & convex ovoid structure).", {}
        
    return True, "Valid agricultural grain sample confirmed", {
        'total_kernels': total_valid,
        'grain_like_count': grain_like_count,
        'grain_color_pct': round(grain_color_pct, 1),
        'grain_shape_pct': round(grain_shape_pct, 1),
        'kernels': kernel_data,
        'thresh': thresh
    }

if __name__ == '__main__':
    # 1. Real wheat
    img_wheat = cv2.imread('data/sample_wheat.jpg')
    ok, msg, data = verify_and_segment_grain_sample(img_wheat)
    print("Real Wheat Test Result:", ok, "->", msg)
    if ok:
        print(f"  Total kernels: {data['total_kernels']}, Color %: {data['grain_color_pct']}%, Shape %: {data['grain_shape_pct']}%")

    # 2. Random noise / textures
    np.random.seed(42)
    img_noise = np.random.randint(60, 180, (600, 600, 3), dtype=np.uint8)
    for _ in range(40):
        x, y = np.random.randint(50, 550, size=2)
        cv2.circle(img_noise, (x, y), np.random.randint(5, 20), (int(np.random.randint(0, 255)), int(np.random.randint(0, 255)), int(np.random.randint(0, 255))), -1)
    ok, msg, _ = verify_and_segment_grain_sample(img_noise)
    print("Noise/Texture Test Result:", ok, "->", msg)

    # 3. Dog on grass
    dog_img = np.zeros((600, 600, 3), dtype=np.uint8)
    dog_img[:, :] = [30, 140, 30] # Green grass
    cv2.ellipse(dog_img, (300, 350), (160, 100), 0, 0, 360, (20, 60, 130), -1)
    ok, msg, _ = verify_and_segment_grain_sample(dog_img)
    print("Dog on Lawn Test Result:", ok, "->", msg)

    # 4. Car / Vehicle
    car_img = np.zeros((600, 600, 3), dtype=np.uint8)
    car_img[:300, :] = [240, 180, 100] # Blue sky
    car_img[300:, :] = [80, 80, 80]    # Asphalt
    cv2.rectangle(car_img, (150, 250), (450, 420), (200, 30, 20), -1)
    ok, msg, _ = verify_and_segment_grain_sample(car_img)
    print("Car on Street Test Result:", ok, "->", msg)

    # 5. Human Portrait
    face_img = np.zeros((600, 600, 3), dtype=np.uint8)
    face_img[:, :] = [210, 210, 210]
    cv2.ellipse(face_img, (300, 300), (140, 190), 0, 0, 360, (160, 180, 220), -1)
    cv2.circle(face_img, (250, 260), 18, (40, 30, 20), -1)
    cv2.circle(face_img, (350, 260), 18, (40, 30, 20), -1)
    ok, msg, _ = verify_and_segment_grain_sample(face_img)
    print("Human Portrait Test Result:", ok, "->", msg)
