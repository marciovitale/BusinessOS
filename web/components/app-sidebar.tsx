import { ScrollArea } from "@/components/ui/scroll-area";
import { SidebarNav } from "@/components/sidebar-nav";
import { MobileSidebar } from "@/components/mobile-sidebar";
import { UserFooter } from "@/components/user-footer";
import { ThemeToggle } from "@/components/theme-toggle";
import { getPillars } from "@/lib/content";
import { getIsPlatformAdmin } from "@/lib/organization";
import { auth0 } from "@/lib/auth0";

// Navegação lateral persistente, agrupada pelos 4 pilares. A marca do
// produto (logo da org + BusinessOS) mora no `AppHeader` fixo acima, não
// mais aqui — evita duplicar a mesma identidade em dois lugares.
// Server Component (lê getPillars); o destaque do item ativo é client (NavLink).
export async function AppSidebar() {
  const [pillars, session, isPlatformAdmin] = await Promise.all([
    getPillars(),
    auth0.getSession(),
    getIsPlatformAdmin(),
  ]);
  const user = session?.user;

  return (
    <>
      {/* Desktop */}
      <aside className="sticky top-14 hidden h-[calc(100vh-3.5rem)] w-72 shrink-0 flex-col border-r border-border bg-background/80 p-3 backdrop-blur-xl md:flex">
        <ScrollArea className="flex-1 pt-3">
          <div className="pb-6">
            <SidebarNav pillars={pillars} isPlatformAdmin={isPlatformAdmin} />
          </div>
        </ScrollArea>
        <div className="flex items-center gap-2">
          <div className="min-w-0 flex-1">
            <UserFooter user={user} />
          </div>
          <ThemeToggle />
        </div>
      </aside>

      {/* Mobile */}
      <MobileSidebar pillars={pillars} user={user} isPlatformAdmin={isPlatformAdmin} />
    </>
  );
}
