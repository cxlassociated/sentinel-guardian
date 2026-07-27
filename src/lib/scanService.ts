import { doc, setDoc, serverTimestamp } from 'firebase/firestore';
import { db } from './firebase';

export interface ScanResultPayload {
  risk_level: 'LOW RISK' | 'MODERATE RISK' | 'HIGH RISK' | 'CRITICAL RISK';
  compliance_score: number;
  violations_detected: string[];
  regulations_triggered: string[];
  rule_references: string[];
  privacy_findings?: Array<{ title: string; description: string; severity: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL' }>;
  marketing_findings?: Array<{ title: string; description: string; severity: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL' }>;
  explanation: string;
  suggested_compliant_revision: string;
  performance_metrics?: Record<string, any>;
}

export interface SaveScanInput {
  scanId?: string;
  firmId: string;
  userId: string;
  title: string;
  type: string;
  contentUrl?: string;
  originalText?: string;
  pdfFallbackUsed?: boolean;
  scanResult: ScanResultPayload;
}

export async function saveCompletedScan(input: SaveScanInput): Promise<string> {
  const {
    scanId,
    firmId,
    userId,
    title,
    type,
    contentUrl = '',
    originalText = '',
    pdfFallbackUsed = false,
    scanResult,
  } = input;

  const targetDocId = scanId || `scan_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
  const scanRef = doc(db, 'scans', targetDocId);

  let status: 'passed' | 'flagged' | 'review' = 'review';
  if (scanResult.risk_level === 'LOW RISK') {
    status = 'passed';
  } else if (scanResult.risk_level === 'HIGH RISK' || scanResult.risk_level === 'CRITICAL RISK') {
    status = 'flagged';
  }

  const payload = {
    firmId,
    userId,
    title: title.substring(0, 195),
    type: type || 'Text Analysis',
    contentUrl,
    originalText: originalText.substring(0, 5000),
    risk_level: scanResult.risk_level,
    compliance_score: scanResult.compliance_score,
    riskScore: scanResult.compliance_score,
    status,
    progress: 100,
    violations_detected: scanResult.violations_detected || [],
    regulations_triggered: scanResult.regulations_triggered || [],
    rule_references: scanResult.rule_references || [],
    privacy_findings: scanResult.privacy_findings || [],
    marketing_findings: scanResult.marketing_findings || [],
    explanation: scanResult.explanation || '',
    suggested_compliant_revision: scanResult.suggested_compliant_revision || '',
    performance_metrics: scanResult.performance_metrics || {},
    pdf_fallback_used: pdfFallbackUsed,
    createdAt: serverTimestamp(),
    completedAt: serverTimestamp(),
  };

  await setDoc(scanRef, payload, { merge: true });
  return targetDocId;
}

export function getApiUrl(endpoint: string): string {
  const customBase = import.meta.env.VITE_API_SERVER_URL || import.meta.env.VITE_BACKEND_URL;
  if (customBase) {
    const cleanBase = customBase.replace(/\/+$/, '');
    const cleanEndpoint = endpoint.startsWith('/') ? endpoint : `/${endpoint}`;
    return `${cleanBase}${cleanEndpoint}`;
  }

  if (typeof window !== 'undefined' && window.location.hostname.includes('github.io')) {
    const cloudRunBase = 'https://ais-dev-croitcriyot2y24o3dzwja-72507479684.us-east5.run.app';
    const cleanEndpoint = endpoint.startsWith('/') ? endpoint : `/${endpoint}`;
    return `${cloudRunBase}${cleanEndpoint}`;
  }

  return endpoint.startsWith('/') ? endpoint : `/${endpoint}`;
}
