"use client"
import { useState, useCallback, useEffect, useRef } from "react"
import { View, Text, StyleSheet, Pressable, ScrollView, Alert } from "react-native"
import { useTheme } from "../contexts/ThemeContext"
import CameraView from "../components/CameraView"
import LiveSignalMonitor, { LiveSignalMonitorRef } from "../components/LiveSignalMonitor"
import RecordingMetadataForm from "../components/RecordingMetadataForm"
import { recordingService } from "../services/RecordingService"
import type { PPGSample } from "../types"
import { APP_CONFIG } from "../config/constants"

export default function AcquisitionScreen() {
  const { theme } = useTheme()
  const [isRecording, setIsRecording] = useState(false)
  const [showMetadataForm, setShowMetadataForm] = useState(false)
  const [recordingStatus, setRecordingStatus] = useState(recordingService.getStatus())

  // FIX: Use Ref to track recording state inside the high-frequency callback
  // This prevents the "Stale Closure" bug where the camera loop sees isRecording=false
  const isRecordingRef = useRef(false)
  const monitorRef = useRef<LiveSignalMonitorRef>(null)

  // Sync Ref with State
  useEffect(() => {
    isRecordingRef.current = isRecording
  }, [isRecording])

  useEffect(() => {
    let interval: NodeJS.Timeout
    if (isRecording) {
      interval = setInterval(() => {
        setRecordingStatus(recordingService.getStatus())
      }, 500)
    }
    return () => clearInterval(interval)
  }, [isRecording])

  // FIX: Callback now has NO dependencies and uses Ref
  const handleCameraSample = useCallback((timestamp: number, value: number) => {
    const sample: PPGSample = { timestamp, value, source: "camera" }

    // 1. Save Data (Check Ref, not State)
    if (isRecordingRef.current) {
       recordingService.addSample(sample)
    }

    // 2. Update Graph
    if (monitorRef.current) {
        monitorRef.current.addSample(value)
    }
  }, []) 

  const handleStartRecordingWithMetadata = useCallback(
    async (patientId: string, notes: string) => {
      try {
        recordingService.startRecording("camera", patientId || undefined, notes || undefined)
        setIsRecording(true) // Triggers Ref update
      } catch (error) {
        Alert.alert("Error", "Failed to start recording")
      }
    },
    []
  )

  const handleStopRecording = useCallback(async () => {
    try {
      const session = await recordingService.stopRecording()
      setIsRecording(false) // Triggers Ref update

      if (session) {
        Alert.alert(
          "Recording Saved",
          `Duration: ${Math.round(session.duration)}s\nSamples: ${recordingStatus.sampleCount}`
        )
      }
    } catch (error) {
      Alert.alert("Error", "Failed to save recording")
    }
  }, [recordingStatus])

  const toggleRecording = useCallback(async () => {
    if (isRecording) {
      await handleStopRecording()
    } else {
      setShowMetadataForm(true)
    }
  }, [isRecording, handleStopRecording])

  return (
    <ScrollView style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <View style={[styles.panel, { backgroundColor: theme.colors.card, borderColor: theme.colors.border }]}>
        <Text style={[styles.panelTitle, { color: theme.colors.text }]}>Data Source: Camera PPG</Text>
      </View>

      <View style={styles.cameraContainer}>
        {/* isRecording=true keeps the camera loop running continuously for the graph */}
        <CameraView onSample={handleCameraSample} isRecording={true} />
      </View>

      <LiveSignalMonitor
        ref={monitorRef}
        sampleRate={APP_CONFIG.CAMERA_SAMPLE_RATE}
        enableDSP={true}
      />

      <View style={styles.controlPanel}>
        <Pressable
          style={[
            styles.recordButton,
            { backgroundColor: isRecording ? theme.colors.error : theme.colors.primary },
          ]}
          onPress={toggleRecording}
        >
          <Text style={styles.recordButtonText}>{isRecording ? "Stop Recording" : "Start Recording"}</Text>
        </Pressable>
      </View>

      <RecordingMetadataForm
        visible={showMetadataForm}
        onClose={() => setShowMetadataForm(false)}
        onSubmit={handleStartRecordingWithMetadata}
      />
    </ScrollView>
  )
}

const styles = StyleSheet.create({
  container: { flex: 1, paddingVertical: 8 },
  panel: { marginHorizontal: 12, marginVertical: 8, padding: 16, borderRadius: 14, borderWidth: 1 },
  panelTitle: { fontSize: 18, fontWeight: "700" },
  cameraContainer: { height: 320, marginHorizontal: 12, borderRadius: 14, overflow: "hidden", borderWidth: 1 },
  controlPanel: { padding: 16, paddingBottom: 24 },
  recordButton: { paddingVertical: 18, borderRadius: 14, alignItems: "center" },
  recordButtonText: { color: "#FFFFFF", fontSize: 17, fontWeight: "700" },
})