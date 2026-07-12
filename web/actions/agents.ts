"use server";

import { revalidatePath } from "next/cache";
import { slugify } from "@/lib/utils";
import type { AgentDef } from "@/lib/agents";
import { createClient } from "@/lib/supabase/server";
import { getActiveOrganizationId } from "@/lib/organization";

async function requireOrganizationId(): Promise<string> {
  const organizationId = await getActiveOrganizationId();
  if (!organizationId) throw new Error("Nenhuma organização ativa para este usuário.");
  return organizationId;
}

// Grava o system prompt editado de volta na tabela `agents`, preservando
// os demais campos (título, escopo, pillar/pages).
export async function saveAgent(agent: AgentDef): Promise<void> {
  const organizationId = await requireOrganizationId();
  const supabase = createClient();

  const { error } = await supabase.from("agents").upsert(
    {
      organization_id: organizationId,
      id: agent.id,
      title: agent.title,
      description: agent.description ?? null,
      system: agent.system,
      scope: agent.scope ?? null,
      pillar: agent.pillar ?? null,
      pages: agent.pages ?? [],
    },
    { onConflict: "organization_id,id" },
  );

  if (error) throw new Error(error.message);

  revalidatePath("/agentes");
}

// Cria um novo agente global a partir do Agent Builder.
// O id vem do título (slugificado); em colisão, sufixa -2, -3, ...
export async function createAgent(input: {
  title: string;
  description: string;
  system: string;
}): Promise<{ id: string }> {
  const organizationId = await requireOrganizationId();
  const supabase = createClient();

  const { data: existingRows, error: readError } = await supabase
    .from("agents")
    .select("id")
    .eq("organization_id", organizationId);

  if (readError) throw new Error(readError.message);

  const ids = new Set((existingRows ?? []).map((r) => r.id));
  const base = slugify(input.title) || "agente";
  let id = base;
  let suffix = 2;
  while (ids.has(id)) {
    id = `${base}-${suffix}`;
    suffix += 1;
  }

  const { error } = await supabase.from("agents").insert({
    organization_id: organizationId,
    id,
    title: input.title,
    description: input.description || null,
    system: input.system,
    scope: "global",
  });

  if (error) throw new Error(error.message);

  revalidatePath("/agentes");
  return { id };
}
