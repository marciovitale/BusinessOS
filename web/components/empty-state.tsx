import type { ReactNode } from "react";
import { Inbox } from "lucide-react";
import { cn } from "@/lib/utils";

export function EmptyState({
  title,
  description,
  suggestions,
  action,
  className,
}: {
  title: string;
  description?: string;
  suggestions?: string[];
  action?: ReactNode;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center rounded-xl border border-dashed border-border px-6 py-16 text-center",
        className,
      )}
    >
      <div className="mb-4 flex size-12 items-center justify-center rounded-full bg-muted">
        <Inbox className="size-6 text-muted-foreground" strokeWidth={1.5} />
      </div>
      <h2 className="text-lg font-medium text-foreground">{title}</h2>
      {description ? (
        <p className="mt-2 max-w-md text-sm text-muted-foreground">
          {description}
        </p>
      ) : null}

      {suggestions && suggestions.length > 0 ? (
        <div className="mt-6 w-full max-w-md">
          <p className="mb-2 text-xs font-medium uppercase tracking-wide text-muted-foreground">
            Sugestões de cards
          </p>
          <ul className="flex flex-wrap justify-center gap-2">
            {suggestions.map((s) => (
              <li
                key={s}
                className="rounded-md border border-border px-2.5 py-1 text-xs text-muted-foreground"
              >
                {s}
              </li>
            ))}
          </ul>
        </div>
      ) : null}

      {action ? <div className="mt-6">{action}</div> : null}
    </div>
  );
}
