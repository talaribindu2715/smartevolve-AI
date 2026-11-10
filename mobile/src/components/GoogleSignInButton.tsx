import React, { useState } from "react";
import {
  TouchableOpacity,
  Text,
  StyleSheet,
  ActivityIndicator,
  View,
  Platform,
  ViewStyle,
} from "react-native";
import Svg, { Path } from "react-native-svg";
import * as Linking from "expo-linking";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { supabase, isSupabaseConfigured } from "../services/supabase";
import { colors, radius, spacing } from "../theme/colors";

interface GoogleSignInButtonProps {
  mode?: "signIn" | "signUp";
  getExtraData?: () => Record<string, any>;
  extraData?: Record<string, any>;
  onSuccess?: () => void;
  onError?: (errorMessage: string) => void;
  style?: ViewStyle;
  disabled?: boolean;
}

export const GoogleSignInButton: React.FC<GoogleSignInButtonProps> = ({
  mode = "signIn",
  getExtraData,
  extraData,
  onSuccess,
  onError,
  style,
  disabled = false,
}) => {
  const [loading, setLoading] = useState(false);

  const handleGooglePress = async () => {
    if (loading || disabled) return;

    if (!isSupabaseConfigured()) {
      const msg = "Supabase is not configured yet. Please check your credentials.";
      if (onError) onError(msg);
      return;
    }

    setLoading(true);

    try {
      const isWeb = Platform.OS === "web";
      const metadata = getExtraData ? getExtraData() : extraData || {};

      // Persist student academic details to storage so authContext syncs them on session initialization
      if (metadata && Object.keys(metadata).length > 0) {
        try {
          await AsyncStorage.setItem(
            "smartevolve_user_metadata",
            JSON.stringify({
              institution: metadata.institution || "Engineering College",
              branch: metadata.branch || "Computer Science",
              graduationYear: metadata.graduation_year || metadata.graduationYear || 2027,
              educationLevel: metadata.education_level || metadata.educationLevel || "Undergraduate B.Tech",
            })
          );
          if (metadata.full_name) {
            await AsyncStorage.setItem("smartevolve_student_name", metadata.full_name);
          }
        } catch (_) {}
      }

      // Determine redirect URL
      let redirectUrl: string;
      if (isWeb && typeof window !== "undefined") {
        redirectUrl = window.location.origin;
      } else {
        redirectUrl = Linking.createURL("/");
      }

      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: "google",
        options: {
          redirectTo: redirectUrl,
          scopes: "email profile",
          queryParams: {
            access_type: "offline",
            prompt: "select_account",
          },
          skipBrowserRedirect: !isWeb,
        },
      });

      if (error) {
        throw new Error(error.message);
      }

      if (!isWeb && data?.url) {
        await Linking.openURL(data.url);
      }

      if (onSuccess) {
        onSuccess();
      }
    } catch (err: any) {
      console.warn("Google OAuth Error:", err);
      const friendlyMsg =
        err?.message || "Google sign-in could not be completed. Please try again.";
      if (onError) {
        onError(friendlyMsg);
      }
    } finally {
      setLoading(false);
    }
  };

  const buttonText =
    mode === "signUp" ? "Sign up with Google" : "Continue with Google";

  return (
    <TouchableOpacity
      style={[styles.button, disabled && styles.disabled, style]}
      onPress={handleGooglePress}
      activeOpacity={0.85}
      disabled={loading || disabled}
      accessibilityRole="button"
      accessibilityLabel={buttonText}
    >
      {loading ? (
        <ActivityIndicator size="small" color="#1F2937" />
      ) : (
        <View style={styles.contentRow}>
          {/* Official Google G multicolor SVG */}
          <View style={styles.iconWrap}>
            <Svg width={20} height={20} viewBox="0 0 24 24">
              <Path
                fill="#4285F4"
                d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.82-2.4 3.68v3.05h3.88c2.27-2.09 3.66-5.17 3.66-9.17z"
              />
              <Path
                fill="#34A853"
                d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.1-6.72-4.93H1.25v3.15C3.26 21.36 7.34 24 12 24z"
              />
              <Path
                fill="#FBBC05"
                d="M5.28 14.27c-.25-.72-.38-1.49-.38-2.27s.13-1.55.38-2.27V6.58H1.25C.45 8.16 0 9.94 0 12s.45 3.84 1.25 5.42l4.03-3.15z"
              />
              <Path
                fill="#EA4335"
                d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.34 0 3.26 2.64 1.25 6.58l4.03 3.15c.95-2.83 3.6-4.98 6.72-4.98z"
              />
            </Svg>
          </View>
          <Text style={styles.text}>{buttonText}</Text>
        </View>
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  button: {
    backgroundColor: "#FFFFFF",
    borderRadius: radius.md,
    paddingVertical: 13,
    paddingHorizontal: spacing.lg,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: "#E5E7EB",
    shadowColor: "#000000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.12,
    shadowRadius: 4,
    elevation: 2,
    width: "100%",
  },
  disabled: {
    opacity: 0.6,
  },
  contentRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 12,
  },
  iconWrap: {
    width: 20,
    height: 20,
    alignItems: "center",
    justifyContent: "center",
  },
  text: {
    color: "#1F2937",
    fontSize: 15,
    fontWeight: "700",
    letterSpacing: 0.2,
  },
});
