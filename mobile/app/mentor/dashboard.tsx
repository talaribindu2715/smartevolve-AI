import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Modal,
  Alert,
  ActivityIndicator,
} from "react-native";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "../../src/api/client";
import { RoleNavBar } from "../../src/components/RoleNavBar";
import { RoleGuard } from "../../src/components/RoleGuard";
import { Card } from "../../src/components/Card";
import { Button } from "../../src/components/Button";
import { Badge } from "../../src/components/Badge";
import { ProgressBar } from "@/components/ProgressBar";
import { CardSkeleton } from "../../src/components/Skeleton";
import { ErrorBanner } from "../../src/components/ErrorBanner";
import { AssignedStudent, CandidateDossier } from "../../src/types";
import { colors, radius, spacing } from "../../src/theme/colors";

export default function MentorDashboardScreen() {
  const queryClient = useQueryClient();
  const [selectedStudent, setSelectedStudent] = useState<AssignedStudent | null>(null);
  const [dossierModalVisible, setDossierModalVisible] = useState(false);
  const [feedbackText, setFeedbackText] = useState("");
  const [successBanner, setSuccessBanner] = useState<string | null>(null);

  const {
    data: dashboard,
    isLoading,
    isError,
    error,
    refetch,
  } = useQuery({
    queryKey: ["mentorDashboard"],
    queryFn: () => api.getMentorDashboard(),
  });

  const {
    data: studentDossier,
    isLoading: isDossierLoading,
  } = useQuery({
    queryKey: ["studentDossier", selectedStudent?.studentId],
    queryFn: () =>
      selectedStudent
        ? api.getMentorStudentDetail(selectedStudent.studentId)
        : null,
    enabled: !!selectedStudent && dossierModalVisible,
  });

  const feedbackMutation = useMutation({
    mutationFn: (text: string) => {
      if (!selectedStudent) throw new Error("No student selected");
      return api.submitMentorFeedback(selectedStudent.studentId, {
        feedbackText: text,
      });
    },
    onSuccess: (updated) => {
      queryClient.invalidateQueries({ queryKey: ["mentorDashboard"] });
      setSuccessBanner(`Feedback recorded for ${updated.fullName}!`);
      setTimeout(() => setSuccessBanner(null), 4000);
      setDossierModalVisible(false);
      setFeedbackText("");
      Alert.alert(
        "Guidance Saved",
        `Your personalized recommendation has been recorded in ${updated.fullName}'s learning profile.`
      );
    },
    onError: (err: any) => {
      Alert.alert("Submission Error", err.message || "Failed to submit feedback.");
    },
  });

  const handleOpenDossier = (student: AssignedStudent) => {
    setSelectedStudent(student);
    setFeedbackText(student.mentorNotes || "");
    setDossierModalVisible(true);
  };

  const handleSubmitFeedback = () => {
    if (!feedbackText.trim()) {
      Alert.alert("Validation Error", "Please write a guidance note for the student.");
      return;
    }
    feedbackMutation.mutate(feedbackText.trim());
  };

  return (
    <RoleGuard allowedRoles={["MENTOR", "FACULTY", "ADMIN"]}>
      <View style={styles.container}>
        <RoleNavBar currentTab="Cohort Overview" />

        <ScrollView contentContainerStyle={styles.content}>
          <View style={styles.responsiveWrapper}>
            {/* Header Banner */}
            <View style={styles.headerBanner}>
              <View>
                <View style={styles.badgeRow}>
                  <Badge label="FACULTY OVERSIGHT" variant="success" />
                  <Text style={styles.headerTagline}>
                    Restricted to Assigned Cohort
                  </Text>
                </View>
                <Text style={styles.title}>Mentor & Faculty Hub</Text>
                <Text style={styles.subtitle}>
                  Guiding undergraduate engineers to target career milestones through
                  real-time skill telemetry.
                </Text>
              </View>
            </View>

            {successBanner && (
              <View style={styles.successBanner}>
                <Text style={styles.successBannerText}>✓ {successBanner}</Text>
              </View>
            )}

            {isError && (
              <ErrorBanner
                message={
                  error instanceof Error
                    ? error.message
                    : "Failed to load mentor cohort data."
                }
                onRetry={refetch}
              />
            )}

            {isLoading ? (
              <View style={{ gap: spacing.md }}>
                <CardSkeleton height={110} />
                <CardSkeleton height={200} />
                <CardSkeleton height={200} />
              </View>
            ) : (
              <>
                {/* 4 KPI Summary Cards */}
                <View style={styles.kpiGrid}>
                  <Card style={styles.kpiCard}>
                    <Text style={styles.kpiEmoji}>👥</Text>
                    <Text style={styles.kpiValue}>
                      {dashboard?.totalAssignedStudents || 0}
                    </Text>
                    <Text style={styles.kpiLabel}>Assigned Students</Text>
                  </Card>

                  <Card style={styles.kpiCard}>
                    <Text style={styles.kpiEmoji}>📈</Text>
                    <Text style={[styles.kpiValue, { color: colors.accent }]}>
                      {dashboard?.averageCohortProficiency || "0.0"}%
                    </Text>
                    <Text style={styles.kpiLabel}>Avg Cohort Proficiency</Text>
                  </Card>

                  <Card style={styles.kpiCard}>
                    <Text style={styles.kpiEmoji}>🗺️</Text>
                    <Text style={[styles.kpiValue, { color: colors.primary }]}>
                      {dashboard?.activeRoadmapsCount || 0}
                    </Text>
                    <Text style={styles.kpiLabel}>Active Roadmaps</Text>
                  </Card>

                  <Card style={styles.kpiCard}>
                    <Text style={styles.kpiEmoji}>🛡️</Text>
                    <Text style={[styles.kpiValue, { color: colors.success }]}>
                      Active
                    </Text>
                    <Text style={styles.kpiLabel}>RLS Policy Enforced</Text>
                  </Card>
                </View>

                {/* Assigned Students Cohort Section */}
                <View style={styles.sectionHeaderRow}>
                  <View>
                    <Text style={styles.sectionTitle}>
                      Assigned Cohort Mentees (
                      {dashboard?.students?.length || 0})
                    </Text>
                    <Text style={styles.sectionSubtitle}>
                      You have access solely to student profiles assigned in the database.
                    </Text>
                  </View>
                </View>

                {dashboard?.students && dashboard.students.length > 0 ? (
                  <View style={styles.studentsList}>
                    {dashboard.students.map((student) => (
                      <Card key={student.studentId} style={styles.studentCard}>
                        <View style={styles.studentCardHeader}>
                          <View style={styles.studentAvatar}>
                            <Text style={styles.avatarText}>
                              {student.fullName.substring(0, 1).toUpperCase()}
                            </Text>
                          </View>
                          <View style={{ flex: 1 }}>
                            <View style={styles.studentNameRow}>
                              <Text style={styles.studentName}>
                                {student.fullName}
                              </Text>
                              <Badge
                                label={student.readinessLevel || "DEVELOPING"}
                                variant={
                                  student.readinessLevel === "READY"
                                    ? "success"
                                    : "primary"
                                }
                              />
                            </View>
                            <Text style={styles.studentBranch}>
                              {student.branch || "Computer Science"} • Class of{" "}
                              {student.graduationYear || 2027}
                            </Text>
                            <Text style={styles.studentInstitution}>
                              {student.institution || "Engineering College"}
                            </Text>
                          </View>
                        </View>

                        <View style={styles.metricsRow}>
                          <View style={styles.metricItem}>
                            <Text style={styles.metricLabel}>Target Career</Text>
                            <Text style={styles.metricValue}>
                              {student.targetCareerName || "AI Engineer"}
                            </Text>
                          </View>
                          <View style={styles.metricItem}>
                            <Text style={styles.metricLabel}>Readiness Score</Text>
                            <Text
                              style={[
                                styles.metricValue,
                                { color: colors.accent },
                              ]}
                            >
                              {student.careerReadiness != null
                                ? `${student.careerReadiness}%`
                                : "N/A"}
                            </Text>
                          </View>
                          <View style={styles.metricItem}>
                            <Text style={styles.metricLabel}>Completed Modules</Text>
                            <Text style={styles.metricValue}>
                              {student.completedModulesCount} modules
                            </Text>
                          </View>
                        </View>

                        {/* Progress Bar */}
                        <View style={styles.progressWrap}>
                          <View style={styles.progressHeader}>
                            <Text style={styles.progressLabel}>
                              Overall Skill Proficiency
                            </Text>
                            <Text style={styles.progressVal}>
                              {student.overallProficiency || 0}%
                            </Text>
                          </View>
                          <ProgressBar
                            progress={(student.overallProficiency || 0) / 100}
                            color={colors.primary}
                          />
                        </View>

                        {/* Mentor Guidance Note */}
                        {student.mentorNotes ? (
                          <View style={styles.existingNotesBox}>
                            <Text style={styles.existingNotesHeader}>
                              Active Mentor Note:
                            </Text>
                            <Text style={styles.existingNotesText}>
                              "{student.mentorNotes}"
                            </Text>
                          </View>
                        ) : null}

                        {/* Action Buttons */}
                        <View style={styles.cardActions}>
                          <Button
                            title="Inspect Dossier & Advise"
                            onPress={() => handleOpenDossier(student)}
                            size="sm"
                          />
                        </View>
                      </Card>
                    ))}
                  </View>
                ) : (
                  <Card style={styles.emptyCard}>
                    <Text style={styles.emptyIcon}>📋</Text>
                    <Text style={styles.emptyTitle}>No Students Assigned</Text>
                    <Text style={styles.emptySub}>
                      Your mentor account currently has no assigned students in the database.
                      Contact an Administrator to link student cohorts to your profile.
                    </Text>
                  </Card>
                )}
              </>
            )}
          </View>
        </ScrollView>

        {/* Student Dossier & Mentor Advice Modal */}
        <Modal
          visible={dossierModalVisible}
          transparent
          animationType="slide"
          onRequestClose={() => setDossierModalVisible(false)}
        >
          <View style={styles.modalOverlay}>
            <View style={styles.dossierModal}>
              <View style={styles.modalHeader}>
                <View>
                  <Text style={styles.modalTitle}>
                    {selectedStudent?.fullName} • Mentee Dossier
                  </Text>
                  <Text style={styles.modalSub}>
                    {selectedStudent?.branch} • Target Goal:{" "}
                    {selectedStudent?.targetCareerName}
                  </Text>
                </View>
                <TouchableOpacity
                  onPress={() => setDossierModalVisible(false)}
                  style={styles.closeBtn}
                >
                  <Text style={styles.closeBtnText}>✕</Text>
                </TouchableOpacity>
              </View>

              <ScrollView style={styles.dossierScroll}>
                {isDossierLoading ? (
                  <ActivityIndicator
                    size="large"
                    color={colors.primary}
                    style={{ marginVertical: spacing.xl }}
                  />
                ) : (
                  <>
                    {/* Skills Radar Breakdown */}
                    <Text style={styles.dossierSectionHeader}>
                      Assessed Skill Proficiencies
                    </Text>
                    <View style={styles.skillsGrid}>
                      {(studentDossier?.skills || []).map((sk) => (
                        <View key={sk.id} style={styles.skillPillItem}>
                          <View style={styles.skillPillTop}>
                            <Text style={styles.skillPillName}>
                              {sk.skillName}
                            </Text>
                            <Text style={styles.skillPillPct}>
                              {sk.proficiency}%
                            </Text>
                          </View>
                          <ProgressBar
                            progress={sk.proficiency / 100}
                            color={
                              sk.proficiency >= 75
                                ? colors.success
                                : sk.proficiency >= 50
                                ? colors.primary
                                : colors.warning
                            }
                          />
                        </View>
                      ))}
                    </View>

                    {/* Verified Credentials */}
                    <Text style={styles.dossierSectionHeader}>
                      Blockchain Verified Credentials (
                      {studentDossier?.verifiedCredentials?.length || 0})
                    </Text>
                    {(studentDossier?.verifiedCredentials || []).length > 0 ? (
                      <View style={styles.credentialsList}>
                        {studentDossier?.verifiedCredentials.map((cred) => (
                          <View key={cred.id} style={styles.credItem}>
                            <Text style={styles.credTitle}>
                              🏆 {cred.achievementTitle}
                            </Text>
                            <Text style={styles.credHash} numberOfLines={1}>
                              Hash: {cred.achievementDataHash}
                            </Text>
                          </View>
                        ))}
                      </View>
                    ) : (
                      <Text style={styles.noDataText}>
                        No blockchain certificates claimed yet.
                      </Text>
                    )}

                    {/* Mentor Guidance Form */}
                    <Text style={styles.dossierSectionHeader}>
                      Provide Mentor Guidance & Feedback
                    </Text>
                    <Text style={styles.adviceHelper}>
                      Write targeted guidance for this student. It will be immediately
                      accessible on their student dashboard.
                    </Text>

                    <TextInput
                      style={styles.adviceInput}
                      value={feedbackText}
                      onChangeText={setFeedbackText}
                      placeholder="e.g. Focus on mastering PostgreSQL indexing and window functions before attempting the staff-level system design assessment."
                      placeholderTextColor={colors.textMuted}
                      multiline
                      numberOfLines={4}
                    />

                    <Button
                      title={
                        feedbackMutation.isPending
                          ? "Saving Guidance..."
                          : "Save & Transmit Guidance"
                      }
                      onPress={handleSubmitFeedback}
                      loading={feedbackMutation.isPending}
                      size="md"
                      style={{ marginTop: spacing.md }}
                    />
                  </>
                )}
              </ScrollView>
            </View>
          </View>
        </Modal>
      </View>
    </RoleGuard>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  content: {
    padding: spacing.md,
    paddingBottom: spacing.xxl,
  },
  responsiveWrapper: {
    width: "100%",
    maxWidth: 960,
    alignSelf: "center",
  },
  headerBanner: {
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.cardBorder,
    borderRadius: radius.lg,
    padding: spacing.lg,
    marginBottom: spacing.md,
  },
  badgeRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
    marginBottom: spacing.xs,
  },
  headerTagline: {
    color: colors.textMuted,
    fontSize: 12,
    fontWeight: "600",
  },
  title: {
    color: colors.textPrimary,
    fontSize: 24,
    fontWeight: "900",
    letterSpacing: 0.3,
  },
  subtitle: {
    color: colors.textSecondary,
    fontSize: 13,
    marginTop: 4,
    lineHeight: 18,
  },
  successBanner: {
    backgroundColor: "rgba(16, 185, 129, 0.15)",
    borderWidth: 1,
    borderColor: colors.success,
    borderRadius: radius.md,
    padding: spacing.sm,
    marginBottom: spacing.md,
  },
  successBannerText: {
    color: colors.success,
    fontSize: 13,
    fontWeight: "700",
  },
  kpiGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: spacing.sm,
    marginBottom: spacing.lg,
  },
  kpiCard: {
    flex: 1,
    minWidth: 160,
    padding: spacing.md,
    alignItems: "center",
  },
  kpiEmoji: {
    fontSize: 24,
    marginBottom: 4,
  },
  kpiValue: {
    color: colors.textPrimary,
    fontSize: 22,
    fontWeight: "900",
  },
  kpiLabel: {
    color: colors.textMuted,
    fontSize: 11,
    fontWeight: "600",
    marginTop: 2,
    textAlign: "center",
  },
  sectionHeaderRow: {
    marginBottom: spacing.sm,
  },
  sectionTitle: {
    color: colors.textPrimary,
    fontSize: 18,
    fontWeight: "800",
  },
  sectionSubtitle: {
    color: colors.textMuted,
    fontSize: 12,
    marginTop: 2,
  },
  studentsList: {
    gap: spacing.md,
  },
  studentCard: {
    padding: spacing.md,
  },
  studentCardHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.md,
    marginBottom: spacing.md,
  },
  studentAvatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: colors.primary,
    alignItems: "center",
    justifyContent: "center",
  },
  avatarText: {
    color: "#FFF",
    fontSize: 20,
    fontWeight: "800",
  },
  studentNameRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  studentName: {
    color: colors.textPrimary,
    fontSize: 16,
    fontWeight: "700",
  },
  studentBranch: {
    color: colors.textSecondary,
    fontSize: 12,
    marginTop: 2,
  },
  studentInstitution: {
    color: colors.textMuted,
    fontSize: 11,
  },
  metricsRow: {
    flexDirection: "row",
    backgroundColor: colors.surfaceLight,
    borderRadius: radius.md,
    padding: spacing.sm,
    gap: spacing.sm,
    marginBottom: spacing.sm,
  },
  metricItem: {
    flex: 1,
  },
  metricLabel: {
    color: colors.textMuted,
    fontSize: 10,
    fontWeight: "700",
    textTransform: "uppercase",
  },
  metricValue: {
    color: colors.textPrimary,
    fontSize: 13,
    fontWeight: "700",
    marginTop: 2,
  },
  progressWrap: {
    marginBottom: spacing.sm,
  },
  progressHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 4,
  },
  progressLabel: {
    color: colors.textSecondary,
    fontSize: 11,
    fontWeight: "600",
  },
  progressVal: {
    color: colors.textPrimary,
    fontSize: 11,
    fontWeight: "700",
  },
  existingNotesBox: {
    backgroundColor: "rgba(99, 102, 241, 0.1)",
    borderLeftWidth: 3,
    borderLeftColor: colors.primary,
    padding: spacing.sm,
    borderRadius: radius.sm,
    marginBottom: spacing.sm,
  },
  existingNotesHeader: {
    color: colors.primary,
    fontSize: 10,
    fontWeight: "800",
    textTransform: "uppercase",
  },
  existingNotesText: {
    color: colors.textSecondary,
    fontSize: 12,
    marginTop: 2,
    fontStyle: "italic",
  },
  cardActions: {
    flexDirection: "row",
    justifyContent: "flex-end",
    marginTop: spacing.xs,
  },
  emptyCard: {
    padding: spacing.xl,
    alignItems: "center",
  },
  emptyIcon: {
    fontSize: 36,
    marginBottom: spacing.sm,
  },
  emptyTitle: {
    color: colors.textPrimary,
    fontSize: 16,
    fontWeight: "800",
  },
  emptySub: {
    color: colors.textMuted,
    fontSize: 12,
    textAlign: "center",
    marginTop: 4,
    maxWidth: 400,
    lineHeight: 18,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.75)",
    justifyContent: "center",
    alignItems: "center",
    padding: spacing.md,
  },
  dossierModal: {
    width: "100%",
    maxWidth: 680,
    maxHeight: "90%",
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.cardBorder,
    padding: spacing.lg,
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    borderBottomWidth: 1,
    borderBottomColor: colors.cardBorder,
    paddingBottom: spacing.sm,
    marginBottom: spacing.md,
  },
  modalTitle: {
    color: colors.textPrimary,
    fontSize: 18,
    fontWeight: "800",
  },
  modalSub: {
    color: colors.textMuted,
    fontSize: 12,
    marginTop: 2,
  },
  closeBtn: {
    padding: 6,
  },
  closeBtnText: {
    color: colors.textMuted,
    fontSize: 16,
    fontWeight: "700",
  },
  dossierScroll: {
    flex: 1,
  },
  dossierSectionHeader: {
    color: colors.primary,
    fontSize: 12,
    fontWeight: "800",
    textTransform: "uppercase",
    letterSpacing: 0.5,
    marginTop: spacing.md,
    marginBottom: spacing.xs,
  },
  skillsGrid: {
    gap: 8,
    marginBottom: spacing.sm,
  },
  skillPillItem: {
    backgroundColor: colors.background,
    borderRadius: radius.sm,
    padding: 8,
    borderWidth: 1,
    borderColor: colors.cardBorder,
  },
  skillPillTop: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 4,
  },
  skillPillName: {
    color: colors.textPrimary,
    fontSize: 12,
    fontWeight: "600",
  },
  skillPillPct: {
    color: colors.accent,
    fontSize: 12,
    fontWeight: "700",
  },
  credentialsList: {
    gap: 6,
  },
  credItem: {
    backgroundColor: colors.background,
    padding: 8,
    borderRadius: radius.sm,
    borderWidth: 1,
    borderColor: colors.cardBorder,
  },
  credTitle: {
    color: colors.textPrimary,
    fontSize: 13,
    fontWeight: "700",
  },
  credHash: {
    color: colors.textMuted,
    fontSize: 10,
    marginTop: 2,
    fontFamily: "monospace",
  },
  noDataText: {
    color: colors.textMuted,
    fontSize: 12,
    fontStyle: "italic",
    marginVertical: 4,
  },
  adviceHelper: {
    color: colors.textSecondary,
    fontSize: 12,
    marginBottom: spacing.xs,
  },
  adviceInput: {
    backgroundColor: colors.background,
    borderColor: colors.cardBorder,
    borderWidth: 1,
    borderRadius: radius.md,
    padding: spacing.sm,
    color: colors.textPrimary,
    fontSize: 13,
    minHeight: 80,
    textAlignVertical: "top",
  },
});
