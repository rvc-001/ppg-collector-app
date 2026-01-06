import type { AppTheme } from "../types"

// Modern gradient-based color palette
export const lightTheme: AppTheme = {
  dark: false,
  colors: {
    // Primary brand colors - modern gradient from purple to blue
    primary: "#6366F1",
    primaryLight: "#818CF8",
    primaryDark: "#4F46E5",
    
    // Background & surfaces
    background: "#F8FAFC",
    surface: "#FFFFFF",
    card: "#FFFFFF",
    
    // Text colors with hierarchy
    text: "#0F172A",
    textSecondary: "#64748B",
    textTertiary: "#94A3B8",
    
    // UI elements
    border: "#E2E8F0",
    divider: "#CBD5E1",
    
    // Semantic colors
    notification: "#6366F1",
    success: "#10B981",
    successLight: "#D1FAE5",
    warning: "#F59E0B",
    warningLight: "#FEF3C7",
    error: "#EF4444",
    errorLight: "#FEE2E2",
    info: "#3B82F6",
    
    // Chart colors
    chart: {
      ppg: "#6366F1",
      ecg: "#10B981",
      spo2: "#EC4899",
      grid: "#E2E8F0",
      gradient1: "#6366F1",
      gradient2: "#3B82F6",
    },
  },
}

export const darkTheme: AppTheme = {
  dark: true,
  colors: {
    // Primary brand colors
    primary: "#818CF8",
    primaryLight: "#A5B4FC",
    primaryDark: "#6366F1",
    
    // Background & surfaces with subtle gradients
    background: "#0F172A",
    surface: "#1E293B",
    card: "#1E293B",
    
    // Text colors with hierarchy
    text: "#F1F5F9",
    textSecondary: "#CBD5E1",
    textTertiary: "#94A3B8",
    
    // UI elements
    border: "#334155",
    divider: "#475569",
    
    // Semantic colors
    notification: "#818CF8",
    success: "#10B981",
    successLight: "#064E3B",
    warning: "#F59E0B",
    warningLight: "#78350F",
    error: "#EF4444",
    errorLight: "#7F1D1D",
    info: "#60A5FA",
    
    // Chart colors
    chart: {
      ppg: "#818CF8",
      ecg: "#34D399",
      spo2: "#F472B6",
      grid: "#334155",
      gradient1: "#818CF8",
      gradient2: "#60A5FA",
    },
  },
}

