"use client"
import { View, Text, StyleSheet, ScrollView, Switch, Pressable, Alert } from "react-native"
import { useTheme } from "../contexts/ThemeContext"
import { useSettings } from "../contexts/SettingsContext"
import DSPConfigPanel from "../components/DSPConfigPanel"
import StorageStatsCard from "../components/StorageStatsCard"

export default function SettingsScreen() {
  const { theme, isDark, toggleTheme } = useTheme()
  const { exportFormat, setExportFormat, autoSave, setAutoSave, notificationsEnabled, setNotificationsEnabled } =
    useSettings()

  const handleExportFormatChange = (format: "csv" | "json") => {
    setExportFormat(format)
  }

  return (
    <ScrollView style={[styles.container, { backgroundColor: theme.colors.background }]}>
      {/* App Info */}
      <View style={[styles.panel, { backgroundColor: theme.colors.card, borderColor: theme.colors.border }]}>
        <Text style={[styles.appTitle, { color: theme.colors.text }]}>PPG Data Pipeline</Text>
        <Text style={[styles.appVersion, { color: theme.colors.text + "80" }]}>Version 1.0.0</Text>
        <Text style={[styles.appDescription, { color: theme.colors.text + "60" }]}>
          Research-grade PPG signal acquisition and analysis
        </Text>
      </View>

      {/* Theme Settings */}
      <View style={[styles.panel, { backgroundColor: theme.colors.card, borderColor: theme.colors.border }]}>
        <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>Appearance</Text>

        <View style={styles.settingRow}>
          <View style={styles.settingInfo}>
            <Text style={[styles.settingLabel, { color: theme.colors.text }]}>Dark Mode</Text>
            <Text style={[styles.settingDescription, { color: theme.colors.text + "80" }]}>
              Use dark theme for low-light environments
            </Text>
          </View>
          <Switch
            value={isDark}
            onValueChange={toggleTheme}
            trackColor={{ false: theme.colors.border, true: theme.colors.primary + "80" }}
            thumbColor={isDark ? theme.colors.primary : theme.colors.text + "40"}
          />
        </View>
      </View>

      {/* Export Settings */}
      <View style={[styles.panel, { backgroundColor: theme.colors.card, borderColor: theme.colors.border }]}>
        <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>Export Settings</Text>

        <View style={styles.settingRow}>
          <View style={styles.settingInfo}>
            <Text style={[styles.settingLabel, { color: theme.colors.text }]}>Export Format</Text>
            <Text style={[styles.settingDescription, { color: theme.colors.text + "80" }]}>
              Choose data export format
            </Text>
          </View>
        </View>

        <View style={styles.optionsRow}>
          <Pressable
            style={[
              styles.optionButton,
              {
                backgroundColor: exportFormat === "csv" ? theme.colors.primary : theme.colors.background,
                borderColor: exportFormat === "csv" ? theme.colors.primary : theme.colors.border,
              },
            ]}
            onPress={() => handleExportFormatChange("csv")}
          >
            <Text style={[styles.optionText, { color: exportFormat === "csv" ? "#FFFFFF" : theme.colors.text }]}>
              CSV (MIMIC)
            </Text>
          </Pressable>

          <Pressable
            style={[
              styles.optionButton,
              {
                backgroundColor: exportFormat === "json" ? theme.colors.primary : theme.colors.background,
                borderColor: exportFormat === "json" ? theme.colors.primary : theme.colors.border,
              },
            ]}
            onPress={() => handleExportFormatChange("json")}
          >
            <Text style={[styles.optionText, { color: exportFormat === "json" ? "#FFFFFF" : theme.colors.text }]}>
              JSON
            </Text>
          </Pressable>
        </View>

        <View style={styles.settingRow}>
          <View style={styles.settingInfo}>
            <Text style={[styles.settingLabel, { color: theme.colors.text }]}>Auto-save Recordings</Text>
            <Text style={[styles.settingDescription, { color: theme.colors.text + "80" }]}>
              Automatically save recordings after stopping
            </Text>
          </View>
          <Switch
            value={autoSave}
            onValueChange={setAutoSave}
            trackColor={{ false: theme.colors.border, true: theme.colors.primary + "80" }}
            thumbColor={autoSave ? theme.colors.primary : theme.colors.text + "40"}
          />
        </View>
      </View>

      {/* Notifications */}
      <View style={[styles.panel, { backgroundColor: theme.colors.card, borderColor: theme.colors.border }]}>
        <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>Notifications</Text>

        <View style={styles.settingRow}>
          <View style={styles.settingInfo}>
            <Text style={[styles.settingLabel, { color: theme.colors.text }]}>Enable Notifications</Text>
            <Text style={[styles.settingDescription, { color: theme.colors.text + "80" }]}>
              Receive alerts for recording status
            </Text>
          </View>
          <Switch
            value={notificationsEnabled}
            onValueChange={setNotificationsEnabled}
            trackColor={{ false: theme.colors.border, true: theme.colors.primary + "80" }}
            thumbColor={notificationsEnabled ? theme.colors.primary : theme.colors.text + "40"}
          />
        </View>
      </View>

      {/* DSP Configuration */}
      <DSPConfigPanel />

      {/* Storage Stats */}
      <StorageStatsCard />

      {/* About */}
      <View style={[styles.panel, { backgroundColor: theme.colors.card, borderColor: theme.colors.border }]}>
        <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>About</Text>

        <Pressable style={styles.linkRow} onPress={() => Alert.alert("Documentation", "Opening documentation...")}>
          <Text style={[styles.linkText, { color: theme.colors.primary }]}>Documentation</Text>
          <Text style={[styles.linkArrow, { color: theme.colors.primary }]}>→</Text>
        </Pressable>

        <Pressable style={styles.linkRow} onPress={() => Alert.alert("Privacy", "Opening privacy policy...")}>
          <Text style={[styles.linkText, { color: theme.colors.primary }]}>Privacy Policy</Text>
          <Text style={[styles.linkArrow, { color: theme.colors.primary }]}>→</Text>
        </Pressable>

        <Pressable style={styles.linkRow} onPress={() => Alert.alert("Licenses", "Opening open source licenses...")}>
          <Text style={[styles.linkText, { color: theme.colors.primary }]}>Open Source Licenses</Text>
          <Text style={[styles.linkArrow, { color: theme.colors.primary }]}>→</Text>
        </Pressable>
      </View>

      {/* Footer */}
      <View style={styles.footer}>
        <Text style={[styles.footerText, { color: theme.colors.text + "60" }]}>
          Built for research purposes. Not for medical diagnosis.
        </Text>
      </View>
    </ScrollView>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingVertical: 8,
  },
  panel: {
    marginHorizontal: 12,
    marginVertical: 8,
    paddingHorizontal: 16,
    paddingVertical: 16,
    borderRadius: 14,
    borderWidth: 1,
  },
  appTitle: {
    fontSize: 24,
    fontWeight: "700",
    marginBottom: 6,
    letterSpacing: -0.5,
  },
  appVersion: {
    fontSize: 14,
    fontWeight: "600",
    marginBottom: 8,
    opacity: 0.7,
  },
  appDescription: {
    fontSize: 13,
    fontWeight: "400",
    lineHeight: 18,
    opacity: 0.6,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "700",
    marginBottom: 16,
    letterSpacing: -0.5,
  },
  settingRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 14,
    paddingHorizontal: 8,
  },
  settingInfo: {
    flex: 1,
    marginRight: 16,
  },
  settingLabel: {
    fontSize: 16,
    fontWeight: "700",
    marginBottom: 4,
    letterSpacing: -0.3,
  },
  settingDescription: {
    fontSize: 13,
    fontWeight: "400",
    lineHeight: 18,
  },
  optionsRow: {
    flexDirection: "row",
    gap: 12,
    marginBottom: 16,
  },
  optionButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 10,
    borderWidth: 1.5,
    alignItems: "center",
  },
  optionText: {
    fontSize: 14,
    fontWeight: "700",
    letterSpacing: -0.3,
  },
  linkRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 14,
    paddingHorizontal: 8,
  },
  linkText: {
    fontSize: 15,
    fontWeight: "600",
  },
  linkArrow: {
    fontSize: 18,
  },
  footer: {
    paddingHorizontal: 16,
    paddingVertical: 24,
    alignItems: "center",
  },
  footerText: {
    fontSize: 12,
    textAlign: "center",
    lineHeight: 18,
  },
})

