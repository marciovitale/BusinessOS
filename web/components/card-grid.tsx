import type { ReactNode } from "react";
import { ContentCard } from "@/components/content-card";
import { EmptyState } from "@/components/empty-state";
import { cn } from "@/lib/utils";
import type { Card } from "@/lib/types";

export function CardGrid({
  cards,
  view = "grid",
  empty,
}: {
  cards: Card[];
  view?: "grid" | "list";
  empty?: ReactNode;
}) {
  if (cards.length === 0) {
    return <>{empty ?? <EmptyState title="Nenhum card ainda" />}</>;
  }

  return (
    <div
      className={cn(
        view === "grid"
          ? "grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3"
          : "flex flex-col gap-2",
      )}
    >
      {cards.map((c) => (
        <ContentCard key={c.id} card={c} view={view} />
      ))}
    </div>
  );
}
