import type { Meta, StoryObj } from "@storybook/nextjs-vite";

import { StatusBadge } from "@/components/status-badge";
import { STATUS_LABELS } from "@/lib/types";
import { ALL_STATUSES } from "./_mocks";

// StatusBadge é 100% presentacional (Server-safe): recebe apenas `status`.
// No tema P&B, os status se diferenciam por PESO/CONTORNO/PREENCHIMENTO/OPACIDADE
// — nunca por cor (spec seção 7).
const meta = {
  title: "BusinessOS/StatusBadge",
  component: StatusBadge,
  parameters: { layout: "centered" },
  tags: ["autodocs"],
  argTypes: {
    status: {
      control: "select",
      options: ALL_STATUSES,
      description: "Status do card (5 valores de `Status`).",
    },
    className: { control: false },
  },
} satisfies Meta<typeof StatusBadge>;

export default meta;
type Story = StoryObj<typeof meta>;

// Uma story por status (labels PT-BR: Vazio, Rascunho, Em progresso, Revisão, Concluído).
export const Vazio: Story = { args: { status: "empty" } };
export const Rascunho: Story = { args: { status: "draft" } };
export const EmProgresso: Story = { args: { status: "in-progress" } };
export const Revisao: Story = { args: { status: "review" } };
export const Concluido: Story = { args: { status: "done" } };

// Visão comparativa dos 5 status lado a lado.
export const Todos: Story = {
  args: { status: "draft" },
  render: () => (
    <div className="flex flex-wrap items-center gap-3">
      {ALL_STATUSES.map((s) => (
        <div key={s} className="flex flex-col items-center gap-1.5">
          <StatusBadge status={s} />
          <span className="text-xs text-muted-foreground">
            {STATUS_LABELS[s]}
          </span>
        </div>
      ))}
    </div>
  ),
};
