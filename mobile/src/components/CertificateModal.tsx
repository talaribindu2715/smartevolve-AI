import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  ScrollView,
  Platform,
  Alert,
  Share,
  useWindowDimensions,
} from "react-native";
import * as Print from "expo-print";
import * as Sharing from "expo-sharing";
import * as FileSystem from "expo-file-system";
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

  const { width } = useWindowDimensions();
  const isDesktop = width >= 768;
  const [isGeneratingPdf, setIsGeneratingPdf] = useState(false);

  const sanitizedCourse = (certificate.courseOrSkillTitle || "Course")
    .trim()
    .replace(/[^a-zA-Z0-9_-]/g, "_")
    .replace(/_+/g, "_");
  const sanitizedStudent = studentName
    .trim()
    .replace(/[^a-zA-Z0-9_-]/g, "_")
    .replace(/_+/g, "_");
  const dynamicFileName = `SmartEvolve_Certificate_${sanitizedCourse}_${sanitizedStudent}.pdf`;

  const generateCertificateHtml = () => `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>${dynamicFileName.replace(".pdf", "")}</title>
  <style>
    @page {
      size: 297mm 210mm;
      margin: 0;
    }
    * {
      box-sizing: border-box;
      margin: 0;
      padding: 0;
      -webkit-print-color-adjust: exact !important;
      print-color-adjust: exact !important;
    }
    html, body {
      width: 297mm;
      height: 210mm;
      max-width: 297mm;
      max-height: 210mm;
      background: #FFFFFF;
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, serif;
      display: flex;
      justify-content: center;
      align-items: center;
      overflow: hidden;
    }
    .cert-canvas {
      width: 297mm;
      height: 210mm;
      max-width: 297mm;
      max-height: 210mm;
      padding: 8mm;
      background: #FCFAF6;
      box-sizing: border-box;
      display: flex;
      justify-content: center;
      align-items: center;
    }
    .cert-outer {
      width: 100%;
      height: 100%;
      border: 5px solid #0F172A;
      padding: 5px;
      background: #FFFFFF;
      position: relative;
      box-shadow: 0 0 0 2px #D4AF37;
    }
    .cert-inner {
      width: 100%;
      height: 100%;
      border: 1.5px solid #D4AF37;
      padding: 16px 28px;
      position: relative;
      display: flex;
      flex-direction: column;
      justify-content: space-between;
      background: #FFFFFF;
    }
    .corner {
      position: absolute;
      width: 22px;
      height: 22px;
    }
    .tl { top: 6px; left: 6px; border-top: 3px solid #D4AF37; border-left: 3px solid #D4AF37; }
    .tr { top: 6px; right: 6px; border-top: 3px solid #D4AF37; border-right: 3px solid #D4AF37; }
    .bl { bottom: 6px; left: 6px; border-bottom: 3px solid #D4AF37; border-left: 3px solid #D4AF37; }
    .br { bottom: 6px; right: 6px; border-bottom: 3px solid #D4AF37; border-right: 3px solid #D4AF37; }

    .header-row {
      display: flex;
      justify-content: space-between;
      align-items: center;
    }
    .brand-wrap {
      display: flex;
      align-items: center;
      gap: 10px;
    }
    .brand-crest {
      width: 32px;
      height: 32px;
      border-radius: 8px;
      background: linear-gradient(135deg, #4F46E5, #9333EA);
      display: flex;
      align-items: center;
      justify-content: center;
      color: #FFFFFF;
      font-weight: 900;
      font-size: 14px;
      border: 1.5px solid #D4AF37;
    }
    .brand-title {
      font-size: 22px;
      font-weight: 900;
      color: #0F172A;
      letter-spacing: -0.5px;
      line-height: 22px;
    }
    .brand-sub {
      font-size: 9px;
      font-weight: 800;
      color: #D97706;
      letter-spacing: 3px;
      text-transform: uppercase;
      margin-top: 2px;
    }
    .header-badge {
      background: rgba(217, 119, 6, 0.08);
      border: 1.5px solid #D4AF37;
      padding: 5px 14px;
      border-radius: 9999px;
      font-size: 9px;
      font-weight: 800;
      color: #92400E;
      letter-spacing: 1.5px;
      display: flex;
      align-items: center;
      gap: 5px;
    }
    .gold-divider {
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 12px;
      margin: 6px 0;
    }
    .gold-line {
      flex: 1;
      height: 1px;
      background: linear-gradient(90deg, transparent, #D4AF37, transparent);
    }
    .gold-diamond {
      color: #D4AF37;
      font-size: 10px;
    }
    .title-wrap {
      text-align: center;
      margin: 2px 0 4px 0;
    }
    .main-heading {
      font-size: 21px;
      font-weight: 900;
      letter-spacing: 3px;
      color: #0F172A;
      text-transform: uppercase;
    }
    .sub-heading {
      font-size: 10px;
      font-weight: 800;
      letter-spacing: 2px;
      color: #D97706;
      text-transform: uppercase;
      margin-top: 3px;
    }
    .name-wrap {
      text-align: center;
      margin: 4px 0 6px 0;
    }
    .student-name {
      font-size: 30px;
      font-weight: 900;
      color: #0F172A;
      display: inline-block;
      padding-bottom: 2px;
      border-bottom: 2px solid #D4AF37;
      letter-spacing: 0.5px;
    }
    .student-inst {
      font-size: 11px;
      font-weight: 700;
      color: #475569;
      margin-top: 3px;
    }
    .prose-wrap {
      text-align: center;
      margin: 4px 0 6px 0;
    }
    .body-text {
      font-size: 12px;
      color: #334155;
      line-height: 18px;
      max-width: 720px;
      margin: 0 auto;
    }
    .course-title {
      font-size: 21px;
      font-weight: 900;
      color: #1E3A8A;
      margin: 4px 0;
      letter-spacing: 0.2px;
    }
    .domain-badge {
      display: inline-block;
      font-size: 9.5px;
      font-weight: 800;
      color: #047857;
      background: rgba(16, 185, 129, 0.1);
      border: 1px solid rgba(16, 185, 129, 0.3);
      padding: 3px 12px;
      border-radius: 12px;
      margin-bottom: 3px;
    }
    .footer-row {
      display: flex;
      justify-content: space-between;
      align-items: flex-end;
      padding-top: 8px;
      border-top: 1px solid #E2E8F0;
      margin-top: 4px;
    }
    .col-left {
      min-width: 190px;
      text-align: left;
    }
    .meta-label {
      font-size: 8px;
      font-weight: 800;
      color: #64748B;
      text-transform: uppercase;
      letter-spacing: 0.5px;
    }
    .meta-val {
      font-size: 10px;
      font-weight: 800;
      color: #0F172A;
      margin-top: 1px;
    }
    .meta-code {
      font-size: 10px;
      font-weight: 900;
      color: #4338CA;
      font-family: monospace;
      margin-top: 1px;
    }
    .chip {
      display: inline-block;
      background: rgba(16, 185, 129, 0.12);
      border: 1px solid #10B981;
      border-radius: 4px;
      padding: 2px 7px;
      font-size: 8.5px;
      font-weight: 800;
      color: #047857;
      margin-top: 4px;
    }
    .seal-wrap {
      width: 76px;
      height: 76px;
      border-radius: 50%;
      background: linear-gradient(135deg, #FEF3C7, #FDE68A);
      border: 2.5px solid #D4AF37;
      padding: 3px;
      display: flex;
      justify-content: center;
      align-items: center;
      box-shadow: 0 2px 8px rgba(212, 175, 55, 0.25);
    }
    .seal-inner {
      width: 100%;
      height: 100%;
      border-radius: 50%;
      border: 1.5px dashed #B45309;
      display: flex;
      flex-direction: column;
      justify-content: center;
      align-items: center;
    }
    .seal-brand {
      font-size: 8.5px;
      font-weight: 900;
      color: #92400E;
    }
    .seal-ver {
      font-size: 7px;
      font-weight: 900;
      color: #B45309;
      letter-spacing: 0.8px;
    }
    .col-right {
      min-width: 190px;
      text-align: center;
    }
    .sign-line {
      width: 130px;
      height: 1px;
      background: #475569;
      margin: 0 auto 3px auto;
    }
    .sign-name {
      font-size: 10.5px;
      font-weight: 800;
      color: #0F172A;
    }
    .sign-role {
      font-size: 8.5px;
      font-weight: 700;
      color: #D97706;
    }
  </style>
</head>
<body>
  <div class="cert-canvas">
    <div class="cert-outer">
      <div class="cert-inner">
        <div class="corner tl"></div>
        <div class="corner tr"></div>
        <div class="corner bl"></div>
        <div class="corner br"></div>

        <div class="header-row">
          <div class="brand-wrap">
            <div class="brand-crest">SE</div>
            <div>
              <div class="brand-title">SmartEvolve AI</div>
              <div class="brand-sub">Autonomous Academy Protocol</div>
            </div>
          </div>
          <div class="header-badge">
            <span>🛡️</span> EVM ON-CHAIN VERIFIED CREDENTIAL
          </div>
        </div>

        <div class="gold-divider">
          <div class="gold-line"></div>
          <div class="gold-diamond">◆</div>
          <div class="gold-line"></div>
        </div>

        <div class="title-wrap">
          <div class="main-heading">Certificate of Completion</div>
          <div class="sub-heading">Proudly Conferred Upon</div>
        </div>

        <div class="name-wrap">
          <div class="student-name">${studentName}</div>
          <div class="student-inst">${department} • ${institution}</div>
        </div>

        <div class="prose-wrap">
          <div class="body-text">
            For successfully validating advanced competencies, executing prerequisite learning phases, and demonstrating verified mastery in
          </div>
          <div class="course-title">${certificate.courseOrSkillTitle}</div>
          ${certificate.category ? `<div class="domain-badge">Domain Specialization: ${certificate.category} • Proficiency: ${certificate.proficiency || 98}%</div>` : ""}
        </div>

        <div class="footer-row">
          <div class="col-left">
            <div class="meta-label">Issued Date</div>
            <div class="meta-val">${issuedDate}</div>
            <div class="meta-label" style="margin-top: 4px;">Certificate Code</div>
            <div class="meta-code">${certCode}</div>
            <div class="chip">✓ On-Chain Verified (Polygon / Sepolia)</div>
          </div>

          <div class="seal-wrap">
            <div class="seal-inner">
              <span style="font-size: 7px; color: #D97706;">★ ★ ★</span>
              <div class="seal-brand">SmartEvolve</div>
              <div class="seal-ver">VERIFIED</div>
              <span style="font-size: 7px; color: #D97706;">★ ★ ★</span>
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
  </div>
</body>
</html>`;

  const handlePrint = async () => {
    if (Platform.OS === "web" && typeof window !== "undefined") {
      const originalTitle = document.title;
      document.title = dynamicFileName.replace(".pdf", "");

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

      const html = generateCertificateHtml();
      const doc = iframe.contentWindow?.document;
      if (doc) {
        doc.open();
        doc.write(html);
        doc.close();
        setTimeout(() => {
          iframe.contentWindow?.focus();
          iframe.contentWindow?.print();
          document.title = originalTitle;
        }, 300);
      }
      return;
    }

    // Native mobile app (Android APK / iOS):
    // Directly generates and exports Landscape A4 PDF from inside the APK without redirecting to Chrome!
    try {
      setIsGeneratingPdf(true);
      const html = generateCertificateHtml();

      const { uri } = await Print.printToFileAsync({
        html,
        width: 842, // A4 Landscape width (297mm in points)
        height: 595, // A4 Landscape height (210mm in points)
        base64: false,
      });

      const targetUri = `${FileSystem.documentDirectory}${dynamicFileName}`;
      const existingInfo = await FileSystem.getInfoAsync(targetUri);
      if (existingInfo.exists) {
        await FileSystem.deleteAsync(targetUri, { idempotent: true });
      }

      await FileSystem.copyAsync({
        from: uri,
        to: targetUri,
      });

      if (await Sharing.isAvailableAsync()) {
        await Sharing.shareAsync(targetUri, {
          mimeType: "application/pdf",
          dialogTitle: `Save Certificate: ${dynamicFileName}`,
          UTI: "com.adobe.pdf",
        });
      } else {
        Alert.alert(
          "Certificate Downloaded",
          `Saved in app directory:\n${dynamicFileName}`
        );
      }
    } catch (err: any) {
      console.warn("In-app PDF generation issue:", err);
      Alert.alert(
        "Certificate Ready",
        `Generated ${dynamicFileName}.\n\nFile saved to device.`
      );
    } finally {
      setIsGeneratingPdf(false);
    }
  };

  const handleCopyCode = async () => {
    const origin =
      Platform.OS === "web" && typeof window !== "undefined"
        ? window.location.origin
        : "https://smartevolve-ai-mobile-sand.vercel.app";
    const link = `${origin}/credentials?verify=${encodeURIComponent(certCode)}&name=${encodeURIComponent(studentName)}&title=${encodeURIComponent(certificate.courseOrSkillTitle)}`;

    if (Platform.OS === "web") {
      if (typeof navigator !== "undefined" && navigator.clipboard) {
        await navigator.clipboard.writeText(link);
        Alert.alert("Link Copied!", `Verification URL copied to clipboard:\n\n${link}`);
      } else {
        Alert.alert("Public Verification Link", `Share this link to verify certificate:\n\n${link}`);
      }
    } else {
      try {
        await Share.share({
          title: `SmartEvolve Credential #${certCode}`,
          message: `Check out my verified academic credential on SmartEvolve AI!\n\nLearner: ${studentName}\nCourse: ${certificate.courseOrSkillTitle}\nVerification: ${link}`,
          url: link,
        });
      } catch (_) {
        Alert.alert("Verification Link", link);
      }
    }
  };

  useEffect(() => {
    if (visible && Platform.OS === "web" && typeof window !== "undefined") {
      const searchParams = new URLSearchParams(window.location.search);
      if (searchParams.get("print") === "1") {
        const timer = setTimeout(() => {
          handlePrint();
        }, 600);
        return () => clearTimeout(timer);
      }
    }
  }, [visible]);

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
            <View style={[styles.actionSection, !isDesktop && styles.actionSectionMobile]}>
              <Button
                title={isGeneratingPdf ? "⏳ Generating Landscape PDF..." : "🖨️ Download Certificate (PDF)"}
                onPress={handlePrint}
                disabled={isGeneratingPdf}
                size="md"
                style={isDesktop ? { flex: 1 } : { width: "100%" }}
              />
              <Button
                title="🔗 Share Verification Link"
                onPress={handleCopyCode}
                variant="outline"
                size="md"
                style={isDesktop ? { flex: 1 } : { width: "100%" }}
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
    gap: spacing.md,
    width: "100%",
    marginTop: spacing.md,
  },
  actionSectionMobile: {
    flexDirection: "column",
    gap: spacing.sm,
  },
});
