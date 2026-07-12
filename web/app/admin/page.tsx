import { notFound } from "next/navigation";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { PageHeader } from "@/components/page-header";
import { NewOrganizationForm } from "@/components/new-organization-form";
import { getIsPlatformAdmin } from "@/lib/organization";
import { listOrganizations } from "@/lib/admin";

// Área de administrador de plataforma. Não expõe a existência da rota para
// quem não é platform admin — 404 em vez de redirect com aviso.
export default async function AdminPage() {
  const isAdmin = await getIsPlatformAdmin();
  if (!isAdmin) notFound();

  const organizations = await listOrganizations();

  return (
    <div className="mx-auto flex max-w-4xl flex-col gap-8 p-6 md:p-8">
      <PageHeader
        title="Admin"
        description="Organizações da plataforma. Crie uma organização e convide o owner inicial — a pessoa vira owner assim que fizer login com esse e-mail."
        count={organizations.length}
        actions={<NewOrganizationForm />}
      />

      <Card className="rounded-xl">
        <CardHeader>
          <h2 className="text-sm font-medium uppercase tracking-wide text-muted-foreground">
            Organizações
          </h2>
        </CardHeader>
        <CardContent className="flex flex-col gap-1">
          {organizations.length === 0 ? (
            <p className="px-3 py-2 text-sm italic text-muted-foreground/70">
              Nenhuma organização ainda.
            </p>
          ) : (
            organizations.map((org) => (
              <div
                key={org.id}
                className="flex items-center justify-between gap-3 rounded-lg px-3 py-2 hover:bg-muted"
              >
                <div className="min-w-0">
                  <p className="truncate text-sm text-foreground">{org.name}</p>
                  <p className="truncate text-xs text-muted-foreground">
                    /{org.slug}
                  </p>
                </div>
                <div className="flex shrink-0 items-center gap-4 text-xs text-muted-foreground">
                  <span>
                    {org.memberCount} {org.memberCount === 1 ? "membro" : "membros"}
                  </span>
                  <time>{org.createdAt.slice(0, 10)}</time>
                </div>
              </div>
            ))
          )}
        </CardContent>
      </Card>
    </div>
  );
}
