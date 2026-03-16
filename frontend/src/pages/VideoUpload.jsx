import { useState } from 'react';
import { Upload, Play, Pause, RotateCcw, AlertTriangle } from 'lucide-react';

const VideoUpload = () => {
  const [uploadedFile, setUploadedFile] = useState(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisResults, setAnalysisResults] = useState(null);
  const [isPlaying, setIsPlaying] = useState(false);

  const handleFileUpload = (event) => {
    const file = event.target.files[0];
    if (file && file.type.startsWith('video/')) {
      setUploadedFile(file);
      setAnalysisResults(null);
    }
  };

  const startAnalysis = () => {
    setIsAnalyzing(true);
    
    // Simulate AI analysis
    setTimeout(() => {
      setAnalysisResults({
        detections: [
          {
            timestamp: '00:15',
            type: 'Suspicious Activity',
            confidence: 0.87,
            location: { x: 45, y: 30, width: 20, height: 25 }
          },
          {
            timestamp: '00:32',
            type: 'Weapon Detected',
            confidence: 0.94,
            location: { x: 60, y: 40, width: 15, height: 20 }
          }
        ],
        summary: {
          totalDetections: 2,
          highRiskEvents: 1,
          processingTime: '2.3s'
        }
      });
      setIsAnalyzing(false);
    }, 3000);
  };

  const resetAnalysis = () => {
    setUploadedFile(null);
    setAnalysisResults(null);
    setIsAnalyzing(false);
    setIsPlaying(false);
  };

  return (
    <div className="video-upload">
      <div className="upload-header">
        <h2>Video Upload Analysis</h2>
        <p>Upload video files for AI-powered threat detection analysis</p>
      </div>

      <div className="upload-content">
        {!uploadedFile ? (
          <div className="upload-zone">
            <input
              type="file"
              accept="video/*"
              onChange={handleFileUpload}
              className="file-input"
              id="video-upload"
            />
            <label htmlFor="video-upload" className="upload-label">
              <Upload size={48} />
              <h3>Upload Video File</h3>
              <p>Drag and drop or click to select video files</p>
              <span className="file-types">Supported: MP4, AVI, MOV, WebM</span>
            </label>
          </div>
        ) : (
          <div className="analysis-workspace">
            <div className="video-section">
              <div className="video-player">
                <div className="video-placeholder">
                  <div className="video-info">
                    <h4>{uploadedFile.name}</h4>
                    <p>Size: {(uploadedFile.size / (1024 * 1024)).toFixed(2)} MB</p>
                  </div>
                  
                  {analysisResults && (
                    <div className="detection-overlays">
                      {analysisResults.detections.map((detection, index) => (
                        <div
                          key={index}
                          className="detection-box"
                          style={{
                            left: `${detection.location.x}%`,
                            top: `${detection.location.y}%`,
                            width: `${detection.location.width}%`,
                            height: `${detection.location.height}%`
                          }}
                        >
                          <div className="detection-label">
                            {detection.type} ({Math.round(detection.confidence * 100)}%)
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
                
                <div className="video-controls">
                  <button 
                    className="btn btn-primary"
                    onClick={() => setIsPlaying(!isPlaying)}
                  >
                    {isPlaying ? <Pause size={16} /> : <Play size={16} />}
                    {isPlaying ? 'Pause' : 'Play'}
                  </button>
                  
                  <div className="progress-bar">
                    <div className="progress-fill" style={{ width: '35%' }}></div>
                  </div>
                  
                  <span className="time-display">01:23 / 03:45</span>
                </div>
              </div>
              
              <div className="analysis-controls">
                {!analysisResults && !isAnalyzing && (
                  <button 
                    className="btn btn-primary btn-large"
                    onClick={startAnalysis}
                  >
                    <AlertTriangle size={20} />
                    Start AI Analysis
                  </button>
                )}
                
                {isAnalyzing && (
                  <div className="analyzing-status">
                    <div className="spinner"></div>
                    <span>Analyzing video for threats...</span>
                  </div>
                )}
                
                <button 
                  className="btn btn-secondary"
                  onClick={resetAnalysis}
                >
                  <RotateCcw size={16} />
                  Upload New Video
                </button>
              </div>
            </div>

            {analysisResults && (
              <div className="results-section">
                <h3>Analysis Results</h3>
                
                <div className="results-summary">
                  <div className="summary-card">
                    <div className="summary-number">{analysisResults.summary.totalDetections}</div>
                    <div className="summary-label">Total Detections</div>
                  </div>
                  <div className="summary-card alert">
                    <div className="summary-number">{analysisResults.summary.highRiskEvents}</div>
                    <div className="summary-label">High Risk Events</div>
                  </div>
                  <div className="summary-card">
                    <div className="summary-number">{analysisResults.summary.processingTime}</div>
                    <div className="summary-label">Processing Time</div>
                  </div>
                </div>

                <div className="detections-list">
                  <h4>Detected Events</h4>
                  {analysisResults.detections.map((detection, index) => (
                    <div key={index} className="detection-item">
                      <div className="detection-info">
                        <div className="detection-type">{detection.type}</div>
                        <div className="detection-time">Time: {detection.timestamp}</div>
                        <div className="detection-confidence">
                          Confidence: {Math.round(detection.confidence * 100)}%
                        </div>
                      </div>
                      <div className="detection-actions">
                        <button className="btn btn-sm btn-primary">View Frame</button>
                        <button className="btn btn-sm btn-danger">Report Incident</button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default VideoUpload;