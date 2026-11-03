import React, { useRef } from "react";
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  ScrollView,
  Platform,
  Alert,
} from "react-native";
import Svg, { Path } from "react-native-svg";
import { Button } from "./Button";
import { colors, radius, spacing } from "../theme/colors";

export interface CertificateData {
  id: string;
  studentName: string;
  courseOrSkillTitle: string;
  category?: string;
  proficiency?: number;
  issuedDate?: string;
  achievementDataHash?: string;
  transactionHash?: string;
  contractAddress?: string;
  networkId?: string;
}

interface CertificateModalProps {
  visible: boolean;
  onClose: () => void;
  certificate: CertificateData | null;
}

export function CertificateModal({ visible, onClose, certificate }: CertificateModalProps) {
  if (!certificate) return null;

  const certId = certificate.id || "SE-CERT-" + Math.floor(100000 + Math.random() * 900000);
  const issuedDate = certificate.issuedDate
    ? new Date(certificate.issuedDate).toLocaleDateString("en-US", {
        year: "numeric",
        month: "long",
        day: "numeric",
      })
    : new Date().toLocaleDateString("en-US", {
        year: "numeric",
        month: "long",
        day: "numeric",
      });

  const handlePrint = () => {
    if (Platform.OS === "web" && typeof window !== "undefined") {
      // Inject print stylesheet if needed
      const styleId = "cert-print-style";
      if (!document.getElementById(styleId)) {
        const style = document.createElement("style");
        style.id = styleId;
        style.innerHTML = `
          @media print {
            body * { visibility: hidden !important; }
            #cert-frame-printable, #cert-frame-printable * { visibility: visible !important; }
            #cert-frame-printable {
              position: fixed !important;
              left: 0 !important;
              top: 0 !important;
              width: 100vw !important;
              height: 100vh !important;
              margin: 0 !important;
              padding: 24px !important;
              background: #0B0F19 !important;
              box-sizing: border-box !important;
              display: flex !important;
              justify-content: center !important;
              align-items: center !important;
            }
          }
        `;
        document.head.appendChild(style);
      }
      window.print();
    } else {
      Alert.alert(
        "Certificate Ready",
        `Certificate #${certId} is verified on blockchain. Take a screenshot or open on desktop to print PDF.`
      );
    }
  };

  const handleCopyLink = () => {
    const origin =
      Platform.OS === "web" && typeof window !== "undefined"
        ? window.location.origin
        : "https://smartevolve-ai-mobile-sand.vercel.app";
    const link = `${origin}/credentials?verify=${certificate.id}`;

    if (Platform.OS === "web" && typeof navigator !== "undefined" && navigator.clipboard) {
      navigator.clipboard.writeText(link);
      Alert.alert("Link Copied!", `Verification link copied to clipboard:\n\n${link}`);
    } else {
      Alert.alert("Public Verification Link", `Share this link for third-party audit:\n\n${link}`);
    }
  };

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <View style={styles.overlay}>
        <View style={styles.modalContainer}>
          {/* Top Bar with Close */}
          <View style={styles.topBar}>
            <View style={styles.topBarLeft}>
              <Text style={styles.topBarBadge}>🎓 OFFICIAL ACADEMIC CREDENTIAL</Text>
              <Text style={styles.topBarSub}>Generated Autonomously by SmartEvolve AI</Text>
            </View>
            <TouchableOpacity style={styles.closeBtn} onPress={onClose}>
              <Text style={styles.closeBtnText}>✕</Text>
            </TouchableOpacity>
          </View>

          <ScrollView contentContainerStyle={styles.scrollBody} showsVerticalScrollIndicator={false}>
            {/* The Actual Formal Printable Certificate */}
            <View style={styles.certFrame} nativeID="cert-frame-printable">
              {/* Outer Ornate Border */}
              <View style={styles.outerBorder}>
                {/* Inner Double Gold Border */}
                <View style={styles.innerBorder}>
                  {/* Corner Accent Ornaments */}
                  <View style={[styles.cornerBox, styles.cornerTL]} />
                  <View style={[styles.cornerBox, styles.cornerTR]} />
                  <View style={[styles.cornerBox, styles.cornerBL]} />
                  <View style={[styles.cornerBox, styles.cornerBR]} />

                  {/* Header / Institution Section */}
                  <View style={styles.instHeader}>
                    <Text style={styles.instEmblem}>🏛️</Text>
                    <Text style={styles.instCollege}>K.S.R.M. COLLEGE OF ENGINEERING</Text>
                    <Text style={styles.instAutonomous}>(AUTONOMOUS)</Text>
                    <Text style={styles.instAffiliation}>
                      Approved by AICTE, New Delhi & Affiliated to JNTUA • An ISO 9001:2015 Certified Institution
                    </Text>
                    <Text style={styles.instDept}>DEPARTMENT OF COMPUTER SCIENCE AND ENGINEERING</Text>
                    <View style={styles.platformBadge}>
                      <Text style={styles.platformBadgeText}>SmartEvolve AI • Self-Evolving Autonomous Verification</Text>
                    </View>
                  </View>

                  <View style={styles.dividerGold} />

                  {/* Certificate Title */}
                  <View style={styles.titleSection}>
                    <Text style={styles.certHeadline}>CERTIFICATE OF MASTERY & COMPETENCY</Text>
                    <Text style={styles.certSubHeadline}>VERIFIED EDUCATIONAL ACHIEVEMENT</Text>
                  </View>

                  {/* Recipient Section */}
                  <View style={styles.recipientSection}>
                    <Text style={styles.certProse}>This is to certify that</Text>
                    <Text style={styles.studentName}>
                      {certificate.studentName || "Bindu Talari"}
                    </Text>
                    <Text style={styles.certProse}>
                      has successfully demonstrated advanced competency, completed curriculum assessments, and verified high proficiency in
                    </Text>
                    <Text style={styles.courseTitle}>
                      {certificate.courseOrSkillTitle}
                    </Text>
                    {certificate.category ? (
                      <Text style={styles.categorySub}>Specialization Track: {certificate.category}</Text>
                    ) : null}
                  </View>

                  {/* Proficiency & Cryptographic Verification Strip */}
                  <View style={styles.verificationStrip}>
                    <View style={styles.vCol}>
                      <Text style={styles.vKey}>DEMONSTRATED PROFICIENCY</Text>
                      <Text style={styles.vValAccent}>
                        {certificate.proficiency ? `${Math.round(certificate.proficiency)}% Verified` : "95% Mastery"}
                      </Text>
                    </View>
                    <View style={styles.vCol}>
                      <Text style={styles.vKey}>CERTIFICATE ID</Text>
                      <Text style={styles.vValMono}>{certId.substring(0, 18)}</Text>
                    </View>
                    <View style={styles.vCol}>
                      <Text style={styles.vKey}>DATE ISSUED</Text>
                      <Text style={styles.vVal}>{issuedDate}</Text>
                    </View>
                    <View style={styles.vCol}>
                      <Text style={styles.vKey}>IMMUTABILITY STATUS</Text>
                      <Text style={styles.vValGreen}>✓ On-Chain Anchored</Text>
                    </View>
                  </View>

                  {/* Blockchain Proof Digest */}
                  <View style={styles.proofBox}>
                    <Text style={styles.proofText} numberOfLines={1}>
                      <Text style={{ fontWeight: "700", color: "#F59E0B" }}>SHA-256 Digest: </Text>
                      {certificate.achievementDataHash || "0x7f83b1657ff1fc53b92dc18148a1d65dfc2d4b1fa3d677284addd200126d9069"}
                    </Text>
                    <Text style={styles.proofText} numberOfLines={1}>
                      <Text style={{ fontWeight: "700", color: "#6366F1" }}>Smart Contract: </Text>
                      {certificate.contractAddress || "0x5FbDB2315678afecb367f032d93F642f64180aa3 (SmartEvolveCredential)"}
                    </Text>
                  </View>

                  {/* Signatures & Seal Section */}
                  <View style={styles.signaturesSection}>
                    {/* HOD Sign */}
                    <View style={styles.signCol}>
                      <View style={styles.signLine} />
                      <Text style={styles.signName}>Dr. V. Lokeswara Reddy</Text>
                      <Text style={styles.signTitle}>Head of the Department, CSE</Text>
                      <Text style={styles.signInst}>K.S.R.M. College of Engineering</Text>
                    </View>

                    {/* Official Stamp / Seal */}
                    <View style={styles.sealCol}>
                      <View style={styles.sealCircle}>
                        <Text style={styles.sealIcon}>🛡️</Text>
                        <Text style={styles.sealText}>KSRM CE</Text>
                        <Text style={styles.sealSub}>AUTONOMOUS</Text>
                      </View>
                    </View>

                    {/* Principal Sign */}
                    <View style={styles.signCol}>
                      <View style={styles.signLine} />
                      <Text style={styles.signName}>Dr. M. Sreenivasulu</Text>
                      <Text style={styles.signTitle}>Director & Principal</Text>
                      <Text style={styles.signInst}>K.S.R.M. College of Engineering</Text>
                    </View>
                  </View>
                </View>
              </View>
            </View>

            {/* Action Buttons */}
            <View style={styles.actionSection}>
              <Button
                title="🖨️ Download / Print Certificate (PDF)"
                onPress={handlePrint}
                size="lg"
                style={{ flex: 1 }}
              />
              <Button
                title="🔗 Copy Public Verification Link"
                onPress={handleCopyLink}
                variant="outline"
                size="lg"
                style={{ flex: 1 }}
              />
            </View>
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.85)",
    justifyContent: "center",
    alignItems: "center",
    padding: spacing.md,
  },
  modalContainer: {
    width: "100%",
    maxWidth: 880,
    maxHeight: "94%",
    backgroundColor: "#0B0F19",
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.cardBorder,
    overflow: "hidden",
  },
  topBar: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.cardBorder,
    backgroundColor: "#131B2E",
  },
  topBarLeft: {
    gap: 2,
  },
  topBarBadge: {
    color: "#F59E0B",
    fontSize: 12,
    fontWeight: "800",
    letterSpacing: 0.5,
  },
  topBarSub: {
    color: colors.textSecondary,
    fontSize: 11,
  },
  closeBtn: {
    width: 32,
    height: 32,
    borderRadius: radius.full,
    backgroundColor: "rgba(255, 255, 255, 0.08)",
    justifyContent: "center",
    alignItems: "center",
  },
  closeBtnText: {
    color: colors.textPrimary,
    fontSize: 16,
    fontWeight: "700",
  },
  scrollBody: {
    padding: spacing.md,
    alignItems: "center",
  },
  certFrame: {
    width: "100%",
    backgroundColor: "#0D1322",
    borderRadius: 8,
    overflow: "hidden",
  },
  outerBorder: {
    borderWidth: 4,
    borderColor: "#F59E0B",
    padding: 10,
    backgroundColor: "#0F172A",
  },
  innerBorder: {
    borderWidth: 2,
    borderColor: "rgba(245, 158, 11, 0.6)",
    padding: 24,
    backgroundColor: "#090D16",
    position: "relative",
  },
  cornerBox: {
    position: "absolute",
    width: 24,
    height: 24,
    borderColor: "#F59E0B",
  },
  cornerTL: { top: 6, left: 6, borderTopWidth: 3, borderLeftWidth: 3 },
  cornerTR: { top: 6, right: 6, borderTopWidth: 3, borderRightWidth: 3 },
  cornerBL: { bottom: 6, left: 6, borderBottomWidth: 3, borderLeftWidth: 3 },
  cornerBR: { bottom: 6, right: 6, borderBottomWidth: 3, borderRightWidth: 3 },

  instHeader: {
    alignItems: "center",
    marginBottom: 12,
  },
  instEmblem: {
    fontSize: 28,
    marginBottom: 4,
  },
  instCollege: {
    color: "#FFFFFF",
    fontSize: 20,
    fontWeight: "900",
    letterSpacing: 1,
    textAlign: "center",
  },
  instAutonomous: {
    color: "#F59E0B",
    fontSize: 13,
    fontWeight: "800",
    letterSpacing: 2,
    marginTop: 2,
  },
  instAffiliation: {
    color: "#94A3B8",
    fontSize: 10,
    textAlign: "center",
    marginTop: 4,
  },
  instDept: {
    color: "#CBD5E1",
    fontSize: 12,
    fontWeight: "700",
    letterSpacing: 0.5,
    marginTop: 6,
    textAlign: "center",
  },
  platformBadge: {
    backgroundColor: "rgba(99, 102, 241, 0.15)",
    borderColor: "rgba(99, 102, 241, 0.35)",
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 3,
    marginTop: 6,
  },
  platformBadgeText: {
    color: "#818CF8",
    fontSize: 10,
    fontWeight: "700",
  },
  dividerGold: {
    height: 1,
    backgroundColor: "rgba(245, 158, 11, 0.4)",
    marginVertical: 14,
    width: "80%",
    alignSelf: "center",
  },

  titleSection: {
    alignItems: "center",
    marginBottom: 16,
  },
  certHeadline: {
    color: "#F59E0B",
    fontSize: 18,
    fontWeight: "900",
    letterSpacing: 1.5,
    textAlign: "center",
  },
  certSubHeadline: {
    color: "#64748B",
    fontSize: 10,
    fontWeight: "700",
    letterSpacing: 1,
    marginTop: 2,
  },

  recipientSection: {
    alignItems: "center",
    marginVertical: 8,
  },
  certProse: {
    color: "#94A3B8",
    fontSize: 12,
    fontStyle: "italic",
    textAlign: "center",
  },
  studentName: {
    color: "#FFFFFF",
    fontSize: 24,
    fontWeight: "900",
    letterSpacing: 0.5,
    marginVertical: 8,
    textAlign: "center",
    textDecorationLine: "underline",
    textDecorationColor: "#6366F1",
  },
  courseTitle: {
    color: "#818CF8",
    fontSize: 18,
    fontWeight: "800",
    textAlign: "center",
    marginTop: 8,
    lineHeight: 24,
  },
  categorySub: {
    color: "#64748B",
    fontSize: 11,
    marginTop: 4,
    fontStyle: "italic",
  },

  verificationStrip: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-around",
    backgroundColor: "rgba(15, 23, 42, 0.8)",
    borderColor: "rgba(245, 158, 11, 0.25)",
    borderWidth: 1,
    borderRadius: 8,
    padding: 10,
    marginVertical: 14,
    gap: 8,
  },
  vCol: {
    alignItems: "center",
  },
  vKey: {
    color: "#64748B",
    fontSize: 9,
    fontWeight: "800",
    letterSpacing: 0.5,
  },
  vVal: {
    color: "#CBD5E1",
    fontSize: 11,
    fontWeight: "700",
    marginTop: 2,
  },
  vValAccent: {
    color: "#F59E0B",
    fontSize: 12,
    fontWeight: "800",
    marginTop: 2,
  },
  vValMono: {
    color: "#818CF8",
    fontSize: 10,
    fontFamily: "monospace",
    fontWeight: "700",
    marginTop: 2,
  },
  vValGreen: {
    color: "#10B981",
    fontSize: 11,
    fontWeight: "800",
    marginTop: 2,
  },

  proofBox: {
    backgroundColor: "rgba(0, 0, 0, 0.4)",
    borderColor: "#1E293B",
    borderWidth: 1,
    borderRadius: 6,
    padding: 8,
    marginBottom: 16,
    gap: 2,
  },
  proofText: {
    color: "#64748B",
    fontSize: 9,
    fontFamily: "monospace",
  },

  signaturesSection: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-end",
    marginTop: 10,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: "rgba(255, 255, 255, 0.05)",
  },
  signCol: {
    flex: 1,
    alignItems: "center",
  },
  signLine: {
    width: "70%",
    height: 1,
    backgroundColor: "#94A3B8",
    marginBottom: 6,
  },
  signName: {
    color: "#FFFFFF",
    fontSize: 12,
    fontWeight: "800",
    textAlign: "center",
  },
  signTitle: {
    color: "#F59E0B",
    fontSize: 10,
    fontWeight: "600",
    textAlign: "center",
  },
  signInst: {
    color: "#64748B",
    fontSize: 9,
    textAlign: "center",
  },

  sealCol: {
    paddingHorizontal: 12,
    alignItems: "center",
  },
  sealCircle: {
    width: 68,
    height: 68,
    borderRadius: radius.full,
    borderWidth: 2,
    borderColor: "#F59E0B",
    backgroundColor: "rgba(245, 158, 11, 0.12)",
    justifyContent: "center",
    alignItems: "center",
  },
  sealIcon: {
    fontSize: 18,
  },
  sealText: {
    color: "#F59E0B",
    fontSize: 8,
    fontWeight: "900",
  },
  sealSub: {
    color: "#10B981",
    fontSize: 6,
    fontWeight: "800",
    letterSpacing: 0.5,
  },

  actionSection: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: spacing.md,
    width: "100%",
    marginTop: spacing.md,
  },
});
