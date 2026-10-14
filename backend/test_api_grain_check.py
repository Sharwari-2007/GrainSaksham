import urllib.request
import json
import uuid
import cv2
import numpy as np

def upload_test(filename, file_bytes):
    boundary = uuid.uuid4().hex
    body = []
    body.extend([
        f'--{boundary}'.encode(),
        f'Content-Disposition: form-data; name="file"; filename="{filename}"'.encode(),
        b'Content-Type: image/jpeg',
        b'',
        file_bytes
    ])
    body.extend([
        f'--{boundary}'.encode(),
        b'Content-Disposition: form-data; name="crop_type"',
        b'',
        b'wheat'
    ])
    body.extend([
        f'--{boundary}'.encode(),
        b'Content-Disposition: form-data; name="variety"',
        b'',
        b'HD-2967'
    ])
    body.extend([
        f'--{boundary}--'.encode(),
        b''
    ])
    payload = b'\r\n'.join(body)
    
    req = urllib.request.Request(
        'http://127.0.0.1:8000/api/inspections/analyze',
        data=payload,
        headers={'Content-Type': f'multipart/form-data; boundary={boundary}'}
    )
    
    try:
        with urllib.request.urlopen(req) as resp:
            data = json.loads(resp.read().decode())
            return resp.status, data
    except urllib.error.HTTPError as e:
        err_data = json.loads(e.read().decode())
        return e.code, err_data

if __name__ == '__main__':
    # 1. Real Wheat Test
    with open('data/sample_wheat.jpg', 'rb') as f:
        wheat_bytes = f.read()
    code, data = upload_test('sample_wheat.jpg', wheat_bytes)
    print("HTTP Test 1 - Real Wheat Sample:")
    print("  Status Code:", code)
    print("  Total Kernels:", data.get('totalKernels'))
    print("  Assigned Grade:", data.get('assignedGrade'))
    print("  Status:", data.get('status'))

    # 2. Synthetic Animal / Dog Test
    dog_img = np.zeros((600, 600, 3), dtype=np.uint8)
    dog_img[:, :] = [30, 140, 30] # Green grass
    cv2.ellipse(dog_img, (300, 350), (160, 100), 0, 0, 360, (20, 60, 130), -1) # Brown animal
    _, dog_buf = cv2.imencode('.jpg', dog_img)
    code, data = upload_test('dog.jpg', dog_buf.tobytes())
    print("\nHTTP Test 2 - Non-Grain Animal Image:")
    print("  Status Code:", code)
    print("  Rejected Reason:", data.get('detail'))

    # 3. Vehicle / Car Test
    car_img = np.zeros((600, 600, 3), dtype=np.uint8)
    car_img[:300, :] = [240, 180, 100] # Blue sky
    car_img[300:, :] = [80, 80, 80]    # Asphalt
    cv2.rectangle(car_img, (150, 250), (450, 420), (200, 30, 20), -1) # Car
    _, car_buf = cv2.imencode('.jpg', car_img)
    code, data = upload_test('car.jpg', car_buf.tobytes())
    print("\nHTTP Test 3 - Vehicle / Car Image:")
    print("  Status Code:", code)
    print("  Rejected Reason:", data.get('detail'))
