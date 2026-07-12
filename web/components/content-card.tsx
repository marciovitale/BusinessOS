import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { StatusBadge } from "@/components/status-badge";
import { CardActions } from "@/components/card-actions";
import { Markdown } from "@/components/markdown";
import type { Card as CardModel, PillarSlug } from "@/lib/types";

function Tags({ tags }: { tags: string[] }) {
  if (!tags.length) return null;
  return (
    <div className="flex flex-wrap gap-1.5">
      {tags.map((t) => (
        <span
          key={t}
          className="rounded-md bg-muted px-1.5 py-0.5 text-xs text-muted-foreground"
        >
          #{t}
        </span>
      ))}
    </div>
  );
}

// Reduz Markdown a texto plano para o preview de UMA linha (modo lista).
function toPlainText(md: string): string {
  return md
    .replace(/`{1,3}[^`]*`{1,3}/g, " ") // code spans/blocks
    .replace(/!?\[([^\]]*)\]\([^)]*\)/g, "$1") // links/imagens -> texto
    .replace(/[*_~>#-]+/g, " ") // ênfase/headings/listas/citações
    .replace(/\s+/g, " ")
    .trim();
}

// Renderiza um Card. O layout muda por `view`:
// - grid: título + badge + preview de Markdown real (truncado) + tags + updated
// - list: linha compacta (título/preview à esquerda, badge/updated/ações à direita)
//
// Compat: `card` e `view` mantêm a assinatura pública original. `pillar`/`page`
// são props OPCIONAIS aditivas — quando ambas presentes E `canManage` é `true`,
// o card exibe as ações de editar/excluir (CardActions). Sem elas, o card é
// puramente apresentacional (ex.: stories), como antes.
//
// `canManage` é resolvido no Server Component pai (quem criou o card OU é
// owner da organização ativa) e chega aqui como prop simples — este
// componente não decide autorização, só respeita o que recebeu.
export function ContentCard({
  card,
  view = "grid",
  pillar,
  page,
  canManage = false,
}: {
  card: CardModel;
  view?: "grid" | "list";
  pillar?: PillarSlug;
  page?: string;
  canManage?: boolean;
}) {
  const showActions = Boolean(pillar && page && canManage);

  if (view === "list") {
    return (
      <Card className="flex-row items-center justify-between gap-4 rounded-2xl px-5 py-4">
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <h3 className="truncate text-base font-normal text-foreground">
              {card.title}
            </h3>
          </div>
          {card.body ? (
            <p className="mt-0.5 truncate text-sm text-muted-foreground">
              {toPlainText(card.body)}
            </p>
          ) : null}
        </div>
        <div className="flex shrink-0 items-center gap-3">
          <StatusBadge status={card.status} />
          <time className="hidden text-xs text-muted-foreground sm:block">
            {card.updated}
          </time>
          {showActions ? (
            <CardActions card={card} pillar={pillar!} page={page!} />
          ) : null}
        </div>
      </Card>
    );
  }

  return (
    <Card className="group min-h-64 gap-3 rounded-2xl">
      <CardHeader className="gap-2">
        <div className="flex items-start justify-between gap-2">
          <h3 className="max-w-[85%] text-xl font-normal leading-tight tracking-[-0.025em] text-foreground">
            {card.title}
          </h3>
          <div className="flex shrink-0 items-center gap-1">
            <StatusBadge status={card.status} />
            {showActions ? (
              <CardActions card={card} pillar={pillar!} page={page!} />
            ) : null}
          </div>
        </div>
      </CardHeader>
      <CardContent className="flex flex-col gap-3">
        {card.body ? (
          <div className="relative max-h-32 overflow-hidden">
            <Markdown>{card.body}</Markdown>
            {/* Fade de truncamento coerente com o fundo do card. */}
            <div className="pointer-events-none absolute inset-x-0 bottom-0 h-8 bg-gradient-to-t from-card to-transparent" />
          </div>
        ) : (
          <p className="text-sm italic text-muted-foreground/70">
            Sem conteúdo ainda.
          </p>
        )}
        <Tags tags={card.tags} />
        <time className="mt-auto border-t border-border pt-3 text-[10px] uppercase tracking-[0.16em] text-muted-foreground">
          Atualizado · {card.updated}
        </time>
      </CardContent>
    </Card>
  );
}
