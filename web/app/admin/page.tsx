import { notFound } from "next/navigation";
import { ShieldCheck } from "lucide-react";
import { PageHeader } from "@/components/page-header";
import { EmptyState } from "@/components/empty-state";
import { NewOrganizationForm } from "@/components/new-organization-form";
import { OrganizationCard } from "@/components/organization-card";
import { getIsPlatformAdmin } from "@/lib/organization";
import { listOrganizations } from "@/lib/admin";

// Transcrição (áudio/vídeo) e descrição de imagem por IA, disparadas por
// `uploadAndIngestFile` a partir do formulário desta página, podem levar
// mais que os ~10s padrão de uma função serverless na Vercel. `maxDuration`
// só é válido em arquivos de rota (não no arquivo "use server" da action em
// si) — por isso mora aqui.
export const maxDuration = 60;

// Área de administrador de plataforma. Não expõe a existência da rota para
// quem não é platform admin — 404 em vez de redirect com aviso.
export default async function AdminPage() {
  const isAdmin = await getIsPlatformAdmin();
  if (!isAdmin) notFound();

  const organizations = await listOrganizations();

  return (
    <div className="mx-auto flex max-w-6xl flex-col gap-8 p-6 md:p-8">
      <div className="flex flex-col gap-4">
        <span className="flex w-fit items-center gap-1.5 rounded-full bg-primary px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.16em] text-primary-foreground">
          <ShieldCheck className="size-3.5" strokeWidth={2} />
          Platform Admin
        </span>
        <PageHeader
          title="Admin"
          description="Organizações da plataforma. Crie uma organização, convide os membros iniciais e suba arquivos para o repositório (RAG) dela."
          count={organizations.length}
          actions={<NewOrganizationForm />}
        />
      </div>

      {organizations.length === 0 ? (
        <EmptyState
          title="Nenhuma organização ainda"
          description='Clique em "Nova organização" para criar a primeira.'
        />
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {organizations.map((org) => (
            <OrganizationCard key={org.id} org={org} />
          ))}
        </div>
      )}
    </div>
  );
}
