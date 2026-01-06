"use client"
import { useRef, useEffect, useState } from "react"
import { View, Text, StyleSheet, Pressable, ActivityIndicator, Platform } from "react-native"
import { useTheme } from "../contexts/ThemeContext"
import { cameraPPGService } from "../services/CameraPPGService"
import { CameraView, useCameraPermissions } from "expo-camera"

export default function CameraViewComponent({ onSample, isRecording }: { onSample: (t: number, v: number) => void, isRecording: boolean }) {
  const { theme } = useTheme()
  const cameraRef = useRef<any>(null)
  const [permission, requestPermission] = useCameraPermissions()
  const [facing, setFacing] = useState<"back" | "front">("back")
  const webCanvasRef = useRef<HTMLCanvasElement | null>(null)
  const [isProcessing, setIsProcessing] = useState(false)

  useEffect(() => {
    if (permission && !permission.granted && permission.canAskAgain) {
      requestPermission()
    }
  }, [permission])

  useEffect(() => {
    if (cameraRef.current) {
      cameraPPGService.setCamera(cameraRef.current)
    }
  }, [cameraRef.current])

  // FIX: Added onSample dependency
  useEffect(() => {
    let webInterval: any = null

    if (isRecording) {
      setIsProcessing(true)
      
      // Setup callback
      cameraPPGService.startRecording((sample) => {
        onSample(sample.timestamp, sample.value)
      })

      // WEB FRAME LOOP
      if (Platform.OS === 'web') {
        const canvas = webCanvasRef.current || document.createElement('canvas')
        webCanvasRef.current = canvas
        const ctx = canvas.getContext('2d', { willReadFrequently: true })
        
        webInterval = setInterval(() => {
          const video = document.querySelector('video')
          if (video && ctx && video.readyState === 4) {
            canvas.width = 100
            canvas.height = 100
            ctx.drawImage(video, 0, 0, 100, 100)
            try {
              const imageData = ctx.getImageData(0, 0, 100, 100)
              cameraPPGService.processFrame(imageData)
            } catch (e) {
              console.warn("Frame read error", e)
            }
          }
        }, 33)
      }
    } else {
      setIsProcessing(false)
      cameraPPGService.stopRecording()
      if (webInterval) clearInterval(webInterval)
    }

    return () => {
      if (webInterval) clearInterval(webInterval)
    }
  }, [isRecording, onSample]) // FIX: Added onSample dependency

  if (!permission || !permission.granted) {
    return (
      <View style={[styles.container, { backgroundColor: theme.colors.card }]}>
        <Text style={{ color: theme.colors.text }}>Camera Permission Needed</Text>
        <Pressable onPress={requestPermission} style={{ padding: 10, backgroundColor: theme.colors.primary, marginTop: 10, borderRadius: 5 }}>
            <Text style={{ color: 'white' }}>Grant</Text>
        </Pressable>
      </View>
    )
  }

  return (
    <View style={styles.container}>
      <CameraView 
        ref={cameraRef} 
        style={styles.camera} 
        facing={facing} 
        enableTorch={true}
        mute={true}
      />
      <View style={styles.overlay} pointerEvents="box-none">
        {isProcessing && (
          <View style={[styles.recordingIndicator, { backgroundColor: theme.colors.error }]}>
            <Text style={styles.recordingText}>RECORDING</Text>
          </View>
        )}
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    position: 'relative',
    backgroundColor: '#000',
    overflow: 'hidden',
  },
  camera: {
    width: "100%",
    height: "100%",
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: "space-between",
    padding: 20,
    zIndex: 10,
  },
  recordingIndicator: {
    alignSelf: "flex-start",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 4,
    marginTop: 20,
  },
  recordingText: {
    color: "#FFFFFF",
    fontSize: 12,
    fontWeight: "700",
    letterSpacing: 1,
  },
})