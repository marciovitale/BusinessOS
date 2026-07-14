import { notFound } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, FileText } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { EmptyState } from "@/components/empty-state";
import { InviteMemberForm } from "@/components/invite-member-form";
import { RevokeInviteButton } from "@/components/revoke-invite-button";
import { RemoveMemberButton } from "@/components/remove-member-button";
import { AddOrganizationFiles } from "@/components/add-organization-files";
import { ChangeOrganizationLogo } from "@/components/change-organization-logo";
import { FileActiveToggle } from "@/components/file-active-toggle";
import { DeleteFileButton } from "@/components/delete-file-button";
import { DownloadFileButton } from "@/components/download-file-button";
import { getCurrentUserId, getIsPlatformAdmin } from "@/lib/organization";
import { listOrgMembers, listPendingInvites } from "@/lib/organization-members";
import { getOrganizationBrand } from "@/lib/organization-logo";
import { listOrganizationFiles, type OrganizationFile } from "@/lib/organization-files";

// Ver nota equivalente em app/admin/page.tsx: transcrição/descrição por IA
// pode passar do timeout padrão de uma função serverless na Vercel.
export const maxDuration = 60;

function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

const FILE_STATUS_LABEL: Record<OrganizationFile["status"], string> = {
  pending: "Pendente",
  processing: "Processando",
  ready: "Pronto",
  failed: "Falhou",
};

function FileStatusBadge({ status }: { status: OrganizationFile["status"] }) {
  if (status === "ready") return <Badge>{FILE_STATUS_LABEL[status]}</Badge>;
  if (status === "failed") return <Badge variant="destructive">{FILE_STATUS_LABEL[status]}</Badge>;
  return <Badge variant="outline">{FILE_STATUS_LABEL[status]}</Badge>;
}

// Detalhe de UMA organização, visível só para platform admin — mesma regra
// de acesso de `/admin`. Mostra membros, convites pendentes e o repositório
// (RAG) da organização, com as mesmas ações já usadas em `/organizacao`
// (convidar/revogar/remover), aqui parametrizadas pelo id da rota em vez da
// "organização ativa" do usuário logado.
export default async function AdminOrganizationPage({
  params,
}: {
  params: Promise<{ organizationId: string }>;
}) {
  const isAdmin = await getIsPlatformAdmin();
  if (!isAdmin) notFound();

  const { organizationId } = await params;

  const [currentUserId, brand, members, files] = await Promise.all([
    getCurrentUserId(),
    getOrganizationBrand(organizationId),
    listOrgMembers(organizationId),
    listOrganizationFiles(organizationId),
  ]);

  if (!brand) notFound();

  // Platform admin sempre pode ler/gerenciar convites de qualquer org (RLS:
  // is_org_owner OR is_platform_admin) — diferente de /organizacao, aqui não
  // depende de ser owner.
  const invites = await listPendingInvites(organizationId);

  return (
    <div className="mx-auto flex max-w-4xl flex-col gap-8 p-6 md:p-8">
      <Link
        href="/admin"
        className="flex w-fit items-center gap-1.5 text-xs uppercase tracking-[0.16em] text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft className="size-3.5" strokeWidth={1.75} />
        Todas as organizações
      </Link>

      <div className="flex flex-col gap-4 border-b border-border pb-8 sm:flex-row sm:items-end sm:justify-between">
        <div className="flex items-center gap-4">
          <ChangeOrganizationLogo organizationId={organizationId} currentLogoUrl={brand.logoUrl} />
          <div>
            <h1 className="text-4xl font-normal uppercase leading-[.92] tracking-[-0.055em] text-foreground sm:text-6xl">
              {brand.name}
            </h1>
            <p className="mt-4 max-w-xl text-sm leading-relaxed text-muted-foreground">
              Membros, convites e repositório (RAG) desta organização.
            </p>
          </div>
        </div>
        <div className="flex shrink-0 items-center gap-2">
          <InviteMemberForm organizationId={organizationId} />
        </div>
      </div>

      <Card className="rounded-xl">
        <CardHeader>
          <h2 className="text-sm font-medium uppercase tracking-wide text-muted-foreground">
            Membros
          </h2>
        </CardHeader>
        <CardContent className="flex flex-col gap-1">
          {members.length === 0 ? (
            <p className="px-3 py-2 text-sm italic text-muted-foreground/70">
              Nenhum membro ainda — os convites pendentes abaixo viram membros no primeiro login.
            </p>
          ) : (
            members.map((m) => (
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
                  {m.userId !== currentUserId ? (
                    <RemoveMemberButton
                      organizationId={organizationId}
                      userId={m.userId}
                      name={m.name}
                    />
                  ) : null}
                </div>
              </div>
            ))
          )}
        </CardContent>
      </Card>

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
                  <Badge variant="outline">{inv.role === "owner" ? "Owner" : "Member"}</Badge>
                  <RevokeInviteButton inviteId={inv.id} email={inv.email} />
                </div>
              </div>
            ))
          )}
        </CardContent>
      </Card>

      <Card className="rounded-xl">
        <CardHeader>
          <h2 className="text-sm font-medium uppercase tracking-wide text-muted-foreground">
            Repositório (RAG)
          </h2>
        </CardHeader>
        <CardContent className="flex flex-col gap-4">
          {files.length === 0 ? (
            <EmptyState
              title="Nenhum arquivo ainda"
              description="Suba arquivos abaixo para alimentar o contexto de IA desta organização."
            />
          ) : (
            <div className="flex flex-col gap-1">
              {files.map((f) => (
                <div
                  key={f.id}
                  className="flex items-center justify-between gap-3 rounded-lg px-3 py-2 hover:bg-muted"
                >
                  <div className="flex min-w-0 items-center gap-2">
                    <FileText className="size-4 shrink-0 text-muted-foreground" strokeWidth={1.75} />
                    <div className="min-w-0">
                      <p className="truncate text-sm text-foreground">{f.name}</p>
                      <p className="truncate text-xs text-muted-foreground">
                        {formatBytes(f.sizeBytes)} · {f.createdAt.slice(0, 10)}
                        {f.status === "ready" ? ` · ${f.chunkCount} chunks` : ""}
                        {f.status === "failed" && f.errorMessage ? ` · ${f.errorMessage}` : ""}
                      </p>
                    </div>
                  </div>
                  <div className="flex shrink-0 items-center gap-2">
                    <FileStatusBadge status={f.status} />
                    <FileActiveToggle
                      fileId={f.id}
                      organizationId={organizationId}
                      isActive={f.isActive}
                      name={f.name}
                    />
                    <DownloadFileButton fileId={f.id} organizationId={organizationId} name={f.name} />
                    <DeleteFileButton fileId={f.id} organizationId={organizationId} name={f.name} />
                  </div>
                </div>
              ))}
            </div>
          )}

          <AddOrganizationFiles organizationId={organizationId} />
        </CardContent>
      </Card>
    </div>
  );
}
