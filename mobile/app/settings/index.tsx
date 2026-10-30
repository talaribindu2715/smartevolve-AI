import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  ScrollView,
  Switch,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
} from "react-native";
import { useRouter } from "expo-router";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "../../src/store/authContext";
import { api } from "../../src/api/client";
import { Card } from "../../src/components/Card";
import { Button } from "../../src/components/Button";
import { Badge } from "../../src/components/Badge";
import { colors, radius, spacing } from "../../src/theme/colors";

const LEARNING_STYLES = [
  "Visual & Diagrammatic",
  "Hands-on / Practical Projects",
  "Interactive Video Masterclasses",
  "Textual & Formal Specifications",
];

export default function SettingsScreen() {
  const router = useRouter();
  const { user, logout } = useAuth();
  const queryClient = useQueryClient();

  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const [adaptiveReminders, setAdaptiveReminders] = useState(true);
  const [offlineSync, setOfflineSync] = useState(false);

  // Form State
  const [fullName, setFullName] = useState("");
  const [educationLevel, setEducationLevel] = useState("UNDERGRADUATE");
  const [institution, setInstitution] = useState("");
  const [branch, setBranch] = useState("");
  const [graduationYear, setGraduationYear] = useState("2026");
  const [preferredLearningStyle, setPreferredLearningStyle] = useState(LEARNING_STYLES[1]);
  const [academicGoals, setAcademicGoals] = useState("");
  const [targetCareerId, setTargetCareerId] = useState<string | undefined>(undefined);
  const [interestsText, setInterestsText] = useState("");

  const { data: profile, isLoading: isProfileLoading } = useQuery({
    queryKey: ["profile"],
    queryFn: () => api.getProfile(),
  });

  const { data: careers } = useQuery({
    queryKey: ["careers"],
    queryFn: () => api.getCareers(),
  });

  useEffect(() => {
    if (profile) {
      setFullName(profile.fullName || "");
      setEducationLevel(profile.educationLevel || "UNDERGRADUATE");
      setInstitution(profile.institution || "");
      setBranch(profile.branch || "");
      setGraduationYear(profile.graduationYear ? profile.graduationYear.toString() : "2026");
      setPreferredLearningStyle(profile.preferredLearningStyle || LEARNING_STYLES[1]);
      setAcademicGoals(profile.academicGoals || "");
      setTargetCareerId(profile.targetCareerId);
      setInterestsText(profile.interests ? profile.interests.join(", ") : "");
    }
  }, [profile]);

  const updateProfileMutation = useMutation({
    mutationFn: () => {
      const interestsArray = interestsText
        .split(",")
        .map((s) => s.trim())
        .filter((s) => s.length > 0);

      const gradYearInt = parseInt(graduationYear, 10) || 2026;

      return api.updateProfile({
        fullName: fullName.trim(),
        educationLevel,
        institution: institution.trim(),
        branch: branch.trim(),
        graduationYear: gradYearInt,
        interests: interestsArray,
        preferredLearningStyle,
        academicGoals: academicGoals.trim(),
        targetCareerId,
      });
    },
    onSuccess: (updated) => {
      queryClient.setQueryData(["profile"], updated);
      queryClient.invalidateQueries({ queryKey: ["dashboard"] });
      queryClient.invalidateQueries({ queryKey: ["activeRoadmap"] });
      queryClient.invalidateQueries({ queryKey: ["careers"] });
      Alert.alert(
        "Profile Saved Successfully",
        "Your academic preferences, learning style, and target career have been saved and applied to your AI recommendation pipeline."
      );
    },
    onError: (err: any) => {
      Alert.alert("Update Error", err.message || "Failed to update profile.");
    },
  });

  const handleSaveProfile = () => {
    if (!fullName.trim()) {
      Alert.alert("Validation Error", "Please provide your full name.");
      return;
    }
    updateProfileMutation.mutate();
  };

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

  if (isProfileLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={colors.primary} />
        <Text style={styles.loadingText}>Loading Account Preferences...</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      {/* Account Info Header */}
      <Card style={styles.sectionCard}>
        <Text style={styles.sectionHeader}>Authenticated Account</Text>
        <View style={styles.profileRow}>
          <View style={styles.avatarMini}>
            <Text style={styles.avatarText}>
              {(fullName || user?.fullName || "S").substring(0, 1).toUpperCase()}
            </Text>
          </View>
          <View style={{ flex: 1 }}>
            <Text style={styles.userName}>{fullName || user?.fullName || "Student"}</Text>
            <Text style={styles.userBranch}>{branch || "Engineering Student"}</Text>
          </View>
          <Badge label="ACTIVE" variant="success" />
        </View>
      </Card>

      {/* Edit Profile Form */}
      <Card style={styles.sectionCard}>
        <Text style={styles.sectionHeader}>Edit Student Profile</Text>

        <Text style={styles.inputLabel}>Full Name *</Text>
        <TextInput
          style={styles.textInput}
          value={fullName}
          onChangeText={setFullName}
          placeholder="e.g. Alex Morgan"
          placeholderTextColor={colors.textMuted}
        />

        <View style={styles.formRow}>
          <View style={{ flex: 1 }}>
            <Text style={styles.inputLabel}>Branch / Major</Text>
            <TextInput
              style={styles.textInput}
              value={branch}
              onChangeText={setBranch}
              placeholder="e.g. Computer Science"
              placeholderTextColor={colors.textMuted}
            />
          </View>
          <View style={{ width: 12 }} />
          <View style={{ flex: 1 }}>
            <Text style={styles.inputLabel}>Graduation Year</Text>
            <TextInput
              style={styles.textInput}
              value={graduationYear}
              onChangeText={setGraduationYear}
              keyboardType="numeric"
              placeholder="e.g. 2026"
              placeholderTextColor={colors.textMuted}
            />
          </View>
        </View>

        <Text style={styles.inputLabel}>Institution / University</Text>
        <TextInput
          style={styles.textInput}
          value={institution}
          onChangeText={setInstitution}
          placeholder="e.g. Indian Institute of Technology"
          placeholderTextColor={colors.textMuted}
        />

        <Text style={styles.inputLabel}>Technical Interests (comma separated)</Text>
        <TextInput
          style={styles.textInput}
          value={interestsText}
          onChangeText={setInterestsText}
          placeholder="e.g. AI, Distributed Systems, Cloud, Web3"
          placeholderTextColor={colors.textMuted}
        />

        <Text style={styles.inputLabel}>Preferred Learning Style</Text>
        <View style={styles.stylePillsWrap}>
          {LEARNING_STYLES.map((style) => {
            const isSelected = preferredLearningStyle === style;
            return (
              <TouchableOpacity
                key={style}
                style={[styles.stylePill, isSelected && styles.stylePillActive]}
                onPress={() => setPreferredLearningStyle(style)}
              >
                <Text style={[styles.stylePillText, isSelected && styles.stylePillTextActive]}>
                  {style}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>

        <Text style={styles.inputLabel}>Target Career Path</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.careerPillsScroll}>
          {(careers || []).map((c) => {
            const isSelected = targetCareerId === c.id;
            return (
              <TouchableOpacity
                key={c.id}
                style={[styles.careerPill, isSelected && styles.careerPillActive]}
                onPress={() => setTargetCareerId(c.id)}
              >
                <Text style={[styles.careerPillText, isSelected && styles.careerPillTextActive]}>
                  {c.name}
                </Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>

        <Text style={styles.inputLabel}>Academic & Career Goals</Text>
        <TextInput
          style={[styles.textInput, styles.textArea]}
          value={academicGoals}
          onChangeText={setAcademicGoals}
          multiline
          numberOfLines={3}
          placeholder="e.g. Master system design, build production AI pipelines, and land a Staff AI Engineer role."
          placeholderTextColor={colors.textMuted}
        />

        <Button
          title={updateProfileMutation.isPending ? "Saving Profile..." : "Save Profile Changes"}
          onPress={handleSaveProfile}
          loading={updateProfileMutation.isPending}
          size="md"
          style={{ marginTop: spacing.md }}
        />
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
    paddingTop: spacing.xxl,
    paddingBottom: spacing.xxl,
  },
  loadingContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: colors.background,
    gap: spacing.sm,
  },
  loadingText: {
    color: colors.textSecondary,
    fontSize: 14,
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
  inputLabel: {
    color: colors.textSecondary,
    fontSize: 12,
    fontWeight: "700",
    marginTop: spacing.sm,
    marginBottom: 4,
  },
  textInput: {
    backgroundColor: colors.surface,
    borderColor: colors.cardBorder,
    borderWidth: 1,
    borderRadius: radius.md,
    paddingHorizontal: spacing.sm,
    paddingVertical: 8,
    color: colors.textPrimary,
    fontSize: 14,
  },
  textArea: {
    minHeight: 70,
    textAlignVertical: "top",
  },
  formRow: {
    flexDirection: "row",
  },
  stylePillsWrap: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 6,
    marginVertical: 4,
  },
  stylePill: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: radius.sm,
    backgroundColor: colors.surfaceLight,
    borderWidth: 1,
    borderColor: colors.cardBorder,
  },
  stylePillActive: {
    backgroundColor: "rgba(99, 102, 241, 0.25)",
    borderColor: colors.primary,
  },
  stylePillText: {
    color: colors.textMuted,
    fontSize: 11,
    fontWeight: "600",
  },
  stylePillTextActive: {
    color: colors.primary,
    fontWeight: "700",
  },
  careerPillsScroll: {
    flexDirection: "row",
    marginVertical: 4,
  },
  careerPill: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: radius.full,
    backgroundColor: colors.surfaceLight,
    borderWidth: 1,
    borderColor: colors.cardBorder,
    marginRight: 8,
  },
  careerPillActive: {
    backgroundColor: colors.accent,
    borderColor: colors.accent,
  },
  careerPillText: {
    color: colors.textSecondary,
    fontSize: 12,
    fontWeight: "600",
  },
  careerPillTextActive: {
    color: colors.background,
    fontWeight: "800",
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
    fontFamily: "monospace",
    fontSize: 11,
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
