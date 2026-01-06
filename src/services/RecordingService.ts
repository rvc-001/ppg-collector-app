"use client"
import type { RecordingSession, PPGSample } from "../types"
import { storageService } from "./StorageService"

export class RecordingService {
  private currentSession: RecordingSession | null = null
  private currentSamples: PPGSample[] = []
  private isRecording = false
  private firstSampleTime: number | null = null

  // Start a new recording session
  startRecording(dataSource: "camera" | "ble" | "both", patientId?: string, notes?: string): string {
    if (this.isRecording) {
      console.warn("Recording already in progress, ignoring start request")
      return this.currentSession?.id || ""
    }

    const sessionId = crypto.randomUUID()
    
    this.currentSession = {
      id: sessionId,
      startTime: Date.now(), // Setup time
      duration: 0,
      sampleRate: 0,
      dataSource,
      patientId: patientId || "Anonymous", // Default ID
      notes,
      filePath: "", 
    }

    this.currentSamples = []
    this.firstSampleTime = null
    this.isRecording = true

    console.log("[RecordingService] Started session:", sessionId)
    return sessionId
  }

  // Add sample to current recording
  addSample(sample: PPGSample) {
    if (!this.isRecording || !this.currentSession) return

    // Initialize timing on first sample
    if (this.firstSampleTime === null) {
      this.firstSampleTime = sample.timestamp
      // Adjust session start time to match first actual data point
      this.currentSession.startTime = sample.timestamp
    }

    this.currentSamples.push(sample)

    // Update statistics
    const sampleCount = this.currentSamples.length
    if (sampleCount > 1 && this.firstSampleTime !== null) {
      // FIX: Calculate duration based on ACTUAL data span
      const durationSeconds = (sample.timestamp - this.firstSampleTime) / 1000
      
      this.currentSession.duration = durationSeconds

      // FIX: Correct frequency calculation: (N - 1) / Seconds
      if (durationSeconds > 0) {
        this.currentSession.sampleRate = (sampleCount - 1) / durationSeconds
      }
    }
  }

  // Stop recording and save to storage
  async stopRecording(): Promise<RecordingSession | null> {
    if (!this.isRecording || !this.currentSession) return null

    this.isRecording = false

    try {
      this.currentSession.endTime = Date.now()

      console.log(`[RecordingService] Stopping. Samples: ${this.currentSamples.length}, Rate: ${this.currentSession.sampleRate.toFixed(2)}Hz`)

      // Save samples (triggers download on Web)
      const filePath = await storageService.savePPGSamplesToFile(
        this.currentSession.id, 
        this.currentSamples, 
        {
          subjectId: this.currentSession.patientId,
          startTime: this.currentSession.startTime,
          sampleRate: this.currentSession.sampleRate,
        }
      )

      this.currentSession.filePath = filePath

      // Save metadata
      await storageService.saveRecordingSession(this.currentSession)

      const completedSession = { ...this.currentSession }

      // Cleanup
      this.currentSession = null
      this.currentSamples = []
      this.firstSampleTime = null

      return completedSession
    } catch (error) {
      console.error("[RecordingService] Failed to save:", error)
      this.currentSession = null
      this.currentSamples = []
      throw error
    }
  }

  getStatus() {
    return {
      isRecording: this.isRecording,
      sessionId: this.currentSession?.id,
      sampleCount: this.currentSamples.length,
      duration: this.currentSession?.duration || 0,
      sampleRate: this.currentSession?.sampleRate || 0,
    }
  }

  getCurrentSamples(): PPGSample[] {
    return [...this.currentSamples]
  }
}

export const recordingService = new RecordingService()