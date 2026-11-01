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
} from "react-native";
import { useRouter, Link } from "expo-router";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import Svg, { Path } from "react-native-svg";
import { Button } from "../../src/components/Button";
import { supabase, isSupabaseConfigured } from "../../src/services/supabase";
import { colors, radius, spacing } from "../../src/theme/colors";

const forgotSchema = z.object({
  email: z.string().email("Enter a valid email address"),
});

type ForgotFormData = z.infer<typeof forgotSchema>;

export default function ForgotPasswordScreen() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const {
    control,
    handleSubmit,
    getValues,
    formState: { errors },
  } = useForm<ForgotFormData>({
    resolver: zodResolver(forgotSchema),
    defaultValues: { email: "" },
  });

  const onSubmit = async (data: ForgotFormData) => {
    setLoading(true);
    setErrorMsg(null);

    try {
      if (isSupabaseConfigured()) {
        const { error } = await supabase.auth.resetPasswordForEmail(data.email, {
          redirectTo: "smartevolve://reset-password",
        });
        if (error) throw new Error(error.message);
      }
      setSubmitted(true);
    } catch (err: any) {
      setErrorMsg(err.message || "Failed to send reset email. Please try again.");
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
          <Text style={styles.title}>Reset Password</Text>
          <Text style={styles.subtitle}>
            Enter the email associated with your SmartEvolve AI account to receive secure recovery instructions.
          </Text>
        </View>

        {errorMsg ? (
          <View style={styles.errorBanner}>
            <Text style={styles.errorBannerText}>{errorMsg}</Text>
          </View>
        ) : null}

        {submitted ? (
          <View style={styles.successCard}>
            <View style={styles.successIconWrap}>
              <Svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke={colors.success} strokeWidth="2.5">
                <Path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
                <Path d="M22 4L12 14.01l-3-3" />
              </Svg>
            </View>
            <Text style={styles.successTitle}>Recovery Email Sent</Text>
            <Text style={styles.successDesc}>
              We have dispatched a password reset link to <Text style={{ color: colors.accent, fontWeight: "700" }}>{getValues("email")}</Text>.
              Please inspect your inbox and click the verification link.
            </Text>

            <Button
              title="Enter Reset Token / Password"
              onPress={() => router.push("/(auth)/reset-password")}
              size="lg"
              style={{ marginTop: spacing.lg }}
            />

            <TouchableOpacity
              style={styles.resendBtn}
              onPress={() => setSubmitted(false)}
            >
              <Text style={styles.resendText}>Didn't receive email? Try another address</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <View style={styles.form}>
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Email Address</Text>
              <Controller
                control={control}
                name="email"
                render={({ field: { onChange, onBlur, value } }) => (
                  <TextInput
                    style={[styles.input, errors.email && styles.inputError]}
                    placeholder="student@university.edu"
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

            <Button
              title="Send Password Reset Link"
              onPress={handleSubmit(onSubmit)}
              loading={loading}
              size="lg"
              style={{ marginTop: spacing.sm }}
            />

            <View style={styles.footerLinkRow}>
              <Text style={styles.footerText}>Remember your password? </Text>
              <Link href="/(auth)/login" asChild>
                <TouchableOpacity>
                  <Text style={styles.footerLink}>Sign In</Text>
                </TouchableOpacity>
              </Link>
            </View>
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
  resendBtn: {
    marginTop: spacing.md,
    padding: spacing.sm,
  },
  resendText: {
    color: colors.textMuted,
    fontSize: 13,
    textDecorationLine: "underline",
  },
  footerLinkRow: {
    flexDirection: "row",
    justifyContent: "center",
    marginTop: spacing.md,
  },
  footerText: {
    color: colors.textSecondary,
    fontSize: 14,
  },
  footerLink: {
    color: colors.primary,
    fontSize: 14,
    fontWeight: "700",
  },
});
