import React, { useState } from "react";
import { CertificateModal, CertificateData } from "../../src/components/CertificateModal";
import {
  getStoredEarnedCertificates,
  mergeCredentialsWithStoredCerts,
} from "../../src/services/certificateService";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
  Platform,
  Alert,
} from "react-native";
import { useRouter, useNavigation } from "expo-router";
import { useQuery } from "@tanstack/react-query";
import { useAuth } from "../../src/store/authContext";
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
  const { logout } = useAuth();
  const [selectedProfileCert, setSelectedProfileCert] = useState<CertificateData | null>(null);

  const handleLogout = async () => {
    const doLogout = async () => {
      await logout();
      try {
        if (router.canDismiss()) {
          router.dismissAll();
        }
      } catch (_) {}
      try {
        let rootNav: any = navigation;
        while (rootNav && rootNav.getParent && rootNav.getParent()) {
          rootNav = rootNav.getParent();
        }
        if (rootNav && rootNav.reset) {
          rootNav.reset({
            index: 0,
            routes: [{ name: "index" as never }],
          });
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
                <Text style={styles.avatarText}>
                  {(profile?.fullName || "S").substring(0, 2).toUpperCase()}
                </Text>
              </View>

              <Text style={styles.name}>{profile?.fullName || "Student"}</Text>
              <Text style={styles.education}>
                {profile?.branch || "Engineering Discipline"} •{" "}
                {profile?.institution || "Engineering College"}
              </Text>
              <Text style={styles.gradYear}>
                Class of {profile?.graduationYear || 2026}
              </Text>

              <View style={styles.metaBadgeRow}>
                <Badge label="VERIFIED STUDENT" variant="success" />
                {verifiedBadgeCount > 0 && (
                  <Badge label={`${verifiedBadgeCount} ON-CHAIN CREDENTIALS`} variant="blockchain" />
                )}
              </View>

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
                          SmartEvolve Academy • Department of {profile?.branch || "Computer Science and Engineering"}
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
                            studentName: profile?.fullName || "Bindu Talari",
                            department: profile?.branch || "Computer Science and Engineering",
                            institution: profile?.institution || "K.S.R.M. College of Engineering (Autonomous)",
                            graduationYear: profile?.graduationYear || 2026,
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
                title="⚙️ Account Settings & Security"
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
  goalsCard: {
    padding: spacing.md,
    backgroundColor: colors.surface,
    borderColor: "rgba(99, 102, 241, 0.25)",
    borderWidth: 1,
    marginBottom: spacing.md,
  },
  goalsHeaderRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: spacing.xs,
  },
  goalsCardTitle: {
    color: colors.textPrimary,
    fontSize: 14,
    fontWeight: "800",
  },
  editProfileLink: {
    color: colors.primary,
    fontSize: 12,
    fontWeight: "700",
  },
  goalMetaRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 5,
  },
  goalMetaLabel: {
    color: colors.textMuted,
    fontSize: 12,
  },
  goalMetaVal: {
    color: colors.accent,
    fontSize: 12,
    fontWeight: "700",
  },
  academicGoalsQuote: {
    marginTop: 6,
    paddingTop: 6,
    borderTopColor: colors.cardBorder,
    borderTopWidth: 1,
  },
  academicGoalsText: {
    color: colors.textSecondary,
    fontSize: 12,
    fontStyle: "italic",
    lineHeight: 18,
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
  radarSubtitle: {
    color: colors.textMuted,
    fontSize: 12,
    textAlign: "center",
    marginTop: spacing.sm,
    paddingHorizontal: spacing.md,
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
});
