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
        aria-label={isCameraActive ? 'Turn off camera' : 'Turn on camera'}
      >
        <span className="control-icon">
          {isCameraActive ? '📷' : '🚫'}
        </span>
        <span className="control-label">
          {isCameraActive ? 'Turn Off Camera' : 'Turn On Camera'}
        </span>
      </button>
      
      <button 
        className={`control-button ${showLandmarks ? 'active' : ''}`}
        onClick={onLandmarksToggle}
        disabled={!isCameraActive}
        aria-label={showLandmarks ? 'Hide face landmarks' : 'Show face landmarks'}
      >
        <span className="control-icon">
          {showLandmarks ? '👁️' : '👁️‍🗨️'}
        </span>
        <span className="control-label">
          {showLandmarks ? 'Hide Landmarks' : 'Show Landmarks'}
        </span>
      </button>
    </div>
  );
};

export default ControlPanel;
