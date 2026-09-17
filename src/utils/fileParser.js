import mammoth from "mammoth";

export const MAX_FILE_SIZE_BYTES = 5 * 1024 * 1024;
const SUPPORTED_EXTENSIONS = [".pdf", ".docx"];

function validateFile(file) {
  const name = file.name.toLowerCase();
  if (!SUPPORTED_EXTENSIONS.some((extension) => name.endsWith(extension))) {
    throw new Error("Unsupported file type. Please upload a PDF or DOCX.");
  }
  if (file.size > MAX_FILE_SIZE_BYTES) {
    throw new Error("File is larger than the 5 MB limit.");
  }
}

async function extractFromPdf(file) {
  const [{ default: pdfjsWorker }, pdfjsLib] = await Promise.all([
    import("pdfjs-dist/build/pdf.worker.mjs?url"),
    import("pdfjs-dist")
  ]);
  pdfjsLib.GlobalWorkerOptions.workerSrc = pdfjsWorker;
  const buffer = await file.arrayBuffer();
  const pdf = await pdfjsLib.getDocument({ data: buffer }).promise;
  let text = "";
  for (let i = 1; i <= pdf.numPages; i++) {
    const page = await pdf.getPage(i);
    const content = await page.getTextContent();
    text += content.items.map((item) => item.str).join(" ") + "\n";
  }
  return text.trim();
}

async function extractFromDocx(file) {
  const buffer = await file.arrayBuffer();
  const result = await mammoth.extractRawText({ arrayBuffer: buffer });
  return result.value.trim();
}

/**
 * Extracts plain text from an uploaded resume file (PDF or DOCX).
 * Throws a descriptive error if the file type isn't supported or parsing fails.
 */
export async function extractTextFromFile(file) {
  try {
    validateFile(file);
    const name = file.name.toLowerCase();
    if (name.endsWith(".pdf")) {
      return await extractFromPdf(file);
    }
    if (name.endsWith(".docx")) {
      return await extractFromDocx(file);
    }
    throw new Error("Unsupported file type. Please upload a PDF or DOCX.");
  } catch (err) {
    throw new Error(`Couldn't read "${file.name}": ${err.message}`);
  }
}
