// Digital Signal Processing utilities for PPG signal filtering
import type { DSPConfig } from "../types"
import { APP_CONFIG } from "../config/constants"

export class DSPProcessor {
  private config: DSPConfig
  private sampleRate: number
  private b: number[] = []
  private a: number[] = []
  private x: number[] = [0, 0, 0, 0, 0]
  private y: number[] = [0, 0, 0, 0, 0]

  constructor(sampleRate: number, config?: Partial<DSPConfig>) {
    this.sampleRate = sampleRate
    this.config = {
      bandpassLow: config?.bandpassLow ?? APP_CONFIG.BANDPASS_LOW,
      bandpassHigh: config?.bandpassHigh ?? APP_CONFIG.BANDPASS_HIGH,
      notchFrequency: config?.notchFrequency ?? APP_CONFIG.NOTCH_FREQUENCY,
      smoothingWindow: config?.smoothingWindow ?? APP_CONFIG.SMOOTHING_WINDOW,
    }
    this.calculateFilterCoefficients()
  }

  private calculateFilterCoefficients() {
    const lowFreq = this.config.bandpassLow / this.sampleRate
    const highFreq = this.config.bandpassHigh / this.sampleRate
    const w1 = 2 * Math.PI * lowFreq
    const w2 = 2 * Math.PI * highFreq
    const w0 = Math.sqrt(w1 * w2)
    const bw = w2 - w1
    const r = Math.exp(-bw / 2)
    const k = Math.cos(w0)
    this.b = [1 - r, 0, -(1 - r)]
    this.a = [1, -2 * r * k, r * r]
  }

  applyBandpassFilter(sample: number): number {
    for (let i = this.x.length - 1; i > 0; i--) {
      this.x[i] = this.x[i - 1]
      this.y[i] = this.y[i - 1]
    }
    this.x[0] = sample
    let output = 0
    for (let i = 0; i < this.b.length; i++) output += this.b[i] * this.x[i]
    for (let i = 1; i < this.a.length; i++) output -= this.a[i] * this.y[i]
    output /= this.a[0]
    this.y[0] = output
    return output
  }

  private smoothingBuffer: number[] = []
  applySmoothing(sample: number): number {
    this.smoothingBuffer.push(sample)
    if (this.smoothingBuffer.length > this.config.smoothingWindow) {
      this.smoothingBuffer.shift()
    }
    const sum = this.smoothingBuffer.reduce((acc, val) => acc + val, 0)
    return sum / this.smoothingBuffer.length
  }

  processSample(rawSample: number): number {
    let processed = this.applyBandpassFilter(rawSample)
    processed = this.applySmoothing(processed)
    return processed
  }

  reset() {
    this.x = [0, 0, 0, 0, 0]
    this.y = [0, 0, 0, 0, 0]
    this.smoothingBuffer = []
  }

  // FIX: Improved Peak Detection for Weak Signals
  static calculateHeartRate(samples: number[], sampleRate: number): number {
    if (samples.length < sampleRate * 2) return 0

    // 1. Normalize data to -1 to 1 range to handle weak signals equally
    const min = Math.min(...samples)
    const max = Math.max(...samples)
    const range = max - min
    
    // If signal is flat (noise only), return 0
    if (range < 0.0001) return 0

    const normalized = samples.map(v => (v - min) / range * 2 - 1)

    // 2. Dynamic Thresholding
    // We look for peaks that are "significant" relative to the local signal
    const mean = normalized.reduce((a, b) => a + b, 0) / normalized.length
    const threshold = mean + 0.4 // Look for peaks 40% above mean

    const peaks: number[] = []
    let lastPeakIndex = -100

    for (let i = 1; i < normalized.length - 1; i++) {
      // Peak criteria: larger than neighbors, above threshold, and min distance (to avoid noise)
      if (
        normalized[i] > normalized[i - 1] &&
        normalized[i] > normalized[i + 1] &&
        normalized[i] > threshold &&
        (i - lastPeakIndex) > (sampleRate / 4) // Max 240 BPM limit
      ) {
        peaks.push(i)
        lastPeakIndex = i
      }
    }

    if (peaks.length < 2) return 0

    // 3. Calculate Intervals
    const intervals: number[] = []
    for (let i = 1; i < peaks.length; i++) {
      intervals.push(peaks[i] - peaks[i - 1])
    }

    const avgInterval = intervals.reduce((a, b) => a + b, 0) / intervals.length
    const bpm = (60 * sampleRate) / avgInterval

    // Sanity check
    if (bpm < 40 || bpm > 200) return 0

    return Math.round(bpm)
  }
}