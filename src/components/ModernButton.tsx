"use client"
import { Pressable, Text, StyleSheet, ViewStyle } from "react-native"
import { useTheme } from "../contexts/ThemeContext"

interface ModernButtonProps {
  onPress: () => void
  label: string
  variant?: "primary" | "secondary" | "outline" | "danger"
  size?: "small" | "medium" | "large"
  disabled?: boolean
  loading?: boolean
  fullWidth?: boolean
  style?: ViewStyle
  icon?: string
}

export default function ModernButton({
  onPress,
  label,
  variant = "primary",
  size = "medium",
  disabled = false,
  loading = false,
  fullWidth = false,
  style,
  icon,
}: ModernButtonProps) {
  const { theme } = useTheme()

  const variantStyles = {
    primary: {
      backgroundColor: theme.colors.primary,
      borderColor: theme.colors.primary,
      textColor: "#FFFFFF",
    },
    secondary: {
      backgroundColor: theme.colors.surface,
      borderColor: theme.colors.border,
      textColor: theme.colors.primary,
    },
    outline: {
      backgroundColor: "transparent",
      borderColor: theme.colors.primary,
      textColor: theme.colors.primary,
    },
    danger: {
      backgroundColor: theme.colors.error,
      borderColor: theme.colors.error,
      textColor: "#FFFFFF",
    },
  }

  const sizeStyles = {
    small: { paddingVertical: 10, paddingHorizontal: 16, fontSize: 14 },
    medium: { paddingVertical: 14, paddingHorizontal: 20, fontSize: 15 },
    large: { paddingVertical: 18, paddingHorizontal: 24, fontSize: 16 },
  }

  const selectedVariant = variantStyles[variant]
  const selectedSize = sizeStyles[size]

  return (
    <Pressable
      onPress={onPress}
      disabled={disabled || loading}
      style={[
        styles.button,
        {
          backgroundColor: disabled ? theme.colors.textTertiary + "40" : selectedVariant.backgroundColor,
          borderColor: selectedVariant.borderColor,
          width: fullWidth ? "100%" : "auto",
          paddingVertical: selectedSize.paddingVertical,
          paddingHorizontal: selectedSize.paddingHorizontal,
        },
        style,
      ]}
    >
      <Text
        style={[
          styles.text,
          {
            color: disabled ? theme.colors.textTertiary : selectedVariant.textColor,
            fontSize: selectedSize.fontSize,
          },
        ]}
      >
        {icon && `${icon} `}
        {loading ? "Loading..." : label}
      </Text>
    </Pressable>
  )
}

const styles = StyleSheet.create({
  button: {
    borderRadius: 10,
    borderWidth: 1.5,
    alignItems: "center",
    justifyContent: "center",
    flexDirection: "row",
    elevation: 2,
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 4,
  },
  text: {
    fontWeight: "700",
    letterSpacing: -0.3,
  },
})
