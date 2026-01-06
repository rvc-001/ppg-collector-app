"use client"
import { View, Text, StyleSheet, Pressable } from "react-native"
import { useTheme } from "../contexts/ThemeContext"
import { APP_CONFIG } from "../config/constants"

interface PlaybackControlsProps {
  isPlaying: boolean
  currentTime: number
  duration: number
  playbackSpeed: number
  onPlayPause: () => void
  onSeek: (time: number) => void
  onSpeedChange: (speed: number) => void
  onAddClip: () => void
}

export default function PlaybackControls({
  isPlaying,
  currentTime,
  duration,
  playbackSpeed,
  onPlayPause,
  onSeek,
  onSpeedChange,
  onAddClip,
}: PlaybackControlsProps) {
  const { theme } = useTheme()

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = Math.floor(seconds % 60)
    return `${mins}:${secs.toString().padStart(2, "0")}`
  }

  const handleSeekBackward = () => {
    onSeek(Math.max(0, currentTime - 5))
  }

  const handleSeekForward = () => {
    onSeek(Math.min(duration, currentTime + 5))
  }

  const cycleSpeed = () => {
    const speeds = APP_CONFIG.PLAYBACK_SPEED_OPTIONS
    const currentIndex = speeds.indexOf(playbackSpeed)
    const nextIndex = (currentIndex + 1) % speeds.length
    onSpeedChange(speeds[nextIndex])
  }

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.card, borderColor: theme.colors.border }]}>
      {/* Timeline */}
      <View style={styles.timeline}>
        <Text style={[styles.timeText, { color: theme.colors.text }]}>{formatTime(currentTime)}</Text>
        <View style={styles.progressContainer}>
          <View style={[styles.progressBar, { backgroundColor: theme.colors.border }]}>
            <View
              style={[
                styles.progressFill,
                {
                  backgroundColor: theme.colors.primary,
                  width: `${(currentTime / duration) * 100}%`,
                },
              ]}
            />
          </View>
        </View>
        <Text style={[styles.timeText, { color: theme.colors.text }]}>{formatTime(duration)}</Text>
      </View>

      {/* Controls */}
      <View style={styles.controls}>
        {/* Speed Control */}
        <Pressable style={[styles.speedButton, { backgroundColor: theme.colors.background }]} onPress={cycleSpeed}>
          <Text style={[styles.speedText, { color: theme.colors.text }]}>{playbackSpeed}x</Text>
        </Pressable>

        {/* Seek Backward */}
        <Pressable
          style={[styles.controlButton, { backgroundColor: theme.colors.background }]}
          onPress={handleSeekBackward}
        >
          <Text style={[styles.controlIcon, { color: theme.colors.text }]}>-5s</Text>
        </Pressable>

        {/* Play/Pause */}
        <Pressable style={[styles.playButton, { backgroundColor: theme.colors.primary }]} onPress={onPlayPause}>
          <Text style={styles.playIcon}>{isPlaying ? "||" : "▶"}</Text>
        </Pressable>

        {/* Seek Forward */}
        <Pressable
          style={[styles.controlButton, { backgroundColor: theme.colors.background }]}
          onPress={handleSeekForward}
        >
          <Text style={[styles.controlIcon, { color: theme.colors.text }]}>+5s</Text>
        </Pressable>

        {/* Add Clip */}
        <Pressable style={[styles.controlButton, { backgroundColor: theme.colors.success }]} onPress={onAddClip}>
          <Text style={[styles.controlIcon, { color: "#FFFFFF" }]}>+Clip</Text>
        </Pressable>
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    margin: 16,
  },
  timeline: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    marginBottom: 16,
  },
  timeText: {
    fontSize: 14,
    fontWeight: "600",
    minWidth: 45,
  },
  progressContainer: {
    flex: 1,
  },
  progressBar: {
    height: 6,
    borderRadius: 3,
    overflow: "hidden",
  },
  progressFill: {
    height: "100%",
    borderRadius: 3,
  },
  controls: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    gap: 12,
  },
  speedButton: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 6,
  },
  speedText: {
    fontSize: 14,
    fontWeight: "600",
  },
  controlButton: {
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: 8,
  },
  controlIcon: {
    fontSize: 13,
    fontWeight: "600",
  },
  playButton: {
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: "center",
    alignItems: "center",
  },
  playIcon: {
    fontSize: 20,
    color: "#FFFFFF",
    fontWeight: "700",
  },
})
