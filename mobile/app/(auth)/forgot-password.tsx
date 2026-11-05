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
import { useRouter } from "expo-router";
import Svg, { Path } from "react-native-svg";
import { Button } from "../../src/components/Button";
import { api } from "../../src/api/client";
import { supabase } from "../../src/services/supabase";
import { colors, radius, spacing } from "../../src/theme/colors";

export default function ForgotPasswordScreen() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [isSent, setIsSent] = useState(false);

  const handleSendResetEmail = async () => {
    if (!email || !email.includes("@")) {
      setErrorMsg("Please enter a valid email address");
      return;
    }

    setLoading(true);
    setErrorMsg(null);

    const isLocalhost =
      Platform.OS === "web" &&
      typeof window !== "undefined" &&
      (window.location.hostname === "localhost" || window.location.hostname === "127.0.0.1");

    const liveBaseUrl = "https://smartevolve-ai-mobile-sand.vercel.app";
    const origin =
      Platform.OS === "web" && typeof window !== "undefined" && !isLocalhost
        ? window.location.origin
        : liveBaseUrl;

    const redirectUrl = `${origin}/reset-password`;

    let supabaseSuccess = false;
    let backendSuccess = false;

    // 1. Send via Supabase Auth (Official Google SMTP)
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email.trim(), {
        redirectTo: redirectUrl,
      });
      if (!error) {
        supabaseSuccess = true;
      } else {
        console.warn("Supabase resetPasswordForEmail warning:", error.message);
      }
    } catch (err: any) {
      console.warn("Supabase reset error:", err?.message);
    }

    // 2. Dispatch via Backend API (Direct Google SMTP dispatch fallback)
    try {
      await api.sendForgotPassword(email.trim());
      backendSuccess = true;
    } catch (err: any) {
      console.warn("Backend reset error:", err?.message);
    }

    setLoading(false);

    if (supabaseSuccess || backendSuccess) {
      setIsSent(true);
    } else {
      // Even if both report rate limits, let the user know to check their inbox
      setIsSent(true);
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
    >
      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Back Button */}
        <TouchableOpacity style={styles.backBtn} onPress={() => router.replace("/(auth)/login")}>
          <Svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke={colors.textPrimary} strokeWidth="2">
            <Path d="M19 12H5M12 19l-7-7 7-7" />
          </Svg>
          <Text style={styles.backBtnText}>Back to Sign In</Text>
        </TouchableOpacity>

        <View style={styles.header}>
          <View style={styles.iconCircle}>
            <Svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke={colors.primary} strokeWidth="2">
              <Path d="M21 2l-2 2m-1.5 1.5L12 11M3 21l3-3m-3 3l3-3m0 0l2.5-2.5M14 6l4 4" />
            </Svg>
          </View>
          <Text style={styles.title}>Reset Your Password</Text>
          <Text style={styles.subtitle}>
            Enter your registered academic email. We will send a secure direct recovery link to your inbox. No OTP required.
          </Text>
        </View>

        {errorMsg ? (
          <View style={styles.errorBanner}>
            <Text style={styles.errorBannerText}>{errorMsg}</Text>
          </View>
        ) : null}

        {!isSent ? (
          <View style={styles.form}>
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Email Address</Text>
              <TextInput
                style={styles.input}
                placeholder="student@university.edu"
                placeholderTextColor={colors.textMuted}
                keyboardType="email-address"
                autoCapitalize="none"
                value={email}
                onChangeText={(text) => {
                  setEmail(text);
                  setErrorMsg(null);
                }}
              />
            </View>

            <Button
              title="Send Direct Reset Link"
              onPress={handleSendResetEmail}
              loading={loading}
              size="lg"
              style={{ marginTop: spacing.sm }}
            />
          </View>
        ) : (
          <View style={styles.sentHyperlinksWrap}>
            <TouchableOpacity
              style={styles.hyperlinkItem}
              onPress={() => router.replace("/(auth)/login")}
              activeOpacity={0.7}
            >
              <Text style={styles.primaryHyperlinkText}>Return to Sign In</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.hyperlinkItem}
              onPress={handleSendResetEmail}
              disabled={loading}
              activeOpacity={0.7}
            >
              <Text style={styles.secondaryHyperlinkText}>
                {loading ? "Resending link..." : "Didn't receive email? Tap to resend link"}
              </Text>
            </TouchableOpacity>
          </View>
        )}
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  scrollContent: {
    padding: spacing.lg,
    maxWidth: 480,
    width: "100%",
    alignSelf: "center",
  },
  backBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginTop: spacing.xl,
    marginBottom: spacing.md,
  },
  backBtnText: {
    color: colors.textSecondary,
    fontSize: 14,
    fontWeight: "600",
  },
  header: {
    alignItems: "center",
    marginBottom: spacing.xl,
  },
  iconCircle: {
    width: 60,
    height: 60,
    borderRadius: radius.full,
    backgroundColor: "rgba(99, 102, 241, 0.15)",
    borderColor: "rgba(99, 102, 241, 0.3)",
    borderWidth: 1,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: spacing.md,
  },
  title: {
    fontSize: 22,
    fontWeight: "800",
    color: colors.textPrimary,
    textAlign: "center",
  },
  subtitle: {
    fontSize: 13,
    color: colors.textSecondary,
    textAlign: "center",
    marginTop: spacing.xs,
    lineHeight: 19,
  },
  errorBanner: {
    backgroundColor: "rgba(239, 68, 68, 0.15)",
    borderColor: colors.error,
    borderWidth: 1,
    borderRadius: radius.md,
    padding: spacing.md,
    marginBottom: spacing.md,
  },
  errorBannerText: {
    color: colors.error,
    fontSize: 13,
    textAlign: "center",
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
  },
  input: {
    backgroundColor: colors.surface,
    borderColor: colors.cardBorder,
    borderWidth: 1,
    borderRadius: radius.md,
    paddingHorizontal: spacing.md,
    paddingVertical: 12,
    color: colors.textPrimary,
    fontSize: 14,
  },
  successCard: {
    backgroundColor: colors.surface,
    borderColor: colors.cardBorder,
    borderWidth: 1,
    borderRadius: radius.lg,
    padding: spacing.lg,
    alignItems: "center",
    gap: spacing.sm,
  },
  successBadge: {
    backgroundColor: "rgba(16, 185, 129, 0.15)",
    borderColor: colors.success,
    borderWidth: 1,
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: radius.full,
  },
  successBadgeText: {
    color: colors.success,
    fontSize: 11,
    fontWeight: "800",
    letterSpacing: 0.5,
  },
  successTitle: {
    fontSize: 20,
    fontWeight: "800",
    color: colors.textPrimary,
    marginTop: 4,
  },
  successDesc: {
    fontSize: 13,
    color: colors.textSecondary,
    textAlign: "center",
    lineHeight: 19,
  },
  instructionBox: {
    backgroundColor: colors.background,
    borderColor: colors.cardBorder,
    borderWidth: 1,
    borderRadius: radius.md,
    padding: spacing.md,
    width: "100%",
    marginVertical: spacing.xs,
  },
  instructionTitle: {
    color: colors.textPrimary,
    fontSize: 13,
    fontWeight: "700",
    marginBottom: spacing.xs,
  },
  instructionText: {
    color: colors.textSecondary,
    fontSize: 12,
    lineHeight: 19,
  },
  resendBtn: {
    paddingVertical: spacing.sm,
    marginTop: spacing.xs,
  },
  resendBtnText: {
    color: colors.primary,
    fontSize: 12,
    fontWeight: "600",
    textAlign: "center",
  },
  sentHyperlinksWrap: {
    alignItems: "center",
    justifyContent: "center",
    marginTop: spacing.xl,
    gap: 16,
  },
  hyperlinkItem: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    alignItems: "center",
    justifyContent: "center",
  },
  primaryHyperlinkText: {
    color: "#818CF8",
    fontSize: 16,
    fontWeight: "800",
    letterSpacing: 0.2,
    textAlign: "center",
  },
  secondaryHyperlinkText: {
    color: "#94A3B8",
    fontSize: 14.5,
    fontWeight: "600",
    textAlign: "center",
  },
});
