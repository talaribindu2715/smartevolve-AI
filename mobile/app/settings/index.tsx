import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Switch,
  TouchableOpacity,
  Alert,
} from "react-native";
import { useRouter } from "expo-router";
import Svg, { Path } from "react-native-svg";
import { useAuth } from "../../src/store/authContext";
import { Card } from "../../src/components/Card";
import { Button } from "../../src/components/Button";
import { colors, radius, spacing } from "../../src/theme/colors";

export default function SettingsScreen() {
  const router = useRouter();
  const { user, logout } = useAuth();

  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const [adaptiveReminders, setAdaptiveReminders] = useState(true);
  const [offlineSync, setOfflineSync] = useState(false);

  const handleLogout = () => {
    Alert.alert("Confirm Sign Out", "Are you sure you want to sign out of SmartEvolve AI?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Sign Out",
        style: "destructive",
        onPress: async () => {
          await logout();
          router.replace("/(auth)/login");
        },
      },
    ]);
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      {/* Account Info Card */}
      <Card style={styles.sectionCard}>
        <Text style={styles.sectionHeader}>Authenticated Account</Text>
        <View style={styles.profileRow}>
          <View style={styles.avatarMini}>
            <Text style={styles.avatarText}>
              {(user?.fullName || "S").substring(0, 1).toUpperCase()}
            </Text>
          </View>
          <View style={{ flex: 1 }}>
            <Text style={styles.userName}>{user?.fullName || "Student"}</Text>
            <Text style={styles.userBranch}>{user?.branch || "Computer Science"}</Text>
          </View>
        </View>
      </Card>

      {/* Adaptive Learning Preferences */}
      <Card style={styles.sectionCard}>
        <Text style={styles.sectionHeader}>Adaptive Learning AI Engine</Text>

        <View style={styles.settingRow}>
          <View style={{ flex: 1 }}>
            <Text style={styles.settingLabel}>Adaptive Roadmap Recalculation</Text>
            <Text style={styles.settingSub}>
              Automatically unlock successor modules upon assessment score submission
            </Text>
          </View>
          <Switch
            value={adaptiveReminders}
            onValueChange={setAdaptiveReminders}
            trackColor={{ false: colors.surfaceLight, true: colors.primary }}
          />
        </View>

        <View style={styles.divider} />

        <View style={styles.settingRow}>
          <View style={{ flex: 1 }}>
            <Text style={styles.settingLabel}>Skill Evolution Notifications</Text>
            <Text style={styles.settingSub}>
              Get alerts when your career readiness score changes
            </Text>
          </View>
          <Switch
            value={notificationsEnabled}
            onValueChange={setNotificationsEnabled}
            trackColor={{ false: colors.surfaceLight, true: colors.primary }}
          />
        </View>

        <View style={styles.divider} />

        <View style={styles.settingRow}>
          <View style={{ flex: 1 }}>
            <Text style={styles.settingLabel}>Offline Cache Synchronization</Text>
            <Text style={styles.settingSub}>
              Pre-fetch lessons and quizzes for offline study
            </Text>
          </View>
          <Switch
            value={offlineSync}
            onValueChange={setOfflineSync}
            trackColor={{ false: colors.surfaceLight, true: colors.primary }}
          />
        </View>
      </Card>

      {/* Blockchain Ledger Settings */}
      <Card style={styles.sectionCard}>
        <Text style={styles.sectionHeader}>Blockchain Ledger & Security</Text>
        <View style={styles.infoRow}>
          <Text style={styles.infoKey}>Active Network</Text>
          <Text style={styles.infoVal}>Hardhat EVM Local (Chain ID: 31337)</Text>
        </View>
        <View style={styles.infoRow}>
          <Text style={styles.infoKey}>Smart Contract</Text>
          <Text style={[styles.infoVal, styles.monoText]} numberOfLines={1}>
            0x5FbDB2315678afecb367f032d93F642f64180aa3
          </Text>
        </View>
        <View style={styles.infoRow}>
          <Text style={styles.infoKey}>Authentication</Text>
          <Text style={styles.infoVal}>Supabase Auth (HMAC-SHA256 JWT)</Text>
        </View>
      </Card>

      {/* App Info & Sign Out */}
      <View style={styles.actionsWrap}>
        <Button
          title="Sign Out of Account"
          onPress={handleLogout}
          variant="danger"
          size="md"
        />

        <View style={styles.versionWrap}>
          <Text style={styles.versionText}>SmartEvolve AI Mobile v1.0.0 (Production Build)</Text>
          <Text style={styles.versionSub}>Final Year B.Tech Engineering Capstone Project</Text>
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  content: {
    padding: spacing.md,
    gap: spacing.md,
    paddingBottom: spacing.xxl,
  },
  sectionCard: {
    padding: spacing.md,
  },
  sectionHeader: {
    color: colors.primary,
    fontSize: 12,
    fontWeight: "700",
    textTransform: "uppercase",
    letterSpacing: 0.5,
    marginBottom: spacing.sm,
  },
  profileRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.md,
  },
  avatarMini: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: colors.primary,
    alignItems: "center",
    justifyContent: "center",
  },
  avatarText: {
    color: "#FFF",
    fontSize: 18,
    fontWeight: "800",
  },
  userName: {
    color: colors.textPrimary,
    fontSize: 16,
    fontWeight: "700",
  },
  userBranch: {
    color: colors.textSecondary,
    fontSize: 13,
  },
  settingRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: spacing.xs,
  },
  settingLabel: {
    color: colors.textPrimary,
    fontSize: 14,
    fontWeight: "600",
  },
  settingSub: {
    color: colors.textMuted,
    fontSize: 12,
    marginTop: 2,
    paddingRight: spacing.sm,
  },
  divider: {
    height: 1,
    backgroundColor: colors.cardBorder,
    marginVertical: spacing.sm,
  },
  infoRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: 6,
    gap: 8,
  },
  infoKey: {
    color: colors.textMuted,
    fontSize: 12,
  },
  infoVal: {
    color: colors.textSecondary,
    fontSize: 12,
    fontWeight: "600",
    textAlign: "right",
    flex: 1,
  },
  monoText: {
    color: colors.accent,
  },
  actionsWrap: {
    gap: spacing.md,
    marginTop: spacing.md,
  },
  versionWrap: {
    alignItems: "center",
    gap: 2,
    marginTop: spacing.sm,
  },
  versionText: {
    color: colors.textMuted,
    fontSize: 12,
    fontWeight: "600",
  },
  versionSub: {
    color: colors.textMuted,
    fontSize: 11,
  },
});
