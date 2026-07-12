import type { Meta, StoryObj } from "@storybook/nextjs-vite";

import { CardGrid } from "@/components/card-grid";
import { EmptyState } from "@/components/empty-state";
import { SAMPLE_CARDS } from "./_mocks";

// CardGrid é presentacional: recebe `cards` mockados por props.
// grid ⇒ CSS grid responsivo; list ⇒ coluna densa; sem cards ⇒ EmptyState
// (o padrão interno, ou o slot `empty` customizado).
const meta = {
  title: "BusinessOS/CardGrid",
  component: CardGrid,
  parameters: { layout: "padded" },
  tags: ["autodocs"],
  argTypes: {
    view: {
      control: "inline-radio",
      options: ["grid", "list"],
    },
    cards: { control: false },
    empty: { control: false },
  },
  decorators: [
    (Story) => (
      <div className="mx-auto w-full max-w-5xl">
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof CardGrid>;

export default meta;
type Story = StoryObj<typeof meta>;

// Vários cards em grid (1/2/3 colunas conforme largura).
export const Grade: Story = {
  args: { cards: SAMPLE_CARDS, view: "grid" },
};

// Os mesmos cards em modo lista (linhas densas).
export const Lista: Story = {
  args: { cards: SAMPLE_CARDS, view: "list" },
};

// Caso vazio: `cards` = [] → cai no EmptyState padrão do CardGrid.
export const Vazio: Story = {
  args: { cards: [], view: "grid" },
};

// Caso vazio com slot `empty` customizado (como o PageView faz na app real).
export const VazioCustomizado: Story = {
  args: {
    cards: [],
    view: "grid",
    empty: (
      <EmptyState
        title="Comece a preencher “Oferta”"
        description="Desenhe a oferta que materializa a tese: o que se vende, como e por quanto."
        suggestions={["Oferta principal", "Preço e condições", "Garantia"]}
      />
    ),
  },
};
