import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { fn } from "storybook/test";
import { LayoutGrid, Plus } from "lucide-react";

import { PageHeader } from "@/components/page-header";
import { Button } from "@/components/ui/button";

// PageHeader é presentacional: título grande + descrição opcional + count opcional
// + slot `actions` (à direita). Na app real, `actions` recebe <ViewToggle/> + "Novo card";
// aqui usamos botões mock (sem next/navigation) para manter a story isolada.
const meta = {
  title: "BusinessOS/PageHeader",
  component: PageHeader,
  parameters: { layout: "padded" },
  tags: ["autodocs"],
  argTypes: {
    actions: { control: false },
    className: { control: false },
  },
  decorators: [
    (Story) => (
      <div className="mx-auto w-full max-w-5xl">
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof PageHeader>;

export default meta;
type Story = StoryObj<typeof meta>;

// Slot de ações mock (equivalente visual a ViewToggle + botão "Novo card").
const MockActions = () => (
  <>
    <Button variant="outline" size="sm" onClick={fn()}>
      <LayoutGrid className="size-4" strokeWidth={1.75} />
      Grade
    </Button>
    <Button size="sm" onClick={fn()}>
      <Plus className="size-4" strokeWidth={1.75} />
      Novo card
    </Button>
  </>
);

// Completo: título + descrição + count + ações.
export const Completo: Story = {
  args: {
    title: "Oferta",
    description:
      "Desenhe a oferta que materializa a tese: o que se vende, como e por quanto.",
    count: 4,
    actions: <MockActions />,
  },
};

// Só título + descrição (sem count nem ações).
export const Minimo: Story = {
  args: {
    title: "Fluxo de Caixa",
    description:
      "Visibilidade do dinheiro entrando, saindo e de quanto tempo o negócio tem.",
  },
};

// Título + count, sem descrição.
export const ComContagem: Story = {
  args: {
    title: "Primeiros clientes",
    count: 3,
    actions: <MockActions />,
  },
};
