import { useEffect, useState, useRef } from 'react';
import * as tf from '@tensorflow/tfjs';
import * as faceLandmarksDetection from '@tensorflow-models/face-landmarks-detection';
import { FaceLandmarksDetector } from '@tensorflow-models/face-landmarks-detection';

interface FaceDetectorProps {
  children: (props: {
    isModelLoading: boolean;
    faceDetector: FaceLandmarksDetector | null;
    modelLoadError: string | null;
  }) => React.ReactNode;
}

const FaceDetector = ({ children }: FaceDetectorProps) => {
  const [isModelLoading, setIsModelLoading] = useState(true);
  const [modelLoadError, setModelLoadError] = useState<string | null>(null);
  const faceDetectorRef = useRef<FaceLandmarksDetector | null>(null);

  useEffect(() => {
    const loadModel = async () => {
      try {
        setIsModelLoading(true);
        setModelLoadError(null);

        // Make sure TensorFlow is ready
        await tf.ready();
        
        // Output TensorFlow backend info for debugging
        console.log('TensorFlow backend info:', {
          backend: tf.getBackend(),
          debugging: tf.ENV.get('DEBUG')
        });
        
        // Configure the MediaPipe FaceMesh model with optimized parameters for webcam detection
        faceDetectorRef.current = await faceLandmarksDetection.createDetector(
          faceLandmarksDetection.SupportedModels.MediaPipeFaceMesh,
          {
            runtime: 'tfjs', 
            maxFaces: 1,
            // Simplified configuration with essential parameters
            refineLandmarks: true,
          }
        );
        
        console.log('Face detection model loaded successfully');
      } catch (error) {
        console.error('Failed to load face detection model:', error);
        setModelLoadError('No se pudo cargar el modelo de detección facial. Por favor, inténtalo de nuevo más tarde.');
      } finally {
        setIsModelLoading(false);
      }
    };

    loadModel();

    return () => {
      // Cleanup if needed
      if (faceDetectorRef.current) {
        // No explicit dispose method available, but we can set to null
        faceDetectorRef.current = null;
      }
    };
  }, []);

  return children({
    isModelLoading,
    faceDetector: faceDetectorRef.current,
    modelLoadError,
  });
};

export default FaceDetector;
