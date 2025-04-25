import React from 'react';
import './HappinessMeter.css';

interface HappinessMeterProps {
  score: number;
}

const HappinessMeter = ({ score }: HappinessMeterProps) => {
  // Function to determine the color based on score
  const getGradientColor = (value: number) => {
    // Red at 0%, Yellow at 50%, Green at 100%
    if (value < 50) {
      // Red to Yellow (0 to 50)
      const r = 255;
      const g = Math.round((value / 50) * 255);
      const b = 0;
      return `rgb(${r}, ${g}, ${b})`;
    } else {
      // Yellow to Green (50 to 100)
      const r = Math.round((1 - (value - 50) / 50) * 255);
      const g = 255;
      const b = 0;
      return `rgb(${r}, ${g}, ${b})`;
    }
  };

  // Emoji selection based on happiness score
  const getEmoji = (score: number) => {
    if (score < 20) return '😔';
    if (score < 40) return '😐';
    if (score < 60) return '🙂';
    if (score < 80) return '😊';
    return '😁';
  };

  return (
    <div className="happiness-meter-container">
      <div className="happiness-meter-label">
        <span className="happiness-emoji">{getEmoji(score)}</span>
        <span className="happiness-score">{score}%</span>
      </div>
      
      <div className="happiness-meter-track">
        <div
          className="happiness-meter-fill"
          style={{
            width: `${score}%`,
            backgroundColor: getGradientColor(score),
            transition: 'width 0.3s ease-out, background-color 0.3s ease-out',
          }}
        />
      </div>
      
      <div className="happiness-meter-markers">
        <span>0%</span>
        <span>25%</span>
        <span>50%</span>
        <span>75%</span>
        <span>100%</span>
      </div>
    </div>
  );
};

export default HappinessMeter;
