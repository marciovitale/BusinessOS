const OPENAI_EMBEDDINGS_URL = "https://api.openai.com/v1/embeddings";
const EMBEDDING_MODEL = "text-embedding-3-small"; // 1536 dimensões — bate com vector(1536) do schema.

// Chama a API de embeddings da OpenAI direto via fetch (sem SDK) para os
// chunks de texto de um arquivo. Lança erro claro se a chave não estiver
// configurada ou se a API responder com erro.
export async function embedTexts(texts: string[]): Promise<number[][]> {
  if (texts.length === 0) return [];

  if (!process.env.OPENAI_API_KEY) {
    throw new Error(
      "OPENAI_API_KEY não configurada. Adicione sua chave em .env.local e reinicie o servidor.",
    );
  }

  const res = await fetch(OPENAI_EMBEDDINGS_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
    },
    body: JSON.stringify({
      model: EMBEDDING_MODEL,
      input: texts,
    }),
  });

  if (!res.ok) {
    const body = await res.text().catch(() => "");
    throw new Error(
      `Falha ao gerar embeddings (${res.status}): ${body.slice(0, 300) || res.statusText}`,
    );
  }

  const json = (await res.json()) as {
    data: { embedding: number[]; index: number }[];
  };

  return json.data
    .slice()
    .sort((a, b) => a.index - b.index)
    .map((d) => d.embedding);
}
