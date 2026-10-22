import React from "react";
import { View, Text, StyleSheet, StyleProp, ViewStyle } from "react-native";
import { colors, radius, spacing } from "../theme/colors";

interface BadgeProps {
  label: string;
  variant?: "primary" | "success" | "warning" | "error" | "info" | "blockchain";
  style?: StyleProp<ViewStyle>;
}

export const Badge: React.FC<BadgeProps> = ({ label, variant = "primary", style }) => {
  const getColors = () => {
    switch (variant) {
      case "success":
        return { bg: colors.successBg, text: colors.success, border: colors.success };
      case "warning":
        return { bg: colors.warningBg, text: colors.warning, border: colors.warning };
      case "error":
        return { bg: colors.errorBg, text: colors.error, border: colors.error };
      case "info":
        return { bg: colors.infoBg, text: colors.info, border: colors.info };
      case "blockchain":
        return { bg: colors.blockchainBg, text: colors.blockchain, border: colors.blockchain };
      default:
        return { bg: "rgba(99, 102, 241, 0.15)", text: colors.primary, border: colors.primary };
    }
  };

  const { bg, text, border } = getColors();

  return (
    <View style={[styles.badge, { backgroundColor: bg, borderColor: border }, style]}>
      <Text style={[styles.badgeText, { color: text }]}>{label}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  badge: {
    paddingVertical: 3,
    paddingHorizontal: 8,
    borderRadius: radius.full,
    borderWidth: 1,
    alignSelf: "flex-start",
  },
  badgeText: {
    fontSize: 11,
    fontWeight: "700",
    letterSpacing: 0.3,
    textTransform: "uppercase",
  },
});
