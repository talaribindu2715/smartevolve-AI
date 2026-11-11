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
  Linking,
  useWindowDimensions,
} from "react-native";
import * as Print from "expo-print";
import * as Sharing from "expo-sharing";
import * as FileSystem from "expo-file-system";
import { useAuth } from "../store/authContext";
import { Button } from "./Button";
import { colors, radius, spacing } from "../theme/colors";

export interface CertificateData {
  id: string;
  studentName?: string;
  courseOrSkillTitle: string;
  category?: string;
  proficiency?: number;
  issuedDate?: string;
  certificateCode?: string;
  department?: string;
  institution?: string;
  graduationYear?: number;
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
  const { user } = useAuth();
  if (!certificate) return null;

  const certCode =
    certificate.certificateCode ||
    certificate.id ||
    "SE-" + Math.floor(100000 + Math.random() * 900000);

  // Student name dynamically pulled from profile or cert
  const candidateName =
    certificate.studentName &&
    certificate.studentName.trim().length > 0 &&
    certificate.studentName !== "Student" &&
    certificate.studentName !== "Alex Chen"
      ? certificate.studentName.trim()
      : user?.fullName && user.fullName !== "Student" && user.fullName !== "Alex Chen"
      ? user.fullName.trim()
      : certificate.studentName?.trim() || user?.fullName?.trim() || "Student";
  const studentName = candidateName;

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

  const originUrl = "https://smartevolve-ai-mobile-sand.vercel.app";
  const verificationUrl = `${originUrl}/credentials?verify=${encodeURIComponent(
    certCode
  )}&name=${encodeURIComponent(studentName)}&title=${encodeURIComponent(
    certificate.courseOrSkillTitle
  )}`;

  // Print-Ready Clean Academic Certificate HTML for Landscape A4 PDF
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
      font-family: "Georgia", "Times New Roman", serif;
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
      padding: 10mm;
      background: #FCFBF8;
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
      padding: 24px 36px;
      position: relative;
      display: flex;
      flex-direction: column;
      justify-content: space-between;
      background: #FFFFFF;
    }
    .corner {
      position: absolute;
      width: 24px;
      height: 24px;
    }
    .tl { top: 6px; left: 6px; border-top: 3px solid #D4AF37; border-left: 3px solid #D4AF37; }
    .tr { top: 6px; right: 6px; border-top: 3px solid #D4AF37; border-right: 3px solid #D4AF37; }
    .bl { bottom: 6px; left: 6px; border-bottom: 3px solid #D4AF37; border-left: 3px solid #D4AF37; }
    .br { bottom: 6px; right: 6px; border-bottom: 3px solid #D4AF37; border-right: 3px solid #D4AF37; }

    /* Header */
    .header-row {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding-bottom: 10px;
      border-bottom: 1px solid #E2E8F0;
    }
    .brand-wrap {
      display: flex;
      align-items: center;
      gap: 12px;
    }
    .brand-crest {
      width: 40px;
      height: 40px;
      border-radius: 8px;
      background: #0F172A;
      border: 2px solid #D4AF37;
      display: flex;
      align-items: center;
      justify-content: center;
      color: #FFFFFF;
      font-size: 18px;
      font-weight: 900;
    }
    .brand-title {
      font-size: 22px;
      font-weight: 900;
      color: #0F172A;
      letter-spacing: 0.5px;
      line-height: 22px;
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
    }
    .brand-sub {
      font-size: 9px;
      font-weight: 800;
      color: #D97706;
      letter-spacing: 3px;
      text-transform: uppercase;
      margin-top: 3px;
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
    }
    .header-badge {
      background: rgba(217, 119, 6, 0.08);
      border: 1.5px solid #D4AF37;
      padding: 6px 16px;
      border-radius: 9999px;
      font-size: 9.5px;
      font-weight: 800;
      color: #92400E;
      letter-spacing: 1.5px;
      text-transform: uppercase;
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
    }

    /* Titles */
    .title-wrap {
      text-align: center;
      margin: 12px 0 6px 0;
    }
    .main-heading {
      font-size: 25px;
      font-weight: 900;
      letter-spacing: 4px;
      color: #0F172A;
      text-transform: uppercase;
    }
    .sub-heading {
      font-size: 10.5px;
      font-weight: 700;
      letter-spacing: 2px;
      color: #D97706;
      text-transform: uppercase;
      margin-top: 6px;
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
    }

    /* Recipient Name */
    .name-wrap {
      text-align: center;
      margin: 10px 0;
    }
    .student-name {
      font-size: 34px;
      font-weight: 900;
      color: #0F172A;
      display: inline-block;
      letter-spacing: 0.5px;
      padding-bottom: 4px;
      border-bottom: 2px solid #D4AF37;
      font-family: "Georgia", serif;
    }

    /* Citation */
    .prose-wrap {
      text-align: center;
      margin: 8px 0 14px 0;
    }
    .body-text {
      font-size: 12.5px;
      color: #334155;
      line-height: 20px;
      max-width: 740px;
      margin: 0 auto;
    }
    .course-card {
      display: inline-block;
      background: #0F172A;
      color: #FFFFFF;
      padding: 8px 26px;
      border-radius: 6px;
      border: 1.5px solid #D4AF37;
      margin: 8px auto 6px auto;
    }
    .course-title {
      font-size: 18px;
      font-weight: 800;
      color: #F8FAFC;
      letter-spacing: 0.5px;
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
    }

    /* Footer / Signatures & Seal */
    .footer-row {
      display: flex;
      justify-content: space-between;
      align-items: flex-end;
      padding-top: 14px;
      border-top: 1px solid #E2E8F0;
    }
    .col-meta {
      min-width: 170px;
      text-align: left;
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
    }
    .meta-lbl {
      font-size: 8px;
      font-weight: 800;
      color: #64748B;
      text-transform: uppercase;
      letter-spacing: 0.5px;
    }
    .meta-val {
      font-size: 11px;
      font-weight: 800;
      color: #0F172A;
      margin-top: 2px;
    }
    .meta-code {
      font-size: 11px;
      font-weight: 900;
      color: #4338CA;
      font-family: monospace;
      margin-top: 2px;
    }

    /* Seal */
    .seal-wrap {
      width: 78px;
      height: 78px;
      border-radius: 50%;
      background: radial-gradient(circle, #FEF3C7 0%, #FDE68A 60%, #F59E0B 100%);
      border: 2.5px solid #D4AF37;
      padding: 3px;
      display: flex;
      align-items: center;
      justify-content: center;
      box-shadow: 0 4px 12px rgba(212, 175, 55, 0.3);
    }
    .seal-inner {
      width: 100%;
      height: 100%;
      border-radius: 50%;
      border: 1.5px dashed #78350F;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      text-align: center;
    }
    .seal-brand {
      font-size: 7.5px;
      font-weight: 900;
      color: #78350F;
    }
    .seal-star {
      font-size: 8px;
      color: #B45309;
      line-height: 10px;
    }
    .seal-ver {
      font-size: 7.5px;
      font-weight: 900;
      color: #78350F;
      letter-spacing: 0.8px;
    }

    /* Signatory */
    .sign-col {
      min-width: 180px;
      text-align: center;
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
    }
    .sign-line {
      width: 150px;
      height: 1.5px;
      background: #475569;
      margin: 0 auto 5px auto;
    }
    .sign-title {
      font-size: 11px;
      font-weight: 800;
      color: #0F172A;
    }
    .sign-sub {
      font-size: 9px;
      font-weight: 700;
      color: #D97706;
      margin-top: 1px;
    }
  </style>
</head>
<body>
  <div class="cert-canvas">
    <div class="cert-outer">
      <div class="cert-inner">
        <!-- Corner Borders -->
        <div class="corner tl"></div>
        <div class="corner tr"></div>
        <div class="corner bl"></div>
        <div class="corner br"></div>

        <!-- Header -->
        <div class="header-row">
          <div class="brand-wrap">
            <div class="brand-crest">SE</div>
            <div>
              <div class="brand-title">SmartEvolve Academy</div>
              <div class="brand-sub">Official Academic Certification</div>
            </div>
          </div>
          <div class="header-badge">
            ✓ VERIFIED CERTIFICATE
          </div>
        </div>

        <!-- Convocational Title -->
        <div class="title-wrap">
          <div class="main-heading">CERTIFICATE OF COMPLETION</div>
          <div class="sub-heading">THIS IS TO CERTIFY THAT</div>
        </div>

        <!-- Recipient Identity -->
        <div class="name-wrap">
          <div class="student-name">${studentName}</div>
        </div>

        <!-- Citation & Course Plaque -->
        <div class="prose-wrap">
          <div class="body-text">
            has successfully fulfilled all curriculum modules, course assessments, and demonstrated comprehensive mastery in:
          </div>
          
          <div class="course-card">
            <div class="course-title">${certificate.courseOrSkillTitle}</div>
          </div>

          ${
            certificate.category
              ? `<div style="font-size: 11px; font-weight: 700; color: #047857; margin-top: 4px; font-family: sans-serif;">Domain Specialization: ${certificate.category}</div>`
              : ""
          }
        </div>

        <!-- Footer: Details, Seal & Authentic Signatory -->
        <div class="footer-row">
          <div class="col-meta">
            <div class="meta-lbl">Issued Date</div>
            <div class="meta-val">${issuedDate}</div>

            <div class="meta-lbl" style="margin-top: 8px;">Certificate ID</div>
            <div class="meta-code">${certCode}</div>
          </div>

          <div class="seal-wrap">
            <div class="seal-inner">
              <span class="seal-brand">SmartEvolve</span>
              <span class="seal-star">★ ★ ★</span>
              <span class="seal-ver">CERTIFIED</span>
            </div>
          </div>

          <div class="sign-col">
            <div class="sign-line"></div>
            <div class="sign-title">Program Director</div>
            <div class="sign-sub">SmartEvolve Academy</div>
          </div>
        </div>

      </div>
    </div>
  </div>
</body>
</html>`;

  // Printing & PDF Generation Handler
  const handlePrint = async () => {
    if (Platform.OS === "web" && typeof window !== "undefined") {
      const originalTitle = document.title;
      document.title = dynamicFileName.replace(".pdf", "");

      const iframe = document.createElement("iframe");
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

    try {
      setIsGeneratingPdf(true);
      const html = generateCertificateHtml();

      const { uri } = await Print.printToFileAsync({
        html,
        width: 842, // Landscape A4 width in points
        height: 595, // Landscape A4 height in points
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
      console.warn("In-app native PDF unavailable:", err);
      try {
        await Linking.openURL(verificationUrl);
      } catch (_) {
        Share.share({
          title: dynamicFileName,
          message: `Official Certificate for ${studentName} - ${certificate.courseOrSkillTitle}\n\nVerify: ${verificationUrl}`,
          url: verificationUrl,
        });
      }
    } finally {
      setIsGeneratingPdf(false);
    }
  };

  const handleCopyCode = async () => {
    if (Platform.OS === "web") {
      if (typeof navigator !== "undefined" && navigator.clipboard) {
        await navigator.clipboard.writeText(verificationUrl);
        Alert.alert("Link Copied!", `Verification URL copied to clipboard:\n\n${verificationUrl}`);
      } else {
        Alert.alert("Public Verification Link", `Share this link:\n\n${verificationUrl}`);
      }
    } else {
      try {
        await Share.share({
          title: `SmartEvolve Certificate #${certCode}`,
          message: `Check out my verified certificate on SmartEvolve Academy!\n\nStudent: ${studentName}\nCourse: ${certificate.courseOrSkillTitle}\nVerification: ${verificationUrl}`,
          url: verificationUrl,
        });
      } catch (_) {
        Alert.alert("Verification Link", verificationUrl);
      }
    }
  };

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <View style={styles.overlay}>
        <View style={styles.modalContainer}>
          {/* Top Bar */}
          <View style={styles.topBar}>
            <View>
              <Text style={styles.topBarBadge}>SmartEvolve ACADEMY CERTIFICATE</Text>
              <Text style={styles.topBarSub}>Verified Academic Achievement</Text>
            </View>
            <TouchableOpacity style={styles.closeBtn} onPress={onClose}>
              <Text style={styles.closeBtnText}>✕</Text>
            </TouchableOpacity>
          </View>

          <ScrollView contentContainerStyle={styles.scrollBody} showsVerticalScrollIndicator={false}>
            {/* Clean Certificate Document */}
            <View style={styles.certPaper}>
              <View style={styles.certOuterFrame}>
                <View style={styles.certInnerFrame}>
                  {/* Corner Tabs */}
                  <View style={[styles.cornerTab, styles.cornerTL]} />
                  <View style={[styles.cornerTab, styles.cornerTR]} />
                  <View style={[styles.cornerTab, styles.cornerBL]} />
                  <View style={[styles.cornerTab, styles.cornerBR]} />

                  {/* Header */}
                  <View style={styles.certTopHeader}>
                    <View style={styles.brandCol}>
                      <View style={styles.brandTitleRow}>
                        <View style={styles.brandCrest}>
                          <Text style={styles.brandCrestText}>SE</Text>
                        </View>
                        <View>
                          <Text style={styles.brandMainText}>SmartEvolve Academy</Text>
                          <Text style={styles.brandSubText}>OFFICIAL CERTIFICATION</Text>
                        </View>
                      </View>
                    </View>

                    <View style={styles.headerBadgeWrap}>
                      <Text style={styles.headerBadgeText}>✓ VERIFIED</Text>
                    </View>
                  </View>

                  <View style={styles.goldDivider} />

                  {/* Convocational Title */}
                  <View style={styles.certTitleWrap}>
                    <Text style={styles.certMainHeading}>CERTIFICATE OF COMPLETION</Text>
                    <Text style={styles.certMainSubheading}>THIS IS TO CERTIFY THAT</Text>
                  </View>

                  {/* Recipient Information */}
                  <View style={styles.studentNameWrap}>
                    <Text style={styles.studentNameText}>{studentName}</Text>
                    <View style={styles.studentUnderline} />
                  </View>

                  {/* Citation & Course Plaque */}
                  <View style={styles.bodyProseWrap}>
                    <Text style={styles.bodyText}>
                      has successfully fulfilled all curriculum modules, course assessments, and demonstrated comprehensive mastery in:
                    </Text>

                    <View style={styles.coursePlaque}>
                      <Text style={styles.courseHighlightText}>
                        {certificate.courseOrSkillTitle}
                      </Text>
                    </View>

                    {certificate.category ? (
                      <Text style={styles.domainText}>
                        Domain Specialization: {certificate.category}
                      </Text>
                    ) : null}
                  </View>

                  {/* Footer: Date, Code, Seal & Signatory */}
                  <View style={styles.certFooter}>
                    <View style={styles.footerColLeft}>
                      <Text style={styles.metaLabel}>Issued Date</Text>
                      <Text style={styles.metaValue}>{issuedDate}</Text>

                      <Text style={[styles.metaLabel, { marginTop: 6 }]}>Certificate ID</Text>
                      <Text style={styles.metaCode}>{certCode}</Text>
                    </View>

                    {/* Official Seal */}
                    <View style={styles.footerColCenter}>
                      <View style={styles.goldSealWrap}>
                        <View style={styles.goldSealInner}>
                          <Text style={styles.sealIconText}>★</Text>
                          <Text style={styles.sealBrandText}>SmartEvolve</Text>
                          <Text style={styles.sealVerifiedText}>CERTIFIED</Text>
                          <Text style={styles.sealIconText}>★</Text>
                        </View>
                      </View>
                    </View>

                    {/* Authorized Signatory */}
                    <View style={styles.footerColRight}>
                      <View style={styles.signLine} />
                      <Text style={styles.signatoryName}>Program Director</Text>
                      <Text style={styles.signatoryRole}>SmartEvolve Academy</Text>
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
                title="🔗 Share Certificate"
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
    backgroundColor: "rgba(0, 0, 0, 0.90)",
    justifyContent: "center",
    alignItems: "center",
    padding: spacing.sm,
  },
  modalContainer: {
    width: "100%",
    maxWidth: 920,
    maxHeight: "96%",
    backgroundColor: "#0B0F19",
    borderRadius: radius.lg,
    borderWidth: 1.5,
    borderColor: "rgba(212, 175, 55, 0.4)",
    overflow: "hidden",
    shadowColor: "#D4AF37",
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.25,
    shadowRadius: 24,
    elevation: 16,
  },
  topBar: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: spacing.md,
    paddingVertical: 10,
    backgroundColor: "#0F172A",
    borderBottomWidth: 1,
    borderBottomColor: "rgba(212, 175, 55, 0.3)",
  },
  topBarBadge: {
    color: "#D4AF37",
    fontSize: 12,
    fontWeight: "900",
    letterSpacing: 1.5,
  },
  topBarSub: {
    color: colors.textSecondary,
    fontSize: 11,
    marginTop: 2,
  },
  closeBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: "rgba(255, 255, 255, 0.1)",
    justifyContent: "center",
    alignItems: "center",
  },
  closeBtnText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "700",
  },
  scrollBody: {
    padding: spacing.md,
    alignItems: "center",
  },
  certPaper: {
    width: "100%",
    backgroundColor: "#FCFBF8",
    borderRadius: 8,
    padding: 6,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.25,
    shadowRadius: 16,
    elevation: 8,
  },
  certOuterFrame: {
    borderWidth: 5,
    borderColor: "#0F172A",
    padding: 3,
    backgroundColor: "#FFFFFF",
  },
  certInnerFrame: {
    borderWidth: 1.5,
    borderColor: "#D4AF37",
    padding: spacing.lg,
    backgroundColor: "#FFFFFF",
    position: "relative",
  },
  cornerTab: {
    position: "absolute",
    width: 20,
    height: 20,
    borderColor: "#D4AF37",
  },
  cornerTL: { top: 4, left: 4, borderTopWidth: 3, borderLeftWidth: 3 },
  cornerTR: { top: 4, right: 4, borderTopWidth: 3, borderRightWidth: 3 },
  cornerBL: { bottom: 4, left: 4, borderBottomWidth: 3, borderLeftWidth: 3 },
  cornerBR: { bottom: 4, right: 4, borderBottomWidth: 3, borderRightWidth: 3 },

  certTopHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingBottom: 8,
  },
  brandCol: {
    flex: 1,
  },
  brandTitleRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  brandCrest: {
    width: 36,
    height: 36,
    borderRadius: 8,
    backgroundColor: "#0F172A",
    borderWidth: 1.5,
    borderColor: "#D4AF37",
    justifyContent: "center",
    alignItems: "center",
  },
  brandCrestText: {
    color: "#FFFFFF",
    fontSize: 15,
    fontWeight: "900",
  },
  brandMainText: {
    color: "#0F172A",
    fontSize: 18,
    fontWeight: "900",
    letterSpacing: 0.5,
  },
  brandSubText: {
    color: "#D97706",
    fontSize: 8.5,
    fontWeight: "800",
    letterSpacing: 2,
    marginTop: 2,
  },
  headerBadgeWrap: {
    backgroundColor: "rgba(217, 119, 6, 0.08)",
    borderWidth: 1.5,
    borderColor: "#D4AF37",
    paddingVertical: 5,
    paddingHorizontal: 12,
    borderRadius: 20,
  },
  headerBadgeText: {
    color: "#92400E",
    fontSize: 9.5,
    fontWeight: "900",
    letterSpacing: 1,
  },
  goldDivider: {
    height: 1.5,
    backgroundColor: "#D4AF37",
    marginVertical: 10,
    opacity: 0.7,
  },
  certTitleWrap: {
    alignItems: "center",
    marginVertical: 6,
  },
  certMainHeading: {
    color: "#0F172A",
    fontSize: 22,
    fontWeight: "900",
    letterSpacing: 3,
    textAlign: "center",
  },
  certMainSubheading: {
    color: "#D97706",
    fontSize: 10,
    fontWeight: "800",
    letterSpacing: 2,
    marginTop: 4,
    textAlign: "center",
  },
  studentNameWrap: {
    alignItems: "center",
    marginVertical: 10,
  },
  studentNameText: {
    color: "#0F172A",
    fontSize: 28,
    fontWeight: "900",
    letterSpacing: 0.5,
    textAlign: "center",
  },
  studentUnderline: {
    width: 200,
    height: 2,
    backgroundColor: "#D4AF37",
    marginTop: 6,
  },
  bodyProseWrap: {
    alignItems: "center",
    marginVertical: 8,
  },
  bodyText: {
    color: "#334155",
    fontSize: 12,
    lineHeight: 18,
    textAlign: "center",
    maxWidth: 620,
  },
  coursePlaque: {
    backgroundColor: "#0F172A",
    paddingVertical: 8,
    paddingHorizontal: 22,
    borderRadius: 6,
    borderWidth: 1.5,
    borderColor: "#D4AF37",
    marginVertical: 8,
  },
  courseHighlightText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "800",
    textAlign: "center",
    letterSpacing: 0.5,
  },
  domainText: {
    color: "#047857",
    fontSize: 11,
    fontWeight: "700",
    marginTop: 2,
  },
  certFooter: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-end",
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: "#E2E8F0",
    marginTop: 8,
  },
  footerColLeft: {
    flex: 1,
  },
  metaLabel: {
    fontSize: 8,
    fontWeight: "800",
    color: "#64748B",
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  metaValue: {
    fontSize: 11,
    fontWeight: "800",
    color: "#0F172A",
    marginTop: 1,
  },
  metaCode: {
    fontSize: 11,
    fontWeight: "900",
    color: "#4338CA",
    fontFamily: Platform.OS === "ios" ? "Menlo" : "monospace",
    marginTop: 1,
  },
  footerColCenter: {
    alignItems: "center",
    paddingHorizontal: 12,
  },
  goldSealWrap: {
    width: 68,
    height: 68,
    borderRadius: 34,
    backgroundColor: "#FEF3C7",
    borderWidth: 2.5,
    borderColor: "#D4AF37",
    padding: 3,
    justifyContent: "center",
    alignItems: "center",
  },
  goldSealInner: {
    width: "100%",
    height: "100%",
    borderRadius: 30,
    borderWidth: 1.2,
    borderStyle: "dashed",
    borderColor: "#78350F",
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#FEF3C7",
  },
  sealIconText: {
    color: "#B45309",
    fontSize: 7,
  },
  sealBrandText: {
    color: "#78350F",
    fontSize: 7,
    fontWeight: "900",
  },
  sealVerifiedText: {
    color: "#78350F",
    fontSize: 7,
    fontWeight: "900",
    letterSpacing: 0.5,
  },
  footerColRight: {
    flex: 1,
    alignItems: "center",
  },
  signLine: {
    width: 130,
    height: 1.5,
    backgroundColor: "#475569",
    marginBottom: 4,
  },
  signatoryName: {
    color: "#0F172A",
    fontSize: 10.5,
    fontWeight: "800",
  },
  signatoryRole: {
    color: "#D97706",
    fontSize: 8.5,
    fontWeight: "700",
    marginTop: 1,
  },
  actionSection: {
    flexDirection: "row",
    gap: spacing.md,
    width: "100%",
    marginTop: spacing.md,
  },
  actionSectionMobile: {
    flexDirection: "column",
  },
});
