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
  ActivityIndicator,
} from "react-native";
import { useRouter } from "expo-router";
import Svg, { Path } from "react-native-svg";
import { Button } from "../../src/components/Button";
import { api } from "../../src/api/client";
import { colors, radius, spacing } from "../../src/theme/colors";

export default function ForgotPasswordScreen() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successInfo, setSuccessInfo] = useState<{
    sent: boolean;
    otp?: string;
    resetToken?: string;
  } | null>(null);

  // Quick OTP input for in-app recovery
  const [enteredOtp, setEnteredOtp] = useState("");

  const handleSendResetEmail = async () => {
    if (!email || !email.includes("@")) {
      setErrorMsg("Please enter a valid email address");
      return;
    }

    setLoading(true);
    setErrorMsg(null);

    try {
      const res = await api.sendForgotPassword(email.trim());
      setSuccessInfo({
        sent: true,
        resetToken: res.resetToken,
      });
    } catch (err: any) {
      setErrorMsg(err.message || "Failed to send password reset email. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleProceedWithOtp = () => {
    if (enteredOtp.length < 6) {
      setErrorMsg("Please enter the complete 6-digit verification code");
      return;
    }
    router.push({
      pathname: "/(auth)/reset-password",
      params: { email: email.trim(), token: enteredOtp.trim() },
    });
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
    >
      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Back Button */}
        <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
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
            Enter your registered academic email. We will send you a password reset link and a 6-digit verification OTP via Google SMTP.
          </Text>
        </View>

        {errorMsg ? (
          <View style={styles.errorBanner}>
            <Text style={styles.errorBannerText}>{errorMsg}</Text>
          </View>
        ) : null}

        {!successInfo ? (
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
              title="Send Password Reset Instructions"
              onPress={handleSendResetEmail}
              loading={loading}
              size="lg"
              style={{ marginTop: spacing.sm }}
            />
          </View>
        ) : (
          <View style={styles.successCard}>
            <View style={styles.successBadge}>
              <Text style={styles.successBadgeText}>✓ EMAIL SENT</Text>
            </View>
            <Text style={styles.successTitle}>Check Your Inbox</Text>
            <Text style={styles.successDesc}>
              We sent password reset instructions to <Text style={{ color: colors.textPrimary, fontWeight: "700" }}>{email}</Text>.
            </Text>

            <View style={styles.instructionBox}>
              <Text style={styles.instructionText}>
                • Click the link in the email to open the password reset page directly, OR{"\n"}
                • Enter the 6-digit OTP code below to reset in the app immediately:
              </Text>
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Enter 6-Digit Email OTP</Text>
              <TextInput
                style={[styles.input, styles.otpInput]}
                placeholder="000000"
                placeholderTextColor={colors.textMuted}
                keyboardType="number-pad"
                maxLength={6}
                value={enteredOtp}
                onChangeText={setEnteredOtp}
              />
            </View>

            <Button
              title="Verify Code & Create New Password →"
              onPress={handleProceedWithOtp}
              size="md"
              style={{ marginTop: spacing.xs }}
            />

            <TouchableOpacity
              style={styles.resendBtn}
              onPress={handleSendResetEmail}
              disabled={loading}
            >
              <Text style={styles.resendBtnText}>Didn't receive email? Tap to resend</Text>
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
  otpInput: {
    fontSize: 22,
    letterSpacing: 6,
    textAlign: "center",
    fontFamily: "monospace",
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
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: radius.full,
  },
  successBadgeText: {
    color: colors.success,
    fontSize: 11,
    fontWeight: "800",
  },
  successTitle: {
    fontSize: 18,
    fontWeight: "800",
    color: colors.textPrimary,
    marginTop: 4,
  },
  successDesc: {
    fontSize: 13,
    color: colors.textSecondary,
    textAlign: "center",
    lineHeight: 18,
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
  instructionText: {
    color: colors.textMuted,
    fontSize: 12,
    lineHeight: 18,
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
});

