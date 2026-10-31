import React from "react";
import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import Svg, { Path } from "react-native-svg";
import { colors, radius, spacing } from "../theme/colors";

interface ErrorBannerProps {
  title?: string;
  message?: string;
  onRetry?: () => void;
  isRetrying?: boolean;
}

export const ErrorBanner: React.FC<ErrorBannerProps> = ({
  title = "Connection Notice",
  message = "Unable to reach the live AI backend. The Render service may be waking from standby (~45s) or your network is reconnecting.",
  onRetry,
  isRetrying = false,
}) => {
  return (
    <View style={styles.banner}>
      <View style={styles.iconCol}>
        <Svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke={colors.warning} strokeWidth="2">
          <Path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
          <Path d="M12 9v4" />
          <Path d="M12 17h.01" />
        </Svg>
      </View>
      <View style={styles.contentCol}>
        <Text style={styles.title}>{title}</Text>
        <Text style={styles.message}>{message}</Text>
        {onRetry && (
          <TouchableOpacity
            style={styles.retryBtn}
            onPress={onRetry}
            disabled={isRetrying}
            activeOpacity={0.8}
          >
            <Text style={styles.retryBtnText}>
              {isRetrying ? "Reconnecting..." : "↻ Reconnect to Live Backend"}
            </Text>
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  banner: {
    backgroundColor: "rgba(245, 158, 11, 0.08)",
    borderColor: "rgba(245, 158, 11, 0.35)",
    borderWidth: 1,
    borderRadius: radius.md,
    padding: spacing.md,
    flexDirection: "row",
    gap: spacing.sm,
    marginBottom: spacing.md,
  },
  iconCol: {
    marginTop: 2,
  },
  contentCol: {
    flex: 1,
  },
  title: {
    color: colors.warning,
    fontSize: 13,
    fontWeight: "700",
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  message: {
    color: colors.textSecondary,
    fontSize: 12,
    lineHeight: 18,
    marginTop: 2,
  },
  retryBtn: {
    alignSelf: "flex-start",
    backgroundColor: "rgba(245, 158, 11, 0.2)",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: radius.sm,
    marginTop: spacing.sm,
  },
  retryBtnText: {
    color: colors.warning,
    fontSize: 12,
    fontWeight: "700",
  },
});
