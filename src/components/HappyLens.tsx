import { useState } from 'react';
import Camera from './Camera';
import FaceDetector from './FaceDetector';
import HappinessAnalyzer from './HappinessAnalyzer';
import HappinessMeter from './HappinessMeter';
import ControlPanel from './ControlPanel';
import './HappyLens.css';

const HappyLens = () => {
  const [isCameraActive, setIsCameraActive] = useState(true);
  const [happinessScore, setHappinessScore] = useState(0);
  const [showLandmarks, setShowLandmarks] = useState(false);
  const [activeVideo, setActiveVideo] = useState<HTMLVideoElement | null>(null);

  const handleCameraToggle = () => {
    setIsCameraActive(!isCameraActive);
  };

  const handleLandmarksToggle = () => {
    setShowLandmarks(!showLandmarks);
  };

  const handleVideoFrame = (videoElement: HTMLVideoElement) => {
    setActiveVideo(videoElement);
  };

  const handleHappinessUpdate = (score: number) => {
    setHappinessScore(score);
  };

  return (
    <div className="happy-lens-container">
      <header className="happy-lens-header">
        <h1>VisorAlegre</h1>
        <p>Análisis de felicidad en tiempo real a través de expresiones faciales</p>
      </header>

      <div className="happiness-display">
        <HappinessMeter score={happinessScore} />
      </div>

      <div className="camera-section">
        <FaceDetector>
          {({ isModelLoading, faceDetector, modelLoadError }) => (
            <>
              {modelLoadError && (
                <div className="error-message">
                  <p>{modelLoadError}</p>
                </div>
              )}
              
              {isModelLoading ? (
                <div className="loading-message">
                  <p>Cargando modelo de detección facial...</p>
                </div>
              ) : (
                <>
                  <Camera 
                    onFrame={handleVideoFrame}
                    showFaceLandmarks={showLandmarks}
                    isActive={isCameraActive}
                  />
                  
                  {activeVideo && faceDetector && (
                    <HappinessAnalyzer
                      videoElement={activeVideo}
                      faceDetector={faceDetector}
                      isActive={isCameraActive}
                      onHappinessUpdate={handleHappinessUpdate}
                    />
                  )}
                </>
              )}
            </>
          )}
        </FaceDetector>
      </div>

      <div className="controls">
        <ControlPanel
          isCameraActive={isCameraActive}
          showLandmarks={showLandmarks}
          onCameraToggle={handleCameraToggle}
          onLandmarksToggle={handleLandmarksToggle}
        />
      </div>

      <footer className="happy-lens-footer">
        <p>
          VisorAlegre usa TensorFlow.js para analizar expresiones faciales.
          Ningún dato sale de tu dispositivo - todo el procesamiento ocurre localmente en tu navegador.
        </p>
      </footer>
    </div>
  );
};

export default HappyLens;
