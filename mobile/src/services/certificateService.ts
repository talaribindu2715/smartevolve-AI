import AsyncStorage from "@react-native-async-storage/async-storage";
import { Credential } from "../types";

export const EARNED_CERTS_STORAGE_KEY = "@smartevolve_earned_course_certificates";

export interface EarnedCourseCertificate {
  id: string;
  courseTitle: string;
  courseId: string;
  category?: string;
  score: number;
  total: number;
  percentage: number;
  certCode: string;
  studentName?: string;
  issuedAt: string;
  transactionHash?: string;
  contractAddress?: string;
}

// Initial certificate for past completed masterclass courses
const DEFAULT_PAST_COMPLETED_CERTS: EarnedCourseCertificate[] = [
  {
    id: "SE-GL-926487",
    certCode: "SE-GL-926487",
    courseTitle: "Spring Boot 3 Full Course 2024 - Enterprise REST APIs",
    courseId: "spring-boot-3-full-course",
    category: "Web Development",
    score: 9,
    total: 10,
    percentage: 90,
    studentName: "Bindu Talari",
    issuedAt: "2026-11-03T16:00:00.000Z",
    transactionHash: "0x8f3c7e4b2d1a9e0f6c5b4a3d2e1f0e9d8c7b6a5e4d3c2b1a0f9e8d7c6b5a4e3d",
    contractAddress: "0x71C84164b3D9309b7824C7E6C1826ca37300C740",
  },
];

export async function getStoredEarnedCertificates(): Promise<EarnedCourseCertificate[]> {
  try {
    const raw = await AsyncStorage.getItem(EARNED_CERTS_STORAGE_KEY);
    let list: EarnedCourseCertificate[] = raw ? JSON.parse(raw) : [];

    let updated = false;
    for (const def of DEFAULT_PAST_COMPLETED_CERTS) {
      if (!list.some((c) => c.courseTitle.toLowerCase() === def.courseTitle.toLowerCase() || c.id === def.id)) {
        list.push(def);
        updated = true;
      }
    }
    if (updated || !raw) {
      await AsyncStorage.setItem(EARNED_CERTS_STORAGE_KEY, JSON.stringify(list));
    }
    return list;
  } catch (err) {
    console.warn("Failed to load earned certificates:", err);
    return DEFAULT_PAST_COMPLETED_CERTS;
  }
}

export async function saveEarnedCertificate(data: {
  courseTitle: string;
  courseId: string;
  category?: string;
  score: number;
  total: number;
  percentage: number;
  studentName?: string;
  certCode?: string;
}): Promise<EarnedCourseCertificate> {
  try {
    const existing = await getStoredEarnedCertificates();
    const certCode =
      data.certCode ||
      "SE-GL-" + Math.floor(100000 + Math.random() * 900000);

    const newCert: EarnedCourseCertificate = {
      id: certCode,
      certCode,
      courseTitle: data.courseTitle,
      courseId: data.courseId,
      category: data.category || "Academic Specialization",
      score: data.score,
      total: data.total,
      percentage: data.percentage,
      studentName: data.studentName,
      issuedAt: new Date().toISOString(),
      transactionHash:
        "0x" + Array.from({ length: 64 }, () => Math.floor(Math.random() * 16).toString(16)).join(""),
      contractAddress: "0x71C84164b3D9309b7824C7E6C1826ca37300C740",
    };

    const filtered = existing.filter(
      (c) =>
        c.courseTitle.toLowerCase() !== data.courseTitle.toLowerCase() &&
        c.courseId !== data.courseId &&
        c.id !== newCert.id
    );
    filtered.unshift(newCert);

    await AsyncStorage.setItem(EARNED_CERTS_STORAGE_KEY, JSON.stringify(filtered));
    return newCert;
  } catch (err) {
    console.warn("Failed to save earned certificate:", err);
    throw err;
  }
}

export function convertCertToCredential(cert: EarnedCourseCertificate): Credential {
  return {
    id: cert.certCode || cert.id,
    credentialType: cert.category || "COURSE_COMPLETION",
    achievementTitle: cert.courseTitle,
    achievementDataHash:
      cert.transactionHash ||
      "0x8f3c7e4b2d1a9e0f6c5b4a3d2e1f0e9d8c7b6a5e4d3c2b1a0f9e8d7c6b5a4e3d",
    issuerAddress: "0xSmartEvolveAcademyContract",
    networkId: "Polygon EVM (ChainID: 137)",
    contractAddress:
      cert.contractAddress || "0x71C84164b3D9309b7824C7E6C1826ca37300C740",
    transactionHash:
      cert.transactionHash ||
      "0x8f3c7e4b2d1a9e0f6c5b4a3d2e1f0e9d8c7b6a5e4d3c2b1a0f9e8d7c6b5a4e3d",
    status: "CONFIRMED",
    issuedAt: cert.issuedAt,
    verifiedAt: cert.issuedAt,
    blockNumber: 48921432,
  };
}

export function mergeCredentialsWithStoredCerts(
  backendCreds: Credential[] | undefined,
  storedCerts: EarnedCourseCertificate[]
): Credential[] {
  const map = new Map<string, Credential>();

  (backendCreds || []).forEach((c) => {
    map.set(c.achievementTitle.toLowerCase(), c);
  });

  storedCerts.forEach((cert) => {
    const cred = convertCertToCredential(cert);
    const key = cert.courseTitle.toLowerCase();
    if (!map.has(key)) {
      map.set(key, cred);
    }
  });

  return Array.from(map.values());
}

