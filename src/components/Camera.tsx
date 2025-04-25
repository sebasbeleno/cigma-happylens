import { useRef, useEffect, useState } from 'react';
import './Camera.css';

interface CameraProps {
  onFrame: (videoElement: HTMLVideoElement) => void;
  showFaceLandmarks?: boolean;
  isActive: boolean;
}

const Camera = ({ onFrame, showFaceLandmarks = false, isActive }: CameraProps) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [permissionDenied, setPermissionDenied] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let stream: MediaStream | null = null;

    const startCamera = async () => {
      try {
        if (!isActive) {
          if (stream) {
            stream.getTracks().forEach(track => track.stop());
          }
          setIsLoading(false);
          return;
        }

        setIsLoading(true);
        stream = await navigator.mediaDevices.getUserMedia({
          video: { 
            facingMode: 'user',
            width: { ideal: 640 },
            height: { ideal: 480 }
          },
          audio: false,
        });
        
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          videoRef.current.onloadedmetadata = () => {
            // Video metadata has loaded - critical for TensorFlow.js processing
            console.log('Video metadata loaded, dimensions:', {
              width: videoRef.current?.videoWidth,
              height: videoRef.current?.videoHeight
            });
            videoRef.current?.play().catch(e => {
              console.error('Error playing video:', e);
            });
          };
          setPermissionDenied(false);
        }
      } catch (error) {
        console.error('Error accessing camera:', error);
        setPermissionDenied(true);
      } finally {
        setIsLoading(false);
      }
    };

    startCamera();

    return () => {
      if (stream) {
        stream.getTracks().forEach(track => track.stop());
      }
    };
  }, [isActive]);

  useEffect(() => {
    const videoElement = videoRef.current;
    const canvasElement = canvasRef.current;
    
    if (!videoElement || !isActive || isLoading || !canvasElement) return;

    // Update canvas dimensions to match video and container
    const updateCanvasDimensions = () => {
      if (videoElement.readyState >= 2) {
        const containerWidth = videoElement.offsetWidth;
        const containerHeight = videoElement.offsetHeight;
        const videoWidth = videoElement.videoWidth;
        const videoHeight = videoElement.videoHeight;
        
        // Set canvas display size to match the container
        canvasElement.style.width = `${containerWidth}px`;
        canvasElement.style.height = `${containerHeight}px`;
        
        // Set canvas drawing dimensions to match video intrinsic size
        canvasElement.width = videoWidth;
        canvasElement.height = videoHeight;
        
        // Scale canvas context to compensate for the video-to-display ratio
        const ctx = canvasElement.getContext('2d');
        if (ctx) {
          const scaleX = containerWidth / videoWidth;
          const scaleY = containerHeight / videoHeight;
          ctx.setTransform(scaleX, 0, 0, scaleY, 0, 0);
        }
      }
    };

    // Set initial dimensions
    updateCanvasDimensions();
    
    // Update dimensions when video metadata loads or size changes
    videoElement.addEventListener('loadedmetadata', updateCanvasDimensions);
    window.addEventListener('resize', updateCanvasDimensions);
    
    // Use ResizeObserver to monitor video element size changes
    const resizeObserver = new ResizeObserver(() => {
      updateCanvasDimensions();
    });
    resizeObserver.observe(videoElement);
    
    const processFrame = () => {
      if (videoElement.readyState === 4) {
        onFrame(videoElement);
        // Don't update dimensions on every frame to prevent flickering
      }
      animationFrameId = requestAnimationFrame(processFrame);
    };

    let animationFrameId = requestAnimationFrame(processFrame);

    return () => {
      cancelAnimationFrame(animationFrameId);
      videoElement.removeEventListener('loadedmetadata', updateCanvasDimensions);
      window.removeEventListener('resize', updateCanvasDimensions);
      resizeObserver.disconnect();
    };
  }, [onFrame, isActive, isLoading]);

  if (permissionDenied) {
    return (
      <div className="camera-error">
        <p>Camera access denied. Please allow camera access to use this feature.</p>
      </div>
    );
  }

  return (
    <div className="camera-container">
      {isLoading && (
        <div className="camera-loading">
          <p>Initializing camera...</p>
        </div>
      )}
      <video 
        ref={videoRef} 
        autoPlay 
        playsInline 
        muted
        className={`camera-video ${isLoading ? 'hidden' : ''}`}
      />
      {showFaceLandmarks && (
        <canvas 
          ref={canvasRef}
          className="landmarks-overlay"
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
            pointerEvents: 'none',
            zIndex: 10
          }}
        />
      )}
    </div>
  );
};

export default Camera;
