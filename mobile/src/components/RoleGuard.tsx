import React from "react";
import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import { useRouter } from "expo-router";
import { useAuth } from "../store/authContext";
import { UserRole } from "../types";
import { Card } from "./Card";
import { Button } from "./Button";
import { colors, radius, spacing } from "../theme/colors";

interface RoleGuardProps {
  allowedRoles: UserRole[];
  children: React.ReactNode;
}

export const RoleGuard: React.FC<RoleGuardProps> = ({ allowedRoles, children }) => {
  const router = useRouter();
  const { userRole, switchRole, getDashboardRouteForRole } = useAuth();

  const isAllowed = allowedRoles.includes(userRole);

  if (!isAllowed) {
    const requiredRoles = allowedRoles.join(" or ");
    return (
      <View style={styles.container}>
        <Card style={styles.card}>
          <View style={styles.iconWrap}>
            <Text style={styles.icon}>⛔</Text>
          </View>
          <Text style={styles.title}>Access Denied</Text>
          <Text style={styles.subtitle}>
            Your current assigned role is <Text style={styles.bold}>{userRole}</Text>.
          </Text>
          <Text style={styles.message}>
            This page and its actions are strictly restricted to users with{" "}
            <Text style={styles.highlight}>{requiredRoles}</Text> privileges.
          </Text>

          <View style={styles.buttonGroup}>
            <Button
              title={`Return to ${userRole} Dashboard`}
              onPress={() => router.replace(getDashboardRouteForRole(userRole) as any)}
              size="md"
            />
            {allowedRoles[0] ? (
              <Button
                title={`Switch to ${allowedRoles[0]} (Demo Test)`}
                variant="outline"
                onPress={async () => {
                  const target = allowedRoles[0];
                  const route = await switchRole(target);
                  router.replace(route as any);
                }}
                size="md"
              />
            ) : null}
          </View>
        </Card>
      </View>
    );
  }

  return <>{children}</>;
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
    justifyContent: "center",
    alignItems: "center",
    padding: spacing.lg,
  },
  card: {
    width: "100%",
    maxWidth: 480,
    alignItems: "center",
    padding: spacing.xl,
  },
  iconWrap: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: "rgba(239, 68, 68, 0.15)",
    borderWidth: 1,
    borderColor: colors.error,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: spacing.md,
  },
  icon: {
    fontSize: 28,
  },
  title: {
    color: colors.textPrimary,
    fontSize: 20,
    fontWeight: "800",
    marginBottom: spacing.xs,
  },
  subtitle: {
    color: colors.textSecondary,
    fontSize: 14,
    marginBottom: spacing.sm,
  },
  bold: {
    color: colors.primary,
    fontWeight: "700",
  },
  message: {
    color: colors.textMuted,
    fontSize: 13,
    textAlign: "center",
    lineHeight: 18,
    marginBottom: spacing.lg,
  },
  highlight: {
    color: colors.accent,
    fontWeight: "700",
  },
  buttonGroup: {
    width: "100%",
    gap: spacing.sm,
  },
});
