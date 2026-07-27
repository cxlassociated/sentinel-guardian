import React, { useState, useCallback, useRef } from 'react';
import { motion } from 'motion/react';
import { useDropzone, DropzoneOptions } from 'react-dropzone';
import { UploadCloud, FileText, AlertTriangle, CheckCircle, Loader2, Info, ArrowRight, Download, ShieldCheck, ShieldAlert, AlertOctagon, X, Zap, Cpu } from 'lucide-react';
import { collection, addDoc, serverTimestamp, doc, onSnapshot } from 'firebase/firestore';
import { ref, uploadString, getDownloadURL } from 'firebase/storage';
import { httpsCallable } from 'firebase/functions';
import { db, storage, functions, auth } from '../lib/firebase';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import ScanProgressModal from '../components/ScanProgressModal';
import { extractPdfTextInBrowser, PdfExtractionResult } from '../lib/pdfExtractor';
import { isDevEnvironment } from '../lib/env';
import { saveCompletedScan, createInitialScan, getApiUrl } from '../lib/scanService';

interface Finding {
  title: string;
  description: string;
  severity: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
}

interface ScanResult {
  risk_level: 'LOW RISK' | 'MODERATE RISK' | 'HIGH RISK' | 'CRITICAL RISK';
  compliance_score: number;
  violations_detected: string[];
  regulations_triggered: string[];
  rule_references: string[];
  privacy_findings: Finding[];
  marketing_findings: Finding[];
  explanation: string;
  suggested_compliant_revision: string;
  performance_metrics?: {
    model_used?: string;
    total_scan_time_ms?: number;
    gemini_response_time_ms?: number;
    pdf_extraction_time_ms?: number;
    extracted_text_length?: number;
    document_size_bytes?: number;
    pdf_fallback_used?: boolean;
  };
}

export default function NewScan() {
  const { profile, user, isDevDemo } = useAuth();
  const navigate = useNavigate();
  const [textInput, setTextInput] = useState('');
  const [selectedFile, setSelectedFile] = useState<{
    file: File;
    base64: string;
    mimeType: string;
    isPdfExtracted?: boolean;
    extractedText?: string;
  } | null>(null);
  const [pdfMetrics, setPdfMetrics] = useState<{
    extractionTimeMs?: number;
    pageCount?: number;
    extractedTextLength?: number;
    isPdfExtracted?: boolean;
    isScannedOrFailed?: boolean;
  } | null>(null);
  const [modelPreference, setModelPreference] = useState<'gemini-3.6-flash' | 'gemini-3.1-pro-preview'>('gemini-3.6-flash');
  const [isScanning, setIsScanning] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [result, setResult] = useState<ScanResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'paste' | 'upload'>('paste');
  const [scanProgress, setScanProgress] = useState<number>(0);
  const [scanStatus, setScanStatus] = useState<string>('');
  const reportRef = useRef<HTMLDivElement>(null);

  const onDrop = useCallback(async (acceptedFiles: File[]) => {
    if (acceptedFiles.length > 0) {
      const file = acceptedFiles[0];
      setPdfMetrics(null);
      
      if (file.type === 'text/plain') {
        const text = await file.text();
        setTextInput(text);
        setSelectedFile(null);
        setActiveTab('paste');
      } else if (file.type === 'application/pdf') {
        const reader = new FileReader();
        reader.onload = async () => {
          const base64 = (reader.result as string).split(',')[1];
          
          // Attempt in-browser PDF text extraction
          const extractionResult: PdfExtractionResult = await extractPdfTextInBrowser(file);
          
          if (extractionResult.success && !extractionResult.isScannedOrFailed) {
            setPdfMetrics({
              extractionTimeMs: extractionResult.extractionTimeMs,
              pageCount: extractionResult.pageCount,
              extractedTextLength: extractionResult.extractedTextLength,
              isPdfExtracted: true,
              isScannedOrFailed: false,
            });
            setSelectedFile({
              file,
              base64,
              mimeType: file.type,
              isPdfExtracted: true,
              extractedText: extractionResult.text,
            });
            setTextInput(extractionResult.text);
            setActiveTab('paste');
          } else {
            // Graceful fallback to raw PDF multimodal flow
            setPdfMetrics({
              extractionTimeMs: extractionResult.extractionTimeMs,
              pageCount: extractionResult.pageCount,
              extractedTextLength: 0,
              isPdfExtracted: false,
              isScannedOrFailed: true,
            });
            setSelectedFile({
              file,
              base64,
              mimeType: file.type,
              isPdfExtracted: false,
            });
            setTextInput(`[File attached: ${file.name} - Scanned/Image PDF Fallback Engaged]\n\nReady for analysis.`);
            setActiveTab('paste');
          }
        };
        reader.readAsDataURL(file);
      } else {
        const reader = new FileReader();
        reader.onload = () => {
          const base64 = (reader.result as string).split(',')[1];
          setSelectedFile({ file, base64, mimeType: file.type, isPdfExtracted: false });
          setTextInput(`[File attached: ${file.name}]\n\nReady for analysis.`);
          setActiveTab('paste');
        };
        reader.readAsDataURL(file);
      }
    }
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'text/plain': ['.txt'],
      'application/pdf': ['.pdf'],
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document': ['.docx'],
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': ['.xlsx'],
      'image/*': ['.png', '.jpg', '.jpeg']
    },
    maxFiles: 1
  } as any);

  const handleClearFile = () => {
    setSelectedFile(null);
    setPdfMetrics(null);
    setTextInput('');
  };

  const handlePrint = (e?: React.MouseEvent) => {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }
    window.print();
  };

  const handleScan = async () => {
    if (!textInput.trim() && !selectedFile) {
      setError('Please provide content or a file to scan.');
      return;
    }

    setIsScanning(true);
    setIsModalOpen(true);
    setError(null);
    setResult(null);

    try {
      // 10% - Document accepted
      setScanProgress(10);
      setScanStatus('Document accepted & payload validated...');

      const documentSizeBytes = selectedFile ? selectedFile.file.size : new Blob([textInput]).size;
      const isPdfExtracted = selectedFile?.isPdfExtracted ?? false;
      const sendBase64ToGemini = selectedFile && !isPdfExtracted ? selectedFile.base64 : undefined;
      const sendMimeTypeToGemini = selectedFile && !isPdfExtracted ? selectedFile.mimeType : undefined;

      // 20% - Text extraction complete
      setScanProgress(20);
      setScanStatus('Text extraction complete...');

      // 30% - Scan record created
      setScanProgress(30);
      setScanStatus('Initializing scan record...');
      const scanId = doc(collection(db, 'scans')).id;
      const firmId = profile?.firmId || 'demo-firm-123';
      const userId = auth.currentUser?.uid || user?.uid || profile?.uid || 'dev-demo-user-sg3';
      const title = selectedFile ? selectedFile.file.name : (textInput.substring(0, 50) + '...');
      const scanType = selectedFile ? (selectedFile.mimeType.includes('pdf') ? 'PDF Document' : 'Image/Media') : 'Text Analysis';

      let contentUrl = '';
      if (selectedFile) {
        try {
          const uploadPromise = (async () => {
            const storageRef = ref(storage, `firms/${firmId}/scans/${Date.now()}_${selectedFile.file.name}`);
            await uploadString(storageRef, selectedFile.base64, 'base64', { contentType: selectedFile.mimeType });
            return await getDownloadURL(storageRef);
          })();
          const storageTimeoutPromise = new Promise<string>((_, reject) =>
            setTimeout(() => reject(new Error('Storage upload timeout')), 3000)
          );
          contentUrl = await Promise.race([uploadPromise, storageTimeoutPromise]).catch(err => {
            console.warn("Storage upload skipped or timed out:", err?.message || err);
            return '';
          });
        } catch (storageErr) {
          console.warn("Storage upload skipped or unavailable:", storageErr);
        }
      }

      // Record initial scan record in Firestore (processing status)
      await createInitialScan({
        scanId,
        firmId,
        userId,
        title,
        type: scanType,
        contentUrl,
        originalText: textInput,
        pdfFallbackUsed: selectedFile ? !isPdfExtracted : false,
      });

      // 40% - Analysis request dispatched
      setScanProgress(40);
      setScanStatus(`Dispatching analysis request to ${modelPreference} engine...`);

      const apiUrl = getApiUrl('/api/analyze');
      const response = await fetch(apiUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          textInput,
          fileBase64: sendBase64ToGemini,
          fileMimeType: sendMimeTypeToGemini,
          modelPreference,
          documentSizeBytes,
          isPdfExtracted,
          pdfExtractionTimeMs: pdfMetrics?.extractionTimeMs || 0,
          extractedTextLength: textInput.length,
        }),
      });

      if (!response.ok) {
        const errData = await response.json().catch(() => ({}));
        throw new Error(errData.error || `Server compliance analysis error (${response.status})`);
      }

      // 70% - AI analysis returned
      setScanProgress(70);
      setScanStatus('AI compliance analysis returned...');
      const scanResult: ScanResult = await response.json();

      // 85% - Findings normalized
      setScanProgress(85);
      setScanStatus('Normalizing compliance findings...');

      // 95% - Firestore persistence complete
      setScanProgress(95);
      setScanStatus('Persisting scan record to Compliance Archive...');
      await saveCompletedScan({
        scanId,
        firmId,
        userId,
        title,
        type: scanType,
        contentUrl,
        originalText: textInput,
        pdfFallbackUsed: selectedFile ? !isPdfExtracted : false,
        scanResult,
      });

      // 100% - Report ready
      setScanProgress(100);
      setScanStatus('Scan complete. Compliance report ready.');
      setResult(scanResult);
      setIsScanning(false);

    } catch (err: any) {
      console.error("Scan pipeline error:", err);
      const friendlyMsg = err.message || 'An unexpected error occurred during the compliance scan.';
      setError(friendlyMsg);
      setScanStatus("Error during scan");
      setIsScanning(false);
    }
  };

  const getRiskColor = (level: string) => {
    switch (level) {
      case 'LOW RISK': return 'text-green-700 bg-green-50 border-green-200';
      case 'MODERATE RISK': return 'text-yellow-700 bg-yellow-50 border-yellow-200';
      case 'HIGH RISK': return 'text-orange-700 bg-orange-50 border-orange-200';
      case 'CRITICAL RISK': return 'text-red-700 bg-red-50 border-red-200';
      default: return 'text-gray-700 bg-gray-50 border-gray-200';
    }
  };

  const getRiskIcon = (level: string) => {
    switch (level) {
      case 'LOW RISK': return <CheckCircle className="w-8 h-8 text-green-600" />;
      case 'MODERATE RISK': return <Info className="w-8 h-8 text-yellow-600" />;
      case 'HIGH RISK': return <AlertTriangle className="w-8 h-8 text-orange-600" />;
      case 'CRITICAL RISK': return <AlertOctagon className="w-8 h-8 text-red-600" />;
      default: return <ShieldCheck className="w-8 h-8 text-gray-600" />;
    }
  };

  return (
    <div className="max-w-5xl mx-auto space-y-6 print:m-0 print:max-w-none print:space-y-0">
      <div className="print:hidden">
        <h1 className="text-2xl font-bold text-gray-900">Sentinel Guardian AI</h1>
        <p className="text-sm text-gray-500 mt-1">Instantly analyze communications for Reg BI, Marketing Rule, and PII compliance.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 print:block print:w-full">
        {/* Input Section */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden flex flex-col h-[600px] print:hidden">
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
              <div className="flex-1 flex flex-col relative">
                {selectedFile && (
                  <div className="mb-3 p-3 bg-blue-50 border border-blue-100 rounded-lg flex items-center justify-between">
                    <div className="flex items-center gap-2 text-sm text-blue-800 font-medium truncate">
                      <FileText className="w-4 h-4 shrink-0" />
                      <span className="truncate">{selectedFile.file.name}</span>
                    </div>
                    <button onClick={handleClearFile} className="text-blue-500 hover:text-blue-700 p-1">
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                )}
                <textarea
                  className="flex-1 w-full p-4 border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#4BB7BA] focus:border-transparent resize-none text-sm text-gray-700 font-mono"
                  placeholder="Paste email draft, social media post, or marketing copy here..."
                  value={textInput}
                  onChange={(e) => setTextInput(e.target.value)}
                  disabled={!!selectedFile}
                />
              </div>
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
                <p className="text-[10px] text-[#265C7E] font-medium mt-1 bg-blue-50 px-2 py-0.5 rounded">DOCX & XLSX support in Beta</p>
              </div>
            )}

            {pdfMetrics && (
              <div className={`mt-3 p-2.5 rounded-lg text-xs font-medium border flex items-center gap-2 ${
                pdfMetrics.isPdfExtracted 
                  ? 'bg-emerald-50 border-emerald-200 text-emerald-800'
                  : 'bg-amber-50 border-amber-200 text-amber-800'
              }`}>
                {pdfMetrics.isPdfExtracted ? (
                  <>
                    <Zap className="w-4 h-4 text-emerald-600 shrink-0" />
                    <span>
                      In-browser text extracted in <strong>{pdfMetrics.extractionTimeMs}ms</strong> ({pdfMetrics.pageCount} pg, {pdfMetrics.extractedTextLength} chars) • <em>Base64 bypass active</em>
                    </span>
                  </>
                ) : (
                  <>
                    <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0" />
                    <span>
                      Scanned / Image PDF detected ({pdfMetrics.extractionTimeMs}ms) • <em>Base64 fallback engaged</em>
                    </span>
                  </>
                )}
              </div>
            )}

            {/* Model Selection Selector (Dev Preview Only) */}
            {isDevEnvironment() && (
              <div className="mt-4 pt-4 border-t border-gray-100">
                <label className="text-xs font-bold text-gray-700 uppercase tracking-wider block mb-2 flex items-center justify-between">
                  <span>AI Engine Selection</span>
                  <span className="text-[10px] text-gray-400 font-normal">A/B Testing Mode</span>
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setModelPreference('gemini-3.6-flash')}
                    className={`py-2 px-3 rounded-lg text-xs font-semibold flex items-center justify-center gap-1.5 border transition-all ${
                      modelPreference === 'gemini-3.6-flash'
                        ? 'bg-[#265C7E] text-white border-[#265C7E] shadow-sm'
                        : 'bg-gray-50 text-gray-700 border-gray-200 hover:bg-gray-100'
                    }`}
                  >
                    <Zap className="w-3.5 h-3.5" />
                    <span>3.6 Flash (Fast)</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setModelPreference('gemini-3.1-pro-preview')}
                    className={`py-2 px-3 rounded-lg text-xs font-semibold flex items-center justify-center gap-1.5 border transition-all ${
                      modelPreference === 'gemini-3.1-pro-preview'
                        ? 'bg-[#265C7E] text-white border-[#265C7E] shadow-sm'
                        : 'bg-gray-50 text-gray-700 border-gray-200 hover:bg-gray-100'
                    }`}
                  >
                    <Cpu className="w-3.5 h-3.5" />
                    <span>3.1 Pro (Fallback)</span>
                  </button>
                </div>
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
              disabled={isScanning || (!textInput.trim() && !selectedFile)}
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
        <div ref={reportRef} className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden flex flex-col h-[600px] print:h-auto print:border-none print:shadow-none">
          <div className="px-6 py-4 border-b border-gray-100 bg-gray-50 flex items-center justify-between print:bg-white print:border-b-2 print:border-gray-800">
            <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
              <FileText className="w-5 h-5 text-[#265C7E] print:text-gray-900" />
              Analysis Report
            </h2>
            {result && (
              <button 
                type="button" 
                onClick={handlePrint} 
                className="text-sm font-medium text-[#265C7E] hover:text-[#1A425B] flex items-center gap-1 print:hidden cursor-pointer"
              >
                <Download className="w-4 h-4" /> Export PDF
              </button>
            )}
          </div>

          <div className="flex-1 overflow-y-auto p-6 print:overflow-visible">
            {!result && !isScanning ? (
              <div className="h-full flex flex-col items-center justify-center text-center text-gray-500 space-y-4 print:hidden">
                <div className="w-16 h-16 bg-[#265C7E]/5 rounded-full flex items-center justify-center">
                  <ShieldCheck className="w-8 h-8 text-[#265C7E]/40" />
                </div>
                <div>
                  <p className="font-medium text-gray-900">Ready to Scan</p>
                  <p className="text-sm mt-1 max-w-xs">Enter content on the left and run the scan to see compliance results here.</p>
                </div>
              </div>
            ) : isScanning ? (
              <div className="h-full flex flex-col items-center justify-center text-center space-y-6 print:hidden">
                <div className="relative">
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                    className="w-24 h-24 border-4 border-[#265C7E]/10 rounded-full"
                  />
                  <motion.div
                    animate={{ rotate: -360 }}
                    transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
                    className="w-24 h-24 border-4 border-t-[#4BB7BA] rounded-full border-transparent absolute inset-0"
                  />
                  <div className="absolute inset-0 flex items-center justify-center">
                    <ShieldCheck className="w-10 h-10 text-[#265C7E]" />
                  </div>
                </div>
                <div className="space-y-3">
                  <p className="text-lg font-bold text-[#265C7E]">Sentinel AI is Analyzing</p>
                  <div className="flex flex-col items-center gap-1">
                    <motion.p 
                      key={Math.floor(Date.now() / 2000)}
                      initial={{ opacity: 0, y: 5 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="text-sm text-gray-500 font-medium"
                    >
                      {['Checking SEC Marketing Rule...', 'Verifying Reg BI compliance...', 'Scanning for PII leaks...', 'Evaluating promissory language...'][Math.floor((Date.now() / 2000) % 4)]}
                    </motion.p>
                    <div className="flex gap-1">
                      {[0, 1, 2].map((i) => (
                        <motion.div
                          key={i}
                          animate={{ scale: [1, 1.5, 1], opacity: [0.3, 1, 0.3] }}
                          transition={{ duration: 1, repeat: Infinity, delay: i * 0.2 }}
                          className="w-1.5 h-1.5 bg-[#4BB7BA] rounded-full"
                        />
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            ) : result ? (
              <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
                {/* Print Only Official Report Header */}
                <div className="hidden print:block mb-6 pb-4 border-b-2 border-gray-900">
                  <div className="flex items-center justify-between">
                    <div>
                      <h1 className="text-2xl font-black text-gray-900 tracking-tight">Sentinel Guardian AI</h1>
                      <p className="text-sm font-bold text-gray-700 uppercase tracking-wider">SEC Compliance Analysis Report (Rule 206(4)-1 & Reg BI)</p>
                    </div>
                    <div className="text-right text-xs text-gray-700 space-y-0.5">
                      <p className="font-bold text-gray-900">{profile?.firmName || 'Demo Advisory Partners'}</p>
                      <p>Generated: {new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric', hour: 'numeric', minute: '2-digit' })}</p>
                      <p className="font-mono text-[10px] text-gray-500">Engine: {result.performance_metrics?.model_used || modelPreference}</p>
                    </div>
                  </div>
                </div>

                {/* Score Header */}
                <div className={`p-6 rounded-xl border ${getRiskColor(result.risk_level)} print:border-2 print:border-gray-300 print:bg-transparent print:text-gray-900`}>
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <div className="print:hidden">{getRiskIcon(result.risk_level)}</div>
                      <div>
                        <h3 className="text-lg font-bold capitalize">
                          {result.risk_level}
                        </h3>
                        <p className="text-sm mt-1 opacity-80 font-medium">
                          {result.risk_level === 'LOW RISK' ? 'Cleared for Use' : 'Requires Manual Review'}
                        </p>
                      </div>
                    </div>
                    <div className="text-center">
                      <div className="text-3xl font-black">{result.compliance_score}</div>
                      <div className="text-xs font-bold uppercase tracking-wider opacity-80">Risk Score</div>
                    </div>
                  </div>
                </div>

                {/* Explanation */}
                <div className="space-y-2">
                  <h4 className="text-sm font-bold text-gray-900 uppercase tracking-wider">Analysis Summary</h4>
                  <p className="text-sm text-gray-700 bg-gray-50 p-4 rounded-lg border border-gray-100 leading-relaxed print:bg-transparent print:border-none print:p-0">
                    {result.explanation}
                  </p>
                </div>

                {/* Detailed Findings */}
                <div className="space-y-6">
                  {/* Privacy Findings */}
                  {result.privacy_findings && result.privacy_findings.length > 0 && (
                    <div className="space-y-3">
                      <div className="flex items-center gap-2">
                        <ShieldAlert className="w-5 h-5 text-red-600" />
                        <h4 className="text-sm font-bold text-gray-900 uppercase tracking-wider">Privacy & Security Risks</h4>
                      </div>
                      <div className="space-y-3">
                        {result.privacy_findings.map((finding, idx) => (
                          <div key={idx} className="p-4 rounded-lg border border-red-100 bg-red-50/30 space-y-1">
                            <div className="flex items-center justify-between">
                              <span className="text-sm font-bold text-red-900">{finding.title}</span>
                              <span className={`text-[10px] font-black px-1.5 py-0.5 rounded uppercase tracking-tighter ${
                                finding.severity === 'CRITICAL' ? 'bg-red-600 text-white' :
                                finding.severity === 'HIGH' ? 'bg-orange-500 text-white' :
                                finding.severity === 'MEDIUM' ? 'bg-yellow-500 text-white' : 'bg-blue-500 text-white'
                              }`}>
                                {finding.severity}
                              </span>
                            </div>
                            <p className="text-xs text-red-800 leading-relaxed">{finding.description}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Marketing Findings */}
                  {result.marketing_findings && result.marketing_findings.length > 0 && (
                    <div className="space-y-3">
                      <div className="flex items-center gap-2">
                        <AlertTriangle className="w-5 h-5 text-orange-600" />
                        <h4 className="text-sm font-bold text-gray-900 uppercase tracking-wider">Marketing & Compliance Risks</h4>
                      </div>
                      <div className="space-y-3">
                        {result.marketing_findings.map((finding, idx) => (
                          <div key={idx} className="p-4 rounded-lg border border-orange-100 bg-orange-50/30 space-y-1">
                            <div className="flex items-center justify-between">
                              <span className="text-sm font-bold text-orange-900">{finding.title}</span>
                              <span className={`text-[10px] font-black px-1.5 py-0.5 rounded uppercase tracking-tighter ${
                                finding.severity === 'CRITICAL' ? 'bg-red-600 text-white' :
                                finding.severity === 'HIGH' ? 'bg-orange-500 text-white' :
                                finding.severity === 'MEDIUM' ? 'bg-yellow-500 text-white' : 'bg-blue-500 text-white'
                              }`}>
                                {finding.severity}
                              </span>
                            </div>
                            <p className="text-xs text-orange-800 leading-relaxed">{finding.description}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                {/* Violations & Regulations */}
                {(result.violations_detected.length > 0 || result.regulations_triggered.length > 0) && (
                  <div className="space-y-4">
                    {result.violations_detected.length > 0 && (
                      <div>
                        <h4 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Violations Detected</h4>
                        <div className="flex flex-wrap gap-2">
                          {result.violations_detected.map((violation, idx) => (
                            <span key={idx} className="inline-flex items-center px-2.5 py-1 rounded-md text-xs font-semibold bg-red-50 text-red-700 border border-red-100 print:border-gray-300 print:bg-transparent print:text-gray-900">
                              {violation}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                    
                    {result.regulations_triggered.length > 0 && (
                      <div>
                        <h4 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Regulations Triggered</h4>
                        <div className="flex flex-wrap gap-2">
                          {result.regulations_triggered.map((reg, idx) => (
                            <span key={idx} className="inline-flex items-center px-2.5 py-1 rounded-md text-xs font-semibold bg-blue-50 text-blue-700 border border-blue-100 print:border-gray-300 print:bg-transparent print:text-gray-900">
                              {reg}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}

                    {result.rule_references && result.rule_references.length > 0 && (
                      <div>
                        <h4 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">SEC Rule References</h4>
                        <div className="flex flex-wrap gap-2">
                          {result.rule_references.map((ref, idx) => (
                            <span key={idx} className="inline-flex items-center px-2.5 py-1 rounded-md text-xs font-mono bg-slate-100 text-slate-700 border border-slate-200 print:border-gray-300 print:bg-transparent print:text-gray-900">
                              {ref}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {/* Suggested Rewrite */}
                {result.suggested_compliant_revision && result.risk_level !== 'LOW RISK' && (
                  <div className="space-y-2">
                    <h4 className="text-sm font-bold text-gray-900 uppercase tracking-wider">Suggested Compliant Revision</h4>
                    <div className="p-4 bg-[#4BB7BA]/10 rounded-lg border border-[#4BB7BA]/20 flex items-start gap-3 print:bg-transparent print:border-2 print:border-gray-300">
                      <ShieldCheck className="w-5 h-5 text-[#4BB7BA] shrink-0 mt-0.5 print:hidden" />
                      <p className="text-sm text-[#265C7E] font-medium leading-relaxed print:text-gray-900">
                        {result.suggested_compliant_revision}
                      </p>
                    </div>
                  </div>
                )}

                {/* Performance Instrumentation Metrics (Phase 1) (Dev Preview Only) */}
                {isDevEnvironment() && result.performance_metrics && (
                  <div className="mt-6 p-4 rounded-lg bg-slate-900 text-slate-100 font-mono text-xs space-y-2 print:hidden">
                    <div className="flex items-center justify-between text-slate-400 font-sans text-xs border-b border-slate-800 pb-2">
                      <span className="font-bold uppercase tracking-wider text-emerald-400 flex items-center gap-1.5">
                        <Zap className="w-3.5 h-3.5" /> Performance Telemetry (Phase 1)
                      </span>
                      <span className="bg-slate-800 px-2 py-0.5 rounded text-[10px] text-slate-300">
                        Model: {result.performance_metrics.model_used || 'gemini-3.6-flash'}
                      </span>
                    </div>
                    <div className="grid grid-cols-2 gap-2 pt-1 text-[11px]">
                      <div>
                        <span className="text-slate-500">Total Scan Time: </span>
                        <span className="text-emerald-300 font-bold">{result.performance_metrics.total_scan_time_ms} ms</span>
                      </div>
                      <div>
                        <span className="text-slate-500">Gemini Response: </span>
                        <span className="text-cyan-300 font-bold">{result.performance_metrics.gemini_response_time_ms} ms</span>
                      </div>
                      <div>
                        <span className="text-slate-500">PDF Extractor Time: </span>
                        <span className="text-amber-300 font-bold">{result.performance_metrics.pdf_extraction_time_ms ?? 0} ms</span>
                      </div>
                      <div>
                        <span className="text-slate-500">Extracted Text Length: </span>
                        <span className="text-purple-300 font-bold">{result.performance_metrics.extracted_text_length ?? 0} chars</span>
                      </div>
                      <div>
                        <span className="text-slate-500">Document Payload: </span>
                        <span className="text-slate-300">{Math.round((result.performance_metrics.document_size_bytes || 0) / 1024)} KB</span>
                      </div>
                      <div>
                        <span className="text-slate-500">Multimodal Fallback: </span>
                        <span className={result.performance_metrics.pdf_fallback_used ? "text-amber-400 font-bold" : "text-emerald-400 font-bold"}>
                          {result.performance_metrics.pdf_fallback_used ? "YES (Raw Base64 PDF)" : "NO (In-Browser Text)"}
                        </span>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            ) : null}
          </div>
        </div>
      </div>
      
      <ScanProgressModal 
        isOpen={isModalOpen} 
        isScanning={isScanning} 
        onClose={() => setIsModalOpen(false)} 
        progress={scanProgress}
        statusText={scanStatus}
        errorMessage={error}
      />
    </div>
  );
}
