"use client"
import { useState, useEffect } from "react"
import { View, Text, StyleSheet, FlatList, Pressable, ActivityIndicator, Modal } from "react-native"
import type { Device } from "react-native-ble-plx"
import { useTheme } from "../contexts/ThemeContext"
import { bleService } from "../services/BLEService"

interface BLEDeviceListProps {
  visible: boolean
  onClose: () => void
  onDeviceSelected: (device: Device) => void
}

export default function BLEDeviceList({ visible, onClose, onDeviceSelected }: BLEDeviceListProps) {
  const { theme } = useTheme()
  const [devices, setDevices] = useState<Device[]>([])
  const [isScanning, setIsScanning] = useState(false)

  useEffect(() => {
    if (visible) {
      startScan()
    }
    return () => {
      bleService.stopScan()
    }
  }, [visible])

  const startScan = async () => {
    setIsScanning(true)
    setDevices([])

    try {
      await bleService.startScan((device) => {
        setDevices((prev) => {
          // Avoid duplicates
          if (prev.find((d) => d.id === device.id)) {
            return prev
          }
          return [...prev, device]
        })
      })
    } catch (error) {
      console.error("Scan error:", error)
      const errorMessage = error instanceof Error ? error.message : "BLE not available or not supported on this platform"
      alert(errorMessage)
    } finally {
      setIsScanning(false)
    }
  }

  const handleDeviceSelect = async (device: Device) => {
    try {
      await bleService.connect(device)
      onDeviceSelected(device)
      onClose()
    } catch (error) {
      console.error("Connection error:", error)
      const errorMessage = error instanceof Error ? error.message : "Failed to connect to device"
      alert(errorMessage)
    }
  }

  const renderDevice = ({ item }: { item: Device }) => (
    <Pressable
      style={[styles.deviceItem, { backgroundColor: theme.colors.card, borderColor: theme.colors.border }]}
      onPress={() => handleDeviceSelect(item)}
    >
      <View style={styles.deviceInfo}>
        <Text style={[styles.deviceName, { color: theme.colors.text }]}>{item.name || "Unknown Device"}</Text>
        <Text style={[styles.deviceId, { color: theme.colors.text + "80" }]}>{item.id}</Text>
      </View>
      <View style={[styles.signalIndicator, { backgroundColor: theme.colors.success }]} />
    </Pressable>
  )

  return (
    <Modal visible={visible} animationType="slide" transparent onRequestClose={onClose}>
      <View style={styles.modalContainer}>
        <View style={[styles.modalContent, { backgroundColor: theme.colors.card }]}>
          <View style={styles.modalHeader}>
            <Text style={[styles.modalTitle, { color: theme.colors.text }]}>BLE Devices</Text>
            <Pressable onPress={onClose}>
              <Text style={[styles.closeButton, { color: theme.colors.primary }]}>Close</Text>
            </Pressable>
          </View>

          {isScanning && (
            <View style={styles.scanningIndicator}>
              <ActivityIndicator size="small" color={theme.colors.primary} />
              <Text style={[styles.scanningText, { color: theme.colors.text }]}>Scanning for devices...</Text>
            </View>
          )}

          <FlatList
            data={devices}
            renderItem={renderDevice}
            keyExtractor={(item) => item.id}
            contentContainerStyle={styles.deviceList}
            ListEmptyComponent={
              !isScanning ? (
                <View style={styles.emptyState}>
                  <Text style={[styles.emptyText, { color: theme.colors.text + "80" }]}>No devices found</Text>
                </View>
              ) : null
            }
          />

          <Pressable
            style={[styles.rescanButton, { backgroundColor: theme.colors.primary }]}
            onPress={startScan}
            disabled={isScanning}
          >
            <Text style={styles.rescanButtonText}>Rescan</Text>
          </Pressable>
        </View>
      </View>
    </Modal>
  )
}

const styles = StyleSheet.create({
  modalContainer: {
    flex: 1,
    justifyContent: "flex-end",
    backgroundColor: "rgba(0,0,0,0.5)",
  },
  modalContent: {
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 20,
    maxHeight: "80%",
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 20,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: "700",
  },
  closeButton: {
    fontSize: 16,
    fontWeight: "600",
  },
  scanningIndicator: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    paddingVertical: 12,
  },
  scanningText: {
    fontSize: 14,
  },
  deviceList: {
    gap: 12,
    paddingBottom: 20,
  },
  deviceItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 16,
    borderRadius: 8,
    borderWidth: 1,
  },
  deviceInfo: {
    flex: 1,
  },
  deviceName: {
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 4,
  },
  deviceId: {
    fontSize: 12,
  },
  signalIndicator: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  emptyState: {
    paddingVertical: 40,
    alignItems: "center",
  },
  emptyText: {
    fontSize: 14,
  },
  rescanButton: {
    paddingVertical: 14,
    borderRadius: 8,
    alignItems: "center",
  },
  rescanButtonText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "600",
  },
})
