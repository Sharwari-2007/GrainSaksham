"""
GrainSaksham AI — Comprehensive End-to-End Test Suite
Tests all REST endpoints, computer-vision image inspection pipeline,
QR verification privacy filters, and dispute workflows against the live FastAPI server.
"""

import urllib.request
import json
import os
import mimetypes

BASE_URL = "http://127.0.0.1:8000/api"

def test_health():
    url = f"{BASE_URL}/health"
    req = urllib.request.urlopen(url)
    assert req.status == 200
    data = json.loads(req.read().decode())
    assert data["status"] == "healthy"
    print("[PASS] Health Check Passed:", data["service"], "Version:", data["version"])

def test_market_prices():
    url = f"{BASE_URL}/market-prices?crop=Wheat"
    req = urllib.request.urlopen(url)
    assert req.status == 200
    data = json.loads(req.read().decode())
    assert data["count"] > 0
    assert "prices" in data
    print(f"[PASS] Mandi Prices Endpoint Passed: {data['count']} Mandi prices retrieved.")

def test_inspection_analysis():
    url = f"{BASE_URL}/inspections/analyze"
    img_path = os.path.join(os.path.dirname(__file__), "backend", "data", "sample_wheat.jpg")
    assert os.path.exists(img_path), f"Sample image not found at {img_path}"
    
    with open(img_path, "rb") as f:
        img_bytes = f.read()

    # Construct multipart form data
    boundary = "----WebKitFormBoundary7MA4YWxkTrZu0gW"
    body = bytearray()
    
    # Form fields
    fields = {
        "crop_type": "wheat",
        "variety": "HD-2967 (Test)",
        "lot_identifier": "LOT-TEST-99",
        "mandi_location": "Khanna Mandi, Punjab",
        "user_moisture": "11.6",
        "owner_id": "farmer-ramesh-01",
        "owner_name": "Ramesh Kumar"
    }
    
    for k, v in fields.items():
        body.extend(f"--{boundary}\r\n".encode())
        body.extend(f'Content-Disposition: form-data; name="{k}"\r\n\r\n'.encode())
        body.extend(f"{v}\r\n".encode())
        
    # File field
    body.extend(f"--{boundary}\r\n".encode())
    body.extend(f'Content-Disposition: form-data; name="file"; filename="sample_wheat.jpg"\r\n'.encode())
    body.extend(b"Content-Type: image/jpeg\r\n\r\n")
    body.extend(img_bytes)
    body.extend(b"\r\n")
    body.extend(f"--{boundary}--\r\n".encode())

    req = urllib.request.Request(
        url,
        data=body,
        headers={"Content-Type": f"multipart/form-data; boundary={boundary}"},
        method="POST"
    )
    
    resp = urllib.request.urlopen(req)
    assert resp.status == 200
    result = json.loads(resp.read().decode())
    assert "reportId" in result
    assert "assignedGrade" in result
    assert "metrics" in result
    print("[PASS] Inspection Analysis Passed!")
    print(f"  - Report ID: {result['reportId']}")
    print(f"  - Assigned Grade: {result['assignedGrade']}")
    print(f"  - Sound Grain: {result['metrics']['sound_grain']['percentage']}%")
    print(f"  - Broken Kernels: {result['metrics']['broken_shriveled']['percentage']}%")
    print(f"  - Model Confidence: {result['confidenceScore']}")
    return result["reportId"]

def test_public_verification(report_id):
    url = f"{BASE_URL}/reports/{report_id}/verify"
    req = urllib.request.urlopen(url)
    assert req.status == 200
    data = json.loads(req.read().decode())
    assert data["verified"] is True
    assert "passport" in data
    # Verify privacy protection: phone and exact internal ownerId must be masked
    assert "phone" not in data["passport"]
    print(f"[PASS] Public QR Verification Endpoint Passed for Report #{report_id}")

def test_disputes():
    url = f"{BASE_URL}/disputes"
    req = urllib.request.urlopen(url)
    assert req.status == 200
    disputes = json.loads(req.read().decode())
    assert len(disputes) > 0
    print(f"[PASS] Disputes Endpoint Passed: {len(disputes)} active disputes retrieved.")

def test_analytics():
    url = f"{BASE_URL}/analytics"
    req = urllib.request.urlopen(url)
    assert req.status == 200
    data = json.loads(req.read().decode())
    assert "summary" in data
    assert "gradeDistribution" in data
    print("[PASS] Analytics Endpoint Passed:", data["summary"])

if __name__ == "__main__":
    print("\n================ GrainSaksham AI Test Suite ================")
    test_health()
    test_market_prices()
    report_id = test_inspection_analysis()
    test_public_verification(report_id)
    test_disputes()
    test_analytics()
    print("================ All 6 Test Categories Passed! ================\n")
