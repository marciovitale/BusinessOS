// Mocks de domínio (PT-BR) compartilhados pelas stories do BusinessOS.
// Tudo aqui é presentacional: `Card`/`PillarSummary` montados à mão a partir
// dos tipos reais de `@/lib/types` — NUNCA chamamos o loader de filesystem
// (`lib/content.ts`), que roda apenas em Server Components (Node runtime).

import type {
  Card,
  PillarSummary,
  Status,
} from "@/lib/types";

// Fábrica de Card: preenche todos os campos obrigatórios do frontmatter
// (id, pillar, page, title, status, tags, order, updated) + body.
export function makeCard(overrides: Partial<Card> = {}): Card {
  return {
    id: "card-exemplo",
    pillar: "direcao",
    page: "oferta",
    title: "Card de exemplo",
    status: "draft",
    tags: [],
    order: 0,
    updated: "2026-07-11",
    body: "",
    ...overrides,
  };
}

// Conjunto coerente de cards do domínio, cobrindo status/tags/corpos variados.
export const SAMPLE_CARDS: Card[] = [
  makeCard({
    id: "objetivo-de-12-meses",
    pillar: "founder",
    page: "objetivo",
    title: "Objetivo de 12 meses",
    status: "done",
    tags: ["norte", "meta"],
    order: 1,
    updated: "2026-06-28",
    body: "Chegar a R$ 30 mil de receita recorrente mensal (MRR) em 12 meses, mantendo uma semana de trabalho de 4 dias. Sucesso = previsibilidade de caixa, não crescimento a qualquer custo.",
  }),
  makeCard({
    id: "oferta-principal",
    pillar: "direcao",
    page: "oferta",
    title: "Oferta principal",
    status: "in-progress",
    tags: ["pricing", "mvp"],
    order: 2,
    updated: "2026-07-05",
    body: "Diagnóstico + implementação de um fluxo de vendas em 30 dias, por R$ 4.500. Garantia de reembolso se o cliente não fechar ao menos 3 reuniões qualificadas.",
  }),
  makeCard({
    id: "perfil-ideal-de-cliente",
    pillar: "direcao",
    page: "perfil-ideal-de-cliente",
    title: "Perfil ideal de cliente (ICP)",
    status: "review",
    tags: ["icp", "b2b"],
    order: 3,
    updated: "2026-07-02",
    body: "Consultorias e agências de 3 a 15 pessoas, faturando entre R$ 50 mil e R$ 200 mil/mês, que dependem de indicação e não têm processo de prospecção previsível.",
  }),
  makeCard({
    id: "fluxo-de-caixa-90-dias",
    pillar: "caixa",
    page: "fluxo-de-caixa",
    title: "Runway de 90 dias",
    status: "draft",
    tags: ["caixa", "runway"],
    order: 4,
    updated: "2026-07-08",
    body: "Saldo atual cobre ~5 meses de custo fixo (R$ 12 mil/mês). Meta: não deixar o runway cair abaixo de 3 meses antes de contratar.",
  }),
  makeCard({
    id: "mapa-do-mercado",
    pillar: "direcao",
    page: "mapa-do-mercado",
    title: "Concorrentes diretos",
    status: "empty",
    tags: [],
    order: 5,
    updated: "2026-07-11",
    body: "",
  }),
];

// Card rico (grid): corpo longo + várias tags, para exercitar o line-clamp.
export const RICH_CARD: Card = makeCard({
  id: "tese-de-valor",
  pillar: "direcao",
  page: "tese-de-valor",
  title: "Tese de valor",
  status: "in-progress",
  tags: ["posicionamento", "diferencial", "b2b", "vendas"],
  order: 1,
  updated: "2026-07-09",
  body: "Ajudamos consultorias pequenas a substituir a dependência de indicação por um motor de prospecção previsível. Diferente de agências que só entregam leads, entregamos o processo completo — mensagem, cadência e operação — instalado dentro do time do cliente em 30 dias. O cliente escolhe a gente porque assume o risco junto: parte do preço fica atrelada a reuniões qualificadas geradas.",
});

// Card vazio (sem corpo, status "empty") → dispara o placeholder "Sem conteúdo ainda".
export const EMPTY_CARD: Card = makeCard({
  id: "erp-cadastros",
  pillar: "caixa",
  page: "erp",
  title: "Cadastros operacionais",
  status: "empty",
  tags: [],
  order: 1,
  updated: "2026-07-11",
  body: "",
});

// PillarSummary[] mockado para a navegação (sidebar). Espelha os 4 pilares
// reais + páginas em PT-BR, com contagem e status agregado por página.
export const SAMPLE_PILLARS: PillarSummary[] = [
  {
    slug: "founder",
    title: "Founder",
    description:
      "Quem você é como founder e a vida que o negócio precisa sustentar.",
    pages: [
      { slug: "objetivo", title: "Objetivo", route: "/founder/objetivo", count: 2, status: "done" },
      { slug: "estilo-de-vida", title: "Estilo de vida", route: "/founder/estilo-de-vida", count: 1, status: "draft" },
    ],
  },
  {
    slug: "direcao",
    title: "Direção",
    description: "Mercado, cliente, tese e oferta — a estratégia do negócio.",
    pages: [
      { slug: "mapa-do-mercado", title: "Mapa do Mercado", route: "/direcao/mapa-do-mercado", count: 3, status: "in-progress" },
      { slug: "ima-de-problemas", title: "Ímã de Problemas", route: "/direcao/ima-de-problemas", count: 4, status: "review" },
      { slug: "perfil-ideal-de-cliente", title: "Perfil Ideal de Cliente", route: "/direcao/perfil-ideal-de-cliente", count: 1, status: "review" },
      { slug: "tese-de-valor", title: "Tese de Valor", route: "/direcao/tese-de-valor", count: 2, status: "in-progress" },
      { slug: "oferta", title: "Oferta", route: "/direcao/oferta", count: 2, status: "in-progress" },
    ],
  },
  {
    slug: "validacao",
    title: "Validação",
    description: "Confronte as hipóteses com a realidade e acompanhe a tração.",
    pages: [
      { slug: "oferta", title: "Oferta", route: "/validacao/oferta", count: 1, status: "draft" },
      { slug: "primeiros-clientes", title: "Primeiros clientes", route: "/validacao/primeiros-clientes", count: 3, status: "in-progress" },
    ],
  },
  {
    slug: "caixa",
    title: "Caixa",
    description: "O dinheiro do negócio e a base administrativa mínima.",
    pages: [
      { slug: "fluxo-de-caixa", title: "Fluxo de Caixa", route: "/caixa/fluxo-de-caixa", count: 1, status: "draft" },
      { slug: "erp", title: "ERP", route: "/caixa/erp", count: 0, status: "empty" },
    ],
  },
];

// Ordem canônica dos 5 status (para stories que iteram todos).
export const ALL_STATUSES: Status[] = [
  "empty",
  "draft",
  "in-progress",
  "review",
  "done",
];
