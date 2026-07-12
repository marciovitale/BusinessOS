import type { Meta, StoryObj } from "@storybook/nextjs-vite";

import { ViewToggle } from "@/components/view-toggle";

// ViewToggle é Client Component: usa `useRouter`/`usePathname`/`useSearchParams`
// (next/navigation) para escrever `?view=grid|list` na URL.
//
// No Storybook isolamos a navegação via `parameters.nextjs`:
//  - `appDirectory: true` habilita os mocks de next/navigation (App Router);
//  - `navigation.pathname`/`query` definem o estado inicial de rota.
// `router.replace` chamado ao trocar o valor é um mock (no-op) do @storybook/nextjs-vite,
// então a interação renderiza sem erro, apenas sem navegação real.
const meta = {
  title: "BusinessOS/ViewToggle",
  component: ViewToggle,
  parameters: {
    layout: "centered",
    nextjs: {
      appDirectory: true,
      navigation: { pathname: "/direcao/oferta", query: { view: "grid" } },
    },
  },
  tags: ["autodocs"],
  argTypes: {
    value: {
      control: "inline-radio",
      options: ["grid", "list"],
    },
  },
} satisfies Meta<typeof ViewToggle>;

export default meta;
type Story = StoryObj<typeof meta>;

// Valor selecionado = "grid" (Grade).
export const Grade: Story = {
  args: { value: "grid" },
};

// Valor selecionado = "list" (Lista).
export const Lista: Story = {
  args: { value: "list" },
  parameters: {
    nextjs: {
      appDirectory: true,
      navigation: { pathname: "/direcao/oferta", query: { view: "list" } },
    },
  },
};
