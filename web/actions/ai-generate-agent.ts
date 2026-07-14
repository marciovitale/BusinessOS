"use server";

import { getAnthropicClient } from "@/lib/anthropic-client";

function stripCodeFence(text: string): string {
  return text
    .trim()
    .replace(/^```(?:json)?\n?/, "")
    .replace(/\n?```$/, "")
    .trim();
}

export interface GeneratedAgent {
  description: string;
  system: string;
}

// Recebe o nome (definido pelo usuário) e o prompt inicial de um agente novo,
// e o "auto alimenta": a IA gera a descrição de como ele ajuda e expande o
// prompt inicial num system prompt completo.
export async function generateAgent({
  name,
  initialPrompt,
}: {
  name: string;
  initialPrompt: string;
}): Promise<GeneratedAgent> {
  const client = getAnthropicClient();
  const response = await client.messages.create({
    model: "claude-opus-4-8",
    max_tokens: 2048,
    system:
      "Você projeta agentes de IA especializados para o AI2 - Business OS, uma ferramenta de planejamento " +
      "de negócio para founders solo. Dado o nome de um agente e um prompt inicial (rascunho ou objetivo) " +
      "escrito pelo usuário, gere: uma descrição de uma frase dizendo como o agente ajuda, e um system " +
      "prompt completo em português do Brasil que expanda o prompt inicial — incluindo foco (o que " +
      "priorizar) e estilo (como se comunicar). Responda estritamente em JSON válido, sem markdown " +
      `fences e sem comentários, no formato exato: {"description": "...", "system": "..."}`,
    messages: [
      {
        role: "user",
        content: `Nome do agente: ${name}\n\nPrompt inicial:\n${initialPrompt}`,
      },
    ],
  });

  const textBlock = response.content.find((b) => b.type === "text");
  if (!textBlock || textBlock.type !== "text") {
    throw new Error("A IA não retornou texto.");
  }

  const parsed = JSON.parse(stripCodeFence(textBlock.text));
  return {
    description: String(parsed.description ?? ""),
    system: String(parsed.system ?? ""),
  };
}
