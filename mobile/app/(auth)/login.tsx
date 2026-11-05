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
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Button } from "../../src/components/Button";
import { useAuth } from "../../src/store/authContext";
import { supabase, isSupabaseConfigured } from "../../src/services/supabase";
import { colors, radius, spacing } from "../../src/theme/colors";

const loginSchema = z.object({
  email: z.string().email("Enter a valid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

type LoginFormData = z.infer<typeof loginSchema>;

export default function LoginScreen() {
  const router = useRouter();
  const { login } = useAuth();
  const [loading, setLoading] = useState(false);
  const [authError, setAuthError] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);

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
          const userMeta = authData.session.user?.user_metadata || {};
          const metaName = userMeta.full_name || userMeta.fullName || userMeta.name || "Bunny pradeep";
          await login(authData.session.access_token, authData.session.user.id, {
            fullName: metaName,
            institution: userMeta.institution,
            branch: userMeta.branch,
            graduationYear: userMeta.graduation_year ? Number(userMeta.graduation_year) : 2027,
          });
          router.replace("/(tabs)");
          return;
        }
      }

      // Fallback for demo student / offline testing
      const mockToken = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIwMDAwMDAwMC0wMDAwLTAwMDAtMDAwMC0wMDAwMDAwMDAwMDEiLCJlbWFpbCI6IiIgKyBkYXRhLmVtYWlsLCJyb2xlIjoiYXV0aGVudGljYXRlZCJ9.fake";
      const userId = "00000000-0000-0000-0000-000000000001";

      await login(mockToken, userId);
      router.replace("/(tabs)");
    } catch (err: any) {
      setAuthError(err.message || "Invalid email or password");
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
          <Text style={styles.appName}>SmartEvolve <Text style={{ color: colors.accent }}>AI</Text></Text>
          <Text style={styles.title}>Welcome Back</Text>
          <Text style={styles.subtitle}>Sign in to continue your adaptive learning journey</Text>
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
            {errors.email?.message ? (
              <Text style={styles.fieldError}>{errors.email.message}</Text>
            ) : null}
          </View>

          {/* Password with View Toggle & Forgot Password Link */}
          <View style={styles.inputGroup}>
            <View style={styles.passwordHeaderRow}>
              <Text style={styles.label}>Password</Text>
              <TouchableOpacity onPress={() => router.push("/(auth)/forgot-password")}>
                <Text style={styles.forgotPasswordLink}>Forgot Password?</Text>
              </TouchableOpacity>
            </View>
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


          <Button
            title="Sign In"
            onPress={handleSubmit(onSubmit)}
            loading={loading}
            size="lg"
            style={{ marginTop: spacing.sm }}
          />


          <View style={styles.footerRow}>
            <Text style={styles.footerText}>Don't have an account?</Text>
            <TouchableOpacity onPress={() => router.push("/(auth)/register")}>
              <Text style={styles.linkText}>Create Account</Text>
            </TouchableOpacity>
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
    maxWidth: 480,
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
  passwordHeaderRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  forgotPasswordLink: {
    color: colors.primary,
    fontSize: 12,
    fontWeight: "700",
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
    paddingVertical: 14,
    color: colors.textPrimary,
    fontSize: 15,
  },
  eyeToggleBtn: {
    paddingHorizontal: spacing.md,
    paddingVertical: 12,
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
});
