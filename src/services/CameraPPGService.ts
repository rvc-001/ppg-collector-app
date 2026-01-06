"use client"
import type { PPGSample } from "../types"

// FIX: Removed direct Camera import that causes crashes on Android/Web
// Permissions and Camera reference are now handled by the CameraView component

export class CameraPPGService {
  private camera: any = null
  private isRecording = false
  private frameCallback: ((sample: PPGSample) => void) | null = null
  private startTime = 0
  private frameCount = 0

  // FIX: Return true immediately. Actual permissions are handled by the useCameraPermissions hook in CameraView.tsx
  async requestPermissions(): Promise<boolean> {
    return true
  }

  setCamera(camera: any | null) {
    this.camera = camera
  }

  startRecording(callback: (sample: PPGSample) => void) {
    this.isRecording = true
    this.frameCallback = callback
    this.startTime = Date.now()
    this.frameCount = 0
  }

  stopRecording() {
    this.isRecording = false
    this.frameCallback = null
  }

  // Process camera frame to extract PPG signal
  async processFrame(imageData: ImageData): Promise<void> {
    if (!this.isRecording || !this.frameCallback) return

    try {
      // Extract red channel average (primary component for PPG)
      let redSum = 0
      const pixels = imageData.data
      const pixelCount = pixels.length / 4

      // Sample every 4th pixel for performance
      for (let i = 0; i < pixels.length; i += 16) {
        redSum += pixels[i] // Red channel
      }

      const redAverage = redSum / (pixelCount / 4)

      // Normalize to 0-1 range
      const normalizedValue = redAverage / 255

      const sample: PPGSample = {
        timestamp: Date.now(),
        value: normalizedValue,
        source: "camera",
      }

      this.frameCallback(sample)
      this.frameCount++
    } catch (error) {
      console.error("[v0] Camera PPG processing error:", error)
    }
  }

  getActualSampleRate(): number {
    if (this.frameCount === 0) return 0
    const elapsed = (Date.now() - this.startTime) / 1000
    return this.frameCount / elapsed
  }

  isActive(): boolean {
    return this.isRecording
  }
}

export const cameraPPGService = new CameraPPGService()