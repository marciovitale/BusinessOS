"use server";

import { getAnthropicClient } from "@/lib/anthropic-client";
import { getCards } from "@/lib/content";
import { PILLARS } from "@/lib/pillars";
import { getAgentPrompt } from "@/lib/agents";
import type { PillarSlug } from "@/lib/types";

// Gera um rascunho de conteúdo para um card, usando os demais cards
// já preenchidos no mesmo pilar como contexto e o agente especializado
// definido em web/agents/*.md para aquele (pillar, page), quando existir.
export async function suggestCardDraft({
  pillar,
  page,
  title,
}: {
  pillar: PillarSlug;
  page: string;
  title: string;
}): Promise<string> {
  const pillarDef = PILLARS.find((p) => p.slug === pillar);
  const pageDef = pillarDef?.pages.find((pg) => pg.slug === page);
  const agent = await getAgentPrompt(pillar, page);

  const existingCards = await getCards(pillar, page);
  const context = existingCards
    .filter((c) => c.title !== title && c.body.trim())
    .map((c) => `### ${c.title}\n${c.body}`)
    .join("\n\n");

  const outputInstructions =
    `Escreva um rascunho em Markdown, direto e prático, em português do Brasil, ` +
    `para o campo de conteúdo do card "${title}". ` +
    `Use o contexto de outros cards já preenchidos neste pilar para manter consistência. ` +
    `Responda apenas com o conteúdo do rascunho, sem comentários extras.`;

  const system = agent
    ? `${agent.system}\n\n${outputInstructions}`
    : `Você é um assistente que ajuda um founder solo a preencher o BusinessOS, ` +
      `uma ferramenta de planejamento de negócio organizada em 4 pilares (Founder, Direção, Validação, Caixa). ` +
      `Pilar atual: "${pillarDef?.title ?? pillar}" — ${pillarDef?.description ?? ""}. ` +
      `Página atual: "${pageDef?.title ?? page}" — ${pageDef?.description ?? ""}. ` +
      `${outputInstructions}`;

  const client = getAnthropicClient();
  const response = await client.messages.create({
    model: "claude-opus-4-8",
    max_tokens: 2048,
    system,
    messages: [
      {
        role: "user",
        content: context
          ? `Outros cards já preenchidos neste pilar:\n\n${context}\n\n---\n\nEscreva o rascunho para "${title}".`
          : `Ainda não há outros cards preenchidos neste pilar. Escreva o rascunho para "${title}".`,
      },
    ],
  });

  const textBlock = response.content.find((b) => b.type === "text");
  if (!textBlock || textBlock.type !== "text") {
    throw new Error("A IA não retornou texto.");
  }
  return textBlock.text;
}
