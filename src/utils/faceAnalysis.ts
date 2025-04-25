/**
 * Utility functions for happiness detection from facial landmarks
 */

/**
 * Calculate a happiness score from facial landmarks
 * This is a simplified implementation and could be enhanced with more complex analysis
 */
export const calculateHappinessScore = (landmarks: any[], imageWidth: number, imageHeight: number): number => {
  if (!landmarks || landmarks.length === 0) return 0;

  try {
    // Extract mouth landmarks from the face mesh
    const mouthLandmarks = landmarks.filter(
      landmark => landmark.name && landmark.name.toLowerCase().includes('lips')
    );
    
    const eyeLandmarks = landmarks.filter(
      landmark => landmark.name && 
      (landmark.name.toLowerCase().includes('eye') || 
       landmark.name.toLowerCase().includes('eyebrow'))
    );

    if (mouthLandmarks.length < 10 || eyeLandmarks.length < 10) {
      // Not enough landmarks detected for proper analysis
      return 0;
    }

    // Calculate mouth curvature (smile detection)
    const smileScore = calculateSmileScore(mouthLandmarks, eyeLandmarks, imageWidth, imageHeight);
    
    // Normalize to 0-100 range with some adjustments to make it more natural
    // This will need tuning based on testing
    return Math.min(Math.max(Math.round(smileScore * 100), 0), 100);
  } catch (error) {
    console.error('Error calculating happiness score:', error);
    return 0;
  }
};

/**
 * Calculate a smile score based on mouth curvature and eye shape
 */
const calculateSmileScore = (
  mouthLandmarks: any[], 
  eyeLandmarks: any[],
  imageWidth: number,
  imageHeight: number
): number => {
  // This is a simplified algorithm that can be improved
  
  // Find mouth corners and center points
  const mouthPoints = organizePoints(mouthLandmarks);
  const eyePoints = organizePoints(eyeLandmarks);
  
  if (!mouthPoints || !eyePoints) return 0;
  
  // Calculate smile curvature - how much the mouth corners are raised relative to the center
  const { leftCorner, rightCorner, topCenter, bottomCenter } = mouthPoints;
  
  // A smiling mouth typically has corners higher than the center
  const mouthCurvature = calculateCurvature(leftCorner, topCenter, rightCorner);
  
  // Eye narrowing is associated with genuine smiles (Duchenne marker)
  const eyeNarrowing = calculateEyeNarrowing(eyePoints);
  
  // Combine signals with appropriate weights
  // Mouth curvature is the primary signal (70%)
  // Eye narrowing is a secondary signal (30%)
  const rawScore = (mouthCurvature * 0.7) + (eyeNarrowing * 0.3);
  
  // Apply some non-linear adjustments to make the score more intuitive
  return Math.pow(rawScore, 1.5);
};

/**
 * Extract important facial points from landmarks
 */
const organizePoints = (landmarks: any[]) => {
  if (landmarks.length === 0) return null;
  
  // This is a simplified version - in a real implementation,
  // you would use the specific indices from the face mesh model
  
  // Find extremes for rough organization
  const leftMost = landmarks.reduce((prev, curr) => 
    (curr.x < prev.x) ? curr : prev, landmarks[0]);
    
  const rightMost = landmarks.reduce((prev, curr) => 
    (curr.x > prev.x) ? curr : prev, landmarks[0]);
    
  const topMost = landmarks.reduce((prev, curr) => 
    (curr.y < prev.y) ? curr : prev, landmarks[0]);
    
  const bottomMost = landmarks.reduce((prev, curr) => 
    (curr.y > prev.y) ? curr : prev, landmarks[0]);
  
  // Find approximate center points
  const centerX = (leftMost.x + rightMost.x) / 2;
  const centerY = (topMost.y + bottomMost.y) / 2;
  
  const topCenter = landmarks.reduce((prev, curr) => 
    (Math.abs(curr.x - centerX) < Math.abs(prev.x - centerX) && curr.y < centerY) ? 
    curr : prev, landmarks[0]);
    
  const bottomCenter = landmarks.reduce((prev, curr) => 
    (Math.abs(curr.x - centerX) < Math.abs(prev.x - centerX) && curr.y > centerY) ? 
    curr : prev, landmarks[0]);
  
  return {
    leftCorner: leftMost,
    rightCorner: rightMost,
    topCenter,
    bottomCenter
  };
};

/**
 * Calculate curvature of three points
 * Positive values indicate an upward curve (smile)
 * Negative values indicate a downward curve (frown)
 */
const calculateCurvature = (p1: any, p2: any, p3: any): number => {
  // Convert to 2D points for calculation
  const x1 = p1.x, y1 = p1.y;
  const x2 = p2.x, y2 = p2.y;
  const x3 = p3.x, y3 = p3.y;
  
  // Calculate a simple approximation of curvature
  // For smile detection, we care about whether the middle point is higher or lower than the average of endpoints
  const midY = (y1 + y3) / 2;
  const diff = midY - y2;
  
  // Normalize and reverse since y increases downward in image coordinates
  return diff / Math.sqrt((x3 - x1) * (x3 - x1) + (y3 - y1) * (y3 - y1));
};

/**
 * Calculate eye narrowing (Duchenne marker for genuine smiles)
 */
const calculateEyeNarrowing = (eyePoints: any): number => {
  // In a real implementation, you'd measure eye height/width ratio
  // and check for changes from a neutral expression
  
  // This is a placeholder implementation
  return 0.5; // Default middle value
};

/**
 * Draw facial landmarks on a canvas for visualization
 */
export const drawFaceLandmarks = (
  face: any, 
  canvas: HTMLCanvasElement, 
  video: HTMLVideoElement
) => {
  const ctx = canvas.getContext('2d');
  if (!ctx) return;
  
  // Resize canvas to match video dimensions
  canvas.width = video.videoWidth;
  canvas.height = video.videoHeight;
  
  // Clear canvas
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  
  // Apply same mirror effect as video has
  ctx.save();
  ctx.scale(-1, 1);
  ctx.translate(-canvas.width, 0);
  
  // Draw face bounding box
  if (face.box) {
    ctx.strokeStyle = 'rgba(0, 255, 0, 0.5)';
    ctx.lineWidth = 2;
    ctx.strokeRect(face.box.xMin, face.box.yMin, face.box.width, face.box.height);
  }
  
  // Draw landmarks by category
  face.keypoints.forEach((landmark: any) => {
    // Color-code different facial features
    if (landmark.name) {
      if (landmark.name.includes('lips')) {
        ctx.fillStyle = 'rgba(255, 0, 0, 0.7)'; // Red for lips
      } else if (landmark.name.includes('eye')) {
        ctx.fillStyle = 'rgba(0, 0, 255, 0.7)'; // Blue for eyes
      } else if (landmark.name.includes('nose')) {
        ctx.fillStyle = 'rgba(0, 255, 0, 0.7)'; // Green for nose
      } else {
        ctx.fillStyle = 'rgba(255, 255, 0, 0.5)'; // Yellow for other landmarks
      }
    } else {
      ctx.fillStyle = 'rgba(255, 255, 255, 0.5)'; // White for undefined landmarks
    }
    
    ctx.beginPath();
    ctx.arc(landmark.x, landmark.y, 2, 0, 2 * Math.PI);
    ctx.fill();
  });
  
  ctx.restore();
};
