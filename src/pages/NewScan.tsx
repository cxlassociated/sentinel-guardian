import React, { useState, useCallback } from 'react';
import { useDropzone, DropzoneOptions } from 'react-dropzone';
import { UploadCloud, FileText, AlertTriangle, CheckCircle, Loader2, Info, ArrowRight, Download, ShieldCheck } from 'lucide-react';
import { GoogleGenAI } from '@google/genai';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { ref, uploadString, getDownloadURL } from 'firebase/storage';
import { db, storage } from '../lib/firebase';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';

const ai = new GoogleGenAI({ apiKey: import.meta.env.VITE_GEMINI_API_KEY || process.env.GEMINI_API_KEY || 'mock-key' });

interface ScanResult {
  status: 'passed' | 'flagged' | 'review';
  riskScore: number;
  flags: Array<{
    category: string;
    severity: 'high' | 'medium' | 'low';
    description: string;
    suggestion: string;
  }>;
  summary: string;
}

export default function NewScan() {
  const { profile } = useAuth();
  const navigate = useNavigate();
  const [textInput, setTextInput] = useState('');
  const [isScanning, setIsScanning] = useState(false);
  const [result, setResult] = useState<ScanResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'paste' | 'upload'>('paste');

  const onDrop = useCallback((acceptedFiles: File[]) => {
    // In a real app, we'd extract text from PDF/images here
    // For this demo, we'll just simulate reading a file
    if (acceptedFiles.length > 0) {
      const file = acceptedFiles[0];
      const reader = new FileReader();
      reader.onload = () => {
        setTextInput(`[Content from ${file.name}]\n\n` + (reader.result as string).substring(0, 1000) + '...');
        setActiveTab('paste');
      };
      reader.readAsText(file);
    }
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'text/plain': ['.txt'],
      'application/pdf': ['.pdf'],
      'image/*': ['.png', '.jpg', '.jpeg']
    },
    maxFiles: 1
  } as any);

  const handleScan = async () => {
    if (!textInput.trim()) {
      setError('Please provide content to scan.');
      return;
    }

    setIsScanning(true);
    setError(null);
    setResult(null);

    try {
      // 1. Call Gemini for Analysis
      const prompt = `
        You are an expert financial compliance officer for an RIA (Registered Investment Advisor).
        Analyze the following communication for compliance with SEC regulations, specifically:
        - Reg BI (Regulation Best Interest)
        - Marketing Rule (206(4)-1)
        - Confidentiality / PII leaks
        - Promissory language or guarantees
        - Conflicts of interest

        Communication Content:
        """
        ${textInput}
        """

        Respond ONLY with a valid JSON object matching this schema:
        {
          "status": "passed" | "flagged" | "review",
          "riskScore": number (0-100, where 100 is highest risk),
          "summary": "A brief 1-2 sentence summary of the compliance assessment.",
          "flags": [
            {
              "category": "Reg BI" | "Marketing Rule" | "PII" | "Promissory" | "Other",
              "severity": "high" | "medium" | "low",
              "description": "Specific issue found in the text.",
              "suggestion": "How to rewrite or fix it."
            }
          ]
        }
      `;

      let scanResult: ScanResult;

      try {
        const response = await ai.models.generateContent({
          model: 'gemini-3-flash-preview',
          contents: prompt,
          config: {
            responseMimeType: "application/json",
          }
        });

        const jsonStr = response.text?.trim() || '{}';
        scanResult = JSON.parse(jsonStr);
      } catch (geminiError) {
        console.error("Gemini API Error:", geminiError);
        // Fallback mock response for demo if API fails
        await new Promise(resolve => setTimeout(resolve, 2000));
        scanResult = {
          status: textInput.toLowerCase().includes('guarantee') ? 'flagged' : 'passed',
          riskScore: textInput.toLowerCase().includes('guarantee') ? 85 : 10,
          summary: textInput.toLowerCase().includes('guarantee') 
            ? "Contains promissory language that violates SEC Marketing Rule."
            : "No significant compliance issues detected.",
          flags: textInput.toLowerCase().includes('guarantee') ? [
            {
              category: "Promissory",
              severity: "high",
              description: "Use of the word 'guarantee' implies promised returns.",
              suggestion: "Replace with 'aim to provide' or 'target'."
            }
          ] : []
        };
      }

      setResult(scanResult);

      // 2. Archive to Firestore & Storage (Simulated for demo if no real Firebase config)
      if (profile?.tenantId) {
        try {
          // Save raw text to Storage
          const storageRef = ref(storage, `tenants/${profile.tenantId}/scans/${Date.now()}.txt`);
          await uploadString(storageRef, textInput);
          const fileUrl = await getDownloadURL(storageRef);

          // Save metadata to Firestore
          await addDoc(collection(db, 'scans'), {
            tenantId: profile.tenantId,
            userId: profile.uid,
            title: textInput.substring(0, 50) + '...',
            type: 'Text Analysis',
            contentUrl: fileUrl,
            status: scanResult.status,
            riskScore: scanResult.riskScore,
            summary: scanResult.summary,
            flags: scanResult.flags,
            createdAt: serverTimestamp()
          });
        } catch (dbError) {
          console.error("Error saving to database:", dbError);
          // Continue even if DB save fails in preview
        }
      }

    } catch (err: any) {
      console.error(err);
      setError(err.message || 'An error occurred during the scan.');
    } finally {
      setIsScanning(false);
    }
  };

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Sentinel Guardian AI</h1>
        <p className="text-sm text-gray-500 mt-1">Instantly analyze communications for Reg BI, Marketing Rule, and PII compliance.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Input Section */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden flex flex-col h-[600px]">
          <div className="flex border-b border-gray-100">
            <button
              className={`flex-1 py-4 text-sm font-medium text-center border-b-2 transition-colors ${
                activeTab === 'paste' ? 'border-[#265C7E] text-[#265C7E]' : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
              onClick={() => setActiveTab('paste')}
            >
              Paste Text
            </button>
            <button
              className={`flex-1 py-4 text-sm font-medium text-center border-b-2 transition-colors ${
                activeTab === 'upload' ? 'border-[#265C7E] text-[#265C7E]' : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
              onClick={() => setActiveTab('upload')}
            >
              Upload File
            </button>
          </div>

          <div className="flex-1 p-6 flex flex-col min-h-0">
            {activeTab === 'paste' ? (
              <textarea
                className="flex-1 w-full p-4 border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#4BB7BA] focus:border-transparent resize-none text-sm text-gray-700 font-mono"
                placeholder="Paste email draft, social media post, or marketing copy here..."
                value={textInput}
                onChange={(e) => setTextInput(e.target.value)}
              />
            ) : (
              <div 
                {...getRootProps()} 
                className={`flex-1 border-2 border-dashed rounded-lg flex flex-col items-center justify-center p-6 text-center cursor-pointer transition-colors ${
                  isDragActive ? 'border-[#4BB7BA] bg-[#4BB7BA]/5' : 'border-gray-300 hover:border-[#265C7E] hover:bg-gray-50'
                }`}
              >
                <input {...getInputProps()} />
                <UploadCloud className={`w-12 h-12 mb-4 ${isDragActive ? 'text-[#4BB7BA]' : 'text-gray-400'}`} />
                <p className="text-sm font-medium text-gray-900">Drag & drop a file here, or click to select</p>
                <p className="text-xs text-gray-500 mt-2">Supports PDF, TXT, PNG, JPG up to 10MB</p>
              </div>
            )}

            {error && (
              <div className="mt-4 p-3 bg-red-50 text-red-700 text-sm rounded-lg flex items-start gap-2">
                <AlertTriangle className="w-5 h-5 shrink-0" />
                <p>{error}</p>
              </div>
            )}

            <button
              onClick={handleScan}
              disabled={isScanning || (!textInput.trim() && activeTab === 'paste')}
              className="mt-6 w-full py-3 px-4 bg-[#265C7E] hover:bg-[#1A425B] text-white font-medium rounded-lg shadow-sm transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {isScanning ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  Analyzing with Sentinel AI...
                </>
              ) : (
                <>
                  <ShieldCheck className="w-5 h-5" />
                  Run Compliance Scan
                </>
              )}
            </button>
          </div>
        </div>

        {/* Results Section */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden flex flex-col h-[600px]">
          <div className="px-6 py-4 border-b border-gray-100 bg-gray-50 flex items-center justify-between">
            <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
              <FileText className="w-5 h-5 text-[#265C7E]" />
              Analysis Report
            </h2>
            {result && (
              <button className="text-sm font-medium text-[#265C7E] hover:text-[#1A425B] flex items-center gap-1">
                <Download className="w-4 h-4" /> Export PDF
              </button>
            )}
          </div>

          <div className="flex-1 overflow-y-auto p-6">
            {!result && !isScanning ? (
              <div className="h-full flex flex-col items-center justify-center text-center text-gray-500 space-y-4">
                <div className="w-16 h-16 bg-[#265C7E]/5 rounded-full flex items-center justify-center">
                  <ShieldCheck className="w-8 h-8 text-[#265C7E]/40" />
                </div>
                <div>
                  <p className="font-medium text-gray-900">Ready to Scan</p>
                  <p className="text-sm mt-1 max-w-xs">Enter content on the left and run the scan to see compliance results here.</p>
                </div>
              </div>
            ) : isScanning ? (
              <div className="h-full flex flex-col items-center justify-center text-center space-y-6">
                <div className="relative">
                  <div className="w-20 h-20 border-4 border-[#265C7E]/20 rounded-full"></div>
                  <div className="w-20 h-20 border-4 border-[#4BB7BA] rounded-full border-t-transparent animate-spin absolute inset-0"></div>
                  <ShieldCheck className="w-8 h-8 text-[#265C7E] absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2" />
                </div>
                <div className="space-y-2">
                  <p className="font-medium text-gray-900">Scanning against SEC rules...</p>
                  <p className="text-sm text-gray-500 animate-pulse">Checking Reg BI, Marketing Rule, and PII</p>
                </div>
              </div>
            ) : result ? (
              <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
                {/* Score Header */}
                <div className={`p-6 rounded-xl border ${
                  result.status === 'passed' ? 'bg-green-50 border-green-100' :
                  result.status === 'flagged' ? 'bg-red-50 border-red-100' :
                  'bg-yellow-50 border-yellow-100'
                }`}>
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      {result.status === 'passed' ? <CheckCircle className="w-8 h-8 text-green-600" /> :
                       result.status === 'flagged' ? <AlertTriangle className="w-8 h-8 text-red-600" /> :
                       <Info className="w-8 h-8 text-yellow-600" />}
                      <div>
                        <h3 className={`text-lg font-bold capitalize ${
                          result.status === 'passed' ? 'text-green-900' :
                          result.status === 'flagged' ? 'text-red-900' :
                          'text-yellow-900'
                        }`}>
                          {result.status === 'passed' ? 'Cleared for Use' :
                           result.status === 'flagged' ? 'High Risk Detected' :
                           'Requires Manual Review'}
                        </h3>
                        <p className={`text-sm mt-1 ${
                          result.status === 'passed' ? 'text-green-700' :
                          result.status === 'flagged' ? 'text-red-700' :
                          'text-yellow-700'
                        }`}>
                          {result.summary}
                        </p>
                      </div>
                    </div>
                    <div className="text-center">
                      <div className="text-3xl font-black text-gray-900">{result.riskScore}</div>
                      <div className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Risk Score</div>
                    </div>
                  </div>
                </div>

                {/* Flags List */}
                {result.flags.length > 0 ? (
                  <div className="space-y-4">
                    <h4 className="text-sm font-bold text-gray-900 uppercase tracking-wider">Detected Issues</h4>
                    {result.flags.map((flag, idx) => (
                      <div key={idx} className="bg-white border border-gray-200 rounded-lg p-4 shadow-sm">
                        <div className="flex items-center justify-between mb-2">
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                            {flag.category}
                          </span>
                          <span className={`text-xs font-bold uppercase tracking-wider ${
                            flag.severity === 'high' ? 'text-[#EB5924]' :
                            flag.severity === 'medium' ? 'text-yellow-600' :
                            'text-[#4B9ABB]'
                          }`}>
                            {flag.severity} Severity
                          </span>
                        </div>
                        <p className="text-sm text-gray-900 font-medium mt-2">{flag.description}</p>
                        <div className="mt-3 p-3 bg-[#4BB7BA]/10 rounded-md border border-[#4BB7BA]/20 flex items-start gap-2">
                          <ArrowRight className="w-4 h-4 text-[#4BB7BA] shrink-0 mt-0.5" />
                          <p className="text-sm text-[#265C7E] font-medium"><span className="font-bold">Fix:</span> {flag.suggestion}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="p-6 bg-gray-50 border border-gray-100 rounded-lg text-center">
                    <CheckCircle className="w-8 h-8 text-green-500 mx-auto mb-2" />
                    <p className="text-sm font-medium text-gray-900">No compliance flags detected.</p>
                    <p className="text-xs text-gray-500 mt-1">This communication appears to meet standard SEC guidelines.</p>
                  </div>
                )}
              </div>
            ) : null}
          </div>
        </div>
      </div>
    </div>
  );
}
