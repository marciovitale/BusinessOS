import { cache } from "react";
import { createClient } from "@/lib/supabase/server";
import { getActiveOrganizationId } from "@/lib/organization";
import { PILLARS } from "@/lib/pillars";
import type {
  Card,
  PageSummary,
  PillarSlug,
  PillarSummary,
  Status,
} from "@/lib/types";

// Ordenação de maturidade dos status (para status agregado por página).
const STATUS_RANK: Record<Status, number> = {
  empty: 0,
  draft: 1,
  "in-progress": 2,
  review: 3,
  done: 4,
};

function rowToCard(row: {
  id: string;
  pillar: string;
  page: string;
  title: string;
  status: Status;
  tags: string[] | null;
  order: number;
  updated: string;
  body: string | null;
}): Card {
  return {
    id: row.id,
    pillar: row.pillar as PillarSlug,
    page: row.page as Card["page"],
    title: row.title,
    status: row.status,
    tags: row.tags ?? [],
    order: row.order,
    updated: row.updated,
    body: row.body ?? "",
  };
}

/**
 * Lê os cards de uma página (organização ativa + pillar + page).
 * Nunca lança por causa de erro de leitura: loga e degrada (retorna []).
 */
export const getCards = cache(
  async (pillar: PillarSlug, page: string): Promise<Card[]> => {
    const organizationId = await getActiveOrganizationId();
    if (!organizationId) return [];

    const supabase = createClient();
    const { data, error } = await supabase
      .from("cards")
      .select("*")
      .eq("organization_id", organizationId)
      .eq("pillar", pillar)
      .eq("page", page);

    if (error) {
      console.warn(`[content] erro ao ler cards de ${pillar}/${page}:`, error.message);
      return [];
    }

    return (data ?? [])
      .map(rowToCard)
      .sort((a, b) => a.order - b.order || a.title.localeCompare(b.title));
  },
);

/** Lê um card específico por id. */
export const getCard = cache(
  async (
    pillar: PillarSlug,
    page: string,
    id: string,
  ): Promise<Card | null> => {
    const cards = await getCards(pillar, page);
    return cards.find((c) => c.id === id) ?? null;
  },
);

/**
 * Lê TODOS os cards da organização ativa.
 * Fundação do "export de contexto" para IA.
 */
export const getAllCards = cache(async (): Promise<Card[]> => {
  const organizationId = await getActiveOrganizationId();
  if (!organizationId) return [];

  const supabase = createClient();
  const { data, error } = await supabase
    .from("cards")
    .select("*")
    .eq("organization_id", organizationId);

  if (error) {
    console.warn("[content] erro ao ler todos os cards:", error.message);
    return [];
  }

  return (data ?? []).map(rowToCard);
});

/** Status agregado/representativo de uma coleção de cards (maturidade máxima). */
function aggregateStatus(cards: Card[]): Status {
  if (cards.length === 0) return "empty";
  return cards.reduce<Status>((acc, c) => {
    return STATUS_RANK[c.status] > STATUS_RANK[acc] ? c.status : acc;
  }, "empty");
}

/** Resumo agregado de uma página (contagem + status representativo). */
export const getPageSummary = cache(
  async (pillar: PillarSlug, page: string): Promise<PageSummary> => {
    const def = PILLARS.find((p) => p.slug === pillar)?.pages.find(
      (pg) => pg.slug === page,
    );
    const cards = await getCards(pillar, page);
    return {
      slug: page,
      title: def?.title ?? page,
      route: def?.route ?? `/${pillar}/${page}`,
      description: def?.description,
      count: cards.length,
      status: aggregateStatus(cards),
    };
  },
);

/**
 * Constrói a navegação (4 pilares + páginas) a partir de `lib/pillars.ts`
 * enriquecida com contagens/status agregado por página (sidebar + home).
 */
export const getPillars = cache(async (): Promise<PillarSummary[]> => {
  return Promise.all(
    PILLARS.map(async (pillar) => {
      const pages: PageSummary[] = await Promise.all(
        pillar.pages.map(async (page) => {
          const cards = await getCards(pillar.slug, page.slug as string);
          return {
            ...page,
            count: cards.length,
            status: aggregateStatus(cards),
          };
        }),
      );
      return { ...pillar, pages };
    }),
  );
});
