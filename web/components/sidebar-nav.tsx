import { NavGroup, NavLink } from "@/components/nav-group";
import type { PillarSummary } from "@/lib/types";

// Grupo avulso (fora dos 4 pilares de negócio) com as páginas de sistema do BusinessOS.
const SYSTEM_GROUP = {
  title: "Sistema",
  pages: [{ slug: "agentes", title: "Agentes", route: "/agentes" }],
};

// Conteúdo compartilhado da navegação (desktop + drawer mobile).
// Sem "use client" e sem imports server-only: renderiza em ambos os contextos.
export function SidebarNav({
  pillars,
  onNavigate,
}: {
  pillars: PillarSummary[];
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
      <NavGroup pillar={SYSTEM_GROUP} onNavigate={onNavigate} />
    </nav>
  );
}
