"use client";

import { useRouter, usePathname, useSearchParams } from "next/navigation";
import { LayoutGrid, List } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

// Alternância Grid/Lista via query param (?view=grid|list), default "grid".
// Único Client Component do fluxo; CardGrid/PageView continuam Server Components.
export function ViewToggle({ value }: { value: "grid" | "list" }) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  function set(next: string) {
    const params = new URLSearchParams(searchParams.toString());
    params.set("view", next);
    router.replace(`${pathname}?${params.toString()}`, { scroll: false });
  }

  return (
    <Select value={value} onValueChange={set}>
      <SelectTrigger className="w-[130px]" aria-label="Alternar visualização">
        <SelectValue />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value="grid">
          <LayoutGrid className="size-4" strokeWidth={1.75} />
          Grade
        </SelectItem>
        <SelectItem value="list">
          <List className="size-4" strokeWidth={1.75} />
          Lista
        </SelectItem>
      </SelectContent>
    </Select>
  );
}
