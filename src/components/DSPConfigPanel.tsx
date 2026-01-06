"use client"
import { View, Text, StyleSheet, TextInput, Pressable } from "react-native"
import { useTheme } from "../contexts/ThemeContext"
import { useSettings } from "../contexts/SettingsContext"

export default function DSPConfigPanel() {
  const { theme } = useTheme()
  const { dspConfig, updateDSPConfig, resetDSPConfig } = useSettings()

  const handleUpdate = (key: keyof typeof dspConfig, value: string) => {
    const numValue = Number.parseFloat(value)
    if (!Number.isNaN(numValue)) {
      updateDSPConfig({ [key]: numValue })
    }
  }

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.card, borderColor: theme.colors.border }]}>
      <View style={styles.header}>
        <Text style={[styles.title, { color: theme.colors.text }]}>DSP Configuration</Text>
        <Pressable style={[styles.resetButton, { backgroundColor: theme.colors.error }]} onPress={resetDSPConfig}>
          <Text style={styles.resetButtonText}>Reset</Text>
        </Pressable>
      </View>

      <Text style={[styles.description, { color: theme.colors.text + "80" }]}>
        Configure digital signal processing parameters for PPG filtering
      </Text>

      {/* Bandpass Low */}
      <View style={styles.field}>
        <Text style={[styles.label, { color: theme.colors.text }]}>Bandpass Filter Low (Hz)</Text>
        <Text style={[styles.hint, { color: theme.colors.text + "60" }]}>Minimum frequency to pass</Text>
        <TextInput
          style={[styles.input, { backgroundColor: theme.colors.background, color: theme.colors.text }]}
          value={dspConfig.bandpassLow.toString()}
          onChangeText={(value) => handleUpdate("bandpassLow", value)}
          keyboardType="decimal-pad"
          placeholder="0.5"
          placeholderTextColor={theme.colors.text + "40"}
        />
      </View>

      {/* Bandpass High */}
      <View style={styles.field}>
        <Text style={[styles.label, { color: theme.colors.text }]}>Bandpass Filter High (Hz)</Text>
        <Text style={[styles.hint, { color: theme.colors.text + "60" }]}>Maximum frequency to pass</Text>
        <TextInput
          style={[styles.input, { backgroundColor: theme.colors.background, color: theme.colors.text }]}
          value={dspConfig.bandpassHigh.toString()}
          onChangeText={(value) => handleUpdate("bandpassHigh", value)}
          keyboardType="decimal-pad"
          placeholder="5.0"
          placeholderTextColor={theme.colors.text + "40"}
        />
      </View>

      {/* Notch Frequency */}
      <View style={styles.field}>
        <Text style={[styles.label, { color: theme.colors.text }]}>Notch Filter (Hz)</Text>
        <Text style={[styles.hint, { color: theme.colors.text + "60" }]}>Remove powerline interference (50/60 Hz)</Text>
        <TextInput
          style={[styles.input, { backgroundColor: theme.colors.background, color: theme.colors.text }]}
          value={dspConfig.notchFrequency?.toString() || ""}
          onChangeText={(value) => handleUpdate("notchFrequency", value)}
          keyboardType="decimal-pad"
          placeholder="60"
          placeholderTextColor={theme.colors.text + "40"}
        />
      </View>

      {/* Smoothing Window */}
      <View style={styles.field}>
        <Text style={[styles.label, { color: theme.colors.text }]}>Smoothing Window (samples)</Text>
        <Text style={[styles.hint, { color: theme.colors.text + "60" }]}>Moving average window size</Text>
        <TextInput
          style={[styles.input, { backgroundColor: theme.colors.background, color: theme.colors.text }]}
          value={dspConfig.smoothingWindow.toString()}
          onChangeText={(value) => handleUpdate("smoothingWindow", value)}
          keyboardType="number-pad"
          placeholder="5"
          placeholderTextColor={theme.colors.text + "40"}
        />
      </View>
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
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },
  title: {
    fontSize: 18,
    fontWeight: "700",
  },
  resetButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
  },
  resetButtonText: {
    color: "#FFFFFF",
    fontSize: 13,
    fontWeight: "600",
  },
  description: {
    fontSize: 13,
    marginBottom: 20,
  },
  field: {
    marginBottom: 16,
  },
  label: {
    fontSize: 15,
    fontWeight: "600",
    marginBottom: 4,
  },
  hint: {
    fontSize: 12,
    marginBottom: 8,
  },
  input: {
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: 8,
    fontSize: 16,
  },
})
