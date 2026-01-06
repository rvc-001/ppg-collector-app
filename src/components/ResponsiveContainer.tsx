"use client"
import { View, StyleSheet, ViewStyle, useWindowDimensions } from "react-native"
import { useTheme } from "../contexts/ThemeContext"

interface ResponsiveContainerProps {
  children: React.ReactNode
  style?: ViewStyle
  padded?: boolean
  centered?: boolean
  maxWidth?: number
}

export default function ResponsiveContainer({
  children,
  style,
  padded = true,
  centered = false,
  maxWidth = 600,
}: ResponsiveContainerProps) {
  const { width } = useWindowDimensions()
  const { theme } = useTheme()

  const padding = padded ? (width > maxWidth ? (width - maxWidth) / 2 : 16) : 0

  return (
    <View
      style={[
        styles.container,
        {
          backgroundColor: theme.colors.background,
          paddingHorizontal: padding,
        },
        centered && styles.centered,
        style,
      ]}
    >
      {children}
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  centered: {
    justifyContent: "center",
    alignItems: "center",
  },
})
