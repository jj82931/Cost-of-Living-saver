/**
 * OCR pipeline stub for Day 3.
 *
 * This module defines minimal types and stub functions so the rest of the
 * app can import and wire OCR without having a concrete engine yet.
 *
 * Later we can plug in Tesseract.js, Cloud Vision, or native OCR.
 */

export type OcrInput = ArrayBuffer | Uint8Array | Blob | File;

export interface OcrResult {
  /** Best-effort extracted plain text */
  text: string;
  /** 0..1 confidence, if available; defaults to 0 for stub */
  confidence: number;
  /** Optional engine metadata */
  meta?: Record<string, unknown>;
}

/**
 * Detects a probable document type from raw text to help routing.
 * Very lightweight heuristics; expand as needed.
 */
export function detectDocType(text: string): 'electricity' | 'unknown' {
  const s = (text || '').toLowerCase();
  if (/\bnmi\b/.test(s) || /\bbilling\s*period\b/.test(s) || /kwh\b/.test(s)) {
    return 'electricity';
  }
  return 'unknown';
}

/**
 * Stub OCR function: returns an empty result.
 * Replace with a real OCR engine (e.g., Tesseract.js) later.
 */
export async function runOcr(_input: OcrInput): Promise<OcrResult> {
  return { text: '', confidence: 0 };
}

/**
 * Convenience: accepts either raw OCR text or an input buffer and ensures text.
 */
export async function ensureOcrText(input: string | OcrInput): Promise<string> {
  if (typeof input === 'string') return input;
  const res = await runOcr(input);
  return res.text || '';
}

