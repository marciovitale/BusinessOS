import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { StatusBadge } from "@/components/status-badge";
import { cn } from "@/lib/utils";
import type { Card as CardModel } from "@/lib/types";

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

// Renderiza um Card. O layout muda por `view`:
// - grid: título + badge + preview de ~3 linhas + tags + updated
// - list: linha compacta (título/preview à esquerda, badge/updated à direita)
export function ContentCard({
  card,
  view = "grid",
}: {
  card: CardModel;
  view?: "grid" | "list";
}) {
  if (view === "list") {
    return (
      <Card className="flex-row items-center justify-between gap-4 rounded-xl px-4 py-3">
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <h3 className="truncate text-sm font-medium text-foreground">
              {card.title}
            </h3>
          </div>
          {card.body ? (
            <p className="mt-0.5 truncate text-sm text-muted-foreground">
              {card.body}
            </p>
          ) : null}
        </div>
        <div className="flex shrink-0 items-center gap-3">
          <StatusBadge status={card.status} />
          <time className="hidden text-xs text-muted-foreground sm:block">
            {card.updated}
          </time>
        </div>
      </Card>
    );
  }

  return (
    <Card className="gap-3 rounded-xl">
      <CardHeader className="gap-2">
        <div className="flex items-start justify-between gap-2">
          <h3 className="text-base font-medium leading-snug text-foreground">
            {card.title}
          </h3>
          <StatusBadge status={card.status} />
        </div>
      </CardHeader>
      <CardContent className="flex flex-col gap-3">
        {card.body ? (
          <p
            className={cn(
              "text-sm text-muted-foreground",
              "line-clamp-3 whitespace-pre-line",
            )}
          >
            {card.body}
          </p>
        ) : (
          <p className="text-sm italic text-muted-foreground/70">
            Sem conteúdo ainda.
          </p>
        )}
        <Tags tags={card.tags} />
        <time className="text-xs text-muted-foreground">
          Atualizado em {card.updated}
        </time>
      </CardContent>
    </Card>
  );
}
