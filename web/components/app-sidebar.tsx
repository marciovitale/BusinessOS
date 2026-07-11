import Link from "next/link";
import { Sparkles } from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { SidebarNav } from "@/components/sidebar-nav";
import { MobileSidebar } from "@/components/mobile-sidebar";
import { getPillars } from "@/lib/content";

function Brand() {
  return (
    <Link href="/" className="flex items-center gap-2 px-4 py-4 text-foreground">
      <span className="flex size-7 items-center justify-center rounded-lg bg-primary text-primary-foreground">
        <Sparkles className="size-4" strokeWidth={1.75} />
      </span>
      <span className="text-base font-semibold tracking-tight">BusinessOS</span>
    </Link>
  );
}

// Navegação lateral persistente, agrupada pelos 4 pilares.
// Server Component (lê getPillars); o destaque do item ativo é client (NavLink).
export async function AppSidebar() {
  const pillars = await getPillars();

  return (
    <>
      {/* Desktop */}
      <aside className="sticky top-0 hidden h-screen w-64 shrink-0 flex-col border-r border-border bg-background md:flex">
        <Brand />
        <ScrollArea className="flex-1">
          <div className="pb-6">
            <SidebarNav pillars={pillars} />
          </div>
        </ScrollArea>
      </aside>

      {/* Mobile */}
      <MobileSidebar pillars={pillars} />
    </>
  );
}
