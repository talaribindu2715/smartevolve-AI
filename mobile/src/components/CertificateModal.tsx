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
      const iframeId = "cert-print-iframe";
      let iframe = document.getElementById(iframeId) as HTMLIFrameElement;
      if (iframe && iframe.parentNode) {
        iframe.parentNode.removeChild(iframe);
      }
      iframe = document.createElement("iframe");
      iframe.id = iframeId;
      iframe.style.position = "fixed";
      iframe.style.right = "0";
      iframe.style.bottom = "0";
      iframe.style.width = "0";
      iframe.style.height = "0";
      iframe.style.border = "0";
      document.body.appendChild(iframe);

      const html = `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>SmartEvolve_Certificate_${certCode}</title>
  <style>
    @page {
      size: A4 landscape;
      margin: 8mm;
    }
    * {
      box-sizing: border-box;
      margin: 0;
      padding: 0;
      -webkit-print-color-adjust: exact !important;
      print-color-adjust: exact !important;
    }
    html, body {
      width: 100%;
      height: 100%;
      background: #FFFFFF;
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
      display: flex;
      justify-content: center;
      align-items: center;
    }
    .cert-outer {
      width: 100%;
      height: 100%;
      border: 6px solid #0F172A;
      padding: 6px;
      background: #FFFFFF;
      page-break-inside: avoid;
      break-inside: avoid;
    }
    .cert-inner {
      width: 100%;
      height: 100%;
      border: 1.5px solid #F59E0B;
      padding: 24px 32px;
      position: relative;
      display: flex;
      flex-direction: column;
      justify-content: space-between;
    }
    .corner {
      position: absolute;
      width: 18px;
      height: 18px;
      border-color: #F59E0B;
    }
    .tl { top: 6px; left: 6px; border-top: 2px solid #F59E0B; border-left: 2px solid #F59E0B; }
    .tr { top: 6px; right: 6px; border-top: 2px solid #F59E0B; border-right: 2px solid #F59E0B; }
    .bl { bottom: 6px; left: 6px; border-bottom: 2px solid #F59E0B; border-left: 2px solid #F59E0B; }
    .br { bottom: 6px; right: 6px; border-bottom: 2px solid #F59E0B; border-right: 2px solid #F59E0B; }
    .header-row {
      display: flex;
      justify-content: space-between;
      align-items: center;
    }
    .brand-wrap {
      display: flex;
      flex-direction: column;
    }
    .brand-title {
      display: flex;
      align-items: center;
      gap: 6px;
    }
    .brand-dot {
      width: 10px;
      height: 10px;
      border-radius: 50%;
      background-color: #6366F1;
    }
    .brand-name {
      font-size: 24px;
      font-weight: 900;
      color: #0F172A;
      letter-spacing: -0.5px;
    }
    .brand-sub {
      font-size: 10px;
      font-weight: 800;
      color: #6366F1;
      letter-spacing: 4px;
      margin-top: 2px;
      padding-left: 16px;
    }
    .header-badge {
      background: rgba(99, 102, 241, 0.08);
      border: 1px solid rgba(99, 102, 241, 0.25);
      padding: 6px 14px;
      border-radius: 9999px;
      font-size: 10px;
      font-weight: 800;
      color: #6366F1;
      letter-spacing: 1.5px;
    }
    .gold-line {
      height: 1px;
      background: rgba(245, 158, 11, 0.35);
      margin: 12px 0;
      width: 100%;
    }
    .title-wrap {
      text-align: center;
      margin-bottom: 6px;
    }
    .main-heading {
      font-size: 22px;
      font-weight: 900;
      letter-spacing: 2px;
      color: #0F172A;
    }
    .sub-heading {
      font-size: 11px;
      font-weight: 700;
      letter-spacing: 1.5px;
      color: #64748B;
      margin-top: 4px;
    }
    .name-wrap {
      text-align: center;
      margin: 8px 0;
    }
    .student-name {
      font-size: 28px;
      font-weight: 900;
      color: #1E293B;
      display: inline-block;
      padding-bottom: 4px;
      border-bottom: 2px solid #F59E0B;
    }
    .prose-wrap {
      text-align: center;
      margin: 6px 0;
    }
    .body-text {
      font-size: 13px;
      color: #334155;
      line-height: 20px;
      max-width: 680px;
      margin: 0 auto;
    }
    .course-title {
      font-size: 20px;
      font-weight: 800;
      color: #4338CA;
      margin: 8px 0;
    }
    .domain-badge {
      display: inline-block;
      font-size: 10px;
      font-weight: 700;
      color: #059669;
      background: rgba(5, 150, 105, 0.1);
      padding: 3px 12px;
      border-radius: 12px;
      margin-bottom: 4px;
    }
    .body-sub {
      font-size: 11px;
      color: #64748B;
      font-style: italic;
    }
    .footer-row {
      display: flex;
      justify-content: space-between;
      align-items: flex-end;
      padding-top: 12px;
      border-top: 1px solid #E2E8F0;
      margin-top: 12px;
    }
    .col-left {
      min-width: 160px;
      text-align: left;
    }
    .meta-label {
      font-size: 9px;
      font-weight: 700;
      color: #64748B;
      text-transform: uppercase;
      letter-spacing: 0.5px;
    }
    .meta-val {
      font-size: 11px;
      font-weight: 700;
      color: #0F172A;
      margin-top: 1px;
    }
    .meta-code {
      font-size: 11px;
      font-weight: 800;
      color: #4338CA;
      font-family: monospace;
      margin-top: 1px;
    }
    .chip {
      display: inline-block;
      background: rgba(16, 185, 129, 0.12);
      border: 1px solid #10B981;
      border-radius: 4px;
      padding: 2px 8px;
      font-size: 9px;
      font-weight: 800;
      color: #047857;
      margin-top: 6px;
    }
    .seal-wrap {
      width: 72px;
      height: 72px;
      border-radius: 50%;
      background: #FEF3C7;
      border: 2px solid #F59E0B;
      padding: 3px;
      display: flex;
      justify-content: center;
      align-items: center;
    }
    .seal-inner {
      width: 100%;
      height: 100%;
      border-radius: 50%;
      border: 1px dashed #D97706;
      display: flex;
      flex-direction: column;
      justify-content: center;
      align-items: center;
    }
    .seal-brand {
      font-size: 9px;
      font-weight: 900;
      color: #92400E;
    }
    .seal-ver {
      font-size: 6px;
      font-weight: 800;
      color: #B45309;
      letter-spacing: 0.5px;
    }
    .col-right {
      min-width: 180px;
      text-align: center;
    }
    .sign-line {
      width: 140px;
      height: 1px;
      background: #64748B;
      margin: 0 auto 4px auto;
    }
    .sign-name {
      font-size: 11px;
      font-weight: 800;
      color: #0F172A;
    }
    .sign-role {
      font-size: 9px;
      font-weight: 700;
      color: #D97706;
    }
  </style>
</head>
<body>
  <div class="cert-outer">
    <div class="cert-inner">
      <div class="corner tl"></div>
      <div class="corner tr"></div>
      <div class="corner bl"></div>
      <div class="corner br"></div>

      <div class="header-row">
        <div class="brand-wrap">
          <div class="brand-title">
            <div class="brand-dot"></div>
            <div class="brand-name">SmartEvolve</div>
          </div>
          <div class="brand-sub">A C A D E M Y</div>
        </div>
        <div class="header-badge">OFFICIAL CERTIFICATION</div>
      </div>

      <div class="gold-line"></div>

      <div class="title-wrap">
        <div class="main-heading">CERTIFICATE OF COMPLETION</div>
        <div class="sub-heading">PROUDLY PRESENTED TO</div>
      </div>

      <div class="name-wrap">
        <div class="student-name">${studentName}</div>
      </div>

      <div class="prose-wrap">
        <div class="body-text">
          For successfully completing all curriculum modules and verifying comprehensive skill competency in
        </div>
        <div class="course-title">${certificate.courseOrSkillTitle}</div>
        ${certificate.category ? `<div class="domain-badge">Domain Specialization: ${certificate.category}</div>` : ""}
        <div class="body-sub">
          with verified proficiency assessment and milestone achievement tracked on SmartEvolve AI.
        </div>
      </div>

      <div class="footer-row">
        <div class="col-left">
          <div class="meta-label">Issued Date</div>
          <div class="meta-val">${issuedDate}</div>
          <div class="meta-label" style="margin-top: 6px;">Certificate Code</div>
          <div class="meta-code">${certCode}</div>
          <div class="chip">✓ Verified on SmartEvolve</div>
        </div>

        <div class="seal-wrap">
          <div class="seal-inner">
            <span style="font-size: 8px; color: #D97706;">★</span>
            <div class="seal-brand">SmartEvolve</div>
            <div class="seal-ver">VERIFIED</div>
            <span style="font-size: 8px; color: #D97706;">★</span>
          </div>
        </div>

        <div class="col-right">
          <div class="sign-line"></div>
          <div class="sign-name">Academic Director</div>
          <div class="sign-role">SmartEvolve Certification Board</div>
        </div>
      </div>
    </div>
  </div>
</body>
</html>`;

      const doc = iframe.contentWindow?.document;
      if (doc) {
        doc.open();
        doc.write(html);
        doc.close();
        setTimeout(() => {
          iframe.contentWindow?.focus();
          iframe.contentWindow?.print();
        }, 300);
      }
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

                  {/* Header Row: SmartEvolve Logo & Official Status */}
                  <View style={styles.certTopHeader}>
                    {/* Brand: SmartEvolve Academy */}
                    <View style={styles.brandCol}>
                      <View style={styles.brandTitleRow}>
                        <View style={styles.brandDot} />
                        <Text style={styles.brandMainText}>SmartEvolve</Text>
                      </View>
                      <Text style={styles.brandSubText}>A C A D E M Y</Text>
                    </View>

                    <View style={styles.headerBadgeWrap}>
                      <Text style={styles.headerBadgeText}>OFFICIAL CERTIFICATION</Text>
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
                      For successfully completing all curriculum modules and verifying comprehensive skill competency in
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

                    {/* Right Signatory */}
                    <View style={styles.footerColRight}>
                      <View style={styles.signBlock}>
                        <View style={styles.signLine} />
                        <Text style={styles.signatoryName}>Academic Director</Text>
                        <Text style={styles.signatoryRole}>SmartEvolve Certification Board</Text>
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

  headerBadgeWrap: {
    backgroundColor: "rgba(99, 102, 241, 0.08)",
    borderWidth: 1,
    borderColor: "rgba(99, 102, 241, 0.25)",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: radius.full,
    alignSelf: "center",
  },
  headerBadgeText: {
    fontSize: 10,
    fontWeight: "800",
    color: "#6366F1",
    letterSpacing: 1.5,
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
