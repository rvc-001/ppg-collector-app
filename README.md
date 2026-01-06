# PPG Data Pipeline

A research-grade React Native mobile application for real-time PPG (photoplethysmography) signal acquisition, processing, and machine learning model testing.

## Features

- **Multi-source Data Acquisition**: Camera-based PPG and BLE sensor integration
- **Real-time Signal Visualization**: Live waveform display with DSP filtering (0.5-5 Hz bandpass)
- **MIMIC-III/IV Compatible Storage**: Research-ready CSV data export format
- **Post-recording Playback**: Review and analyze recorded sessions with clip markers
- **Custom ML Model Testing**: Upload your own .pkl, .pth, or .onnx models and test accuracy on live or recorded data
- **Professional UI**: Dark/light theme with clinical-grade visualization

## Installation

### Prerequisites

- Node.js (v16 or higher)
- npm or yarn
- For iOS: Xcode and CocoaPods
- For Android: Android Studio and JDK

### Setup

```bash
# Install dependencies
npm install

# For iOS (Mac only)
cd ios && pod install && cd ..

# Prebuild native modules (required for custom dev client)
npm run prebuild
```

## Running the App

### Development

```bash
# Start Expo development server
npm start

# Run on iOS simulator (Mac only)
npm run ios

# Run on Android emulator/device
npm run android
```

### Building for Production

```bash
# Build Android APK
eas build --platform android --profile preview

# Build iOS IPA (requires Apple Developer account)
eas build --platform ios --profile preview
```

## Project Structure

```
ppg-data-pipeline/
├── index.js                # App entry point
├── App.tsx                 # Main navigation setup
├── app.json               # Expo configuration
├── babel.config.js        # Babel configuration
├── src/
│   ├── config/            # Configuration files
│   │   ├── theme.ts       # App theme definitions
│   │   └── constants.ts   # DSP and app constants
│   ├── contexts/          # React contexts
│   │   ├── ThemeContext.tsx
│   │   └── SettingsContext.tsx
│   ├── screens/           # Main application screens
│   │   ├── AcquisitionScreen.tsx    # Record PPG data
│   │   ├── PlaybackScreen.tsx       # Review recordings
│   │   ├── AnalysisScreen.tsx       # ML model testing
│   │   └── SettingsScreen.tsx       # App settings
│   ├── components/        # Reusable UI components
│   ├── services/          # Business logic services
│   │   ├── CameraPPGService.ts      # Camera PPG acquisition
│   │   ├── BLEService.ts            # Bluetooth sensor integration
│   │   ├── StorageService.ts        # Data persistence
│   │   ├── RecordingService.ts      # Session management
│   │   ├── ClipService.ts           # Clip markers
│   │   └── MLService.ts             # Model upload & testing
│   ├── utils/             # Utility functions
│   │   └── dsp.ts         # Digital signal processing
│   └── types/             # TypeScript type definitions
│       └── index.ts
```

## Technology Stack

- **Framework**: React Native 0.74 with Expo 51
- **Language**: TypeScript
- **Navigation**: React Navigation 6
- **ML Inference**: ONNX Runtime (for .onnx models)
- **Bluetooth**: react-native-ble-plx
- **Camera**: expo-camera
- **Storage**: AsyncStorage + FileSystem
- **Visualization**: react-native-svg for signal charts

## How to Use

### 1. Recording PPG Data

1. Open the **Acquisition** tab
2. Choose data source (Camera or BLE device)
3. For camera: Place finger over camera lens
4. For BLE: Scan and connect to heart rate monitor
5. Press **Start Recording**
6. Add metadata (optional): Patient ID, notes
7. Press **Stop Recording** when done

### 2. Reviewing Recordings

1. Open the **Playback** tab
2. Select a recording from the list
3. Use playback controls to review the signal
4. Mark interesting clips for later analysis
5. Export recordings as CSV (MIMIC-compatible format)

### 3. Testing ML Models

1. Open the **Analysis** tab
2. Press **Upload Model** and select your .pkl, .pth, or .onnx file
3. Select the uploaded model as active
4. Choose a recording to test on
5. View predictions and accuracy metrics
6. Compare multiple models on the same data

### 4. Configuring Settings

1. Open the **Settings** tab
2. Adjust DSP parameters (bandpass filter, notch frequency)
3. Toggle dark/light theme
4. Manage storage and clear old recordings
5. Configure export format preferences

## Model Requirements

Your ML models should:

- Accept 20 input features extracted from PPG signals:
  - Time-domain: mean, variance, std, amplitude, max slope
  - Pulse wave: mean interval, interval variability, peak count
  - Frequency domain: 10 frequency band power features
- Output: 2 values [systolic BP, diastolic BP]

Supported formats: `.pkl` (scikit-learn), `.pth` (PyTorch), `.onnx` (ONNX)

## Permissions

The app requires the following permissions:

### iOS
- Camera access (for PPG acquisition)
- Bluetooth (for BLE sensors)

### Android
- CAMERA
- BLUETOOTH, BLUETOOTH_ADMIN, BLUETOOTH_CONNECT, BLUETOOTH_SCAN
- ACCESS_FINE_LOCATION, ACCESS_COARSE_LOCATION (required for BLE scanning)
- READ_EXTERNAL_STORAGE, WRITE_EXTERNAL_STORAGE (for model upload)

## MIMIC Data Format

Exported CSV files follow MIMIC-III/IV format:

```csv
# Subject ID: patient_001
# Record Time: 2024-01-15T10:30:00Z
# Signal Type: PPG
# Sampling Rate: 30.5 Hz
# Units: normalized (0-1)
timestamp,value,source
1705317000000,0.523,camera
1705317000033,0.531,camera
...
```

## Troubleshooting

### Camera not working
- Ensure camera permissions are granted
- Check that flashlight/torch is working
- Try in a darker environment

### BLE devices not appearing
- Enable Bluetooth on your device
- Grant location permissions (Android)
- Ensure BLE device is in pairing mode

### Model upload fails
- Check file format (.pkl, .pth, or .onnx)
- Ensure file is not corrupted
- Try a smaller model file

### Android build / EAS troubleshooting
- If a cloud (EAS) build fails during the `Run gradlew` phase:
  - Open the build URL shown by EAS and inspect the Logs panel.
  - Check `Installing dependencies` to confirm postinstall scripts ran (search for `patch-gradle-plugin` or similar markers).
  - Copy the `Run gradlew` step output — include the first error block and the final ~100 lines — and share them for diagnosis.
- Common causes:
  - Toolchain mismatch (Node, JDK, Gradle versions) between the project and the build worker.
  - Native modules that require a custom dev client or prebuild.
  - Gradle Kotlin script compilation errors (for example, errors referencing `serviceOf` or unexpected tokens).
- Quick remediation steps:
  - Commit and push any repository changes (postinstall scripts, settings changes) before starting an EAS build so the worker uses the updated source.
  - Ensure your repository access method (SSH key or PAT) is configured so the CI can fetch the correct commit.
  - Add a conservative patch that sanitizes the React Native Gradle plugin script at install- or settings-evaluation time (replace problematic expressions like `files(serviceOf<ModuleRegistry>()...first())` with a safe `files()` fallback), and commit that change.
- When asking for help, include:
  - The EAS build URL or build ID.
  - The `Installing dependencies` output (to show whether the patch ran).
  - The full `Run gradlew` step logs (first error + last ~100 lines). This makes analysis and a targeted fix much faster.

## Contributing

This is a research project. Contributions welcome for:
- Additional signal processing algorithms
- More ML model format support
- Improved visualization components
- Better BLE device compatibility

## License

MIT License - See LICENSE file for details

## Acknowledgments

Built for research in non-invasive blood pressure estimation using photoplethysmography signals.
