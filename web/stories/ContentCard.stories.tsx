import type { Meta, StoryObj } from "@storybook/nextjs-vite";

import { ContentCard } from "@/components/content-card";
import { makeCard, RICH_CARD, EMPTY_CARD } from "./_mocks";

// ContentCard é presentacional: recebe um `Card` mockado por props e um `view`.
// Layout muda por `view`: grid (título + badge + preview 3 linhas + tags + data)
// vs. list (linha compacta). Server-safe (só usa Card/CardHeader/CardContent + StatusBadge).
const meta = {
  title: "BusinessOS/ContentCard",
  component: ContentCard,
  parameters: { layout: "centered" },
  tags: ["autodocs"],
  argTypes: {
    view: {
      control: "inline-radio",
      options: ["grid", "list"],
    },
    card: { control: false },
  },
} satisfies Meta<typeof ContentCard>;

export default meta;
type Story = StoryObj<typeof meta>;

// ---- GRID ----

// Card rico em grid: corpo longo (line-clamp de 3 linhas) + várias tags.
export const GridRico: Story = {
  args: { card: RICH_CARD, view: "grid" },
  decorators: [
    (Story) => (
      <div className="w-80">
        <Story />
      </div>
    ),
  ],
};

// Card concluído em grid.
export const GridConcluido: Story = {
  args: {
    card: makeCard({
      id: "objetivo-de-12-meses",
      pillar: "founder",
      page: "objetivo",
      title: "Objetivo de 12 meses",
      status: "done",
      tags: ["norte", "meta"],
      updated: "2026-06-28",
      body: "Chegar a R$ 30 mil de MRR em 12 meses mantendo uma semana de 4 dias. Sucesso = previsibilidade de caixa, não crescimento a qualquer custo.",
    }),
    view: "grid",
  },
  decorators: [
    (Story) => (
      <div className="w-80">
        <Story />
      </div>
    ),
  ],
};

// Card vazio em grid: sem corpo (status "empty") → placeholder "Sem conteúdo ainda".
export const GridVazio: Story = {
  args: { card: EMPTY_CARD, view: "grid" },
  decorators: [
    (Story) => (
      <div className="w-80">
        <Story />
      </div>
    ),
  ],
};

// ---- LIST ----

// Card "em progresso" em modo lista (linha compacta).
export const ListaEmProgresso: Story = {
  args: {
    card: makeCard({
      id: "oferta-principal",
      title: "Oferta principal",
      status: "in-progress",
      tags: ["pricing", "mvp"],
      updated: "2026-07-05",
      body: "Diagnóstico + implementação de um fluxo de vendas em 30 dias por R$ 4.500, com garantia de reembolso.",
    }),
    view: "list",
  },
  decorators: [
    (Story) => (
      <div className="w-[520px]">
        <Story />
      </div>
    ),
  ],
};

// Card "em revisão" em modo lista.
export const ListaRevisao: Story = {
  args: {
    card: makeCard({
      id: "perfil-ideal-de-cliente",
      page: "perfil-ideal-de-cliente",
      title: "Perfil ideal de cliente (ICP)",
      status: "review",
      tags: ["icp", "b2b"],
      updated: "2026-07-02",
      body: "Consultorias de 3 a 15 pessoas, faturando de R$ 50 mil a R$ 200 mil/mês, dependentes de indicação.",
    }),
    view: "list",
  },
  decorators: [
    (Story) => (
      <div className="w-[520px]">
        <Story />
      </div>
    ),
  ],
};
