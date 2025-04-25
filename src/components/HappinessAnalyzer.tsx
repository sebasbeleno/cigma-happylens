import { useEffect, useState, useRef } from 'react';
import { FaceLandmarksDetector } from '@tensorflow-models/face-landmarks-detection';
import { calculateHappinessScore, drawFaceLandmarks } from '../utils/faceAnalysis';

interface HappinessAnalyzerProps {
  videoElement: HTMLVideoElement | null;
  faceDetector: FaceLandmarksDetector | null;
  isActive: boolean;
  onHappinessUpdate: (score: number) => void;
}

const HappinessAnalyzer = ({ 
  videoElement, 
  faceDetector, 
  isActive, 
  onHappinessUpdate 
}: HappinessAnalyzerProps) => {
  const [lastUpdateTime, setLastUpdateTime] = useState(0);
  const requestIdRef = useRef<number | null>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  // Analyze facial expressions and calculate happiness score
  const analyzeHappiness = async () => {
    if (!faceDetector || !videoElement || !isActive) {
      console.log('Missing required inputs:', { 
        hasFaceDetector: !!faceDetector, 
        hasVideoElement: !!videoElement, 
        isActive 
      });
      return;
    }
    
    try {
      // Check video dimensions and readiness
      console.log('Video status:', {
        width: videoElement.videoWidth,
        height: videoElement.videoHeight,
        readyState: videoElement.readyState
      });
      
      // Detect face landmarks
      console.log('Attempting to detect faces...');
      
      // Make sure video dimensions are valid before processing
      if (videoElement.videoWidth === 0 || videoElement.videoHeight === 0) {
        console.warn('Video dimensions are invalid:', {
          width: videoElement.videoWidth,
          height: videoElement.videoHeight
        });
        return;
      }
      
      // Enhanced face detection with alternate approach
      // Capture current frame as ImageData to provide to TensorFlow
      try {
        // Create temporary canvas to extract frame data if needed
        const tempCanvas = document.createElement('canvas');
        const tempCtx = tempCanvas.getContext('2d');
        
        if (tempCtx) {
          // Set canvas to video dimensions
          tempCanvas.width = videoElement.videoWidth;
          tempCanvas.height = videoElement.videoHeight;
          
          // Draw current video frame to canvas
          tempCtx.drawImage(videoElement, 0, 0, tempCanvas.width, tempCanvas.height);
          
          // Now try detection on the video element directly
          const faces = await faceDetector.estimateFaces(videoElement);
          console.log('Faces detected from video:', faces.length);
          
          // If no faces detected on video element, try with canvas as fallback
          if (faces.length === 0) {
            console.log('Trying alternate detection method with canvas...');
            const canvasFaces = await faceDetector.estimateFaces(tempCanvas);
            console.log('Faces detected from canvas:', canvasFaces.length);
            
            // If we found faces with the canvas method, use those instead
            if (canvasFaces.length > 0) {
              const face = canvasFaces[0];
              const landmarks = face.keypoints;
              
              // Calculate happiness score using our utility function
              const happinessScore = calculateHappinessScore(
                landmarks, 
                videoElement.videoWidth, 
                videoElement.videoHeight
              );
              
              // Draw landmarks if canvas is available
              if (canvasRef.current) {
                drawFaceLandmarks(face, canvasRef.current, videoElement);
              }
              
              // Update happiness score
              onHappinessUpdate(happinessScore);
              return;
            }
          }
          
          // Process faces detected from video if any
          if (faces.length > 0) {
            const face = faces[0];
            const landmarks = face.keypoints;
            
            // Calculate happiness score using our utility function
            const happinessScore = calculateHappinessScore(
              landmarks, 
              videoElement.videoWidth, 
              videoElement.videoHeight
            );
            
            // Draw landmarks if canvas is available
            if (canvasRef.current) {
              drawFaceLandmarks(face, canvasRef.current, videoElement);
            }
            
            // Update happiness score
            onHappinessUpdate(happinessScore);
          } else {
            // No face detected with either method
            onHappinessUpdate(0);
          }
        } else {
          // Fallback to original method if canvas context not available
          const faces = await faceDetector.estimateFaces(videoElement);
          console.log('Faces detected (fallback):', faces.length);
          
          if (faces.length === 0) {
            onHappinessUpdate(0);
            return;
          }
          
          const face = faces[0];
          const landmarks = face.keypoints;
          
          // Calculate happiness score
          const happinessScore = calculateHappinessScore(
            landmarks, 
            videoElement.videoWidth, 
            videoElement.videoHeight
          );
          
          // Draw landmarks
          if (canvasRef.current) {
            drawFaceLandmarks(face, canvasRef.current, videoElement);
          }
          
          // Update happiness score
          onHappinessUpdate(happinessScore);
        }
      } catch (detectionError) {
        console.error('Face detection error:', detectionError);
        onHappinessUpdate(0);
      }
    } catch (error) {
      console.error('Error analyzing happiness:', error);
    }
  };

  useEffect(() => {
    const tick = () => {
      const now = performance.now();
      // Limit to ~15 fps for performance
      if (now - lastUpdateTime > 66) {
        // Only analyze when video is fully ready
        if (videoElement && videoElement.readyState === 4) {
          analyzeHappiness();
          setLastUpdateTime(now);
        } else if (videoElement) {
          console.log('Video not ready:', videoElement.readyState);
        }
      }
      requestIdRef.current = requestAnimationFrame(tick);
    };

    if (isActive && faceDetector && videoElement) {
      console.log('Starting happiness analysis loop');
      requestIdRef.current = requestAnimationFrame(tick);
    }
    
    return () => {
      if (requestIdRef.current) {
        cancelAnimationFrame(requestIdRef.current);
      }
    };
  }, [isActive, faceDetector, videoElement, lastUpdateTime]);

  return (
    <canvas
      ref={canvasRef}
      className="landmarks-canvas"
      style={{
        position: 'absolute',
        top: 0,
        left: 0,
        pointerEvents: 'none',
        zIndex: 10,
      }}
    />
  );
};

export default HappinessAnalyzer;
