"use client"
import AsyncStorage from "@react-native-async-storage/async-storage"
import { Platform } from "react-native"
import type { RecordingSession, PPGSample, MIMICRecord } from "../types"
import { RECORDINGS_STORAGE_KEY, APP_CONFIG } from "../config/constants"

let Sharing: any = null
let FileSystem: any = null
if (Platform.OS !== 'web') {
  try {
    Sharing = require("expo-sharing")
    FileSystem = require("expo-file-system/legacy")
  } catch (e) {
    try { FileSystem = require("expo-file-system") } catch (e2) {}
  }
}

export class StorageService {
  private recordingsDir: string

  constructor() {
    this.recordingsDir = (FileSystem && FileSystem.documentDirectory) 
      ? `${FileSystem.documentDirectory}recordings/` 
      : "web_storage/"
      
    if (Platform.OS !== 'web' && FileSystem) {
      this.ensureDirectoryExists()
    }
  }

  private async ensureDirectoryExists() {
    if (Platform.OS === 'web' || !FileSystem) return
    try {
      const dirInfo = await FileSystem.getInfoAsync(this.recordingsDir)
      if (!dirInfo.exists) {
        await FileSystem.makeDirectoryAsync(this.recordingsDir, { intermediates: true })
      }
    } catch (error) {
      console.warn("[Storage] Failed to create recordings directory:", error)
    }
  }

  async saveRecordingSession(session: RecordingSession): Promise<void> {
    try {
      const sessions = await this.getAllSessions()
      const existingIndex = sessions.findIndex(s => s.id === session.id)
      if (existingIndex >= 0) sessions[existingIndex] = session
      else sessions.push(session)
      await AsyncStorage.setItem(RECORDINGS_STORAGE_KEY, JSON.stringify(sessions))
    } catch (error) {
      console.error("[Storage] Metadata save failed:", error)
    }
  }

  async getAllSessions(): Promise<RecordingSession[]> {
    try {
      const data = await AsyncStorage.getItem(RECORDINGS_STORAGE_KEY)
      return data ? JSON.parse(data) : []
    } catch (error) { return [] }
  }

  async getSession(id: string): Promise<RecordingSession | null> {
    const sessions = await this.getAllSessions()
    return sessions.find((s) => s.id === id) || null
  }

  async deleteSession(id: string): Promise<void> {
    const sessions = await this.getAllSessions()
    const session = sessions.find((s) => s.id === id)
    if (session) {
      if (Platform.OS === 'web') {
         await AsyncStorage.removeItem(`recording_data_${id}`)
      } else if (FileSystem && session.filePath) {
         await FileSystem.deleteAsync(session.filePath, { idempotent: true }).catch(() => {})
      }
      const filtered = sessions.filter((s) => s.id !== id)
      await AsyncStorage.setItem(RECORDINGS_STORAGE_KEY, JSON.stringify(filtered))
    }
  }

  // FIX: Web Cache Logic
  async savePPGSamplesToFile(
    sessionId: string,
    samples: PPGSample[],
    metadata: { subjectId?: string; startTime: number; sampleRate: number },
  ): Promise<string> {
    const fileName = `ppg_${sessionId}_${Date.now()}.csv`
    const csvContent = this.generateMIMICCSV(samples, metadata)

    if (Platform.OS === 'web') {
      try {
        // 1. Cache for Playback
        await AsyncStorage.setItem(`recording_data_${sessionId}`, csvContent)
        // 2. Download for User
        this.triggerWebDownload(csvContent, fileName)
        // 3. Return Cache Key as Path
        return `web_cache_${sessionId}`
      } catch (e) {
        console.error("[Storage] Web save failed", e)
        return ""
      }
    }

    if (FileSystem) {
      try {
        const filePath = `${this.recordingsDir}${fileName}`
        await FileSystem.writeAsStringAsync(filePath, csvContent)
        return filePath
      } catch (error) {
        console.error("[Storage] File write failed:", error)
        throw error
      }
    }
    return ""
  }

  private triggerWebDownload(content: string, fileName: string) {
    if (Platform.OS !== 'web') return
    const blob = new Blob([content], { type: 'text/csv' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = fileName
    a.click()
    URL.revokeObjectURL(url)
  }

  async loadPPGSamplesFromFile(filePath: string): Promise<PPGSample[]> {
    if (Platform.OS === 'web') {
       // Extract ID from path "web_cache_ID"
       if (filePath && filePath.startsWith("web_cache_")) {
           const id = filePath.replace("web_cache_", "")
           const content = await AsyncStorage.getItem(`recording_data_${id}`)
           return content ? this.parseMIMICCSV(content) : []
       }
       return []
    }

    try {
      const content = await FileSystem.readAsStringAsync(filePath)
      return this.parseMIMICCSV(content)
    } catch (error) {
      console.error("[Storage] Load failed:", error)
      return []
    }
  }

  private parseMIMICCSV(content: string): PPGSample[] {
    const lines = content.split("\n")
    const samples: PPGSample[] = []
    let dataStarted = false
    for (const line of lines) {
      if (line.startsWith("#") || line.trim() === "") continue
      if (line.includes("timestamp") || line.includes("PLETH")) {
        dataStarted = true
        continue
      }
      if (dataStarted) {
        const parts = line.split(",")
        if (parts.length >= 3) {
          samples.push({
            timestamp: Number(parts[0]),
            value: Number(parts[2]),
            source: "camera",
          })
        }
      }
    }
    return samples
  }

  async exportAndShare(sessionId: string): Promise<void> {
    if (Platform.OS === 'web') {
        const content = await AsyncStorage.getItem(`recording_data_${sessionId}`)
        if (content) {
            this.triggerWebDownload(content, `ppg_${sessionId}.csv`)
        } else {
            alert("Recording data not found in browser cache.")
        }
        return
    }
    // ... Native export ...
    if (!Sharing) throw new Error("Sharing not available")
    const session = await this.getSession(sessionId)
    if (session && await Sharing.isAvailableAsync()) {
      await Sharing.shareAsync(session.filePath, {
        mimeType: "text/csv",
        dialogTitle: `Export MIMIC-III PPG - ${session.id}`,
        UTI: "public.comma-separated-values-text",
      })
    }
  }

  private generateMIMICCSV(
    samples: PPGSample[],
    metadata: { subjectId?: string; startTime: number; sampleRate: number }
  ): string {
    const lines: string[] = []
    lines.push(`# MIMIC-III Compatible PPG Recording`)
    lines.push(`# Subject ID: ${metadata.subjectId || "Anonymous"}`)
    lines.push(`# Start Time: ${new Date(metadata.startTime).toISOString()}`)
    lines.push(`# Sample Rate: ${metadata.sampleRate.toFixed(4)} Hz`)
    lines.push(`# Signal: PLETH`)
    lines.push(`# Units: NU`)
    lines.push(``)
    lines.push("timestamp_ms,elapsed_seconds,PLETH,source")

    const startTimestamp = samples[0]?.timestamp || metadata.startTime
    samples.forEach((sample) => {
      const elapsedSeconds = ((sample.timestamp - startTimestamp) / 1000).toFixed(4)
      lines.push(`${sample.timestamp},${elapsedSeconds},${sample.value.toFixed(6)},camera`)
    })
    return lines.join("\n")
  }
}

export const storageService = new StorageService()