"use client";

import { Moon, Sun } from "lucide-react";
import { useTheme } from "next-themes";
import { Button } from "@/components/ui/button";

// Alterna entre light/dark. Os dois ícones são sempre renderizados e a
// visibilidade é resolvida via CSS (`dark:`), então o HTML do servidor e o
// do client coincidem — sem estado de "mounted" nem mismatch de hidratação.
export function ThemeToggle() {
  const { resolvedTheme, setTheme } = useTheme();

  return (
    <Button
      variant="outline"
      size="icon"
      aria-label="Alternar tema claro/escuro"
      onClick={() => setTheme(resolvedTheme === "dark" ? "light" : "dark")}
    >
      <Sun className="hidden size-4 dark:block" strokeWidth={1.75} />
      <Moon className="size-4 dark:hidden" strokeWidth={1.75} />
    </Button>
  );
}
