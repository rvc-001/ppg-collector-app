"use client"
import { useState } from "react"
import { View, Text, TextInput, StyleSheet, Pressable, Modal } from "react-native"
import { useTheme } from "../contexts/ThemeContext"

interface RecordingMetadataFormProps {
  visible: boolean
  onClose: () => void
  onSubmit: (patientId: string, notes: string) => void
}

export default function RecordingMetadataForm({ visible, onClose, onSubmit }: RecordingMetadataFormProps) {
  const { theme } = useTheme()
  const [patientId, setPatientId] = useState("")
  const [notes, setNotes] = useState("")

  const handleSubmit = () => {
    onSubmit(patientId.trim(), notes.trim())
    setPatientId("")
    setNotes("")
    onClose()
  }

  const handleCancel = () => {
    setPatientId("")
    setNotes("")
    onClose()
  }

  return (
    <Modal visible={visible} animationType="slide" transparent onRequestClose={onClose}>
      <View style={styles.modalContainer}>
        <View style={[styles.modalContent, { backgroundColor: theme.colors.card }]}>
          <Text style={[styles.title, { color: theme.colors.text }]}>Recording Metadata</Text>
          <Text style={[styles.subtitle, { color: theme.colors.text + "80" }]}>
            Add information for MIMIC-compatible export
          </Text>

          <View style={styles.form}>
            <Text style={[styles.label, { color: theme.colors.text }]}>Subject ID (Optional)</Text>
            <TextInput
              style={[styles.input, { backgroundColor: theme.colors.background, color: theme.colors.text }]}
              value={patientId}
              onChangeText={setPatientId}
              placeholder="Enter subject/patient ID"
              placeholderTextColor={theme.colors.text + "40"}
            />

            <Text style={[styles.label, { color: theme.colors.text }]}>Notes (Optional)</Text>
            <TextInput
              style={[
                styles.input,
                styles.textArea,
                { backgroundColor: theme.colors.background, color: theme.colors.text },
              ]}
              value={notes}
              onChangeText={setNotes}
              placeholder="Add recording notes or observations"
              placeholderTextColor={theme.colors.text + "40"}
              multiline
              numberOfLines={4}
            />
          </View>

          <View style={styles.buttonRow}>
            <Pressable style={[styles.button, { backgroundColor: theme.colors.border }]} onPress={handleCancel}>
              <Text style={[styles.buttonText, { color: theme.colors.text }]}>Skip</Text>
            </Pressable>
            <Pressable style={[styles.button, { backgroundColor: theme.colors.primary }]} onPress={handleSubmit}>
              <Text style={[styles.buttonText, { color: "#FFFFFF" }]}>Start Recording</Text>
            </Pressable>
          </View>
        </View>
      </View>
    </Modal>
  )
}

const styles = StyleSheet.create({
  modalContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0,0,0,0.5)",
  },
  modalContent: {
    width: "90%",
    maxWidth: 500,
    borderRadius: 16,
    padding: 24,
  },
  title: {
    fontSize: 22,
    fontWeight: "700",
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 14,
    marginBottom: 24,
  },
  form: {
    gap: 16,
  },
  label: {
    fontSize: 14,
    fontWeight: "600",
    marginBottom: 8,
  },
  input: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 8,
    fontSize: 16,
  },
  textArea: {
    minHeight: 100,
    textAlignVertical: "top",
  },
  buttonRow: {
    flexDirection: "row",
    gap: 12,
    marginTop: 24,
  },
  button: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 8,
    alignItems: "center",
  },
  buttonText: {
    fontSize: 16,
    fontWeight: "600",
  },
})
