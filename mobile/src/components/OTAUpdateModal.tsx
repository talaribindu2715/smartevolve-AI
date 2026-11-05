import React, { useEffect, useState, useRef } from "react";
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  Animated,
  Platform,
} from "react-native";
import * as Updates from "expo-updates";
import { colors, radius, spacing } from "../theme/colors";

interface OTAUpdateModalProps {
  /** Override initial delay (default: 3000 ms) */
  initialDelayMs?: number;
}

export function OTAUpdateModal({ initialDelayMs = 3000 }: OTAUpdateModalProps) {
  const [modalVisible, setModalVisible] = useState(false);
  const [isChecking, setIsChecking] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);

  const timerRef = useRef<NodeJS.Timeout | null>(null);

  // Animated Rocket Floating & Pulsing
  const floatAnim = useRef(new Animated.Value(0)).current;
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const flameAnim = useRef(new Animated.Value(0.85)).current;

  useEffect(() => {
    // Fresh app startup delay: precisely 3 seconds after opening the APK
    timerRef.current = setTimeout(() => {
      runUpdateCheck();
    }, initialDelayMs);

    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [initialDelayMs]);

  useEffect(() => {
    if (modalVisible) {
      const floatLoop = Animated.loop(
        Animated.sequence([
          Animated.parallel([
            Animated.timing(floatAnim, {
              toValue: -12,
              duration: 1100,
              useNativeDriver: true,
            }),
            Animated.timing(flameAnim, {
              toValue: 1.3,
              duration: 1100,
              useNativeDriver: true,
            }),
          ]),
          Animated.parallel([
            Animated.timing(floatAnim, {
              toValue: 0,
              duration: 1100,
              useNativeDriver: true,
            }),
            Animated.timing(flameAnim, {
              toValue: 0.85,
              duration: 1100,
              useNativeDriver: true,
            }),
          ]),
        ])
      );

      const pulseLoop = Animated.loop(
        Animated.sequence([
          Animated.timing(pulseAnim, {
            toValue: 1.1,
            duration: 1300,
            useNativeDriver: true,
          }),
          Animated.timing(pulseAnim, {
            toValue: 1.0,
            duration: 1300,
            useNativeDriver: true,
          }),
        ])
      );

      floatLoop.start();
      pulseLoop.start();

      return () => {
        floatLoop.stop();
        pulseLoop.stop();
      };
    }
  }, [modalVisible]);

  // Execute OTA check
  const runUpdateCheck = async () => {
    // If not running in a standalone Expo build / Updates disabled
    if (!Updates.isEnabled) {
      return;
    }

    try {
      setIsChecking(true);
      const check = await Updates.checkForUpdateAsync();

      if (check.isAvailable) {
        setIsDownloading(true);
        // Fetch the OTA bundle
        await Updates.fetchUpdateAsync();
        setIsDownloading(false);

        // Open modal & keep visible permanently until user chooses an action
        setModalVisible(true);
      }
    } catch (err) {
      console.warn("OTA update check failed or offline:", err);
    } finally {
      setIsChecking(false);
      setIsDownloading(false);
    }
  };

  const triggerReload = async () => {
    try {
      if (Updates.isEnabled) {
        await Updates.reloadAsync();
      } else if (Platform.OS === "web" && typeof window !== "undefined") {
        window.location.reload();
      } else {
        setModalVisible(false);
      }
    } catch (err) {
      console.error("Failed to reload app:", err);
      setModalVisible(false);
    }
  };

  const handleDismiss = () => {
    setModalVisible(false);
  };

  if (!modalVisible) return null;

  return (
    <Modal visible={modalVisible} transparent animationType="fade" onRequestClose={handleDismiss}>
      <View style={styles.overlay}>
        <View style={styles.card}>
          {/* Animated Rocket Launch Icon */}
          <View style={styles.rocketWrapper}>
            <Animated.View
              style={[
                styles.glowCircle,
                { transform: [{ scale: pulseAnim }] },
              ]}
            />
            <Animated.View
              style={[
                styles.rocketContainer,
                { transform: [{ translateY: floatAnim }] },
              ]}
            >
              <Text style={styles.rocketEmoji}>🚀</Text>
              <Animated.View
                style={[
                  styles.thrustFlame,
                  { transform: [{ scale: flameAnim }] },
                ]}
              />
            </Animated.View>
          </View>

          {/* Heading and Description */}
          <Text style={styles.title}>New Update Available</Text>
          <Text style={styles.description}>
            New update available, please update.
          </Text>

          {/* Action Button: Update & Restart */}
          <TouchableOpacity style={styles.restartBtn} onPress={triggerReload} activeOpacity={0.85}>
            <Text style={styles.restartBtnText}>Update & Restart</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.laterBtn} onPress={handleDismiss} activeOpacity={0.7}>
            <Text style={styles.laterBtnText}>Later</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.82)",
    justifyContent: "center",
    alignItems: "center",
    padding: spacing.lg,
    zIndex: 99999,
  },
  card: {
    width: "100%",
    maxWidth: 360,
    backgroundColor: "#0B0F19",
    borderRadius: 20,
    borderWidth: 1.5,
    borderColor: "rgba(99, 102, 241, 0.4)",
    paddingVertical: 28,
    paddingHorizontal: 24,
    alignItems: "center",
    shadowColor: "#6366F1",
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.4,
    shadowRadius: 24,
    elevation: 16,
  },
  rocketWrapper: {
    width: 104,
    height: 104,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 16,
    position: "relative",
  },
  glowCircle: {
    position: "absolute",
    width: 90,
    height: 90,
    borderRadius: 45,
    backgroundColor: "rgba(99, 102, 241, 0.16)",
    borderWidth: 1.5,
    borderColor: "rgba(99, 102, 241, 0.35)",
  },
  rocketContainer: {
    alignItems: "center",
    justifyContent: "center",
  },
  rocketEmoji: {
    fontSize: 52,
    lineHeight: 60,
  },
  thrustFlame: {
    width: 16,
    height: 5,
    borderRadius: 3,
    backgroundColor: "#F59E0B",
    marginTop: -4,
    shadowColor: "#F59E0B",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.8,
    shadowRadius: 6,
    elevation: 4,
  },
  title: {
    color: "#FFFFFF",
    fontSize: 21,
    fontWeight: "900",
    textAlign: "center",
    marginBottom: 8,
    letterSpacing: -0.3,
  },
  description: {
    color: colors.textSecondary,
    fontSize: 14,
    lineHeight: 20,
    textAlign: "center",
    marginBottom: 24,
  },
  restartBtn: {
    width: "100%",
    backgroundColor: colors.primary,
    paddingVertical: 14,
    borderRadius: radius.md,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 10,
    elevation: 6,
  },
  restartBtnText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "800",
    letterSpacing: 0.3,
  },
  laterBtn: {
    paddingVertical: 10,
    paddingHorizontal: 20,
    marginTop: 8,
  },
  laterBtnText: {
    color: colors.textMuted,
    fontSize: 13,
    fontWeight: "600",
  },
});
