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
import Svg, { Path } from "react-native-svg";
import { Button } from "../../src/components/Button";
import { supabase, isSupabaseConfigured } from "../../src/services/supabase";
import { colors, radius, spacing } from "../../src/theme/colors";

const resetSchema = z
  .object({
    password: z.string().min(6, "Password must be at least 6 characters"),
    confirmPassword: z.string().min(6, "Please confirm your password"),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

type ResetFormData = z.infer<typeof resetSchema>;

export default function ResetPasswordScreen() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [resetSuccess, setResetSuccess] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<ResetFormData>({
    resolver: zodResolver(resetSchema),
    defaultValues: { password: "", confirmPassword: "" },
  });

  const onSubmit = async (data: ResetFormData) => {
    setLoading(true);
    setErrorMsg(null);

    try {
      if (isSupabaseConfigured()) {
        const { error } = await supabase.auth.updateUser({
          password: data.password,
        });
        if (error) throw new Error(error.message);
      }
      setResetSuccess(true);
      Alert.alert(
        "Password Updated",
        "Your password has been changed securely. You can now sign in with your new credentials."
      );
    } catch (err: any) {
      setErrorMsg(err.message || "Failed to update password. Please check your reset link.");
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
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => router.replace("/(auth)/login")}
          >
            <Svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke={colors.textPrimary} strokeWidth="2">
              <Path d="M19 12H5M12 19l-7-7 7-7" />
            </Svg>
            <Text style={styles.backText}>Back to Sign In</Text>
          </TouchableOpacity>

          <Text style={styles.appName}>
            SmartEvolve <Text style={{ color: colors.accent }}>AI</Text>
          </Text>
          <Text style={styles.title}>Set New Password</Text>
          <Text style={styles.subtitle}>
            Create a secure password with a minimum of 6 characters for your SmartEvolve account.
          </Text>
        </View>

        {errorMsg ? (
          <View style={styles.errorBanner}>
            <Text style={styles.errorBannerText}>{errorMsg}</Text>
          </View>
        ) : null}

        {resetSuccess ? (
          <View style={styles.successCard}>
            <View style={styles.successIconWrap}>
              <Svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke={colors.success} strokeWidth="2.5">
                <Path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
                <Path d="M22 4L12 14.01l-3-3" />
              </Svg>
            </View>
            <Text style={styles.successTitle}>Password Reset Successful!</Text>
            <Text style={styles.successDesc}>
              Your account password has been updated. You can now access your role-specific dashboard.
            </Text>

            <Button
              title="Proceed to Sign In"
              onPress={() => router.replace("/(auth)/login")}
              size="lg"
              style={{ marginTop: spacing.lg, width: "100%" }}
            />
          </View>
        ) : (
          <View style={styles.form}>
            <View style={styles.inputGroup}>
              <Text style={styles.label}>New Password</Text>
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

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Confirm New Password</Text>
              <Controller
                control={control}
                name="confirmPassword"
                render={({ field: { onChange, onBlur, value } }) => (
                  <TextInput
                    style={[styles.input, errors.confirmPassword && styles.inputError]}
                    placeholder="••••••••••••"
                    placeholderTextColor={colors.textMuted}
                    secureTextEntry
                    onBlur={onBlur}
                    onChangeText={onChange}
                    value={value}
                  />
                )}
              />
              {errors.confirmPassword && (
                <Text style={styles.fieldError}>{errors.confirmPassword.message}</Text>
              )}
            </View>

            <Button
              title="Update Password"
              onPress={handleSubmit(onSubmit)}
              loading={loading}
              size="lg"
              style={{ marginTop: spacing.sm }}
            />
          </View>
        )}
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
    padding: spacing.xl,
    paddingTop: Platform.OS === "web" ? spacing.xxl : spacing.xl,
    maxWidth: 480,
    width: "100%",
    alignSelf: "center",
  },
  backButton: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: spacing.md,
    gap: spacing.xs,
  },
  backText: {
    color: colors.textSecondary,
    fontSize: 14,
    fontWeight: "600",
  },
  header: {
    marginBottom: spacing.xl,
  },
  appName: {
    fontSize: 22,
    fontWeight: "900",
    color: colors.textPrimary,
    letterSpacing: 0.5,
  },
  title: {
    fontSize: 28,
    fontWeight: "800",
    color: colors.textPrimary,
    marginTop: spacing.xs,
  },
  subtitle: {
    fontSize: 14,
    color: colors.textSecondary,
    marginTop: spacing.xs,
    lineHeight: 20,
  },
  form: {
    gap: spacing.md,
  },
  inputGroup: {
    gap: spacing.xs,
  },
  label: {
    fontSize: 13,
    fontWeight: "600",
    color: colors.textSecondary,
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  input: {
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.cardBorder,
    borderRadius: radius.md,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm + 2,
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
  errorBanner: {
    backgroundColor: "rgba(239, 68, 68, 0.12)",
    borderWidth: 1,
    borderColor: colors.error,
    borderRadius: radius.md,
    padding: spacing.md,
    marginBottom: spacing.md,
  },
  errorBannerText: {
    color: colors.error,
    fontSize: 14,
    fontWeight: "500",
  },
  successCard: {
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.cardBorder,
    borderRadius: radius.lg,
    padding: spacing.xl,
    alignItems: "center",
  },
  successIconWrap: {
    width: 68,
    height: 68,
    borderRadius: 34,
    backgroundColor: "rgba(16, 185, 129, 0.15)",
    borderWidth: 1,
    borderColor: colors.success,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: spacing.md,
  },
  successTitle: {
    fontSize: 20,
    fontWeight: "800",
    color: colors.textPrimary,
    marginBottom: spacing.xs,
  },
  successDesc: {
    fontSize: 14,
    color: colors.textSecondary,
    textAlign: "center",
    lineHeight: 22,
  },
});
