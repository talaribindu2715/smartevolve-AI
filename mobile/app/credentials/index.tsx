import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  RefreshControl,
  ActivityIndicator,
  Alert,
  TouchableOpacity,
  Modal,
} from "react-native";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import Svg, { Path } from "react-native-svg";
import { api } from "../../src/api/client";
import { Card } from "../../src/components/Card";
import { Badge } from "../../src/components/Badge";
import { Button } from "../../src/components/Button";
import { Credential, EligibleCredential, VerifyCredentialResponse } from "../../src/types";
import { colors, radius, spacing } from "../../src/theme/colors";

export default function CredentialsScreen() {
  const queryClient = useQueryClient();
  const [verifyingId, setVerifyingId] = useState<string | null>(null);
  const [selectedCredDetail, setSelectedCredDetail] = useState<Credential | null>(null);
  const [verifyResult, setVerifyResult] = useState<VerifyCredentialResponse | null>(null);

  const {
    data: credentials,
    isLoading: isCredsLoading,
    refetch: refetchCreds,
    isRefetching: isCredsRefetching,
  } = useQuery({
    queryKey: ["credentials"],
    queryFn: () => api.getCredentials(),
  });

  const {
    data: eligibleMilestones,
    isLoading: isEligibleLoading,
    refetch: refetchEligible,
  } = useQuery({
    queryKey: ["eligibleCredentials"],
    queryFn: () => api.getEligibleCredentials(),
  });

  const claimMutation = useMutation({
    mutationFn: (milestone: EligibleCredential) =>
      api.claimCredential({
        milestoneId: milestone.milestoneId,
        credentialType: milestone.credentialType,
        title: milestone.title,
        skillId: milestone.skillId,
        skillName: milestone.skillName,
        achievementDataHash: milestone.achievementHash,
      }),
    onSuccess: (newCred) => {
      queryClient.invalidateQueries({ queryKey: ["credentials"] });
      queryClient.invalidateQueries({ queryKey: ["eligibleCredentials"] });
      queryClient.invalidateQueries({ queryKey: ["dashboard"] });
      Alert.alert(
        "Credential Claimed",
        `Achievement '${newCred.achievementTitle}' has been cryptographically recorded!\nStatus: ${newCred.status}`
      );
    },
    onError: (err: any) => {
      Alert.alert("Claim Error", err.message || "Failed to claim credential.");
    },
  });

  const verifyMutation = useMutation({
    mutationFn: (id: string) => api.verifyCredential(id),
    onSuccess: (res) => {
      setVerifyingId(null);
      setVerifyResult(res);
      queryClient.invalidateQueries({ queryKey: ["credentials"] });
      queryClient.invalidateQueries({ queryKey: ["dashboard"] });
    },
    onError: (err: any) => {
      setVerifyingId(null);
      Alert.alert("Verification Error", err.message || "Failed to verify credential.");
    },
  });

  const handleVerify = (credId: string) => {
    setVerifyingId(credId);
    verifyMutation.mutate(credId);
  };

  const copyPublicLink = (cred: Credential) => {
    const link = `https://smartevolve-ai-mobile-sand.vercel.app/credentials?verify=${cred.id}`;
    Alert.alert(
      "Public Verification Link",
      `Anyone with this link can verify this credential without logging in:\n\n${link}`
    );
  };

  const isLoading = isCredsLoading || isEligibleLoading;

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator color={colors.primary} size="large" />
        <Text style={styles.loadingText}>Querying EVM Blockchain Ledger & Eligibility Graph...</Text>
      </View>
    );
  }

  const creds = credentials || [];
  const eligible = eligibleMilestones || [];

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "CONFIRMED":
        return <Badge label="ON-CHAIN CONFIRMED" variant="success" />;
      case "PENDING":
        return <Badge label="SYNCING ON-CHAIN" variant="warning" />;
      case "REVOKED":
        return <Badge label="REVOKED" variant="error" />;
      default:
        return <Badge label={status.replace("_", " ")} variant="info" />;
    }
  };

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.content}
      refreshControl={
        <RefreshControl
          refreshing={isCredsRefetching}
          onRefresh={() => {
            refetchCreds();
            refetchEligible();
          }}
          tintColor={colors.primary}
        />
      }
    >
      {/* Header Info */}
      <View style={styles.header}>
        <Text style={styles.headerTag}>IMMUTABLE ACADEMIC RECORD</Text>
        <Text style={styles.headerTitle}>Verified Credentials</Text>
        <Text style={styles.headerSub}>
          Cryptographically signed skill achievements anchored to smart contracts with public verification capability.
        </Text>
      </View>

      {/* Eligible Milestones to Claim Section */}
      {eligible.length > 0 && (
        <View style={styles.sectionWrap}>
          <Text style={styles.sectionHeading}>🌟 Eligible for Blockchain Claim ({eligible.length})</Text>
          <Text style={styles.sectionSub}>
            You have satisfied the 80%+ mastery threshold for these learning milestones. Anchor them on-chain:
          </Text>

          {eligible.map((item) => (
            <Card key={item.milestoneId} style={styles.eligibleCard}>
              <View style={styles.eligibleTop}>
                <View style={{ flex: 1 }}>
                  <Text style={styles.eligibleTitle}>{item.title}</Text>
                  <Text style={styles.eligibleDesc}>{item.description}</Text>
                </View>
                <Badge label="ELIGIBLE" variant="success" />
              </View>

              <View style={styles.eligibleFooter}>
                <Text style={styles.dataHashPreview} numberOfLines={1}>
                  Hash: {item.achievementHash}
                </Text>
                <TouchableOpacity
                  style={styles.claimBtn}
                  disabled={claimMutation.isPending}
                  onPress={() => claimMutation.mutate(item)}
                >
                  {claimMutation.isPending ? (
                    <ActivityIndicator size="small" color="#FFF" />
                  ) : (
                    <Text style={styles.claimBtnText}>Claim Badge ➔</Text>
                  )}
                </TouchableOpacity>
              </View>
            </Card>
          ))}
        </View>
      )}

      {/* Earned Credentials Section */}
      <View style={styles.sectionWrap}>
        <Text style={styles.sectionHeading}>📜 Earned Credentials & Badges ({creds.length})</Text>

        {creds.length === 0 ? (
          <Card style={styles.emptyCard}>
            <Svg width="56" height="56" viewBox="0 0 24 24" fill="none" stroke={colors.blockchain} strokeWidth="1.5">
              <Path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" />
            </Svg>
            <Text style={styles.emptyTitle}>No Blockchain Credentials Yet</Text>
            <Text style={styles.emptySub}>
              Complete module lessons, score 80%+ on skill assessments, or complete full career roadmaps to earn tamper-evident on-chain credentials.
            </Text>
          </Card>
        ) : (
          <View style={styles.credsList}>
            {creds.map((c) => {
              const isVerifying = verifyingId === c.id;

              return (
                <Card key={c.id} style={styles.credCard}>
                  {/* Top Badge & Title */}
                  <View style={styles.cardTop}>
                    <View style={{ flex: 1 }}>
                      <Text style={styles.credType}>ACADEMIC MILESTONE</Text>
                      <Text style={styles.achievementTitle}>{c.achievementTitle}</Text>
                    </View>
                    {getStatusBadge(c.status)}
                  </View>

                  {/* Metadata Fields */}
                  <View style={styles.metaBox}>
                    <View style={styles.metaRow}>
                      <Text style={styles.metaKey}>Network</Text>
                      <Text style={styles.metaVal}>{c.networkId || "Hardhat EVM Localhost (ChainID: 31337)"}</Text>
                    </View>

                    <View style={styles.metaRow}>
                      <Text style={styles.metaKey}>Block Number</Text>
                      <Text style={styles.metaVal}>#{c.blockNumber || 1}</Text>
                    </View>

                    <View style={styles.metaRow}>
                      <Text style={styles.metaKey}>Smart Contract</Text>
                      <Text style={[styles.metaVal, styles.monoText]} numberOfLines={1}>
                        {c.contractAddress || "0x5FbDB2315678afecb367f032d93F642f64180aa3"}
                      </Text>
                    </View>

                    <View style={styles.metaRow}>
                      <Text style={styles.metaKey}>Transaction Hash</Text>
                      <Text style={[styles.metaVal, styles.monoText]} numberOfLines={1}>
                        {c.transactionHash || "Off-chain verified (EVM standby)"}
                      </Text>
                    </View>

                    <View style={styles.metaRow}>
                      <Text style={styles.metaKey}>SHA-256 Proof</Text>
                      <Text style={[styles.metaVal, styles.monoText]} numberOfLines={1}>
                        {c.achievementDataHash}
                      </Text>
                    </View>

                    <View style={styles.metaRow}>
                      <Text style={styles.metaKey}>Issuer Public Key</Text>
                      <Text style={[styles.metaVal, styles.monoText]} numberOfLines={1}>
                        {c.issuerAddress}
                      </Text>
                    </View>
                  </View>

                  {/* Action Buttons */}
                  <View style={styles.cardActionRow}>
                    <Button
                      title={isVerifying ? "Verifying..." : "Verify on Blockchain"}
                      onPress={() => handleVerify(c.id)}
                      loading={isVerifying}
                      variant="outline"
                      size="sm"
                      style={{ flex: 1 }}
                    />
                    <TouchableOpacity
                      style={styles.shareBtn}
                      onPress={() => copyPublicLink(c)}
                    >
                      <Text style={styles.shareBtnText}>🔗 Public Link</Text>
                    </TouchableOpacity>
                  </View>
                </Card>
              );
            })}
          </View>
        )}
      </View>

      {/* Verification Result Modal */}
      <Modal visible={!!verifyResult} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <Card style={styles.verifyModalCard}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Blockchain Verification Audit</Text>
              <TouchableOpacity onPress={() => setVerifyResult(null)}>
                <Text style={styles.modalCloseText}>✕</Text>
              </TouchableOpacity>
            </View>

            {verifyResult && (
              <View style={styles.modalContent}>
                <View style={[styles.verifyStatusTag, { backgroundColor: verifyResult.valid ? "rgba(16, 185, 129, 0.15)" : "rgba(239, 68, 68, 0.15)" }]}>
                  <Text style={[styles.verifyStatusTagText, { color: verifyResult.valid ? colors.success : colors.error }]}>
                    {verifyResult.valid ? "✓ CRYPTOGRAPHICALLY VALID" : "✗ VERIFICATION FAILED"}
                  </Text>
                </View>

                <Text style={styles.verifyAchievementTitle}>{verifyResult.achievementTitle}</Text>
                <Text style={styles.verifyMsg}>{verifyResult.verificationMessage}</Text>

                <View style={styles.verifyMetaBox}>
                  <Text style={styles.verifyMetaItem}>
                    <Text style={{ fontWeight: "700", color: colors.textPrimary }}>Smart Contract: </Text>
                    {verifyResult.contractAddress}
                  </Text>
                  <Text style={styles.verifyMetaItem}>
                    <Text style={{ fontWeight: "700", color: colors.textPrimary }}>Issuer Authority: </Text>
                    {verifyResult.issuerAddress}
                  </Text>
                  {verifyResult.transactionHash && (
                    <Text style={styles.verifyMetaItem}>
                      <Text style={{ fontWeight: "700", color: colors.textPrimary }}>Transaction Hash: </Text>
                      {verifyResult.transactionHash}
                    </Text>
                  )}
                  {verifyResult.onChainTimestamp && (
                    <Text style={styles.verifyMetaItem}>
                      <Text style={{ fontWeight: "700", color: colors.textPrimary }}>Recorded Timestamp: </Text>
                      {verifyResult.onChainTimestamp}
                    </Text>
                  )}
                </View>

                <Button
                  title="Close Audit"
                  size="sm"
                  onPress={() => setVerifyResult(null)}
                  style={{ marginTop: spacing.md }}
                />
              </View>
            )}
          </Card>
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
  header: {
    marginBottom: spacing.lg,
  },
  headerTag: {
    color: colors.blockchain,
    fontSize: 12,
    fontWeight: "700",
    letterSpacing: 0.5,
  },
  headerTitle: {
    color: colors.textPrimary,
    fontSize: 26,
    fontWeight: "800",
    marginTop: 2,
  },
  headerSub: {
    color: colors.textSecondary,
    fontSize: 13,
    marginTop: 4,
    lineHeight: 18,
  },
  sectionWrap: {
    marginBottom: spacing.lg,
  },
  sectionHeading: {
    color: colors.textPrimary,
    fontSize: 16,
    fontWeight: "800",
    marginBottom: 4,
  },
  sectionSub: {
    color: colors.textMuted,
    fontSize: 12,
    marginBottom: spacing.sm,
    lineHeight: 16,
  },
  eligibleCard: {
    padding: spacing.md,
    marginBottom: spacing.sm,
    backgroundColor: "rgba(16, 185, 129, 0.06)",
    borderColor: "rgba(16, 185, 129, 0.3)",
    borderWidth: 1,
  },
  eligibleTop: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 6,
  },
  eligibleTitle: {
    color: colors.textPrimary,
    fontSize: 15,
    fontWeight: "700",
  },
  eligibleDesc: {
    color: colors.textSecondary,
    fontSize: 12,
    marginTop: 2,
  },
  eligibleFooter: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: 6,
    paddingTop: 6,
    borderTopColor: colors.cardBorder,
    borderTopWidth: 1,
  },
  dataHashPreview: {
    color: colors.textMuted,
    fontSize: 10,
    fontFamily: "monospace",
    flex: 1,
    marginRight: 8,
  },
  claimBtn: {
    backgroundColor: colors.success,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: radius.sm,
  },
  claimBtnText: {
    color: "#FFFFFF",
    fontSize: 12,
    fontWeight: "800",
  },
  credsList: {
    gap: spacing.md,
  },
  credCard: {
    padding: spacing.md,
    borderColor: colors.blockchainBorder,
    borderWidth: 1.5,
  },
  cardTop: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: spacing.sm,
  },
  credType: {
    color: colors.blockchain,
    fontSize: 11,
    fontWeight: "700",
    letterSpacing: 0.5,
  },
  achievementTitle: {
    color: colors.textPrimary,
    fontSize: 18,
    fontWeight: "800",
    marginTop: 2,
  },
  metaBox: {
    backgroundColor: colors.surface,
    borderRadius: radius.md,
    padding: spacing.sm,
    gap: 6,
    marginBottom: spacing.sm,
  },
  metaRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  metaKey: {
    color: colors.textMuted,
    fontSize: 12,
  },
  metaVal: {
    color: colors.textPrimary,
    fontSize: 12,
    fontWeight: "600",
    maxWidth: "60%",
    textAlign: "right",
  },
  monoText: {
    fontFamily: "monospace",
    fontSize: 11,
    color: colors.accent,
  },
  cardActionRow: {
    flexDirection: "row",
    gap: spacing.sm,
    alignItems: "center",
  },
  shareBtn: {
    backgroundColor: "transparent",
    borderWidth: 1,
    borderColor: colors.cardBorder,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: radius.sm,
  },
  shareBtnText: {
    color: colors.textSecondary,
    fontSize: 12,
    fontWeight: "600",
  },
  emptyCard: {
    alignItems: "center",
    padding: spacing.xl,
    gap: spacing.sm,
  },
  emptyTitle: {
    color: colors.textPrimary,
    fontSize: 18,
    fontWeight: "700",
    marginTop: spacing.xs,
  },
  emptySub: {
    color: colors.textMuted,
    fontSize: 13,
    textAlign: "center",
    lineHeight: 20,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.75)",
    justifyContent: "center",
    padding: spacing.md,
  },
  verifyModalCard: {
    padding: spacing.lg,
    backgroundColor: colors.surface,
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: spacing.md,
  },
  modalTitle: {
    color: colors.textPrimary,
    fontSize: 17,
    fontWeight: "800",
  },
  modalCloseText: {
    color: colors.textMuted,
    fontSize: 18,
    fontWeight: "700",
  },
  modalContent: {
    gap: spacing.sm,
  },
  verifyStatusTag: {
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: radius.sm,
    alignSelf: "flex-start",
  },
  verifyStatusTagText: {
    fontSize: 12,
    fontWeight: "800",
    letterSpacing: 0.5,
  },
  verifyAchievementTitle: {
    color: colors.textPrimary,
    fontSize: 18,
    fontWeight: "800",
  },
  verifyMsg: {
    color: colors.textSecondary,
    fontSize: 13,
    lineHeight: 18,
  },
  verifyMetaBox: {
    backgroundColor: colors.background,
    borderColor: colors.cardBorder,
    borderWidth: 1,
    borderRadius: radius.sm,
    padding: spacing.sm,
    gap: 6,
    marginVertical: 4,
  },
  verifyMetaItem: {
    color: colors.textSecondary,
    fontSize: 11,
    lineHeight: 16,
  },
});
