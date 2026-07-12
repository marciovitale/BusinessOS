import { notFound } from "next/navigation";
import { PageHeader } from "@/components/page-header";
import { CardGrid } from "@/components/card-grid";
import { EmptyState } from "@/components/empty-state";
import { ViewToggle } from "@/components/view-toggle";
import { NewCardButton } from "@/components/new-card";
import { getCards } from "@/lib/content";
import { findPage } from "@/lib/pillars";
import { getSuggestions } from "@/lib/suggestions";
import {
  getActiveOrganizationId,
  getCurrentUserId,
  isOrgOwner,
} from "@/lib/organization";
import type { PillarSlug } from "@/lib/types";

// Composição reusável usada por cada page.tsx (thin wrapper).
export async function PageView({
  pillar,
  page,
  view,
}: {
  pillar: PillarSlug;
  page: string;
  view?: "grid" | "list";
}) {
  const { page: def } = findPage(pillar, page);
  if (!def) notFound();

  const mode = view === "list" ? "list" : "grid";
  const [cards, currentUserId, organizationId] = await Promise.all([
    getCards(pillar, page),
    getCurrentUserId(),
    getActiveOrganizationId(),
  ]);
  const owner = await isOrgOwner(organizationId);
  const suggestions = getSuggestions(pillar, page);

  return (
    <div className="mx-auto flex max-w-[1500px] flex-col gap-8 p-5 md:p-8 lg:p-10">
      <PageHeader
        title={def.title}
        description={def.description}
        count={cards.length}
        actions={
          <>
            <ViewToggle value={mode} />
            <NewCardButton pillar={pillar} page={page} />
          </>
        }
      />

      <CardGrid
        cards={cards}
        view={mode}
        pillar={pillar}
        page={page}
        currentUserId={currentUserId}
        isOrgOwner={owner}
        empty={
          <EmptyState
            title={`Comece a preencher “${def.title}”`}
            description={def.description}
            suggestions={suggestions}
            action={
              <NewCardButton
                pillar={pillar}
                page={page}
                label="Criar primeiro card"
              />
            }
          />
        }
      />
    </div>
  );
}
