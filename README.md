# VisorAlegre (HappyLens)

A real-time facial happiness analysis web application. This app uses your webcam to detect faces and analyze happiness levels based on facial expressions.

![VisorAlegre Screenshot](https://via.placeholder.com/800x450.png?text=VisorAlegre+Screenshot)

## What is VisorAlegre?

VisorAlegre is a web application that:
- Uses your device's camera to detect faces in real-time
- Analyzes facial expressions to determine happiness levels
- Displays a happiness score from 0-100
- Processes everything locally in the browser (no data is sent to servers)
- Uses TensorFlow.js for face detection and analysis

## Getting Started

### Prerequisites

Before running the application, you need to have the following installed:
- [Node.js](https://nodejs.org/) (version 18 or higher recommended)
- npm (comes with Node.js)

### Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/yourusername/cigma-happyLens.git
   cd cigma-happyLens
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

### Running the Application

1. Start the development server:
   ```bash
   npm run dev
   ```

2. Open your browser and navigate to:
   ```
   http://localhost:5173
   ```

3. When prompted, allow the application to access your camera.

### Building for Production

To create a production-ready build:

```bash
npm run build
```

The built files will be in the `dist` folder and can be deployed to any web server.

## How It Works

1. The application accesses your webcam using the browser's MediaDevices API
2. TensorFlow.js loads a face detection model that runs entirely in your browser
3. The app analyzes facial landmarks (points on your face) to detect expressions
4. The happiness analyzer calculates a score based on:
   - Mouth curvature (smiling vs. frowning)
   - Eye narrowing (which happens in genuine smiles)
   - Mouth width (smiles tend to make the mouth wider)
5. The results are displayed in real-time using a happiness meter

## Modifying the Face Analysis

If you want to customize how the application detects and analyzes facial happiness, you can modify the face analysis logic. The main file to edit is:

```
src/utils/faceAnalysis.ts
```

### Understanding the Face Analysis Code

The face analysis system works in the following steps:

1. **Detecting Facial Landmarks**: The application uses TensorFlow.js to identify key points on a face (eyes, mouth, etc.)

2. **Calculating Happiness**: The main function that calculates happiness is `calculateHappinessScore()`, which:
   - Takes facial landmarks as input
   - Extracts mouth and eye landmarks
   - Calculates various metrics (mouth curvature, eye narrowing)
   - Combines these metrics into a final happiness score

3. **Helper Functions**:
   - `calculateSmileScore()`: Combines various facial metrics into a smile score
   - `organizePoints()`: Groups facial landmarks into meaningful categories (left corner, right corner, etc.)
   - `calculateCurvature()`: Measures how much a set of points curves (for detecting smiles)
   - `calculateEyeNarrowing()`: Measures eye narrowing which occurs in genuine smiles

### How to Modify the Face Analysis

#### 1. Adjusting Sensitivity

To make the happiness detection more or less sensitive, locate this section in `faceAnalysis.ts`:

```typescript
// Apply a sigmoid-like transformation to make the score distribution more natural
const adjustedScore = 100 / (1 + Math.exp(-6 * (smileScore - 0.5)));
```

You can change the values:
- Increase `-6` (e.g., to `-8`) to make the detection more sensitive to small changes
- Decrease `-6` (e.g., to `-4`) to make the detection less sensitive
- Change `0.5` to adjust the baseline threshold for happiness

#### 2. Changing the Weights of Different Factors

Look for this section in the `calculateSmileScore` function:

```typescript
// Combine signals with appropriate weights
const rawScore = (mouthCurvature * 0.6) + (eyeNarrowing * 0.25) + (normalizedMouthWidth * 0.15);
```

You can change these weights:
- `0.6` for mouth curvature (how much smiling/frowning matters)
- `0.25` for eye narrowing (how much "eye smiles" matter)
- `0.15` for mouth width (how much wide smiles matter)

Make sure the weights add up to 1.0.

#### 3. Adding New Facial Features to Analyze

To add new facial features:

1. Find relevant landmarks in the `landmarks` array (based on their names)
2. Create a new function to calculate your feature (similar to `calculateEyeNarrowing`)
3. Include your new feature in the `calculateSmileScore` function with an appropriate weight

Example of adding a new factor:

```typescript
// New function to analyze another facial feature
const analyzeNewFeature = (landmarks: any[]): number => {
  // Your analysis code here
  return normalizedScore; // Return a value between 0 and 1
};

// In calculateSmileScore, add your new feature
const rawScore = (mouthCurvature * 0.5) + (eyeNarrowing * 0.2) + 
                 (normalizedMouthWidth * 0.1) + (newFeature * 0.2);
```

## Project Structure

The application is organized as follows:

- `src/` - Contains all source code
  - `components/` - React components
    - `Camera.tsx` - Handles webcam access
    - `FaceDetector.tsx` - Loads and uses TensorFlow for face detection
    - `HappinessAnalyzer.tsx` - Analyzes facial expressions
    - `HappinessMeter.tsx` - Displays the happiness score
    - `HappyLens.tsx` - Main component that ties everything together
  - `utils/`
    - `faceAnalysis.ts` - Core logic for analyzing facial expressions
  - `App.tsx` - Application entry point
  - `main.tsx` - React initialization

## Troubleshooting

Common issues:

1. **Camera Not Working**
   - Make sure your browser has permission to access your camera
   - Try using Chrome or Firefox, which have better webcam support
   - Check if another application is using your camera

2. **Slow Performance**
   - The TensorFlow.js model is resource-intensive. Try using a more powerful device
   - Close other tabs or applications to free up resources
   - Reduce the video resolution in the Camera component

3. **Face Detection Issues**
   - Ensure your face is well-lit
   - Face the camera directly
   - Make sure there aren't multiple faces in view (which can confuse the detector)

## Privacy Note

VisorAlegre processes all data locally in your browser. No facial data or images are sent to any servers.

## License

[MIT License](LICENSE)
