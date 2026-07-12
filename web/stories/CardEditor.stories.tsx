import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { fn } from "storybook/test";

import { CardEditor } from "@/components/card-editor";
import { Toaster } from "@/components/ui/sonner";
import { makeCard } from "./_mocks";

// ⚠️ ISOLAMENTO PARCIAL — LEIA ANTES DE RODAR:
//
// O `CardEditor` NÃO recebe a Server Action por prop. Ele importa DIRETAMENTE:
//   - `@/actions/cards`      → `saveCard`  ("use server"; usa node:fs, next/cache)
//   - `@/actions/ai-assist`  → `suggestCardDraft` ("use server"; usa o SDK Anthropic)
// e `@/actions/ai-assist` puxa `@/lib/content`, que executa `path.join(process.cwd(), …)`
// e `node:fs` no TOPO do módulo. O `@storybook/nextjs-vite` (10.x) NÃO transforma
// arquivos `"use server"` em stubs de RPC, então esse grafo roda no navegador.
//
// Consequência: para RENDERIZAR e INTERAGIR (botões "Salvar" / "Perguntar à IA")
// esses dois módulos precisam ser mockados no nível do preview — fora do escopo
// deste task (que só edita `web/stories/`). Sugestão de setup em
// `.storybook/preview.tsx` (a fazer pelo orquestrador):
//
//   import { sb } from "storybook/test";
//   sb.mock("@/actions/cards",    () => ({ saveCard: async () => ({ ok: true }) }));
//   sb.mock("@/actions/ai-assist", () => ({
//     suggestCardDraft: async () => "Rascunho gerado pela IA (mock).",
//   }));
//
// As props abaixo estão corretas e a story compila (tipos válidos). `onSaved`
// usa `fn()` para registrar a chamada nas Actions do Storybook.
//
// Props reais do CardEditor: { card?: Partial<Card>; pillar: PillarSlug; page: string; onSaved?: () => void }

const meta = {
  title: "BusinessOS/CardEditor",
  component: CardEditor,
  parameters: {
    layout: "centered",
    nextjs: { appDirectory: true },
  },
  argTypes: {
    card: { control: false },
    onSaved: { control: false },
  },
  args: {
    pillar: "direcao",
    page: "oferta",
    onSaved: fn(),
  },
  decorators: [
    (Story) => (
      <div className="w-[520px] rounded-xl border border-border bg-background p-6">
        <Story />
        <Toaster />
      </div>
    ),
  ],
} satisfies Meta<typeof CardEditor>;

export default meta;
type Story = StoryObj<typeof meta>;

// Caso "novo": sem `card` → formulário em branco (status inicial "Vazio").
export const Novo: Story = {
  args: {
    pillar: "direcao",
    page: "oferta",
  },
};

// Caso "edição": `card` mockado pré-preenchido (título, status, tags, corpo).
export const Edicao: Story = {
  args: {
    pillar: "direcao",
    page: "oferta",
    card: makeCard({
      id: "oferta-principal",
      pillar: "direcao",
      page: "oferta",
      title: "Oferta principal",
      status: "in-progress",
      tags: ["pricing", "mvp"],
      updated: "2026-07-05",
      body: "Diagnóstico + implementação de um fluxo de vendas em 30 dias, por R$ 4.500. Garantia de reembolso se o cliente não fechar ao menos 3 reuniões qualificadas.",
    }),
  },
};
