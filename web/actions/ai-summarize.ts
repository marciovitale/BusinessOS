"use server";

import { getAnthropicClient } from "@/lib/anthropic-client";
import { getGlobalAgentPrompt } from "@/lib/agents";

// Condensa um card em um resumo curto, usando o agente global "summarizer".
export async function summarizeCard({
  title,
  body,
}: {
  title: string;
  body: string;
}): Promise<string> {
  const agent = await getGlobalAgentPrompt("summarizer");
  const client = getAnthropicClient();

  const response = await client.messages.create({
    model: "claude-opus-4-8",
    max_tokens: 256,
    system:
      agent?.system ??
      "Resuma o card a seguir em 1-2 frases curtas, em português do Brasil, preservando números e decisões concretas.",
    messages: [
      {
        role: "user",
        content: `Card: "${title}"\n\n${body}`,
      },
    ],
  });

  const textBlock = response.content.find((b) => b.type === "text");
  if (!textBlock || textBlock.type !== "text") {
    throw new Error("A IA não retornou texto.");
  }
  return textBlock.text.trim();
}
