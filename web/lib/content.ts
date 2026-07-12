import { promises as fs } from "node:fs";
import path from "node:path";
import matter from "gray-matter";
import { cache } from "react";
import { frontmatterSchema } from "@/lib/schema";
import { PILLARS } from "@/lib/pillars";
import type {
  Card,
  PageSummary,
  PillarSlug,
  PillarSummary,
  Status,
} from "@/lib/types";

// `process.cwd()` é o root do projeto Next (`web/`), onde vive `content/`.
const CONTENT_ROOT = path.join(process.cwd(), "content");

// Ordenação de maturidade dos status (para status agregado por página).
const STATUS_RANK: Record<Status, number> = {
  empty: 0,
  draft: 1,
  "in-progress": 2,
  review: 3,
  done: 4,
};

/**
 * Lê os cards de uma página `content/<pillar>/<page>/*.md`.
 * Nunca lança por causa de 1 arquivo inválido: loga e degrada (pula o arquivo).
 */
export const getCards = cache(
  async (pillar: PillarSlug, page: string): Promise<Card[]> => {
    const dir = path.join(CONTENT_ROOT, pillar, page);
    let files: string[] = [];
    try {
      files = (await fs.readdir(dir)).filter((f) => f.endsWith(".md"));
    } catch {
      return []; // pasta ainda não existe -> página vazia
    }

    const cards = await Promise.all(
      files.map(async (file) => {
        try {
          const raw = await fs.readFile(path.join(dir, file), "utf8");
          const { data, content } = matter(raw);
          const id = (data.id as string) ?? file.replace(/\.md$/, "");
          const parsed = frontmatterSchema.safeParse({
            ...data,
            id,
            pillar,
            page,
          });
          if (!parsed.success) {
            console.warn(
              `[content] frontmatter inválido em ${pillar}/${page}/${file}:`,
              parsed.error.flatten(),
            );
            return null;
          }
          return { ...parsed.data, body: content.trim() } as Card;
        } catch (err) {
          console.warn(
            `[content] falha ao ler ${pillar}/${page}/${file}:`,
            err,
          );
          return null;
        }
      }),
    );

    return (cards.filter(Boolean) as Card[]).sort(
      (a, b) => a.order - b.order || a.title.localeCompare(b.title),
    );
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
 * Varre TODOS os `.md` de `content/**` e retorna todos os cards planos.
 * Fundação do futuro "export de contexto" para IA.
 */
export const getAllCards = cache(async (): Promise<Card[]> => {
  const all: Card[] = [];
  for (const pillar of PILLARS) {
    for (const page of pillar.pages) {
      const cards = await getCards(pillar.slug, page.slug as string);
      all.push(...cards);
    }
  }
  return all;
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
