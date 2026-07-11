"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Plus, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { CardEditor } from "@/components/card-editor";
import type { Card, PillarSlug } from "@/lib/types";

// Botão "Novo card" (também reusado no empty state). Abre o CardEditor num
// overlay simples. Ao salvar, atualiza a rota (router.refresh).
export function NewCardButton({
  pillar,
  page,
  label = "Novo card",
  variant = "default",
  card,
}: {
  pillar: PillarSlug;
  page: string;
  label?: string;
  variant?: "default" | "outline" | "secondary";
  card?: Partial<Card>;
}) {
  const [open, setOpen] = useState(false);
  const router = useRouter();

  return (
    <>
      <Button variant={variant} size="sm" onClick={() => setOpen(true)}>
        <Plus className="size-4" strokeWidth={1.75} />
        {label}
      </Button>

      {open ? (
        <div className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto p-4 sm:p-8">
          <button
            type="button"
            aria-label="Fechar"
            className="fixed inset-0 bg-foreground/30"
            onClick={() => setOpen(false)}
          />
          <div className="relative z-10 w-full max-w-lg rounded-xl border border-border bg-background p-6 shadow-lg">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-lg font-semibold">
                {card ? "Editar card" : "Novo card"}
              </h2>
              <Button
                variant="ghost"
                size="icon"
                aria-label="Fechar"
                onClick={() => setOpen(false)}
              >
                <X className="size-5" strokeWidth={1.75} />
              </Button>
            </div>
            <CardEditor
              pillar={pillar}
              page={page}
              card={card}
              onSaved={() => {
                setOpen(false);
                router.refresh();
              }}
            />
          </div>
        </div>
      ) : null}
    </>
  );
}
