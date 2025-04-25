import React from 'react';
import './ControlPanel.css';

interface ControlPanelProps {
  isCameraActive: boolean;
  showLandmarks: boolean;
  onCameraToggle: () => void;
  onLandmarksToggle: () => void;
}

const ControlPanel = ({
  isCameraActive,
  showLandmarks,
  onCameraToggle,
  onLandmarksToggle
}: ControlPanelProps) => {
  return (
    <div className="control-panel">
      <button 
        className={`control-button ${isCameraActive ? 'active' : ''}`}
        onClick={onCameraToggle}
        aria-label={isCameraActive ? 'Apagar cámara' : 'Encender cámara'}
      >
        <span className="control-icon">
          {isCameraActive ? '📷' : '🚫'}
        </span>
        <span className="control-label">
          {isCameraActive ? 'Apagar Cámara' : 'Encender Cámara'}
        </span>
      </button>
      
      <button 
        className={`control-button ${showLandmarks ? 'active' : ''}`}
        onClick={onLandmarksToggle}
        disabled={!isCameraActive}
        aria-label={showLandmarks ? 'Ocultar puntos faciales' : 'Mostrar puntos faciales'}
      >
        <span className="control-icon">
          {showLandmarks ? '👁️' : '👁️‍🗨️'}
        </span>
        <span className="control-label">
          {showLandmarks ? 'Ocultar Puntos' : 'Mostrar Puntos'}
        </span>
      </button>
    </div>
  );
};

export default ControlPanel;
