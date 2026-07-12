import Link from "next/link";
import { ArrowRight, ChevronRight } from "lucide-react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { buttonVariants } from "@/components/ui/button";
import { StatusBadge } from "@/components/status-badge";
import { PageHeader } from "@/components/page-header";
import { RecentCardRow } from "@/components/recent-card-row";
import { ContextLintPanel } from "@/components/context-lint-panel";
import { EmptyState } from "@/components/empty-state";
import { getAllCards, getPillars } from "@/lib/content";
import { getActiveOrganizationId } from "@/lib/organization";

export default async function Home() {
  const organizationId = await getActiveOrganizationId();

  // Login bem-sucedido, mas nenhum convite foi aceito ainda: não há
  // organização ativa para carregar cards/pilares — mostra estado amigável
  // em vez das 4 colunas de pilares vazias sem contexto.
  if (!organizationId) {
    return (
      <div className="mx-auto flex max-w-[1500px] flex-col gap-10 p-5 md:p-8 lg:p-10">
        <PageHeader
          title="Visão geral"
          description="Como está seu negócio hoje e por onde continuar."
        />
        <EmptyState
          title="Você ainda não faz parte de nenhuma organização"
          description="Peça para um administrador (owner da organização ou administrador da plataforma) te convidar pelo seu e-mail de login. Assim que o convite for aceito no próximo login, seu BusinessOS aparece aqui."
        />
      </div>
    );
  }

  const [pillars, all] = await Promise.all([getPillars(), getAllCards()]);
  const totalCards = all.length;
  const isEmpty = totalCards === 0;

  const recent = [...all]
    .sort(
      (a, b) => b.updated.localeCompare(a.updated) || a.title.localeCompare(b.title),
    )
    .slice(0, 4);

  return (
    <div className="mx-auto flex max-w-[1500px] flex-col gap-10 p-5 md:p-8 lg:p-10">
      <PageHeader
        title="Visão geral"
        description="Como está seu negócio hoje e por onde continuar."
        count={totalCards}
      />

      {isEmpty ? (
        <Card className="rounded-xl border-dashed">
          <CardContent className="flex flex-col items-start gap-3 py-6">
            <p className="text-sm text-muted-foreground">
              Você ainda não tem nenhum card. Comece pelo pilar{" "}
              <span className="font-medium text-foreground">Founder</span> —
              defina seu objetivo e o estilo de vida que o negócio precisa
              sustentar.
            </p>
            <Link
              href="/founder/objetivo"
              className={buttonVariants({ size: "sm" })}
            >
              Começar pelo Objetivo
              <ArrowRight className="size-4" strokeWidth={1.75} />
            </Link>
          </CardContent>
        </Card>
      ) : null}

      {/* Resumo dos 4 pilares */}
      <section className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        {pillars.map((pillar) => {
          const total = pillar.pages.reduce((sum, p) => sum + p.count, 0);
          return (
            <Card key={pillar.slug} className="gap-4 rounded-xl">
              <CardHeader className="gap-1">
                <div className="flex items-center justify-between gap-2">
                  <h2 className="text-lg font-semibold tracking-tight text-foreground">
                    {pillar.title}
                  </h2>
                  <span className="rounded-md bg-muted px-2 py-0.5 text-xs font-medium text-muted-foreground">
                    {total} {total === 1 ? "card" : "cards"}
                  </span>
                </div>
                {pillar.description ? (
                  <p className="text-sm text-muted-foreground">
                    {pillar.description}
                  </p>
                ) : null}
              </CardHeader>
              <CardContent className="flex flex-col gap-1">
                {pillar.pages.map((page) => (
                  <Link
                    key={page.route}
                    href={page.route}
                    className="group flex items-center justify-between gap-2 rounded-lg px-3 py-2 transition-colors hover:bg-muted"
                  >
                    <span className="flex min-w-0 items-center gap-2">
                      <span className="truncate text-sm text-foreground">
                        {page.title}
                      </span>
                      <span className="shrink-0 text-xs text-muted-foreground">
                        {page.count > 0
                          ? `${page.count} ${page.count === 1 ? "card" : "cards"}`
                          : "vazio"}
                      </span>
                    </span>
                    <span className="flex shrink-0 items-center gap-2">
                      <StatusBadge status={page.status} />
                      <ChevronRight
                        className="size-4 text-muted-foreground transition-transform group-hover:translate-x-0.5"
                        strokeWidth={1.75}
                      />
                    </span>
                  </Link>
                ))}
              </CardContent>
            </Card>
          );
        })}
      </section>

      <ContextLintPanel />

      {/* Continue de onde parou */}
      {recent.length > 0 ? (
        <section className="flex flex-col gap-3">
          <h2 className="text-sm font-medium uppercase tracking-wide text-muted-foreground">
            Continue de onde parou
          </h2>
          <div className="flex flex-col gap-2">
            {recent.map((card) => (
              <RecentCardRow key={`${card.pillar}/${card.page}/${card.id}`} card={card} />
            ))}
          </div>
        </section>
      ) : null}
    </div>
  );
}
