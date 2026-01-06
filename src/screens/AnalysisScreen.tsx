"use client"
import { useState, useEffect } from "react"
import { View, Text, StyleSheet, ScrollView, Pressable, Alert, ActivityIndicator } from "react-native"
import { useTheme } from "../contexts/ThemeContext"
import BPEstimationCard from "../components/BPEstimationCard"
import SignalChart from "../components/SignalChart"
import { storageService } from "../services/StorageService"
import { mlService } from "../services/MLService"
import type { RecordingSession, UploadedModel, ModelTestResult } from "../types"

export default function AnalysisScreen() {
  const { theme } = useTheme()
  const [recordings, setRecordings] = useState<RecordingSession[]>([])
  const [models, setModels] = useState<UploadedModel[]>([])
  const [activeModel, setActiveModel] = useState<UploadedModel | null>(null)
  const [selectedRecording, setSelectedRecording] = useState<RecordingSession | null>(null)
  const [testResult, setTestResult] = useState<ModelTestResult | null>(null)
  const [loading, setLoading] = useState(false)
  const [view, setView] = useState<"recordings" | "models" | "results">("models")

  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    try {
      const recordingsData = await storageService.getAllSessions()
      setRecordings(recordingsData.sort((a, b) => b.startTime - a.startTime))

      const modelsData = mlService.getUploadedModels()
      setModels(modelsData)

      const active = mlService.getActiveModel()
      setActiveModel(active)
    } catch (error) {
      Alert.alert("Error", "Failed to load data")
    }
  }

  const handleUploadModel = async () => {
    try {
      setLoading(true)
      const model = await mlService.uploadModel()
      if (model) {
        await loadData()
        Alert.alert("Success", `Model "${model.name}" uploaded successfully`)
      }
    } catch (error: any) {
      Alert.alert("Upload Failed", error.message || "Failed to upload model")
    } finally {
      setLoading(false)
    }
  }

  const handleSelectModel = (modelId: string) => {
    const success = mlService.setActiveModel(modelId)
    if (success) {
      const model = mlService.getActiveModel()
      setActiveModel(model)
      Alert.alert("Model Selected", `"${model?.name}" is now active`)
    }
  }

  const handleDeleteModel = async (modelId: string) => {
    Alert.alert("Delete Model", "Are you sure you want to delete this model?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Delete",
        style: "destructive",
        onPress: async () => {
          try {
            await mlService.deleteModel(modelId)
            await loadData()
          } catch (error) {
            Alert.alert("Error", "Failed to delete model")
          }
        },
      },
    ])
  }

  const handleTestModel = async (recording: RecordingSession) => {
    if (!activeModel) {
      Alert.alert("No Model Selected", "Please select a model first")
      return
    }

    setLoading(true)
    setSelectedRecording(recording)

    try {
      const samples = await storageService.loadPPGSamplesFromFile(recording.filePath)

      if (samples.length < 300) {
        Alert.alert("Insufficient Data", "Need at least 10 seconds of data for testing")
        setLoading(false)
        return
      }

      const result = await mlService.testModelOnData(samples, recording.id)
      setTestResult(result)
      setView("results")
    } catch (error: any) {
      Alert.alert("Test Failed", error.message || "Failed to test model on data")
    } finally {
      setLoading(false)
    }
  }

  // Model Management View
  if (view === "models") {
    return (
      <ScrollView style={[styles.container, { backgroundColor: theme.colors.background }]}>
        <View style={[styles.header, { backgroundColor: theme.colors.card, borderColor: theme.colors.border }]}>
          <Text style={[styles.headerTitle, { color: theme.colors.text }]}>Model Management</Text>
          <Text style={[styles.headerSubtitle, { color: theme.colors.text + "80" }]}>
            Upload and manage your custom ML models (.pkl, .pth, .onnx)
          </Text>
        </View>

        {/* Upload Button */}
        <Pressable
          style={[styles.uploadButton, { backgroundColor: theme.colors.primary }]}
          onPress={handleUploadModel}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color="#FFFFFF" />
          ) : (
            <Text style={styles.uploadButtonText}>+ Upload Model</Text>
          )}
        </Pressable>

        {/* Active Model */}
        {activeModel && (
          <View
            style={[
              styles.activeModelCard,
              { backgroundColor: theme.colors.success + "20", borderColor: theme.colors.success },
            ]}
          >
            <Text style={[styles.activeModelLabel, { color: theme.colors.success }]}>ACTIVE MODEL</Text>
            <Text style={[styles.activeModelName, { color: theme.colors.text }]}>{activeModel.name}</Text>
            <Text style={[styles.activeModelType, { color: theme.colors.text + "80" }]}>
              {activeModel.modelType.toUpperCase()} • {new Date(activeModel.uploadDate).toLocaleDateString()}
            </Text>
          </View>
        )}

        {/* Models List */}
        {models.map((model) => (
          <View
            key={model.id}
            style={[
              styles.modelCard,
              { backgroundColor: theme.colors.card, borderColor: theme.colors.border },
              activeModel?.id === model.id && { borderColor: theme.colors.success, borderWidth: 2 },
            ]}
          >
            <View style={styles.modelInfo}>
              <Text style={[styles.modelName, { color: theme.colors.text }]}>{model.name}</Text>
              <Text style={[styles.modelMeta, { color: theme.colors.text + "80" }]}>
                {model.modelType.toUpperCase()} • {new Date(model.uploadDate).toLocaleDateString()}
              </Text>
              {model.metadata?.description && (
                <Text style={[styles.modelDescription, { color: theme.colors.text + "60" }]}>
                  {model.metadata.description}
                </Text>
              )}
            </View>
            <View style={styles.modelActions}>
              {activeModel?.id !== model.id && (
                <Pressable
                  style={[styles.actionButton, { backgroundColor: theme.colors.primary }]}
                  onPress={() => handleSelectModel(model.id)}
                >
                  <Text style={styles.actionButtonText}>Select</Text>
                </Pressable>
              )}
              <Pressable
                style={[styles.actionButton, { backgroundColor: theme.colors.error }]}
                onPress={() => handleDeleteModel(model.id)}
              >
                <Text style={styles.actionButtonText}>Delete</Text>
              </Pressable>
            </View>
          </View>
        ))}

        {models.length === 0 && (
          <View style={styles.emptyState}>
            <Text style={[styles.emptyText, { color: theme.colors.text + "80" }]}>No models uploaded</Text>
            <Text style={[styles.emptySubtext, { color: theme.colors.text + "60" }]}>
              Upload a .pkl, .pth, or .onnx model to get started
            </Text>
          </View>
        )}

        {/* Test on Data Button */}
        {activeModel && (
          <Pressable
            style={[styles.testButton, { backgroundColor: theme.colors.card, borderColor: theme.colors.border }]}
            onPress={() => setView("recordings")}
          >
            <Text style={[styles.testButtonText, { color: theme.colors.primary }]}>Test Model on Data →</Text>
          </Pressable>
        )}
      </ScrollView>
    )
  }

  // Recording Selection View
  if (view === "recordings") {
    return (
      <ScrollView style={[styles.container, { backgroundColor: theme.colors.background }]}>
        <View style={[styles.header, { backgroundColor: theme.colors.card, borderColor: theme.colors.border }]}>
          <Text style={[styles.headerTitle, { color: theme.colors.text }]}>Select Recording to Test</Text>
          <Text style={[styles.headerSubtitle, { color: theme.colors.text + "80" }]}>
            Testing with: {activeModel?.name}
          </Text>
          <Pressable style={styles.backLink} onPress={() => setView("models")}>
            <Text style={[styles.backLinkText, { color: theme.colors.primary }]}>← Back to Models</Text>
          </Pressable>
        </View>

        {recordings.map((recording) => (
          <Pressable
            key={recording.id}
            style={[styles.recordingCard, { backgroundColor: theme.colors.card, borderColor: theme.colors.border }]}
            onPress={() => handleTestModel(recording)}
            disabled={loading}
          >
            <View style={styles.recordingInfo}>
              <Text style={[styles.recordingTitle, { color: theme.colors.text }]}>
                {recording.patientId || recording.id.substring(0, 8)}
              </Text>
              <Text style={[styles.recordingDate, { color: theme.colors.text + "80" }]}>
                {new Date(recording.startTime).toLocaleString()}
              </Text>
              <Text style={[styles.recordingMeta, { color: theme.colors.text + "60" }]}>
                {Math.round(recording.duration)}s • {Math.round(recording.sampleRate)} Hz
              </Text>
            </View>
            <Text style={[styles.analyzeButton, { color: theme.colors.primary }]}>Test →</Text>
          </Pressable>
        ))}

        {recordings.length === 0 && (
          <View style={styles.emptyState}>
            <Text style={[styles.emptyText, { color: theme.colors.text + "80" }]}>No recordings available</Text>
            <Text style={[styles.emptySubtext, { color: theme.colors.text + "60" }]}>
              Create recordings from the Acquisition tab
            </Text>
          </View>
        )}
      </ScrollView>
    )
  }

  // Results View
  return (
    <ScrollView style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <View style={[styles.header, { backgroundColor: theme.colors.card, borderColor: theme.colors.border }]}>
        <Text style={[styles.headerTitle, { color: theme.colors.text }]}>Test Results</Text>
        <Text style={[styles.headerSubtitle, { color: theme.colors.text + "80" }]}>
          {selectedRecording?.patientId || selectedRecording?.id.substring(0, 8)}
        </Text>
        <Pressable style={styles.backLink} onPress={() => setView("recordings")}>
          <Text style={[styles.backLinkText, { color: theme.colors.primary }]}>← Back</Text>
        </Pressable>
      </View>

      {testResult && (
        <>
          {/* Latest Prediction */}
          <BPEstimationCard estimate={testResult.predictions[testResult.predictions.length - 1]} loading={false} />

          {/* Trend Chart */}
          <View
            style={[styles.trendContainer, { backgroundColor: theme.colors.card, borderColor: theme.colors.border }]}
          >
            <Text style={[styles.trendTitle, { color: theme.colors.text }]}>BP Predictions Over Time</Text>

            <View style={styles.trendChart}>
              <SignalChart
                data={testResult.predictions.map((p) => p.systolic)}
                visibleDuration={selectedRecording?.duration || 60}
                sampleRate={testResult.predictions.length / (selectedRecording?.duration || 60)}
                color={theme.colors.error}
                label="Systolic (mmHg)"
              />
            </View>

            <View style={styles.trendChart}>
              <SignalChart
                data={testResult.predictions.map((p) => p.diastolic)}
                visibleDuration={selectedRecording?.duration || 60}
                sampleRate={testResult.predictions.length / (selectedRecording?.duration || 60)}
                color={theme.colors.primary}
                label="Diastolic (mmHg)"
              />
            </View>

            {/* Statistics */}
            <View style={[styles.statsContainer, { borderTopColor: theme.colors.border }]}>
              <View style={styles.statItem}>
                <Text style={[styles.statLabel, { color: theme.colors.text + "80" }]}>Avg Systolic</Text>
                <Text style={[styles.statValue, { color: theme.colors.text }]}>
                  {Math.round(
                    testResult.predictions.reduce((sum, p) => sum + p.systolic, 0) / testResult.predictions.length,
                  )}{" "}
                  mmHg
                </Text>
              </View>
              <View style={styles.statItem}>
                <Text style={[styles.statLabel, { color: theme.colors.text + "80" }]}>Avg Diastolic</Text>
                <Text style={[styles.statValue, { color: theme.colors.text }]}>
                  {Math.round(
                    testResult.predictions.reduce((sum, p) => sum + p.diastolic, 0) / testResult.predictions.length,
                  )}{" "}
                  mmHg
                </Text>
              </View>
              <View style={styles.statItem}>
                <Text style={[styles.statLabel, { color: theme.colors.text + "80" }]}>Predictions</Text>
                <Text style={[styles.statValue, { color: theme.colors.text }]}>{testResult.predictions.length}</Text>
              </View>
            </View>
          </View>
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
    padding: 16,
    margin: 16,
    borderRadius: 12,
    borderWidth: 1,
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: "700",
    marginBottom: 4,
  },
  headerSubtitle: {
    fontSize: 14,
    marginBottom: 8,
  },
  backLink: {
    marginTop: 8,
  },
  backLinkText: {
    fontSize: 15,
    fontWeight: "600",
  },
  uploadButton: {
    margin: 16,
    marginTop: 0,
    padding: 16,
    borderRadius: 12,
    alignItems: "center",
  },
  uploadButtonText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "600",
  },
  activeModelCard: {
    margin: 16,
    marginTop: 0,
    padding: 16,
    borderRadius: 12,
    borderWidth: 2,
  },
  activeModelLabel: {
    fontSize: 11,
    fontWeight: "700",
    letterSpacing: 1,
    marginBottom: 8,
  },
  activeModelName: {
    fontSize: 18,
    fontWeight: "600",
    marginBottom: 4,
  },
  activeModelType: {
    fontSize: 13,
  },
  modelCard: {
    margin: 16,
    marginTop: 0,
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
  },
  modelInfo: {
    marginBottom: 12,
  },
  modelName: {
    fontSize: 18,
    fontWeight: "600",
    marginBottom: 4,
  },
  modelMeta: {
    fontSize: 13,
    marginBottom: 4,
  },
  modelDescription: {
    fontSize: 13,
    marginTop: 4,
  },
  modelActions: {
    flexDirection: "row",
    gap: 8,
  },
  actionButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
  },
  actionButtonText: {
    color: "#FFFFFF",
    fontSize: 14,
    fontWeight: "600",
  },
  testButton: {
    margin: 16,
    marginTop: 0,
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    alignItems: "center",
  },
  testButtonText: {
    fontSize: 16,
    fontWeight: "600",
  },
  recordingCard: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 16,
    margin: 16,
    marginTop: 0,
    borderRadius: 12,
    borderWidth: 1,
  },
  recordingInfo: {
    flex: 1,
  },
  recordingTitle: {
    fontSize: 18,
    fontWeight: "600",
    marginBottom: 4,
  },
  recordingDate: {
    fontSize: 13,
    marginBottom: 4,
  },
  recordingMeta: {
    fontSize: 12,
  },
  analyzeButton: {
    fontSize: 16,
    fontWeight: "600",
  },
  emptyState: {
    padding: 40,
    alignItems: "center",
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
  trendContainer: {
    margin: 16,
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
  },
  trendTitle: {
    fontSize: 18,
    fontWeight: "700",
    marginBottom: 16,
  },
  trendChart: {
    marginBottom: 20,
  },
  statsContainer: {
    flexDirection: "row",
    justifyContent: "space-around",
    paddingTop: 16,
    borderTopWidth: 1,
  },
  statItem: {
    alignItems: "center",
  },
  statLabel: {
    fontSize: 12,
    marginBottom: 4,
  },
  statValue: {
    fontSize: 16,
    fontWeight: "600",
  },
})
