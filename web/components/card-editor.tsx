"use client";

import { useState, useTransition } from "react";
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
import { saveCard } from "@/actions/cards";
import { STATUS_LABELS, type Card, type PillarSlug, type Status } from "@/lib/types";

const STATUS_ORDER: Status[] = [
  "empty",
  "draft",
  "in-progress",
  "review",
  "done",
];

/**
 * Formulário de edição de card (versão mínima da fundação).
 * Submete via Server Action `saveCard`; feedback via sonner.
 *
 * Nota: no MVP a persistência via FS não funciona em produção serverless
 * (Vercel FS read-only). Ver spec seção 9.
 */
export function CardEditor({
  card,
  pillar,
  page,
  onSaved,
}: {
  card?: Partial<Card>;
  pillar: PillarSlug;
  page: string;
  onSaved?: () => void;
}) {
  const [title, setTitle] = useState(card?.title ?? "");
  const [status, setStatus] = useState<Status>(card?.status ?? "empty");
  const [tags, setTags] = useState((card?.tags ?? []).join(", "));
  const [body, setBody] = useState(card?.body ?? "");
  const [pending, startTransition] = useTransition();

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    startTransition(async () => {
      try {
        await saveCard({
          pillar,
          page,
          id: card?.id ?? title,
          title,
          status,
          tags: tags
            .split(",")
            .map((t) => t.trim())
            .filter(Boolean),
          body,
          order: card?.order ?? 0,
        });
        toast.success("Card salvo");
        onSaved?.();
      } catch {
        toast.error("Não foi possível salvar o card");
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
        <Label htmlFor="card-body">Conteúdo (Markdown)</Label>
        <Textarea
          id="card-body"
          value={body}
          onChange={(e) => setBody(e.target.value)}
          placeholder="Escreva livremente em Markdown…"
          rows={8}
        />
      </div>

      <div className="flex justify-end gap-2">
        <Button type="submit" disabled={pending}>
          {pending ? "Salvando…" : "Salvar card"}
        </Button>
      </div>
    </form>
  );
}
