import React, { useEffect, useState, useRef } from "react";
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  ActivityIndicator,
  Platform,
} from "react-native";
import Svg, { Path } from "react-native-svg";
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
  const [countdown, setCountdown] = useState<number | null>(null);
  const [autoRestartActive, setAutoRestartActive] = useState(true);
  const [updateInfo, setUpdateInfo] = useState<{
    version?: string;
    channel?: string;
    runtimeVersion?: string;
  }>({});

  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const countdownIntervalRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    // Fresh app startup delay: precisely 3 seconds after opening the APK
    timerRef.current = setTimeout(() => {
      runUpdateCheck();
    }, initialDelayMs);

    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
      if (countdownIntervalRef.current) clearInterval(countdownIntervalRef.current);
    };
  }, [initialDelayMs]);

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

        setUpdateInfo({
          channel: Updates.channel || "production",
          runtimeVersion: typeof Updates.runtimeVersion === "string" ? Updates.runtimeVersion : "1.0.0",
        });

        // Open modal & start 3-second auto-restart countdown
        setModalVisible(true);
        startCountdown();
      }
    } catch (err) {
      console.warn("OTA update check failed or offline:", err);
    } finally {
      setIsChecking(false);
      setIsDownloading(false);
    }
  };

  const startCountdown = () => {
    setCountdown(3);
    setAutoRestartActive(true);

    if (countdownIntervalRef.current) clearInterval(countdownIntervalRef.current);

    countdownIntervalRef.current = setInterval(() => {
      setCountdown((prev) => {
        if (prev === null) return null;
        if (prev <= 1) {
          clearInterval(countdownIntervalRef.current!);
          triggerReload();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  };

  const handlePauseCountdown = () => {
    if (countdownIntervalRef.current) clearInterval(countdownIntervalRef.current);
    setAutoRestartActive(false);
    setCountdown(null);
  };

  const triggerReload = async () => {
    if (countdownIntervalRef.current) clearInterval(countdownIntervalRef.current);
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
    if (countdownIntervalRef.current) clearInterval(countdownIntervalRef.current);
    setModalVisible(false);
  };

  if (!modalVisible) return null;

  return (
    <Modal visible={modalVisible} transparent animationType="fade" onRequestClose={handleDismiss}>
      <View style={styles.overlay}>
        <View style={styles.card}>
          {/* Top Banner Icon */}
          <View style={styles.iconCircle}>
            <Svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#FFFFFF" strokeWidth="2.5">
              <Path d="M21.5 2v6h-6M21.34 15.57a10 10 0 1 1-.57-8.38l5.67-5.67" />
            </Svg>
          </View>

          <Text style={styles.headerTag}>OVER-THE-AIR UPDATE READY</Text>
          <Text style={styles.title}>SmartEvolve AI Update</Text>
          <Text style={styles.description}>
            A fresh new application update has been successfully downloaded. Restart to apply latest courses, question banks, and video optimizations immediately.
          </Text>

          {/* Version / Channel details */}
          <View style={styles.metaBox}>
            <View style={styles.metaRow}>
              <Text style={styles.metaLabel}>Channel:</Text>
              <Text style={styles.metaValue}>{updateInfo.channel || "EAS Production"}</Text>
            </View>
            <View style={styles.metaRow}>
              <Text style={styles.metaLabel}>Runtime:</Text>
              <Text style={styles.metaValue}>v{updateInfo.runtimeVersion || "1.0.0"}</Text>
            </View>
            <View style={styles.metaRow}>
              <Text style={styles.metaLabel}>Status:</Text>
              <Text style={[styles.metaValue, { color: "#10B981" }]}>✓ Ready to Execute</Text>
            </View>
          </View>

          {/* Auto Restart Indicator */}
          {autoRestartActive && countdown !== null && (
            <View style={styles.countdownBox}>
              <Text style={styles.countdownText}>
                Restarting automatically in <Text style={styles.countdownDigit}>{countdown}s</Text>
              </Text>
              <TouchableOpacity onPress={handlePauseCountdown} style={styles.pauseBtn}>
                <Text style={styles.pauseBtnText}>Pause</Text>
              </TouchableOpacity>
            </View>
          )}

          {/* Action Buttons */}
          <View style={styles.btnRow}>
            <TouchableOpacity style={styles.laterBtn} onPress={handleDismiss}>
              <Text style={styles.laterBtnText}>Later</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.restartBtn} onPress={triggerReload}>
              <Svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#FFFFFF" strokeWidth="2.5">
                <Path d="M23 4v6h-6M1 20v-6h6M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15" />
              </Svg>
              <Text style={styles.restartBtnText}>Update & Restart Now</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.78)",
    justifyContent: "center",
    alignItems: "center",
    padding: spacing.md,
    zIndex: 99999,
  },
  card: {
    width: "100%",
    maxWidth: 420,
    backgroundColor: "#0B0F19",
    borderRadius: radius.lg,
    borderWidth: 1.5,
    borderColor: "rgba(99, 102, 241, 0.4)",
    padding: spacing.lg,
    alignItems: "center",
    shadowColor: "#6366F1",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.35,
    shadowRadius: 20,
    elevation: 12,
  },
  iconCircle: {
    width: 58,
    height: 58,
    borderRadius: 29,
    backgroundColor: "#6366F1",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: spacing.sm,
    shadowColor: "#6366F1",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.5,
    shadowRadius: 8,
    elevation: 6,
  },
  headerTag: {
    color: "#6366F1",
    fontSize: 11,
    fontWeight: "900",
    letterSpacing: 1.5,
    marginBottom: 4,
  },
  title: {
    color: "#FFFFFF",
    fontSize: 20,
    fontWeight: "800",
    textAlign: "center",
    marginBottom: spacing.xs,
  },
  description: {
    color: colors.textSecondary,
    fontSize: 13,
    lineHeight: 19,
    textAlign: "center",
    marginBottom: spacing.md,
  },
  metaBox: {
    width: "100%",
    backgroundColor: "rgba(15, 23, 42, 0.8)",
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.cardBorder,
    padding: spacing.sm,
    marginBottom: spacing.md,
    gap: 6,
  },
  metaRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  metaLabel: {
    color: colors.textMuted,
    fontSize: 12,
  },
  metaValue: {
    color: colors.textPrimary,
    fontSize: 12,
    fontWeight: "700",
  },
  countdownBox: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: "rgba(99, 102, 241, 0.12)",
    borderWidth: 1,
    borderColor: "rgba(99, 102, 241, 0.3)",
    borderRadius: radius.md,
    paddingHorizontal: 12,
    paddingVertical: 8,
    width: "100%",
    marginBottom: spacing.md,
  },
  countdownText: {
    color: colors.textPrimary,
    fontSize: 12,
    fontWeight: "600",
  },
  countdownDigit: {
    color: "#818CF8",
    fontWeight: "900",
    fontSize: 14,
  },
  pauseBtn: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    backgroundColor: "rgba(255, 255, 255, 0.1)",
    borderRadius: radius.sm,
  },
  pauseBtnText: {
    color: colors.textSecondary,
    fontSize: 11,
    fontWeight: "700",
  },
  btnRow: {
    flexDirection: "row",
    gap: spacing.sm,
    width: "100%",
  },
  laterBtn: {
    flex: 1,
    paddingVertical: 12,
    backgroundColor: "rgba(255, 255, 255, 0.06)",
    borderRadius: radius.md,
    alignItems: "center",
    justifyContent: "center",
  },
  laterBtnText: {
    color: colors.textSecondary,
    fontSize: 13,
    fontWeight: "700",
  },
  restartBtn: {
    flex: 2,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    paddingVertical: 12,
    backgroundColor: "#6366F1",
    borderRadius: radius.md,
  },
  restartBtnText: {
    color: "#FFFFFF",
    fontSize: 13,
    fontWeight: "800",
  },
});
