"use client"
import { View, Text, StyleSheet, ActivityIndicator } from "react-native"
import { useTheme } from "../contexts/ThemeContext"
import type { BPEstimate } from "../types"

interface BPEstimationCardProps {
  estimate: BPEstimate | null
  loading?: boolean
}

export default function BPEstimationCard({ estimate, loading = false }: BPEstimationCardProps) {
  const { theme } = useTheme()

  const getBPCategory = (systolic: number, diastolic: number): { label: string; color: string } => {
    if (systolic < 120 && diastolic < 80) {
      return { label: "Normal", color: theme.colors.success }
    } else if (systolic < 130 && diastolic < 80) {
      return { label: "Elevated", color: theme.colors.warning }
    } else if (systolic < 140 || diastolic < 90) {
      return { label: "High BP (Stage 1)", color: theme.colors.error }
    } else {
      return { label: "High BP (Stage 2)", color: theme.colors.error }
    }
  }

  const getConfidenceColor = (confidence: number): string => {
    if (confidence > 0.8) return theme.colors.success
    if (confidence > 0.6) return theme.colors.warning
    return theme.colors.error
  }

  if (loading) {
    return (
      <View style={[styles.container, { backgroundColor: theme.colors.card, borderColor: theme.colors.border }]}>
        <ActivityIndicator size="large" color={theme.colors.primary} />
        <Text style={[styles.loadingText, { color: theme.colors.text }]}>Estimating blood pressure...</Text>
      </View>
    )
  }

  if (!estimate) {
    return (
      <View style={[styles.container, { backgroundColor: theme.colors.card, borderColor: theme.colors.border }]}>
        <Text style={[styles.emptyText, { color: theme.colors.text + "80" }]}>
          No blood pressure estimation available
        </Text>
        <Text style={[styles.emptySubtext, { color: theme.colors.text + "60" }]}>
          Record at least 5 seconds of PPG data to estimate BP
        </Text>
      </View>
    )
  }

  const category = getBPCategory(estimate.systolic, estimate.diastolic)

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.card, borderColor: theme.colors.border }]}>
      <Text style={[styles.title, { color: theme.colors.text }]}>Blood Pressure Estimation</Text>

      {/* BP Values */}
      <View style={styles.bpContainer}>
        <View style={styles.bpValue}>
          <Text style={[styles.bpNumber, { color: theme.colors.primary }]}>{estimate.systolic}</Text>
          <Text style={[styles.bpLabel, { color: theme.colors.text + "80" }]}>Systolic</Text>
          <Text style={[styles.bpUnit, { color: theme.colors.text + "60" }]}>mmHg</Text>
        </View>

        <Text style={[styles.bpSeparator, { color: theme.colors.text }]}>/</Text>

        <View style={styles.bpValue}>
          <Text style={[styles.bpNumber, { color: theme.colors.primary }]}>{estimate.diastolic}</Text>
          <Text style={[styles.bpLabel, { color: theme.colors.text + "80" }]}>Diastolic</Text>
          <Text style={[styles.bpUnit, { color: theme.colors.text + "60" }]}>mmHg</Text>
        </View>
      </View>

      {/* Category Badge */}
      <View style={[styles.categoryBadge, { backgroundColor: category.color + "20", borderColor: category.color }]}>
        <Text style={[styles.categoryText, { color: category.color }]}>{category.label}</Text>
      </View>

      {/* Confidence */}
      <View style={styles.confidenceContainer}>
        <Text style={[styles.confidenceLabel, { color: theme.colors.text + "80" }]}>Confidence</Text>
        <View style={styles.confidenceBar}>
          <View style={[styles.confidenceBarBg, { backgroundColor: theme.colors.border }]}>
            <View
              style={[
                styles.confidenceBarFill,
                {
                  backgroundColor: getConfidenceColor(estimate.confidence),
                  width: `${estimate.confidence * 100}%`,
                },
              ]}
            />
          </View>
          <Text style={[styles.confidenceValue, { color: theme.colors.text }]}>
            {Math.round(estimate.confidence * 100)}%
          </Text>
        </View>
      </View>

      {/* Disclaimer */}
      <View
        style={[styles.disclaimer, { backgroundColor: theme.colors.warning + "10", borderColor: theme.colors.warning }]}
      >
        <Text style={[styles.disclaimerText, { color: theme.colors.text + "80" }]}>
          ⚠ This is an experimental estimation. Not for medical diagnosis. Consult a healthcare professional for
          accurate measurements.
        </Text>
      </View>

      {/* Timestamp */}
      <Text style={[styles.timestamp, { color: theme.colors.text + "60" }]}>
        Estimated at {new Date(estimate.timestamp).toLocaleTimeString()}
      </Text>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    margin: 16,
    padding: 20,
    borderRadius: 12,
    borderWidth: 1,
  },
  title: {
    fontSize: 18,
    fontWeight: "700",
    marginBottom: 20,
  },
  bpContainer: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 20,
    gap: 24,
  },
  bpValue: {
    alignItems: "center",
  },
  bpNumber: {
    fontSize: 48,
    fontWeight: "700",
    lineHeight: 56,
  },
  bpLabel: {
    fontSize: 13,
    marginTop: 4,
  },
  bpUnit: {
    fontSize: 11,
    marginTop: 2,
  },
  bpSeparator: {
    fontSize: 36,
    fontWeight: "300",
  },
  categoryBadge: {
    alignSelf: "center",
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    marginBottom: 20,
  },
  categoryText: {
    fontSize: 14,
    fontWeight: "600",
  },
  confidenceContainer: {
    marginBottom: 20,
  },
  confidenceLabel: {
    fontSize: 13,
    marginBottom: 8,
  },
  confidenceBar: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  confidenceBarBg: {
    flex: 1,
    height: 8,
    borderRadius: 4,
    overflow: "hidden",
  },
  confidenceBarFill: {
    height: "100%",
    borderRadius: 4,
  },
  confidenceValue: {
    fontSize: 14,
    fontWeight: "600",
    minWidth: 40,
  },
  disclaimer: {
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    marginBottom: 12,
  },
  disclaimerText: {
    fontSize: 12,
    lineHeight: 18,
  },
  timestamp: {
    fontSize: 11,
    textAlign: "center",
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
  },
  emptyText: {
    fontSize: 16,
    fontWeight: "600",
    textAlign: "center",
    marginBottom: 8,
  },
  emptySubtext: {
    fontSize: 13,
    textAlign: "center",
  },
})
