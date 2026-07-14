"use client";

import { useState } from "react";
import { Menu, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { SidebarNav } from "@/components/sidebar-nav";
import { UserFooter } from "@/components/user-footer";
import { ThemeToggle } from "@/components/theme-toggle";
import type { PillarSummary } from "@/lib/types";

// Responsividade: em telas estreitas a sidebar colapsa num drawer acionável.
// Fecha ao navegar (onNavigate) — sem efeitos que chamem setState.
export function MobileSidebar({
  pillars,
  user,
  isPlatformAdmin = false,
}: {
  pillars: PillarSummary[];
  user?: { name?: string; email?: string };
  isPlatformAdmin?: boolean;
}) {
  const [open, setOpen] = useState(false);

  return (
    <div className="md:hidden">
      {/* A marca (logo da org + BusinessOS) já aparece no AppHeader fixo
          acima; esta faixa só precisa do gatilho de abrir a navegação. */}
      <div className="flex items-center border-b border-border px-4 py-3">
        <Button
          variant="ghost"
          size="icon"
          aria-label="Abrir navegação"
          aria-expanded={open}
          onClick={() => setOpen(true)}
        >
          <Menu className="size-5" strokeWidth={1.75} />
        </Button>
      </div>

      {open ? (
        <div className="fixed inset-0 z-[60] flex">
          <button
            type="button"
            aria-label="Fechar navegação"
            className="absolute inset-0 bg-foreground/20"
            onClick={() => setOpen(false)}
          />
          <aside className="relative z-10 flex h-full w-64 flex-col border-r border-border bg-background">
            <div className="flex items-center justify-between px-4 py-3">
              <span className="text-sm font-semibold">AI2 - Business OS</span>
              <Button
                variant="ghost"
                size="icon"
                aria-label="Fechar navegação"
                onClick={() => setOpen(false)}
              >
                <X className="size-5" strokeWidth={1.75} />
              </Button>
            </div>
            <div className="flex-1 overflow-y-auto px-2 pb-6">
              <SidebarNav
                pillars={pillars}
                isPlatformAdmin={isPlatformAdmin}
                onNavigate={() => setOpen(false)}
              />
            </div>
            <div className="flex items-center gap-2 px-2 pb-3">
              <div className="min-w-0 flex-1">
                <UserFooter user={user} />
              </div>
              <ThemeToggle />
            </div>
          </aside>
        </div>
      ) : null}
    </div>
  );
}
