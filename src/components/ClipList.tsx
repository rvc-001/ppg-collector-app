"use client"
import { View, Text, StyleSheet, FlatList, Pressable } from "react-native"
import { useTheme } from "../contexts/ThemeContext"
import type { ClipMarker } from "../types"

interface ClipListProps {
  clips: ClipMarker[]
  currentTime: number
  onClipPress: (clip: ClipMarker) => void
  onClipDelete: (clipId: string) => void
}

export default function ClipList({ clips, currentTime, onClipPress, onClipDelete }: ClipListProps) {
  const { theme } = useTheme()

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = Math.floor(seconds % 60)
    return `${mins}:${secs.toString().padStart(2, "0")}`
  }

  const renderClip = ({ item }: { item: ClipMarker }) => {
    const duration = item.endTime - item.startTime
    const isActive = currentTime >= item.startTime && currentTime <= item.endTime

    return (
      <Pressable
        style={[
          styles.clipItem,
          {
            backgroundColor: isActive ? theme.colors.primary + "20" : theme.colors.background,
            borderColor: isActive ? theme.colors.primary : theme.colors.border,
          },
        ]}
        onPress={() => onClipPress(item)}
      >
        <View style={[styles.clipColor, { backgroundColor: item.color }]} />
        <View style={styles.clipInfo}>
          <Text style={[styles.clipLabel, { color: theme.colors.text }]}>{item.label || "Untitled Clip"}</Text>
          <Text style={[styles.clipTime, { color: theme.colors.text + "80" }]}>
            {formatTime(item.startTime)} - {formatTime(item.endTime)} ({duration.toFixed(1)}s)
          </Text>
        </View>
        <Pressable
          style={[styles.deleteButton, { backgroundColor: theme.colors.error }]}
          onPress={() => onClipDelete(item.id)}
        >
          <Text style={styles.deleteIcon}>×</Text>
        </Pressable>
      </Pressable>
    )
  }

  if (clips.length === 0) {
    return (
      <View style={[styles.emptyState, { backgroundColor: theme.colors.card, borderColor: theme.colors.border }]}>
        <Text style={[styles.emptyText, { color: theme.colors.text + "80" }]}>No clips created</Text>
        <Text style={[styles.emptySubtext, { color: theme.colors.text + "60" }]}>
          Use the +Clip button during playback to mark interesting segments
        </Text>
      </View>
    )
  }

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.card, borderColor: theme.colors.border }]}>
      <Text style={[styles.title, { color: theme.colors.text }]}>Clips ({clips.length})</Text>
      <FlatList
        data={clips}
        renderItem={renderClip}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.list}
      />
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    margin: 16,
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    maxHeight: 300,
  },
  title: {
    fontSize: 18,
    fontWeight: "700",
    marginBottom: 12,
  },
  list: {
    gap: 8,
  },
  clipItem: {
    flexDirection: "row",
    alignItems: "center",
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    gap: 12,
  },
  clipColor: {
    width: 4,
    height: 40,
    borderRadius: 2,
  },
  clipInfo: {
    flex: 1,
  },
  clipLabel: {
    fontSize: 15,
    fontWeight: "600",
    marginBottom: 4,
  },
  clipTime: {
    fontSize: 13,
  },
  deleteButton: {
    width: 28,
    height: 28,
    borderRadius: 14,
    justifyContent: "center",
    alignItems: "center",
  },
  deleteIcon: {
    color: "#FFFFFF",
    fontSize: 20,
    fontWeight: "700",
  },
  emptyState: {
    margin: 16,
    padding: 24,
    borderRadius: 12,
    borderWidth: 1,
    alignItems: "center",
  },
  emptyText: {
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 4,
  },
  emptySubtext: {
    fontSize: 13,
    textAlign: "center",
  },
})
