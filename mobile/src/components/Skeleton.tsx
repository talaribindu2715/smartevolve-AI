import React, { useEffect, useRef } from "react";
import { View, StyleSheet, Animated, ViewStyle, DimensionValue } from "react-native";
import { colors, radius } from "../theme/colors";

interface SkeletonProps {
  width?: DimensionValue;
  height?: number;
  borderRadius?: number;
  style?: ViewStyle;
}

export const Skeleton: React.FC<SkeletonProps> = ({
  width = "100%",
  height = 20,
  borderRadius = radius.sm,
  style,
}) => {
  const opacityAnim = useRef(new Animated.Value(0.3)).current;

  useEffect(() => {
    const pulse = Animated.loop(
      Animated.sequence([
        Animated.timing(opacityAnim, {
          toValue: 0.8,
          duration: 800,
          useNativeDriver: true,
        }),
        Animated.timing(opacityAnim, {
          toValue: 0.3,
          duration: 800,
          useNativeDriver: true,
        }),
      ])
    );
    pulse.start();

    return () => pulse.stop();
  }, [opacityAnim]);

  return (
    <Animated.View
      style={[
        styles.skeleton,
        {
          width,
          height,
          borderRadius,
          opacity: opacityAnim,
        },
        style,
      ]}
    />
  );
};

export const CardSkeleton: React.FC<{ style?: ViewStyle; height?: number }> = ({
  style,
  height,
}) => {
  return (
    <View style={[styles.cardSkeleton, height ? { height } : undefined, style]}>
      <Skeleton width="45%" height={16} borderRadius={radius.sm} style={{ marginBottom: 12 }} />
      <Skeleton width="80%" height={24} borderRadius={radius.md} style={{ marginBottom: 16 }} />
      <View style={{ flexDirection: "row", gap: 10, marginBottom: 12 }}>
        <Skeleton width="30%" height={32} borderRadius={radius.md} />
        <Skeleton width="30%" height={32} borderRadius={radius.md} />
        <Skeleton width="30%" height={32} borderRadius={radius.md} />
      </View>
      <Skeleton width="100%" height={38} borderRadius={radius.md} />
    </View>
  );
};

const styles = StyleSheet.create({
  skeleton: {
    backgroundColor: "rgba(99, 102, 241, 0.15)",
  },
  cardSkeleton: {
    backgroundColor: colors.surface,
    borderColor: colors.cardBorder,
    borderWidth: 1,
    borderRadius: radius.lg,
    padding: 16,
    marginBottom: 16,
  },
});
