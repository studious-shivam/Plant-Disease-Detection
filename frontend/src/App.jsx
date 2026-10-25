import React, { useState, useEffect } from 'react';
import './App.css';

// Disease information database
const DISEASE_INFO = {
  'Mossaic Virus': {
    description: 'Mosaic Virus causes a mottled pattern of light and dark green areas on soybean leaves, leading to stunted growth and reduced yield.',
    symptoms: ['Mottled light/dark green leaf patterns', 'Leaf curling and puckering', 'Stunted plant growth', 'Reduced pod formation'],
    cure: ['Remove and destroy infected plants immediately', 'Control aphid populations (primary vectors)', 'Plant virus-resistant soybean varieties', 'Use certified disease-free seeds', 'Practice crop rotation with non-host crops']
  },
  'Southern blight': {
    description: 'Southern Blight is a soil-borne fungal disease caused by Sclerotium rolfsii. It thrives in hot, humid conditions and attacks the stem base.',
    symptoms: ['White fungal growth at stem base', 'Wilting and yellowing of leaves', 'Brown lesions near soil line', 'Small round sclerotia (mustard-seed like structures)'],
    cure: ['Deep plowing to bury sclerotia', 'Apply fungicides containing Tebuconazole or Flutolanil', 'Improve soil drainage', 'Rotate with non-susceptible crops (corn, small grains)', 'Avoid excessive mulching near stems']
  },
  'Sudden Death Syndrone': {
    description: 'Sudden Death Syndrome (SDS) is caused by the fungus Fusarium virguliforme. It affects roots early but symptoms appear during reproductive stages.',
    symptoms: ['Interveinal chlorosis (yellowing between leaf veins)', 'Brown streaks in root cortex', 'Premature defoliation', 'Root rot with bluish fungal growth'],
    cure: ['Plant SDS-resistant varieties', 'Delay planting to allow soil warming', 'Improve field drainage', 'Manage soybean cyst nematode (increases SDS severity)', 'Seed treatment with ILeVO (fluopyram)']
  },
  'Yellow Mosaic': {
    description: 'Yellow Mosaic Disease is caused by Mungbean yellow mosaic virus (MYMV), transmitted by whiteflies. It severely impacts photosynthesis and yield.',
    symptoms: ['Bright yellow patches on leaves', 'Irregular yellow-green mosaic pattern', 'Reduced leaf size', 'Fewer pods with shriveled seeds'],
    cure: ['Spray insecticides to control whitefly vectors (Imidacloprid)', 'Use Yellow Mosaic-resistant soybean varieties', 'Intercrop with non-host crops like maize', 'Remove and destroy infected plants early', 'Apply neem oil as a natural whitefly repellent']
  },
  'bacterial_blight': {
    description: 'Bacterial Blight is caused by Pseudomonas savastanoi pv. glycinea. It spreads through rain splash and wind-driven rain during cool, wet weather.',
    symptoms: ['Small angular water-soaked spots on leaves', 'Spots turn brown with yellow halos', 'Lesions merge causing large dead areas', 'Ragged leaf appearance'],
    cure: ['Plant pathogen-free certified seeds', 'Apply copper-based bactericides preventively', 'Avoid overhead irrigation', 'Rotate with non-legume crops for 2+ years', 'Remove crop debris after harvest']
  },
  'brown_spot': {
    description: 'Brown Spot is caused by the fungus Septoria glycines. It is one of the most common soybean foliar diseases, causing premature defoliation.',
    symptoms: ['Small irregular dark brown spots on lower leaves', 'Spots may have dark borders', 'Premature yellowing and leaf drop', 'Starts from lower canopy moving upward'],
    cure: ['Apply foliar fungicides (Azoxystrobin, Pyraclostrobin)', 'Rotate with non-host crops', 'Incorporate crop residue through tillage', 'Plant resistant varieties when available', 'Ensure adequate plant nutrition (potassium)']
  },
  'crestamento': {
    description: 'Cercospora Leaf Blight (Crestamento) is caused by Cercospora kikuchii. It affects leaves, stems, and seeds, especially in warm, humid conditions.',
    symptoms: ['Reddish-purple discoloration on upper leaf surfaces', 'Leathery texture on affected leaves', 'Purple seed stain', 'Premature defoliation in severe cases'],
    cure: ['Apply fungicides at R3-R5 growth stages (Triazole + Strobilurin)', 'Use resistant varieties', 'Rotate crops to reduce inoculum', 'Treat seeds with fungicides before planting', 'Avoid planting in fields with heavy disease history']
  },
  'ferrugen': {
    description: 'Soybean Rust (Ferrugem) is caused by Phakopsora pachyrhizi. It is one of the most destructive soybean diseases, capable of causing 80% yield loss.',
    symptoms: ['Small tan to dark-brown lesions on lower leaves', 'Pustules (volcano-like) on underside of leaves', 'Rapid upward spread through canopy', 'Severe premature defoliation'],
    cure: ['Apply triazole + strobilurin fungicides preventively', 'Monitor fields regularly from flowering onwards', 'Plant early-maturing varieties', 'Eliminate volunteer soybeans and alternate hosts', 'Follow regional rust alert systems']
  },
  'powdery_mildew': {
    description: 'Powdery Mildew is caused by Microsphaera diffusa. It appears as white powdery growth on leaf surfaces, reducing photosynthesis.',
    symptoms: ['White powdery coating on upper leaf surfaces', 'Leaves may curl and become distorted', 'Reduced photosynthesis', 'Premature leaf aging'],
    cure: ['Apply sulfur-based or triazole fungicides', 'Plant resistant varieties', 'Ensure good air circulation between rows', 'Avoid excessive nitrogen fertilization', 'Remove and destroy heavily infected plant debris']
  },
  'septoria': {
    description: 'Septoria Leaf Spot is caused by Septoria glycines. It primarily affects lower leaves during warm, wet weather and can cause significant defoliation.',
    symptoms: ['Small angular brown lesions on lower leaves', 'Lesions may have darker borders', 'Progressive leaf yellowing', 'Premature defoliation from bottom up'],
    cure: ['Apply foliar fungicides (Mancozeb, Chlorothalonil)', 'Practice crop rotation (2-3 year cycle)', 'Remove and burn infected crop residue', 'Plant tolerant varieties', 'Avoid working in fields when foliage is wet']
  },
  'healthy': {
    description: 'The leaf appears healthy with no signs of disease. Continue monitoring regularly for early detection of any issues.',
    symptoms: ['Uniform green coloration', 'No spots, lesions, or discoloration', 'Normal leaf size and shape', 'Healthy vein structure'],
    cure: ['Continue regular crop monitoring', 'Maintain balanced fertilization', 'Ensure proper irrigation', 'Scout for pest activity weekly', 'Follow integrated pest management practices']
  }
};

function App() {
  const [selectedFile, setSelectedFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [prediction, setPrediction] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState('predict');
  const [blockchainHistory, setBlockchainHistory] = useState([]);
  const [blockchainStats, setBlockchainStats] = useState(null);
  const [verificationStatus, setVerificationStatus] = useState(null);

  useEffect(() => {
    if (activeTab === 'blockchain') {
      fetchBlockchainData();
    }
  }, [activeTab]);

  const fetchBlockchainData = async () => {
    try {
      const [historyRes, statsRes, verifyRes] = await Promise.all([
        fetch('http://127.0.0.1:5000/blockchain/history'),
        fetch('http://127.0.0.1:5000/blockchain/stats'),
        fetch('http://127.0.0.1:5000/blockchain/verify')
      ]);
      const history = await historyRes.json();
      const stats = await statsRes.json();
      const verify = await verifyRes.json();
      setBlockchainHistory(history.predictions || []);
      setBlockchainStats(stats);
      setVerificationStatus(verify);
    } catch (err) {
      console.error('Error fetching blockchain data:', err);
    }
  };

  const handleFileSelect = (e) => {
    const file = e.target.files[0];
    if (file) {
      setSelectedFile(file);
      setPreview(URL.createObjectURL(file));
      setPrediction(null);
      setError(null);
    }
  };

  const handleUpload = async () => {
    if (!selectedFile) {
      setError('Please select an image first');
      return;
    }
    setLoading(true);
    setError(null);
    const formData = new FormData();
    formData.append('file', selectedFile);
    try {
      const response = await fetch('http://127.0.0.1:5000/predict', {
        method: 'POST',
        body: formData,
      });
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || `Server returned ${response.status}`);
      }
      const data = await response.json();
      setPrediction(data);
    } catch (err) {
      setError(err.message || 'Failed to get prediction. Is the backend running?');
    } finally {
      setLoading(false);
    }
  };

  const handleReset = () => {
    setSelectedFile(null);
    setPreview(null);
    setPrediction(null);
    setError(null);
  };

  const formatTimestamp = (ts) => {
    if (!ts) return 'N/A';
    return new Date(ts).toLocaleString();
  };

  const truncateHash = (hash) => {
    if (!hash) return 'N/A';
    return `${hash.substring(0, 10)}...${hash.substring(hash.length - 10)}`;
  };

  const getDiseaseInfo = (diseaseName) => {
    if (!diseaseName) return null;
    return DISEASE_INFO[diseaseName] || DISEASE_INFO[diseaseName.replace(/_/g, ' ')] || null;
  };

  const hasResults = prediction && prediction.status !== 'rejected';
  const isRejected = prediction && prediction.status === 'rejected';

  return (
    <div className="app-container">
      {/* ====== NAVBAR ====== */}
      <nav className="navbar">
        <div className="navbar-brand">
          <div className="navbar-icon">🌱</div>
          <div>
            <div className="navbar-title">CropGuard AI</div>
            <div className="navbar-subtitle">AI Crop Monitoring and Management</div>
          </div>
        </div>
        <div className="nav-tabs">
          <button
            className={`nav-tab ${activeTab === 'predict' ? 'active' : ''}`}
            onClick={() => setActiveTab('predict')}
          >
            🔬 Predict
          </button>
          <button
            className={`nav-tab ${activeTab === 'blockchain' ? 'active' : ''}`}
            onClick={() => setActiveTab('blockchain')}
          >
            🔗 Blockchain
          </button>
        </div>
      </nav>

      {/* ====== PREDICT TAB ====== */}
      {activeTab === 'predict' && (
        <main className="main-content">
          {/* Hero */}
          <div className="hero-section">
            <div className="hero-badge">
              <span className="hero-badge-dot" />
              AI-Powered Soybean Leaf Analysis
            </div>
            <h1 className="hero-title">Detect Crop Diseases Instantly</h1>
            <p className="hero-subtitle">
              Upload a soybean leaf photo and our AI will identify diseases, estimate moisture, and record results on an immutable blockchain.
            </p>
          </div>

          {/* Error */}
          {error && <div className="error-banner">⚠ {error}</div>}

          {/* Upload + Results Grid */}
          <div className={`upload-container ${!hasResults && !isRejected ? 'no-results' : ''}`}>
            {/* LEFT: Upload */}
            <div>
              <div
                className={`upload-card ${preview ? 'has-image' : ''}`}
                onClick={() => document.getElementById('file-input').click()}
              >
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleFileSelect}
                  style={{ display: 'none' }}
                  id="file-input"
                />
                {preview ? (
                  <img src={preview} alt="Preview" className="upload-preview" />
                ) : (
                  <>
                    <div className="upload-icon">📸</div>
                    <div className="upload-text">Click to upload a soybean leaf image</div>
                    <div className="upload-hint">PNG, JPG or JPEG — Max 10 MB</div>
                  </>
                )}
              </div>

              <div className="btn-group">
                <button
                  className="btn-primary"
                  onClick={handleUpload}
                  disabled={!selectedFile || loading}
                >
                  {loading ? (
                    <><span className="loading-spinner" /> Analyzing...</>
                  ) : (
                    <>🔬 Analyze Image</>
                  )}
                </button>
                {(preview || prediction) && (
                  <button className="btn-secondary" onClick={handleReset}>
                    ↻ Reset
                  </button>
                )}
              </div>
            </div>

            {/* RIGHT: Rejection */}
            {isRejected && (
              <div className="rejection-card">
                <div className="rejection-icon">⚠️</div>
                <div className="rejection-title">No Disease Detected</div>
                <p className="rejection-message">
                  {prediction.message || 'This image does not appear to have diseased soybean leaf.'}
                </p>
                <div className="rejection-tip">
                  💡 Upload a clear, close-up photo of a soybean leaf for best results
                </div>
              </div>
            )}

            {/* RIGHT: Results */}
            {hasResults && (
              <div className="results-panel">
                {/* Disease */}
                <div className="result-card">
                  <div className="result-label">Disease Detected</div>
                  <div className={`result-value ${prediction.disease === 'healthy' ? 'healthy' : 'disease'}`}>
                    {prediction.disease.replace(/_/g, ' ')}
                  </div>
                </div>

                {/* Moisture */}
                {prediction.moisture !== undefined && (
                  <div className="result-card">
                    <div className="result-header">
                      <span className="result-label">Moisture Level</span>
                      <span className="result-value moisture" style={{ fontSize: '24px' }}>
                        {prediction.moisture}%
                      </span>
                    </div>
                    <div className="progress-bar-container">
                      <div
                        className="progress-bar moisture"
                        style={{ width: `${prediction.moisture}%` }}
                      />
                    </div>
                  </div>
                )}

                {/* Confidence */}
                {prediction.confidence !== undefined && (
                  <div className="result-card">
                    <div className="result-header">
                      <span className="result-label">Confidence Score</span>
                      <span className="result-value confidence" style={{ fontSize: '24px' }}>
                        {(prediction.confidence * 100).toFixed(1)}%
                      </span>
                    </div>
                    <div className="progress-bar-container">
                      <div
                        className="progress-bar confidence"
                        style={{ width: `${prediction.confidence * 100}%` }}
                      />
                    </div>
                  </div>
                )}

                {/* Blockchain */}
                {prediction.blockchain && prediction.blockchain.recorded && (
                  <div className="blockchain-card">
                    <div className="result-header">
                      <span className="result-label">Blockchain Record</span>
                      <span className="blockchain-badge">✓ Recorded</span>
                    </div>
                    <div className="blockchain-row">
                      <span className="blockchain-row-label">Block</span>
                      <span className="blockchain-row-value">#{prediction.blockchain.block_index}</span>
                    </div>
                    <div className="blockchain-row">
                      <span className="blockchain-row-label">Hash</span>
                      <span className="blockchain-row-value">{truncateHash(prediction.blockchain.block_hash)}</span>
                    </div>
                    <div className="blockchain-row">
                      <span className="blockchain-row-label">Timestamp</span>
                      <span className="blockchain-row-value" style={{ fontFamily: 'Inter, sans-serif' }}>
                        {formatTimestamp(prediction.blockchain.timestamp)}
                      </span>
                    </div>
                  </div>
                )}

                {/* Disease Info & Cure */}
                {getDiseaseInfo(prediction.disease) && (
                  <div className="disease-info-card">
                    <div className="disease-info-title">
                      📋 About This Disease
                    </div>
                    <div className="disease-info-section">
                      <p>{getDiseaseInfo(prediction.disease).description}</p>
                    </div>
                    <div className="disease-info-section">
                      <h4>🔍 Symptoms</h4>
                      <ul>
                        {getDiseaseInfo(prediction.disease).symptoms.map((s, i) => (
                          <li key={i}>{s}</li>
                        ))}
                      </ul>
                    </div>
                    <div className="disease-info-section">
                      <h4>💊 Recommended Treatment</h4>
                      <ul>
                        {getDiseaseInfo(prediction.disease).cure.map((c, i) => (
                          <li key={i}>{c}</li>
                        ))}
                      </ul>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </main>
      )}

      {/* ====== BLOCKCHAIN TAB ====== */}
      {activeTab === 'blockchain' && (
        <main className="main-content">
          <div className="hero-section">
            <div className="hero-badge">
              <span className="hero-badge-dot" />
              Tamper-Proof Prediction Ledger
            </div>
            <h1 className="hero-title">Blockchain Records</h1>
            <p className="hero-subtitle">
              Every prediction is cryptographically hashed and permanently stored for full transparency and auditability.
            </p>
          </div>

          {/* Stats */}
          {blockchainStats && (
            <div className="stats-grid">
              <div className="stat-card">
                <div className="stat-value">{blockchainStats.total_blocks}</div>
                <div className="stat-label">Total Blocks</div>
              </div>
              <div className="stat-card">
                <div className="stat-value">{blockchainStats.total_predictions}</div>
                <div className="stat-label">Predictions</div>
              </div>
              <div className="stat-card">
                <div className="stat-value">{blockchainStats.average_moisture}%</div>
                <div className="stat-label">Avg Moisture</div>
              </div>
              <div className={`stat-card ${blockchainStats.blockchain_valid ? 'valid' : 'invalid'}`}>
                <div className="stat-value">
                  {blockchainStats.blockchain_valid ? '✓' : '✗'}
                </div>
                <div className="stat-label">Chain Status</div>
              </div>
            </div>
          )}

          {/* Verification */}
          {verificationStatus && (
            <div className={`verification-banner ${verificationStatus.valid ? 'valid' : 'invalid'}`}>
              {verificationStatus.valid
                ? '🔒 Blockchain integrity verified — no tampering detected'
                : '⚠ Blockchain integrity check failed — possible tampering!'}
            </div>
          )}

          {/* History */}
          <h2 style={{ fontSize: '20px', fontWeight: 700, marginBottom: '16px', color: 'var(--text-primary)' }}>
            Prediction History
          </h2>

          {blockchainHistory.length === 0 ? (
            <div className="empty-state">
              <div className="empty-state-icon">📭</div>
              <div className="empty-state-title">No predictions yet</div>
              <div className="empty-state-text">Upload a soybean leaf image to create the first record.</div>
            </div>
          ) : (
            <div className="history-list">
              {[...blockchainHistory].reverse().map((pred, index) => (
                <div className="history-item" key={index}>
                  <div>
                    <div className="history-disease">
                      {pred.disease.replace(/_/g, ' ')}
                    </div>
                    <div className="history-time">{formatTimestamp(pred.timestamp)}</div>
                  </div>
                  <div style={{ textAlign: 'center' }}>
                    <div className="history-metric-value" style={{ color: 'var(--info)' }}>
                      {pred.moisture}%
                    </div>
                    <div className="history-metric-label">Moisture</div>
                  </div>
                  <div style={{ textAlign: 'center' }}>
                    <div className="history-metric-value" style={{ color: 'var(--accent)' }}>
                      {(pred.confidence * 100).toFixed(0)}%
                    </div>
                    <div className="history-metric-label">Confidence</div>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <div className="history-block-badge">Block #{pred.block_index}</div>
                    <div className="history-hash" style={{ marginTop: '6px' }}>
                      {truncateHash(pred.block_hash)}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </main>
      )}

      {/* ====== HOW IT WORKS ====== */}
      <section className="how-it-works">
        <div className="how-it-works-inner">
          <h2 className="section-title">How It Works</h2>
          <p className="section-subtitle">
            From leaf photo to blockchain-verified diagnosis in seconds
          </p>
          <div className="steps-grid">
            <div className="step-card">
              <div className="step-number">1</div>
              <div className="step-icon">📸</div>
              <div className="step-title">Upload Image</div>
              <div className="step-description">
                Take a clear photo of a soybean leaf and upload it through the interface.
              </div>
            </div>
            <div className="step-card">
              <div className="step-number">2</div>
              <div className="step-icon">🤖</div>
              <div className="step-title">AI Analysis</div>
              <div className="step-description">
                Our SVM model extracts 296 visual features and classifies the disease with confidence scoring.
              </div>
            </div>
            <div className="step-card">
              <div className="step-number">3</div>
              <div className="step-icon">🔗</div>
              <div className="step-title">Blockchain Record</div>
              <div className="step-description">
                The prediction is mined into a new block with SHA-256 hashing, creating a tamper-proof record.
              </div>
            </div>
            <div className="step-card">
              <div className="step-number">4</div>
              <div className="step-icon">💊</div>
              <div className="step-title">Get Treatment</div>
              <div className="step-description">
                Receive detailed disease information, symptoms, and recommended treatment for your crop.
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ====== FOOTER ====== */}
      <footer className="footer">
        🔒 Powered by AI & Blockchain Technology — All predictions are immutably recorded for transparency
      </footer>
    </div>
  );
}

export default App;