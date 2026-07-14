import Image from "next/image";
import Link from "next/link";
import { Sparkle } from "lucide-react";
import { getActiveOrganizationBrand } from "@/lib/organization-logo";

// Header fixo no topo do app inteiro, acima da sidebar + conteúdo. Mostra o
// logo da organização ATIVA do usuário logado (a que veio carregada no
// card dela em /admin) ao lado da marca do produto. Respeita a hierarquia de
// identificação: só existe "logo de organização" quando o usuário logado
// tem uma organização ativa de fato (RLS/`getActiveOrganizationId`) — sem
// isso (ex.: platform admin sem vínculo, ou membro aguardando convite), cai
// no selo genérico do produto, sem inventar identidade de organização.
export async function AppHeader() {
  const brand = await getActiveOrganizationBrand();

  return (
    <header className="fixed inset-x-0 top-0 z-50 flex h-14 items-center gap-3 border-b border-border bg-background/80 px-4 backdrop-blur-xl md:px-6">
      <Link href="/" className="flex min-w-0 items-center gap-3">
        {brand?.logoUrl ? (
          <Image
            src={brand.logoUrl}
            alt={brand.name}
            width={32}
            height={32}
            unoptimized
            className="size-8 shrink-0 rounded-lg object-cover"
          />
        ) : (
          <span className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-primary text-primary-foreground">
            <Sparkle className="size-4" strokeWidth={2} />
          </span>
        )}

        {brand ? (
          <>
            <span className="truncate text-sm font-medium text-foreground">{brand.name}</span>
            <span className="h-4 w-px shrink-0 bg-border" />
          </>
        ) : null}

        <span className="truncate text-sm font-semibold uppercase tracking-[-0.02em] text-foreground">
          AI2 <span className="text-muted-foreground">·</span> Business OS
        </span>
      </Link>
    </header>
  );
}
