"use client"
import { useState, useEffect, useRef } from "react"
import { View, Text, StyleSheet, ScrollView, Alert, ActivityIndicator, Pressable } from "react-native"
import { useTheme } from "../contexts/ThemeContext"
import RecordingsList from "../components/RecordingsList"
import PlaybackControls from "../components/PlaybackControls"
import SignalChart from "../components/SignalChart"
import ClipList from "../components/ClipList"
import { storageService } from "../services/StorageService"
import { clipService } from "../services/ClipService"
import type { RecordingSession, PPGSample, ClipMarker } from "../types"

export default function PlaybackScreen() {
  const { theme } = useTheme()
  const [recordings, setRecordings] = useState<RecordingSession[]>([])
  const [selectedRecording, setSelectedRecording] = useState<RecordingSession | null>(null)
  const [samples, setSamples] = useState<PPGSample[]>([])
  const [clips, setClips] = useState<ClipMarker[]>([])
  const [loading, setLoading] = useState(false)

  // Playback state
  const [isPlaying, setIsPlaying] = useState(false)
  const [currentTime, setCurrentTime] = useState(0)
  const [playbackSpeed, setPlaybackSpeed] = useState(1.0)
  const playbackIntervalRef = useRef<NodeJS.Timeout | null>(null)

  useEffect(() => {
    loadRecordings()
  }, [])

  useEffect(() => {
    if (selectedRecording) {
      loadRecordingData(selectedRecording.id)
    }
  }, [selectedRecording])

  useEffect(() => {
    if (isPlaying && selectedRecording) {
      playbackIntervalRef.current = setInterval(() => {
        setCurrentTime((prev) => {
          const next = prev + 0.1 * playbackSpeed
          if (next >= selectedRecording.duration) {
            setIsPlaying(false)
            return 0
          }
          return next
        })
      }, 100)
    } else {
      if (playbackIntervalRef.current) {
        clearInterval(playbackIntervalRef.current)
      }
    }

    return () => {
      if (playbackIntervalRef.current) {
        clearInterval(playbackIntervalRef.current)
      }
    }
  }, [isPlaying, playbackSpeed, selectedRecording])

  const loadRecordings = async () => {
    try {
      const data = await storageService.getAllSessions()
      setRecordings(data.sort((a, b) => b.startTime - a.startTime))
    } catch (error) {
      Alert.alert("Error", "Failed to load recordings")
    }
  }

  const loadRecordingData = async (recordingId: string) => {
    setLoading(true)
    try {
      const session = await storageService.getSession(recordingId)
      if (session) {
        const data = await storageService.loadPPGSamplesFromFile(session.filePath)
        setSamples(data)

        const clipData = await clipService.getClips(recordingId)
        setClips(clipData)

        setCurrentTime(0)
        setIsPlaying(false)
      }
    } catch (error) {
      Alert.alert("Error", "Failed to load recording data")
    } finally {
      setLoading(false)
    }
  }

  const handleRecordingPress = (recording: RecordingSession) => {
    setSelectedRecording(recording)
  }

  const handleRecordingDelete = async (recordingId: string) => {
    Alert.alert("Delete Recording", "Are you sure you want to delete this recording?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Delete",
        style: "destructive",
        onPress: async () => {
          try {
            await storageService.deleteSession(recordingId)
            await loadRecordings()
            if (selectedRecording?.id === recordingId) {
              setSelectedRecording(null)
              setSamples([])
              setClips([])
            }
          } catch (error) {
            Alert.alert("Error", "Failed to delete recording")
          }
        },
      },
    ])
  }

  const handleRecordingExport = async (recordingId: string) => {
    try {
      await storageService.exportAndShare(recordingId)
    } catch (error) {
      Alert.alert("Error", "Failed to export recording")
    }
  }

  const handlePlayPause = () => {
    setIsPlaying(!isPlaying)
  }

  const handleSeek = (time: number) => {
    setCurrentTime(time)
  }

  const handleSpeedChange = (speed: number) => {
    setPlaybackSpeed(speed)
  }

  const handleAddClip = () => {
    if (!selectedRecording) return

    // Default clip duration: 5 seconds
    const startTime = Math.max(0, currentTime - 2.5)
    const endTime = Math.min(selectedRecording.duration, currentTime + 2.5)

    Alert.prompt("Create Clip", "Enter a label for this clip:", async (label) => {
      try {
        await clipService.createClip(selectedRecording.id, startTime, endTime, label || undefined)
        const updatedClips = await clipService.getClips(selectedRecording.id)
        setClips(updatedClips)
      } catch (error) {
        Alert.alert("Error", "Failed to create clip")
      }
    })
  }

  const handleClipPress = (clip: ClipMarker) => {
    setCurrentTime(clip.startTime)
    setIsPlaying(true)
  }

  const handleClipDelete = async (clipId: string) => {
    try {
      await clipService.deleteClip(clipId)
      if (selectedRecording) {
        const updatedClips = await clipService.getClips(selectedRecording.id)
        setClips(updatedClips)
      }
    } catch (error) {
      Alert.alert("Error", "Failed to delete clip")
    }
  }

  // Get visible samples based on current time
  const getVisibleSamples = () => {
    if (samples.length === 0 || !selectedRecording) return []

    const startTimestamp = samples[0].timestamp
    const currentTimestamp = startTimestamp + currentTime * 1000

    // Show 10 seconds of data
    const windowStart = currentTimestamp - 5000
    const windowEnd = currentTimestamp + 5000

    return samples.filter((s) => s.timestamp >= windowStart && s.timestamp <= windowEnd)
  }

  if (!selectedRecording) {
    return (
      <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
        <RecordingsList
          recordings={recordings}
          onRecordingPress={handleRecordingPress}
          onRecordingDelete={handleRecordingDelete}
          onRecordingExport={handleRecordingExport}
        />
      </View>
    )
  }

  return (
    <ScrollView style={[styles.container, { backgroundColor: theme.colors.background }]}>
      {/* Recording Header */}
      <View style={[styles.header, { backgroundColor: theme.colors.card, borderColor: theme.colors.border }]}>
        <View style={styles.headerContent}>
          <Text style={[styles.headerTitle, { color: theme.colors.text }]}>
            {selectedRecording.patientId || selectedRecording.id.substring(0, 8)}
          </Text>
          <Text style={[styles.headerSubtitle, { color: theme.colors.text + "80" }]}>
            {new Date(selectedRecording.startTime).toLocaleString()}
          </Text>
        </View>
        <Pressable
          style={[styles.backButton, { backgroundColor: theme.colors.background }]}
          onPress={() => setSelectedRecording(null)}
        >
          <Text style={[styles.backText, { color: theme.colors.text }]}>Back</Text>
        </Pressable>
      </View>

      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={theme.colors.primary} />
          <Text style={[styles.loadingText, { color: theme.colors.text }]}>Loading recording...</Text>
        </View>
      ) : (
        <>
          {/* Signal Visualization */}
          <View
            style={[styles.chartContainer, { backgroundColor: theme.colors.card, borderColor: theme.colors.border }]}
          >
            <Text style={[styles.chartTitle, { color: theme.colors.text }]}>PPG Signal</Text>
            <SignalChart
              data={getVisibleSamples().map((s) => s.value)}
              visibleDuration={10}
              sampleRate={selectedRecording.sampleRate}
              color={theme.colors.chart.ppg}
            />
          </View>

          {/* Playback Controls */}
          <PlaybackControls
            isPlaying={isPlaying}
            currentTime={currentTime}
            duration={selectedRecording.duration}
            playbackSpeed={playbackSpeed}
            onPlayPause={handlePlayPause}
            onSeek={handleSeek}
            onSpeedChange={handleSpeedChange}
            onAddClip={handleAddClip}
          />

          {/* Clips */}
          <ClipList
            clips={clips}
            currentTime={currentTime}
            onClipPress={handleClipPress}
            onClipDelete={handleClipDelete}
          />
        </>
      )}
    </ScrollView>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 16,
    margin: 16,
    borderRadius: 12,
    borderWidth: 1,
  },
  headerContent: {
    flex: 1,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: "700",
    marginBottom: 4,
  },
  headerSubtitle: {
    fontSize: 14,
  },
  backButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
  },
  backText: {
    fontSize: 15,
    fontWeight: "600",
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 40,
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
  },
  chartContainer: {
    margin: 16,
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
  },
  chartTitle: {
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 12,
  },
})
