import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { fn } from "storybook/test";
import { Plus } from "lucide-react";

import { EmptyState } from "@/components/empty-state";
import { Button } from "@/components/ui/button";

// EmptyState é presentacional: título + descrição opcional + sugestões opcionais
// + slot `action` (CTA). Aqui o botão é mock (onClick via fn()).
const meta = {
  title: "BusinessOS/EmptyState",
  component: EmptyState,
  parameters: { layout: "padded" },
  tags: ["autodocs"],
  argTypes: {
    action: { control: false },
    className: { control: false },
  },
  decorators: [
    (Story) => (
      <div className="mx-auto w-full max-w-2xl">
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof EmptyState>;

export default meta;
type Story = StoryObj<typeof meta>;

// Botão de ação mock ("Criar primeiro card").
const MockAction = () => (
  <Button size="sm" onClick={fn()}>
    <Plus className="size-4" strokeWidth={1.75} />
    Criar primeiro card
  </Button>
);

// Padrão: só título + descrição.
export const Padrao: Story = {
  args: {
    title: "Nenhum card ainda",
    description: "Comece registrando a primeira informação desta página.",
  },
};

// Com sugestões de cards (chips).
export const ComSugestoes: Story = {
  args: {
    title: "Comece a preencher “Oferta”",
    description:
      "Desenhe a oferta que materializa a tese: o que se vende, como e por quanto.",
    suggestions: ["Oferta principal", "Preço e condições", "Garantia", "Bônus"],
  },
};

// Com ação (CTA): título + descrição + botão "Criar primeiro card".
export const ComAcao: Story = {
  args: {
    title: "Comece a preencher “Fluxo de Caixa”",
    description:
      "Visibilidade do dinheiro entrando, saindo e de quanto tempo o negócio tem.",
    action: <MockAction />,
  },
};

// Completo: descrição + sugestões + ação.
export const Completo: Story = {
  args: {
    title: "Comece a preencher “Perfil Ideal de Cliente”",
    description: "Descreva com precisão quem é o cliente ideal (ICP).",
    suggestions: ["Segmento", "Dores", "Gatilhos de compra"],
    action: <MockAction />,
  },
};
