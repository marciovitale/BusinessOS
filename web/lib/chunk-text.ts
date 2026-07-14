const DEFAULT_MAX_CHARS = 1000;

// Chunking simples por parágrafo: agrupa parágrafos consecutivos até
// aproximar `maxChars`, sem overlap sofisticado. Parágrafos maiores que o
// limite são quebrados "na força" para não gerar chunks gigantes.
export function chunkText(text: string, maxChars: number = DEFAULT_MAX_CHARS): string[] {
  const paragraphs = text
    .split(/\n{2,}/)
    .map((p) => p.trim())
    .filter(Boolean);

  if (paragraphs.length === 0) return [];

  const chunks: string[] = [];
  let current = "";

  for (const paragraph of paragraphs) {
    let remaining = paragraph;

    // Parágrafo sozinho já maior que o limite: quebra em pedaços fixos.
    while (remaining.length > maxChars) {
      if (current) {
        chunks.push(current);
        current = "";
      }
      chunks.push(remaining.slice(0, maxChars));
      remaining = remaining.slice(maxChars);
    }

    const candidate = current ? `${current}\n\n${remaining}` : remaining;
    if (candidate.length > maxChars && current) {
      chunks.push(current);
      current = remaining;
    } else {
      current = candidate;
    }
  }

  if (current) chunks.push(current);

  return chunks;
}
