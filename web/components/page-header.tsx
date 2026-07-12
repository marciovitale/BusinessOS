import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

export function PageHeader({
  title,
  description,
  count,
  actions,
  className,
}: {
  title: string;
  description?: string;
  count?: number;
  actions?: ReactNode;
  className?: string;
}) {
  return (
    <header
      className={cn(
        "flex flex-col gap-8 border-b border-border pb-8 sm:flex-row sm:items-end sm:justify-between",
        className,
      )}
    >
      <div className="min-w-0">
        <div className="flex items-start gap-3">
          <h1 className="text-4xl font-normal uppercase leading-[.92] tracking-[-0.055em] text-foreground sm:text-6xl lg:text-7xl">
            {title}
          </h1>
          {typeof count === "number" ? (
            <span className="mt-1 text-xs tabular-nums text-muted-foreground">
              ({String(count).padStart(2, "0")})
            </span>
          ) : null}
        </div>
        {description ? (
          <p className="mt-4 max-w-xl text-sm leading-relaxed text-muted-foreground">
            {description}
          </p>
        ) : null}
      </div>

      {actions ? (
        <div className="flex shrink-0 items-center gap-2">{actions}</div>
      ) : null}
    </header>
  );
}
