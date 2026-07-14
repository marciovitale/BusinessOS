import { getDocumentProxy, extractText as extractPdfText } from "unpdf";
import mammoth from "mammoth";
import ExcelJS from "exceljs";
import { getAnthropicClient } from "@/lib/anthropic-client";

// Extração de texto para o pipeline de ingestão (RAG). Cada formato vira uma
// string de texto simples, que segue pro mesmo pipeline de chunking +
// embeddings — a diferença está só em COMO a string é obtida:
//
// - texto puro / markdown / csv: lidos diretamente como string.
// - PDF: `unpdf` (build serverless do pdf.js, sem dependência nativa).
// - Word (.docx): `mammoth` (extractRawText).
// - Planilhas (.xlsx/.xls): `exceljs` — cada aba vira um bloco de texto
//   tipo CSV. (Não usamos `xlsx`/SheetJS: a versão publicada no npm tem 2
//   vulnerabilidades altas sem correção lá — a corrigida só existe no CDN
//   deles, que fica atrás de um desafio anti-bot da Cloudflare e bloqueia
//   o build da Vercel.)
// - Imagens: descritas em detalhe por um modelo de visão (Claude), e a
//   DESCRIÇÃO é o texto indexado — não há OCR neste MVP.
// - Áudio/vídeo: transcritos via Whisper (OpenAI) — a API de transcrição
//   aceita .mp4 diretamente, então cobre vídeo sem precisar extrair o áudio
//   manualmente (sem `ffmpeg`, que não é confiável em serverless).
const PLAIN_TEXT_EXTENSIONS = /\.(txt|md|markdown|csv)$/i;
const PLAIN_TEXT_MIME_TYPES = new Set(["text/plain", "text/markdown", "text/x-markdown", "text/csv"]);

const PDF_EXTENSIONS = /\.pdf$/i;
const DOCX_EXTENSIONS = /\.docx$/i;
const SPREADSHEET_EXTENSIONS = /\.(xlsx|xls)$/i;
const IMAGE_EXTENSIONS = /\.(png|jpe?g|webp|gif)$/i;
const AUDIO_VIDEO_EXTENSIONS = /\.(mp3|mpga|m4a|wav|webm|mp4|mov|mpeg)$/i;

const IMAGE_MIME_TYPES = new Set(["image/png", "image/jpeg", "image/webp", "image/gif"]);
const AUDIO_VIDEO_MIME_TYPES = new Set([
  "audio/mpeg",
  "audio/mp4",
  "audio/x-m4a",
  "audio/wav",
  "audio/webm",
  "video/mp4",
  "video/quicktime",
  "video/webm",
  "video/mpeg",
]);

export function isSupportedForExtraction(mimeType: string, fileName: string): boolean {
  if (PLAIN_TEXT_MIME_TYPES.has(mimeType) || PLAIN_TEXT_EXTENSIONS.test(fileName)) return true;
  if (mimeType === "application/pdf" || PDF_EXTENSIONS.test(fileName)) return true;
  if (
    mimeType === "application/vnd.openxmlformats-officedocument.wordprocessingml.document" ||
    DOCX_EXTENSIONS.test(fileName)
  )
    return true;
  if (
    mimeType === "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" ||
    mimeType === "application/vnd.ms-excel" ||
    SPREADSHEET_EXTENSIONS.test(fileName)
  )
    return true;
  if (IMAGE_MIME_TYPES.has(mimeType) || IMAGE_EXTENSIONS.test(fileName)) return true;
  if (AUDIO_VIDEO_MIME_TYPES.has(mimeType) || AUDIO_VIDEO_EXTENSIONS.test(fileName)) return true;
  return false;
}

async function extractFromPdf(file: File): Promise<string> {
  const buffer = new Uint8Array(await file.arrayBuffer());
  const pdf = await getDocumentProxy(buffer);
  const { text } = await extractPdfText(pdf, { mergePages: true });
  return text.trim();
}

async function extractFromDocx(file: File): Promise<string> {
  const buffer = Buffer.from(await file.arrayBuffer());
  const { value } = await mammoth.extractRawText({ buffer });
  return value.trim();
}

function cellToText(value: ExcelJS.CellValue): string {
  if (value === null || value === undefined) return "";
  if (typeof value === "object") {
    // Rich text, fórmulas (usa o resultado) e datas viram string simples.
    if ("text" in value && typeof value.text === "string") return value.text;
    if ("result" in value) return String(value.result ?? "");
    if (value instanceof Date) return value.toISOString().slice(0, 10);
    if ("richText" in value && Array.isArray(value.richText)) {
      return value.richText.map((r) => r.text).join("");
    }
    return String(value);
  }
  return String(value);
}

async function extractFromSpreadsheet(file: File): Promise<string> {
  const buffer = await file.arrayBuffer();
  const workbook = new ExcelJS.Workbook();
  await workbook.xlsx.load(buffer);

  const parts: string[] = [];
  for (const sheet of workbook.worksheets) {
    const rows: string[] = [];
    sheet.eachRow((row) => {
      const values = (row.values as ExcelJS.CellValue[]).slice(1);
      rows.push(values.map((v) => cellToText(v)).join(","));
    });
    const csv = rows.join("\n").trim();
    if (csv) parts.push(`### Planilha: ${sheet.name}\n${csv}`);
  }
  return parts.join("\n\n").trim();
}

async function describeImage(file: File): Promise<string> {
  const buffer = Buffer.from(await file.arrayBuffer());
  const base64 = buffer.toString("base64");
  const mediaType = file.type || "image/png";

  const client = getAnthropicClient();
  const response = await client.messages.create({
    model: "claude-opus-4-8",
    max_tokens: 1024,
    system:
      "Você descreve imagens para um repositório de contexto (RAG) de uma organização. " +
      "Transcreva todo texto visível na imagem palavra por palavra, e depois descreva em " +
      "detalhe o que a imagem mostra (objetos, pessoas, gráficos, diagramas, contexto). " +
      "Responda em português, direto, sem comentários fora da descrição.",
    messages: [
      {
        role: "user",
        content: [
          {
            type: "image",
            source: { type: "base64", media_type: mediaType as "image/png" | "image/jpeg" | "image/webp" | "image/gif", data: base64 },
          },
          { type: "text", text: `Descreva esta imagem (arquivo "${file.name}").` },
        ],
      },
    ],
  });

  const textBlock = response.content.find((b) => b.type === "text");
  if (!textBlock || textBlock.type !== "text") {
    throw new Error("A IA não retornou uma descrição para esta imagem.");
  }
  return textBlock.text.trim();
}

const OPENAI_TRANSCRIPTIONS_URL = "https://api.openai.com/v1/audio/transcriptions";

async function transcribeAudioOrVideo(file: File): Promise<string> {
  if (!process.env.OPENAI_API_KEY) {
    throw new Error(
      "OPENAI_API_KEY não configurada. Adicione sua chave em .env.local e reinicie o servidor.",
    );
  }

  const form = new FormData();
  form.append("file", file, file.name);
  form.append("model", "whisper-1");

  const res = await fetch(OPENAI_TRANSCRIPTIONS_URL, {
    method: "POST",
    headers: { Authorization: `Bearer ${process.env.OPENAI_API_KEY}` },
    body: form,
  });

  if (!res.ok) {
    const body = await res.text().catch(() => "");
    throw new Error(`Falha ao transcrever (${res.status}): ${body.slice(0, 300) || res.statusText}`);
  }

  const json = (await res.json()) as { text: string };
  return json.text.trim();
}

export async function extractTextFromFile(file: File): Promise<string> {
  const { name, type } = file;

  if (type === "application/pdf" || PDF_EXTENSIONS.test(name)) return extractFromPdf(file);
  if (
    type === "application/vnd.openxmlformats-officedocument.wordprocessingml.document" ||
    DOCX_EXTENSIONS.test(name)
  )
    return extractFromDocx(file);
  if (
    type === "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" ||
    type === "application/vnd.ms-excel" ||
    SPREADSHEET_EXTENSIONS.test(name)
  )
    return extractFromSpreadsheet(file);
  if (IMAGE_MIME_TYPES.has(type) || IMAGE_EXTENSIONS.test(name)) return describeImage(file);
  if (AUDIO_VIDEO_MIME_TYPES.has(type) || AUDIO_VIDEO_EXTENSIONS.test(name))
    return transcribeAudioOrVideo(file);

  return (await file.text()).trim();
}
