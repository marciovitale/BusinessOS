"use client";

import { useState, useTransition } from "react";
import { Wand2 } from "lucide-react";
import { toast } from "sonner";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { saveAgent } from "@/actions/agents";
import { improveAgentPrompt } from "@/actions/ai-improve-prompt";
import type { AgentDef } from "@/lib/agents";

const PILLAR_LABELS: Record<string, string> = {
  founder: "Founder",
  direcao: "Direção",
  validacao: "Validação",
  caixa: "Caixa",
};

// Card de agente com controles individuais: editar o system prompt,
// salvar (grava de volta no .md) ou descartar as alterações locais.
export function AgentEditorCard({ agent }: { agent: AgentDef }) {
  const [title, setTitle] = useState(agent.title);
  const [savedTitle, setSavedTitle] = useState(agent.title);
  const [system, setSystem] = useState(agent.system);
  const [savedSystem, setSavedSystem] = useState(agent.system);
  const [pending, startTransition] = useTransition();
  const [improving, startImproveTransition] = useTransition();
  const dirty = system !== savedSystem || title !== savedTitle;

  function handleSave() {
    startTransition(async () => {
      try {
        await saveAgent({ ...agent, title, system });
        setSavedTitle(title);
        setSavedSystem(system);
        toast.success(`${title} salvo`);
      } catch (err) {
        toast.error(
          err instanceof Error ? err.message : `Não foi possível salvar ${title}`,
        );
      }
    });
  }

  function handleReset() {
    setTitle(savedTitle);
    setSystem(savedSystem);
  }

  function handleImprove() {
    startImproveTransition(async () => {
      try {
        const improved = await improveAgentPrompt({
          title,
          description: agent.description,
          system,
        });
        setSystem(improved);
        toast.success(`Sugestão gerada para ${title} — revise e salve`);
      } catch (err) {
        toast.error(
          err instanceof Error
            ? err.message
            : `Não foi possível melhorar o prompt de ${title}`,
        );
      }
    });
  }

  return (
    <Card className="rounded-xl">
      <CardHeader className="gap-2">
        <div className="flex items-center justify-between gap-2">
          <Input
            aria-label="Nome do agente"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="h-8 w-auto min-w-0 flex-1 border-transparent bg-transparent px-2 text-base font-medium shadow-none hover:border-input focus-visible:border-ring"
          />
          <Badge variant="outline" className="shrink-0">
            {agent.scope === "global"
              ? "Global"
              : (agent.pillar && PILLAR_LABELS[agent.pillar]) ?? agent.pillar}
          </Badge>
        </div>
        {agent.description ? (
          <p className="text-sm text-muted-foreground">{agent.description}</p>
        ) : null}
      </CardHeader>
      <CardContent className="flex flex-col gap-1.5">
        <div className="flex items-center justify-between">
          <Label htmlFor={`agent-${agent.id}`}>System prompt</Label>
          <Button
            type="button"
            variant="ghost"
            size="icon-sm"
            aria-label="Melhorar prompt com IA"
            title="Melhorar prompt com IA"
            disabled={improving}
            onClick={handleImprove}
          >
            <Wand2 className="size-3.5" strokeWidth={1.75} />
          </Button>
        </div>
        <Textarea
          id={`agent-${agent.id}`}
          value={system}
          onChange={(e) => setSystem(e.target.value)}
          rows={12}
          className="font-mono text-xs"
        />
        <div className="flex justify-end gap-2 pt-1">
          <Button
            type="button"
            variant="outline"
            size="sm"
            disabled={!dirty || pending}
            onClick={handleReset}
          >
            Descartar
          </Button>
          <Button
            type="button"
            size="sm"
            disabled={!dirty || pending}
            onClick={handleSave}
          >
            {pending ? "Salvando…" : "Salvar"}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
