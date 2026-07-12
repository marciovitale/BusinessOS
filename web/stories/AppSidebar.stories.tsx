import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import type { ReactNode } from "react";
import { Sparkles } from "lucide-react";

import { SidebarNav } from "@/components/sidebar-nav";
import { SAMPLE_PILLARS } from "./_mocks";

// NOTA DE ISOLAMENTO:
// `AppSidebar` é um Server Component ASSÍNCRONO que chama `getPillars()` (loader
// de filesystem, `lib/content.ts` → `node:fs`) — não renderiza isolado no Storybook.
// Por isso a story é do `SidebarNav`, o MESMO conteúdo de navegação usado pelo
// AppSidebar (desktop e drawer mobile), que aceita `pillars` por prop.
// Aqui passamos `PillarSummary[]` mockado e envolvemos no shell visual do aside.
//
// SidebarNav renderiza NavGroup/NavLink (Client, usePathname): o item ativo e o
// grupo aberto são controlados por `parameters.nextjs.navigation.pathname`.

function SidebarShell({ children }: { children: ReactNode }) {
  return (
    <aside className="flex h-[600px] w-64 shrink-0 flex-col border-r border-border bg-background">
      <div className="flex items-center gap-2 px-4 py-4 text-foreground">
        <span className="flex size-7 items-center justify-center rounded-lg bg-primary text-primary-foreground">
          <Sparkles className="size-4" strokeWidth={1.75} />
        </span>
        <span className="text-base font-semibold tracking-tight">
          BusinessOS
        </span>
      </div>
      <div className="flex-1 overflow-y-auto pb-6">{children}</div>
    </aside>
  );
}

const meta = {
  title: "BusinessOS/AppSidebar",
  component: SidebarNav,
  parameters: {
    layout: "centered",
    nextjs: {
      appDirectory: true,
      navigation: { pathname: "/direcao/oferta" },
    },
  },
  tags: ["autodocs"],
  argTypes: {
    pillars: { control: false },
    onNavigate: { control: false },
  },
  decorators: [
    (Story) => (
      <SidebarShell>
        <Story />
      </SidebarShell>
    ),
  ],
} satisfies Meta<typeof SidebarNav>;

export default meta;
type Story = StoryObj<typeof meta>;

// Navegação pelos 4 pilares com item ativo em "Direção › Oferta"
// (o pilar Direção abre sozinho porque contém a rota ativa).
export const Padrao: Story = {
  args: { pillars: SAMPLE_PILLARS },
};

// Item ativo = "Visão geral" (rota "/").
export const VisaoGeralAtiva: Story = {
  args: { pillars: SAMPLE_PILLARS },
  parameters: {
    nextjs: { appDirectory: true, navigation: { pathname: "/" } },
  },
};

// Item ativo em outro pilar: "Caixa › Fluxo de Caixa".
export const CaixaAtiva: Story = {
  args: { pillars: SAMPLE_PILLARS },
  parameters: {
    nextjs: {
      appDirectory: true,
      navigation: { pathname: "/caixa/fluxo-de-caixa" },
    },
  },
};
