import { NavGroup, NavLink } from "@/components/nav-group";
import type { PillarSummary } from "@/lib/types";

// Grupo avulso (fora dos 4 pilares de negócio) com as páginas de sistema do BusinessOS.
// "Admin" só entra quando o usuário logado é platform admin (ver `isPlatformAdmin`).
function buildSystemGroup(isPlatformAdmin: boolean) {
  return {
    title: "Sistema",
    pages: [
      { slug: "agentes", title: "Agentes", route: "/agentes" },
      { slug: "organizacao", title: "Organização", route: "/organizacao" },
      ...(isPlatformAdmin
        ? [{ slug: "admin", title: "Admin", route: "/admin" }]
        : []),
    ],
  };
}

// Conteúdo compartilhado da navegação (desktop + drawer mobile).
// Sem "use client" e sem imports server-only: renderiza em ambos os contextos.
export function SidebarNav({
  pillars,
  isPlatformAdmin = false,
  onNavigate,
}: {
  pillars: PillarSummary[];
  isPlatformAdmin?: boolean;
  onNavigate?: () => void;
}) {
  return (
    <nav className="flex flex-col gap-1 px-2">
      <div className="px-1 pb-2">
        <NavLink href="/" label="Visão geral" onNavigate={onNavigate} />
      </div>
      {pillars.map((pillar) => (
        <NavGroup key={pillar.slug} pillar={pillar} onNavigate={onNavigate} />
      ))}
      <NavGroup pillar={buildSystemGroup(isPlatformAdmin)} onNavigate={onNavigate} />
    </nav>
  );
}
