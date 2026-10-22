import React from "react";
import { View, Text, StyleSheet } from "react-native";
import Svg, { Polygon, Line, Circle, Text as SvgText } from "react-native-svg";
import { colors, spacing } from "../theme/colors";

interface SkillRadarChartProps {
  data: Record<string, number>; // Category -> Score (0 - 100)
  size?: number;
}

export const SkillRadarChart: React.FC<SkillRadarChartProps> = ({
  data,
  size = 280,
}) => {
  const categories = Object.keys(data);
  if (categories.length < 3) {
    return (
      <View style={[styles.fallback, { width: size, height: size }]}>
        <Text style={styles.fallbackText}>Need at least 3 categories for radar profile</Text>
      </View>
    );
  }

  const center = size / 2;
  const radius = (size / 2) - 40;
  const angleStep = (Math.PI * 2) / categories.length;

  // Grid levels (25%, 50%, 75%, 100%)
  const levels = [0.25, 0.5, 0.75, 1.0];

  const getCoordinates = (index: number, valueFactor: number) => {
    const angle = index * angleStep - Math.PI / 2;
    const x = center + radius * valueFactor * Math.cos(angle);
    const y = center + radius * valueFactor * Math.sin(angle);
    return { x, y };
  };

  // Build polygon points for student data
  const dataPoints = categories.map((cat, i) => {
    const val = Math.max(10, Math.min(100, data[cat] || 0)) / 100;
    const { x, y } = getCoordinates(i, val);
    return `${x},${y}`;
  }).join(" ");

  return (
    <View style={styles.container}>
      <Svg width={size} height={size}>
        {/* Background Grid Circles */}
        {levels.map((level, idx) => (
          <Circle
            key={`grid-${idx}`}
            cx={center}
            cy={center}
            r={radius * level}
            stroke={colors.cardBorder}
            strokeWidth="1"
            fill="none"
          />
        ))}

        {/* Axis Lines and Labels */}
        {categories.map((cat, i) => {
          const { x, y } = getCoordinates(i, 1.0);
          const labelCoord = getCoordinates(i, 1.25);
          return (
            <React.Fragment key={`axis-${i}`}>
              <Line
                x1={center}
                y1={center}
                x2={x}
                y2={y}
                stroke={colors.cardBorder}
                strokeWidth="1"
              />
              <SvgText
                x={labelCoord.x}
                y={labelCoord.y + 4}
                fill={colors.textSecondary}
                fontSize="10"
                fontWeight="600"
                textAnchor="middle"
              >
                {cat.length > 10 ? `${cat.substring(0, 9)}..` : cat}
              </SvgText>
            </React.Fragment>
          );
        })}

        {/* Filled Data Area */}
        <Polygon
          points={dataPoints}
          fill="rgba(99, 102, 241, 0.35)"
          stroke={colors.primary}
          strokeWidth="2.5"
        />

        {/* Data Point Dots */}
        {categories.map((cat, i) => {
          const val = Math.max(10, Math.min(100, data[cat] || 0)) / 100;
          const { x, y } = getCoordinates(i, val);
          return (
            <Circle
              key={`dot-${i}`}
              cx={x}
              cy={y}
              r="4"
              fill={colors.accent}
              stroke="#FFF"
              strokeWidth="1.5"
            />
          );
        })}
      </Svg>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: "center",
    justifyContent: "center",
    marginVertical: spacing.sm,
  },
  fallback: {
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: colors.surface,
    borderRadius: 16,
    padding: spacing.md,
  },
  fallbackText: {
    color: colors.textMuted,
    fontSize: 13,
    textAlign: "center",
  },
});
