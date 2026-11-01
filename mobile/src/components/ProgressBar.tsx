import React from "react";
import { View, StyleSheet, ViewStyle } from "react-native";
import { colors, radius } from "../theme/colors";

interface ProgressBarProps {
  progress: number; // 0 to 1 or 0 to 100
  color?: string;
  style?: ViewStyle;
  height?: number;
}

export const ProgressBar: React.FC<ProgressBarProps> = ({
  progress,
  color = colors.primary,
  style,
  height = 8,
}) => {
  const normalized = progress > 1 ? Math.min(100, Math.max(0, progress)) : Math.min(100, Math.max(0, progress * 100));
  return (
    <View style={[styles.track, { height }, style]}>
      <View style={[styles.fill, { width: `${normalized}%`, backgroundColor: color }]} />
    </View>
  );
};

const styles = StyleSheet.create({
  track: {
    width: "100%",
    backgroundColor: "rgba(255, 255, 255, 0.08)",
    borderRadius: radius.full,
    overflow: "hidden",
  },
  fill: {
    height: "100%",
    borderRadius: radius.full,
  },
});
