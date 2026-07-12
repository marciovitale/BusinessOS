// Tipos centrais do domínio BusinessOS.

export type PillarSlug = "founder" | "direcao" | "validacao" | "caixa";

export type Status = "empty" | "draft" | "in-progress" | "review" | "done";

// Slugs de página válidos (kebab-case). "oferta" pertence a `direcao` E `validacao`;
// o par (pillar, page) é sempre a chave — o slug sozinho nunca é.
export type PageSlug =
  | "objetivo"
  | "estilo-de-vida"
  | "mapa-do-mercado"
  | "ima-de-problemas"
  | "perfil-ideal-de-cliente"
  | "tese-de-valor"
  | "oferta"
  | "primeiros-clientes"
  | "fluxo-de-caixa"
  | "erp";

export interface Frontmatter {
  id: string;
  pillar: PillarSlug;
  page: PageSlug;
  title: string;
  status: Status;
  tags: string[];
  order: number;
  updated: string; // "YYYY-MM-DD"
}

// Card = frontmatter + corpo em Markdown (conteúdo do founder).
export interface Card extends Frontmatter {
  body: string;
  createdBy: string;
}

// Config estática de navegação.
export interface PageDef {
  slug: PageSlug | string; // string p/ acomodar "oferta" duplicada por pilar
  title: string; // label na UI (PT-BR)
  route: string; // ex.: "/direcao/oferta"
  description?: string; // propósito curto da página (usado em headers / empty state)
}

export interface PillarDef {
  slug: PillarSlug;
  title: string; // "Founder" | "Direção" | "Validação" | "Caixa"
  description?: string;
  pages: PageDef[];
}

// Resumos agregados (sidebar / home).
export interface PageSummary extends PageDef {
  count: number;
  status: Status; // status agregado/representativo da página
}

export interface PillarSummary extends PillarDef {
  pages: PageSummary[];
}

export const STATUS_LABELS: Record<Status, string> = {
  empty: "Vazio",
  draft: "Rascunho",
  "in-progress": "Em progresso",
  review: "Revisão",
  done: "Concluído",
};
