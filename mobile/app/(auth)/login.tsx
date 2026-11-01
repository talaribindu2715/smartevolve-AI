import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Alert,
} from "react-native";
import { useRouter, Link } from "expo-router";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Button } from "../../src/components/Button";
import { useAuth } from "../../src/store/authContext";
import { supabase, isSupabaseConfigured } from "../../src/services/supabase";
import { DEMO_IDENTITIES } from "../../src/services/secureStorage";
import { UserRole } from "../../src/types";
import { api } from "../../src/api/client";
import { colors, radius, spacing } from "../../src/theme/colors";

const loginSchema = z.object({
  email: z.string().email("Enter a valid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

type LoginFormData = z.infer<typeof loginSchema>;

export default function LoginScreen() {
  const router = useRouter();
  const { login, switchRole, getDashboardRouteForRole } = useAuth();
  const [loading, setLoading] = useState(false);
  const [authError, setAuthError] = useState<string | null>(null);

  const {
    control,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  const onSubmit = async (data: LoginFormData) => {
    setLoading(true);
    setAuthError(null);

    try {
      if (isSupabaseConfigured()) {
        const { data: authData, error } = await supabase.auth.signInWithPassword({
          email: data.email,
          password: data.password,
        });

        if (error) {
          throw new Error(error.message);
        }

        if (authData.session) {
          await login(authData.session.access_token, authData.session.user.id);
          const route = getDashboardRouteForRole();
          router.replace(route as any);
          return;
        }
      }

      // 2. Try Backend REST API Authentication
      try {
        const authRes = await api.login({
          email: data.email,
          password: data.password,
        });
        if (authRes && authRes.token) {
          await login(authRes.token, authRes.userId, authRes.role as UserRole);
          const route = getDashboardRouteForRole(authRes.role as UserRole);
          router.replace(route as any);
          return;
        }
      } catch (backendErr: any) {
        // Fall back to demo roles if both cloud auth and backend are unreachable
      }

      // 3. Check if email matches any demo role account
      const lower = data.email.toLowerCase().trim();
      let matchedRole: UserRole = "STUDENT";
      if (lower.includes("faculty") || lower.includes("mentor") || lower.includes("rostova")) {
        matchedRole = "MENTOR";
      } else if (lower.includes("admin") || lower.includes("connor")) {
        matchedRole = "ADMIN";
      } else if (lower.includes("recruiter") || lower.includes("vance")) {
        matchedRole = "RECRUITER";
      }

      const targetRoute = await switchRole(matchedRole);
      router.replace(targetRoute as any);
    } catch (err: any) {
      setAuthError(err.message || "Invalid email or password");
    } finally {
      setLoading(false);
    }
  };

  const handleQuickDemoRole = async (role: UserRole) => {
    setLoading(true);
    try {
      const route = await switchRole(role);
      router.replace(route as any);
    } catch (err: any) {
      setAuthError(err.message || "Failed to switch role.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      style={styles.keyboardView}
    >
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.header}>
          <Text style={styles.appName}>
            SmartEvolve <Text style={{ color: colors.accent }}>AI</Text>
          </Text>
          <Text style={styles.title}>Welcome Back</Text>
          <Text style={styles.subtitle}>
            Sign in to your role-specific dashboard (Student, Mentor, Admin, Recruiter)
          </Text>
        </View>

        {authError ? (
          <View style={styles.errorBanner}>
            <Text style={styles.errorBannerText}>{authError}</Text>
          </View>
        ) : null}

        <View style={styles.form}>
          {/* Email */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Email Address</Text>
            <Controller
              control={control}
              name="email"
              render={({ field: { onChange, onBlur, value } }) => (
                <TextInput
                  style={[styles.input, errors.email && styles.inputError]}
                  placeholder="name@university.edu"
                  placeholderTextColor={colors.textMuted}
                  keyboardType="email-address"
                  autoCapitalize="none"
                  onBlur={onBlur}
                  onChangeText={onChange}
                  value={value}
                />
              )}
            />
            {errors.email && (
              <Text style={styles.fieldError}>{errors.email.message}</Text>
            )}
          </View>

          {/* Password */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Password</Text>
            <Controller
              control={control}
              name="password"
              render={({ field: { onChange, onBlur, value } }) => (
                <TextInput
                  style={[styles.input, errors.password && styles.inputError]}
                  placeholder="••••••••••••"
                  placeholderTextColor={colors.textMuted}
                  secureTextEntry
                  onBlur={onBlur}
                  onChangeText={onChange}
                  value={value}
                />
              )}
            />
            {errors.password && (
              <Text style={styles.fieldError}>{errors.password.message}</Text>
            )}
          </View>

          <View style={styles.forgotRow}>
            <Link href="/(auth)/forgot-password" asChild>
              <TouchableOpacity>
                <Text style={styles.forgotLinkText}>Forgot Password?</Text>
              </TouchableOpacity>
            </Link>
          </View>

          <Button
            title="Sign In to Dashboard"
            onPress={handleSubmit(onSubmit)}
            loading={loading}
            size="lg"
            style={{ marginTop: spacing.xs }}
          />

          {/* Quick 1-Click Role Login Panel */}
          <View style={styles.demoSection}>
            <Text style={styles.demoSectionTitle}>
              ⚡ 1-Click Role Test Logins:
            </Text>
            <Text style={styles.demoSectionSub}>
              Instantly test and verify permissions for each database role:
            </Text>

            <View style={styles.demoButtonsGrid}>
              <TouchableOpacity
                style={[styles.demoRoleBtn, { borderColor: "#3B82F6" }]}
                onPress={() => handleQuickDemoRole("STUDENT")}
                disabled={loading}
              >
                <Text style={styles.demoRoleEmoji}>🎓</Text>
                <View style={{ flex: 1 }}>
                  <Text style={styles.demoRoleName}>STUDENT</Text>
                  <Text style={styles.demoRoleUser}>Alex Chen</Text>
                </View>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.demoRoleBtn, { borderColor: "#10B981" }]}
                onPress={() => handleQuickDemoRole("MENTOR")}
                disabled={loading}
              >
                <Text style={styles.demoRoleEmoji}>👨‍🏫</Text>
                <View style={{ flex: 1 }}>
                  <Text style={styles.demoRoleName}>MENTOR / FACULTY</Text>
                  <Text style={styles.demoRoleUser}>Dr. Elena Rostova</Text>
                </View>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.demoRoleBtn, { borderColor: "#EF4444" }]}
                onPress={() => handleQuickDemoRole("ADMIN")}
                disabled={loading}
              >
                <Text style={styles.demoRoleEmoji}>🛡️</Text>
                <View style={{ flex: 1 }}>
                  <Text style={styles.demoRoleName}>ADMIN</Text>
                  <Text style={styles.demoRoleUser}>Sarah Connor</Text>
                </View>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.demoRoleBtn, { borderColor: "#A855F7" }]}
                onPress={() => handleQuickDemoRole("RECRUITER")}
                disabled={loading}
              >
                <Text style={styles.demoRoleEmoji}>💼</Text>
                <View style={{ flex: 1 }}>
                  <Text style={styles.demoRoleName}>RECRUITER</Text>
                  <Text style={styles.demoRoleUser}>Marcus Vance</Text>
                </View>
              </TouchableOpacity>
            </View>
          </View>

          <View style={styles.footerRow}>
            <Text style={styles.footerText}>Don't have an account?</Text>
            <Link href="/(auth)/register" asChild>
              <TouchableOpacity>
                <Text style={styles.linkText}>Create Account</Text>
              </TouchableOpacity>
            </Link>
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  keyboardView: {
    flex: 1,
    backgroundColor: colors.background,
  },
  scrollContent: {
    flexGrow: 1,
    padding: spacing.xl,
    justifyContent: "center",
    width: "100%",
    maxWidth: 520,
    alignSelf: "center",
  },
  header: {
    marginBottom: spacing.xl,
  },
  appName: {
    color: colors.primary,
    fontSize: 16,
    fontWeight: "800",
    letterSpacing: 0.5,
    marginBottom: spacing.xs,
  },
  title: {
    color: colors.textPrimary,
    fontSize: 30,
    fontWeight: "800",
  },
  subtitle: {
    color: colors.textSecondary,
    fontSize: 14,
    marginTop: 4,
    lineHeight: 20,
  },
  errorBanner: {
    backgroundColor: colors.errorBg,
    borderColor: colors.error,
    borderWidth: 1,
    borderRadius: radius.md,
    padding: spacing.sm,
    marginBottom: spacing.md,
  },
  errorBannerText: {
    color: colors.error,
    fontSize: 13,
    fontWeight: "600",
  },
  form: {
    gap: spacing.md,
  },
  inputGroup: {
    gap: 6,
  },
  label: {
    color: colors.textSecondary,
    fontSize: 13,
    fontWeight: "600",
  },
  input: {
    backgroundColor: colors.surface,
    borderColor: colors.cardBorder,
    borderWidth: 1,
    borderRadius: radius.md,
    paddingVertical: 14,
    paddingHorizontal: 16,
    color: colors.textPrimary,
    fontSize: 15,
  },
  inputError: {
    borderColor: colors.error,
  },
  fieldError: {
    color: colors.error,
    fontSize: 12,
    marginTop: 2,
  },
  demoSection: {
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.cardBorder,
    borderRadius: radius.lg,
    padding: spacing.md,
    marginTop: spacing.sm,
  },
  demoSectionTitle: {
    color: colors.textPrimary,
    fontSize: 13,
    fontWeight: "800",
  },
  demoSectionSub: {
    color: colors.textMuted,
    fontSize: 11,
    marginTop: 2,
    marginBottom: spacing.sm,
  },
  demoButtonsGrid: {
    gap: 8,
  },
  demoRoleBtn: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: colors.background,
    borderWidth: 1,
    borderRadius: radius.md,
    padding: 10,
    gap: 10,
  },
  demoRoleEmoji: {
    fontSize: 20,
  },
  demoRoleName: {
    color: colors.textPrimary,
    fontSize: 13,
    fontWeight: "800",
  },
  demoRoleUser: {
    color: colors.textSecondary,
    fontSize: 11,
  },
  forgotRow: {
    alignItems: "flex-end",
    marginTop: -spacing.xs,
    marginBottom: spacing.xs,
  },
  forgotLinkText: {
    color: colors.primary,
    fontSize: 13,
    fontWeight: "600",
  },
  footerRow: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    gap: 6,
    marginTop: spacing.sm,
  },
  footerText: {
    color: colors.textSecondary,
    fontSize: 14,
  },
  linkText: {
    color: colors.primary,
    fontSize: 14,
    fontWeight: "700",
  },
});
