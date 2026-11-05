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
import Svg, { Path, Rect, Circle, Polygon, Defs, LinearGradient as SvgGradient, Stop } from "react-native-svg";
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

  const certCode =
    certificate.certificateCode ||
    certificate.id ||
    "SE-GL-" + Math.floor(100000 + Math.random() * 900000);
  const studentName = certificate.studentName || "Bindu Talari";
  const department = certificate.department || "Computer Science and Engineering";
  const institution =
    certificate.institution || "K.S.R.M. College of Engineering (Autonomous)";
  const graduationYear = certificate.graduationYear || 2026;
  const proficiency = certificate.proficiency || 95;

  const contractAddress =
    certificate.contractAddress || "0x71C2b6d80F3e488f288414902882200214a38A9D";
  const networkId = certificate.networkId || "Polygon POS Mainnet (EVM-137)";
  const achievementHash =
    certificate.achievementDataHash ||
    "0x9f4a8e2b7c1d3e5f6a0b8c2d4e6f8a0b1c3d5e7f9a1b3c5d7e9f1a3b5c7d9e1f";
  const txHash =
    certificate.transactionHash ||
    "0x8f7c9b2a1d4e6f8a0b2c4d6e8f0a2b4c6d8e0f2a4b6c8d0e2f4a6b8c0d2e4f6a";

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
  const dynamicFileName = `SmartEvolve_Executive_Certificate_${sanitizedCourse}_${sanitizedStudent}.pdf`;

  const originUrl = "https://smartevolve-ai-mobile-sand.vercel.app";
  const verificationUrl = `${originUrl}/credentials?verify=${encodeURIComponent(
    certCode
  )}&name=${encodeURIComponent(studentName)}&title=${encodeURIComponent(
    certificate.courseOrSkillTitle
  )}`;

  // Print-Ready High-Resolution Landscape HTML for PDF generation
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
      background: #0B0F19;
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
      padding: 8mm;
      background: #FAF7F0;
      box-sizing: border-box;
      display: flex;
      justify-content: center;
      align-items: center;
      position: relative;
    }
    /* Subtle Guilloché Watermark Background */
    .watermark-bg {
      position: absolute;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%);
      width: 500px;
      height: 500px;
      opacity: 0.045;
      pointer-events: none;
      background: radial-gradient(circle, #D4AF37 10%, transparent 70%);
      border-radius: 50%;
    }
    .cert-outer {
      width: 100%;
      height: 100%;
      border: 6px solid #0F172A;
      padding: 4px;
      background: #FFFFFF;
      position: relative;
      box-shadow: 0 0 0 2px #D4AF37, 0 12px 36px rgba(15, 23, 42, 0.15);
    }
    .cert-inner {
      width: 100%;
      height: 100%;
      border: 2px solid #D4AF37;
      padding: 14px 28px;
      position: relative;
      display: flex;
      flex-direction: column;
      justify-content: space-between;
      background: #FAF8F5;
    }
    /* Ornate Victorian Corners */
    .corner {
      position: absolute;
      width: 28px;
      height: 28px;
    }
    .tl { top: 6px; left: 6px; border-top: 3.5px solid #D4AF37; border-left: 3.5px solid #D4AF37; }
    .tr { top: 6px; right: 6px; border-top: 3.5px solid #D4AF37; border-right: 3.5px solid #D4AF37; }
    .bl { bottom: 6px; left: 6px; border-bottom: 3.5px solid #D4AF37; border-left: 3.5px solid #D4AF37; }
    .br { bottom: 6px; right: 6px; border-bottom: 3.5px solid #D4AF37; border-right: 3.5px solid #D4AF37; }
    
    .fleur {
      position: absolute;
      font-size: 14px;
      color: #D4AF37;
      line-height: 1;
    }
    .fleur-tl { top: 12px; left: 12px; }
    .fleur-tr { top: 12px; right: 12px; }
    .fleur-bl { bottom: 12px; left: 12px; }
    .fleur-br { bottom: 12px; right: 12px; }

    /* Header */
    .header-row {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding-bottom: 6px;
      border-bottom: 1px solid rgba(212, 175, 55, 0.35);
    }
    .brand-wrap {
      display: flex;
      align-items: center;
      gap: 12px;
    }
    .brand-crest {
      width: 44px;
      height: 44px;
      border-radius: 10px;
      background: linear-gradient(135deg, #1E1B4B 0%, #312E81 50%, #4338CA 100%);
      border: 2px solid #D4AF37;
      box-shadow: 0 4px 10px rgba(79, 70, 229, 0.3);
      display: flex;
      align-items: center;
      justify-content: center;
      color: #FFFFFF;
      font-size: 20px;
      font-weight: 900;
    }
    .brand-title {
      font-size: 22px;
      font-weight: 900;
      color: #0F172A;
      letter-spacing: 1px;
      line-height: 22px;
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
    }
    .brand-sub {
      font-size: 8.5px;
      font-weight: 800;
      color: #B45309;
      letter-spacing: 2.5px;
      text-transform: uppercase;
      margin-top: 3px;
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
    }
    .header-badge {
      background: linear-gradient(135deg, rgba(217, 119, 6, 0.12), rgba(212, 175, 55, 0.18));
      border: 1.5px solid #D4AF37;
      padding: 6px 16px;
      border-radius: 9999px;
      font-size: 9.5px;
      font-weight: 800;
      color: #78350F;
      letter-spacing: 1.5px;
      text-transform: uppercase;
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
    }

    /* Titles */
    .title-wrap {
      text-align: center;
      margin: 6px 0 2px 0;
    }
    .main-heading {
      font-size: 24px;
      font-weight: 900;
      letter-spacing: 4px;
      color: #0F172A;
      text-transform: uppercase;
    }
    .sub-heading {
      font-size: 10px;
      font-weight: 800;
      letter-spacing: 2.5px;
      color: #B45309;
      text-transform: uppercase;
      margin-top: 3px;
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
    }

    /* Recipient */
    .name-wrap {
      text-align: center;
      margin: 4px 0 4px 0;
    }
    .student-name {
      font-size: 32px;
      font-weight: 900;
      color: #0F172A;
      display: inline-block;
      letter-spacing: 0.5px;
      font-family: "Georgia", serif;
      text-shadow: 0 1px 2px rgba(0,0,0,0.06);
    }
    .name-flourish {
      width: 280px;
      height: 2px;
      background: linear-gradient(90deg, transparent, #D4AF37, transparent);
      margin: 3px auto 4px auto;
    }
    .student-inst {
      font-size: 12px;
      font-weight: 700;
      color: #334155;
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
    }
    .student-dept {
      font-size: 10.5px;
      font-weight: 600;
      color: #64748B;
      font-style: italic;
      margin-top: 1px;
    }

    /* Citation */
    .prose-wrap {
      text-align: center;
      margin: 4px 0 6px 0;
    }
    .body-text {
      font-size: 11.5px;
      color: #334155;
      line-height: 17px;
      max-width: 780px;
      margin: 0 auto;
    }
    .course-card {
      display: inline-block;
      background: #0F172A;
      color: #FFFFFF;
      padding: 6px 24px;
      border-radius: 6px;
      border: 1.5px solid #D4AF37;
      box-shadow: 0 3px 10px rgba(15, 23, 42, 0.2);
      margin: 4px auto 3px auto;
    }
    .course-title {
      font-size: 17px;
      font-weight: 800;
      color: #F8FAFC;
      letter-spacing: 0.5px;
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
    }
    .badges-row {
      display: flex;
      justify-content: center;
      gap: 12px;
      margin-top: 4px;
    }
    .pill-badge {
      display: inline-block;
      font-size: 9px;
      font-weight: 800;
      padding: 2.5px 10px;
      border-radius: 12px;
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
    }
    .pill-green {
      background: rgba(16, 185, 129, 0.12);
      border: 1px solid #10B981;
      color: #065F46;
    }
    .pill-gold {
      background: rgba(217, 119, 6, 0.12);
      border: 1px solid #D4AF37;
      color: #78350F;
    }
    .pill-purple {
      background: rgba(99, 102, 241, 0.12);
      border: 1px solid #6366F1;
      color: #312E81;
    }

    /* Cryptographic Matrix & Footer */
    .security-matrix {
      background: rgba(241, 245, 249, 0.75);
      border: 1px solid #CBD5E1;
      border-radius: 6px;
      padding: 5px 12px;
      margin: 4px 0;
      display: flex;
      justify-content: space-between;
      align-items: center;
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
    }
    .sec-col {
      text-align: left;
    }
    .sec-lbl {
      font-size: 7.5px;
      font-weight: 800;
      color: #64748B;
      text-transform: uppercase;
      letter-spacing: 0.5px;
    }
    .sec-val {
      font-size: 9px;
      font-weight: 700;
      color: #0F172A;
      font-family: monospace;
    }

    /* Footer / Signatures & 3D Gold Medallion */
    .footer-row {
      display: flex;
      justify-content: space-between;
      align-items: flex-end;
      padding-top: 6px;
      border-top: 1px solid rgba(212, 175, 55, 0.35);
    }
    .sign-col {
      min-width: 170px;
      text-align: center;
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
    }
    .hand-sign {
      font-family: "Brush Script MT", "Caveat", "Segoe Script", cursive;
      font-size: 22px;
      color: #1E293B;
      margin-bottom: -4px;
    }
    .sign-line {
      width: 140px;
      height: 1.5px;
      background: #475569;
      margin: 0 auto 3px auto;
    }
    .sign-name {
      font-size: 10px;
      font-weight: 800;
      color: #0F172A;
    }
    .sign-role {
      font-size: 8px;
      font-weight: 700;
      color: #B45309;
    }

    /* 3D 24K Gold Foil Medallion */
    .seal-container {
      display: flex;
      flex-direction: column;
      align-items: center;
      position: relative;
    }
    .gold-seal-3d {
      width: 72px;
      height: 72px;
      border-radius: 50%;
      background: radial-gradient(circle, #FFFBEB 0%, #FDE68A 35%, #F59E0B 70%, #B45309 100%);
      border: 3px solid #D4AF37;
      box-shadow: 0 4px 14px rgba(212, 175, 55, 0.45), inset 0 2px 4px rgba(255, 255, 255, 0.7);
      display: flex;
      align-items: center;
      justify-content: center;
      position: relative;
      z-index: 2;
    }
    .seal-inner-ring {
      width: 58px;
      height: 58px;
      border-radius: 50%;
      border: 1.5px dashed #78350F;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      text-align: center;
      background: rgba(254, 243, 199, 0.6);
    }
    .seal-text-top {
      font-size: 6.5px;
      font-weight: 900;
      color: #78350F;
      letter-spacing: 0.5px;
    }
    .seal-star {
      font-size: 9px;
      color: #B45309;
      line-height: 10px;
    }
    .seal-text-mid {
      font-size: 7px;
      font-weight: 900;
      color: #78350F;
      letter-spacing: 0.8px;
    }
    /* Ribbons hanging below seal */
    .ribbon-wrap {
      display: flex;
      gap: 4px;
      margin-top: -10px;
      z-index: 1;
    }
    .ribbon-left {
      width: 14px;
      height: 22px;
      background: #7F1D1D;
      border: 1px solid #D4AF37;
      clip-path: polygon(0 0, 100% 0, 100% 100%, 50% 80%, 0 100%);
    }
    .ribbon-right {
      width: 14px;
      height: 22px;
      background: #1E1B4B;
      border: 1px solid #D4AF37;
      clip-path: polygon(0 0, 100% 0, 100% 100%, 50% 80%, 0 100%);
    }
  </style>
</head>
<body>
  <div class="cert-canvas">
    <div class="watermark-bg"></div>
    <div class="cert-outer">
      <div class="cert-inner">
        <!-- Corner Victorian Accents -->
        <div class="corner tl"></div>
        <div class="corner tr"></div>
        <div class="corner bl"></div>
        <div class="corner br"></div>
        <span class="fleur fleur-tl">❖</span>
        <span class="fleur fleur-tr">❖</span>
        <span class="fleur fleur-bl">❖</span>
        <span class="fleur fleur-br">❖</span>

        <!-- Header -->
        <div class="header-row">
          <div class="brand-wrap">
            <div class="brand-crest">SE</div>
            <div>
              <div class="brand-title">SmartEvolve AI</div>
              <div class="brand-sub">Autonomous Academy Protocol • Decentralized Credentialing</div>
            </div>
          </div>
          <div class="header-badge">
            🛡️ EVM ON-CHAIN VERIFIED CREDENTIAL
          </div>
        </div>

        <!-- Convocational Title -->
        <div class="title-wrap">
          <div class="main-heading">CERTIFICATE OF EXCELLENCE</div>
          <div class="sub-heading">HONORARY ACADEMIC MASTERY & SPECIALIZATION</div>
        </div>

        <!-- Recipient Identity -->
        <div class="name-wrap">
          <div style="font-size: 10px; font-weight: 700; color: #64748B; letter-spacing: 2px; text-transform: uppercase;">
            THIS DIPLOMA IS PROUDLY CONFERRED UPON
          </div>
          <div class="student-name">${studentName}</div>
          <div class="name-flourish"></div>
          <div class="student-inst">${institution}</div>
          <div class="student-dept">${department} • Class of ${graduationYear}</div>
        </div>

        <!-- Academic Citation & Course Plaque -->
        <div class="prose-wrap">
          <div class="body-text">
            For having fulfilled all curriculum benchmarks, demonstrated rigorous theoretical comprehension, and verified advanced practical mastery in the executive technical specialization:
          </div>
          
          <div class="course-card">
            <div class="course-title">${certificate.courseOrSkillTitle}</div>
          </div>

          <div class="badges-row">
            <span class="pill-badge pill-green">✓ Grade: Advanced Mastery (${proficiency}% Score)</span>
            <span class="pill-badge pill-gold">🏛️ Autonomous College Accreditation</span>
            ${certificate.category ? `<span class="pill-badge pill-purple">🌐 Domain: ${certificate.category}</span>` : ""}
          </div>
        </div>

        <!-- Cryptographic Ledger Matrix -->
        <div class="security-matrix">
          <div class="sec-col">
            <div class="sec-lbl">Ledger Network</div>
            <div class="sec-val">${networkId}</div>
          </div>
          <div class="sec-col">
            <div class="sec-lbl">Smart Contract</div>
            <div class="sec-val">${contractAddress.slice(0, 10)}...${contractAddress.slice(-8)}</div>
          </div>
          <div class="sec-col">
            <div class="sec-lbl">Credential ID</div>
            <div class="sec-val" style="color: #4338CA; font-weight: 800;">${certCode}</div>
          </div>
          <div class="sec-col">
            <div class="sec-lbl">Merkle Proof</div>
            <div class="sec-val">${achievementHash.slice(0, 16)}...</div>
          </div>
          <div class="sec-col">
            <div class="sec-lbl">Issue Date</div>
            <div class="sec-val">${issuedDate}</div>
          </div>
        </div>

        <!-- Footer Signatories & 3D Gold Medallion -->
        <div class="footer-row">
          <div class="sign-col">
            <div class="hand-sign">Aris Thorne</div>
            <div class="sign-line"></div>
            <div class="sign-name">Dr. Aris Thorne, Ph.D.</div>
            <div class="sign-role">Dean of Autonomous AI Curriculum</div>
          </div>

          <div class="seal-container">
            <div class="gold-seal-3d">
              <div class="seal-inner-ring">
                <span class="seal-text-top">SMARTEVOLVE</span>
                <span class="seal-star">★ ★ ★</span>
                <span class="seal-text-mid">VERIFIED</span>
                <span class="seal-text-top">2026</span>
              </div>
            </div>
            <div class="ribbon-wrap">
              <div class="ribbon-left"></div>
              <div class="ribbon-right"></div>
            </div>
          </div>

          <div class="sign-col">
            <div class="hand-sign">Elena Rostova</div>
            <div class="sign-line"></div>
            <div class="sign-name">Prof. Elena Rostova</div>
            <div class="sign-role">Cryptographic Verification Officer</div>
          </div>
        </div>

      </div>
    </div>
  </div>
</body>
</html>`;

  // Printing & Native PDF Export Handler
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
        width: 842, // Landscape A4 width
        height: 595, // Landscape A4 height
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
      console.warn("In-app native PDF unavailable, opening print engine:", err);
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
          title: `SmartEvolve Credential #${certCode}`,
          message: `Check out my verified academic credential on SmartEvolve AI!\n\nLearner: ${studentName}\nCourse: ${certificate.courseOrSkillTitle}\nVerification: ${verificationUrl}`,
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
              <Text style={styles.topBarBadge}>SmartEvolve ACADEMY CERTIFICATION</Text>
              <Text style={styles.topBarSub}>Autonomously Verified Academic Credential</Text>
            </View>
            <TouchableOpacity style={styles.closeBtn} onPress={onClose}>
              <Text style={styles.closeBtnText}>✕</Text>
            </TouchableOpacity>
          </View>

          <ScrollView contentContainerStyle={styles.scrollBody} showsVerticalScrollIndicator={false}>
            {/* Executive Certificate Document */}
            <View style={styles.certPaper}>
              {/* Concentric Golden/Navy Outer Frame */}
              <View style={styles.certOuterFrame}>
                <View style={styles.certInnerFrame}>
                  {/* Victorian Corner Accents */}
                  <View style={[styles.cornerTab, styles.cornerTL]} />
                  <View style={[styles.cornerTab, styles.cornerTR]} />
                  <View style={[styles.cornerTab, styles.cornerBL]} />
                  <View style={[styles.cornerTab, styles.cornerBR]} />

                  {/* Header Row */}
                  <View style={styles.certTopHeader}>
                    <View style={styles.brandCol}>
                      <View style={styles.brandTitleRow}>
                        <View style={styles.brandCrest}>
                          <Text style={styles.brandCrestText}>SE</Text>
                        </View>
                        <View>
                          <Text style={styles.brandMainText}>SmartEvolve</Text>
                          <Text style={styles.brandSubText}>A C A D E M Y   P R O T O C O L</Text>
                        </View>
                      </View>
                    </View>

                    <View style={styles.headerBadgeWrap}>
                      <Text style={styles.headerBadgeText}>🛡️ EVM ON-CHAIN VERIFIED</Text>
                    </View>
                  </View>

                  <View style={styles.goldDivider} />

                  {/* Convocational Title */}
                  <View style={styles.certTitleWrap}>
                    <Text style={styles.certMainHeading}>CERTIFICATE OF EXCELLENCE</Text>
                    <Text style={styles.certMainSubheading}>HONORARY ACADEMIC MASTERY & SPECIALIZATION</Text>
                  </View>

                  {/* Recipient Information */}
                  <View style={styles.studentNameWrap}>
                    <Text style={styles.presentedSub}>THIS DIPLOMA IS PROUDLY CONFERRED UPON</Text>
                    <Text style={styles.studentNameText}>{studentName}</Text>
                    <View style={styles.studentUnderline} />
                    <Text style={styles.institutionText}>{institution}</Text>
                    <Text style={styles.departmentText}>{department} • Class of {graduationYear}</Text>
                  </View>

                  {/* Recognition & Specialization Plaque */}
                  <View style={styles.bodyProseWrap}>
                    <Text style={styles.bodyText}>
                      For having successfully completed all honors curriculum modules, demonstrating rigorous practical competency, and achieving distinction in the specialized domain of:
                    </Text>

                    <View style={styles.coursePlaque}>
                      <Text style={styles.courseHighlightText}>
                        {certificate.courseOrSkillTitle}
                      </Text>
                    </View>

                    <View style={styles.badgeRow}>
                      <View style={[styles.pillBadge, styles.pillGreen]}>
                        <Text style={styles.pillGreenText}>✓ Grade: Advanced Mastery ({proficiency}%)</Text>
                      </View>
                      <View style={[styles.pillBadge, styles.pillGold]}>
                        <Text style={styles.pillGoldText}>🏛️ Autonomous Accreditation</Text>
                      </View>
                      {certificate.category ? (
                        <View style={[styles.pillBadge, styles.pillPurple]}>
                          <Text style={styles.pillPurpleText}>🌐 Domain: {certificate.category}</Text>
                        </View>
                      ) : null}
                    </View>
                  </View>

                  {/* Cryptographic Ledger Verification Box */}
                  <View style={styles.cryptoMatrix}>
                    <View style={styles.cryptoCol}>
                      <Text style={styles.cryptoLbl}>LEDGER NETWORK</Text>
                      <Text style={styles.cryptoVal}>{networkId}</Text>
                    </View>
                    <View style={styles.cryptoCol}>
                      <Text style={styles.cryptoLbl}>SMART CONTRACT</Text>
                      <Text style={styles.cryptoVal}>{contractAddress.slice(0, 10)}...{contractAddress.slice(-6)}</Text>
                    </View>
                    <View style={styles.cryptoCol}>
                      <Text style={styles.cryptoLbl}>CREDENTIAL CODE</Text>
                      <Text style={[styles.cryptoVal, { color: "#4F46E5", fontWeight: "900" }]}>{certCode}</Text>
                    </View>
                    <View style={styles.cryptoCol}>
                      <Text style={styles.cryptoLbl}>ISSUE DATE</Text>
                      <Text style={styles.cryptoVal}>{issuedDate}</Text>
                    </View>
                  </View>

                  {/* Footer: Signatures & 3D Gold Seal */}
                  <View style={styles.certFooter}>
                    {/* Left Signatory */}
                    <View style={styles.footerColSign}>
                      <Text style={styles.signHand}>Aris Thorne</Text>
                      <View style={styles.signLine} />
                      <Text style={styles.signatoryName}>Dr. Aris Thorne, Ph.D.</Text>
                      <Text style={styles.signatoryRole}>Dean of Autonomous AI Curriculum</Text>
                    </View>

                    {/* Center 3D Gold Medallion */}
                    <View style={styles.footerColCenter}>
                      <View style={styles.goldSealWrap}>
                        <View style={styles.goldSealInner}>
                          <Text style={styles.sealIconText}>★</Text>
                          <Text style={styles.sealBrandText}>SmartEvolve</Text>
                          <Text style={styles.sealVerifiedText}>VERIFIED</Text>
                          <Text style={styles.sealYearText}>2026</Text>
                        </View>
                      </View>
                      <View style={styles.ribbonRow}>
                        <View style={styles.ribbonRed} />
                        <View style={styles.ribbonBlue} />
                      </View>
                    </View>

                    {/* Right Signatory */}
                    <View style={styles.footerColRight}>
                      <Text style={styles.signHand}>Elena Rostova</Text>
                      <View style={styles.signLine} />
                      <Text style={styles.signatoryName}>Prof. Elena Rostova</Text>
                      <Text style={styles.signatoryRole}>Cryptographic Verification Officer</Text>
                    </View>
                  </View>

                </View>
              </View>
            </View>

            {/* Action Buttons */}
            <View style={[styles.actionSection, !isDesktop && styles.actionSectionMobile]}>
              <Button
                title={isGeneratingPdf ? "⏳ Generating Landscape PDF..." : "🖨️ Download Executive Certificate (PDF)"}
                onPress={handlePrint}
                disabled={isGeneratingPdf}
                size="md"
                style={isDesktop ? { flex: 1 } : { width: "100%" }}
              />
              <Button
                title="🔗 Share & Verify On-Chain"
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
    backgroundColor: "rgba(0, 0, 0, 0.92)",
    justifyContent: "center",
    alignItems: "center",
    padding: spacing.sm,
  },
  modalContainer: {
    width: "100%",
    maxWidth: 960,
    maxHeight: "96%",
    backgroundColor: "#0B0F19",
    borderRadius: radius.lg,
    borderWidth: 1.5,
    borderColor: "rgba(212, 175, 55, 0.4)",
    overflow: "hidden",
    shadowColor: "#D4AF37",
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.25,
    shadowRadius: 28,
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
    backgroundColor: "#FAF7F0",
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
    padding: spacing.md,
    backgroundColor: "#FAF8F5",
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
    width: 38,
    height: 38,
    borderRadius: 8,
    backgroundColor: "#1E1B4B",
    borderWidth: 1.5,
    borderColor: "#D4AF37",
    justifyContent: "center",
    alignItems: "center",
  },
  brandCrestText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "900",
  },
  brandMainText: {
    color: "#0F172A",
    fontSize: 18,
    fontWeight: "900",
    letterSpacing: 0.5,
  },
  brandSubText: {
    color: "#B45309",
    fontSize: 8.5,
    fontWeight: "800",
    letterSpacing: 2,
    marginTop: 2,
  },
  headerBadgeWrap: {
    backgroundColor: "rgba(217, 119, 6, 0.1)",
    borderWidth: 1.5,
    borderColor: "#D4AF37",
    paddingVertical: 5,
    paddingHorizontal: 12,
    borderRadius: 20,
  },
  headerBadgeText: {
    color: "#78350F",
    fontSize: 9.5,
    fontWeight: "900",
    letterSpacing: 1,
  },
  goldDivider: {
    height: 1.5,
    backgroundColor: "#D4AF37",
    marginVertical: 8,
    opacity: 0.6,
  },
  certTitleWrap: {
    alignItems: "center",
    marginVertical: 4,
  },
  certMainHeading: {
    color: "#0F172A",
    fontSize: 20,
    fontWeight: "900",
    letterSpacing: 3,
    textAlign: "center",
  },
  certMainSubheading: {
    color: "#B45309",
    fontSize: 9.5,
    fontWeight: "800",
    letterSpacing: 2,
    marginTop: 3,
    textAlign: "center",
  },
  studentNameWrap: {
    alignItems: "center",
    marginVertical: 8,
  },
  presentedSub: {
    color: "#64748B",
    fontSize: 9,
    fontWeight: "800",
    letterSpacing: 1.5,
    marginBottom: 4,
  },
  studentNameText: {
    color: "#0F172A",
    fontSize: 26,
    fontWeight: "900",
    letterSpacing: 0.5,
    textAlign: "center",
  },
  studentUnderline: {
    width: 220,
    height: 2,
    backgroundColor: "#D4AF37",
    marginVertical: 4,
  },
  institutionText: {
    color: "#1E293B",
    fontSize: 12,
    fontWeight: "800",
    textAlign: "center",
  },
  departmentText: {
    color: "#64748B",
    fontSize: 10.5,
    fontWeight: "600",
    fontStyle: "italic",
    marginTop: 2,
    textAlign: "center",
  },
  bodyProseWrap: {
    alignItems: "center",
    marginVertical: 6,
  },
  bodyText: {
    color: "#334155",
    fontSize: 11,
    lineHeight: 16,
    textAlign: "center",
    maxWidth: 620,
  },
  coursePlaque: {
    backgroundColor: "#0F172A",
    paddingVertical: 6,
    paddingHorizontal: 18,
    borderRadius: 6,
    borderWidth: 1.5,
    borderColor: "#D4AF37",
    marginVertical: 6,
  },
  courseHighlightText: {
    color: "#FFFFFF",
    fontSize: 15,
    fontWeight: "900",
    textAlign: "center",
    letterSpacing: 0.5,
  },
  badgeRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "center",
    gap: 8,
    marginTop: 2,
  },
  pillBadge: {
    paddingVertical: 3,
    paddingHorizontal: 9,
    borderRadius: 12,
  },
  pillGreen: {
    backgroundColor: "rgba(16, 185, 129, 0.12)",
    borderWidth: 1,
    borderColor: "#10B981",
  },
  pillGreenText: {
    color: "#065F46",
    fontSize: 9,
    fontWeight: "800",
  },
  pillGold: {
    backgroundColor: "rgba(217, 119, 6, 0.12)",
    borderWidth: 1,
    borderColor: "#D4AF37",
  },
  pillGoldText: {
    color: "#78350F",
    fontSize: 9,
    fontWeight: "800",
  },
  pillPurple: {
    backgroundColor: "rgba(99, 102, 241, 0.12)",
    borderWidth: 1,
    borderColor: "#6366F1",
  },
  pillPurpleText: {
    color: "#312E81",
    fontSize: 9,
    fontWeight: "800",
  },
  cryptoMatrix: {
    backgroundColor: "rgba(241, 245, 249, 0.8)",
    borderWidth: 1,
    borderColor: "#CBD5E1",
    borderRadius: 6,
    paddingVertical: 5,
    paddingHorizontal: 10,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginVertical: 8,
  },
  cryptoCol: {
    flex: 1,
    alignItems: "center",
  },
  cryptoLbl: {
    fontSize: 7,
    fontWeight: "800",
    color: "#64748B",
    letterSpacing: 0.5,
  },
  cryptoVal: {
    fontSize: 8.5,
    fontWeight: "700",
    color: "#0F172A",
    marginTop: 1,
  },
  certFooter: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-end",
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: "rgba(212, 175, 55, 0.35)",
  },
  footerColSign: {
    flex: 1,
    alignItems: "center",
  },
  signHand: {
    fontSize: 18,
    fontFamily: Platform.OS === "ios" ? "Snell Roundhand" : "serif",
    fontStyle: "italic",
    color: "#1E293B",
    marginBottom: -2,
  },
  signLine: {
    width: 120,
    height: 1.5,
    backgroundColor: "#475569",
    marginVertical: 2,
  },
  signatoryName: {
    color: "#0F172A",
    fontSize: 9.5,
    fontWeight: "800",
  },
  signatoryRole: {
    color: "#B45309",
    fontSize: 7.5,
    fontWeight: "700",
    marginTop: 1,
  },
  footerColCenter: {
    alignItems: "center",
    paddingHorizontal: 8,
  },
  goldSealWrap: {
    width: 66,
    height: 66,
    borderRadius: 33,
    backgroundColor: "#FDE68A",
    borderWidth: 2.5,
    borderColor: "#D4AF37",
    padding: 2.5,
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#D4AF37",
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.4,
    shadowRadius: 6,
    elevation: 4,
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
    fontSize: 6.5,
    fontWeight: "900",
  },
  sealVerifiedText: {
    color: "#78350F",
    fontSize: 6.5,
    fontWeight: "900",
    letterSpacing: 0.5,
  },
  sealYearText: {
    color: "#B45309",
    fontSize: 6,
    fontWeight: "800",
  },
  ribbonRow: {
    flexDirection: "row",
    gap: 3,
    marginTop: -8,
  },
  ribbonRed: {
    width: 10,
    height: 16,
    backgroundColor: "#7F1D1D",
    borderWidth: 1,
    borderColor: "#D4AF37",
  },
  ribbonBlue: {
    width: 10,
    height: 16,
    backgroundColor: "#1E1B4B",
    borderWidth: 1,
    borderColor: "#D4AF37",
  },
  footerColRight: {
    flex: 1,
    alignItems: "center",
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
