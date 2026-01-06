"use client"
import { useMemo } from "react"
import { View, StyleSheet, Dimensions } from "react-native"
import Svg, { Path, Line, Text as SvgText, G, Defs, LinearGradient, Stop } from "react-native-svg"
import { useTheme } from "../contexts/ThemeContext"

interface SignalChartProps {
  data: number[]
  width?: number
  height?: number
  visibleDuration: number
  sampleRate: number
  color?: string
  showGrid?: boolean
  label?: string
}

export default function SignalChart({
  data,
  width = Dimensions.get("window").width - 32,
  height = 200,
  visibleDuration,
  sampleRate,
  color,
  showGrid = true,
  label,
}: SignalChartProps) {
  const { theme } = useTheme()
  const chartColor = color || theme.colors.primary
  const padding = { top: 20, right: 10, bottom: 25, left: 50 }
  const chartWidth = width - padding.left - padding.right
  const chartHeight = height - padding.top - padding.bottom

  const { path, areaPath, yLabels, xLabels } = useMemo(() => {
    // 1. Get visible data
    const visibleSamples = Math.floor(visibleDuration * sampleRate)
    const visibleData = data.slice(-visibleSamples)

    if (visibleData.length < 2) return { path: "", areaPath: "", yLabels: [], xLabels: [] }

    // 2. Dynamic Auto-Scaling (Crucial for weak signals)
    let min = Infinity
    let max = -Infinity
    for (const val of visibleData) {
      if (val < min) min = val
      if (val > max) max = val
    }

    if (max === min) {
      max += 0.0001
      min -= 0.0001
    }

    // Add 10% vertical padding so wave doesn't touch edges
    const range = max - min
    const yMin = min - range * 0.1
    const yMax = max + range * 0.1
    const finalRange = yMax - yMin

    // 3. Generate SVG Paths
    const xStep = chartWidth / (visibleSamples - 1)
    let d = ""
    
    visibleData.forEach((value, index) => {
      const x = (index * xStep).toFixed(1)
      const y = (chartHeight - ((value - yMin) / finalRange) * chartHeight).toFixed(1)
      d += `${index === 0 ? "M" : "L"} ${x} ${y}`
    })

    const areaD = `${d} L ${chartWidth} ${chartHeight} L 0 ${chartHeight} Z`

    // 4. Generate Y-Labels (Value)
    const yLabels = []
    for (let i = 0; i <= 4; i++) {
      const val = yMin + (finalRange / 4) * i
      const yPos = chartHeight - (chartHeight / 4) * i
      yLabels.push({ y: yPos, value: val.toFixed(4) }) // 4 decimals for small values (0.04xx)
    }

    // 5. Generate X-Labels (Time)
    const xLabels = []
    for (let i = 0; i <= 4; i++) {
      const xPos = (chartWidth / 4) * i
      const time = ((visibleDuration / 4) * i).toFixed(1)
      xLabels.push({ x: xPos, value: `${time}s` })
    }

    return { path: d, areaPath: areaD, yLabels, xLabels }
  }, [data, width, height, visibleDuration, sampleRate])

  return (
    <View style={[styles.container, { width, height }]}>
      <Svg width={width} height={height}>
        <Defs>
          <LinearGradient id="gradient" x1="0" y1="0" x2="0" y2="1">
            <Stop offset="0" stopColor={chartColor} stopOpacity="0.25" />
            <Stop offset="1" stopColor={chartColor} stopOpacity="0.0" />
          </LinearGradient>
        </Defs>

        <G x={padding.left} y={padding.top}>
          {showGrid && (
            <>
              {yLabels.map((l, i) => (
                <Line key={`h-${i}`} x1={0} y1={l.y} x2={chartWidth} y2={l.y} stroke={theme.colors.border} strokeWidth="0.5" opacity={0.3} />
              ))}
              {xLabels.map((l, i) => (
                <Line key={`v-${i}`} x1={l.x} y1={0} x2={l.x} y2={chartHeight} stroke={theme.colors.border} strokeWidth="0.5" opacity={0.3} />
              ))}
            </>
          )}

          <Path d={areaPath} fill="url(#gradient)" />
          {/* FIX: strokeJoin -> strokeLinejoin */}
          <Path d={path} stroke={chartColor} strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round" />

          {/* Axes */}
          <Line x1={0} y1={0} x2={0} y2={chartHeight} stroke={theme.colors.border} strokeWidth="1" />
          <Line x1={0} y1={chartHeight} x2={chartWidth} y2={chartHeight} stroke={theme.colors.border} strokeWidth="1" />
        </G>

        {/* Labels */}
        {yLabels.map((l, i) => (
          <SvgText key={`yl-${i}`} x={padding.left - 8} y={l.y + padding.top + 3} fontSize="10" fill={theme.colors.text} textAnchor="end" opacity={0.6}>
            {l.value}
          </SvgText>
        ))}
        {xLabels.map((l, i) => (
          <SvgText key={`xl-${i}`} x={l.x + padding.left} y={height - 5} fontSize="10" fill={theme.colors.text} textAnchor="middle" opacity={0.6}>
            {l.value}
          </SvgText>
        ))}
        {label && (
          <SvgText x={width / 2} y={15} fontSize="12" fontWeight="600" fill={theme.colors.text} textAnchor="middle">
            {label}
          </SvgText>
        )}
      </Svg>
    </View>
  )
}

const styles = StyleSheet.create({
  container: { backgroundColor: "transparent" },
})