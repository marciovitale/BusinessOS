import type { PillarDef } from "@/lib/types";

// Config estática dos 4 pilares e suas páginas (navegação + labels PT-BR).
// Fonte única para sidebar, home e resolução de labels/rotas no PageView.
export const PILLARS: PillarDef[] = [
  {
    slug: "founder",
    title: "Founder",
    description:
      "Quem você é como founder e a vida que o negócio precisa sustentar.",
    pages: [
      {
        slug: "objetivo",
        title: "Objetivo",
        route: "/founder/objetivo",
        description:
          "Para onde você quer levar o negócio e o que significa dar certo.",
      },
      {
        slug: "estilo-de-vida",
        title: "Estilo de vida",
        route: "/founder/estilo-de-vida",
        description:
          "Alinhe o negócio à vida que você quer ter: renda, horas e liberdade.",
      },
    ],
  },
  {
    slug: "direcao",
    title: "Direção",
    description:
      "Mercado, cliente, tese e oferta — a estratégia do negócio.",
    pages: [
      {
        slug: "mapa-do-mercado",
        title: "Mapa do Mercado",
        route: "/direcao/mapa-do-mercado",
        description:
          "O território onde o negócio atua: quem já está lá, tendências e tamanho.",
      },
      {
        slug: "ima-de-problemas",
        title: "Ímã de Problemas",
        route: "/direcao/ima-de-problemas",
        description:
          "Colecione e priorize os problemas reais que o mercado sente.",
      },
      {
        slug: "perfil-ideal-de-cliente",
        title: "Perfil Ideal de Cliente",
        route: "/direcao/perfil-ideal-de-cliente",
        description:
          "Descreva com precisão quem é o cliente ideal (ICP).",
      },
      {
        slug: "tese-de-valor",
        title: "Tese de Valor",
        route: "/direcao/tese-de-valor",
        description:
          "Por que o negócio entrega valor único e por que o cliente escolhe você.",
      },
      {
        slug: "oferta",
        title: "Oferta",
        route: "/direcao/oferta",
        description:
          "Desenhe a oferta que materializa a tese: o que se vende, como e por quanto.",
      },
    ],
  },
  {
    slug: "validacao",
    title: "Validação",
    description:
      "Confronte as hipóteses com a realidade e acompanhe a tração.",
    pages: [
      {
        slug: "oferta",
        title: "Oferta",
        route: "/validacao/oferta",
        description:
          "Registre os testes reais da oferta no mercado e o que os resultados dizem.",
      },
      {
        slug: "primeiros-clientes",
        title: "Primeiros clientes",
        route: "/validacao/primeiros-clientes",
        description:
          "Acompanhe as primeiras pessoas reais que compraram ou demonstraram intenção.",
      },
    ],
  },
  {
    slug: "caixa",
    title: "Caixa",
    description: "O dinheiro do negócio e a base administrativa mínima.",
    pages: [
      {
        slug: "fluxo-de-caixa",
        title: "Fluxo de Caixa",
        route: "/caixa/fluxo-de-caixa",
        description:
          "Visibilidade do dinheiro entrando, saindo e de quanto tempo o negócio tem.",
      },
      {
        slug: "erp",
        title: "ERP",
        route: "/caixa/erp",
        description:
          "A papelada e os cadastros operacionais: a base administrativa mínima.",
      },
    ],
  },
];

// Helper: encontra a definição de uma página pelo par (pillar, page).
export function findPage(pillar: string, page: string) {
  const p = PILLARS.find((x) => x.slug === pillar);
  const pg = p?.pages.find((x) => x.slug === page);
  return { pillar: p, page: pg };
}
