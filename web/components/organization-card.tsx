import Link from "next/link";
import { Users, FileText } from "lucide-react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import type { OrganizationSummary } from "@/lib/admin";

// Card de organização na grade de `/admin`. Link para a página de detalhe
// (`/admin/[organizationId]`) — mesmo padrão visual de
// `components/content-card.tsx` (rounded-2xl, título grande, metadados em
// rodapé), com hover sutil indicando que é clicável.
export function OrganizationCard({ org }: { org: OrganizationSummary }) {
  return (
    <Link href={`/admin/${org.id}`} className="block">
      <Card className="group min-h-52 gap-3 rounded-2xl transition-colors hover:border-foreground/30">
        <CardHeader className="gap-2">
          <div className="min-w-0">
            <h3 className="truncate text-xl font-normal leading-tight tracking-[-0.025em] text-foreground">
              {org.name}
            </h3>
            <p className="truncate text-xs text-muted-foreground">/{org.slug}</p>
          </div>
        </CardHeader>
        <CardContent className="flex flex-col gap-3">
          {org.description ? (
            <p className="line-clamp-3 text-sm text-muted-foreground">{org.description}</p>
          ) : (
            <p className="text-sm italic text-muted-foreground/70">Sem descrição ainda.</p>
          )}

          <div className="mt-auto flex items-center justify-between gap-3 border-t border-border pt-3 text-[10px] uppercase tracking-[0.16em] text-muted-foreground">
            <div className="flex items-center gap-3">
              <span className="flex items-center gap-1">
                <Users className="size-3.5" strokeWidth={1.75} />
                {org.memberCount}
              </span>
              <span className="flex items-center gap-1">
                <FileText className="size-3.5" strokeWidth={1.75} />
                {org.fileCount}
              </span>
            </div>
            <time>{org.createdAt.slice(0, 10)}</time>
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}
