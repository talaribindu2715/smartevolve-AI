import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  RefreshControl,
  ActivityIndicator,
  Alert,
  Platform,
} from "react-native";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import Svg, { Path } from "react-native-svg";
import { api } from "../../src/api/client";
import { Card } from "../../src/components/Card";
import { Badge } from "../../src/components/Badge";
import { Button } from "../../src/components/Button";
import { Credential } from "../../src/types";
import { colors, radius, spacing } from "../../src/theme/colors";

export default function CredentialsScreen() {
  const queryClient = useQueryClient();
  const [verifyingId, setVerifyingId] = useState<string | null>(null);

  const {
    data: credentials,
    isLoading,
    refetch,
    isRefetching,
  } = useQuery({
    queryKey: ["credentials"],
    queryFn: () => api.getCredentials(),
  });

  const verifyMutation = useMutation({
    mutationFn: (id: string) => api.verifyCredential(id),
    onSuccess: (res) => {
      setVerifyingId(null);
      queryClient.invalidateQueries({ queryKey: ["credentials"] });
      queryClient.invalidateQueries({ queryKey: ["dashboard"] });
      Alert.alert(
        res.valid ? "Blockchain Verification Confirmed" : "Verification Failed",
        `${res.verificationMessage}\n\nStatus: ${res.status}\nIssuer: ${res.issuerAddress}`
      );
    },
    onError: (err: any) => {
      setVerifyingId(null);
      Alert.alert("Verification Error", err.message || "Failed to verify on-chain.");
    },
  });

  const handleVerify = (credId: string) => {
    setVerifyingId(credId);
    verifyMutation.mutate(credId);
  };

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator color={colors.primary} size="large" />
        <Text style={styles.loadingText}>Querying EVM Blockchain Ledger...</Text>
      </View>
    );
  }

  const creds = credentials || [];

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.content}
      refreshControl={
        <RefreshControl
          refreshing={isRefetching}
          onRefresh={refetch}
          tintColor={colors.primary}
        />
      }
    >
      {/* Header Info */}
      <View style={styles.header}>
        <Text style={styles.headerTag}>IMMUTABLE ACADEMIC RECORD</Text>
        <Text style={styles.headerTitle}>Verified Credentials</Text>
        <Text style={styles.headerSub}>
          Achievements anchored to Ethereum-compatible smart contracts with cryptographic proof of mastery.
        </Text>
      </View>

      {creds.length === 0 ? (
        <Card style={styles.emptyCard}>
          <Svg width="56" height="56" viewBox="0 0 24 24" fill="none" stroke={colors.blockchain} strokeWidth="1.5">
            <Path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" />
          </Svg>
          <Text style={styles.emptyTitle}>No Blockchain Credentials Yet</Text>
          <Text style={styles.emptySub}>
            Score 80%+ on milestone assessments or complete full career roadmaps to earn tamper-evident on-chain credentials.
          </Text>
        </Card>
      ) : (
        <View style={styles.credsList}>
          {creds.map((c) => {
            const isConfirmed = c.status === "CONFIRMED";
            const isPending = c.status === "PENDING";
            const isVerifying = verifyingId === c.id;

            return (
              <Card key={c.id} style={styles.credCard}>
                {/* Top Badge & Title */}
                <View style={styles.cardTop}>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.credType}>ACADEMIC MILESTONE</Text>
                    <Text style={styles.achievementTitle}>{c.achievementTitle}</Text>
                  </View>
                  <Badge
                    label={c.status}
                    variant={isConfirmed ? "success" : isPending ? "warning" : "error"}
                  />
                </View>

                {/* Metadata Fields */}
                <View style={styles.metaBox}>
                  <View style={styles.metaRow}>
                    <Text style={styles.metaKey}>Network</Text>
                    <Text style={styles.metaVal}>{c.networkId}</Text>
                  </View>

                  <View style={styles.metaRow}>
                    <Text style={styles.metaKey}>Block Number</Text>
                    <Text style={styles.metaVal}>#{c.blockNumber || 12042}</Text>
                  </View>

                  <View style={styles.metaRow}>
                    <Text style={styles.metaKey}>Contract</Text>
                    <Text style={[styles.metaVal, styles.monoText]} numberOfLines={1}>
                      {c.contractAddress}
                    </Text>
                  </View>

                  <View style={styles.metaRow}>
                    <Text style={styles.metaKey}>Tx Hash</Text>
                    <Text style={[styles.metaVal, styles.monoText]} numberOfLines={1}>
                      {c.transactionHash}
                    </Text>
                  </View>

                  <View style={styles.metaRow}>
                    <Text style={styles.metaKey}>Data Hash</Text>
                    <Text style={[styles.metaVal, styles.monoText]} numberOfLines={1}>
                      {c.achievementDataHash}
                    </Text>
                  </View>

                  <View style={styles.metaRow}>
                    <Text style={styles.metaKey}>Issuer Address</Text>
                    <Text style={[styles.metaVal, styles.monoText]} numberOfLines={1}>
                      {c.issuerAddress}
                    </Text>
                  </View>
                </View>

                {/* On-Chain Verify Action */}
                <Button
                  title={isVerifying ? "Verifying On-Chain..." : "Verify Credential On Blockchain"}
                  onPress={() => handleVerify(c.id)}
                  loading={isVerifying}
                  variant="outline"
                  size="sm"
                  style={styles.verifyBtn}
                />
              </Card>
            );
          })}
        </View>
      )}
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
    marginBottom: spacing.md,
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
    marginVertical: spacing.xs,
  },
  metaRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    gap: 8,
  },
  metaKey: {
    color: colors.textMuted,
    fontSize: 12,
    width: 90,
  },
  metaVal: {
    color: colors.textSecondary,
    fontSize: 12,
    flex: 1,
    textAlign: "right",
  },
  monoText: {
    fontFamily: Platform.OS === "ios" ? "Courier" : "monospace",
    color: colors.accent,
  },
  verifyBtn: {
    marginTop: spacing.sm,
    borderColor: colors.blockchain,
  },
  emptyCard: {
    alignItems: "center",
    padding: spacing.xl,
    gap: spacing.sm,
    marginTop: spacing.md,
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
});
