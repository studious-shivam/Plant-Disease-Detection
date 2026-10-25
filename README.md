# Plant Disease Detection

A machine learning project that identifies plant diseases from leaf images. Upload a photo of a leaf and the model predicts whether the plant is healthy or which disease it has.

## Features

- Image-based plant disease classification
- Trained model using preprocessed image data (`.npy` arrays)
- Web frontend for uploading images and viewing predictions
- Uses OpenCV for image preprocessing

## Project Structure

```
Plant-Disease-Detection/
├── frontend/          # Web interface
├── x_train.npy        # Training images (preprocessed)
├── y_train.npy        # Training labels
├── x_test.npy         # Test images (preprocessed)
├── y_test.npy         # Test labels
├── requirements.txt   # Python dependencies
└── README.md
```

> Update this tree to match your actual files and folders.

## Getting Started

### Prerequisites

- Python 3.9 or newer
- pip

### Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/studious-shivam/Plant-Disease-Detection.git
   cd Plant-Disease-Detection
   ```

2. Create and activate a virtual environment:
   ```bash
   python -m venv .venv

   # Windows
   .venv\Scripts\activate

   # macOS / Linux
   source .venv/bin/activate
   ```

3. Install dependencies:
   ```bash
   pip install -r requirements.txt
   ```

### Running the App

```bash
cd frontend
python app.py
```

Then open the address shown in the terminal (commonly `http://127.0.0.1:5000`) in your browser.

> Replace `app.py` with the actual file that starts your app.

## Usage

1. Open the web app in your browser.
2. Upload a clear photo of a single plant leaf.
3. View the predicted disease and confidence score.

## Model

- **Task:** Multi-class image classification
- **Input:** Leaf images, resized and normalized
- **Output:** Disease class label
- **Framework:** _(e.g. TensorFlow/Keras, PyTorch, scikit-learn)_
- **Dataset:** _(e.g. PlantVillage, with a link)_
- **Accuracy:** _(add your test accuracy here)_

## Tech Stack

- Python
- OpenCV
- NumPy
- _(add your ML framework and frontend framework)_

## Future Improvements

- Support more plant species and diseases
- Add treatment suggestions for each detected disease
- Deploy the app online
- Improve accuracy with more training data

## Author

**Shivam** — [@studious-shivam](https://github.com/studious-shivam)

## License

Add a license of your choice (for example, MIT) and describe it here.
