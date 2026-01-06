export const APP_CONFIG = {
  // Signal processing
  DEFAULT_SAMPLE_RATE: 60, // Hz
  CAMERA_SAMPLE_RATE: 30, // Hz (camera frame rate)
  BLE_SAMPLE_RATE: 100, // Hz (typical for medical BLE sensors)

  // DSP parameters
  BANDPASS_LOW: 0.5, // Hz
  BANDPASS_HIGH: 5.0, // Hz
  NOTCH_FREQUENCY: 60, // Hz (US powerline)
  SMOOTHING_WINDOW: 5, // samples

  // Recording limits
  MAX_RECORDING_DURATION: 3600, // seconds (1 hour)
  BUFFER_SIZE: 1000, // samples to keep in memory

  // MIMIC format
  MIMIC_VERSION: "III",
  MIMIC_SIGNAL_TYPE: "PPG",
  MIMIC_UNITS: "normalized",

  // File export
  EXPORT_FORMAT: "csv",
  CSV_DELIMITER: ",",
  TIMESTAMP_FORMAT: "ISO8601",

  // BLE
  BLE_SCAN_TIMEOUT: 10000, // ms
  BLE_SERVICE_UUID: "0000180d-0000-1000-8000-00805f9b34fb", // Heart Rate Service
  BLE_CHARACTERISTIC_UUID: "00002a37-0000-1000-8000-00805f9b34fb", // Heart Rate Measurement

  // UI
  CHART_UPDATE_INTERVAL: 33, // ms (~30 fps)
  CHART_VISIBLE_DURATION: 10, // seconds
  PLAYBACK_SPEED_OPTIONS: [0.25, 0.5, 1.0, 2.0, 4.0],
}

export const THEME_STORAGE_KEY = "@ppg_theme_preference"
export const RECORDINGS_STORAGE_KEY = "@ppg_recordings"
export const CLIPS_STORAGE_KEY = "@ppg_clips"
