"use client";

import { useState, useTransition } from "react";
import { Sparkles } from "lucide-react";
import { toast } from "sonner";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { runContextLint } from "@/actions/ai-lint";

// Painel de auditoria global: roda o agente "context-linter" sobre todos os cards
// e mostra contradições/lacunas encontradas entre pilares.
export function ContextLintPanel() {
  const [result, setResult] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  function handleRun() {
    startTransition(async () => {
      try {
        const findings = await runContextLint();
        setResult(findings);
      } catch (err) {
        toast.error(
          err instanceof Error ? err.message : "Não foi possível rodar a auditoria",
        );
      }
    });
  }

  return (
    <Card className="rounded-xl">
      <CardHeader className="flex flex-row items-center justify-between gap-4">
        <div className="min-w-0">
          <h2 className="text-sm font-medium uppercase tracking-wide text-muted-foreground">
            Auditoria de consistência
          </h2>
          <p className="mt-1 text-sm text-muted-foreground">
            Revisa todos os pilares em busca de contradições e lacunas.
          </p>
        </div>
        <Button
          type="button"
          variant="outline"
          size="sm"
          disabled={pending}
          onClick={handleRun}
        >
          <Sparkles className="size-3.5" strokeWidth={1.75} />
          {pending ? "Analisando…" : "Rodar auditoria"}
        </Button>
      </CardHeader>
      {result ? (
        <CardContent>
          <p className="whitespace-pre-line text-sm text-muted-foreground">
            {result}
          </p>
        </CardContent>
      ) : null}
    </Card>
  );
}
