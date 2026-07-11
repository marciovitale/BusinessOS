"use server";

import { promises as fs } from "node:fs";
import path from "node:path";
import matter from "gray-matter";
import { revalidatePath } from "next/cache";
import { saveCardInput, type SaveCardInput } from "@/lib/schema";

const CONTENT_ROOT = path.join(process.cwd(), "content");

// kebab-case + sem path traversal. Garante que o id vira um nome de arquivo seguro.
function safeSlug(value: string): string {
  return value
    .normalize("NFD")
    .replace(/\p{Diacritic}/gu, "") // remove acentos
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 80);
}

/**
 * Grava o card de volta no filesystem, reconstruindo frontmatter + corpo.
 *
 * Limitação de ambiente: em runtime serverless da Vercel o filesystem é
 * read-only (exceto /tmp) — portanto isto persiste em dev local / FS gravável,
 * mas NÃO persiste em produção na Vercel. É o limite que motiva a migração
 * para Supabase (spec seção 11).
 */
export async function saveCard(input: SaveCardInput) {
  const data = saveCardInput.parse(input); // valida/coage (zod)
  const id = safeSlug(data.id) || "card";
  const dir = path.join(CONTENT_ROOT, data.pillar, safeSlug(data.page));
  await fs.mkdir(dir, { recursive: true });
  const file = path.join(dir, `${id}.md`);

  const frontmatter = {
    id,
    pillar: data.pillar,
    page: data.page,
    title: data.title,
    status: data.status,
    tags: data.tags,
    order: data.order,
    updated: new Date().toISOString().slice(0, 10),
  };

  const fileContents = matter.stringify(data.body ?? "", frontmatter);
  await fs.writeFile(file, fileContents, "utf8");

  revalidatePath(`/${data.pillar}/${data.page}`);
  return { ok: true as const, id };
}
