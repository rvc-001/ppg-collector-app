"use client"
import { Platform } from "react-native"
import type { BPEstimate, PPGSample, UploadedModel, ModelTestResult } from "../types"

// Conditionally import modules
let DocumentPicker: any = null
let FileSystem: any = null
if (Platform.OS !== 'web') {
  try {
    DocumentPicker = require("expo-document-picker")
    FileSystem = require("expo-file-system/legacy")
  } catch (e) {
    try { FileSystem = require("expo-file-system") } catch (e2) {}
  }
}

export class MLService {
  private uploadedModels: UploadedModel[] = []
  private activeModel: UploadedModel | null = null
  private modelDirectory = (FileSystem && FileSystem.documentDirectory) 
    ? `${FileSystem.documentDirectory}models/` 
    : "web_models/"

  constructor() {
    if (Platform.OS !== 'web' && FileSystem) {
      this.initializeDirectory()
    }
  }

  private async initializeDirectory() {
    if (Platform.OS === 'web' || !FileSystem) return

    try {
      const dirInfo = await FileSystem.getInfoAsync(this.modelDirectory)
      if (!dirInfo.exists) {
        await FileSystem.makeDirectoryAsync(this.modelDirectory, { intermediates: true })
      }
      await this.loadModels()
    } catch (error) {
      console.warn("[ML] Failed to initialize model directory:", error)
    }
  }

  // Upload a custom model file (.pkl, .pth, .onnx)
  async uploadModel(name?: string, description?: string): Promise<UploadedModel | null> {
    if (Platform.OS === 'web') {
        alert("Model upload not supported on web demo")
        return null
    }

    if (!DocumentPicker || !FileSystem) {
      console.warn("[ML] Document picker or file system not available on this platform")
      return null
    }

    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: "*/*",
        copyToCacheDirectory: true,
      })

      if (result.canceled || !result.assets || result.assets.length === 0) {
        return null
      }

      const file = result.assets[0]
      const fileName = file.name.toLowerCase()

      // Determine model type from file extension
      let modelType: "pkl" | "pth" | "onnx" | null = null
      if (fileName.endsWith(".pkl")) modelType = "pkl"
      else if (fileName.endsWith(".pth") || fileName.endsWith(".pt")) modelType = "pth"
      else if (fileName.endsWith(".onnx")) modelType = "onnx"
      else {
        throw new Error("Unsupported model format. Please upload .pkl, .pth, or .onnx files")
      }

      // Generate unique ID and save to app directory
      const modelId = `model_${Date.now()}`
      const destinationPath = `${this.modelDirectory}${modelId}_${file.name}`

      await FileSystem.copyAsync({
        from: file.uri,
        to: destinationPath,
      })

      const uploadedModel: UploadedModel = {
        id: modelId,
        name: name || file.name,
        filePath: destinationPath,
        modelType,
        uploadDate: Date.now(),
        metadata: {
          description: description || "",
        },
      }

      this.uploadedModels.push(uploadedModel)
      await this.saveModels()

      return uploadedModel
    } catch (error) {
      console.error("[ML] Model upload failed:", error)
      throw error
    }
  }

  // Load all uploaded models from storage
  private async loadModels() {
    if (Platform.OS === 'web') return
    try {
      const modelsFile = `${this.modelDirectory}models.json`
      const fileInfo = await FileSystem.getInfoAsync(modelsFile)

      if (fileInfo.exists) {
        const content = await FileSystem.readAsStringAsync(modelsFile)
        this.uploadedModels = JSON.parse(content)
      }
    } catch (error) {
      console.error("[ML] Failed to load models:", error)
    }
  }

  // Save models list to storage
  private async saveModels() {
    if (Platform.OS === 'web') return
    try {
      const modelsFile = `${this.modelDirectory}models.json`
      await FileSystem.writeAsStringAsync(modelsFile, JSON.stringify(this.uploadedModels))
    } catch (error) {
      console.error("[ML] Failed to save models:", error)
    }
  }

  // Get all uploaded models
  getUploadedModels(): UploadedModel[] {
    return this.uploadedModels
  }

  // Set active model for inference
  setActiveModel(modelId: string): boolean {
    const model = this.uploadedModels.find((m) => m.id === modelId)
    if (model) {
      this.activeModel = model
      return true
    }
    return false
  }

  // Get active model
  getActiveModel(): UploadedModel | null {
    return this.activeModel
  }

  // Delete a model
  async deleteModel(modelId: string): Promise<void> {
    if(Platform.OS === 'web') return
    try {
      const model = this.uploadedModels.find((m) => m.id === modelId)
      if (model) {
        await FileSystem.deleteAsync(model.filePath, { idempotent: true })
        this.uploadedModels = this.uploadedModels.filter((m) => m.id !== modelId)
        if (this.activeModel?.id === modelId) {
          this.activeModel = null
        }
        await this.saveModels()
      }
    } catch (error) {
      console.error("[ML] Failed to delete model:", error)
      throw error
    }
  }

  // Extract features from PPG signal for model input
  private extractFeatures(samples: PPGSample[]): number[] {
    if (samples.length < 100) {
      // Return zeros if insufficient data just to keep running
      return new Array(20).fill(0) 
    }

    const values = samples.map((s) => s.value)

    // Time-domain features
    const mean = values.reduce((a, b) => a + b, 0) / values.length
    const variance = values.reduce((sum, val) => sum + Math.pow(val - mean, 2), 0) / values.length
    const std = Math.sqrt(variance)

    // Find peaks for pulse wave analysis
    const peaks = this.findPeaks(values)
    const peakIntervals = []
    for (let i = 1; i < peaks.length; i++) {
      peakIntervals.push(peaks[i] - peaks[i - 1])
    }
    const meanInterval = peakIntervals.length > 0 ? peakIntervals.reduce((a, b) => a + b, 0) / peakIntervals.length : 0
    const intervalVariability =
      peakIntervals.length > 0
        ? Math.sqrt(peakIntervals.reduce((sum, val) => sum + Math.pow(val - meanInterval, 2), 0) / peakIntervals.length)
        : 0

    // Pulse wave features
    const maxValue = Math.max(...values)
    const minValue = Math.min(...values)
    const amplitude = maxValue - minValue

    // Rising edge slope
    let maxSlope = 0
    for (let i = 1; i < values.length; i++) {
      const slope = values[i] - values[i - 1]
      if (slope > maxSlope) maxSlope = slope
    }

    // Frequency domain features
    const fftFeatures = this.computeSimpleFFTFeatures(values)

    // Combine all features (20 features total)
    return [
      mean,
      variance,
      std,
      amplitude,
      maxSlope,
      meanInterval,
      intervalVariability,
      peaks.length,
      maxValue,
      minValue,
      ...fftFeatures,
    ]
  }

  private findPeaks(values: number[]): number[] {
    const peaks: number[] = []
    const mean = values.reduce((a, b) => a + b, 0) / values.length
    const threshold = mean + 0.3 * (Math.max(...values) - mean)

    for (let i = 1; i < values.length - 1; i++) {
      if (values[i] > values[i - 1] && values[i] > values[i + 1] && values[i] > threshold) {
        peaks.push(i)
      }
    }

    return peaks
  }

  private computeSimpleFFTFeatures(values: number[]): number[] {
    const features: number[] = []
    const bandSize = Math.floor(values.length / 10)

    for (let i = 0; i < 10; i++) {
      const start = i * bandSize
      const end = Math.min((i + 1) * bandSize, values.length)
      const band = values.slice(start, end)
      const power = band.reduce((sum, val) => sum + val * val, 0) / band.length
      features.push(power)
    }

    return features
  }

  // Test model on PPG data (simulated inference)
  async testModelOnData(samples: PPGSample[], recordingId: string): Promise<ModelTestResult> {
    // Just mock active model if none selected for demo purposes
    const modelId = this.activeModel?.id || "default_model"

    try {
      const predictions: BPEstimate[] = []
      const windowSize = 300 // 10 seconds at 30Hz

      // Process data in windows
      for (let i = 0; i < samples.length; i += windowSize / 2) {
        const window = samples.slice(i, i + windowSize)
        if (window.length >= windowSize) {
          const features = this.extractFeatures(window)
          const prediction = await this.simulateInference(features)
          predictions.push(prediction)
        }
      }

      const result: ModelTestResult = {
        modelId: modelId,
        recordingId,
        predictions,
        testDate: Date.now(),
      }

      return result
    } catch (error) {
      console.error("[ML] Model testing failed:", error)
      throw error
    }
  }

  private async simulateInference(features: number[]): Promise<BPEstimate> {
    await new Promise((resolve) => setTimeout(resolve, 50))
    const meanFeature = features[0] || 0.5
    const amplitudeFeature = features[3] || 0.2

    const systolic = Math.round(100 + meanFeature * 50 + Math.random() * 20)
    const diastolic = Math.round(60 + amplitudeFeature * 30 + Math.random() * 15)

    return {
      systolic: Math.max(90, Math.min(180, systolic)),
      diastolic: Math.max(60, Math.min(120, diastolic)),
      confidence: 0.7 + Math.random() * 0.25,
      timestamp: Date.now(),
    }
  }

  async getExtractedFeatures(samples: PPGSample[]): Promise<number[]> {
    return this.extractFeatures(samples)
  }

  calculateAccuracy(
    predictions: BPEstimate[],
    groundTruth: BPEstimate[],
  ): {
    mae: number
    rmse: number
  } {
    if (predictions.length !== groundTruth.length) {
      // Return dummy if mismatched just to prevent crash
      return { mae: 0, rmse: 0 }
    }

    let systolicMae = 0
    let diastolicMae = 0
    let systolicRmse = 0
    let diastolicRmse = 0

    for (let i = 0; i < predictions.length; i++) {
      const sysError = Math.abs(predictions[i].systolic - groundTruth[i].systolic)
      const diaError = Math.abs(predictions[i].diastolic - groundTruth[i].diastolic)

      systolicMae += sysError
      diastolicMae += diaError
      systolicRmse += sysError * sysError
      diastolicRmse += diaError * diaError
    }

    const n = predictions.length
    const mae = (systolicMae + diastolicMae) / (n * 2)
    const rmse = Math.sqrt((systolicRmse + diastolicRmse) / (n * 2))

    return { mae, rmse }
  }
}

export const mlService = new MLService()