"use client"

import { NavigationContainer } from "@react-navigation/native"
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs"
import { SafeAreaProvider } from "react-native-safe-area-context"
import { ThemeProvider, useTheme } from "./src/contexts/ThemeContext"
import { SettingsProvider } from "./src/contexts/SettingsContext"
import { View, Text, StyleSheet } from "react-native"

// Conditionally import StatusBar
let StatusBar: any = null
try {
  StatusBar = require("expo-status-bar").StatusBar
} catch (e) {
  // StatusBar not available
}

// Import screens
import AcquisitionScreen from "./src/screens/AcquisitionScreen"
import PlaybackScreen from "./src/screens/PlaybackScreen"
import AnalysisScreen from "./src/screens/AnalysisScreen"
import SettingsScreen from "./src/screens/SettingsScreen"

// Icon component with better design
const TabIcon = ({
  name,
  color,
  focused,
}: {
  name: string
  color: string
  focused: boolean
}) => (
  <View
    style={[
      styles.tabIcon,
      {
        backgroundColor: focused ? color + "20" : "transparent",
        borderColor: focused ? color : "transparent",
      },
    ]}
  >
    <Text style={[styles.tabIconText, { color, fontWeight: focused ? "700" : "500" }]}>
      {name[0]}
    </Text>
  </View>
)

const Tab = createBottomTabNavigator()

function AppNavigator() {
  const { theme } = useTheme()

  return (
    <NavigationContainer
      theme={{
        dark: theme.dark,
        colors: {
          primary: theme.colors.primary,
          background: theme.colors.background,
          card: theme.colors.card,
          text: theme.colors.text,
          border: theme.colors.border,
          notification: theme.colors.notification,
        },
      }}
    >
      <Tab.Navigator
        screenOptions={{
          tabBarStyle: {
            backgroundColor: theme.colors.card,
            borderTopColor: theme.colors.border,
            borderTopWidth: 1,
            paddingBottom: 8,
            paddingTop: 8,
            paddingHorizontal: 8,
            height: 64,
            elevation: 8,
            shadowColor: "#000",
            shadowOpacity: theme.dark ? 0.3 : 0.08,
            shadowOffset: { width: 0, height: -2 },
            shadowRadius: 8,
          },
          tabBarActiveTintColor: theme.colors.primary,
          tabBarInactiveTintColor: theme.colors.textTertiary,
          tabBarLabelStyle: {
            fontSize: 11,
            fontWeight: "600",
            marginTop: 4,
          },
          headerStyle: {
            backgroundColor: theme.colors.card,
            borderBottomColor: theme.colors.border,
            borderBottomWidth: 1,
            elevation: 2,
            shadowColor: "#000",
            shadowOpacity: theme.dark ? 0.2 : 0.05,
            shadowOffset: { width: 0, height: 1 },
            shadowRadius: 4,
          },
          headerTintColor: theme.colors.text,
          headerTitleStyle: {
            fontWeight: "700",
            fontSize: 17,
            letterSpacing: -0.5,
          },
        }}
      >
        <Tab.Screen
          name="Acquisition"
          component={AcquisitionScreen}
          options={{
            tabBarIcon: ({ color, focused }) => (
              <TabIcon name="Acquire" color={color} focused={focused} />
            ),
            title: "Acquisition",
          }}
        />
        <Tab.Screen
          name="Playback"
          component={PlaybackScreen}
          options={{
            tabBarIcon: ({ color, focused }) => <TabIcon name="Play" color={color} focused={focused} />,
            title: "Playback",
          }}
        />
        <Tab.Screen
          name="Analysis"
          component={AnalysisScreen}
          options={{
            tabBarIcon: ({ color, focused }) => (
              <TabIcon name="Analyze" color={color} focused={focused} />
            ),
            title: "Analysis",
          }}
        />
        <Tab.Screen
          name="Settings"
          component={SettingsScreen}
          options={{
            tabBarIcon: ({ color, focused }) => (
              <TabIcon name="Settings" color={color} focused={focused} />
            ),
            title: "Settings",
          }}
        />
      </Tab.Navigator>
    </NavigationContainer>
  )
}

export default function App() {
  return (
    <SafeAreaProvider>
      <ThemeProvider>
        <SettingsProvider>
          <AppNavigator />
          {StatusBar && <StatusBar style="auto" />}
        </SettingsProvider>
      </ThemeProvider>
    </SafeAreaProvider>
  )
}

const styles = StyleSheet.create({
  tabIcon: {
    width: 32,
    height: 32,
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
  },
  tabIconText: {
    fontSize: 14,
    fontWeight: "600",
  },
})

