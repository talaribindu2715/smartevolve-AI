import React, { useState, useEffect } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { CertificateModal, CertificateData } from "../../src/components/CertificateModal";
import {
  getStoredEarnedCertificates,
  mergeCredentialsWithStoredCerts,
} from "../../src/services/certificateService";
import {
  View,
  Text,
  TextInput,
  Modal,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
  Platform,
  Alert,
  ActivityIndicator,
} from "react-native";
import { useRouter, useNavigation } from "expo-router";
import { useQuery } from "@tanstack/react-query";
import { useAuth, STORAGE_KEY_STUDENT_NAME, STORAGE_KEY_USER_META } from "../../src/store/authContext";
import { api } from "../../src/api/client";
import { Card } from "../../src/components/Card";
import { Badge } from "../../src/components/Badge";
import { Button } from "../../src/components/Button";
import { ProficiencyBar } from "../../src/components/ProficiencyBar";
import { SkillRadarChart } from "../../src/components/SkillRadarChart";
import { CardSkeleton, Skeleton } from "../../src/components/Skeleton";
import { ErrorBanner } from "../../src/components/ErrorBanner";
import { colors, radius, spacing } from "../../src/theme/colors";

export default function ProfileScreen() {
  const router = useRouter();
  const navigation = useNavigation();
  const { logout, user, updateUserLocally } = useAuth();
  const [selectedProfileCert, setSelectedProfileCert] = useState<CertificateData | null>(null);

  // Stored state from local persistence
  const [storedStudentName, setStoredStudentName] = useState<string | null>(null);
  const [storedMetadata, setStoredMetadata] = useState<{
    institution?: string;
    branch?: string;
    graduationYear?: number;
    educationLevel?: string;
  }>({});

  // Inline Profile Edit State
  const [editModalVisible, setEditModalVisible] = useState(false);
  const [editName, setEditName] = useState("");
  const [editBranch, setEditBranch] = useState("");
  const [editInstitution, setEditInstitution] = useState("");
  const [editGradYear, setEditGradYear] = useState("2027");
  const [isSavingProfile, setIsSavingProfile] = useState(false);

  useEffect(() => {
    AsyncStorage.getItem(STORAGE_KEY_STUDENT_NAME).then((saved) => {
      if (saved && saved.trim().length > 0 && saved !== "Student" && saved !== "Alex Chen") {
        setStoredStudentName(saved.trim());
      }
    });
    AsyncStorage.getItem(STORAGE_KEY_USER_META).then((saved) => {
      if (saved) {
        try {
          setStoredMetadata(JSON.parse(saved));
        } catch (_) {}
      }
    });
  }, []);

  const handleLogout = async () => {
    const doLogout = async () => {
      await logout();
      if (Platform.OS === "web" && typeof window !== "undefined") {
        window.location.href = "/";
        return;
      }
      try {
        const parentNav = navigation.getParent();
        if (parentNav && parentNav.navigate) {
          parentNav.navigate("index" as never);
          return;
        }
      } catch (_) {}
      router.replace("/");
    };

    if (Platform.OS === "web") {
      const confirmed =
        typeof window !== "undefined"
          ? window.confirm("Are you sure you want to sign out of SmartEvolve AI?")
          : true;
      if (confirmed) {
        await doLogout();
      }
    } else {
      Alert.alert("Confirm Sign Out", "Are you sure you want to sign out of SmartEvolve AI?", [
        { text: "Cancel", style: "cancel" },
        {
          text: "Sign Out",
          style: "destructive",
          onPress: doLogout,
        },
      ]);
    }
  };

  const {
    data: profile,
    isLoading: isProfileLoading,
    isError: isProfileError,
    error: profileError,
    refetch: refetchProfile,
    isRefetching,
  } = useQuery({
    queryKey: ["profile"],
    queryFn: () => api.getProfile(),
  });

  const {
    data: studentSkills,
    isLoading: isSkillsLoading,
    refetch: refetchSkills,
  } = useQuery({
    queryKey: ["studentSkills"],
    queryFn: () => api.getMySkills(),
  });

  const {
    data: analytics,
    isLoading: isAnalyticsLoading,
    refetch: refetchAnalytics,
  } = useQuery({
    queryKey: ["analytics"],
    queryFn: () => api.getAnalytics(),
  });

  const { data: credentials } = useQuery({
    queryKey: ["credentials"],
    queryFn: () => api.getCredentials(),
  });

  const { data: storedCerts, refetch: refetchStoredCerts } = useQuery({
    queryKey: ["storedEarnedCerts"],
    queryFn: () => getStoredEarnedCertificates(),
  });

  const { data: dashboard } = useQuery({
    queryKey: ["dashboard"],
    queryFn: () => api.getDashboard(),
  });

  const isLoading = isProfileLoading || isSkillsLoading || isAnalyticsLoading;

  const handleRefresh = async () => {
    await Promise.all([
      refetchProfile(),
      refetchSkills(),
      refetchAnalytics(),
      refetchStoredCerts(),
    ]);
  };

  const skills = studentSkills || [];
  const categoryProficiencies = analytics?.categoryProficiencies || {};
  const effectiveCredentials = mergeCredentialsWithStoredCerts(credentials, storedCerts || []);
  const verifiedBadgeCount = effectiveCredentials.filter(
    (c) => c.status === "CONFIRMED"
  ).length;

  // Resolve Real Registered Identity
  const effectiveStudentName =
    user?.fullName && user.fullName !== "Student" && user.fullName !== "Alex Chen"
      ? user.fullName
      : storedStudentName && storedStudentName !== "Student" && storedStudentName !== "Alex Chen"
      ? storedStudentName
      : profile?.fullName && profile.fullName !== "Student" && profile.fullName !== "Alex Chen"
      ? profile.fullName
      : dashboard?.studentName && dashboard.studentName !== "Student" && dashboard.studentName !== "Alex Chen"
      ? dashboard.studentName
      : user?.fullName || "Student";

  const effectiveBranch =
    profile?.branch && profile.branch !== "Engineering Discipline"
      ? profile.branch
      : storedMetadata.branch || "Computer Science";

  const effectiveInstitution =
    profile?.institution && profile.institution !== "Engineering College"
      ? profile.institution
      : storedMetadata.institution || "Engineering College";

  const effectiveGradYear =
    profile?.graduationYear || storedMetadata.graduationYear || 2027;

  const avatarInitials = effectiveStudentName
    .split(" ")
    .map((p) => p[0])
    .filter(Boolean)
    .slice(0, 2)
    .join("")
    .toUpperCase() || "BP";

  const handleOpenEdit = () => {
    setEditName(effectiveStudentName);
    setEditBranch(effectiveBranch);
    setEditInstitution(effectiveInstitution);
    setEditGradYear(String(effectiveGradYear));
    setEditModalVisible(true);
  };

  const handleSaveProfile = async () => {
    if (!editName.trim()) {
      Alert.alert("Validation", "Please enter your full name.");
      return;
    }
    setIsSavingProfile(true);
    try {
      const gradYearNum = parseInt(editGradYear, 10) || 2027;
      await api.updateProfile({
        fullName: editName.trim(),
        branch: editBranch.trim(),
        institution: editInstitution.trim(),
        graduationYear: gradYearNum,
      });

      await AsyncStorage.setItem(STORAGE_KEY_STUDENT_NAME, editName.trim());
      await AsyncStorage.setItem(
        STORAGE_KEY_USER_META,
        JSON.stringify({
          branch: editBranch.trim(),
          institution: editInstitution.trim(),
          graduationYear: gradYearNum,
        })
      );

      setStoredStudentName(editName.trim());
      setStoredMetadata({
        branch: editBranch.trim(),
        institution: editInstitution.trim(),
        graduationYear: gradYearNum,
      });

      updateUserLocally({
        fullName: editName.trim(),
        branch: editBranch.trim(),
        institution: editInstitution.trim(),
        graduationYear: gradYearNum,
      });

      refetchProfile();
      setEditModalVisible(false);
      Alert.alert("Profile Updated", "Your student profile details have been saved successfully!");
    } catch (e: any) {
      Alert.alert("Error", e?.message || "Failed to update profile");
    } finally {
      setIsSavingProfile(false);
    }
  };

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.content}
      refreshControl={
        <RefreshControl
          refreshing={isRefetching}
          onRefresh={handleRefresh}
          tintColor={colors.primary}
        />
      }
    >
      <View style={styles.responsiveWrapper}>
        {isProfileError && (
          <ErrorBanner
            message={
              profileError instanceof Error
                ? profileError.message
                : "Unable to load student profile."
            }
            onRetry={handleRefresh}
          />
        )}

        {isLoading ? (
          <View style={{ gap: spacing.md }}>
            <CardSkeleton height={200} />
            <CardSkeleton height={140} />
            <CardSkeleton height={240} />
          </View>
        ) : (
          <>
            {/* Top Header Card */}
            <Card style={styles.profileHeaderCard}>
              <View style={styles.avatarWrap}>
                <Text style={styles.avatarText}>{avatarInitials}</Text>
              </View>

              <Text style={styles.name}>{effectiveStudentName}</Text>
              <Text style={styles.education}>
                {effectiveBranch} • {effectiveInstitution}
              </Text>
              <Text style={styles.gradYear}>
                Class of {effectiveGradYear}
              </Text>

              <View style={styles.metaBadgeRow}>
                <Badge label="VERIFIED STUDENT" variant="success" />
                {verifiedBadgeCount > 0 && (
                  <Badge label={`${verifiedBadgeCount} ON-CHAIN CREDENTIALS`} variant="blockchain" />
                )}
              </View>

              {/* Inline Edit Profile Action */}
              <TouchableOpacity
                style={styles.editProfileBtn}
                onPress={handleOpenEdit}
                activeOpacity={0.8}
              >
                <Text style={styles.editProfileBtnText}>✏️ Edit Profile Details</Text>
              </TouchableOpacity>

              {/* Fast Stats Row */}
              <View style={styles.statsRow}>
                <View style={styles.statCol}>
                  <Text style={styles.statVal}>
                    {analytics?.overallProficiency != null
                      ? `${analytics.overallProficiency.toFixed(0)}%`
                      : "0%"}
                  </Text>
                  <Text style={styles.statLabel}>Proficiency</Text>
                </View>
                <View style={styles.statDivider} />
                <View style={styles.statCol}>
                  <Text style={styles.statVal}>
                    {dashboard?.careerReadinessScore != null
                      ? `${dashboard.careerReadinessScore.toFixed(0)}%`
                      : "0%"}
                  </Text>
                  <Text style={styles.statLabel}>Career Readiness</Text>
                </View>
                <View style={styles.statDivider} />
                <View style={styles.statCol}>
                  <Text style={styles.statVal}>{skills.length}</Text>
                  <Text style={styles.statLabel}>Skills Tracked</Text>
                </View>
              </View>
            </Card>

            {/* Category Radar Chart */}
            <View style={styles.sectionWrap}>
              <Text style={styles.sectionTitle}>Category Competency Radar</Text>
              <Card style={styles.radarCard}>
                <SkillRadarChart data={categoryProficiencies} size={280} />
              </Card>
            </View>

            {/* Calibrated Skills Breakdown */}
            <View style={styles.sectionWrap}>
              <View style={styles.sectionHeader}>
                <Text style={styles.sectionTitle}>Calibrated Skill Proficiencies</Text>
                <Text style={styles.skillsCount}>{skills.length} Calibrated</Text>
              </View>

              <Card>
                {skills.length > 0 ? (
                  skills.map((s) => (
                    <ProficiencyBar
                      key={s.id}
                      label={s.skillName}
                      value={s.proficiency}
                      category={s.category}
                      evidenceType={s.evidenceType}
                    />
                  ))
                ) : (
                  <View style={styles.emptySkillsWrap}>
                    <Text style={styles.emptySkillsText}>
                      No calibrated skills yet. Complete an assessment or mark roadmap lessons complete to populate your verified skill profile!
                    </Text>
                    <Button
                      title="Explore Careers & Start Roadmap"
                      onPress={() => router.push("/(tabs)/careers")}
                      size="sm"
                      style={{ marginTop: spacing.md }}
                    />
                  </View>
                )}
              </Card>
            </View>

            {/* Earned Academic Certificates Section */}
            <View style={styles.sectionWrap}>
              <View style={styles.sectionHeader}>
                <Text style={styles.sectionTitle}>🎓 My Earned Certificates</Text>
                <Text style={styles.skillsCount}>{effectiveCredentials.length} Verified</Text>
              </View>

              <Card>
                {effectiveCredentials.length > 0 ? (
                  effectiveCredentials.map((cred) => (
                    <View
                      key={cred.id}
                      style={{
                        paddingVertical: 12,
                        borderBottomWidth: 1,
                        borderBottomColor: colors.cardBorder,
                        flexDirection: "row",
                        justifyContent: "space-between",
                        alignItems: "center",
                        flexWrap: "wrap",
                        gap: 10,
                      }}
                    >
                      <View style={{ flex: 1, minWidth: 220 }}>
                        <Text style={{ color: colors.textPrimary, fontSize: 15, fontWeight: "800" }}>
                          {cred.achievementTitle}
                        </Text>
                        <Text style={{ color: colors.textSecondary, fontSize: 12, marginTop: 2 }}>
                          SmartEvolve Academy • Department of {effectiveBranch}
                        </Text>
                        <Text style={{ color: colors.primary, fontSize: 11, fontWeight: "600", marginTop: 4 }}>
                          Issued: {new Date(cred.issuedAt || Date.now()).toLocaleDateString()} • Code: {cred.id.startsWith("SE-GL-") ? cred.id : `SE-GL-${cred.id.substring(0, 6).toUpperCase()}`}
                        </Text>
                      </View>
                      <Button
                        title="View Certificate 📜"
                        size="sm"
                        onPress={() => {
                          setSelectedProfileCert({
                            id: cred.id,
                            studentName: effectiveStudentName,
                            department: effectiveBranch,
                            institution: effectiveInstitution,
                            graduationYear: effectiveGradYear,
                            courseOrSkillTitle: cred.achievementTitle,
                            category: cred.credentialType || "Academic Specialization",
                            proficiency: 95,
                            issuedDate: cred.issuedAt,
                            certificateCode: cred.id.startsWith("SE-GL-") ? cred.id : "SE-GL-" + cred.id.substring(0, 6).toUpperCase(),
                          });
                        }}
                      />
                    </View>
                  ))
                ) : (
                  <View style={styles.emptySkillsWrap}>
                    <Text style={styles.emptySkillsText}>
                      No certificates earned yet. Complete video courses in SmartEvolve Academy and pass the milestone skill quiz (≥60%) to autonomously generate your verified certificates!
                    </Text>
                    <Button
                      title="Explore SmartEvolve Academy →"
                      onPress={() => router.push("/videos")}
                      size="sm"
                      style={{ marginTop: spacing.md }}
                    />
                  </View>
                )}
              </Card>
            </View>

            {/* Certificate Modal */}
            <CertificateModal
              visible={!!selectedProfileCert}
              onClose={() => setSelectedProfileCert(null)}
              certificate={selectedProfileCert}
            />

            {/* Action Links */}
            <View style={styles.actionsWrap}>
              <Button
                title="⚙️ Full Settings & AI Preferences"
                onPress={() => router.push("/settings")}
                variant="secondary"
                size="md"
              />
              <Button
                title="Sign Out of Account"
                onPress={handleLogout}
                variant="danger"
                size="md"
              />
            </View>
          </>
        )}
      </View>

      {/* Edit Profile Modal */}
      <Modal
        visible={editModalVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setEditModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Edit Profile Information</Text>
            <Text style={styles.modalSubtitle}>
              Update your registered academic identity across SmartEvolve AI
            </Text>

            <View style={styles.formGroup}>
              <Text style={styles.formLabel}>Full Name</Text>
              <TextInput
                style={styles.formInput}
                value={editName}
                onChangeText={setEditName}
                placeholder="e.g. Bindu Talari"
                placeholderTextColor={colors.textMuted}
              />
            </View>

            <View style={styles.formGroup}>
              <Text style={styles.formLabel}>Department / Degree</Text>
              <TextInput
                style={styles.formInput}
                value={editBranch}
                onChangeText={setEditBranch}
                placeholder="e.g. Computer Science and Engineering"
                placeholderTextColor={colors.textMuted}
              />
            </View>

            <View style={styles.formGroup}>
              <Text style={styles.formLabel}>College / Institution</Text>
              <TextInput
                style={styles.formInput}
                value={editInstitution}
                onChangeText={setEditInstitution}
                placeholder="e.g. Engineering College"
                placeholderTextColor={colors.textMuted}
              />
            </View>

            <View style={styles.formGroup}>
              <Text style={styles.formLabel}>Graduation Year</Text>
              <TextInput
                style={styles.formInput}
                value={editGradYear}
                onChangeText={setEditGradYear}
                placeholder="2027"
                keyboardType="numeric"
                placeholderTextColor={colors.textMuted}
              />
            </View>

            <View style={styles.modalBtnRow}>
              <Button
                title="Cancel"
                variant="secondary"
                onPress={() => setEditModalVisible(false)}
                style={{ flex: 1 }}
              />
              <Button
                title={isSavingProfile ? "Saving..." : "Save Profile"}
                onPress={handleSaveProfile}
                disabled={isSavingProfile}
                style={{ flex: 1 }}
              />
            </View>
          </View>
        </View>
      </Modal>
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
    paddingTop: spacing.xxl,
    paddingBottom: spacing.xxl,
  },
  responsiveWrapper: {
    width: "100%",
    alignSelf: "stretch",
  },
  profileHeaderCard: {
    alignItems: "center",
    padding: spacing.xl,
    backgroundColor: colors.surface,
    marginBottom: spacing.md,
  },
  avatarWrap: {
    width: 76,
    height: 76,
    borderRadius: 38,
    backgroundColor: colors.primary,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: spacing.md,
    borderWidth: 3,
    borderColor: colors.cardBorderActive,
  },
  avatarText: {
    color: "#FFF",
    fontSize: 26,
    fontWeight: "900",
  },
  name: {
    color: colors.textPrimary,
    fontSize: 22,
    fontWeight: "800",
  },
  education: {
    color: colors.textSecondary,
    fontSize: 14,
    marginTop: 4,
    textAlign: "center",
  },
  gradYear: {
    color: colors.textMuted,
    fontSize: 13,
    marginTop: 2,
  },
  metaBadgeRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "center",
    gap: spacing.sm,
    marginTop: spacing.md,
  },
  editProfileBtn: {
    marginTop: spacing.md,
    paddingHorizontal: 16,
    paddingVertical: 8,
    backgroundColor: "rgba(99, 102, 241, 0.12)",
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: "rgba(99, 102, 241, 0.35)",
  },
  editProfileBtnText: {
    color: colors.primary,
    fontSize: 13,
    fontWeight: "700",
  },
  statsRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-around",
    width: "100%",
    marginTop: spacing.lg,
    paddingTop: spacing.md,
    borderTopWidth: 1,
    borderTopColor: colors.cardBorder,
  },
  statCol: {
    alignItems: "center",
    flex: 1,
  },
  statVal: {
    color: colors.textPrimary,
    fontSize: 20,
    fontWeight: "800",
  },
  statLabel: {
    color: colors.textMuted,
    fontSize: 11,
    marginTop: 2,
    textTransform: "uppercase",
  },
  statDivider: {
    width: 1,
    height: 28,
    backgroundColor: colors.cardBorder,
  },
  sectionWrap: {
    marginTop: spacing.md,
  },
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: spacing.xs,
  },
  sectionTitle: {
    color: colors.textPrimary,
    fontSize: 17,
    fontWeight: "700",
    marginBottom: spacing.xs,
  },
  skillsCount: {
    color: colors.textMuted,
    fontSize: 13,
    fontWeight: "600",
  },
  radarCard: {
    alignItems: "center",
    paddingVertical: spacing.md,
  },
  emptySkillsWrap: {
    padding: spacing.md,
    alignItems: "center",
  },
  emptySkillsText: {
    color: colors.textMuted,
    fontSize: 13,
    textAlign: "center",
    lineHeight: 20,
  },
  actionsWrap: {
    marginTop: spacing.xl,
    gap: spacing.sm,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.75)",
    justifyContent: "center",
    alignItems: "center",
    padding: spacing.md,
  },
  modalContent: {
    width: "100%",
    maxWidth: 480,
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    padding: spacing.xl,
    borderWidth: 1,
    borderColor: colors.cardBorder,
  },
  modalTitle: {
    color: colors.textPrimary,
    fontSize: 18,
    fontWeight: "800",
    marginBottom: 4,
  },
  modalSubtitle: {
    color: colors.textMuted,
    fontSize: 13,
    marginBottom: spacing.lg,
  },
  formGroup: {
    marginBottom: spacing.md,
  },
  formLabel: {
    color: colors.textSecondary,
    fontSize: 12,
    fontWeight: "600",
    marginBottom: 6,
    textTransform: "uppercase",
  },
  formInput: {
    backgroundColor: colors.background,
    borderWidth: 1,
    borderColor: colors.cardBorder,
    borderRadius: radius.md,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    color: colors.textPrimary,
    fontSize: 15,
  },
  modalBtnRow: {
    flexDirection: "row",
    gap: spacing.md,
    marginTop: spacing.lg,
  },
});
