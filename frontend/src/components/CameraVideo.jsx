import { useState, useEffect, useRef } from 'react';
import { Camera } from 'lucide-react';
import { createSimulatedVideo } from '../utils/videoUtils';

const CameraVideo = ({ cameraId, cameraName, index }) => {
  const [videoState, setVideoState] = useState('loading'); // loading, video, canvas, error
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const cleanupRef = useRef(null);

  // Location-specific video URLs - now using local CCTV files
  const getLocationVideos = (cameraId) => {
    const videoMap = {
      'CAM001': [`/cctv/cam1.mp4`], // City Center
      'CAM002': [`/cctv/cam2.mp4`], // Metro Station  
      'CAM003': [`/cctv/cam3.mp4`], // Airport Gate
      'CAM004': [`/cctv/cam4.mp4`], // Shopping Mall
      'CAM005': [`/cctv/cam5.mp4`], // Park Entrance
      'CAM006': [`/cctv/cam6.mp4`]  // Highway Bridge
    };
    return videoMap[cameraId] || videoMap['CAM001'];
  };

  useEffect(() => {
    // Cleanup previous animation if exists
    if (cleanupRef.current) {
      cleanupRef.current();
      cleanupRef.current = null;
    }

    // Try to load video with multiple fallback options
    const tryLoadVideo = async () => {
      const video = videoRef.current;
      if (!video) return;

      // Get location-specific videos
      const locationVideos = getLocationVideos(cameraId);
      
      // List of video sources to try - prioritize local CCTV files
      const videoSources = [
        ...locationVideos, // Local CCTV files first
        `/cctv/cam${index}.mp4` // Fallback to index-based naming
      ];

      for (const src of videoSources) {
        try {
          video.src = src;
          video.crossOrigin = 'anonymous'; // For CORS
          
          await new Promise((resolve, reject) => {
            const timeout = setTimeout(() => reject(new Error('Timeout')), 8000);
            
            video.onloadeddata = () => {
              clearTimeout(timeout);
              resolve();
            };
            video.onerror = () => {
              clearTimeout(timeout);
              reject(new Error('Video load error'));
            };
            
            video.load();
          });
          
          setVideoState('video');
          video.play().catch(() => {
            console.log('Autoplay prevented, but video is loaded');
          });
          return;
        } catch (error) {
          console.log(`Failed to load video from ${src}:`, error.message);
        }
      }

      // If all video sources fail, use canvas simulation
      console.log(`All video sources failed for ${cameraId}, using location-specific simulation`);
      setVideoState('canvas');
      const canvas = canvasRef.current;
      if (canvas) {
        canvas.width = 640;
        canvas.height = 360;
        cleanupRef.current = createSimulatedVideo(canvas, cameraId);
      }
    };

    tryLoadVideo();

    // Cleanup on unmount
    return () => {
      if (cleanupRef.current) {
        cleanupRef.current();
      }
    };
  }, [cameraId, index]);

  return (
    <div className="camera-video-container">
      {/* Video element */}
      <video
        ref={videoRef}
        className="camera-video"
        autoPlay
        muted
        loop
        playsInline
        style={{ display: videoState === 'video' ? 'block' : 'none' }}
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
            <span className="placeholder-text">INITIALIZING FEED...</span>
            <span className="placeholder-subtext">{cameraName}</span>
          </div>
        </div>
      )}

      {/* Error state */}
      {videoState === 'error' && (
        <div className="camera-placeholder">
          <div className="placeholder-content">
            <Camera size={48} />
            <span className="placeholder-text">CAMERA OFFLINE</span>
            <span className="placeholder-subtext">{cameraName}</span>
          </div>
        </div>
      )}

      {/* Always show overlay */}
      <div className="camera-overlay">
        <div className="camera-overlay-top">
          <div className="camera-id">{cameraId}</div>
          <div className="live-indicator">
            <div className="live-dot"></div>
            <span>LIVE</span>
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
    </div>
  );
};

export default CameraVideo;