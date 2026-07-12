"use server";

import { getAnthropicClient } from "@/lib/anthropic-client";

// Revisa o system prompt de um agente e sugere uma versão melhorada,
// mantendo o mesmo propósito e escopo.
export async function improveAgentPrompt({
  title,
  description,
  system,
}: {
  title: string;
  description?: string;
  system: string;
}): Promise<string> {
  const client = getAnthropicClient();
  const response = await client.messages.create({
    model: "claude-opus-4-8",
    max_tokens: 2048,
    system:
      "Você é um especialista em prompt engineering. Revise o system prompt de um agente de IA, " +
      "mantendo exatamente o mesmo propósito e escopo, mas tornando as instruções mais claras, " +
      "específicas e eficazes (remova ambiguidade, adicione critérios concretos quando fizer falta, " +
      "corte redundância). Responda apenas com o novo system prompt em Markdown, sem comentários, " +
      "sem explicações e sem marcações de bloco de código.",
    messages: [
      {
        role: "user",
        content:
          `Agente: "${title}"${description ? ` — ${description}` : ""}\n\n` +
          `System prompt atual:\n\n${system}`,
      },
    ],
  });

  const textBlock = response.content.find((b) => b.type === "text");
  if (!textBlock || textBlock.type !== "text") {
    throw new Error("A IA não retornou texto.");
  }
  return textBlock.text.trim();
}
