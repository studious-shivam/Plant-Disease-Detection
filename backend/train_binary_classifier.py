import os
import cv2
import numpy as np
from sklearn.svm import SVC
from sklearn.model_selection import train_test_split
from sklearn.preprocessing import StandardScaler
from sklearn.metrics import classification_report, accuracy_score
import joblib

# Configuration
SOYBEAN_DATASET_PATH = r"C:\Users\abhia\Downloads\soyabean"
NON_SOYBEAN_PATH = r"C:\Users\abhia\Downloads\non_soybean"
IMAGE_SIZE = (128, 128)
TEST_SIZE = 0.2
RANDOM_STATE = 42

print("=" * 70)
print("IMPROVED BINARY CLASSIFIER: SOYBEAN vs NON-SOYBEAN")
print("=" * 70)


def extract_features(image_path=None, image=None):
    """Extract features for binary classification"""
    try:
        if image is None:
            img = cv2.imread(image_path)
            if img is None:
                return None
        else:
            img = image

        img_resized = cv2.resize(img, IMAGE_SIZE)

        # Color features
        hsv = cv2.cvtColor(img_resized, cv2.COLOR_BGR2HSV)
        lab = cv2.cvtColor(img_resized, cv2.COLOR_BGR2LAB)

        # Histograms (16 bins)
        hist_h = cv2.calcHist([hsv], [0], None, [16], [0, 180])
        hist_s = cv2.calcHist([hsv], [1], None, [16], [0, 256])
        hist_v = cv2.calcHist([hsv], [2], None, [16], [0, 256])
        hist_l = cv2.calcHist([lab], [0], None, [16], [0, 256])

        # Shape features
        gray = cv2.cvtColor(img_resized, cv2.COLOR_BGR2GRAY)
        edges = cv2.Canny(gray, 50, 150)
        edge_density = np.sum(edges > 0) / (IMAGE_SIZE[0] * IMAGE_SIZE[1])

        # Texture
        texture = [
            np.mean(gray), np.std(gray),
            np.mean(hsv[:, :, 1]), np.std(hsv[:, :, 1]),
            edge_density
        ]

        # Concatenate (16*4 + 5 = 69 features)
        features = np.concatenate([
            hist_h.flatten(),
            hist_s.flatten(),
            hist_v.flatten(),
            hist_l.flatten(),
            np.array(texture)
        ])

        features = features / (features.sum() + 1e-7)
        return features

    except Exception as e:
        print(f"Error: {e}")
        return None


def augment_image(img):
    """Create augmented versions of an image"""
    augmented = []

    # Flip horizontal
    augmented.append(cv2.flip(img, 1))

    # Flip vertical
    augmented.append(cv2.flip(img, 0))

    # Rotate 90
    augmented.append(cv2.rotate(img, cv2.ROTATE_90_CLOCKWISE))

    # Rotate 270
    augmented.append(cv2.rotate(img, cv2.ROTATE_90_COUNTERCLOCKWISE))

    # Brightness variations
    for beta in [-40, -20, 20, 40]:
        adjusted = cv2.convertScaleAbs(img, alpha=1.0, beta=beta)
        augmented.append(adjusted)

    # Color jitter (shift hue)
    hsv = cv2.cvtColor(img, cv2.COLOR_BGR2HSV).astype(np.int16)
    for shift in [10, -10, 20, -20]:
        shifted = hsv.copy()
        shifted[:, :, 0] = (shifted[:, :, 0] + shift) % 180
        shifted = np.clip(shifted, 0, 255).astype(np.uint8)
        augmented.append(cv2.cvtColor(shifted, cv2.COLOR_HSV2BGR))

    # Blur
    augmented.append(cv2.GaussianBlur(img, (5, 5), 0))

    # Add noise
    noise = np.random.normal(0, 15, img.shape).astype(np.int16)
    noisy = np.clip(img.astype(np.int16) + noise, 0, 255).astype(np.uint8)
    augmented.append(noisy)

    return augmented


def load_dataset():
    """Load soybean (1) and non-soybean (0) with augmentation for balance"""
    X = []
    y = []

    # Load soybean images (class 1) — subsample to avoid overwhelming
    print("\nLoading SOYBEAN images...")
    soybean_count = 0
    if os.path.exists(SOYBEAN_DATASET_PATH):
        for class_folder in os.listdir(SOYBEAN_DATASET_PATH):
            class_path = os.path.join(SOYBEAN_DATASET_PATH, class_folder)
            if os.path.isdir(class_path):
                for img_file in os.listdir(class_path):
                    if img_file.lower().endswith(('.jpg', '.jpeg', '.png')):
                        img_path = os.path.join(class_path, img_file)
                        features = extract_features(image_path=img_path)
                        if features is not None:
                            X.append(features)
                            y.append(1)
                            soybean_count += 1
    print(f"  Loaded {soybean_count} soybean images")

    # Load non-soybean images (class 0) + heavy augmentation
    print("\nLoading NON-SOYBEAN images with augmentation...")
    non_soybean_count = 0
    if os.path.exists(NON_SOYBEAN_PATH):
        for img_file in os.listdir(NON_SOYBEAN_PATH):
            if img_file.lower().endswith(('.jpg', '.jpeg', '.png')):
                img_path = os.path.join(NON_SOYBEAN_PATH, img_file)
                img = cv2.imread(img_path)
                if img is None:
                    continue

                # Original
                features = extract_features(image=img)
                if features is not None:
                    X.append(features)
                    y.append(0)
                    non_soybean_count += 1

                # Augmented versions
                for aug_img in augment_image(img):
                    features = extract_features(image=aug_img)
                    if features is not None:
                        X.append(features)
                        y.append(0)
                        non_soybean_count += 1

    print(f"  Loaded {non_soybean_count} non-soybean samples (original + augmented)")

    # Also add synthetic negatives (random noise, solid colors, patterns)
    print("\nGenerating synthetic negatives...")
    synth_count = 0

    # Random noise images
    for i in range(100):
        noise_img = np.random.randint(0, 255, (IMAGE_SIZE[0], IMAGE_SIZE[1], 3), dtype=np.uint8)
        features = extract_features(image=noise_img)
        if features is not None:
            X.append(features)
            y.append(0)
            synth_count += 1

    # Solid color images
    for color in [(255, 0, 0), (0, 0, 255), (255, 255, 0), (128, 128, 128),
                  (255, 255, 255), (0, 0, 0), (255, 128, 0), (128, 0, 128)]:
        solid = np.full((IMAGE_SIZE[0], IMAGE_SIZE[1], 3), color, dtype=np.uint8)
        features = extract_features(image=solid)
        if features is not None:
            X.append(features)
            y.append(0)
            synth_count += 1

    # Gradient images
    for _ in range(20):
        gradient = np.zeros((IMAGE_SIZE[0], IMAGE_SIZE[1], 3), dtype=np.uint8)
        c1 = np.random.randint(0, 255, 3)
        c2 = np.random.randint(0, 255, 3)
        for row in range(IMAGE_SIZE[0]):
            ratio = row / IMAGE_SIZE[0]
            gradient[row, :] = (c1 * (1 - ratio) + c2 * ratio).astype(np.uint8)
        features = extract_features(image=gradient)
        if features is not None:
            X.append(features)
            y.append(0)
            synth_count += 1

    print(f"  Generated {synth_count} synthetic negatives")

    return np.array(X), np.array(y)


# Train
X, y = load_dataset()

soy_count = sum(y == 1)
non_count = sum(y == 0)
print(f"\nDataset: {len(X)} total samples")
print(f"  Soybean:     {soy_count}")
print(f"  Non-soybean: {non_count}")
print(f"  Ratio:       1:{non_count / soy_count:.1f}")

X_train, X_test, y_train, y_test = train_test_split(
    X, y, test_size=TEST_SIZE, random_state=RANDOM_STATE, stratify=y
)

scaler = StandardScaler()
X_train_scaled = scaler.fit_transform(X_train)
X_test_scaled = scaler.transform(X_test)

# Use class_weight='balanced' to handle remaining imbalance
# Use higher C for stricter decision boundary
print("\nTraining improved binary classifier...")
model = SVC(
    kernel='rbf',
    C=50.0,
    gamma='scale',
    probability=True,
    class_weight='balanced',
    random_state=RANDOM_STATE
)
model.fit(X_train_scaled, y_train)

y_pred = model.predict(X_test_scaled)
accuracy = accuracy_score(y_test, y_pred)

print(f"\n{'=' * 70}")
print(f"RESULTS")
print(f"{'=' * 70}")
print(f"Accuracy: {accuracy * 100:.2f}%\n")
print(classification_report(y_test, y_pred, target_names=['Non-Soybean', 'Soybean']))

# Save
joblib.dump(model, 'binary_classifier.pkl')
joblib.dump(scaler, 'binary_scaler.pkl')
print(f"\nSaved: binary_classifier.pkl, binary_scaler.pkl")

# Quick test on the problem images
print(f"\n{'=' * 70}")
print("TESTING PROBLEM IMAGES")
print(f"{'=' * 70}")
for path in [r'C:\Users\abhia\Downloads\download1.jpg', r'C:\Users\abhia\Downloads\download11.jpeg']:
    img = cv2.imread(path)
    if img is None:
        print(f"Could not load: {path}")
        continue
    features = extract_features(image=img)
    features_scaled = scaler.transform(features.reshape(1, -1))
    pred = model.predict(features_scaled)[0]
    proba = model.predict_proba(features_scaled)[0]
    label = "SOYBEAN" if pred == 1 else "NOT_SOYBEAN"
    print(f"  {os.path.basename(path):25s} -> {label}  (soy={proba[1]:.4f})")