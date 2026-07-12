"use server";

import { promises as fs } from "node:fs";
import path from "node:path";
import matter from "gray-matter";
import { revalidatePath } from "next/cache";
import { slugify } from "@/lib/utils";
import type { AgentDef } from "@/lib/agents";

const AGENTS_ROOT = path.join(process.cwd(), "agents");

// Grava o system prompt editado de volta no arquivo web/agents/<id>.md,
// preservando o frontmatter original.
export async function saveAgent(agent: AgentDef): Promise<void> {
  const file = path.join(AGENTS_ROOT, `${agent.id}.md`);

  const frontmatter: Record<string, unknown> = {
    id: agent.id,
    title: agent.title,
  };
  if (agent.description) frontmatter.description = agent.description;
  if (agent.scope) frontmatter.scope = agent.scope;
  if (agent.pillar) frontmatter.pillar = agent.pillar;
  if (agent.page) frontmatter.page = agent.page;
  if (agent.pages) frontmatter.pages = agent.pages;

  const fileContents = matter.stringify(agent.system, frontmatter);
  await fs.writeFile(file, fileContents, "utf8");

  revalidatePath("/agentes");
}

// Cria um novo agente global em web/agents/<id>.md a partir do Agent Builder.
// O id vem do título (slugificado); em caso de colisão, um sufixo numérico é anexado.
export async function createAgent(input: {
  title: string;
  description: string;
  system: string;
}): Promise<{ id: string }> {
  const base = slugify(input.title) || "agente";
  const files = await fs.readdir(AGENTS_ROOT);
  const existingIds = new Set(
    files.filter((f) => f.endsWith(".md")).map((f) => f.replace(/\.md$/, "")),
  );

  let id = base;
  let suffix = 2;
  while (existingIds.has(id)) {
    id = `${base}-${suffix}`;
    suffix += 1;
  }

  const frontmatter: Record<string, unknown> = {
    id,
    title: input.title,
    scope: "global",
  };
  if (input.description) frontmatter.description = input.description;

  const fileContents = matter.stringify(input.system, frontmatter);
  await fs.writeFile(path.join(AGENTS_ROOT, `${id}.md`), fileContents, "utf8");

  revalidatePath("/agentes");
  return { id };
}
