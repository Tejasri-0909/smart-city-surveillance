import { useState, useEffect, useRef } from 'react';
import { Camera, RefreshCw } from 'lucide-react';
import { createSimulatedVideo } from '../utils/videoUtils';

const CameraVideo = ({ cameraId, cameraName, index }) => {
  const [videoState, setVideoState] = useState('loading'); // loading, video, canvas, error
  const [retryCount, setRetryCount] = useState(0);
  const [lastError, setLastError] = useState(null);
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const cleanupRef = useRef(null);
  const retryTimeoutRef = useRef(null);
  const healthCheckRef = useRef(null);

  // Location-specific video URLs with multiple sources for redundancy
  const getLocationVideos = (cameraId) => {
    const videoMap = {
      'CAM001': [
        `https://res.cloudinary.com/dybci4h1u/video/upload/v1773771961/cam1_funvna.mp4`,
        `/cctv/cam1.mp4`, // Local fallback
        `https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4` // Public fallback
      ],
      'CAM002': [
        `https://res.cloudinary.com/dybci4h1u/video/upload/v1773771935/cam2_euevgq.mp4`,
        `/cctv/cam2.mp4`,
        `https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ElephantsDream.mp4`
      ],
      'CAM003': [
        `https://res.cloudinary.com/dybci4h1u/video/upload/v1773771955/cam3_sug2zm.mp4`,
        `/cctv/cam3.mp4`,
        `https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4`
      ],
      'CAM004': [
        `https://res.cloudinary.com/dybci4h1u/video/upload/v1773771984/cam4_xexpfj.mp4`,
        `/cctv/cam4.mp4`,
        `https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerEscapes.mp4`
      ],
      'CAM005': [
        `https://res.cloudinary.com/dybci4h1u/video/upload/v1773773966/Cam5_gefgvz.mp4`,
        `/cctv/Cam5.mp4`,
        `https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerFun.mp4`
      ],
      'CAM006': [
        `https://res.cloudinary.com/dybci4h1u/video/upload/v1773774617/Cam6_bwq6kd.mp4`,
        `/cctv/Cam6.mp4`,
        `https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerJoyrides.mp4`
      ]
    };
    return videoMap[cameraId] || videoMap['CAM001'];
  };

  // Enhanced video health check and recovery
  const setupVideoHealthCheck = (video) => {
    if (healthCheckRef.current) {
      clearInterval(healthCheckRef.current);
    }

    let lastCurrentTime = 0;
    let stuckCount = 0;

    healthCheckRef.current = setInterval(() => {
      if (video && videoState === 'video') {
        // Check multiple failure conditions
        const isStuck = video.currentTime === lastCurrentTime && !video.paused;
        const hasError = video.error !== null;
        const isEnded = video.ended;
        const isPaused = video.paused;
        const hasNoData = video.readyState < 2; // HAVE_CURRENT_DATA
        
        if (isStuck) {
          stuckCount++;
        } else {
          stuckCount = 0;
        }
        
        // Trigger recovery if any failure condition is met
        if (hasError || isEnded || (isStuck && stuckCount >= 2) || hasNoData) {
          console.log(`📹 Video health check failed for ${cameraId}:`, {
            error: hasError,
            ended: isEnded,
            stuck: isStuck,
            stuckCount,
            paused: isPaused,
            noData: hasNoData,
            readyState: video.readyState
          });
          attemptVideoRecovery();
        } else if (isPaused) {
          // Try to resume if paused unexpectedly
          console.log(`📹 Video paused unexpectedly for ${cameraId}, resuming...`);
          video.play().catch(console.error);
        }
        
        lastCurrentTime = video.currentTime;
      }
    }, 15000); // Check every 15 seconds for faster detection
  };

  // Enhanced attempt to recover video stream
  const attemptVideoRecovery = async () => {
    const video = videoRef.current;
    if (!video) return;

    console.log(`🔄 Attempting video recovery for ${cameraId} (attempt ${retryCount + 1})`);
    
    try {
      // Clear any existing error state
      video.removeAttribute('src');
      video.load();
      
      // Wait a moment for cleanup
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Try to resume current video first with fresh load
      const currentSrc = video.src;
      if (currentSrc && !video.error) {
        console.log(`🔄 Attempting to reload current source for ${cameraId}`);
        video.src = currentSrc;
        video.currentTime = 0;
        
        try {
          await video.play();
          console.log(`✅ Video recovery successful for ${cameraId}`);
          setupVideoHealthCheck(video); // Restart health monitoring
          return;
        } catch (error) {
          console.log(`❌ Current source reload failed for ${cameraId}:`, error.message);
        }
      }
    } catch (error) {
      console.log(`❌ Video recovery preparation failed for ${cameraId}:`, error.message);
    }

    // If resume fails, try next video source or restart from beginning
    if (retryCount < 5) { // Increased retry attempts
      setRetryCount(prev => prev + 1);
      
      // Add progressive delay between retries
      const delay = Math.min(2000 * (retryCount + 1), 10000);
      console.log(`⏳ Retrying video load for ${cameraId} in ${delay/1000} seconds...`);
      
      retryTimeoutRef.current = setTimeout(() => {
        tryLoadVideo();
      }, delay);
    } else {
      console.log(`❌ Max retries reached for ${cameraId}, switching to enhanced simulation`);
      switchToSimulation();
    }
  };

  // Switch to canvas simulation
  const switchToSimulation = () => {
    setVideoState('canvas');
    const canvas = canvasRef.current;
    if (canvas) {
      canvas.width = 640;
      canvas.height = 360;
      cleanupRef.current = createSimulatedVideo(canvas, cameraId);
    }
  };

  // Enhanced video loading with better error handling and persistence
  const tryLoadVideo = async () => {
    const video = videoRef.current;
    if (!video) return;

    setVideoState('loading');
    
    // Get location-specific videos
    const locationVideos = getLocationVideos(cameraId);

    for (let i = 0; i < locationVideos.length; i++) {
      const src = locationVideos[i];
      
      try {
        console.log(`📹 Trying video source ${i + 1}/${locationVideos.length} for ${cameraId}: ${src}`);
        
        // Complete video element reset
        video.pause();
        video.removeAttribute('src');
        video.load();
        
        // Clear any existing event listeners
        video.onloadeddata = null;
        video.onerror = null;
        video.onended = null;
        video.onstalled = null;
        video.onwaiting = null;
        video.oncanplay = null;
        
        // Set new source with enhanced attributes
        video.src = src;
        video.crossOrigin = 'anonymous';
        video.preload = 'auto'; // Changed to 'auto' for better loading
        video.muted = true; // Ensure muted for autoplay
        video.playsInline = true;
        video.loop = true;
        
        await new Promise((resolve, reject) => {
          const timeout = setTimeout(() => {
            reject(new Error('Video load timeout (15s)'));
          }, 15000); // Increased timeout to 15 seconds
          
          const onLoadedData = () => {
            clearTimeout(timeout);
            video.removeEventListener('loadeddata', onLoadedData);
            video.removeEventListener('error', onError);
            video.removeEventListener('abort', onError);
            resolve();
          };
          
          const onError = (e) => {
            clearTimeout(timeout);
            video.removeEventListener('loadeddata', onLoadedData);
            video.removeEventListener('error', onError);
            video.removeEventListener('abort', onError);
            const errorMsg = e.target?.error?.message || e.message || 'Video load failed';
            reject(new Error(`Video load error: ${errorMsg}`));
          };
          
          video.addEventListener('loadeddata', onLoadedData);
          video.addEventListener('error', onError);
          video.addEventListener('abort', onError);
          
          video.load();
        });
        
        // Video loaded successfully
        setVideoState('video');
        setLastError(null);
        setRetryCount(0);
        
        // Setup enhanced event listeners for continuous monitoring
        video.onended = () => {
          console.log(`📹 Video ended for ${cameraId}, restarting...`);
          video.currentTime = 0;
          video.play().catch(error => {
            console.error(`❌ Failed to restart video for ${cameraId}:`, error);
            attemptVideoRecovery();
          });
        };
        
        video.onerror = (e) => {
          const errorMsg = e.target?.error?.message || 'Video playback error';
          console.error(`📹 Video error for ${cameraId}:`, errorMsg);
          setLastError(errorMsg);
          attemptVideoRecovery();
        };
        
        video.onstalled = () => {
          console.log(`📹 Video stalled for ${cameraId}, attempting recovery...`);
          setTimeout(() => {
            if (video.readyState < 3) { // HAVE_FUTURE_DATA
              attemptVideoRecovery();
            }
          }, 5000); // Wait 5 seconds before recovery
        };
        
        video.onwaiting = () => {
          console.log(`📹 Video waiting for data for ${cameraId}...`);
          // Don't immediately recover on waiting, give it time to buffer
        };
        
        video.oncanplay = () => {
          console.log(`📹 Video can play for ${cameraId}`);
        };
        
        // Enhanced playback attempt with multiple strategies
        try {
          // Strategy 1: Direct play
          await video.play();
          console.log(`✅ Video playing successfully for ${cameraId}`);
          
        } catch (playError) {
          console.log(`⚠️ Direct play failed for ${cameraId}, trying alternative approach:`, playError.message);
          
          // Strategy 2: Reset and play after short delay
          try {
            video.currentTime = 0;
            await new Promise(resolve => setTimeout(resolve, 500));
            await video.play();
            console.log(`✅ Video playing after reset for ${cameraId}`);
            
          } catch (retryError) {
            console.log(`⚠️ Autoplay prevented for ${cameraId}, but video is loaded:`, retryError.message);
            // Video is loaded but autoplay was prevented - this is still success
            // User interaction will be needed to start playback
          }
        }
        
        // Setup health check regardless of play success
        setupVideoHealthCheck(video);
        
        return; // Success, exit the loop
        
      } catch (error) {
        console.log(`❌ Failed to load video source ${i + 1} for ${cameraId}:`, error.message);
        setLastError(error.message);
        
        // If this was the last source, switch to simulation
        if (i === locationVideos.length - 1) {
          console.log(`❌ All video sources failed for ${cameraId}, using enhanced simulation`);
          switchToSimulation();
        }
      }
    }
  };

  // Enhanced manual retry function
  const handleManualRetry = () => {
    console.log(`🔄 Manual retry triggered for ${cameraId}`);
    
    // Clear all timeouts and intervals
    if (retryTimeoutRef.current) {
      clearTimeout(retryTimeoutRef.current);
    }
    if (healthCheckRef.current) {
      clearInterval(healthCheckRef.current);
    }
    
    // Reset state
    setRetryCount(0);
    setLastError(null);
    setVideoState('loading');
    
    // Clean up video element
    const video = videoRef.current;
    if (video) {
      video.pause();
      video.removeAttribute('src');
      video.load();
    }
    
    // Start fresh video loading after a brief delay
    setTimeout(() => {
      tryLoadVideo();
    }, 500);
  };

  useEffect(() => {
    // Cleanup previous resources
    if (cleanupRef.current) {
      cleanupRef.current();
      cleanupRef.current = null;
    }
    
    if (healthCheckRef.current) {
      clearInterval(healthCheckRef.current);
    }
    
    if (retryTimeoutRef.current) {
      clearTimeout(retryTimeoutRef.current);
    }

    // Start video loading
    tryLoadVideo();

    // Set up periodic refresh to prevent long-term degradation
    const refreshInterval = setInterval(() => {
      console.log(`🔄 Periodic refresh for ${cameraId} to maintain video quality`);
      
      // Only refresh if we're currently showing video (not simulation)
      if (videoState === 'video') {
        const video = videoRef.current;
        if (video && !video.error && video.readyState >= 2) {
          // Video is healthy, just reset retry count
          setRetryCount(0);
        } else {
          // Video might be degrading, attempt recovery
          attemptVideoRecovery();
        }
      }
    }, 300000); // Refresh every 5 minutes to prevent degradation

    // Cleanup on unmount
    return () => {
      clearInterval(refreshInterval);
      if (cleanupRef.current) {
        cleanupRef.current();
      }
      if (healthCheckRef.current) {
        clearInterval(healthCheckRef.current);
      }
      if (retryTimeoutRef.current) {
        clearTimeout(retryTimeoutRef.current);
      }
    };
  }, [cameraId, index]);

  return (
    <div className="camera-video-container">
      {/* Video element with click-to-refresh */}
      <video
        ref={videoRef}
        className="camera-video"
        autoPlay
        muted
        loop
        playsInline
        style={{ display: videoState === 'video' ? 'block' : 'none', cursor: 'pointer' }}
        onClick={handleManualRetry}
        title="Click to refresh video stream"
      />

      {/* Canvas simulation */}
      <canvas
        ref={canvasRef}
        className="camera-video"
        style={{ display: videoState === 'canvas' ? 'block' : 'none' }}
      />

      {/* Loading state */}
      {videoState === 'loading' && (
        <div className="camera-placeholder">
          <div className="placeholder-content">
            <div className="loading-spinner"></div>
            <span className="placeholder-text">
              {retryCount > 0 ? `RECONNECTING... (${retryCount}/3)` : 'INITIALIZING FEED...'}
            </span>
            <span className="placeholder-subtext">{cameraName}</span>
            {lastError && (
              <span className="error-text" style={{ fontSize: '10px', color: '#ff6666' }}>
                {lastError}
              </span>
            )}
          </div>
        </div>
      )}

      {/* Error state with retry option */}
      {videoState === 'error' && (
        <div className="camera-placeholder">
          <div className="placeholder-content">
            <Camera size={48} />
            <span className="placeholder-text">CAMERA OFFLINE</span>
            <span className="placeholder-subtext">{cameraName}</span>
            {lastError && (
              <span className="error-text" style={{ fontSize: '10px', color: '#ff6666', marginBottom: '10px' }}>
                {lastError}
              </span>
            )}
            <button 
              className="retry-button"
              onClick={handleManualRetry}
              style={{
                background: '#00ff88',
                color: '#000',
                border: 'none',
                padding: '6px 12px',
                borderRadius: '4px',
                cursor: 'pointer',
                fontSize: '12px',
                display: 'flex',
                alignItems: 'center',
                gap: '4px'
              }}
            >
              <RefreshCw size={12} />
              Retry
            </button>
          </div>
        </div>
      )}

      {/* Always show overlay */}
      <div className="camera-overlay">
        <div className="camera-overlay-top">
          <div className="camera-id">{cameraId}</div>
          <div className="live-indicator">
            <div className="live-dot" style={{
              backgroundColor: videoState === 'video' ? '#00ff88' : 
                             videoState === 'canvas' ? '#ffaa00' : '#ff4444'
            }}></div>
            <span>{videoState === 'video' ? 'LIVE' : 
                   videoState === 'canvas' ? 'SIM' : 'OFF'}</span>
          </div>
        </div>
        <div className="camera-overlay-bottom">
          <div className="camera-location">{cameraName}</div>
          <div className="camera-timestamp">
            {new Date().toLocaleTimeString()}
          </div>
        </div>
      </div>

      {/* Scanning line effect for canvas mode */}
      {videoState === 'canvas' && <div className="scanning-line"></div>}
      
      {/* Manual retry button for canvas mode */}
      {videoState === 'canvas' && (
        <button 
          className="video-retry-overlay"
          onClick={handleManualRetry}
          style={{
            position: 'absolute',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            background: 'rgba(0, 255, 136, 0.2)',
            color: '#00ff88',
            border: '1px solid #00ff88',
            padding: '8px 16px',
            borderRadius: '4px',
            cursor: 'pointer',
            fontSize: '12px',
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            zIndex: 10
          }}
          title="Click to retry video stream"
        >
          <RefreshCw size={14} />
          Retry Video
        </button>
      )}
    </div>
  );
};

export default CameraVideo;