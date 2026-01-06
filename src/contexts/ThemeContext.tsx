"use client"

import type React from "react"
import { createContext, useContext, useState, useEffect, type ReactNode } from "react"
import AsyncStorage from "@react-native-async-storage/async-storage"
import type { AppTheme } from "../types"
import { lightTheme, darkTheme } from "../config/theme"
import { THEME_STORAGE_KEY } from "../config/constants"

interface ThemeContextType {
  theme: AppTheme
  isDark: boolean
  toggleTheme: () => void
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined)

export const ThemeProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [isDark, setIsDark] = useState(false)

  useEffect(() => {
    loadThemePreference()
  }, [])

  const loadThemePreference = async () => {
    try {
      const stored = await AsyncStorage.getItem(THEME_STORAGE_KEY)
      if (stored !== null) {
        setIsDark(stored === "dark")
      }
    } catch (error) {
      console.error("Failed to load theme preference:", error)
    }
  }

  const toggleTheme = async () => {
    const newValue = !isDark
    setIsDark(newValue)
    try {
      await AsyncStorage.setItem(THEME_STORAGE_KEY, newValue ? "dark" : "light")
    } catch (error) {
      console.error("Failed to save theme preference:", error)
    }
  }

  const theme = isDark ? darkTheme : lightTheme

  return <ThemeContext.Provider value={{ theme, isDark, toggleTheme }}>{children}</ThemeContext.Provider>
}

export const useTheme = () => {
  const context = useContext(ThemeContext)
  if (!context) {
    throw new Error("useTheme must be used within ThemeProvider")
  }
  return context
}
