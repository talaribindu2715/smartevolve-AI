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
import { useQuery, useMutation } from "@tanstack/react-query";
import { api } from "../../src/api/client";
import { RoleNavBar } from "../../src/components/RoleNavBar";
import { RoleGuard } from "../../src/components/RoleGuard";
import { Card } from "../../src/components/Card";
import { Button } from "../../src/components/Button";
import { Badge } from "../../src/components/Badge";
import { ProgressBar } from "@/components/ProgressBar";
import { CardSkeleton } from "../../src/components/Skeleton";
import { ErrorBanner } from "../../src/components/ErrorBanner";
import {
  CandidateSummary,
  CandidateDossier,
  VerifyCredentialResponse,
} from "../../src/types";
import { colors, radius, spacing } from "../../src/theme/colors";

export default function RecruiterDashboardScreen() {
  const [selectedCandidate, setSelectedCandidate] = useState<CandidateSummary | null>(null);
  const [dossierModalVisible, setDossierModalVisible] = useState(false);
  const [verifyModalVisible, setVerifyModalVisible] = useState(false);
  const [manualVerifyId, setManualVerifyId] = useState("");
  const [verificationResult, setVerificationResult] = useState<VerifyCredentialResponse | null>(null);

  const {
    data: dashboard,
    isLoading: isDashLoading,
    isError: isDashError,
    error: dashError,
    refetch: refetchDash,
  } = useQuery({
    queryKey: ["recruiterDashboard"],
    queryFn: () => api.getRecruiterDashboard(),
  });

  const {
    data: candidateDossier,
    isLoading: isDossierLoading,
  } = useQuery({
    queryKey: ["candidateDossier", selectedCandidate?.studentId],
    queryFn: () =>
      selectedCandidate
        ? api.getCandidateDossier(selectedCandidate.studentId)
        : null,
    enabled: !!selectedCandidate && dossierModalVisible,
  });

  const verifyMutation = useMutation({
    mutationFn: (credId: string) => api.verifyRecruiterCertificate(credId),
    onSuccess: (result) => {
      setVerificationResult(result);
    },
    onError: (err: any) => {
      Alert.alert("Verification Error", err.message || "Failed to verify credential on blockchain.");
    },
  });

  const handleOpenDossier = (c: CandidateSummary) => {
    setSelectedCandidate(c);
    setDossierModalVisible(true);
  };

  const handleOpenVerifier = (c?: CandidateSummary) => {
    setVerificationResult(null);
    setManualVerifyId(c ? c.studentId : "");
    setVerifyModalVisible(true);
  };

  const handleRunVerification = () => {
    if (!manualVerifyId.trim()) {
      Alert.alert("Input Required", "Please enter a credential UUID to verify on-chain.");
      return;
    }
    verifyMutation.mutate(manualVerifyId.trim());
  };

  return (
    <RoleGuard allowedRoles={["RECRUITER", "EMPLOYER", "ADMIN"]}>
      <View style={styles.container}>
        <RoleNavBar currentTab="Talent Pipeline" />

        <ScrollView contentContainerStyle={styles.content}>
          <View style={styles.responsiveWrapper}>
            {/* Header Banner */}
            <View style={styles.headerBanner}>
              <View>
                <View style={styles.badgeRow}>
                  <Badge label="RECRUITER / TALENT PARTNER" variant="warning" />
                  <Text style={styles.headerTagline}>
                    Restricted to Shared Candidates
                  </Text>
                </View>
                <Text style={styles.title}>Talent Discovery Pipeline</Text>
                <Text style={styles.subtitle}>
                  Access candidate dossiers explicitly shared with your talent organization
                  and verify tamper-evident blockchain credentials.
                </Text>
              </View>
            </View>

            {isDashError && (
              <ErrorBanner
                message={
                  dashError instanceof Error
                    ? dashError.message
                    : "Failed to load recruiter telemetry."
                }
                onRetry={refetchDash}
              />
            )}

            {isDashLoading ? (
              <View style={{ gap: spacing.md }}>
                <CardSkeleton height={110} />
                <CardSkeleton height={200} />
              </View>
            ) : (
              <>
                {/* KPI Metrics */}
                <View style={styles.kpiGrid}>
                  <Card style={styles.kpiCard}>
                    <Text style={styles.kpiEmoji}>🎯</Text>
                    <Text style={styles.kpiValue}>
                      {dashboard?.sharedCandidatesCount || 0}
                    </Text>
                    <Text style={styles.kpiLabel}>Accessible Candidates</Text>
                  </Card>

                  <Card style={styles.kpiCard}>
                    <Text style={styles.kpiEmoji}>🏆</Text>
                    <Text style={[styles.kpiValue, { color: colors.accent }]}>
                      {dashboard?.verifiedCredentialsCount || 0}
                    </Text>
                    <Text style={styles.kpiLabel}>Verified Credentials</Text>
                  </Card>

                  <Card style={styles.kpiCard}>
                    <Text style={styles.kpiEmoji}>🔗</Text>
                    <Text style={[styles.kpiValue, { color: colors.primary }]}>
                      EVM Hardhat
                    </Text>
                    <Text style={styles.kpiLabel}>Blockchain Network</Text>
                  </Card>

                  <Card style={styles.kpiCard}>
                    <Text style={styles.kpiEmoji}>🛡️</Text>
                    <Text style={[styles.kpiValue, { color: colors.success }]}>
                      RLS Protected
                    </Text>
                    <Text style={styles.kpiLabel}>Candidate Privacy Status</Text>
                  </Card>
                </View>

                {/* Shared Candidates List */}
                <View style={styles.sectionHeaderRow}>
                  <View>
                    <Text style={styles.sectionTitle}>
                      Shared Candidate Pipeline (
                      {dashboard?.candidates?.length || 0})
                    </Text>
                    <Text style={styles.sectionSubtitle}>
                      Student profiles and blockchain credentials explicitly shared with your account.
                    </Text>
                  </View>
                  <Button
                    title="🔍 Verify Credential"
                    onPress={() => handleOpenVerifier()}
                    variant="outline"
                    size="sm"
                  />
                </View>

                {dashboard?.candidates && dashboard.candidates.length > 0 ? (
                  <View style={styles.candidatesList}>
                    {dashboard.candidates.map((candidate) => (
                      <Card key={candidate.studentId} style={styles.candidateCard}>
                        <View style={styles.candidateCardHeader}>
                          <View style={styles.candidateAvatar}>
                            <Text style={styles.avatarText}>
                              {candidate.fullName.substring(0, 1).toUpperCase()}
                            </Text>
                          </View>
                          <View style={{ flex: 1 }}>
                            <View style={styles.nameRow}>
                              <Text style={styles.candidateName}>
                                {candidate.fullName}
                              </Text>
                              <Badge
                                label={candidate.readinessLevel || "DEVELOPING"}
                                variant={
                                  candidate.readinessLevel === "READY"
                                    ? "success"
                                    : "primary"
                                }
                              />
                            </View>
                            <Text style={styles.candidateSub}>
                              {candidate.branch} • {candidate.institution}
                            </Text>
                            <Text style={styles.gradText}>
                              Graduating {candidate.graduationYear || 2027}
                            </Text>
                          </View>
                        </View>

                        <View style={styles.metricsBox}>
                          <View style={styles.metricItem}>
                            <Text style={styles.metricLabel}>Target Role</Text>
                            <Text style={styles.metricValue}>
                              {candidate.targetCareerName || "Staff AI Engineer"}
                            </Text>
                          </View>
                          <View style={styles.metricItem}>
                            <Text style={styles.metricLabel}>Career Readiness</Text>
                            <Text
                              style={[
                                styles.metricValue,
                                { color: colors.accent },
                              ]}
                            >
                              {candidate.careerReadiness != null
                                ? `${candidate.careerReadiness}%`
                                : "N/A"}
                            </Text>
                          </View>
                          <View style={styles.metricItem}>
                            <Text style={styles.metricLabel}>Blockchain Proofs</Text>
                            <Text style={styles.metricValue}>
                              {candidate.verifiedCredentialsCount} verified
                            </Text>
                          </View>
                        </View>

                        {/* Top Skills Chips */}
                        {candidate.topSkills && candidate.topSkills.length > 0 ? (
                          <View style={styles.skillsChipsWrap}>
                            {candidate.topSkills.map((sk) => (
                              <View key={sk.id} style={styles.skillChip}>
                                <Text style={styles.skillChipName}>
                                  {sk.skillName}
                                </Text>
                                <Text style={styles.skillChipProf}>
                                  {sk.proficiency}%
                                </Text>
                              </View>
                            ))}
                          </View>
                        ) : null}

                        {/* Candidate Share Note */}
                        {candidate.shareNotes ? (
                          <View style={styles.shareNoteBox}>
                            <Text style={styles.shareNoteHeader}>
                              Candidate Note:
                            </Text>
                            <Text style={styles.shareNoteText}>
                              "{candidate.shareNotes}"
                            </Text>
                          </View>
                        ) : null}

                        {/* Actions */}
                        <View style={styles.candidateActions}>
                          <Button
                            title="Inspect Candidate Dossier"
                            onPress={() => handleOpenDossier(candidate)}
                            size="sm"
                          />
                        </View>
                      </Card>
                    ))}
                  </View>
                ) : (
                  <Card style={styles.emptyCard}>
                    <Text style={styles.emptyIcon}>📭</Text>
                    <Text style={styles.emptyTitle}>
                      No Shared Candidates Yet
                    </Text>
                    <Text style={styles.emptySub}>
                      Students maintain complete privacy over their learning data. Once a
                      student explicitly shares their profile with your recruiter ID, their
                      verified dossier and cryptographic proofs will appear here.
                    </Text>
                  </Card>
                )}
              </>
            )}
          </View>
        </ScrollView>

        {/* Candidate Dossier Modal */}
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
                    {selectedCandidate?.fullName} • Candidate Dossier
                  </Text>
                  <Text style={styles.modalSub}>
                    {selectedCandidate?.branch} • {selectedCandidate?.institution}
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
                    <Text style={styles.dossierSectionHeader}>
                      Academic & Engineering Objectives
                    </Text>
                    <Text style={styles.dossierBodyText}>
                      {candidateDossier?.academicGoals ||
                        "Master cloud-native AI pipelines and distributed systems."}
                    </Text>

                    <Text style={styles.dossierSectionHeader}>
                      Assessed Technical Proficiencies
                    </Text>
                    <View style={styles.skillsGrid}>
                      {(candidateDossier?.skills || []).map((sk) => (
                        <View key={sk.id} style={styles.skillItem}>
                          <View style={styles.skillItemTop}>
                            <Text style={styles.skillItemName}>
                              {sk.skillName}
                            </Text>
                            <Text style={styles.skillItemPct}>
                              {sk.proficiency}%
                            </Text>
                          </View>
                          <ProgressBar
                            progress={sk.proficiency / 100}
                            color={colors.primary}
                          />
                        </View>
                      ))}
                    </View>

                    <Text style={styles.dossierSectionHeader}>
                      Blockchain Anchored Credentials
                    </Text>
                    {(candidateDossier?.verifiedCredentials || []).length > 0 ? (
                      <View style={styles.credsList}>
                        {candidateDossier?.verifiedCredentials.map((c) => (
                          <View key={c.id} style={styles.credCard}>
                            <View style={styles.credTop}>
                              <Text style={styles.credName}>
                                🏆 {c.achievementTitle}
                              </Text>
                              <Badge label="VERIFIED" variant="success" />
                            </View>
                            <Text style={styles.credHash} numberOfLines={1}>
                              Hash: {c.achievementDataHash}
                            </Text>
                            <Text style={styles.credIssuer} numberOfLines={1}>
                              Issuer Contract: {c.contractAddress}
                            </Text>
                            <Button
                              title="Verify Proof on EVM"
                              onPress={() => {
                                setDossierModalVisible(false);
                                setManualVerifyId(c.id);
                                setVerifyModalVisible(true);
                                verifyMutation.mutate(c.id);
                              }}
                              variant="outline"
                              size="sm"
                              style={{ marginTop: 6 }}
                            />
                          </View>
                        ))}
                      </View>
                    ) : (
                      <Text style={styles.noDataText}>
                        No blockchain credentials claimed yet.
                      </Text>
                    )}
                  </>
                )}
              </ScrollView>
            </View>
          </View>
        </Modal>

        {/* Certificate Verifier Tool Modal */}
        <Modal
          visible={verifyModalVisible}
          transparent
          animationType="fade"
          onRequestClose={() => setVerifyModalVisible(false)}
        >
          <TouchableOpacity
            style={styles.modalOverlay}
            activeOpacity={1}
            onPress={() => setVerifyModalVisible(false)}
          >
            <View style={styles.verifyModal} onStartShouldSetResponder={() => true}>
              <View style={styles.modalHeader}>
                <View>
                  <Text style={styles.modalTitle}>
                    Blockchain Certificate Verifier
                  </Text>
                  <Text style={styles.modalSub}>
                    Cryptographic audit against EVM smart contract
                  </Text>
                </View>
                <TouchableOpacity
                  onPress={() => setVerifyModalVisible(false)}
                  style={styles.closeBtn}
                >
                  <Text style={styles.closeBtnText}>✕</Text>
                </TouchableOpacity>
              </View>

              <Text style={styles.inputLabel}>Credential ID / Hash</Text>
              <TextInput
                style={styles.verifyInput}
                value={manualVerifyId}
                onChangeText={setManualVerifyId}
                placeholder="Enter Credential UUID..."
                placeholderTextColor={colors.textMuted}
              />

              <Button
                title={
                  verifyMutation.isPending
                    ? "Auditing Blockchain Proof..."
                    : "Audit Proof on EVM"
                }
                onPress={handleRunVerification}
                loading={verifyMutation.isPending}
                size="md"
                style={{ marginTop: spacing.sm }}
              />

              {verificationResult && (
                <View style={styles.verifyResultBox}>
                  <View style={styles.resultBadgeRow}>
                    <Text style={styles.resultTitle}>
                      {verificationResult.valid ? "✓ CRYPTOGRAPHICALLY VALID" : "❌ VERIFICATION FAILED"}
                    </Text>
                    <Badge
                      label={verificationResult.valid ? "VERIFIED" : "TAMPERED"}
                      variant={verificationResult.valid ? "success" : "error"}
                    />
                  </View>

                  <View style={styles.resultDetails}>
                    <Text style={styles.resultDetailItem}>
                      <Text style={styles.resKey}>Achievement: </Text>
                      {verificationResult.achievementTitle || "Academic Skill Milestone"}
                    </Text>
                    <Text style={styles.resultDetailItem}>
                      <Text style={styles.resKey}>Network: </Text>
                      {verificationResult.networkId || "Hardhat EVM Local (31337)"}
                    </Text>
                    <Text style={styles.resultDetailItem} numberOfLines={1}>
                      <Text style={styles.resKey}>Contract: </Text>
                      {verificationResult.contractAddress}
                    </Text>
                    <Text style={styles.resultDetailItem} numberOfLines={1}>
                      <Text style={styles.resKey}>Tx Hash: </Text>
                      {verificationResult.transactionHash}
                    </Text>
                    <Text style={styles.resultDetailItem} numberOfLines={1}>
                      <Text style={styles.resKey}>Data Hash: </Text>
                      {verificationResult.achievementDataHash}
                    </Text>
                  </View>
                </View>
              )}
            </View>
          </TouchableOpacity>
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
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
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
  candidatesList: {
    gap: spacing.md,
  },
  candidateCard: {
    padding: spacing.md,
  },
  candidateCardHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.md,
    marginBottom: spacing.sm,
  },
  candidateAvatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: colors.secondary,
    alignItems: "center",
    justifyContent: "center",
  },
  avatarText: {
    color: "#FFF",
    fontSize: 20,
    fontWeight: "800",
  },
  nameRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  candidateName: {
    color: colors.textPrimary,
    fontSize: 16,
    fontWeight: "700",
  },
  candidateSub: {
    color: colors.textSecondary,
    fontSize: 12,
    marginTop: 2,
  },
  gradText: {
    color: colors.textMuted,
    fontSize: 11,
  },
  metricsBox: {
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
  skillsChipsWrap: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 6,
    marginBottom: spacing.sm,
  },
  skillChip: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    backgroundColor: colors.surfaceLight,
    borderWidth: 1,
    borderColor: colors.cardBorder,
    borderRadius: radius.full,
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  skillChipName: {
    color: colors.textSecondary,
    fontSize: 11,
    fontWeight: "600",
  },
  skillChipProf: {
    color: colors.accent,
    fontSize: 11,
    fontWeight: "700",
  },
  shareNoteBox: {
    backgroundColor: "rgba(168, 85, 247, 0.1)",
    borderLeftWidth: 3,
    borderLeftColor: colors.secondary,
    padding: spacing.sm,
    borderRadius: radius.sm,
    marginBottom: spacing.sm,
  },
  shareNoteHeader: {
    color: colors.secondary,
    fontSize: 10,
    fontWeight: "800",
    textTransform: "uppercase",
  },
  shareNoteText: {
    color: colors.textSecondary,
    fontSize: 12,
    marginTop: 2,
    fontStyle: "italic",
  },
  candidateActions: {
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
    maxWidth: 420,
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
  dossierBodyText: {
    color: colors.textSecondary,
    fontSize: 13,
    lineHeight: 18,
  },
  skillsGrid: {
    gap: 8,
    marginBottom: spacing.sm,
  },
  skillItem: {
    backgroundColor: colors.background,
    borderRadius: radius.sm,
    padding: 8,
    borderWidth: 1,
    borderColor: colors.cardBorder,
  },
  skillItemTop: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 4,
  },
  skillItemName: {
    color: colors.textPrimary,
    fontSize: 12,
    fontWeight: "600",
  },
  skillItemPct: {
    color: colors.accent,
    fontSize: 12,
    fontWeight: "700",
  },
  credsList: {
    gap: 8,
  },
  credCard: {
    backgroundColor: colors.background,
    padding: spacing.sm,
    borderRadius: radius.sm,
    borderWidth: 1,
    borderColor: colors.cardBorder,
  },
  credTop: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 4,
  },
  credName: {
    color: colors.textPrimary,
    fontSize: 13,
    fontWeight: "700",
  },
  credHash: {
    color: colors.textMuted,
    fontSize: 10,
    fontFamily: "monospace",
  },
  credIssuer: {
    color: colors.textMuted,
    fontSize: 10,
    fontFamily: "monospace",
    marginTop: 2,
  },
  noDataText: {
    color: colors.textMuted,
    fontSize: 12,
    fontStyle: "italic",
    marginVertical: 4,
  },
  verifyModal: {
    width: "100%",
    maxWidth: 500,
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.cardBorder,
    padding: spacing.lg,
  },
  inputLabel: {
    color: colors.textSecondary,
    fontSize: 12,
    fontWeight: "700",
    marginBottom: 4,
  },
  verifyInput: {
    backgroundColor: colors.background,
    borderWidth: 1,
    borderColor: colors.cardBorder,
    borderRadius: radius.md,
    paddingHorizontal: spacing.sm,
    paddingVertical: 8,
    color: colors.textPrimary,
    fontSize: 13,
    fontFamily: "monospace",
  },
  verifyResultBox: {
    marginTop: spacing.md,
    backgroundColor: colors.background,
    borderRadius: radius.md,
    padding: spacing.md,
    borderWidth: 1,
    borderColor: colors.cardBorder,
  },
  resultBadgeRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: spacing.xs,
  },
  resultTitle: {
    color: colors.success,
    fontSize: 12,
    fontWeight: "800",
  },
  resultDetails: {
    gap: 4,
    marginTop: 4,
  },
  resultDetailItem: {
    color: colors.textSecondary,
    fontSize: 11,
    fontFamily: "monospace",
  },
  resKey: {
    color: colors.textMuted,
    fontWeight: "700",
  },
});
