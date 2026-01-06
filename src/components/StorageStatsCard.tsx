"use client"
import { useState, useEffect } from "react"
import { View, Text, StyleSheet, Pressable, Alert } from "react-native"
import { useTheme } from "../contexts/ThemeContext"
import { storageService } from "../services/StorageService"

export default function StorageStatsCard() {
  const { theme } = useTheme()
  const [stats, setStats] = useState({
    totalRecordings: 0,
    totalSize: 0,
    oldestRecording: undefined as Date | undefined,
    newestRecording: undefined as Date | undefined,
  })

  useEffect(() => {
    loadStats()
  }, [])

  const loadStats = async () => {
    const data = await storageService.getStorageStats()
    setStats(data)
  }

  const formatBytes = (bytes: number) => {
    if (bytes === 0) return "0 Bytes"
    const k = 1024
    const sizes = ["Bytes", "KB", "MB", "GB"]
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + " " + sizes[i]
  }

  const handleClearAll = () => {
    Alert.alert("Clear All Data", "This will permanently delete all recordings. This action cannot be undone.", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Delete All",
        style: "destructive",
        onPress: async () => {
          // TODO: Implement clear all functionality
          Alert.alert("Success", "All recordings have been deleted")
          loadStats()
        },
      },
    ])
  }

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.card, borderColor: theme.colors.border }]}>
      <Text style={[styles.title, { color: theme.colors.text }]}>Storage Statistics</Text>

      <View style={styles.statsGrid}>
        <View style={styles.stat}>
          <Text style={[styles.statValue, { color: theme.colors.primary }]}>{stats.totalRecordings}</Text>
          <Text style={[styles.statLabel, { color: theme.colors.text + "80" }]}>Recordings</Text>
        </View>

        <View style={styles.stat}>
          <Text style={[styles.statValue, { color: theme.colors.primary }]}>{formatBytes(stats.totalSize)}</Text>
          <Text style={[styles.statLabel, { color: theme.colors.text + "80" }]}>Storage Used</Text>
        </View>
      </View>

      {stats.oldestRecording && (
        <View style={styles.dateInfo}>
          <Text style={[styles.dateLabel, { color: theme.colors.text + "80" }]}>Oldest Recording:</Text>
          <Text style={[styles.dateValue, { color: theme.colors.text }]}>
            {stats.oldestRecording.toLocaleDateString()}
          </Text>
        </View>
      )}

      {stats.newestRecording && (
        <View style={styles.dateInfo}>
          <Text style={[styles.dateLabel, { color: theme.colors.text + "80" }]}>Newest Recording:</Text>
          <Text style={[styles.dateValue, { color: theme.colors.text }]}>
            {stats.newestRecording.toLocaleDateString()}
          </Text>
        </View>
      )}

      <Pressable
        style={[styles.clearButton, { backgroundColor: theme.colors.error }]}
        onPress={handleClearAll}
        disabled={stats.totalRecordings === 0}
      >
        <Text style={styles.clearButtonText}>Clear All Data</Text>
      </Pressable>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    margin: 16,
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
  },
  title: {
    fontSize: 18,
    fontWeight: "700",
    marginBottom: 16,
  },
  statsGrid: {
    flexDirection: "row",
    gap: 16,
    marginBottom: 16,
  },
  stat: {
    flex: 1,
    alignItems: "center",
    padding: 12,
    borderRadius: 8,
    backgroundColor: "rgba(0, 102, 255, 0.05)",
  },
  statValue: {
    fontSize: 24,
    fontWeight: "700",
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
  },
  dateInfo: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: 8,
  },
  dateLabel: {
    fontSize: 13,
  },
  dateValue: {
    fontSize: 13,
    fontWeight: "600",
  },
  clearButton: {
    marginTop: 16,
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: "center",
  },
  clearButtonText: {
    color: "#FFFFFF",
    fontSize: 15,
    fontWeight: "600",
  },
})
