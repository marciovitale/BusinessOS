import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { SidebarNav } from "@/components/sidebar-nav";
import { MobileSidebar } from "@/components/mobile-sidebar";
import { getPillars } from "@/lib/content";

function Brand() {
  return (
    <Link href="/" className="group flex items-center justify-between rounded-full border border-border px-4 py-3 text-foreground">
      <span className="text-sm font-medium uppercase tracking-[-0.02em]">BusinessOS</span>
      <ArrowUpRight className="size-4 transition-transform group-hover:rotate-45" strokeWidth={1.5} />
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
      <aside className="sticky top-0 hidden h-screen w-72 shrink-0 flex-col border-r border-border bg-background/80 p-3 backdrop-blur-xl md:flex">
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
