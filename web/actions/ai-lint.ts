"use server";

import { getAnthropicClient } from "@/lib/anthropic-client";
import { getAllCards } from "@/lib/content";
import { getGlobalAgentPrompt } from "@/lib/agents";

// Audita todos os cards em busca de contradições e lacunas, usando o agente global "context-linter".
export async function runContextLint(): Promise<string> {
  const cards = await getAllCards();
  if (cards.length === 0) {
    return "Ainda não há cards preenchidos para auditar.";
  }

  const agent = await getGlobalAgentPrompt("context-linter");
  const client = getAnthropicClient();
  const context = cards
    .map((c) => `### [${c.pillar}/${c.page}] ${c.title}\n${c.body || "(sem conteúdo)"}`)
    .join("\n\n");

  const response = await client.messages.create({
    model: "claude-opus-4-8",
    max_tokens: 2048,
    system:
      agent?.system ??
      "Audite os cards a seguir em busca de contradições e lacunas entre pilares.",
    messages: [
      {
        role: "user",
        content: `Todos os cards do AI2 - Business OS:\n\n${context}`,
      },
    ],
  });

  const textBlock = response.content.find((b) => b.type === "text");
  if (!textBlock || textBlock.type !== "text") {
    throw new Error("A IA não retornou texto.");
  }
  return textBlock.text.trim();
}
