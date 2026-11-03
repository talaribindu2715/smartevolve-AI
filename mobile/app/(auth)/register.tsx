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
  Modal,
  ActivityIndicator,
} from "react-native";
import { useRouter } from "expo-router";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Button } from "../../src/components/Button";
import { useAuth } from "../../src/store/authContext";
import { supabase, isSupabaseConfigured } from "../../src/services/supabase";
import { api } from "../../src/api/client";
import { colors, radius, spacing } from "../../src/theme/colors";

const registerSchema = z
  .object({
    fullName: z.string().min(2, "Full name must be at least 2 characters"),
    email: z.string().email("Enter a valid email address"),
    password: z.string().min(6, "Password must be at least 6 characters"),
    confirmPassword: z.string().min(6, "Please confirm your password"),
    educationLevel: z.string().min(2, "Education level is required"),
    institution: z.string().optional(),
    branch: z.string().min(2, "Degree or branch is required"),
    graduationYear: z.string().optional(),
    interests: z.string().optional(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

type RegisterFormData = z.infer<typeof registerSchema>;

export default function RegisterScreen() {
  const router = useRouter();
  const { login } = useAuth();
  const [loading, setLoading] = useState(false);
  const [authError, setAuthError] = useState<string | null>(null);

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // Google SMTP OTP Verification Modal State
  const [otpModalVisible, setOtpModalVisible] = useState(false);
  const [otpCode, setOtpCode] = useState("");
  const [otpSending, setOtpSending] = useState(false);
  const [otpVerifying, setOtpVerifying] = useState(false);
  const [otpError, setOtpError] = useState<string | null>(null);
  const [pendingFormData, setPendingFormData] = useState<RegisterFormData | null>(null);

  const {
    control,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      fullName: "",
      email: "",
      password: "",
      confirmPassword: "",
      educationLevel: "Undergraduate B.Tech",
      institution: "MIT Engineering",
      branch: "Computer Science",
      graduationYear: "2027",
      interests: "AI, Machine Learning, Data Analytics",
    },
  });

  const onSubmit = async (data: RegisterFormData) => {
    setAuthError(null);
    setPendingFormData(data);
    setOtpCode(""); // User will enter the real OTP received in their email
    setOtpModalVisible(true);
    setOtpSending(true);
    setOtpError(null);

    try {
      // 1. Dispatch real Supabase verification email with 6-digit OTP via Google SMTP
      if (isSupabaseConfigured()) {
        const { error } = await supabase.auth.signUp({
          email: data.email.trim(),
          password: data.password,
          options: {
            data: {
              full_name: data.fullName,
              education_level: data.educationLevel,
              institution: data.institution || "Engineering College",
              branch: data.branch,
              graduation_year: data.graduationYear ? parseInt(data.graduationYear, 10) : 2027,
            },
          },
        });

        if (error) {
          if (error.message.toLowerCase().includes("already registered")) {
            // If already registered, resend the signup OTP
            await supabase.auth.resend({
              type: "signup",
              email: data.email.trim(),
            });
          } else {
            console.warn("Supabase signUp notice:", error.message);
          }
        }
      }

      // 2. Also notify Spring Boot backend
      api.sendSignupOtp(data.email.trim()).catch(() => {});
    } catch (e: any) {
      console.warn("Error sending signup OTP:", e);
    } finally {
      setOtpSending(false);
    }
  };

  const handleVerifyOtpAndRegister = async () => {
    if (!pendingFormData) return;
    if (otpCode.trim().length < 6) {
      setOtpError("Please enter the complete 6-digit verification code from your email");
      return;
    }

    setOtpVerifying(true);
    setOtpError(null);

    try {
      let token = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.fake";
      let userId = "00000000-0000-0000-0000-000000000001";
      let verified = false;

      // 1. Verify OTP with Supabase
      if (isSupabaseConfigured()) {
        const { data: verifyData, error: verifyError } = await supabase.auth.verifyOtp({
          email: pendingFormData.email.trim(),
          token: otpCode.trim(),
          type: "signup",
        });

        if (verifyError) {
          // Retry with type "email"
          const { data: retryData, error: retryError } = await supabase.auth.verifyOtp({
            email: pendingFormData.email.trim(),
            token: otpCode.trim(),
            type: "email",
          });

          if (!retryError && retryData) {
            verified = true;
            if (retryData.session) {
              token = retryData.session.access_token;
              userId = retryData.session.user.id;
            } else if (retryData.user) {
              userId = retryData.user.id;
            }
          }
        } else if (verifyData) {
          verified = true;
          if (verifyData.session) {
            token = verifyData.session.access_token;
            userId = verifyData.session.user.id;
          } else if (verifyData.user) {
            userId = verifyData.user.id;
          }
        }
      }

      // 2. Check Backend if Supabase verify had an issue
      if (!verified) {
        try {
          await api.verifySignupOtp(pendingFormData.email.trim(), otpCode.trim());
          verified = true;
        } catch (_) {}
      }

      // If still not verified, show error
      if (!verified && isSupabaseConfigured()) {
        setOtpError("Invalid verification code. Please check your inbox or spam folder.");
        setOtpVerifying(false);
        return;
      }

      // 3. Complete Session & Login
      setOtpModalVisible(false);
      setLoading(true);
      await login(token, userId);

      // 4. Save initial profile details
      try {
        await api.updateProfile({
          fullName: pendingFormData.fullName,
          educationLevel: pendingFormData.educationLevel,
          institution: pendingFormData.institution || "Engineering College",
          branch: pendingFormData.branch,
          graduationYear: pendingFormData.graduationYear ? parseInt(pendingFormData.graduationYear, 10) : 2027,
          onboardingCompleted: true,
        });
      } catch (_) {}

      router.replace("/(tabs)");
    } catch (err: any) {
      setOtpError(err.message || "Failed to verify code and register account");
    } finally {
      setOtpVerifying(false);
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
          <Text style={styles.appName}>SmartEvolve <Text style={{ color: colors.accent }}>AI</Text></Text>
          <Text style={styles.title}>Create Account</Text>
          <Text style={styles.subtitle}>Start your personalized, blockchain-backed career roadmap</Text>
        </View>

        {authError ? (
          <View style={styles.errorBanner}>
            <Text style={styles.errorBannerText}>{authError}</Text>
          </View>
        ) : null}

        <View style={styles.form}>
          {/* Full Name */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Full Name *</Text>
            <Controller
              control={control}
              name="fullName"
              render={({ field: { onChange, onBlur, value } }) => (
                <TextInput
                  style={[styles.input, errors.fullName && styles.inputError]}
                  placeholder="Alex Chen"
                  placeholderTextColor={colors.textMuted}
                  onBlur={onBlur}
                  onChangeText={onChange}
                  value={value}
                />
              )}
            />
            {errors.fullName?.message ? (
              <Text style={styles.fieldError}>{errors.fullName.message}</Text>
            ) : null}
          </View>

          {/* Email */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Email Address *</Text>
            <Controller
              control={control}
              name="email"
              render={({ field: { onChange, onBlur, value } }) => (
                <TextInput
                  style={[styles.input, errors.email && styles.inputError]}
                  placeholder="alex.chen@university.edu"
                  placeholderTextColor={colors.textMuted}
                  keyboardType="email-address"
                  autoCapitalize="none"
                  onBlur={onBlur}
                  onChangeText={onChange}
                  value={value}
                />
              )}
            />
            {errors.email?.message ? (
              <Text style={styles.fieldError}>{errors.email.message}</Text>
            ) : null}
          </View>

          {/* Password with View Toggle */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Password *</Text>
            <Controller
              control={control}
              name="password"
              render={({ field: { onChange, onBlur, value } }) => (
                <View style={[styles.passwordInputWrap, errors.password && styles.inputError]}>
                  <TextInput
                    style={styles.passwordInputField}
                    placeholder="••••••••••••"
                    placeholderTextColor={colors.textMuted}
                    secureTextEntry={!showPassword}
                    onBlur={onBlur}
                    onChangeText={onChange}
                    value={value}
                  />
                  <TouchableOpacity
                    style={styles.eyeToggleBtn}
                    onPress={() => setShowPassword(!showPassword)}
                    activeOpacity={0.7}
                  >
                    <Text style={styles.eyeToggleText}>{showPassword ? "Hide" : "Show"}</Text>
                  </TouchableOpacity>
                </View>
              )}
            />
            {errors.password?.message ? (
              <Text style={styles.fieldError}>{errors.password.message}</Text>
            ) : null}
          </View>

          {/* Confirm Password with View Toggle */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Confirm Password *</Text>
            <Controller
              control={control}
              name="confirmPassword"
              render={({ field: { onChange, onBlur, value } }) => (
                <View style={[styles.passwordInputWrap, errors.confirmPassword && styles.inputError]}>
                  <TextInput
                    style={styles.passwordInputField}
                    placeholder="••••••••••••"
                    placeholderTextColor={colors.textMuted}
                    secureTextEntry={!showConfirmPassword}
                    onBlur={onBlur}
                    onChangeText={onChange}
                    value={value}
                  />
                  <TouchableOpacity
                    style={styles.eyeToggleBtn}
                    onPress={() => setShowConfirmPassword(!showConfirmPassword)}
                    activeOpacity={0.7}
                  >
                    <Text style={styles.eyeToggleText}>{showConfirmPassword ? "Hide" : "Show"}</Text>
                  </TouchableOpacity>
                </View>
              )}
            />
            {errors.confirmPassword?.message ? (
              <Text style={styles.fieldError}>{errors.confirmPassword.message}</Text>
            ) : null}
          </View>

          {/* Degree & Branch */}
          <View style={styles.rowInputs}>
            <View style={[styles.inputGroup, { flex: 1 }]}>
              <Text style={styles.label}>Branch / Degree *</Text>
              <Controller
                control={control}
                name="branch"
                render={({ field: { onChange, onBlur, value } }) => (
                  <TextInput
                    style={[styles.input, errors.branch && styles.inputError]}
                    placeholder="Computer Science"
                    placeholderTextColor={colors.textMuted}
                    onBlur={onBlur}
                    onChangeText={onChange}
                    value={value}
                  />
                )}
              />
            </View>

            <View style={[styles.inputGroup, { width: 110 }]}>
              <Text style={styles.label}>Grad Year</Text>
              <Controller
                control={control}
                name="graduationYear"
                render={({ field: { onChange, onBlur, value } }) => (
                  <TextInput
                    style={styles.input}
                    placeholder="2027"
                    placeholderTextColor={colors.textMuted}
                    keyboardType="numeric"
                    onBlur={onBlur}
                    onChangeText={onChange}
                    value={value}
                  />
                )}
              />
            </View>
          </View>

          {/* College or Institution */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>College or Institution (Optional)</Text>
            <Controller
              control={control}
              name="institution"
              render={({ field: { onChange, onBlur, value } }) => (
                <TextInput
                  style={styles.input}
                  placeholder="K.S.R.M. College of Engineering"
                  placeholderTextColor={colors.textMuted}
                  onBlur={onBlur}
                  onChangeText={onChange}
                  value={value}
                />
              )}
            />
          </View>

          <Button
            title="Create Student Profile & Verify Email"
            onPress={handleSubmit(onSubmit)}
            loading={loading}
            size="lg"
            style={{ marginTop: spacing.sm }}
          />

          <View style={styles.footerRow}>
            <Text style={styles.footerText}>Already have an account?</Text>
            <TouchableOpacity onPress={() => router.push("/(auth)/login")}>
              <Text style={styles.linkText}>Sign In</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Google SMTP Email OTP Verification Modal */}
        <Modal visible={otpModalVisible} transparent animationType="fade">
          <View style={styles.modalOverlay}>
            <View style={styles.modalBody}>
              <View style={styles.modalHeader}>
                <Text style={styles.modalTitle}>Verify Academic Email</Text>
                <TouchableOpacity onPress={() => setOtpModalVisible(false)}>
                  <Text style={styles.modalCloseText}>✕</Text>
                </TouchableOpacity>
              </View>

              <Text style={styles.modalSub}>
                We sent a 6-digit verification code to:
              </Text>
              <Text style={styles.modalEmailText}>{pendingFormData?.email}</Text>
              <Text style={{ color: colors.textMuted, fontSize: 11, textAlign: "center", marginBottom: 12 }}>
                Please check your Gmail inbox (and Spam folder) for the 6-digit verification code.
              </Text>

              {otpError ? (
                <View style={styles.otpErrorBanner}>
                  <Text style={styles.otpErrorText}>{otpError}</Text>
                </View>
              ) : null}

              {otpSending ? (
                <View style={{ paddingVertical: 20, alignItems: "center" }}>
                  <ActivityIndicator size="small" color={colors.primary} />
                  <Text style={{ color: colors.textMuted, fontSize: 12, marginTop: 8 }}>
                    Dispatching verification email...
                  </Text>
                </View>
              ) : (
                <View style={{ marginVertical: spacing.md }}>
                  <Text style={styles.otpLabel}>Enter 6-Digit OTP</Text>
                  <TextInput
                    style={styles.otpInput}
                    placeholder="000000"
                    placeholderTextColor={colors.textMuted}
                    keyboardType="number-pad"
                    maxLength={6}
                    value={otpCode}
                    onChangeText={(val) => {
                      setOtpCode(val);
                      setOtpError(null);
                    }}
                  />
                </View>
              )}

              <Button
                title="Verify Code & Complete Registration"
                onPress={handleVerifyOtpAndRegister}
                loading={otpVerifying}
                size="md"
                style={{ width: "100%", marginTop: spacing.xs }}
              />

              <TouchableOpacity
                style={styles.resendOtpBtn}
                onPress={async () => {
                  if (pendingFormData) {
                    setOtpSending(true);
                    setOtpError(null);
                    try {
                      if (isSupabaseConfigured()) {
                        await supabase.auth.resend({
                          type: "signup",
                          email: pendingFormData.email.trim(),
                        });
                      }
                      await api.sendSignupOtp(pendingFormData.email.trim());
                    } catch (_) {}
                    finally {
                      setOtpSending(false);
                    }
                  }
                }}
              >
                <Text style={styles.resendOtpText}>Didn't receive email? Tap to resend code</Text>
              </TouchableOpacity>
            </View>
          </View>
        </Modal>
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
    paddingTop: spacing.xxl,
    width: "100%",
    maxWidth: 480,
    alignSelf: "center",
  },
  header: {
    marginBottom: spacing.lg,
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
    fontSize: 28,
    fontWeight: "800",
  },
  subtitle: {
    color: colors.textSecondary,
    fontSize: 14,
    marginTop: 4,
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
    gap: spacing.sm,
  },
  rowInputs: {
    flexDirection: "row",
    gap: spacing.sm,
  },
  inputGroup: {
    gap: 4,
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
    paddingVertical: 12,
    paddingHorizontal: 16,
    color: colors.textPrimary,
    fontSize: 14,
  },
  passwordInputWrap: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: colors.surface,
    borderColor: colors.cardBorder,
    borderWidth: 1,
    borderRadius: radius.md,
  },
  passwordInputField: {
    flex: 1,
    paddingHorizontal: spacing.md,
    paddingVertical: 12,
    color: colors.textPrimary,
    fontSize: 14,
  },
  eyeToggleBtn: {
    paddingHorizontal: spacing.md,
    paddingVertical: 10,
  },
  eyeToggleText: {
    color: colors.primary,
    fontSize: 12,
    fontWeight: "700",
  },
  inputError: {
    borderColor: colors.error,
  },
  fieldError: {
    color: colors.error,
    fontSize: 12,
  },
  footerRow: {
    flexDirection: "row",
    justifyContent: "center",
    gap: 6,
    marginTop: spacing.md,
    marginBottom: spacing.xl,
  },
  footerText: {
    color: colors.textMuted,
    fontSize: 14,
  },
  linkText: {
    color: colors.primary,
    fontSize: 14,
    fontWeight: "700",
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.75)",
    justifyContent: "center",
    alignItems: "center",
    padding: spacing.md,
  },
  modalBody: {
    width: "100%",
    maxWidth: 440,
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    padding: spacing.lg,
    borderColor: colors.cardBorder,
    borderWidth: 1,
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: spacing.xs,
  },
  modalTitle: {
    color: colors.textPrimary,
    fontSize: 18,
    fontWeight: "800",
  },
  modalCloseText: {
    color: colors.textMuted,
    fontSize: 18,
    fontWeight: "700",
  },
  modalSub: {
    color: colors.textSecondary,
    fontSize: 13,
    marginTop: 4,
  },
  modalEmailText: {
    color: colors.accent,
    fontSize: 14,
    fontWeight: "700",
    marginBottom: spacing.sm,
  },
  otpLabel: {
    color: colors.textMuted,
    fontSize: 11,
    fontWeight: "700",
    textTransform: "uppercase",
    marginBottom: 6,
    textAlign: "center",
  },
  otpInput: {
    backgroundColor: colors.background,
    borderColor: colors.cardBorder,
    borderWidth: 1,
    borderRadius: radius.md,
    paddingVertical: 12,
    fontSize: 24,
    letterSpacing: 8,
    textAlign: "center",
    color: colors.textPrimary,
    fontFamily: "monospace",
  },
  otpErrorBanner: {
    backgroundColor: "rgba(239, 68, 68, 0.15)",
    borderColor: colors.error,
    borderWidth: 1,
    borderRadius: radius.sm,
    padding: spacing.xs,
    marginVertical: spacing.xs,
  },
  otpErrorText: {
    color: colors.error,
    fontSize: 12,
    textAlign: "center",
  },
  resendOtpBtn: {
    paddingVertical: spacing.sm,
    marginTop: spacing.xs,
  },
  resendOtpText: {
    color: colors.primary,
    fontSize: 12,
    fontWeight: "600",
    textAlign: "center",
  },
});
