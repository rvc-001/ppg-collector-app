"use client"
import { View, Text, StyleSheet, FlatList, Pressable } from "react-native"
import { useTheme } from "../contexts/ThemeContext"
import type { RecordingSession } from "../types"

interface RecordingsListProps {
  recordings: RecordingSession[]
  onRecordingPress: (recording: RecordingSession) => void
  onRecordingDelete: (recordingId: string) => void
  onRecordingExport: (recordingId: string) => void
}

export default function RecordingsList({
  recordings,
  onRecordingPress,
  onRecordingDelete,
  onRecordingExport,
}: RecordingsListProps) {
  const { theme } = useTheme()

  const formatDate = (timestamp: number) => {
    const date = new Date(timestamp)
    return date.toLocaleString()
  }

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = Math.floor(seconds % 60)
    return `${mins}:${secs.toString().padStart(2, "0")}`
  }

  const renderRecording = ({ item }: { item: RecordingSession }) => (
    <Pressable
      style={[styles.recordingItem, { backgroundColor: theme.colors.card, borderColor: theme.colors.border }]}
      onPress={() => onRecordingPress(item)}
    >
      <View style={styles.recordingInfo}>
        <Text style={[styles.recordingId, { color: theme.colors.text }]}>
          {item.patientId || item.id.substring(0, 8)}
        </Text>
        <Text style={[styles.recordingDate, { color: theme.colors.text + "80" }]}>{formatDate(item.startTime)}</Text>
        <View style={styles.recordingMeta}>
          <Text style={[styles.metaText, { color: theme.colors.text + "60" }]}>
            {formatDuration(item.duration)} • {Math.round(item.sampleRate)} Hz • {item.dataSource}
          </Text>
        </View>
        {item.notes && (
          <Text style={[styles.notes, { color: theme.colors.text + "80" }]} numberOfLines={2}>
            {item.notes}
          </Text>
        )}
      </View>
      <View style={styles.actions}>
        <Pressable
          style={[styles.actionButton, { backgroundColor: theme.colors.primary }]}
          onPress={() => onRecordingExport(item.id)}
        >
          <Text style={styles.actionText}>Export</Text>
        </Pressable>
        <Pressable
          style={[styles.actionButton, { backgroundColor: theme.colors.error }]}
          onPress={() => onRecordingDelete(item.id)}
        >
          <Text style={styles.actionText}>Delete</Text>
        </Pressable>
      </View>
    </Pressable>
  )

  if (recordings.length === 0) {
    return (
      <View style={styles.emptyState}>
        <Text style={[styles.emptyText, { color: theme.colors.text + "80" }]}>No recordings found</Text>
        <Text style={[styles.emptySubtext, { color: theme.colors.text + "60" }]}>
          Create recordings from the Acquisition tab
        </Text>
      </View>
    )
  }

  return (
    <FlatList
      data={recordings}
      renderItem={renderRecording}
      keyExtractor={(item) => item.id}
      contentContainerStyle={styles.list}
    />
  )
}

const styles = StyleSheet.create({
  list: {
    padding: 16,
    gap: 12,
  },
  recordingItem: {
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
  },
  recordingInfo: {
    marginBottom: 12,
  },
  recordingId: {
    fontSize: 18,
    fontWeight: "700",
    marginBottom: 4,
  },
  recordingDate: {
    fontSize: 14,
    marginBottom: 8,
  },
  recordingMeta: {
    marginBottom: 8,
  },
  metaText: {
    fontSize: 12,
  },
  notes: {
    fontSize: 13,
    fontStyle: "italic",
  },
  actions: {
    flexDirection: "row",
    gap: 8,
  },
  actionButton: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 8,
    alignItems: "center",
  },
  actionText: {
    color: "#FFFFFF",
    fontSize: 14,
    fontWeight: "600",
  },
  emptyState: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 40,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: "600",
    marginBottom: 8,
  },
  emptySubtext: {
    fontSize: 14,
    textAlign: "center",
  },
})
