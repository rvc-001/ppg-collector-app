// Core data types for PPG pipeline

export interface PPGSample {
  timestamp: number // milliseconds since epoch
  value: number // normalized PPG amplitude
  source: "camera" | "ble" // data source
  deviceId?: string // for BLE devices
}

export interface BLESensorData {
  ppg?: number
  ecg?: number
  spo2?: number
  heartRate?: number
  timestamp: number
}

export interface RecordingSession {
  id: string
  startTime: number
  endTime?: number
  duration: number // seconds
  sampleRate: number // Hz
  dataSource: "camera" | "ble" | "both"
  patientId?: string
  notes?: string
  filePath: string // path to CSV file
}

export interface MIMICRecord {
  subject_id: string
  record_time: string // ISO 8601 format
  signal_type: "PPG" | "ECG" | "SpO2"
  sampling_rate: number
  units: string
  values: number[]
}

export interface ClipMarker {
  id: string
  recordingId: string
  startTime: number
  endTime: number
  label?: string
  color?: string
}

export interface BPEstimate {
  systolic: number
  diastolic: number
  confidence: number
  timestamp: number
}

export interface UploadedModel {
  id: string
  name: string
  filePath: string
  modelType: "pkl" | "pth" | "onnx"
  uploadDate: number
  metadata?: {
    description?: string
    inputFeatures?: number
    outputType?: string
  }
}

export interface ModelTestResult {
  modelId: string
  recordingId: string
  predictions: BPEstimate[]
  accuracy?: number
  mae?: number // mean absolute error
  rmse?: number // root mean squared error
  testDate: number
}

export interface AppTheme {
  dark: boolean
  colors: {
    primary: string
    primaryLight: string
    primaryDark: string
    background: string
    surface: string
    card: string
    text: string
    textSecondary: string
    textTertiary: string
    border: string
    divider: string
    notification: string
    success: string
    successLight: string
    warning: string
    warningLight: string
    error: string
    errorLight: string
    info: string
    chart: {
      ppg: string
      ecg: string
      spo2: string
      grid: string
      gradient1: string
      gradient2: string
    }
  }
}

export interface DSPConfig {
  bandpassLow: number // Hz
  bandpassHigh: number // Hz
  notchFrequency?: number // Hz (50/60 Hz powerline)
  smoothingWindow: number // samples
}
