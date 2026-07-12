import { LogOut } from "lucide-react";

export function UserFooter({ user }: { user?: { name?: string; email?: string } }) {
  if (!user) return null;

  const label = user.name || user.email || "Conta";
  const initial = label.charAt(0).toUpperCase();

  return (
    <div className="flex items-center justify-between gap-2 rounded-full border border-border px-3 py-2">
      <div className="flex min-w-0 items-center gap-2">
        <span className="flex size-7 shrink-0 items-center justify-center rounded-full bg-secondary text-xs font-medium text-secondary-foreground">
          {initial}
        </span>
        <span className="truncate text-xs text-muted-foreground">{label}</span>
      </div>
      {/* <a> em vez de <Link>: o logout do Auth0 precisa de navegação real, não client-side. */}
      <a
        href="/auth/logout"
        aria-label="Sair"
        className="flex size-7 shrink-0 items-center justify-center rounded-full text-muted-foreground transition-colors hover:bg-secondary hover:text-secondary-foreground"
      >
        <LogOut className="size-3.5" strokeWidth={1.75} />
      </a>
    </div>
  );
}
