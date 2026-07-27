import { onRequest } from "firebase-functions/v2/https";
import { onCall, HttpsError } from "firebase-functions/v2/https";
import * as admin from "firebase-admin";
import { GoogleGenAI, Type } from "@google/genai";
import * as crypto from "crypto";

if (!admin.apps.length) {
  admin.initializeApp();
}

const db = admin.firestore();

// HTTPS endpoint for direct POST /api/analyze REST API contract
export const analyze = onRequest(
  {
    cors: true,
    concurrency: 80,
    memory: "1GiB",
    timeoutSeconds: 300,
  },
  async (req, res) => {
    res.set("Access-Control-Allow-Origin", "*");
    res.set("Access-Control-Allow-Headers", "Content-Type, Authorization, X-Requested-With");
    res.set("Access-Control-Allow-Methods", "GET, POST, OPTIONS");

    if (req.method === "OPTIONS") {
      res.status(204).send("");
      return;
    }

    if (req.method !== "POST") {
      res.status(405).json({ error: "Method not allowed. Use POST." });
      return;
    }

    try {
      const apiKey = process.env.GEMINI_API_KEY;
      if (!apiKey) {
        res.status(500).json({ error: "GEMINI_API_KEY environment variable is not configured on the server." });
        return;
      }

      const {
        textInput = "",
        fileBase64,
        fileMimeType,
        modelPreference = "gemini-3.6-flash",
        documentSizeBytes = 0,
        isPdfExtracted = false,
        pdfExtractionTimeMs = 0,
        extractedTextLength = 0
      } = req.body || {};

      if (!textInput.trim() && !fileBase64) {
        res.status(400).json({ error: "Missing content or file to analyze." });
        return;
      }

      const targetModel = modelPreference === "gemini-3.1-pro-preview"
        ? "gemini-3.1-pro-preview"
        : "gemini-3.6-flash";

      const ai = new GoogleGenAI({ apiKey });
      const scanStartTime = Date.now();

      const prompt = `
        You are an expert SEC compliance analysis engine for RIA (Registered Investment Advisor) firms.
        Analyze the provided advisor marketing language or document for regulatory violations under the SEC Marketing Rule (Rule 206(4)-1), Regulation Best Interest (Reg BI), and the Investment Advisers Act of 1940.

        REGULATORY REFERENCE SOURCES:
        - SEC Investment Adviser Marketing Rule (Rule 206(4)-1)
        - SEC Marketing Compliance FAQ
        - Regulation Best Interest (Reg BI) / FINRA guidance
        - Regulation S-P (Privacy of Consumer Financial Information)

        SYSTEM OBJECTIVES:
        - Detect PII (Personally Identifiable Information) and Confidentiality Risks (Regulation S-P):
          * Flag any account numbers (6-12 digit strings, even if embedded in text).
          * Flag SSNs (XXX-XX-XXXX or 9-digit strings).
          * Flag client identifiers (e.g., "Client ID: 12345", "Account Ref: ABC-789").
          * Flag client names, addresses, or specific financial details (balances, holdings).
        - Detect Promissory Language & Misleading Claims (Rule 206(4)-1(a)(1)):
          * Flag "guaranteed", "no risk", "always profitable", "safe", "secure returns", "bulletproof".
          * Identify unsubstantiated superlatives (e.g., "best", "top-rated", "leading", "unique", "unmatched").
        - Identify Misleading Performance Framing & Cherry-picking (Rule 206(4)-1(a)(2)).
        - Reg BI & Care Obligation Analysis.
        - Testimonial/Endorsement Violations (Rule 206(4)-1(b)).

        SCORING ALGORITHM:
        - Start at 0.
        - Add 40-60 points for each CRITICAL risk (PII leak, SSN, Account Number).
        - Add 20-30 points for each HIGH risk (Promissory language, misleading performance, Reg BI violation).
        - Add 10-15 points for each MEDIUM risk (Missing disclosures, unsubstantiated superlatives).
        - Add 5 points for each LOW risk (Minor formatting or clarity issues).
        - Cap at 100.
        - 0-25: LOW RISK
        - 26-50: MODERATE RISK
        - 51-75: HIGH RISK
        - 76-100: CRITICAL RISK
      `;

      let contents: any;
      if (fileBase64 && fileMimeType) {
        contents = [
          { text: prompt + (textInput ? `\n\nADDITIONAL CONTEXT:\n"""\n${textInput}\n"""` : '') },
          { inlineData: { data: fileBase64, mimeType: fileMimeType } }
        ];
      } else {
        contents = [
          { text: prompt + `\n\nTEXT TO ANALYZE:\n"""\n${textInput}\n"""` }
        ];
      }

      const geminiRequestStart = Date.now();
      const response = await ai.models.generateContent({
        model: targetModel,
        contents,
        config: {
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              risk_level: {
                type: Type.STRING,
                enum: ["LOW RISK", "MODERATE RISK", "HIGH RISK", "CRITICAL RISK"],
              },
              compliance_score: {
                type: Type.INTEGER,
              },
              violations_detected: {
                type: Type.ARRAY,
                items: { type: Type.STRING },
              },
              regulations_triggered: {
                type: Type.ARRAY,
                items: { type: Type.STRING },
              },
              rule_references: {
                type: Type.ARRAY,
                items: { type: Type.STRING },
              },
              privacy_findings: {
                type: Type.ARRAY,
                items: {
                  type: Type.OBJECT,
                  properties: {
                    title: { type: Type.STRING },
                    description: { type: Type.STRING },
                    severity: { type: Type.STRING, enum: ["LOW", "MEDIUM", "HIGH", "CRITICAL"] },
                  },
                  required: ["title", "description", "severity"]
                }
              },
              marketing_findings: {
                type: Type.ARRAY,
                items: {
                  type: Type.OBJECT,
                  properties: {
                    title: { type: Type.STRING },
                    description: { type: Type.STRING },
                    severity: { type: Type.STRING, enum: ["LOW", "MEDIUM", "HIGH", "CRITICAL"] },
                  },
                  required: ["title", "description", "severity"]
                }
              },
              explanation: { type: Type.STRING },
              suggested_compliant_revision: { type: Type.STRING }
            },
            required: [
              "risk_level", "compliance_score", "violations_detected", 
              "regulations_triggered", "rule_references", "privacy_findings", 
              "marketing_findings", "explanation", "suggested_compliant_revision"
            ]
          }
        }
      });

      const geminiResponseTimeMs = Date.now() - geminiRequestStart;
      const jsonStr = response.text?.trim() || '{}';
      const scanResult = JSON.parse(jsonStr);

      const totalScanTimeMs = Date.now() - scanStartTime;
      scanResult.performance_metrics = {
        model_used: `${targetModel} (Firebase Functions Server-side Runtime)`,
        total_scan_time_ms: totalScanTimeMs,
        gemini_response_time_ms: geminiResponseTimeMs,
        pdf_extraction_time_ms: pdfExtractionTimeMs || 0,
        extracted_text_length: extractedTextLength || textInput.length,
        document_size_bytes: documentSizeBytes || 0,
        pdf_fallback_used: !isPdfExtracted && !!fileBase64,
      };

      res.status(200).json(scanResult);
    } catch (err: any) {
      console.error("Firebase Functions Gemini analysis error:", err);
      res.status(500).json({
        error: err.message || "An error occurred during server-side Gemini compliance analysis."
      });
    }
  }
);

// Callable function fallback
export const runComplianceScan = onCall(
  {
    concurrency: 100,
    minInstances: 1,
    memory: "1GiB",
    timeoutSeconds: 300,
  },
  async (request) => {
    if (!request.auth) {
      throw new HttpsError("unauthenticated", "User must be logged in.");
    }
    const { 
      textInput, 
      fileBase64, 
      fileMimeType, 
      scanId, 
      firmId, 
      userId, 
      title, 
      type, 
      contentUrl,
      modelPreference,
      pdfExtractionTimeMs = 0,
      documentSizeBytes = 0,
      extractedTextLength = 0,
      isPdfExtracted = false
    } = request.data;

    if (!scanId || !firmId || !userId) {
      throw new HttpsError("invalid-argument", "Missing required fields.");
    }

    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      throw new HttpsError("internal", "GEMINI_API_KEY is missing on server.");
    }

    const targetModel = modelPreference === "gemini-3.1-pro-preview" 
      ? "gemini-3.1-pro-preview" 
      : "gemini-3.6-flash";

    const ai = new GoogleGenAI({ apiKey });
    const scanRef = db.collection("scans").doc(scanId);

    try {
      await scanRef.set({
        firmId,
        userId,
        title: title || "Compliance Scan",
        type: type || "marketing",
        contentUrl: contentUrl || "",
        originalText: textInput || "",
        progress: 15,
        status: `Analyzing with ${targetModel}...`,
        createdAt: admin.firestore.FieldValue.serverTimestamp(),
      });

      const prompt = `
        You are an expert SEC compliance analysis engine for RIA (Registered Investment Advisor) firms.
        Analyze the provided advisor marketing language or document for regulatory violations under the SEC Marketing Rule (Rule 206(4)-1), Regulation Best Interest (Reg BI), and the Investment Advisers Act of 1940.
      `;

      let contents: any;
      if (fileBase64 && fileMimeType) {
        contents = [
          { text: prompt + (textInput ? `\n\nADDITIONAL CONTEXT:\n"""\n${textInput}\n"""` : '') },
          { inlineData: { data: fileBase64, mimeType: fileMimeType } }
        ];
      } else {
        contents = [
          { text: prompt + `\n\nTEXT TO ANALYZE:\n"""\n${textInput}\n"""` }
        ];
      }

      const response = await ai.models.generateContent({
        model: targetModel,
        contents,
        config: {
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              risk_level: { type: Type.STRING, enum: ["LOW RISK", "MODERATE RISK", "HIGH RISK", "CRITICAL RISK"] },
              compliance_score: { type: Type.INTEGER },
              violations_detected: { type: Type.ARRAY, items: { type: Type.STRING } },
              regulations_triggered: { type: Type.ARRAY, items: { type: Type.STRING } },
              rule_references: { type: Type.ARRAY, items: { type: Type.STRING } },
              explanation: { type: Type.STRING },
              suggested_compliant_revision: { type: Type.STRING }
            },
            required: ["risk_level", "compliance_score", "violations_detected", "regulations_triggered", "rule_references", "explanation", "suggested_compliant_revision"]
          }
        }
      });

      const jsonStr = response.text?.trim() || '{}';
      const scanResult = JSON.parse(jsonStr);

      await scanRef.update({
        progress: 100,
        status: "Analysis Complete",
        ...scanResult
      });

      return { success: true, scanResult };
    } catch (err: any) {
      console.error("Scan Error:", err);
      await scanRef.update({ progress: 0, status: "Error during scan" });
      throw new HttpsError("internal", err.message || "Failed to run compliance scan");
    }
  }
);
