import { authenticateOptional } from "@/lib/middleware";
import { parseMultipartForm } from "@/lib/upload";
import { apiSuccess, apiError, apiValidationError } from "@/lib/api-response";
import { checkRateLimit, getClientIp } from "@/lib/rate-limit";
import mammoth from "mammoth";

const ALLOWED_TYPES = [
  "application/pdf",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  "application/msword",
];
const ALLOWED_EXTENSIONS = [".pdf", ".docx", ".doc"];
const MAX_SIZE = 10 * 1024 * 1024; // 10MB

// Text extraction is CPU-heavy; cap anonymous usage by IP.
const ANONYMOUS_IP_RATE_LIMIT = { max: 10, windowMs: 15 * 60 * 1000 };

async function extractPdfText(buffer) {
  const pdfjsLib = await import("pdfjs-dist/legacy/build/pdf.mjs");
  const { pathToFileURL } = await import("node:url");
  const nodePath = await import("node:path");
  const workerPath = nodePath.join(
    process.cwd(),
    "node_modules",
    "pdfjs-dist",
    "legacy",
    "build",
    "pdf.worker.mjs"
  );
  pdfjsLib.GlobalWorkerOptions.workerSrc = pathToFileURL(workerPath).href;
  const loadingTask = pdfjsLib.getDocument({
    data: new Uint8Array(buffer),
    useSystemFonts: true,
  });
  const doc = await loadingTask.promise;
  const textParts = [];
  for (let i = 1; i <= doc.numPages; i++) {
    const page = await doc.getPage(i);
    const content = await page.getTextContent();
    const pageText = content.items.map((item) => item.str).join(" ");
    if (pageText.trim()) textParts.push(pageText);
  }
  const text = textParts.join("\n");
  await doc.destroy();
  return text;
}

/**
 * POST /api/extract-text
 * Extract text content from a PDF or DOCX file.
 * Accepts multipart/form-data with a "file" field.
 * Returns { text } with the extracted content.
 */
export async function POST(request) {
  try {
    const auth = await authenticateOptional(request);

    if (!auth?.userId) {
      const ip = getClientIp(request);
      const limited = checkRateLimit(
        `extract-text:anon:${ip}`,
        ANONYMOUS_IP_RATE_LIMIT.max,
        ANONYMOUS_IP_RATE_LIMIT.windowMs
      );
      if (!limited.allowed) {
        return apiError("Rate limit exceeded. Please try again later.", 429);
      }
    }

    const { file } = await parseMultipartForm(request, "file");

    if (!file) {
      return apiValidationError(
        ["file is required"],
        "Please upload a PDF or DOCX file."
      );
    }

    // Validate file type by both MIME type and extension
    const ext = "." + file.name.split(".").pop()?.toLowerCase();
    const isValidType =
      ALLOWED_TYPES.includes(file.type) || ALLOWED_EXTENSIONS.includes(ext);

    if (!isValidType) {
      return apiValidationError(
        [`Invalid file type: ${file.type || ext}`],
        "Only PDF and DOCX files are supported."
      );
    }

    // Validate file size
    if (file.size > MAX_SIZE) {
      const sizeMB = (file.size / (1024 * 1024)).toFixed(2);
      return apiValidationError(
        [`File too large: ${sizeMB}MB`],
        `Maximum file size is 10MB. Your file is ${sizeMB}MB.`
      );
    }

    let text = "";

    if (ext === ".pdf" || file.type === "application/pdf") {
      text = await extractPdfText(file.buffer);
    } else if (
      ext === ".docx" ||
      file.type ===
        "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
    ) {
      // Extract text from DOCX using mammoth
      const result = await mammoth.extractRawText({ buffer: file.buffer });
      text = result.value || "";
    } else {
      // Legacy binary .doc (OLE) is not parseable with the installed tooling.
      // Reject with a helpful message instead of failing with a 500.
      return apiError(
        "Legacy .doc files are not supported. Please save the file as .docx or PDF and try again.",
        400
      );
    }

    // Clean up extracted text
    text = text
      .replace(/\r\n/g, "\n")
      .replace(/\t/g, " ")
      .replace(/ {3,}/g, "  ")
      .trim();

    if (!text || text.length < 10) {
      return apiError(
        "Could not extract meaningful text from the file. The file may be image-based or empty.",
        400
      );
    }

    return apiSuccess({
      text,
      fileName: file.name,
      fileSize: file.size,
      charCount: text.length,
    });
  } catch (error) {
    if (error instanceof Response) return error;
    console.error("Extract text error:", error);
    return apiError("Failed to extract text from file", 500);
  }
}
