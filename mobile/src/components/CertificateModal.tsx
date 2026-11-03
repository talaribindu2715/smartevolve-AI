import React from "react";
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
import { Button } from "./Button";
import { colors, radius, spacing } from "../theme/colors";

export interface CertificateData {
  id: string;
  studentName: string;
  department?: string;
  institution?: string;
  graduationYear?: number | string;
  courseOrSkillTitle: string;
  category?: string;
  proficiency?: number;
  issuedDate?: string;
  certificateCode?: string;
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

  const certCode = certificate.certificateCode || certificate.id || "SE-GL-" + Math.floor(100000 + Math.random() * 900000);
  const studentName = certificate.studentName || "Bindu Talari";
  const department = certificate.department || "Computer Science and Engineering";
  const institution = certificate.institution || "K.S.R.M. College of Engineering (Autonomous)";
  const graduationYear = certificate.graduationYear || 2026;

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
      const styleId = "cert-greatlearning-print";
      if (!document.getElementById(styleId)) {
        const style = document.createElement("style");
        style.id = styleId;
        style.innerHTML = `
          @media print {
            body * { visibility: hidden !important; }
            #greatlearning-cert-print, #greatlearning-cert-print * { visibility: visible !important; }
            #greatlearning-cert-print {
              position: fixed !important;
              left: 0 !important;
              top: 0 !important;
              width: 100vw !important;
              height: 100vh !important;
              margin: 0 !important;
              padding: 24px !important;
              box-sizing: border-box !important;
              background: #FFFFFF !important;
              color: #0F172A !important;
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
        `Certificate #${certCode} is verified. Use desktop browser to save/print as high-resolution PDF.`
      );
    }
  };

  const handleCopyCode = () => {
    const origin =
      Platform.OS === "web" && typeof window !== "undefined"
        ? window.location.origin
        : "https://smartevolve-ai-mobile-sand.vercel.app";
    const link = `${origin}/credentials?verify=${certCode}`;

    if (Platform.OS === "web" && typeof navigator !== "undefined" && navigator.clipboard) {
      navigator.clipboard.writeText(link);
      Alert.alert("Link Copied!", `Verification URL copied to clipboard:\n\n${link}`);
    } else {
      Alert.alert("Public Verification Link", `Share this link to verify certificate:\n\n${link}`);
    }
  };

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <View style={styles.overlay}>
        <View style={styles.modalContainer}>
          {/* Header Controls */}
          <View style={styles.topBar}>
            <View>
              <Text style={styles.topBarBadge}>SmartEvolve ACADEMY CERTIFICATION</Text>
              <Text style={styles.topBarSub}>Autonomously Verified Academic Credential</Text>
            </View>
            <TouchableOpacity style={styles.closeBtn} onPress={onClose}>
              <Text style={styles.closeBtnText}>✕</Text>
            </TouchableOpacity>
          </View>

          <ScrollView contentContainerStyle={styles.scrollBody} showsVerticalScrollIndicator={false}>
            {/* The Great Learning-Styled Certificate Document */}
            <View style={styles.certPaper} nativeID="greatlearning-cert-print">
              {/* Outer Golden/Navy Double Frame */}
              <View style={styles.certOuterFrame}>
                <View style={styles.certInnerFrame}>
                  {/* Decorative Corner Tabs */}
                  <View style={[styles.cornerTab, styles.cornerTL]} />
                  <View style={[styles.cornerTab, styles.cornerTR]} />
                  <View style={[styles.cornerTab, styles.cornerBL]} />
                  <View style={[styles.cornerTab, styles.cornerBR]} />

                  {/* Header Row: SmartEvolve Logo & Institution */}
                  <View style={styles.certTopHeader}>
                    {/* Left Brand: SmartEvolve Academy */}
                    <View style={styles.brandCol}>
                      <View style={styles.brandTitleRow}>
                        <View style={styles.brandDot} />
                        <Text style={styles.brandMainText}>SmartEvolve</Text>
                      </View>
                      <Text style={styles.brandSubText}>A C A D E M Y</Text>
                    </View>

                    {/* Right Institution: K.S.R.M. College of Engineering */}
                    <View style={styles.institutionCol}>
                      <Text style={styles.instName}>{institution}</Text>
                      <Text style={styles.instSub}>Department of {department}</Text>
                      <Text style={styles.instAccred}>Autonomous Institution • Affiliated to JNTUA • Approved by AICTE</Text>
                    </View>
                  </View>

                  <View style={styles.goldDivider} />

                  {/* Certificate Title */}
                  <View style={styles.certTitleWrap}>
                    <Text style={styles.certMainHeading}>CERTIFICATE OF COMPLETION</Text>
                    <Text style={styles.certMainSubheading}>PROUDLY PRESENTED TO</Text>
                  </View>

                  {/* Student Name */}
                  <View style={styles.studentNameWrap}>
                    <Text style={styles.studentNameText}>{studentName}</Text>
                    <View style={styles.studentUnderline} />
                  </View>

                  {/* Recognition Prose */}
                  <View style={styles.bodyProseWrap}>
                    <Text style={styles.bodyText}>
                      of the <Text style={styles.boldText}>Department of {department}</Text>, Class of {graduationYear},
                      for successfully completing all curriculum modules and verifying comprehensive skill competency in
                    </Text>

                    <Text style={styles.courseHighlightText}>
                      {certificate.courseOrSkillTitle}
                    </Text>

                    {certificate.category ? (
                      <Text style={styles.categoryBadgeText}>
                        Domain Specialization: {certificate.category}
                      </Text>
                    ) : null}

                    <Text style={styles.bodySubText}>
                      with verified proficiency assessment and milestone achievement tracked on SmartEvolve AI.
                    </Text>
                  </View>

                  {/* Footer Section: Date, Code, Seal & Signatures */}
                  <View style={styles.certFooter}>
                    {/* Date & Verification ID */}
                    <View style={styles.footerColLeft}>
                      <Text style={styles.metaLabel}>Issued Date</Text>
                      <Text style={styles.metaValue}>{issuedDate}</Text>

                      <Text style={[styles.metaLabel, { marginTop: 8 }]}>Certificate Code</Text>
                      <Text style={styles.metaCode}>{certCode}</Text>

                      <View style={styles.verifyChip}>
                        <Text style={styles.verifyChipText}>✓ Verified on SmartEvolve</Text>
                      </View>
                    </View>

                    {/* Center Official Gold Seal */}
                    <View style={styles.footerColCenter}>
                      <View style={styles.goldSealWrap}>
                        <View style={styles.goldSealInner}>
                          <Text style={styles.sealIconText}>★</Text>
                          <Text style={styles.sealBrandText}>SmartEvolve</Text>
                          <Text style={styles.sealVerifiedText}>VERIFIED</Text>
                          <Text style={styles.sealIconText}>★</Text>
                        </View>
                      </View>
                    </View>

                    {/* Right Signatories */}
                    <View style={styles.footerColRight}>
                      <View style={styles.signBlock}>
                        <View style={styles.signLine} />
                        <Text style={styles.signatoryName}>Dr. V. Lokeswara Reddy</Text>
                        <Text style={styles.signatoryRole}>Head of Department, CSE</Text>
                        <Text style={styles.signatoryInst}>K.S.R.M. College of Engineering</Text>
                      </View>

                      <View style={[styles.signBlock, { marginTop: 10 }]}>
                        <View style={styles.signLine} />
                        <Text style={styles.signatoryName}>Dr. M. Sreenivasulu</Text>
                        <Text style={styles.signatoryRole}>Director & Principal</Text>
                        <Text style={styles.signatoryInst}>K.S.R.M. College of Engineering</Text>
                      </View>
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
                title="🔗 Copy Verification Link"
                onPress={handleCopyCode}
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
    backgroundColor: "rgba(0, 0, 0, 0.88)",
    justifyContent: "center",
    alignItems: "center",
    padding: spacing.md,
  },
  modalContainer: {
    width: "100%",
    maxWidth: 920,
    maxHeight: "95%",
    backgroundColor: "#FFFFFF",
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: "#E2E8F0",
    overflow: "hidden",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.18,
    shadowRadius: 24,
    elevation: 12,
  },
  topBar: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    backgroundColor: "#F8FAFC",
    borderBottomWidth: 1,
    borderBottomColor: "#E2E8F0",
  },
  topBarBadge: {
    color: "#4338CA",
    fontSize: 12,
    fontWeight: "800",
    letterSpacing: 0.5,
  },
  topBarSub: {
    color: "#64748B",
    fontSize: 11,
    marginTop: 2,
  },
  closeBtn: {
    width: 32,
    height: 32,
    borderRadius: radius.full,
    backgroundColor: "#E2E8F0",
    justifyContent: "center",
    alignItems: "center",
  },
  closeBtnText: {
    color: "#0F172A",
    fontSize: 16,
    fontWeight: "700",
  },
  scrollBody: {
    padding: spacing.md,
    alignItems: "center",
    backgroundColor: "#F8FAFC",
  },

  /* Great Learning Style Clean Academic Parchment */
  certPaper: {
    width: "100%",
    backgroundColor: "#FFFFFF",
    borderRadius: 6,
    overflow: "hidden",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.35,
    shadowRadius: 16,
    elevation: 8,
  },
  certOuterFrame: {
    borderWidth: 6,
    borderColor: "#0F172A",
    padding: 8,
    backgroundColor: "#FFFFFF",
  },
  certInnerFrame: {
    borderWidth: 1.5,
    borderColor: "#F59E0B",
    padding: 24,
    backgroundColor: "#FFFFFF",
    position: "relative",
  },

  cornerTab: {
    position: "absolute",
    width: 20,
    height: 20,
    borderColor: "#F59E0B",
  },
  cornerTL: { top: 6, left: 6, borderTopWidth: 2, borderLeftWidth: 2 },
  cornerTR: { top: 6, right: 6, borderTopWidth: 2, borderRightWidth: 2 },
  cornerBL: { bottom: 6, left: 6, borderBottomWidth: 2, borderLeftWidth: 2 },
  cornerBR: { bottom: 6, right: 6, borderBottomWidth: 2, borderRightWidth: 2 },

  /* Header Row */
  certTopHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    flexWrap: "wrap",
    gap: 12,
  },
  brandCol: {
    justifyContent: "center",
  },
  brandTitleRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  brandDot: {
    width: 10,
    height: 10,
    borderRadius: radius.full,
    backgroundColor: "#6366F1",
  },
  brandMainText: {
    fontSize: 24,
    fontWeight: "900",
    color: "#0F172A",
    letterSpacing: -0.5,
  },
  brandSubText: {
    fontSize: 10,
    fontWeight: "800",
    color: "#6366F1",
    letterSpacing: 4,
    marginTop: 2,
    paddingLeft: 16,
  },

  institutionCol: {
    alignItems: "flex-end",
    flexShrink: 1,
  },
  instName: {
    fontSize: 13,
    fontWeight: "800",
    color: "#0F172A",
    textAlign: "right",
  },
  instSub: {
    fontSize: 11,
    fontWeight: "700",
    color: "#475569",
    textAlign: "right",
    marginTop: 2,
  },
  instAccred: {
    fontSize: 9,
    color: "#64748B",
    textAlign: "right",
    marginTop: 2,
  },

  goldDivider: {
    height: 1,
    backgroundColor: "rgba(245, 158, 11, 0.35)",
    marginVertical: 16,
    width: "100%",
  },

  /* Titles */
  certTitleWrap: {
    alignItems: "center",
    marginBottom: 12,
  },
  certMainHeading: {
    fontSize: 22,
    fontWeight: "900",
    letterSpacing: 2,
    color: "#0F172A",
    textAlign: "center",
  },
  certMainSubheading: {
    fontSize: 11,
    fontWeight: "700",
    letterSpacing: 1.5,
    color: "#64748B",
    marginTop: 4,
  },

  /* Student Name */
  studentNameWrap: {
    alignItems: "center",
    marginVertical: 10,
  },
  studentNameText: {
    fontSize: 28,
    fontWeight: "900",
    color: "#1E293B",
    textAlign: "center",
    letterSpacing: 0.5,
  },
  studentUnderline: {
    width: 180,
    height: 2,
    backgroundColor: "#F59E0B",
    marginTop: 4,
  },

  /* Body Prose */
  bodyProseWrap: {
    alignItems: "center",
    paddingHorizontal: 16,
    marginVertical: 8,
  },
  bodyText: {
    fontSize: 13,
    color: "#334155",
    textAlign: "center",
    lineHeight: 20,
    maxWidth: 680,
  },
  boldText: {
    fontWeight: "700",
    color: "#0F172A",
  },
  courseHighlightText: {
    fontSize: 20,
    fontWeight: "800",
    color: "#4338CA",
    textAlign: "center",
    marginVertical: 10,
    lineHeight: 26,
    maxWidth: 720,
  },
  categoryBadgeText: {
    fontSize: 11,
    fontWeight: "700",
    color: "#059669",
    backgroundColor: "rgba(5, 150, 105, 0.1)",
    paddingHorizontal: 10,
    paddingVertical: 3,
    borderRadius: 12,
    overflow: "hidden",
    marginBottom: 6,
  },
  bodySubText: {
    fontSize: 11,
    color: "#64748B",
    textAlign: "center",
    fontStyle: "italic",
    marginTop: 4,
  },

  /* Footer */
  certFooter: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-end",
    marginTop: 20,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: "#E2E8F0",
    flexWrap: "wrap",
    gap: 16,
  },
  footerColLeft: {
    minWidth: 150,
  },
  metaLabel: {
    fontSize: 9,
    fontWeight: "700",
    color: "#64748B",
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  metaValue: {
    fontSize: 11,
    fontWeight: "700",
    color: "#0F172A",
    marginTop: 1,
  },
  metaCode: {
    fontSize: 11,
    fontWeight: "800",
    color: "#4338CA",
    fontFamily: "monospace",
    marginTop: 1,
  },
  verifyChip: {
    backgroundColor: "rgba(16, 185, 129, 0.12)",
    borderColor: "#10B981",
    borderWidth: 1,
    borderRadius: 4,
    paddingHorizontal: 6,
    paddingVertical: 2,
    alignSelf: "flex-start",
    marginTop: 6,
  },
  verifyChipText: {
    fontSize: 9,
    fontWeight: "800",
    color: "#047857",
  },

  footerColCenter: {
    alignItems: "center",
    justifyContent: "center",
  },
  goldSealWrap: {
    width: 72,
    height: 72,
    borderRadius: radius.full,
    borderWidth: 3,
    borderColor: "#F59E0B",
    backgroundColor: "#FEF3C7",
    padding: 3,
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#F59E0B",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
  },
  goldSealInner: {
    width: "100%",
    height: "100%",
    borderRadius: radius.full,
    borderWidth: 1,
    borderColor: "#D97706",
    borderStyle: "dashed",
    justifyContent: "center",
    alignItems: "center",
  },
  sealIconText: {
    fontSize: 8,
    color: "#D97706",
  },
  sealBrandText: {
    fontSize: 8,
    fontWeight: "900",
    color: "#92400E",
  },
  sealVerifiedText: {
    fontSize: 6,
    fontWeight: "800",
    letterSpacing: 0.5,
    color: "#B45309",
  },

  footerColRight: {
    minWidth: 180,
    alignItems: "flex-end",
  },
  signBlock: {
    alignItems: "center",
    width: 170,
  },
  signLine: {
    width: 140,
    height: 1,
    backgroundColor: "#64748B",
    marginBottom: 4,
  },
  signatoryName: {
    fontSize: 11,
    fontWeight: "800",
    color: "#0F172A",
    textAlign: "center",
  },
  signatoryRole: {
    fontSize: 9,
    fontWeight: "700",
    color: "#D97706",
    textAlign: "center",
  },
  signatoryInst: {
    fontSize: 8,
    color: "#64748B",
    textAlign: "center",
  },

  actionSection: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: spacing.md,
    width: "100%",
    marginTop: spacing.md,
  },
});
