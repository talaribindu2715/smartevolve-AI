import React from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  useWindowDimensions,
  Platform,
  ScrollView,
} from "react-native";
import { Tabs, useRouter } from "expo-router";
import Svg, { Path, Circle, Rect } from "react-native-svg";
import { colors, radius, spacing } from "../../src/theme/colors";
import { useAuth } from "../../src/store/authContext";

const SIDEBAR_WIDTH = 260;

// Custom Tab Bar that dynamically renders either a bottom bar (mobile) or an IDE-style left sidebar (desktop/laptop)
function ResponsiveTabBar({ state, descriptors, navigation }: any) {
  const { width } = useWindowDimensions();
  const router = useRouter();
  const { user } = useAuth();
  const isDesktop = width >= 768;

  // Render Left Sidebar for Desktop / Laptop
  if (isDesktop) {
    return (
      <View style={styles.desktopSidebar}>
        {/* Brand Header */}
        <View style={styles.brandHeader}>
          <View style={styles.brandLogoRow}>
            <View style={styles.brandIconWrap}>
              <Svg width={20} height={20} viewBox="0 0 24 24" fill="none" stroke="#10B981" strokeWidth="2.5">
                <Path d="M12 2L2 7l10 5 10-5-10-5z" />
                <Path d="M2 17l10 5 10-5" />
                <Path d="M2 12l10 5 10-5" />
              </Svg>
            </View>
            <View>
              <Text style={styles.brandTitle}>SmartEvolve</Text>
              <Text style={styles.brandSubtitle}>AI LEARNING IDE</Text>
            </View>
          </View>
          <View style={styles.statusPill}>
            <View style={styles.statusDot} />
            <Text style={styles.statusText}>Cloud Synced</Text>
          </View>
        </View>

        <ScrollView style={styles.sidebarScroll} showsVerticalScrollIndicator={false}>
          {/* Main Workspace Navigation */}
          <Text style={styles.sectionHeading}>WORKSPACE</Text>
          {state.routes.map((route: any, index: number) => {
            const { options } = descriptors[route.key];
            const isFocused = state.index === index;

            const onPress = () => {
              const event = navigation.emit({
                type: "tabPress",
                target: route.key,
                canPreventDefault: true,
              });

              if (!isFocused && !event.defaultPrevented) {
                navigation.navigate(route.name);
              }
            };

            const label = options.title || route.name;
            const iconColor = isFocused ? colors.accent : colors.textMuted;

            return (
              <TouchableOpacity
                key={route.key}
                accessibilityRole="button"
                accessibilityState={isFocused ? { selected: true } : {}}
                onPress={onPress}
                style={[styles.sidebarItem, isFocused && styles.sidebarItemActive]}
              >
                <View style={styles.sidebarItemContent}>
                  {options.tabBarIcon && options.tabBarIcon({ color: iconColor, size: 20 })}
                  <Text style={[styles.sidebarItemLabel, isFocused && styles.sidebarItemLabelActive]}>
                    {label}
                  </Text>
                </View>
                {isFocused && <View style={styles.activeIndicator} />}
              </TouchableOpacity>
            );
          })}

          {/* Quick Academic Tools */}
          <Text style={[styles.sectionHeading, { marginTop: spacing.lg }]}>TOOLS & CREDENTIALS</Text>

          <TouchableOpacity
            style={styles.sidebarItem}
            onPress={() => router.push("/credentials")}
          >
            <View style={styles.sidebarItemContent}>
              <Svg width={20} height={20} viewBox="0 0 24 24" fill="none" stroke={colors.blockchain} strokeWidth="2">
                <Path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
              </Svg>
              <Text style={styles.sidebarItemLabel}>Blockchain Badges</Text>
            </View>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.sidebarItem}
            onPress={() => router.push("/videos")}
          >
            <View style={styles.sidebarItemContent}>
              <Svg width={20} height={20} viewBox="0 0 24 24" fill="none" stroke="#EF4444" strokeWidth="2">
                <Rect x="2" y="4" width="20" height="16" rx="2.18" ry="2.18" />
                <Path d="M10 8.5v7l5-3.5-5-3.5z" />
              </Svg>
              <Text style={styles.sidebarItemLabel}>YouTube Academy</Text>
            </View>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.sidebarItem}
            onPress={() => router.push("/settings")}
          >
            <View style={styles.sidebarItemContent}>
              <Svg width={20} height={20} viewBox="0 0 24 24" fill="none" stroke={colors.textMuted} strokeWidth="2">
                <Circle cx="12" cy="12" r="3" />
                <Path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z" />
              </Svg>
              <Text style={styles.sidebarItemLabel}>Settings</Text>
            </View>
          </TouchableOpacity>
        </ScrollView>

        {/* User Card at bottom of sidebar */}
        <View style={styles.userFooter}>
          <View style={styles.userAvatar}>
            <Text style={styles.userAvatarText}>
              {user?.fullName ? user.fullName.charAt(0).toUpperCase() : "S"}
            </Text>
          </View>
          <View style={{ flex: 1 }}>
            <Text style={styles.userName} numberOfLines={1}>
              {user?.fullName || "Student"}
            </Text>
            <Text style={styles.userRole}>Adaptive Learner</Text>
          </View>
          <TouchableOpacity onPress={() => router.push("/settings")}>
            <Svg width={18} height={18} viewBox="0 0 24 24" fill="none" stroke={colors.textMuted} strokeWidth="2">
              <Path d="M9 18l6-6-6-6" />
            </Svg>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  // Render Standard Bottom Tab Bar for Mobile screens
  return (
    <View style={styles.mobileTabBar}>
      {state.routes.map((route: any, index: number) => {
        const { options } = descriptors[route.key];
        const isFocused = state.index === index;

        const onPress = () => {
          const event = navigation.emit({
            type: "tabPress",
            target: route.key,
            canPreventDefault: true,
          });

          if (!isFocused && !event.defaultPrevented) {
            navigation.navigate(route.name);
          }
        };

        const label = options.title || route.name;
        const color = isFocused ? colors.accent : colors.textMuted;

        return (
          <TouchableOpacity
            key={route.key}
            accessibilityRole="button"
            accessibilityState={isFocused ? { selected: true } : {}}
            onPress={onPress}
            style={styles.mobileTabItem}
          >
            {options.tabBarIcon && options.tabBarIcon({ color, size: 22 })}
            <Text style={[styles.mobileTabLabel, { color }]}>
              {label}
            </Text>
          </TouchableOpacity>
        );
      })}
    </View>
  );
}

export default function TabsLayout() {
  const { width } = useWindowDimensions();
  const isDesktop = width >= 768;

  return (
    <Tabs
      tabBar={(props) => <ResponsiveTabBar {...props} />}
      screenOptions={{
        headerShown: false,
        sceneStyle: isDesktop ? { marginLeft: SIDEBAR_WIDTH } : undefined,
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: "Home",
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

const styles = StyleSheet.create({
  // Desktop Sidebar Styles
  desktopSidebar: {
    position: (Platform.OS === "web" ? "fixed" : "absolute") as any,
    top: 0,
    left: 0,
    bottom: 0,
    width: SIDEBAR_WIDTH,
    backgroundColor: colors.surface,
    borderRightWidth: 1,
    borderRightColor: colors.cardBorder,
    display: "flex",
    flexDirection: "column",
    zIndex: 1000,
  },
  brandHeader: {
    padding: spacing.md,
    paddingTop: spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: colors.cardBorder,
  },
  brandLogoRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  brandIconWrap: {
    width: 36,
    height: 36,
    borderRadius: radius.md,
    backgroundColor: "rgba(16, 185, 129, 0.15)",
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: "rgba(16, 185, 129, 0.3)",
  },
  brandTitle: {
    color: colors.textPrimary,
    fontSize: 16,
    fontWeight: "700",
    letterSpacing: 0.3,
  },
  brandSubtitle: {
    color: colors.accent,
    fontSize: 10,
    fontWeight: "800",
    letterSpacing: 1.2,
  },
  statusPill: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    marginTop: 10,
    backgroundColor: colors.surfaceLight,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: radius.full,
    alignSelf: "flex-start",
  },
  statusDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: colors.success,
  },
  statusText: {
    color: colors.textMuted,
    fontSize: 10,
    fontWeight: "600",
  },
  sidebarScroll: {
    flex: 1,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.sm,
  },
  sectionHeading: {
    color: colors.textMuted,
    fontSize: 10,
    fontWeight: "800",
    letterSpacing: 1,
    marginBottom: spacing.xs,
    paddingHorizontal: spacing.sm,
  },
  sidebarItem: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 10,
    paddingHorizontal: spacing.sm,
    borderRadius: radius.md,
    marginVertical: 2,
  },
  sidebarItemActive: {
    backgroundColor: "rgba(16, 185, 129, 0.12)",
    borderLeftWidth: 3,
    borderLeftColor: colors.accent,
  },
  sidebarItemContent: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  sidebarItemLabel: {
    color: colors.textMuted,
    fontSize: 13,
    fontWeight: "600",
  },
  sidebarItemLabelActive: {
    color: colors.textPrimary,
    fontWeight: "700",
  },
  activeIndicator: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: colors.accent,
  },
  userFooter: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    padding: spacing.md,
    borderTopWidth: 1,
    borderTopColor: colors.cardBorder,
    backgroundColor: colors.surfaceLight,
  },
  userAvatar: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: colors.primary,
    alignItems: "center",
    justifyContent: "center",
  },
  userAvatarText: {
    color: "#FFF",
    fontWeight: "700",
    fontSize: 14,
  },
  userName: {
    color: colors.textPrimary,
    fontSize: 13,
    fontWeight: "600",
  },
  userRole: {
    color: colors.textMuted,
    fontSize: 11,
  },

  // Mobile Bottom Tab Bar Styles
  mobileTabBar: {
    flexDirection: "row",
    backgroundColor: colors.surface,
    borderTopWidth: 1,
    borderTopColor: colors.cardBorder,
    height: 65,
    paddingBottom: 8,
    paddingTop: 8,
  },
  mobileTabItem: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  mobileTabLabel: {
    fontSize: 11,
    fontWeight: "600",
    marginTop: 3,
  },
});
