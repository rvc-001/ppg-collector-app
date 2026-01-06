"use client"

import type React from "react"
import { createContext, useContext, useState, useEffect, type ReactNode } from "react"
import AsyncStorage from "@react-native-async-storage/async-storage"
import type { DSPConfig } from "../types"
import { APP_CONFIG } from "../config/constants"

interface SettingsContextType {
  dspConfig: DSPConfig
  updateDSPConfig: (config: Partial<DSPConfig>) => Promise<void>
  resetDSPConfig: () => Promise<void>
  exportFormat: "csv" | "json"
  setExportFormat: (format: "csv" | "json") => Promise<void>
  autoSave: boolean
  setAutoSave: (enabled: boolean) => Promise<void>
  notificationsEnabled: boolean
  setNotificationsEnabled: (enabled: boolean) => Promise<void>
}

const SettingsContext = createContext<SettingsContextType | undefined>(undefined)

const SETTINGS_STORAGE_KEY = "@ppg_settings"

const DEFAULT_DSP_CONFIG: DSPConfig = {
  bandpassLow: APP_CONFIG.BANDPASS_LOW,
  bandpassHigh: APP_CONFIG.BANDPASS_HIGH,
  notchFrequency: APP_CONFIG.NOTCH_FREQUENCY,
  smoothingWindow: APP_CONFIG.SMOOTHING_WINDOW,
}

export const SettingsProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [dspConfig, setDspConfig] = useState<DSPConfig>(DEFAULT_DSP_CONFIG)
  const [exportFormat, setExportFormatState] = useState<"csv" | "json">("csv")
  const [autoSave, setAutoSaveState] = useState(true)
  const [notificationsEnabled, setNotificationsEnabledState] = useState(true)

  useEffect(() => {
    loadSettings()
  }, [])

  const loadSettings = async () => {
    try {
      const stored = await AsyncStorage.getItem(SETTINGS_STORAGE_KEY)
      if (stored) {
        const settings = JSON.parse(stored)
        setDspConfig(settings.dspConfig || DEFAULT_DSP_CONFIG)
        setExportFormatState(settings.exportFormat || "csv")
        setAutoSaveState(settings.autoSave ?? true)
        setNotificationsEnabledState(settings.notificationsEnabled ?? true)
      }
    } catch (error) {
      console.error("Failed to load settings:", error)
    }
  }

  const saveSettings = async (newSettings: any) => {
    try {
      await AsyncStorage.setItem(SETTINGS_STORAGE_KEY, JSON.stringify(newSettings))
    } catch (error) {
      console.error("Failed to save settings:", error)
    }
  }

  const updateDSPConfig = async (config: Partial<DSPConfig>) => {
    const newConfig = { ...dspConfig, ...config }
    setDspConfig(newConfig)
    await saveSettings({
      dspConfig: newConfig,
      exportFormat,
      autoSave,
      notificationsEnabled,
    })
  }

  const resetDSPConfig = async () => {
    setDspConfig(DEFAULT_DSP_CONFIG)
    await saveSettings({
      dspConfig: DEFAULT_DSP_CONFIG,
      exportFormat,
      autoSave,
      notificationsEnabled,
    })
  }

  const setExportFormat = async (format: "csv" | "json") => {
    setExportFormatState(format)
    await saveSettings({
      dspConfig,
      exportFormat: format,
      autoSave,
      notificationsEnabled,
    })
  }

  const setAutoSave = async (enabled: boolean) => {
    setAutoSaveState(enabled)
    await saveSettings({
      dspConfig,
      exportFormat,
      autoSave: enabled,
      notificationsEnabled,
    })
  }

  const setNotificationsEnabled = async (enabled: boolean) => {
    setNotificationsEnabledState(enabled)
    await saveSettings({
      dspConfig,
      exportFormat,
      autoSave,
      notificationsEnabled: enabled,
    })
  }

  return (
    <SettingsContext.Provider
      value={{
        dspConfig,
        updateDSPConfig,
        resetDSPConfig,
        exportFormat,
        setExportFormat,
        autoSave,
        setAutoSave,
        notificationsEnabled,
        setNotificationsEnabled,
      }}
    >
      {children}
    </SettingsContext.Provider>
  )
}

export const useSettings = () => {
  const context = useContext(SettingsContext)
  if (!context) {
    throw new Error("useSettings must be used within SettingsProvider")
  }
  return context
}
