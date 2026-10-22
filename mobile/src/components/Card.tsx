import React from "react";
import { View, StyleSheet, StyleProp, ViewStyle } from "react-native";
import { colors, radius, spacing } from "../theme/colors";

interface CardProps {
  children: React.ReactNode;
  style?: StyleProp<ViewStyle>;
  active?: boolean;
}

export const Card: React.FC<CardProps> = ({ children, style, active }) => {
  return (
    <View
      style={[
        styles.card,
        active && styles.cardActive,
        style,
      ]}
    >
      {children}
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.card,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.cardBorder,
    padding: spacing.md,
    marginVertical: spacing.xs,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 3,
  },
  cardActive: {
    borderColor: colors.primary,
  },
});
