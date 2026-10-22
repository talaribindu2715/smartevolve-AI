import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { colors, radius, spacing } from "../theme/colors";

interface ProficiencyBarProps {
  label: string;
  value: number; // 0 - 100
  targetValue?: number; // Career requirement line
  category?: string;
  evidenceType?: string;
}

export const ProficiencyBar: React.FC<ProficiencyBarProps> = ({
  label,
  value,
  targetValue,
  category,
  evidenceType,
}) => {
  const boundedValue = Math.max(0, Math.min(100, value));

  const getBarColor = (val: number) => {
    if (val >= 80) return colors.success;
    if (val >= 50) return colors.primary;
    if (val >= 30) return colors.accent;
    return colors.warning;
  };

  return (
    <View style={styles.container}>
      <View style={styles.headerRow}>
        <View style={styles.titleWrap}>
          <Text style={styles.label}>{label}</Text>
          {category ? <Text style={styles.category}>• {category}</Text> : null}
        </View>
        <Text style={[styles.valText, { color: getBarColor(boundedValue) }]}>
          {boundedValue.toFixed(0)}%
        </Text>
      </View>

      <View style={styles.track}>
        <View
          style={[
            styles.fill,
            {
              width: `${boundedValue}%`,
              backgroundColor: getBarColor(boundedValue),
            },
          ]}
        />
        {targetValue !== undefined && targetValue > 0 && (
          <View
            style={[
              styles.targetMarker,
              { left: `${Math.min(100, targetValue)}%` },
            ]}
          />
        )}
      </View>

      {targetValue !== undefined && (
        <View style={styles.footerRow}>
          <Text style={styles.subText}>
            Target: {targetValue.toFixed(0)}%
            {boundedValue >= targetValue ? " (Met)" : ` (${(targetValue - boundedValue).toFixed(0)}% gap)`}
          </Text>
          {evidenceType ? <Text style={styles.subText}>{evidenceType}</Text> : null}
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginVertical: spacing.xs,
  },
  headerRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 6,
  },
  titleWrap: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  label: {
    color: colors.textPrimary,
    fontSize: 14,
    fontWeight: "600",
  },
  category: {
    color: colors.textMuted,
    fontSize: 12,
  },
  valText: {
    fontSize: 14,
    fontWeight: "700",
  },
  track: {
    height: 8,
    backgroundColor: colors.surfaceLight,
    borderRadius: radius.full,
    overflow: "hidden",
    position: "relative",
  },
  fill: {
    height: "100%",
    borderRadius: radius.full,
  },
  targetMarker: {
    position: "absolute",
    top: 0,
    bottom: 0,
    width: 2,
    backgroundColor: "#FFF",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.5,
    shadowRadius: 2,
  },
  footerRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 4,
  },
  subText: {
    color: colors.textMuted,
    fontSize: 11,
  },
});
