"use client";

import { useState, useTransition } from "react";
import { Sparkles } from "lucide-react";
import { toast } from "sonner";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { StatusBadge } from "@/components/status-badge";
import { summarizeCard } from "@/actions/ai-summarize";
import type { Card as CardModel } from "@/lib/types";

// Linha de card usada em "Continue de onde parou". Igual ao ContentCard (view="list"),
// mas com um botão para condensar o corpo em um resumo curto via agente "summarizer".
export function RecentCardRow({ card }: { card: CardModel }) {
  const [summary, setSummary] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  function handleSummarize() {
    startTransition(async () => {
      try {
        const result = await summarizeCard({ title: card.title, body: card.body });
        setSummary(result);
      } catch (err) {
        toast.error(
          err instanceof Error ? err.message : "Não foi possível gerar o resumo",
        );
      }
    });
  }

  return (
    <Card className="flex-row items-center justify-between gap-4 rounded-xl px-4 py-3">
      <div className="min-w-0 flex-1">
        <h3 className="truncate text-sm font-medium text-foreground">{card.title}</h3>
        {card.body ? (
          <p className="mt-0.5 truncate text-sm text-muted-foreground">
            {summary ?? card.body}
          </p>
        ) : null}
      </div>
      <div className="flex shrink-0 items-center gap-2">
        {card.body ? (
          <Button
            type="button"
            variant="ghost"
            size="icon-sm"
            aria-label="Resumir com IA"
            disabled={pending}
            onClick={handleSummarize}
          >
            <Sparkles className="size-3.5" strokeWidth={1.75} />
          </Button>
        ) : null}
        <StatusBadge status={card.status} />
        <time className="hidden text-xs text-muted-foreground sm:block">{card.updated}</time>
      </div>
    </Card>
  );
}
