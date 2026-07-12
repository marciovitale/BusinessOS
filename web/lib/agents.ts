import { cache } from "react";
import { createClient } from "@/lib/supabase/server";
import { getActiveOrganizationId } from "@/lib/organization";

// Lê e monta os agentes de IA da organização ativa (tabela `agents`).

export interface AgentDef {
  id: string;
  title: string;
  description?: string;
  pillar?: string;
  pages?: string[];
  scope?: "global";
  system: string;
  createdBy: string;
}

function rowToAgent(row: {
  id: string;
  title: string;
  description: string | null;
  system: string | null;
  scope: string | null;
  pillar: string | null;
  pages: string[] | null;
  created_by: string;
}): AgentDef {
  return {
    id: row.id,
    title: row.title,
    description: row.description ?? undefined,
    pillar: row.pillar ?? undefined,
    pages: row.pages && row.pages.length > 0 ? row.pages : undefined,
    scope: row.scope === "global" ? "global" : undefined,
    system: row.system ?? "",
    createdBy: row.created_by,
  };
}

export const listAgents = cache(async (): Promise<AgentDef[]> => {
  const organizationId = await getActiveOrganizationId();
  if (!organizationId) return [];

  const supabase = createClient();
  const { data, error } = await supabase
    .from("agents")
    .select("*")
    .eq("organization_id", organizationId);

  if (error) {
    console.warn("[agents] erro ao ler agents:", error.message);
    return [];
  }

  return (data ?? [])
    .map(rowToAgent)
    .sort((a, b) => a.title.localeCompare(b.title));
});

// Agente especializado correspondente a um (pillar, page), quando existir.
export async function getAgentPrompt(
  pillar: string,
  page: string,
): Promise<{ title: string; system: string } | null> {
  const agents = await listAgents();
  const match = agents.find(
    (a) => a.pillar === pillar && a.pages?.includes(page),
  );
  return match ? { title: match.title, system: match.system } : null;
}

// Agente global (scope: global) por id, ex.: "summarizer", "context-linter".
export async function getGlobalAgentPrompt(
  id: string,
): Promise<{ title: string; system: string } | null> {
  const agents = await listAgents();
  const match = agents.find((a) => a.scope === "global" && a.id === id);
  return match ? { title: match.title, system: match.system } : null;
}
