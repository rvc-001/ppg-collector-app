"use client"
import { View, StyleSheet, ViewStyle } from "react-native"
import { useTheme } from "../contexts/ThemeContext"

interface ModernCardProps {
  children: React.ReactNode
  style?: ViewStyle
  elevated?: boolean
  variant?: "default" | "outline" | "filled"
  padding?: number
}

export default function ModernCard({
  children,
  style,
  elevated = true,
  variant = "default",
  padding = 16,
}: ModernCardProps) {
  const { theme } = useTheme()

  const variantStyle =
    variant === "outline"
      ? {
          backgroundColor: theme.colors.background,
          borderWidth: 1,
          borderColor: theme.colors.border,
        }
      : variant === "filled"
        ? {
            backgroundColor: theme.colors.surface,
          }
        : {
            backgroundColor: theme.colors.card,
          }

  return (
    <View
      style={[
        styles.card,
        {
          padding,
          ...variantStyle,
          shadowColor: theme.dark ? "#000" : "#000",
          shadowOpacity: elevated ? (theme.dark ? 0.3 : 0.08) : 0,
          shadowOffset: { width: 0, height: elevated ? 2 : 0 },
          shadowRadius: elevated ? 8 : 0,
        },
        style,
      ]}
    >
      {children}
    </View>
  )
}

const styles = StyleSheet.create({
  card: {
    borderRadius: 12,
    overflow: "hidden",
  },
})
