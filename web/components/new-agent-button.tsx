"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Plus, Sparkles, X } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { generateAgent } from "@/actions/ai-generate-agent";
import { createAgent } from "@/actions/agents";
import { slugify } from "@/lib/utils";

// Agent Builder: nome do agente (validado contra os existentes) + caixa de
// prompt inicial. A IA se auto alimenta, expandindo o prompt inicial numa
// descrição de como pode ajudar e no próprio system prompt.
export function NewAgentButton({ existingIds }: { existingIds: string[] }) {
  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");
  const [initialPrompt, setInitialPrompt] = useState("");
  const [description, setDescription] = useState("");
  const [system, setSystem] = useState("");
  const [generated, setGenerated] = useState(false);
  const [generating, startGenerateTransition] = useTransition();
  const [creating, startCreateTransition] = useTransition();
  const router = useRouter();

  const trimmedName = name.trim();
  const slug = trimmedName ? slugify(trimmedName) : "";
  const nameConflict = slug !== "" && existingIds.includes(slug);

  function reset() {
    setName("");
    setInitialPrompt("");
    setDescription("");
    setSystem("");
    setGenerated(false);
  }

  function handleClose() {
    setOpen(false);
    reset();
  }

  function handleGenerate() {
    startGenerateTransition(async () => {
      try {
        const result = await generateAgent({
          name: trimmedName,
          initialPrompt,
        });
        setDescription(result.description);
        setSystem(result.system);
        setGenerated(true);
      } catch (err) {
        toast.error(
          err instanceof Error ? err.message : "Não foi possível gerar o agente",
        );
      }
    });
  }

  function handleCreate() {
    startCreateTransition(async () => {
      try {
        await createAgent({ title: trimmedName, description, system });
        toast.success(`Agente "${trimmedName}" criado`);
        handleClose();
        router.refresh();
      } catch (err) {
        toast.error(
          err instanceof Error ? err.message : "Não foi possível criar o agente",
        );
      }
    });
  }

  return (
    <>
      <Button size="sm" onClick={() => setOpen(true)}>
        <Plus className="size-4" strokeWidth={1.75} />
        Novo agente
      </Button>

      {open ? (
        <div className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto p-4 sm:p-8">
          <button
            type="button"
            aria-label="Fechar"
            className="fixed inset-0 bg-foreground/30"
            onClick={handleClose}
          />
          <div className="relative z-10 w-full max-w-2xl rounded-xl border border-border bg-background p-6 shadow-lg">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-lg font-semibold">Agent Builder</h2>
              <Button
                variant="ghost"
                size="icon"
                aria-label="Fechar"
                onClick={handleClose}
              >
                <X className="size-5" strokeWidth={1.75} />
              </Button>
            </div>

            <div className="flex flex-col gap-4">
              <div className="flex flex-col gap-1.5">
                <Label htmlFor="agent-name">Nome do agente</Label>
                <Input
                  id="agent-name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Ex: Fornecedor Reviewer"
                  aria-invalid={nameConflict}
                />
                {nameConflict ? (
                  <p className="text-xs text-destructive">
                    Já existe um agente com esse nome ({slug}.md).
                  </p>
                ) : null}
              </div>

              <div className="flex flex-col gap-1.5">
                <Label htmlFor="agent-initial-prompt">Caixa de prompt inicial</Label>
                <Textarea
                  id="agent-initial-prompt"
                  value={initialPrompt}
                  onChange={(e) => setInitialPrompt(e.target.value)}
                  placeholder="Ex: Ajudar a revisar contratos com fornecedores antes de assinar, apontando cláusulas de risco."
                  rows={4}
                  disabled={generating}
                />
              </div>

              <div className="flex justify-end">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  disabled={
                    !trimmedName ||
                    nameConflict ||
                    !initialPrompt.trim() ||
                    generating
                  }
                  onClick={handleGenerate}
                >
                  <Sparkles className="size-3.5" strokeWidth={1.75} />
                  {generating
                    ? "Gerando…"
                    : generated
                      ? "Gerar novamente"
                      : "Gerar agente"}
                </Button>
              </div>

              {generated ? (
                <>
                  <div className="flex flex-col gap-1.5">
                    <Label htmlFor="agent-description">Como ele pode ajudar</Label>
                    <Textarea
                      id="agent-description"
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                      rows={2}
                    />
                  </div>
                  <div className="flex flex-col gap-1.5">
                    <Label htmlFor="agent-system">System prompt</Label>
                    <Textarea
                      id="agent-system"
                      value={system}
                      onChange={(e) => setSystem(e.target.value)}
                      rows={10}
                      className="font-mono text-xs"
                    />
                  </div>
                  <div className="flex justify-end gap-2">
                    <Button
                      type="button"
                      disabled={
                        !trimmedName || nameConflict || !system.trim() || creating
                      }
                      onClick={handleCreate}
                    >
                      {creating ? "Criando…" : "Criar agente"}
                    </Button>
                  </div>
                </>
              ) : null}
            </div>
          </div>
        </div>
      ) : null}
    </>
  );
}
