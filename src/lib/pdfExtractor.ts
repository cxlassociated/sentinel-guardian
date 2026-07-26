import * as pdfjsLib from 'pdfjs-dist';

// Configure pdfjs worker to fetch from cdnjs matching installed version
if (typeof window !== 'undefined' && pdfjsLib.GlobalWorkerOptions) {
  pdfjsLib.GlobalWorkerOptions.workerSrc = `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.mjs`;
}

export interface PdfExtractionResult {
  success: boolean;
  text: string;
  pageCount: number;
  extractedTextLength: number;
  extractionTimeMs: number;
  isScannedOrFailed: boolean;
  error?: string;
}

export async function extractPdfTextInBrowser(file: File): Promise<PdfExtractionResult> {
  const startTime = performance.now();
  try {
    const arrayBuffer = await file.arrayBuffer();
    const loadingTask = pdfjsLib.getDocument({ data: new Uint8Array(arrayBuffer) });
    const pdfDoc = await loadingTask.promise;
    
    let combinedText = '';
    let totalLength = 0;
    
    for (let i = 1; i <= pdfDoc.numPages; i++) {
      const page = await pdfDoc.getPage(i);
      const textContent = await page.getTextContent();
      const pageStrings = textContent.items
        .map((item: any) => item.str || '')
        .filter((str: string) => str.trim().length > 0);
      
      const pageText = pageStrings.join(' ').replace(/\s+/g, ' ').trim();
      
      if (pageText.length > 0) {
        combinedText += `--- Page ${i} ---\n${pageText}\n\n`;
        totalLength += pageText.length;
      }
    }

    const endTime = performance.now();
    const extractionTimeMs = Math.round(endTime - startTime);
    const text = combinedText.trim();

    // If total extracted text is very short (< 50 chars) or < 10 chars per page, treat as scanned/image-only
    const isScannedOrFailed = totalLength < 50 || (pdfDoc.numPages > 0 && (totalLength / pdfDoc.numPages) < 10);

    return {
      success: !isScannedOrFailed,
      text: isScannedOrFailed ? '' : text,
      pageCount: pdfDoc.numPages,
      extractedTextLength: isScannedOrFailed ? 0 : totalLength,
      extractionTimeMs,
      isScannedOrFailed,
    };
  } catch (err: any) {
    const endTime = performance.now();
    console.warn('[PDF Extractor] In-browser extraction failed or scanned PDF encountered. Falling back to base64 PDF upload:', err);
    return {
      success: false,
      text: '',
      pageCount: 0,
      extractedTextLength: 0,
      extractionTimeMs: Math.round(endTime - startTime),
      isScannedOrFailed: true,
      error: err?.message || 'Extraction failed',
    };
  }
}
