"use server";

import { revalidatePath } from "next/cache";
import {
  saveCardInput,
  createCardInput,
  deleteCardInput,
  type SaveCardInput,
  type CreateCardInput,
  type DeleteCardInput,
} from "@/lib/schema";
import { slugify } from "@/lib/utils";
import { createClient } from "@/lib/supabase/server";
import { getActiveOrganizationId } from "@/lib/organization";

/**
 * Server Actions de escrita do BusinessOS — persistência em Postgres
 * (Supabase), escopada pela organização ativa do usuário logado.
 */

async function requireOrganizationId(): Promise<string> {
  const organizationId = await getActiveOrganizationId();
  if (!organizationId) throw new Error("Nenhuma organização ativa para este usuário.");
  return organizationId;
}

/**
 * Grava um card existente, preservando o `order` atual em vez de deixar o
 * cliente sobrescrevê-lo (mesma regra do MVP em filesystem).
 */
export async function saveCard(input: SaveCardInput) {
  const data = saveCardInput.parse(input);
  const id = slugify(data.id) || "card";
  const organizationId = await requireOrganizationId();
  const supabase = createClient();

  const { data: existing } = await supabase
    .from("cards")
    .select("order")
    .eq("organization_id", organizationId)
    .eq("pillar", data.pillar)
    .eq("page", data.page)
    .eq("id", id)
    .maybeSingle();

  const { error } = await supabase.from("cards").upsert(
    {
      organization_id: organizationId,
      id,
      pillar: data.pillar,
      page: data.page,
      title: data.title,
      status: data.status,
      tags: data.tags,
      order: existing?.order ?? data.order ?? 0,
      body: data.body ?? "",
      updated: new Date().toISOString().slice(0, 10),
    },
    { onConflict: "organization_id,pillar,page,id" },
  );

  if (error) throw new Error(error.message);

  revalidatePath(`/${data.pillar}/${data.page}`);
  return { ok: true as const, id };
}

/**
 * Cria um novo card:
 * - gera um `id` (slug kebab-case) a partir do título; em colisão, sufixa -2, -3, ...
 * - define `order` = maior+1 da página (pillar, page);
 * - grava com o status inicial (default: `draft`).
 */
export async function createCard(input: CreateCardInput) {
  const data = createCardInput.parse(input);
  const organizationId = await requireOrganizationId();
  const supabase = createClient();

  const { data: existingRows, error: readError } = await supabase
    .from("cards")
    .select("id, order")
    .eq("organization_id", organizationId)
    .eq("pillar", data.pillar)
    .eq("page", data.page);

  if (readError) throw new Error(readError.message);

  const ids = new Set((existingRows ?? []).map((r) => r.id));
  const maxOrder = (existingRows ?? []).reduce((m, r) => Math.max(m, r.order), -1);

  const base = slugify(data.title) || "card";
  let id = base;
  let n = 2;
  while (ids.has(id)) {
    id = `${base}-${n}`;
    n += 1;
  }

  // `insert` (não `upsert`): rejeita em caso de corrida na chave primária,
  // equivalente ao `flag: "wx"` da versão em filesystem.
  const { error } = await supabase.from("cards").insert({
    organization_id: organizationId,
    id,
    pillar: data.pillar,
    page: data.page,
    title: data.title,
    status: data.status,
    tags: data.tags,
    order: maxOrder + 1,
    body: data.body ?? "",
    updated: new Date().toISOString().slice(0, 10),
  });

  if (error) throw new Error(error.message);

  revalidatePath(`/${data.pillar}/${data.page}`);
  return { ok: true as const, id };
}

/**
 * Remove um card. Ação destrutiva — a UI exige confirmação (AlertDialog)
 * antes de chamar esta action.
 */
export async function deleteCard(input: DeleteCardInput) {
  const data = deleteCardInput.parse(input);
  const id = slugify(data.id) || "card";
  const organizationId = await requireOrganizationId();
  const supabase = createClient();

  const { error } = await supabase
    .from("cards")
    .delete()
    .eq("organization_id", organizationId)
    .eq("pillar", data.pillar)
    .eq("page", data.page)
    .eq("id", id);

  if (error) throw new Error(error.message);

  revalidatePath(`/${data.pillar}/${data.page}`);
  return { ok: true as const, id };
}
