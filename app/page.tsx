export default function Page() {
  return (
    <div className="min-h-screen bg-background p-8">
      <div className="max-w-4xl mx-auto">
        <div className="bg-card border border-border rounded-lg p-8 shadow-sm">
          <h1 className="text-3xl font-bold text-foreground mb-4">PPG Data Pipeline</h1>
          <p className="text-muted-foreground mb-6">
            This is a React Native mobile application for PPG signal acquisition and ML model testing.
          </p>

          <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-4 mb-6">
            <h2 className="text-lg font-semibold text-yellow-900 dark:text-yellow-200 mb-2">📱 Mobile App Only</h2>
            <p className="text-yellow-800 dark:text-yellow-300 text-sm">
              This project is designed to run as a native mobile application using Expo and React Native. The web
              preview is not available for this type of application.
            </p>
          </div>

          <div className="space-y-4">
            <div>
              <h2 className="text-xl font-semibold text-foreground mb-3">How to Run</h2>
              <div className="bg-muted rounded-lg p-4 space-y-2 font-mono text-sm">
                <div>
                  <span className="text-muted-foreground"># Install dependencies</span>
                  <br />
                  <span className="text-foreground">npm install</span>
                </div>
                <div className="mt-3">
                  <span className="text-muted-foreground"># Start development server</span>
                  <br />
                  <span className="text-foreground">npm start</span>
                </div>
                <div className="mt-3">
                  <span className="text-muted-foreground"># Run on Android</span>
                  <br />
                  <span className="text-foreground">npm run android</span>
                </div>
                <div className="mt-3">
                  <span className="text-muted-foreground"># Run on iOS (Mac only)</span>
                  <br />
                  <span className="text-foreground">npm run ios</span>
                </div>
              </div>
            </div>

            <div>
              <h2 className="text-xl font-semibold text-foreground mb-3">Features</h2>
              <ul className="list-disc list-inside space-y-2 text-muted-foreground">
                <li>Camera-based PPG signal acquisition</li>
                <li>BLE sensor integration for external devices</li>
                <li>Real-time signal visualization with DSP filtering</li>
                <li>MIMIC-III/IV compatible data export</li>
                <li>Upload and test custom ML models (.pkl, .pth, .onnx)</li>
                <li>Post-recording playback and analysis</li>
              </ul>
            </div>

            <div>
              <h2 className="text-xl font-semibold text-foreground mb-3">Project Structure</h2>
              <ul className="list-disc list-inside space-y-1 text-sm text-muted-foreground">
                <li>
                  <code className="bg-muted px-1 py-0.5 rounded">App.tsx</code> - Main navigation
                </li>
                <li>
                  <code className="bg-muted px-1 py-0.5 rounded">src/screens/</code> - App screens (Acquisition,
                  Playback, Analysis, Settings)
                </li>
                <li>
                  <code className="bg-muted px-1 py-0.5 rounded">src/services/</code> - Business logic (Camera, BLE, ML,
                  Storage)
                </li>
                <li>
                  <code className="bg-muted px-1 py-0.5 rounded">src/components/</code> - Reusable UI components
                </li>
                <li>
                  <code className="bg-muted px-1 py-0.5 rounded">src/utils/dsp.ts</code> - Signal processing algorithms
                </li>
              </ul>
            </div>

            <div className="pt-4 border-t border-border">
              <p className="text-sm text-muted-foreground">
                Download this project and run it locally with Expo to see the full mobile application in action.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
