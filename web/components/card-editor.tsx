"use client";

import { useState, useTransition } from "react";
import { Eye, Pencil, Sparkles } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Markdown } from "@/components/markdown";
import { cn } from "@/lib/utils";
import { saveCard, createCard } from "@/actions/cards";
import { suggestCardDraft } from "@/actions/ai-assist";
import { STATUS_LABELS, type Card, type PillarSlug, type Status } from "@/lib/types";

const STATUS_ORDER: Status[] = [
  "empty",
  "draft",
  "in-progress",
  "review",
  "done",
];

/**
 * Formulário de criar/editar card.
 *
 * - Novo card (sem `card.id`)  -> `createCard`  (gera slug único + order = maior+1)
 * - Editar card (com `card.id`) -> `saveCard`   (preserva `order`)
 *
 * Campos: título (Input), status (Select PT-BR), tags (CSV), corpo em Markdown
 * (Textarea) com pré-visualização do render real (aba "Pré-visualizar").
 * Feedback via `sonner`.
 *
 * Nota: no MVP a persistência via FS não persiste em produção serverless
 * (Vercel FS read-only). Ver spec seção 9.
 *
 * IMPORTANTE (compat): as props públicas — `card`, `pillar`, `page`, `onSaved`
 * — permanecem estáveis. `onCancel` é opcional e aditivo.
 */
export function CardEditor({
  card,
  pillar,
  page,
  onSaved,
  onCancel,
}: {
  card?: Partial<Card>;
  pillar: PillarSlug;
  page: string;
  onSaved?: () => void;
  onCancel?: () => void;
}) {
  const isEdit = Boolean(card?.id);
  const [title, setTitle] = useState(card?.title ?? "");
  const [status, setStatus] = useState<Status>(card?.status ?? (isEdit ? "empty" : "draft"));
  const [tags, setTags] = useState((card?.tags ?? []).join(", "));
  const [body, setBody] = useState(card?.body ?? "");
  const [tab, setTab] = useState<"write" | "preview">("write");
  const [pending, startTransition] = useTransition();
  const [aiPending, startAiTransition] = useTransition();

  function handleAiDraft() {
    startAiTransition(async () => {
      try {
        const draft = await suggestCardDraft({ pillar, page, title });
        setBody(draft);
        setTab("preview");
        toast.success("Rascunho gerado pela IA");
      } catch (err) {
        toast.error(
          err instanceof Error ? err.message : "Não foi possível gerar o rascunho",
        );
      }
    });
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const parsedTags = tags
      .split(",")
      .map((t) => t.trim())
      .filter(Boolean);

    startTransition(async () => {
      try {
        if (isEdit && card?.id) {
          await saveCard({
            pillar,
            page,
            id: card.id,
            title,
            status,
            tags: parsedTags,
            body,
            order: card.order ?? 0,
          });
          toast.success("Card salvo");
        } else {
          await createCard({
            pillar,
            page,
            title,
            status,
            tags: parsedTags,
            body,
          });
          toast.success("Card criado");
        }
        onSaved?.();
      } catch (err) {
        toast.error(
          err instanceof Error
            ? err.message
            : isEdit
              ? "Não foi possível salvar o card"
              : "Não foi possível criar o card",
        );
      }
    });
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      <div className="flex flex-col gap-1.5">
        <Label htmlFor="card-title">Título</Label>
        <Input
          id="card-title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Título do card"
          required
        />
      </div>

      <div className="flex flex-col gap-1.5">
        <Label htmlFor="card-status">Status</Label>
        <Select value={status} onValueChange={(v) => setStatus(v as Status)}>
          <SelectTrigger id="card-status" className="w-full">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {STATUS_ORDER.map((s) => (
              <SelectItem key={s} value={s}>
                {STATUS_LABELS[s]}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="flex flex-col gap-1.5">
        <Label htmlFor="card-tags">Tags (separadas por vírgula)</Label>
        <Input
          id="card-tags"
          value={tags}
          onChange={(e) => setTags(e.target.value)}
          placeholder="pricing, mvp"
        />
      </div>

      <div className="flex flex-col gap-1.5">
        <div className="flex items-center justify-between gap-2">
          <Label htmlFor="card-body">Conteúdo (Markdown)</Label>
          <div className="flex items-center gap-2">
            {/* Segmented control Escrever / Pré-visualizar */}
            <div className="flex items-center rounded-lg border border-border p-0.5">
              <button
                type="button"
                onClick={() => setTab("write")}
                className={cn(
                  "flex items-center gap-1 rounded-md px-2 py-1 text-xs transition-colors",
                  tab === "write"
                    ? "bg-muted font-medium text-foreground"
                    : "text-muted-foreground hover:text-foreground",
                )}
              >
                <Pencil className="size-3" strokeWidth={1.75} />
                Escrever
              </button>
              <button
                type="button"
                onClick={() => setTab("preview")}
                className={cn(
                  "flex items-center gap-1 rounded-md px-2 py-1 text-xs transition-colors",
                  tab === "preview"
                    ? "bg-muted font-medium text-foreground"
                    : "text-muted-foreground hover:text-foreground",
                )}
              >
                <Eye className="size-3" strokeWidth={1.75} />
                Pré-visualizar
              </button>
            </div>
            <Button
              type="button"
              variant="outline"
              size="sm"
              disabled={!title.trim() || aiPending}
              onClick={handleAiDraft}
            >
              <Sparkles className="size-3.5" strokeWidth={1.75} />
              {aiPending ? "Gerando…" : "Perguntar à IA"}
            </Button>
          </div>
        </div>

        {tab === "write" ? (
          <Textarea
            id="card-body"
            value={body}
            onChange={(e) => setBody(e.target.value)}
            placeholder="Escreva livremente em Markdown…"
            rows={10}
            className="font-mono text-sm"
          />
        ) : (
          <div className="min-h-[15rem] rounded-lg border border-border bg-background p-4">
            {body.trim() ? (
              <Markdown className="text-foreground">{body}</Markdown>
            ) : (
              <p className="text-sm italic text-muted-foreground/70">
                Nada para pré-visualizar ainda.
              </p>
            )}
          </div>
        )}
      </div>

      <div className="flex justify-end gap-2">
        {onCancel ? (
          <Button type="button" variant="ghost" onClick={onCancel} disabled={pending}>
            Cancelar
          </Button>
        ) : null}
        <Button type="submit" disabled={pending}>
          {pending
            ? isEdit
              ? "Salvando…"
              : "Criando…"
            : isEdit
              ? "Salvar card"
              : "Criar card"}
        </Button>
      </div>
    </form>
  );
}
