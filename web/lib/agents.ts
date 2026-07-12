import { promises as fs } from "node:fs";
import path from "node:path";
import matter from "gray-matter";
import { cache } from "react";

// Lê e faz parse dos agentes de IA definidos em web/agents/*.md.

const AGENTS_ROOT = path.join(process.cwd(), "agents");

export interface AgentDef {
  id: string;
  title: string;
  description?: string;
  pillar?: string;
  page?: string;
  pages?: string[];
  scope?: "global";
  system: string;
}

export const listAgents = cache(async (): Promise<AgentDef[]> => {
  const files = await fs.readdir(AGENTS_ROOT);
  const agents = await Promise.all(
    files
      .filter((f) => f.endsWith(".md"))
      .map(async (file) => {
        const raw = await fs.readFile(path.join(AGENTS_ROOT, file), "utf8");
        const { data, content } = matter(raw);
        return {
          ...(data as Omit<AgentDef, "system">),
          system: content.trim(),
        };
      }),
  );
  return agents.sort((a, b) => a.title.localeCompare(b.title));
});

// Agente especializado correspondente a um (pillar, page), quando existir.
export async function getAgentPrompt(
  pillar: string,
  page: string,
): Promise<{ title: string; system: string } | null> {
  const agents = await listAgents();
  const match = agents.find(
    (a) => a.pillar === pillar && (a.page === page || a.pages?.includes(page)),
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
