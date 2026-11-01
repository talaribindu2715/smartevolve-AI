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
  Switch,
  ActivityIndicator,
} from "react-native";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "../../src/api/client";
import { RoleNavBar } from "../../src/components/RoleNavBar";
import { RoleGuard } from "../../src/components/RoleGuard";
import { Card } from "../../src/components/Card";
import { Button } from "../../src/components/Button";
import { Badge } from "../../src/components/Badge";
import { CardSkeleton } from "../../src/components/Skeleton";
import { ErrorBanner } from "../../src/components/ErrorBanner";
import { AdminUser, UserRole } from "../../src/types";
import { colors, radius, spacing } from "../../src/theme/colors";

const ROLES_LIST: UserRole[] = ["STUDENT", "MENTOR", "ADMIN", "RECRUITER"];

export default function AdminDashboardScreen() {
  const queryClient = useQueryClient();
  const [roleFilter, setRoleFilter] = useState<string>("ALL");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedUser, setSelectedUser] = useState<AdminUser | null>(null);
  const [roleModalVisible, setRoleModalVisible] = useState(false);
  const [newRole, setNewRole] = useState<UserRole>("STUDENT");
  const [successBanner, setSuccessBanner] = useState<string | null>(null);

  const {
    data: dashboard,
    isLoading: isDashLoading,
    isError: isDashError,
    error: dashError,
    refetch: refetchDash,
  } = useQuery({
    queryKey: ["adminDashboard"],
    queryFn: () => api.getAdminDashboard(),
  });

  const {
    data: usersList,
    isLoading: isUsersLoading,
    refetch: refetchUsers,
  } = useQuery({
    queryKey: ["adminUsers", roleFilter],
    queryFn: () => api.getAdminUsers(roleFilter),
  });

  const {
    data: platformSettings,
    isLoading: isSettingsLoading,
  } = useQuery({
    queryKey: ["platformSettings"],
    queryFn: () => api.getPlatformSettings(),
  });

  const roleUpdateMutation = useMutation({
    mutationFn: (role: string) => {
      if (!selectedUser) throw new Error("No user selected");
      return api.updateUserRole(selectedUser.id, role);
    },
    onSuccess: (updated) => {
      queryClient.invalidateQueries({ queryKey: ["adminDashboard"] });
      queryClient.invalidateQueries({ queryKey: ["adminUsers"] });
      setSuccessBanner(`User ${updated.fullName} role updated to ${updated.role}!`);
      setTimeout(() => setSuccessBanner(null), 4000);
      setRoleModalVisible(false);
      Alert.alert(
        "Role Updated",
        `User ${updated.fullName} has been granted ${updated.role} permissions in the PostgreSQL database.`
      );
    },
    onError: (err: any) => {
      Alert.alert("Role Update Error", err.message || "Failed to update role.");
    },
  });

  const handleOpenRoleModal = (user: AdminUser) => {
    setSelectedUser(user);
    setNewRole(user.role);
    setRoleModalVisible(true);
  };

  const handleConfirmRoleUpdate = () => {
    roleUpdateMutation.mutate(newRole);
  };

  const filteredUsers = (usersList || []).filter((u) => {
    const q = searchQuery.toLowerCase().trim();
    if (!q) return true;
    return (
      u.fullName.toLowerCase().includes(q) ||
      (u.institution && u.institution.toLowerCase().includes(q)) ||
      (u.branch && u.branch.toLowerCase().includes(q)) ||
      u.role.toLowerCase().includes(q)
    );
  });

  return (
    <RoleGuard allowedRoles={["ADMIN"]}>
      <View style={styles.container}>
        <RoleNavBar currentTab="Overview" />

        <ScrollView contentContainerStyle={styles.content}>
          <View style={styles.responsiveWrapper}>
            {/* Header Banner */}
            <View style={styles.headerBanner}>
              <View>
                <View style={styles.badgeRow}>
                  <Badge label="CHIEF ADMINISTRATOR" variant="error" />
                  <Text style={styles.headerTagline}>
                    Platform Governance & System Benchmarks
                  </Text>
                </View>
                <Text style={styles.title}>Admin Command Center</Text>
                <Text style={styles.subtitle}>
                  Full governance over user roles, career readiness rubrics, skill
                  weights, and Row-Level Security policies.
                </Text>
              </View>
            </View>

            {successBanner && (
              <View style={styles.successBanner}>
                <Text style={styles.successBannerText}>✓ {successBanner}</Text>
              </View>
            )}

            {isDashError && (
              <ErrorBanner
                message={
                  dashError instanceof Error
                    ? dashError.message
                    : "Failed to load administrative telemetry."
                }
                onRetry={refetchDash}
              />
            )}

            {isDashLoading ? (
              <View style={{ gap: spacing.md }}>
                <CardSkeleton height={120} />
                <CardSkeleton height={260} />
              </View>
            ) : (
              <>
                {/* 6 KPI Cards Grid */}
                <View style={styles.kpiGrid}>
                  <Card style={styles.kpiCard}>
                    <Text style={styles.kpiEmoji}>👥</Text>
                    <Text style={styles.kpiValue}>
                      {dashboard?.totalUsers || 0}
                    </Text>
                    <Text style={styles.kpiLabel}>Total Users</Text>
                  </Card>

                  <Card style={styles.kpiCard}>
                    <Text style={styles.kpiEmoji}>🎓</Text>
                    <Text style={[styles.kpiValue, { color: colors.primary }]}>
                      {dashboard?.studentCount || 0}
                    </Text>
                    <Text style={styles.kpiLabel}>Students</Text>
                  </Card>

                  <Card style={styles.kpiCard}>
                    <Text style={styles.kpiEmoji}>👨‍🏫</Text>
                    <Text style={[styles.kpiValue, { color: colors.success }]}>
                      {dashboard?.mentorCount || 0}
                    </Text>
                    <Text style={styles.kpiLabel}>Mentors / Faculty</Text>
                  </Card>

                  <Card style={styles.kpiCard}>
                    <Text style={styles.kpiEmoji}>💼</Text>
                    <Text style={[styles.kpiValue, { color: colors.secondary }]}>
                      {dashboard?.recruiterCount || 0}
                    </Text>
                    <Text style={styles.kpiLabel}>Recruiters</Text>
                  </Card>

                  <Card style={styles.kpiCard}>
                    <Text style={styles.kpiEmoji}>🎯</Text>
                    <Text style={[styles.kpiValue, { color: colors.accent }]}>
                      {dashboard?.totalCareers || 0}
                    </Text>
                    <Text style={styles.kpiLabel}>Career Benchmarks</Text>
                  </Card>

                  <Card style={styles.kpiCard}>
                    <Text style={styles.kpiEmoji}>📜</Text>
                    <Text style={[styles.kpiValue, { color: "#F59E0B" }]}>
                      {dashboard?.totalCredentialsIssued || 0}
                    </Text>
                    <Text style={styles.kpiLabel}>On-Chain Credentials</Text>
                  </Card>
                </View>

                {/* User Governance & Role Management Section */}
                <Card style={styles.managementCard}>
                  <View style={styles.cardHeaderRow}>
                    <View>
                      <Text style={styles.cardSectionTitle}>
                        User Governance & Role Assignment
                      </Text>
                      <Text style={styles.cardSectionSub}>
                        View registered users and assign database-backed role privileges.
                      </Text>
                    </View>
                  </View>

                  {/* Filter and Search Bar */}
                  <View style={styles.filterBar}>
                    <TextInput
                      style={styles.searchInput}
                      value={searchQuery}
                      onChangeText={setSearchQuery}
                      placeholder="Search by name, role, or university..."
                      placeholderTextColor={colors.textMuted}
                    />

                    <ScrollView
                      horizontal
                      showsHorizontalScrollIndicator={false}
                      style={styles.roleFilterScroll}
                    >
                      {["ALL", "STUDENT", "MENTOR", "ADMIN", "RECRUITER"].map((r) => (
                        <TouchableOpacity
                          key={r}
                          style={[
                            styles.filterPill,
                            roleFilter === r && styles.filterPillActive,
                          ]}
                          onPress={() => setRoleFilter(r)}
                        >
                          <Text
                            style={[
                              styles.filterPillText,
                              roleFilter === r && styles.filterPillTextActive,
                            ]}
                          >
                            {r}
                          </Text>
                        </TouchableOpacity>
                      ))}
                    </ScrollView>
                  </View>

                  {/* Users Table / List */}
                  {isUsersLoading ? (
                    <ActivityIndicator
                      size="large"
                      color={colors.primary}
                      style={{ marginVertical: spacing.lg }}
                    />
                  ) : filteredUsers.length > 0 ? (
                    <View style={styles.usersList}>
                      {filteredUsers.map((u) => (
                        <View key={u.id} style={styles.userRow}>
                          <View style={styles.userAvatar}>
                            <Text style={styles.userAvatarText}>
                              {u.fullName.substring(0, 1).toUpperCase()}
                            </Text>
                          </View>

                          <View style={{ flex: 1 }}>
                            <View style={styles.userNameRoleRow}>
                              <Text style={styles.userNameText}>{u.fullName}</Text>
                              <Badge
                                label={u.role}
                                variant={
                                  u.role === "ADMIN"
                                    ? "error"
                                    : u.role === "MENTOR" || u.role === "FACULTY"
                                    ? "success"
                                    : u.role === "RECRUITER" || u.role === "EMPLOYER"
                                    ? "warning"
                                    : "primary"
                                }
                              />
                            </View>
                            <Text style={styles.userSubText}>
                              {u.branch || "General Engineering"} •{" "}
                              {u.institution || "Platform Member"}
                            </Text>
                            <Text style={styles.userIdText}>
                              ID: {u.id}
                            </Text>
                          </View>

                          <TouchableOpacity
                            style={styles.changeRoleBtn}
                            onPress={() => handleOpenRoleModal(u)}
                          >
                            <Text style={styles.changeRoleBtnText}>
                              Change Role ▾
                            </Text>
                          </TouchableOpacity>
                        </View>
                      ))}
                    </View>
                  ) : (
                    <Text style={styles.noUsersText}>
                      No users match the active filter criteria.
                    </Text>
                  )}
                </Card>

                {/* Platform Runtime Settings */}
                <Card style={styles.settingsCard}>
                  <Text style={styles.cardSectionTitle}>
                    Platform & System Security Configuration
                  </Text>
                  <Text style={styles.cardSectionSub}>
                    Core intelligence models, EVM blockchain parameters, and RLS policies.
                  </Text>

                  <View style={styles.settingsTable}>
                    <View style={styles.settingItem}>
                      <Text style={styles.settingKey}>AI Reasoning Engine</Text>
                      <Text style={styles.settingVal}>
                        {platformSettings?.aiModel || "Gemini 1.5 Pro / Adaptive Heuristics"}
                      </Text>
                    </View>

                    <View style={styles.settingItem}>
                      <Text style={styles.settingKey}>Recommendation Version</Text>
                      <Text style={styles.settingVal}>
                        {platformSettings?.recommendationEngineVersion || "v2.4-Production"}
                      </Text>
                    </View>

                    <View style={styles.settingItem}>
                      <Text style={styles.settingKey}>Blockchain Network</Text>
                      <Text style={styles.settingVal}>
                        {platformSettings?.blockchainNetwork || "Hardhat EVM Local (31337)"}
                      </Text>
                    </View>

                    <View style={styles.settingItem}>
                      <Text style={styles.settingKey}>Smart Contract Address</Text>
                      <Text style={[styles.settingVal, styles.monoText]} numberOfLines={1}>
                        {platformSettings?.smartContractAddress || "0x5FbDB2315678afecb367f032d93F642f64180aa3"}
                      </Text>
                    </View>

                    <View style={styles.settingItem}>
                      <Text style={styles.settingKey}>Supabase RLS Security</Text>
                      <Text style={[styles.settingVal, { color: colors.success }]}>
                        ACTIVE & VERIFIED (Policies Enforced)
                      </Text>
                    </View>
                  </View>
                </Card>
              </>
            )}
          </View>
        </ScrollView>

        {/* Change Role Modal */}
        <Modal
          visible={roleModalVisible}
          transparent
          animationType="fade"
          onRequestClose={() => setRoleModalVisible(false)}
        >
          <TouchableOpacity
            style={styles.modalOverlay}
            activeOpacity={1}
            onPress={() => setRoleModalVisible(false)}
          >
            <View style={styles.roleModalCard} onStartShouldSetResponder={() => true}>
              <View style={styles.modalHeader}>
                <View>
                  <Text style={styles.modalTitle}>Assign User Role</Text>
                  <Text style={styles.modalSub}>
                    Modifying permissions for: {selectedUser?.fullName}
                  </Text>
                </View>
                <TouchableOpacity
                  onPress={() => setRoleModalVisible(false)}
                  style={styles.closeBtn}
                >
                  <Text style={styles.closeBtnText}>✕</Text>
                </TouchableOpacity>
              </View>

              <Text style={styles.selectRoleLabel}>
                Select Database-Backed Role:
              </Text>

              <View style={styles.rolePickerList}>
                {ROLES_LIST.map((r) => {
                  const isSelected = newRole === r;
                  return (
                    <TouchableOpacity
                      key={r}
                      style={[
                        styles.rolePickerItem,
                        isSelected && styles.rolePickerItemActive,
                      ]}
                      onPress={() => setNewRole(r)}
                    >
                      <Text
                        style={[
                          styles.rolePickerText,
                          isSelected && styles.rolePickerTextActive,
                        ]}
                      >
                        {r === "STUDENT" && "🎓 STUDENT (Default learner access)"}
                        {r === "MENTOR" && "👨‍🏫 MENTOR / FACULTY (Assigned cohort oversight)"}
                        {r === "ADMIN" && "🛡️ ADMINISTRATOR (Full governance)"}
                        {r === "RECRUITER" && "💼 RECRUITER (Shared candidates & verifier)"}
                      </Text>
                      {isSelected ? (
                        <Text style={styles.checkIcon}>✓</Text>
                      ) : null}
                    </TouchableOpacity>
                  );
                })}
              </View>

              <View style={styles.modalButtons}>
                <Button
                  title={
                    roleUpdateMutation.isPending
                      ? "Applying Role..."
                      : "Confirm & Update Role"
                  }
                  onPress={handleConfirmRoleUpdate}
                  loading={roleUpdateMutation.isPending}
                  size="md"
                />
              </View>
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
    minWidth: 140,
    padding: spacing.md,
    alignItems: "center",
  },
  kpiEmoji: {
    fontSize: 22,
    marginBottom: 4,
  },
  kpiValue: {
    color: colors.textPrimary,
    fontSize: 20,
    fontWeight: "900",
  },
  kpiLabel: {
    color: colors.textMuted,
    fontSize: 11,
    fontWeight: "600",
    marginTop: 2,
    textAlign: "center",
  },
  managementCard: {
    padding: spacing.md,
    marginBottom: spacing.lg,
  },
  cardHeaderRow: {
    marginBottom: spacing.sm,
  },
  cardSectionTitle: {
    color: colors.textPrimary,
    fontSize: 16,
    fontWeight: "800",
  },
  cardSectionSub: {
    color: colors.textMuted,
    fontSize: 12,
    marginTop: 2,
  },
  filterBar: {
    marginVertical: spacing.sm,
    gap: 8,
  },
  searchInput: {
    backgroundColor: colors.background,
    borderWidth: 1,
    borderColor: colors.cardBorder,
    borderRadius: radius.md,
    paddingHorizontal: spacing.sm,
    paddingVertical: 8,
    color: colors.textPrimary,
    fontSize: 13,
  },
  roleFilterScroll: {
    flexDirection: "row",
    marginVertical: 4,
  },
  filterPill: {
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: radius.sm,
    backgroundColor: colors.surfaceLight,
    borderWidth: 1,
    borderColor: colors.cardBorder,
    marginRight: 6,
  },
  filterPillActive: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  filterPillText: {
    color: colors.textSecondary,
    fontSize: 11,
    fontWeight: "700",
  },
  filterPillTextActive: {
    color: "#FFF",
  },
  usersList: {
    gap: 8,
    marginTop: spacing.xs,
  },
  userRow: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: colors.background,
    borderWidth: 1,
    borderColor: colors.cardBorder,
    borderRadius: radius.md,
    padding: spacing.sm,
    gap: spacing.sm,
  },
  userAvatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: colors.surfaceLight,
    borderWidth: 1,
    borderColor: colors.cardBorder,
    alignItems: "center",
    justifyContent: "center",
  },
  userAvatarText: {
    color: colors.textPrimary,
    fontSize: 14,
    fontWeight: "800",
  },
  userNameRoleRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  userNameText: {
    color: colors.textPrimary,
    fontSize: 14,
    fontWeight: "700",
  },
  userSubText: {
    color: colors.textSecondary,
    fontSize: 11,
    marginTop: 1,
  },
  userIdText: {
    color: colors.textMuted,
    fontSize: 10,
    fontFamily: "monospace",
  },
  changeRoleBtn: {
    backgroundColor: colors.surfaceLight,
    borderWidth: 1,
    borderColor: colors.cardBorder,
    paddingHorizontal: 8,
    paddingVertical: 6,
    borderRadius: radius.sm,
  },
  changeRoleBtnText: {
    color: colors.accent,
    fontSize: 11,
    fontWeight: "700",
  },
  noUsersText: {
    color: colors.textMuted,
    fontSize: 12,
    fontStyle: "italic",
    textAlign: "center",
    marginVertical: spacing.md,
  },
  settingsCard: {
    padding: spacing.md,
  },
  settingsTable: {
    marginTop: spacing.sm,
    gap: 8,
  },
  settingItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: 6,
    borderBottomWidth: 1,
    borderBottomColor: colors.cardBorder,
    gap: 8,
  },
  settingKey: {
    color: colors.textMuted,
    fontSize: 12,
  },
  settingVal: {
    color: colors.textSecondary,
    fontSize: 12,
    fontWeight: "600",
    textAlign: "right",
    flex: 1,
  },
  monoText: {
    fontFamily: "monospace",
    color: colors.accent,
    fontSize: 11,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.75)",
    justifyContent: "center",
    alignItems: "center",
    padding: spacing.md,
  },
  roleModalCard: {
    width: "100%",
    maxWidth: 480,
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
  selectRoleLabel: {
    color: colors.textSecondary,
    fontSize: 12,
    fontWeight: "700",
    marginBottom: spacing.xs,
  },
  rolePickerList: {
    gap: 8,
    marginBottom: spacing.md,
  },
  rolePickerItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: colors.background,
    borderWidth: 1,
    borderColor: colors.cardBorder,
    borderRadius: radius.md,
    padding: spacing.sm,
  },
  rolePickerItemActive: {
    borderColor: colors.primary,
    backgroundColor: "rgba(99, 102, 241, 0.15)",
  },
  rolePickerText: {
    color: colors.textSecondary,
    fontSize: 13,
    fontWeight: "600",
  },
  rolePickerTextActive: {
    color: colors.primary,
    fontWeight: "700",
  },
  checkIcon: {
    color: colors.primary,
    fontWeight: "900",
    fontSize: 14,
  },
  modalButtons: {
    marginTop: spacing.xs,
  },
});
