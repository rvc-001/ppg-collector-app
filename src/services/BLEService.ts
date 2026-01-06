"use client"
import { BleManager, type Device, type Characteristic } from "react-native-ble-plx"
import type { BLESensorData } from "../types"
import { APP_CONFIG } from "../config/constants"

export class BLEService {
  private manager: BleManager | null = null
  private connectedDevice: Device | null = null
  private dataCallback: ((data: BLESensorData) => void) | null = null
  private isScanning = false
  private initError: Error | null = null

  constructor() {
    try {
      this.manager = new BleManager()
    } catch (error) {
      console.warn("[BLE] Failed to initialize BleManager - native module not available", error)
      this.initError = error instanceof Error ? error : new Error(String(error))
    }
  }

  private ensureManager(): BleManager {
    if (!this.manager) {
      if (this.initError) {
        throw new Error(`BLE not available: ${this.initError.message}`)
      }
      throw new Error("BleManager failed to initialize")
    }
    return this.manager
  }

  async requestPermissions(): Promise<boolean> {
    // Note: Actual implementation would use expo-permissions or react-native-permissions
    // This is a placeholder for the permission logic
    console.log("[v0] BLE permissions requested")
    return true
  }

  startScan(onDeviceFound: (device: Device) => void, timeout: number = APP_CONFIG.BLE_SCAN_TIMEOUT): Promise<void> {
    return new Promise((resolve, reject) => {
      if (this.isScanning) {
        reject(new Error("Scan already in progress"))
        return
      }

      try {
        const manager = this.ensureManager()
        this.isScanning = true
        console.log("[v0] Starting BLE scan...")

        manager.startDeviceScan(null, null, (error, device) => {
        if (error) {
          console.error("[v0] BLE scan error:", error)
          this.isScanning = false
          reject(error)
          return
        }

        if (device) {
          // Filter for devices with Heart Rate Service or custom PPG service
          if (
            device.serviceUUIDs?.includes(APP_CONFIG.BLE_SERVICE_UUID) ||
            device.name?.toLowerCase().includes("ppg") ||
            device.name?.toLowerCase().includes("heart")
          ) {
            console.log("[v0] Found device:", device.name || device.id)
            onDeviceFound(device)
          }
        }
      })

        // Stop scan after timeout
        setTimeout(() => {
          this.stopScan()
          resolve()
        }, timeout)
      } catch (error) {
        reject(error)
      }
    })
  }

  stopScan() {
    if (this.isScanning) {
      try {
        const manager = this.ensureManager()
        manager.stopDeviceScan()
        this.isScanning = false
        console.log("[v0] BLE scan stopped")
      } catch (error) {
        console.warn("[BLE] Error stopping scan:", error)
      }
    }
  }

  async connect(device: Device): Promise<void> {
    try {
      console.log("[v0] Connecting to device:", device.name || device.id)
      this.connectedDevice = await device.connect()
      await this.connectedDevice.discoverAllServicesAndCharacteristics()
      console.log("[v0] Device connected and services discovered")
    } catch (error) {
      console.error("[v0] Connection error:", error)
      throw error
    }
  }

  async disconnect(): Promise<void> {
    if (this.connectedDevice) {
      await this.connectedDevice.cancelConnection()
      this.connectedDevice = null
      console.log("[v0] Device disconnected")
    }
  }

  async startMonitoring(callback: (data: BLESensorData) => void): Promise<void> {
    if (!this.connectedDevice) {
      throw new Error("No device connected")
    }

    this.dataCallback = callback

    try {
      // Monitor Heart Rate Measurement characteristic
      this.connectedDevice.monitorCharacteristicForService(
        APP_CONFIG.BLE_SERVICE_UUID,
        APP_CONFIG.BLE_CHARACTERISTIC_UUID,
        (error, characteristic) => {
          if (error) {
            console.error("[v0] Monitoring error:", error)
            return
          }

          if (characteristic?.value) {
            const data = this.parseHeartRateData(characteristic)
            if (this.dataCallback) {
              this.dataCallback(data)
            }
          }
        },
      )
    } catch (error) {
      console.error("[v0] Failed to start monitoring:", error)
      throw error
    }
  }

  stopMonitoring() {
    this.dataCallback = null
    if (this.connectedDevice) {
      // Cancel all subscriptions
      this.connectedDevice.cancelConnection()
    }
  }

  // Parse Heart Rate Measurement characteristic (standard BLE format)
  private parseHeartRateData(characteristic: Characteristic): BLESensorData {
    // Decode base64 value
    const buffer = Buffer.from(characteristic.value || "", "base64")

    // Heart Rate Measurement format (per Bluetooth SIG spec)
    const flags = buffer.readUInt8(0)
    const hrFormat = flags & 0x01 // 0 = uint8, 1 = uint16

    let heartRate: number
    let offset: number

    if (hrFormat === 0) {
      heartRate = buffer.readUInt8(1)
      offset = 2
    } else {
      heartRate = buffer.readUInt16LE(1)
      offset = 3
    }

    // Additional data if available (RR intervals, energy expended, etc.)
    // For PPG, we'll use heart rate as a proxy
    const ppgValue = heartRate / 200.0 // Normalize to 0-1 range

    return {
      heartRate,
      ppg: ppgValue,
      timestamp: Date.now(),
    }
  }

  getConnectedDevice(): Device | null {
    return this.connectedDevice
  }

  isConnected(): boolean {
    return this.connectedDevice !== null
  }
}

export const bleService = new BLEService()
