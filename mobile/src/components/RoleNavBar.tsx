import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Modal,
  Platform,
  ScrollView,
} from "react-native";
import { useRouter } from "expo-router";
import Svg, { Path, Circle, Rect } from "react-native-svg";
import { useAuth } from "../store/authContext";
import { UserRole } from "../types";
import { colors, radius, spacing } from "../theme/colors";

const ROLE_CONFIGS: Record<
  UserRole,
  { label: string; bg: string; border: string; text: string; icon: string }
> = {
  STUDENT: {
    label: "STUDENT",
    bg: "rgba(59, 130, 246, 0.15)",
    border: "#3B82F6",
    text: "#60A5FA",
    icon: "🎓",
  },
  MENTOR: {
    label: "MENTOR / FACULTY",
    bg: "rgba(16, 185, 129, 0.15)",
    border: "#10B981",
    text: "#34D399",
    icon: "👨‍🏫",
  },
  FACULTY: {
    label: "MENTOR / FACULTY",
    bg: "rgba(16, 185, 129, 0.15)",
    border: "#10B981",
    text: "#34D399",
    icon: "👨‍🏫",
  },
  ADMIN: {
    label: "ADMINISTRATOR",
    bg: "rgba(239, 68, 68, 0.15)",
    border: "#EF4444",
    text: "#F87171",
    icon: "🛡️",
  },
  RECRUITER: {
    label: "RECRUITER / EMPLOYER",
    bg: "rgba(168, 85, 247, 0.15)",
    border: "#A855F7",
    text: "#C084FC",
    icon: "💼",
  },
  EMPLOYER: {
    label: "RECRUITER / EMPLOYER",
    bg: "rgba(168, 85, 247, 0.15)",
    border: "#A855F7",
    text: "#C084FC",
    icon: "💼",
  },
};

interface RoleNavBarProps {
  currentTab?: string;
}

export const RoleNavBar: React.FC<RoleNavBarProps> = ({ currentTab }) => {
  const router = useRouter();
  const { user, userRole, switchRole, logout, getDashboardRouteForRole } = useAuth();
  const [switcherOpen, setSwitcherOpen] = useState(false);
  const [switching, setSwitching] = useState(false);

  const roleMeta = ROLE_CONFIGS[userRole] || ROLE_CONFIGS.STUDENT;

  const handleRoleSelect = async (targetRole: UserRole) => {
    setSwitching(true);
    try {
      const route = await switchRole(targetRole);
      setSwitcherOpen(false);
      router.replace(route as any);
    } catch (e) {
      console.warn("Failed to switch role:", e);
    } finally {
      setSwitching(false);
    }
  };

  const navLinksForRole = () => {
    switch (userRole) {
      case "MENTOR":
        return [
          { label: "Cohort Overview", route: "/mentor/dashboard" },
          { label: "My Students", route: "/mentor/dashboard" },
          { label: "Settings", route: "/settings" },
        ];
      case "ADMIN":
        return [
          { label: "Overview", route: "/admin/dashboard" },
          { label: "User Governance", route: "/admin/dashboard" },
          { label: "Settings", route: "/settings" },
        ];
      case "RECRUITER":
        return [
          { label: "Talent Pipeline", route: "/recruiter/dashboard" },
          { label: "Verify Credential", route: "/recruiter/dashboard" },
          { label: "Settings", route: "/settings" },
        ];
      case "STUDENT":
      default:
        return [
          { label: "Dashboard", route: "/(tabs)" },
          { label: "Learning", route: "/(tabs)/learn" },
          { label: "Careers", route: "/(tabs)/careers" },
          { label: "Evolution", route: "/(tabs)/evolution" },
          { label: "Settings", route: "/settings" },
        ];
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.topRow}>
        {/* Brand */}
        <TouchableOpacity
          style={styles.brandWrap}
          onPress={() => router.replace(getDashboardRouteForRole(userRole) as any)}
          activeOpacity={0.8}
        >
          <View style={styles.logoBadge}>
            <Text style={styles.logoIcon}>⚡</Text>
          </View>
          <View>
            <Text style={styles.brandTitle}>
              SmartEvolve <Text style={{ color: colors.accent }}>AI</Text>
            </Text>
            <Text style={styles.brandSub}>Role-Based Adaptive Platform</Text>
          </View>
        </TouchableOpacity>

        {/* Right Section: Active Role Badge + Switcher */}
        <View style={styles.rightGroup}>
          <TouchableOpacity
            style={[
              styles.roleBadge,
              { backgroundColor: roleMeta.bg, borderColor: roleMeta.border },
            ]}
            onPress={() => setSwitcherOpen(true)}
            activeOpacity={0.7}
          >
            <Text style={styles.roleIcon}>{roleMeta.icon}</Text>
            <Text style={[styles.roleLabel, { color: roleMeta.text }]}>
              {roleMeta.label}
            </Text>
            <Text style={[styles.chevron, { color: roleMeta.text }]}>▾</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.avatarBtn}
            onPress={() => router.push("/settings")}
            activeOpacity={0.8}
          >
            <Text style={styles.avatarLetter}>
              {(user?.fullName || "U").substring(0, 1).toUpperCase()}
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Role-Specific Navigation Strip */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.navLinksScroll}
      >
        {navLinksForRole().map((link, idx) => (
          <TouchableOpacity
            key={idx}
            style={[
              styles.navLinkItem,
              currentTab === link.label && styles.navLinkItemActive,
            ]}
            onPress={() => router.push(link.route as any)}
          >
            <Text
              style={[
                styles.navLinkText,
                currentTab === link.label && styles.navLinkTextActive,
              ]}
            >
              {link.label}
            </Text>
          </TouchableOpacity>
        ))}
        <TouchableOpacity
          style={styles.switchPillBtn}
          onPress={() => setSwitcherOpen(true)}
        >
          <Text style={styles.switchPillText}>🔄 Switch Role</Text>
        </TouchableOpacity>
      </ScrollView>

      {/* Role Switcher Modal for Paired Testing */}
      <Modal
        visible={switcherOpen}
        transparent
        animationType="fade"
        onRequestClose={() => setSwitcherOpen(false)}
      >
        <TouchableOpacity
          style={styles.modalOverlay}
          activeOpacity={1}
          onPress={() => setSwitcherOpen(false)}
        >
          <View style={styles.modalCard} onStartShouldSetResponder={() => true}>
            <View style={styles.modalHeader}>
              <View>
                <Text style={styles.modalTitle}>Role-Based Access Control</Text>
                <Text style={styles.modalSub}>
                  Select a role to preview and test its permissions:
                </Text>
              </View>
              <TouchableOpacity
                onPress={() => setSwitcherOpen(false)}
                style={styles.closeBtn}
              >
                <Text style={styles.closeBtnText}>✕</Text>
              </TouchableOpacity>
            </View>

            {/* Role Options */}
            <View style={styles.roleOptionsList}>
              {/* 1. STUDENT */}
              <TouchableOpacity
                style={[
                  styles.roleCardOption,
                  userRole === "STUDENT" && styles.roleCardActive,
                ]}
                onPress={() => handleRoleSelect("STUDENT")}
                disabled={switching}
              >
                <View style={styles.roleCardHeader}>
                  <Text style={styles.roleCardEmoji}>🎓</Text>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.roleCardTitle}>1. STUDENT</Text>
                    <Text style={styles.roleCardDesc}>
                      Alex Chen • Computer Science
                    </Text>
                  </View>
                  {userRole === "STUDENT" ? (
                    <Text style={styles.activeCheck}>✓ ACTIVE</Text>
                  ) : null}
                </View>
                <Text style={styles.roleCardDetail}>
                  Personal career roadmap, adaptive assessments, skill gap analysis,
                  and blockchain credential issuance.
                </Text>
              </TouchableOpacity>

              {/* 2. MENTOR / FACULTY */}
              <TouchableOpacity
                style={[
                  styles.roleCardOption,
                  userRole === "MENTOR" && styles.roleCardActive,
                ]}
                onPress={() => handleRoleSelect("MENTOR")}
                disabled={switching}
              >
                <View style={styles.roleCardHeader}>
                  <Text style={styles.roleCardEmoji}>👨‍🏫</Text>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.roleCardTitle}>2. MENTOR / FACULTY</Text>
                    <Text style={styles.roleCardDesc}>
                      Dr. Elena Rostova • MIT Engineering
                    </Text>
                  </View>
                  {userRole === "MENTOR" ? (
                    <Text style={styles.activeCheck}>✓ ACTIVE</Text>
                  ) : null}
                </View>
                <Text style={styles.roleCardDetail}>
                  Oversight restricted strictly to assigned students. Review cohorts,
                  inspect skill roadmaps, and provide mentor feedback.
                </Text>
              </TouchableOpacity>

              {/* 3. ADMIN */}
              <TouchableOpacity
                style={[
                  styles.roleCardOption,
                  userRole === "ADMIN" && styles.roleCardActive,
                ]}
                onPress={() => handleRoleSelect("ADMIN")}
                disabled={switching}
              >
                <View style={styles.roleCardHeader}>
                  <Text style={styles.roleCardEmoji}>🛡️</Text>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.roleCardTitle}>3. ADMINISTRATOR</Text>
                    <Text style={styles.roleCardDesc}>
                      Sarah Connor • SmartEvolve Operations
                    </Text>
                  </View>
                  {userRole === "ADMIN" ? (
                    <Text style={styles.activeCheck}>✓ ACTIVE</Text>
                  ) : null}
                </View>
                <Text style={styles.roleCardDetail}>
                  Platform governance: Manage all users, assign user roles, configure
                  career benchmarks, and modify system settings.
                </Text>
              </TouchableOpacity>

              {/* 4. RECRUITER / EMPLOYER */}
              <TouchableOpacity
                style={[
                  styles.roleCardOption,
                  userRole === "RECRUITER" && styles.roleCardActive,
                ]}
                onPress={() => handleRoleSelect("RECRUITER")}
                disabled={switching}
              >
                <View style={styles.roleCardHeader}>
                  <Text style={styles.roleCardEmoji}>💼</Text>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.roleCardTitle}>
                      4. RECRUITER / EMPLOYER
                    </Text>
                    <Text style={styles.roleCardDesc}>
                      Marcus Vance • Apex Talent Cloud
                    </Text>
                  </View>
                  {userRole === "RECRUITER" ? (
                    <Text style={styles.activeCheck}>✓ ACTIVE</Text>
                  ) : null}
                </View>
                <Text style={styles.roleCardDetail}>
                  View candidate dossiers explicitly shared by students. Verify
                  tamper-evident blockchain credentials on-chain.
                </Text>
              </TouchableOpacity>
            </View>

            <View style={styles.modalFooter}>
              <Text style={styles.securityNote}>
                🔒 Real database-backed RBAC with Supabase Row-Level Security (RLS).
              </Text>
            </View>
          </View>
        </TouchableOpacity>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: colors.cardBorder,
    paddingTop: Platform.OS === "ios" ? 48 : 28,
    paddingHorizontal: spacing.md,
    paddingBottom: 6,
  },
  topRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: spacing.xs,
  },
  brandWrap: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  logoBadge: {
    width: 32,
    height: 32,
    borderRadius: 8,
    backgroundColor: colors.primary,
    alignItems: "center",
    justifyContent: "center",
  },
  logoIcon: {
    color: "#FFF",
    fontSize: 16,
    fontWeight: "800",
  },
  brandTitle: {
    color: colors.textPrimary,
    fontSize: 16,
    fontWeight: "800",
  },
  brandSub: {
    color: colors.textMuted,
    fontSize: 10,
    fontWeight: "600",
  },
  rightGroup: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  roleBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: radius.full,
    borderWidth: 1,
  },
  roleIcon: {
    fontSize: 12,
  },
  roleLabel: {
    fontSize: 11,
    fontWeight: "700",
    letterSpacing: 0.3,
  },
  chevron: {
    fontSize: 10,
    fontWeight: "900",
  },
  avatarBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: colors.surfaceLight,
    borderWidth: 1,
    borderColor: colors.cardBorder,
    alignItems: "center",
    justifyContent: "center",
  },
  avatarLetter: {
    color: colors.textPrimary,
    fontSize: 13,
    fontWeight: "800",
  },
  navLinksScroll: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingVertical: 4,
  },
  navLinkItem: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: radius.sm,
  },
  navLinkItemActive: {
    backgroundColor: "rgba(99, 102, 241, 0.2)",
  },
  navLinkText: {
    color: colors.textSecondary,
    fontSize: 12,
    fontWeight: "600",
  },
  navLinkTextActive: {
    color: colors.primary,
    fontWeight: "700",
  },
  switchPillBtn: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: radius.sm,
    backgroundColor: colors.surfaceLight,
    borderWidth: 1,
    borderColor: colors.cardBorder,
    marginLeft: 4,
  },
  switchPillText: {
    color: colors.accent,
    fontSize: 11,
    fontWeight: "700",
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.75)",
    justifyContent: "center",
    alignItems: "center",
    padding: spacing.md,
  },
  modalCard: {
    width: "100%",
    maxWidth: 520,
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.cardBorder,
    padding: spacing.lg,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.4,
    shadowRadius: 16,
    elevation: 8,
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
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
  roleOptionsList: {
    gap: 10,
  },
  roleCardOption: {
    backgroundColor: colors.background,
    borderWidth: 1,
    borderColor: colors.cardBorder,
    borderRadius: radius.md,
    padding: spacing.sm,
  },
  roleCardActive: {
    borderColor: colors.primary,
    backgroundColor: "rgba(99, 102, 241, 0.12)",
  },
  roleCardHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: 4,
  },
  roleCardEmoji: {
    fontSize: 20,
  },
  roleCardTitle: {
    color: colors.textPrimary,
    fontSize: 14,
    fontWeight: "700",
  },
  roleCardDesc: {
    color: colors.textSecondary,
    fontSize: 11,
  },
  activeCheck: {
    color: colors.success,
    fontSize: 10,
    fontWeight: "800",
    letterSpacing: 0.5,
  },
  roleCardDetail: {
    color: colors.textMuted,
    fontSize: 11,
    lineHeight: 15,
  },
  modalFooter: {
    marginTop: spacing.md,
    paddingTop: spacing.sm,
    borderTopWidth: 1,
    borderTopColor: colors.cardBorder,
    alignItems: "center",
  },
  securityNote: {
    color: colors.textMuted,
    fontSize: 11,
    textAlign: "center",
  },
});
