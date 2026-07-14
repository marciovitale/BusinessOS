import { PageHeader } from "@/components/page-header";
import { AgentEditorCard } from "@/components/agent-editor-card";
import { NewAgentButton } from "@/components/new-agent-button";
import { ViewToggle } from "@/components/view-toggle";
import { listAgents } from "@/lib/agents";
import {
  getActiveOrganizationId,
  getCurrentUserId,
  isOrgOwner,
} from "@/lib/organization";
import { cn } from "@/lib/utils";

export default async function AgentsPage({
  searchParams,
}: {
  searchParams: Promise<{ view?: string }>;
}) {
  const { view } = await searchParams;
  const mode = view === "list" ? "list" : "grid";
  const [agents, currentUserId, organizationId] = await Promise.all([
    listAgents(),
    getCurrentUserId(),
    getActiveOrganizationId(),
  ]);
  const owner = await isOrgOwner(organizationId);

  return (
    <div className="mx-auto flex max-w-6xl flex-col gap-8 p-6 md:p-8">
      <PageHeader
        title="Agentes"
        description="Os agentes de IA especializados que ajudam a preencher e revisar o AI2 - Business OS. Edite o nome e o system prompt de cada um e salve individualmente."
        count={agents.length}
        actions={
          <>
            <ViewToggle value={mode} />
            <NewAgentButton existingIds={agents.map((a) => a.id)} />
          </>
        }
      />

      <div
        className={cn(
          mode === "grid"
            ? "grid grid-cols-1 gap-4 lg:grid-cols-2"
            : "flex flex-col gap-4",
        )}
      >
        {agents.map((agent) => (
          <AgentEditorCard
            key={agent.id}
            agent={agent}
            canManage={owner || agent.createdBy === currentUserId}
          />
        ))}
      </div>
    </div>
  );
}
