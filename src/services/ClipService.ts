"use client"
import AsyncStorage from "@react-native-async-storage/async-storage"
import type { ClipMarker } from "../types"
import { CLIPS_STORAGE_KEY } from "../config/constants"
import { v4 as uuidv4 } from "uuid"

export class ClipService {
  // Get all clips for a recording
  async getClips(recordingId: string): Promise<ClipMarker[]> {
    try {
      const data = await AsyncStorage.getItem(CLIPS_STORAGE_KEY)
      const allClips: ClipMarker[] = data ? JSON.parse(data) : []
      return allClips.filter((clip) => clip.recordingId === recordingId)
    } catch (error) {
      console.error("[v0] Failed to load clips:", error)
      return []
    }
  }

  // Create a new clip marker
  async createClip(
    recordingId: string,
    startTime: number,
    endTime: number,
    label?: string,
    color?: string,
  ): Promise<ClipMarker> {
    try {
      const clip: ClipMarker = {
        id: uuidv4(),
        recordingId,
        startTime,
        endTime,
        label,
        color: color || "#0066FF",
      }

      const data = await AsyncStorage.getItem(CLIPS_STORAGE_KEY)
      const clips: ClipMarker[] = data ? JSON.parse(data) : []
      clips.push(clip)

      await AsyncStorage.setItem(CLIPS_STORAGE_KEY, JSON.stringify(clips))
      return clip
    } catch (error) {
      console.error("[v0] Failed to create clip:", error)
      throw error
    }
  }

  // Update clip
  async updateClip(clipId: string, updates: Partial<ClipMarker>): Promise<void> {
    try {
      const data = await AsyncStorage.getItem(CLIPS_STORAGE_KEY)
      const clips: ClipMarker[] = data ? JSON.parse(data) : []

      const index = clips.findIndex((c) => c.id === clipId)
      if (index !== -1) {
        clips[index] = { ...clips[index], ...updates }
        await AsyncStorage.setItem(CLIPS_STORAGE_KEY, JSON.stringify(clips))
      }
    } catch (error) {
      console.error("[v0] Failed to update clip:", error)
      throw error
    }
  }

  // Delete clip
  async deleteClip(clipId: string): Promise<void> {
    try {
      const data = await AsyncStorage.getItem(CLIPS_STORAGE_KEY)
      const clips: ClipMarker[] = data ? JSON.parse(data) : []
      const filtered = clips.filter((c) => c.id !== clipId)
      await AsyncStorage.setItem(CLIPS_STORAGE_KEY, JSON.stringify(filtered))
    } catch (error) {
      console.error("[v0] Failed to delete clip:", error)
      throw error
    }
  }
}

export const clipService = new ClipService()
