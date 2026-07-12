"use server";

import { promises as fs } from "node:fs";
import path from "node:path";
import matter from "gray-matter";
import { revalidatePath } from "next/cache";
import {
  saveCardInput,
  createCardInput,
  deleteCardInput,
  type SaveCardInput,
  type CreateCardInput,
  type DeleteCardInput,
} from "@/lib/schema";
import { slugify as safeSlug } from "@/lib/utils";

/**
 * Server Actions de escrita do BusinessOS (spec seção 9).
 *
 * Limitação de ambiente (documentada de propósito): em runtime serverless da
 * Vercel o filesystem é read-only (exceto /tmp) — portanto estas ações
 * persistem em dev local / servidores com FS gravável, mas NÃO persistem em
 * produção na Vercel. É esse limite que motiva a migração para Supabase
 * (spec seção 11). No MVP (single-user, editado localmente) é aceitável.
 */

const CONTENT_ROOT = path.join(process.cwd(), "content");

// Resolve o diretório da página de forma segura (sem path traversal):
// `pillar` já é validado por enum; `page` é reduzido a um slug kebab-case.
function pageDir(pillar: string, page: string): { dir: string; page: string } {
  const safePage = safeSlug(page) || "geral";
  return { dir: path.join(CONTENT_ROOT, pillar, safePage), page: safePage };
}

// Lê o `order` atual gravado no arquivo (se existir), para preservá-lo.
async function readExistingOrder(file: string): Promise<number | null> {
  try {
    const raw = await fs.readFile(file, "utf8");
    const { data } = matter(raw);
    const order = Number(data.order);
    return Number.isFinite(order) ? order : null;
  } catch {
    return null;
  }
}

// Lista os slugs de card (nomes de arquivo sem .md) e o maior `order` da pasta.
async function scanDir(
  dir: string,
): Promise<{ ids: Set<string>; maxOrder: number }> {
  const ids = new Set<string>();
  let maxOrder = -1;
  let files: string[] = [];
  try {
    files = (await fs.readdir(dir)).filter((f) => f.endsWith(".md"));
  } catch {
    return { ids, maxOrder };
  }
  await Promise.all(
    files.map(async (f) => {
      ids.add(f.replace(/\.md$/, ""));
      try {
        const raw = await fs.readFile(path.join(dir, f), "utf8");
        const order = Number(matter(raw).data.order);
        if (Number.isFinite(order)) maxOrder = Math.max(maxOrder, order);
      } catch {
        /* ignora arquivo ilegível ao calcular ordem */
      }
    }),
  );
  return { ids, maxOrder };
}

/**
 * Grava um card existente de volta no filesystem, reconstruindo
 * frontmatter + corpo. Preserva o `order` atual do arquivo (lê antes de
 * reescrever) em vez de zerá-lo.
 */
export async function saveCard(input: SaveCardInput) {
  const data = saveCardInput.parse(input);
  const id = safeSlug(data.id) || "card";
  const { dir, page } = pageDir(data.pillar, data.page);
  await fs.mkdir(dir, { recursive: true });
  const file = path.join(dir, `${id}.md`);

  // Preserva a ordem: valor gravado no arquivo > valor recebido do cliente > 0.
  const existingOrder = await readExistingOrder(file);
  const order = existingOrder ?? data.order ?? 0;

  const frontmatter = {
    id,
    pillar: data.pillar,
    page,
    title: data.title,
    status: data.status,
    tags: data.tags,
    order,
    updated: new Date().toISOString().slice(0, 10),
  };

  const fileContents = matter.stringify(data.body ?? "", frontmatter);
  await fs.writeFile(file, fileContents, "utf8");

  revalidatePath(`/${data.pillar}/${page}`);
  return { ok: true as const, id };
}

/**
 * Cria um novo card:
 * - gera um `id` (slug kebab-case, sanitizado, SEM path traversal) a partir
 *   do título; se colidir com um arquivo existente, sufixa -2, -3, ...
 * - define `order` = maior+1 da página;
 * - grava o `.md` com o status inicial (default: `draft`).
 */
export async function createCard(input: CreateCardInput) {
  const data = createCardInput.parse(input);
  const { dir, page } = pageDir(data.pillar, data.page);
  await fs.mkdir(dir, { recursive: true });

  const { ids, maxOrder } = await scanDir(dir);

  // Slug único dentro da pasta.
  const base = safeSlug(data.title) || "card";
  let id = base;
  let n = 2;
  while (ids.has(id)) {
    id = `${base}-${n}`;
    n += 1;
  }

  const frontmatter = {
    id,
    pillar: data.pillar,
    page,
    title: data.title,
    status: data.status,
    tags: data.tags,
    order: maxOrder + 1,
    updated: new Date().toISOString().slice(0, 10),
  };

  const file = path.join(dir, `${id}.md`);
  const fileContents = matter.stringify(data.body ?? "", frontmatter);
  // `flag: "wx"` falha se o arquivo já existir (corrida) — segurança extra.
  await fs.writeFile(file, fileContents, { encoding: "utf8", flag: "wx" });

  revalidatePath(`/${data.pillar}/${page}`);
  return { ok: true as const, id };
}

/**
 * Remove o arquivo `.md` de um card. Ação destrutiva — a UI exige confirmação
 * (AlertDialog) antes de chamar esta action.
 */
export async function deleteCard(input: DeleteCardInput) {
  const data = deleteCardInput.parse(input);
  const id = safeSlug(data.id) || "card";
  const { dir, page } = pageDir(data.pillar, data.page);
  const file = path.join(dir, `${id}.md`);

  await fs.rm(file, { force: true });

  revalidatePath(`/${data.pillar}/${page}`);
  return { ok: true as const, id };
}
