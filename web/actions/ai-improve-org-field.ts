"use server";

import { getAnthropicClient } from "@/lib/anthropic-client";

type OrgField = "name" | "description";

const FIELD_INSTRUCTIONS: Record<OrgField, string> = {
  name:
    "Você é um especialista em naming de empresas/organizações. Revise o NOME de uma organização " +
    "cliente de uma plataforma B2B, deixando-o claro, profissional e conciso (poucas palavras, sem " +
    "emojis, sem pontuação desnecessária). Mantenha o sentido original — não invente outro nome do " +
    "zero. Responda apenas com o nome revisado, sem aspas, sem comentários, sem explicações.",
  description:
    "Você é um especialista em copywriting institucional. Revise a DESCRIÇÃO de uma organização " +
    "cliente de uma plataforma B2B, tornando-a mais clara, objetiva e profissional (1 a 3 frases). " +
    "Mantenha o sentido e os fatos originais — não invente informação nova. Responda apenas com a " +
    "descrição revisada, sem aspas, sem comentários, sem explicações, sem marcações de bloco de código.",
};

// Melhorador de IA genérico para os campos Nome/Descrição do formulário de
// criação de organização em /admin. Mesmo padrão de `improveAgentPrompt`
// (actions/ai-improve-prompt.ts): Server Action simples que chama o Claude
// com um system prompt específico por campo e devolve o texto sugerido.
export async function improveOrgField({
  field,
  value,
  organizationName,
}: {
  field: OrgField;
  value: string;
  organizationName?: string;
}): Promise<string> {
  const trimmed = value.trim();
  if (!trimmed) {
    throw new Error("Escreva algo antes de pedir para a IA melhorar.");
  }

  const client = getAnthropicClient();
  const response = await client.messages.create({
    model: "claude-opus-4-8",
    max_tokens: 512,
    system: FIELD_INSTRUCTIONS[field],
    messages: [
      {
        role: "user",
        content:
          field === "description" && organizationName
            ? `Organização: "${organizationName}"\n\nDescrição atual:\n\n${trimmed}`
            : trimmed,
      },
    ],
  });

  const textBlock = response.content.find((b) => b.type === "text");
  if (!textBlock || textBlock.type !== "text") {
    throw new Error("A IA não retornou texto.");
  }
  return textBlock.text.trim();
}
