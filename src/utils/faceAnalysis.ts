/**
 * Utility functions for happiness detection from facial landmarks
 */

/**
 * Calculate a happiness score from facial landmarks
 * Enhanced implementation with improved accuracy and NaN prevention
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

    // Check for sufficient landmarks for analysis
    if (mouthLandmarks.length < 10 || eyeLandmarks.length < 10) {
      console.log('Insufficient landmarks for happiness analysis:', 
                 `mouth: ${mouthLandmarks.length}, eyes: ${eyeLandmarks.length}`);
      return 0;
    }

    // Calculate smile score with improved algorithm
    const smileScore = calculateSmileScore(mouthLandmarks, eyeLandmarks, imageWidth, imageHeight);
    
    // Guard against NaN values
    if (isNaN(smileScore)) {
      console.warn('Smile score calculation produced NaN, defaulting to 0');
      return 0;
    }
    
    // Apply a sigmoid-like transformation to make the score distribution more natural
    // This creates a more gradual curve in the middle range and plateaus at extremes
    const adjustedScore = 100 / (1 + Math.exp(-6 * (smileScore - 0.5)));
    
    // Round to nearest 10 for more playful, child-friendly steps (0, 10, 20, 30...)
    return Math.round(adjustedScore / 10) * 10;
  } catch (error) {
    console.error('Error calculating happiness score:', error);
    return 0;
  }
};

/**
 * Calculate a smile score based on mouth curvature and eye shape
 * Enhanced algorithm with improved accuracy and NaN prevention
 */
const calculateSmileScore = (
  mouthLandmarks: any[], 
  eyeLandmarks: any[],
  imageWidth: number,
  _imageHeight: number // Using underscore to indicate unused parameter
): number => {
  // Find mouth corners and center points
  const mouthPoints = organizePoints(mouthLandmarks);
  const eyePoints = organizePoints(eyeLandmarks);
  
  if (!mouthPoints || !eyePoints) return 0;
  
  // Extract key points from the mouth
  const { leftCorner, rightCorner, topCenter } = mouthPoints;
  
  // Calculate key metrics with NaN prevention
  try {
    // Calculate mouth curvature - how much the mouth corners are raised relative to the center
    let mouthCurvature = calculateCurvature(leftCorner, topCenter, rightCorner);
    
    // Guard against invalid values
    if (isNaN(mouthCurvature) || !isFinite(mouthCurvature)) {
      console.warn('Invalid mouth curvature detected, defaulting to 0');
      mouthCurvature = 0;
    }
    
    // Normalize curvature to a reasonable range (typically between -0.5 and 0.5)
    mouthCurvature = Math.max(-0.5, Math.min(0.5, mouthCurvature));
    
    // Offset and scale to convert to a 0-1 range
    // -0.5 (frown) maps to 0, 0.5 (smile) maps to 1
    mouthCurvature = (mouthCurvature + 0.5) / 1.0;
    
    // Calculate eye narrowing (Duchenne marker for genuine smiles)
    const eyeNarrowing = calculateEyeNarrowing(eyePoints);
    
    // Calculate mouth width ratio (smiles tend to be wider)
    const mouthWidth = Math.hypot(rightCorner.x - leftCorner.x, rightCorner.y - leftCorner.y) / imageWidth;
    const normalizedMouthWidth = Math.min(Math.max(mouthWidth * 2, 0), 1); // Scale appropriately
    
    // Simplify signal combination for a more playful, less accurate experience
    // Emphasize mouth curvature even more for a child-friendly app
    // Mouth curvature is now 70% of the score (kids smile wide!)
    // Eye narrowing is 20% (cheek raising)
    // Mouth width is 10% 
    const rawScore = (mouthCurvature * 0.7) + (eyeNarrowing * 0.2) + (normalizedMouthWidth * 0.1);
    
    // Less precise adjustment - more forgiving, more fun!
    // This makes it easier to get higher scores (more rewarding for kids)
    return Math.max(0, Math.min(1, Math.pow(rawScore, 1.0)));
  } catch (error) {
    console.error('Error in smile score calculation:', error);
    return 0;
  }
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
 * Enhanced with improved accuracy and NaN prevention
 */
const calculateCurvature = (p1: any, p2: any, p3: any): number => {
  try {
    // Convert to 2D points for calculation
    const x1 = p1.x, y1 = p1.y;
    const y2 = p2.y;
    const x3 = p3.x, y3 = p3.y;
    
    // Calculate a simple approximation of curvature
    // For smile detection, we care about whether the middle point is higher or lower than the average of endpoints
    const midY = (y1 + y3) / 2;
    const diff = midY - y2;
    
    // Calculate distance between end points (for normalization)
    const distance = Math.sqrt((x3 - x1) * (x3 - x1) + (y3 - y1) * (y3 - y1));
    
    // Guard against division by zero or very small distances
    if (distance < 0.001) {
      return 0;
    }
    
    // Normalize and reverse since y increases downward in image coordinates
    // This gives positive values for smiles and negative for frowns
    return diff / distance;
  } catch (error) {
    console.error('Error calculating curvature:', error);
    return 0;
  }
};

/**
 * Calculate eye narrowing (Duchenne marker for genuine smiles)
 * Enhanced implementation that analyzes actual eye shape
 */
const calculateEyeNarrowing = (eyePoints: any): number => {
  try {
    if (!eyePoints || !eyePoints.leftCorner || !eyePoints.rightCorner || 
        !eyePoints.topCenter || !eyePoints.bottomCenter) {
      return 0.5; // Default middle value if points are insufficient
    }
    
    // Calculate eye aspect ratio (height/width)
    // For genuine smiles, eyes narrow, resulting in a smaller ratio
    const eyeHeight = Math.abs(eyePoints.topCenter.y - eyePoints.bottomCenter.y);
    const eyeWidth = Math.abs(eyePoints.rightCorner.x - eyePoints.leftCorner.x);
    
    // Guard against division by zero
    if (eyeWidth < 0.001) {
      return 0.5;
    }
    
    const aspectRatio = eyeHeight / eyeWidth;
    
    // Normalize to 0-1 range, with typical values around 0.3-0.7
    // Lower values (narrower eyes) indicate genuine smiles
    // We invert the scale so higher values indicate more happiness
    
    // Typical range for eye aspect ratio: 0.2 (narrow) to 0.5 (wide)
    const normalizedRatio = 1 - Math.min(Math.max((aspectRatio - 0.2) / 0.3, 0), 1);
    
    return normalizedRatio;
  } catch (error) {
    console.error('Error calculating eye narrowing:', error);
    return 0.5; // Default to middle value on error
  }
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
