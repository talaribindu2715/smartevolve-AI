import React from "react";
import { Tabs } from "expo-router";
import Svg, { Path, Circle, Rect } from "react-native-svg";
import { colors } from "../../src/theme/colors";

export default function TabsLayout() {
  return (
    <Tabs
      screenOptions={{
        headerStyle: { backgroundColor: colors.background },
        headerTintColor: colors.textPrimary,
        headerShadowVisible: false,
        tabBarStyle: {
          backgroundColor: colors.surface,
          borderTopColor: colors.cardBorder,
          borderTopWidth: 1,
          height: 65,
          paddingBottom: 8,
          paddingTop: 8,
        },
        tabBarActiveTintColor: colors.accent,
        tabBarInactiveTintColor: colors.textMuted,
        tabBarLabelStyle: {
          fontSize: 11,
          fontWeight: "600",
        },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: "Home",
          headerShown: false,
          tabBarIcon: ({ color, size }) => (
            <Svg width={size || 22} height={size || 22} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2">
              <Path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
              <Path d="M9 22V12h6v10" />
            </Svg>
          ),
        }}
      />

      <Tabs.Screen
        name="learn"
        options={{
          title: "Learn",
          headerShown: false,
          tabBarIcon: ({ color, size }) => (
            <Svg width={size || 22} height={size || 22} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2">
              <Path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" />
              <Path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" />
            </Svg>
          ),
        }}
      />

      <Tabs.Screen
        name="careers"
        options={{
          title: "Careers",
          headerShown: false,
          tabBarIcon: ({ color, size }) => (
            <Svg width={size || 22} height={size || 22} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2">
              <Rect x="2" y="7" width="20" height="14" rx="2" ry="2" />
              <Path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16" />
            </Svg>
          ),
        }}
      />

      <Tabs.Screen
        name="evolution"
        options={{
          title: "Evolution",
          headerShown: false,
          tabBarIcon: ({ color, size }) => (
            <Svg width={size || 22} height={size || 22} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2">
              <Path d="M18 20V10" />
              <Path d="M12 20V4" />
              <Path d="M6 20v-6" />
            </Svg>
          ),
        }}
      />

      <Tabs.Screen
        name="profile"
        options={{
          title: "Profile",
          headerShown: false,
          tabBarIcon: ({ color, size }) => (
            <Svg width={size || 22} height={size || 22} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2">
              <Path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
              <Circle cx="12" cy="7" r="4" />
            </Svg>
          ),
        }}
      />
    </Tabs>
  );
}
