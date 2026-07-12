"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";
import type { PageDef, PageSummary } from "@/lib/types";

// Forma estrutural mínima aceita pelo NavGroup — cobre PillarDef/PillarSummary
// (pilares de negócio) e também grupos avulsos como "Sistema".
type NavGroupSection = {
  title: string;
  pages: (PageDef | PageSummary)[];
};

// Um link de navegação com destaque de item ativo (usePathname).
export function NavLink({
  href,
  label,
  count,
  onNavigate,
}: {
  href: string;
  label: string;
  count?: number;
  onNavigate?: () => void;
}) {
  const pathname = usePathname();
  const active = pathname === href;
  return (
    <Link
      href={href}
      onClick={onNavigate}
      aria-current={active ? "page" : undefined}
      className={cn(
        "flex items-center justify-between gap-2 rounded-full px-3 py-2 text-sm transition-colors",
        "hover:bg-sidebar-hover hover:text-sidebar-hover-foreground",
        active
          ? "bg-foreground font-medium text-background"
          : "text-muted-foreground",
      )}
    >
      <span className="truncate">{label}</span>
      {typeof count === "number" && count > 0 ? (
        <span className="shrink-0 text-xs tabular-nums text-muted-foreground">
          {count}
        </span>
      ) : null}
    </Link>
  );
}

// Um grupo de pilar: heading clicável (sanfona) + lista de páginas.
// Abre sozinho quando a rota ativa pertence ao pilar; alternável manualmente.
export function NavGroup({
  pillar,
  onNavigate,
}: {
  pillar: NavGroupSection;
  onNavigate?: () => void;
}) {
  const pathname = usePathname();
  const hasActivePage = pillar.pages.some((page) => page.route === pathname);
  const [open, setOpen] = useState(hasActivePage);

  useEffect(() => {
    if (hasActivePage) setOpen(true);
  }, [hasActivePage]);

  return (
    <div className="flex flex-col gap-1">
      <button
        type="button"
        onClick={() => setOpen((prev) => !prev)}
        aria-expanded={open}
        className="flex w-full items-center gap-1 rounded-lg px-3 pb-1 pt-5 text-[10px] font-medium uppercase tracking-[0.18em] text-muted-foreground/70 transition-colors hover:text-foreground"
      >
        <ChevronRight
          className={cn(
            "size-3.5 shrink-0 transition-transform",
            open && "rotate-90",
          )}
          strokeWidth={2}
        />
        <span className="truncate">{pillar.title}</span>
      </button>
      {open ? (
        <ul className="flex flex-col gap-0.5 pl-5">
          {pillar.pages.map((page) => {
            const count = (page as PageSummary).count;
            return (
              <li key={page.route}>
                <NavLink
                  href={page.route}
                  label={page.title}
                  count={typeof count === "number" ? count : undefined}
                  onNavigate={onNavigate}
                />
              </li>
            );
          })}
        </ul>
      ) : null}
    </div>
  );
}
