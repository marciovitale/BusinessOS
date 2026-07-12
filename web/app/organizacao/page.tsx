import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { PageHeader } from "@/components/page-header";
import { EmptyState } from "@/components/empty-state";
import { InviteMemberForm } from "@/components/invite-member-form";
import { RevokeInviteButton } from "@/components/revoke-invite-button";
import { RemoveMemberButton } from "@/components/remove-member-button";
import {
  getActiveOrganizationId,
  getCurrentUserId,
  isOrgOwner,
} from "@/lib/organization";
import {
  getOrganizationName,
  listOrgMembers,
  listPendingInvites,
} from "@/lib/organization-members";

export default async function OrganizacaoPage() {
  const organizationId = await getActiveOrganizationId();

  if (!organizationId) {
    return (
      <div className="mx-auto flex max-w-4xl flex-col gap-8 p-6 md:p-8">
        <PageHeader
          title="Organização"
          description="Membros e convites da sua organização."
        />
        <EmptyState
          title="Você ainda não faz parte de nenhuma organização"
          description="Peça para um administrador te convidar pelo seu e-mail de login."
        />
      </div>
    );
  }

  const [currentUserId, owner, orgName, members] = await Promise.all([
    getCurrentUserId(),
    isOrgOwner(organizationId),
    getOrganizationName(organizationId),
    listOrgMembers(organizationId),
  ]);
  // RLS de `organization_invites` só deixa owner (ou platform admin) ler
  // convites pendentes — não busca à toa para membros comuns.
  const invites = owner ? await listPendingInvites(organizationId) : [];

  return (
    <div className="mx-auto flex max-w-4xl flex-col gap-8 p-6 md:p-8">
      <PageHeader
        title="Organização"
        description={
          orgName
            ? `Membros e convites de "${orgName}".`
            : "Membros e convites da sua organização."
        }
        count={members.length}
        actions={owner ? <InviteMemberForm organizationId={organizationId} /> : undefined}
      />

      <Card className="rounded-xl">
        <CardHeader>
          <h2 className="text-sm font-medium uppercase tracking-wide text-muted-foreground">
            Membros
          </h2>
        </CardHeader>
        <CardContent className="flex flex-col gap-1">
          {members.map((m) => (
            <div
              key={m.id}
              className="flex items-center justify-between gap-3 rounded-lg px-3 py-2 hover:bg-muted"
            >
              <div className="min-w-0">
                <p className="truncate text-sm text-foreground">{m.name}</p>
                {m.email ? (
                  <p className="truncate text-xs text-muted-foreground">{m.email}</p>
                ) : null}
              </div>
              <div className="flex shrink-0 items-center gap-2">
                <Badge variant={m.role === "owner" ? "default" : "outline"}>
                  {m.role === "owner" ? "Owner" : "Member"}
                </Badge>
                {owner && m.userId !== currentUserId ? (
                  <RemoveMemberButton
                    organizationId={organizationId}
                    userId={m.userId}
                    name={m.name}
                  />
                ) : null}
              </div>
            </div>
          ))}
        </CardContent>
      </Card>

      {owner ? (
        <Card className="rounded-xl">
          <CardHeader>
            <h2 className="text-sm font-medium uppercase tracking-wide text-muted-foreground">
              Convites pendentes
            </h2>
          </CardHeader>
          <CardContent className="flex flex-col gap-1">
            {invites.length === 0 ? (
              <p className="px-3 py-2 text-sm italic text-muted-foreground/70">
                Nenhum convite pendente.
              </p>
            ) : (
              invites.map((inv) => (
                <div
                  key={inv.id}
                  className="flex items-center justify-between gap-3 rounded-lg px-3 py-2 hover:bg-muted"
                >
                  <div className="min-w-0">
                    <p className="truncate text-sm text-foreground">{inv.email}</p>
                    <p className="text-xs text-muted-foreground">
                      Convidado em {inv.createdAt.slice(0, 10)}
                    </p>
                  </div>
                  <div className="flex shrink-0 items-center gap-2">
                    <Badge variant="outline">
                      {inv.role === "owner" ? "Owner" : "Member"}
                    </Badge>
                    <RevokeInviteButton inviteId={inv.id} email={inv.email} />
                  </div>
                </div>
              ))
            )}
          </CardContent>
        </Card>
      ) : null}
    </div>
  );
}
