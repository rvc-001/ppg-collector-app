"use client"
import { useState, useEffect, useRef, forwardRef, useImperativeHandle } from "react"
import { View, Text, StyleSheet, ScrollView } from "react-native"
import { useTheme } from "../contexts/ThemeContext"
import SignalChart from "./SignalChart"
import { DSPProcessor } from "../utils/dsp"
import { APP_CONFIG } from "../config/constants"

interface LiveSignalMonitorProps {
  sampleRate: number
  visibleDuration?: number
  enableDSP?: boolean
}

export interface LiveSignalMonitorRef {
  addSample: (value: number) => void
}

// FIX: Wrapped in forwardRef to allow parent to push data
const LiveSignalMonitor = forwardRef<LiveSignalMonitorRef, LiveSignalMonitorProps>(({
  sampleRate,
  visibleDuration = APP_CONFIG.CHART_VISIBLE_DURATION,
  enableDSP = true,
}, ref) => {
  const { theme } = useTheme()
  
  // We use refs for data to avoid re-rendering the whole component on every sample
  const dataStore = useRef<{ raw: number[], filtered: number[] }>({ raw: [], filtered: [] })
  const dspProcessor = useRef<DSPProcessor | null>(null)
  
  // State is only updated periodically for the Chart to render
  const [displayData, setDisplayData] = useState<{ raw: number[], filtered: number[] }>({ raw: [], filtered: [] })
  const [metrics, setMetrics] = useState({ hr: 0, quality: 0 })

  useEffect(() => {
    dspProcessor.current = new DSPProcessor(sampleRate)
  }, [sampleRate])

  // FIX: Expose addSample method to parent
  useImperativeHandle(ref, () => ({
    addSample: (rawValue: number) => {
      // 1. Store Raw
      const maxSamples = Math.floor(visibleDuration * sampleRate)
      dataStore.current.raw.push(rawValue)
      if (dataStore.current.raw.length > maxSamples) dataStore.current.raw.shift()

      // 2. Process DSP
      if (enableDSP && dspProcessor.current) {
        const filtered = dspProcessor.current.processSample(rawValue)
        dataStore.current.filtered.push(filtered)
        if (dataStore.current.filtered.length > maxSamples) dataStore.current.filtered.shift()
      }
    }
  }))

  // Animation Loop: Update Charts @ 30fps
  useEffect(() => {
    const interval = setInterval(() => {
      // Copy ref data to state to trigger render
      setDisplayData({
        raw: [...dataStore.current.raw],
        filtered: [...dataStore.current.filtered]
      })
    }, 33) 
    return () => clearInterval(interval)
  }, [])

  // Metrics Loop: Calculate HR @ 1fps
  useEffect(() => {
    const interval = setInterval(() => {
      const data = dataStore.current.filtered
      if (data.length > sampleRate * 2) {
        const bpm = DSPProcessor.calculateHeartRate(data, sampleRate)
        setMetrics(m => ({ ...m, hr: bpm }))
      }
    }, 1000)
    return () => clearInterval(interval)
  }, [sampleRate])

  return (
    <ScrollView style={styles.container}>
      <View style={[styles.metricsPanel, { backgroundColor: theme.colors.card, borderColor: theme.colors.border }]}>
        <View style={styles.metric}>
          <Text style={[styles.metricLabel, { color: theme.colors.text }]}>Heart Rate</Text>
          <Text style={[styles.metricValue, { color: theme.colors.primary }]}>{metrics.hr || "--"}</Text>
          <Text style={styles.metricUnit}>BPM</Text>
        </View>
      </View>

      <View style={[styles.chartContainer, { backgroundColor: theme.colors.card, borderColor: theme.colors.border }]}>
        <Text style={[styles.chartTitle, { color: theme.colors.text }]}>Raw Signal</Text>
        <SignalChart
          data={displayData.raw}
          visibleDuration={visibleDuration}
          sampleRate={sampleRate}
          color={theme.colors.chart.ppg}
          label="Raw Intensity"
        />
      </View>

      <View style={[styles.chartContainer, { backgroundColor: theme.colors.card, borderColor: theme.colors.border }]}>
        <Text style={[styles.chartTitle, { color: theme.colors.text }]}>Filtered Signal</Text>
        <SignalChart
          data={displayData.filtered}
          visibleDuration={visibleDuration}
          sampleRate={sampleRate}
          color={theme.colors.chart.ecg}
          label="Filtered (0.5-5Hz)"
        />
      </View>
    </ScrollView>
  )
})

const styles = StyleSheet.create({
  container: { flex: 1 },
  metricsPanel: { 
    flexDirection: "row", justifyContent: "center", 
    padding: 20, margin: 10, borderRadius: 16, borderWidth: 1 
  },
  metric: { alignItems: "center" },
  metricLabel: { fontSize: 14, opacity: 0.7, textTransform: "uppercase", letterSpacing: 1 },
  metricValue: { fontSize: 42, fontWeight: "bold", marginVertical: 5 },
  metricUnit: { fontSize: 12, opacity: 0.5 },
  chartContainer: { 
    margin: 10, padding: 15, borderRadius: 16, borderWidth: 1, minHeight: 250,
    elevation: 2, shadowColor: "#000", shadowOpacity: 0.1, shadowRadius: 4 
  },
  chartTitle: { fontSize: 16, fontWeight: "600", marginBottom: 10 },
})

export default LiveSignalMonitor