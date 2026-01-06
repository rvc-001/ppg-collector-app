"use client"
import { View, Text, StyleSheet, Pressable, ScrollView } from "react-native"
import { useTheme } from "../contexts/ThemeContext"

interface AppHeaderProps {
  title: string
  subtitle?: string
  showStats?: boolean
  stats?: Array<{ label: string; value: string; color?: string }>
  actions?: Array<{ icon: string; label: string; onPress: () => void }>
  showBackButton?: boolean
  onBack?: () => void
}

export default function AppHeader({
  title,
  subtitle,
  showStats = false,
  stats = [],
  actions = [],
  showBackButton = false,
  onBack,
}: AppHeaderProps) {
  const { theme } = useTheme()

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.card, borderBottomColor: theme.colors.border }]}>
      {/* Main Header Section */}
      <View style={styles.headerContent}>
        {showBackButton && (
          <Pressable onPress={onBack} style={styles.backButton}>
            <Text style={[styles.backIcon, { color: theme.colors.primary }]}>←</Text>
          </Pressable>
        )}

        <View style={styles.titleSection}>
          <Text style={[styles.title, { color: theme.colors.text }]}>{title}</Text>
          {subtitle && <Text style={[styles.subtitle, { color: theme.colors.textSecondary }]}>{subtitle}</Text>}
        </View>

        {actions.length > 0 && (
          <View style={styles.actionsContainer}>
            {actions.map((action, index) => (
              <Pressable key={index} onPress={action.onPress} style={styles.actionButton}>
                <Text style={[styles.actionIcon, { color: theme.colors.primary }]}>{action.icon}</Text>
              </Pressable>
            ))}
          </View>
        )}
      </View>

      {/* Stats Section */}
      {showStats && stats.length > 0 && (
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.statsContainer}>
          {stats.map((stat, index) => (
            <View
              key={index}
              style={[
                styles.statCard,
                {
                  backgroundColor: theme.dark ? theme.colors.surface : theme.colors.background,
                  borderColor: theme.colors.border,
                },
              ]}
            >
              <Text style={[styles.statValue, { color: stat.color || theme.colors.primary }]}>
                {stat.value}
              </Text>
              <Text style={[styles.statLabel, { color: theme.colors.textSecondary }]}>{stat.label}</Text>
            </View>
          ))}
        </ScrollView>
      )}
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    borderBottomWidth: 1,
    paddingTop: 12,
    paddingBottom: 8,
  },
  headerContent: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  backButton: {
    padding: 8,
    marginRight: 8,
  },
  backIcon: {
    fontSize: 20,
    fontWeight: "600",
  },
  titleSection: {
    flex: 1,
  },
  title: {
    fontSize: 20,
    fontWeight: "700",
    letterSpacing: -0.5,
  },
  subtitle: {
    fontSize: 13,
    marginTop: 2,
    fontWeight: "400",
  },
  actionsContainer: {
    flexDirection: "row",
    gap: 8,
  },
  actionButton: {
    padding: 8,
    borderRadius: 8,
  },
  actionIcon: {
    fontSize: 18,
    fontWeight: "600",
  },
  statsContainer: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    marginTop: 4,
  },
  statCard: {
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 10,
    marginRight: 10,
    borderWidth: 1,
    minWidth: 90,
  },
  statValue: {
    fontSize: 14,
    fontWeight: "700",
  },
  statLabel: {
    fontSize: 11,
    marginTop: 4,
    fontWeight: "500",
  },
})
