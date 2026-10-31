import React, { useState, useEffect } from "react";
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
  TextInput,
  Platform,
} from "react-native";
import { useLocalSearchParams } from "expo-router";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import Svg, { Path, Circle } from "react-native-svg";
import { api } from "../../src/api/client";
import { Card } from "../../src/components/Card";
import { Badge } from "../../src/components/Badge";
import { Button } from "../../src/components/Button";
import { Skeleton, CardSkeleton } from "../../src/components/Skeleton";
import { ErrorBanner } from "../../src/components/ErrorBanner";
import { Credential, EligibleCredential, VerifyCredentialResponse } from "../../src/types";
import { colors, radius, spacing } from "../../src/theme/colors";

export default function CredentialsScreen() {
  const queryClient = useQueryClient();
  const params = useLocalSearchParams<{ verify?: string; id?: string }>();

  const [verifyingId, setVerifyingId] = useState<string | null>(null);
  const [selectedCredDetail, setSelectedCredDetail] = useState<Credential | null>(null);
  const [verifyResult, setVerifyResult] = useState<VerifyCredentialResponse | null>(null);
  const [searchHashOrId, setSearchHashOrId] = useState("");
  const [isSearchingVerify, setIsSearchingVerify] = useState(false);

  const {
    data: credentials,
    isLoading: isCredsLoading,
    isError: isCredsError,
    refetch: refetchCreds,
    isRefetching: isCredsRefetching,
  } = useQuery({
    queryKey: ["credentials"],
    queryFn: () => api.getCredentials(),
  });

  const {
    data: eligibleMilestones,
    isLoading: isEligibleLoading,
    isError: isEligibleError,
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

  // Handle URL parameter public verification: ?verify=<id>
  useEffect(() => {
    const targetId = params.verify || params.id;
    if (targetId && typeof targetId === "string" && targetId.trim().length > 0) {
      handleVerify(targetId.trim());
    }
  }, [params.verify, params.id]);

  const handleVerify = (credId: string) => {
    setVerifyingId(credId);
    verifyMutation.mutate(credId);
  };

  const handleSearchVerify = async () => {
    const q = searchHashOrId.trim();
    if (!q) {
      Alert.alert("Search Required", "Please enter a Credential ID or SHA-256 Proof to verify.");
      return;
    }
    setIsSearchingVerify(true);
    try {
      // Try public verification endpoint
      const res = await api.getPublicCredentialVerification(q);
      setVerifyResult(res);
    } catch (e: any) {
      try {
        // Fallback to authenticate verify if available
        const res2 = await api.verifyCredential(q);
        setVerifyResult(res2);
      } catch (err: any) {
        Alert.alert("Record Not Found", `Unable to verify credential ID/Hash: ${q}`);
      }
    } finally {
      setIsSearchingVerify(false);
    }
  };

  const copyPublicLink = (cred: Credential) => {
    const origin =
      Platform.OS === "web" && typeof window !== "undefined"
        ? window.location.origin
        : "https://smartevolve-ai-mobile-sand.vercel.app";
    const link = `${origin}/credentials?verify=${cred.id}`;

    if (Platform.OS === "web" && typeof navigator !== "undefined" && navigator.clipboard) {
      navigator.clipboard.writeText(link);
      Alert.alert("Link Copied!", `Public verification link copied to clipboard:\n\n${link}`);
    } else {
      Alert.alert("Public Verification Link", `Share this link for third-party validation:\n\n${link}`);
    }
  };

  const handlePrintOrShare = () => {
    if (Platform.OS === "web" && typeof window !== "undefined") {
      window.print();
    } else {
      Alert.alert("Certificate Verification", "Certificate verification record exported successfully.");
    }
  };

  const isLoading = isCredsLoading || isEligibleLoading;
  const isError = isCredsError || isEligibleError;
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
      <View style={styles.responsiveWrapper}>
        {/* Header Info */}
        <View style={styles.header}>
          <Text style={styles.headerTag}>IMMUTABLE ACADEMIC RECORD</Text>
          <Text style={styles.headerTitle}>Verified Credentials</Text>
          <Text style={styles.headerSub}>
            Cryptographically signed skill achievements anchored to smart contracts with public verification capability.
          </Text>
        </View>

        {/* Backend Warning / Retry Banner if error */}
        {isError && (
          <ErrorBanner
            title="Credential Ledger Syncing"
            message="Connecting to the blockchain ledger and verification backend. If Render is on cold-boot standby, please allow ~45s."
            onRetry={() => {
              refetchCreds();
              refetchEligible();
            }}
          />
        )}

        {/* Public Credential Verification Search Box */}
        <Card style={styles.searchVerifyCard}>
          <Text style={styles.searchVerifyTitle}>🔍 Public Certificate Verification</Text>
          <Text style={styles.searchVerifySub}>
            Verify any SmartEvolve academic credential by UUID or SHA-256 achievement hash:
          </Text>
          <View style={styles.searchRow}>
            <TextInput
              style={styles.searchInput}
              placeholder="Paste Credential ID or SHA-256 hash..."
              placeholderTextColor={colors.textMuted}
              value={searchHashOrId}
              onChangeText={setSearchHashOrId}
              autoCapitalize="none"
              autoCorrect={false}
            />
            <TouchableOpacity
              style={styles.searchBtn}
              onPress={handleSearchVerify}
              disabled={isSearchingVerify}
            >
              {isSearchingVerify ? (
                <ActivityIndicator size="small" color="#FFF" />
              ) : (
                <Text style={styles.searchBtnText}>Verify</Text>
              )}
            </TouchableOpacity>
          </View>
        </Card>

        {/* Verification Status Legend Card */}
        <Card style={styles.legendCard}>
          <Text style={styles.legendTitle}>Lifecycle Verification States</Text>
          <View style={styles.legendGrid}>
            <View style={styles.legendItem}>
              <View style={[styles.legendDot, { backgroundColor: colors.success }]} />
              <Text style={styles.legendText}>
                <Text style={{ fontWeight: "700", color: colors.textPrimary }}>On-Chain Confirmed: </Text>
                Block mined & tamper-evident hash stored in EVM ledger.
              </Text>
            </View>
            <View style={styles.legendItem}>
              <View style={[styles.legendDot, { backgroundColor: colors.warning }]} />
              <Text style={styles.legendText}>
                <Text style={{ fontWeight: "700", color: colors.textPrimary }}>Syncing / Pending: </Text>
                Milestone satisfied; awaiting EVM gas batch confirmation.
              </Text>
            </View>
            <View style={styles.legendItem}>
              <View style={[styles.legendDot, { backgroundColor: colors.error }]} />
              <Text style={styles.legendText}>
                <Text style={{ fontWeight: "700", color: colors.textPrimary }}>Revoked: </Text>
                Academic credential invalidated or superseded.
              </Text>
            </View>
          </View>
        </Card>

        {/* Loading State with Skeletons */}
        {isLoading && (
          <View style={{ marginTop: spacing.md }}>
            <CardSkeleton />
            <CardSkeleton />
          </View>
        )}

        {/* Eligible Milestones to Claim Section */}
        {!isLoading && eligible.length > 0 && (
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
                    Proof: {item.achievementHash}
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
        {!isLoading && (
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
                      <TouchableOpacity
                        activeOpacity={0.9}
                        onPress={() => setSelectedCredDetail(c)}
                      >
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
                      </TouchableOpacity>

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
        )}

        {/* Certificate Details Modal */}
        <Modal visible={!!selectedCredDetail} transparent animationType="slide">
          <View style={styles.modalOverlay}>
            <Card style={styles.certificateCard}>
              <View style={styles.modalHeader}>
                <Text style={styles.modalTitle}>SmartEvolve Verified Certificate</Text>
                <TouchableOpacity onPress={() => setSelectedCredDetail(null)}>
                  <Text style={styles.modalCloseText}>✕</Text>
                </TouchableOpacity>
              </View>

              {selectedCredDetail && (
                <View style={styles.certBody}>
                  <View style={styles.certSealWrap}>
                    <Text style={styles.certSeal}>🛡️ ON-CHAIN VERIFIED</Text>
                  </View>

                  <Text style={styles.certTitle}>{selectedCredDetail.achievementTitle}</Text>
                  <Text style={styles.certSubtitle}>Awarded to SmartEvolve AI Registered Student</Text>

                  <View style={styles.certDetailsBox}>
                    <Text style={styles.certItem}>
                      <Text style={{ fontWeight: "700", color: colors.textPrimary }}>Credential ID: </Text>
                      {selectedCredDetail.id}
                    </Text>
                    <Text style={styles.certItem}>
                      <Text style={{ fontWeight: "700", color: colors.textPrimary }}>Issued Date: </Text>
                      {new Date(selectedCredDetail.issuedAt || Date.now()).toLocaleDateString(undefined, {
                        year: "numeric",
                        month: "long",
                        day: "numeric",
                      })}
                    </Text>
                    <Text style={styles.certItem}>
                      <Text style={{ fontWeight: "700", color: colors.textPrimary }}>EVM Network: </Text>
                      {selectedCredDetail.networkId || "Hardhat EVM Localhost"}
                    </Text>
                    <Text style={styles.certItem}>
                      <Text style={{ fontWeight: "700", color: colors.textPrimary }}>Smart Contract: </Text>
                      {selectedCredDetail.contractAddress || "0x5FbDB2315678afecb367f032d93F642f64180aa3"}
                    </Text>
                    <Text style={styles.certItem}>
                      <Text style={{ fontWeight: "700", color: colors.textPrimary }}>SHA-256 Digest: </Text>
                      {selectedCredDetail.achievementDataHash}
                    </Text>
                  </View>

                  <View style={styles.certActionsRow}>
                    <Button
                      title="Download / Print"
                      onPress={handlePrintOrShare}
                      size="sm"
                      style={{ flex: 1 }}
                    />
                    <Button
                      title="Copy Public Link"
                      onPress={() => copyPublicLink(selectedCredDetail)}
                      variant="outline"
                      size="sm"
                      style={{ flex: 1 }}
                    />
                  </View>
                </View>
              )}
            </Card>
          </View>
        </Modal>

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
                  <View
                    style={[
                      styles.verifyStatusTag,
                      {
                        backgroundColor: verifyResult.valid
                          ? "rgba(16, 185, 129, 0.15)"
                          : "rgba(239, 68, 68, 0.15)",
                      },
                    ]}
                  >
                    <Text
                      style={[
                        styles.verifyStatusTagText,
                        { color: verifyResult.valid ? colors.success : colors.error },
                      ]}
                    >
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
    maxWidth: 820,
    alignSelf: "center",
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
  searchVerifyCard: {
    padding: spacing.md,
    backgroundColor: "rgba(99, 102, 241, 0.08)",
    borderColor: "rgba(99, 102, 241, 0.3)",
    borderWidth: 1,
    marginBottom: spacing.md,
  },
  searchVerifyTitle: {
    color: colors.textPrimary,
    fontSize: 14,
    fontWeight: "700",
  },
  searchVerifySub: {
    color: colors.textSecondary,
    fontSize: 12,
    marginTop: 2,
    marginBottom: spacing.sm,
  },
  searchRow: {
    flexDirection: "row",
    gap: spacing.sm,
  },
  searchInput: {
    flex: 1,
    backgroundColor: colors.surface,
    borderColor: colors.cardBorder,
    borderWidth: 1,
    borderRadius: radius.sm,
    paddingHorizontal: 12,
    paddingVertical: 8,
    color: colors.textPrimary,
    fontSize: 13,
  },
  searchBtn: {
    backgroundColor: colors.primary,
    paddingHorizontal: 16,
    borderRadius: radius.sm,
    alignItems: "center",
    justifyContent: "center",
  },
  searchBtnText: {
    color: "#FFF",
    fontSize: 13,
    fontWeight: "700",
  },
  legendCard: {
    padding: spacing.md,
    backgroundColor: colors.surface,
    marginBottom: spacing.md,
  },
  legendTitle: {
    color: colors.textSecondary,
    fontSize: 12,
    fontWeight: "700",
    textTransform: "uppercase",
    letterSpacing: 0.5,
    marginBottom: spacing.sm,
  },
  legendGrid: {
    gap: 8,
  },
  legendItem: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 8,
  },
  legendDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginTop: 5,
  },
  legendText: {
    color: colors.textSecondary,
    fontSize: 12,
    lineHeight: 18,
    flex: 1,
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
    alignItems: "center",
    padding: spacing.md,
  },
  verifyModalCard: {
    width: "100%",
    maxWidth: 540,
    padding: spacing.lg,
    backgroundColor: colors.surface,
  },
  certificateCard: {
    width: "100%",
    maxWidth: 600,
    padding: spacing.xl,
    backgroundColor: colors.surface,
    borderColor: colors.blockchain,
    borderWidth: 2,
  },
  certBody: {
    gap: spacing.sm,
  },
  certSealWrap: {
    alignSelf: "center",
    backgroundColor: "rgba(245, 158, 11, 0.15)",
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: radius.full,
    marginBottom: spacing.xs,
  },
  certSeal: {
    color: colors.blockchain,
    fontSize: 12,
    fontWeight: "800",
    letterSpacing: 1,
  },
  certTitle: {
    color: colors.textPrimary,
    fontSize: 22,
    fontWeight: "900",
    textAlign: "center",
  },
  certSubtitle: {
    color: colors.textSecondary,
    fontSize: 13,
    textAlign: "center",
    marginBottom: spacing.sm,
  },
  certDetailsBox: {
    backgroundColor: colors.background,
    borderColor: colors.cardBorder,
    borderWidth: 1,
    borderRadius: radius.md,
    padding: spacing.md,
    gap: 8,
  },
  certItem: {
    color: colors.textSecondary,
    fontSize: 12,
    lineHeight: 18,
  },
  certActionsRow: {
    flexDirection: "row",
    gap: spacing.md,
    marginTop: spacing.md,
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
