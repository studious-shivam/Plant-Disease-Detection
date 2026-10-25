import cv2, numpy as np, joblib, os

IMAGE_SIZE = (128, 128)

def extract_binary_features(image):
    img_resized = cv2.resize(image, IMAGE_SIZE)
    hsv = cv2.cvtColor(img_resized, cv2.COLOR_BGR2HSV)
    lab = cv2.cvtColor(img_resized, cv2.COLOR_BGR2LAB)
    hist_h = cv2.calcHist([hsv], [0], None, [16], [0, 180])
    hist_s = cv2.calcHist([hsv], [1], None, [16], [0, 256])
    hist_v = cv2.calcHist([hsv], [2], None, [16], [0, 256])
    hist_l = cv2.calcHist([lab], [0], None, [16], [0, 256])
    gray = cv2.cvtColor(img_resized, cv2.COLOR_BGR2GRAY)
    edges = cv2.Canny(gray, 50, 150)
    edge_density = np.sum(edges > 0) / (IMAGE_SIZE[0] * IMAGE_SIZE[1])
    texture = [np.mean(gray), np.std(gray), np.mean(hsv[:,:,1]), np.std(hsv[:,:,1]), edge_density]
    features = np.concatenate([hist_h.flatten(), hist_s.flatten(), hist_v.flatten(), hist_l.flatten(), np.array(texture)])
    features = features / (features.sum() + 1e-7)
    return features.reshape(1, -1)

model = joblib.load('binary_classifier.pkl')
scaler = joblib.load('binary_scaler.pkl')

test_paths = [
    r'C:\Users\abhia\Downloads\download1.jpg',
    r'C:\Users\abhia\Downloads\download11.jpeg',
]

non_soy_dir = r'C:\Users\abhia\Downloads\non_soybean'
for f in sorted(os.listdir(non_soy_dir)):
    test_paths.append(os.path.join(non_soy_dir, f))

lines = []
correct = 0
total = 0
for path in test_paths:
    img = cv2.imread(path)
    if img is None:
        continue
    features = extract_binary_features(img)
    features_scaled = scaler.transform(features)
    pred = model.predict(features_scaled)[0]
    proba = model.predict_proba(features_scaled)[0]
    label = "SOYBEAN" if pred == 1 else "NOT_SOYBEAN"
    line = f'{os.path.basename(path):35s} {label:12s} non_soy={proba[0]:.4f}  soy={proba[1]:.4f}'
    lines.append(line)
    total += 1
    if pred == 0:
        correct += 1

lines.append(f'\nRejected {correct}/{total} as non-soybean')
lines.append(f'Misclassified {total - correct}/{total} as soybean')

with open('test_results.txt', 'w') as f:
    f.write('\n'.join(lines))
print('Done - see test_results.txt')
