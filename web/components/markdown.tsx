"use client";

import ReactMarkdown, { type Components } from "react-markdown";
import remarkGfm from "remark-gfm";
import { cn } from "@/lib/utils";

/**
 * Render de Markdown real, coerente com o tema P&B (tons neutros).
 *
 * - `remark-gfm`: listas, tabelas, checkboxes, strikethrough, autolinks.
 * - Sanitização: react-markdown NÃO renderiza HTML bruto por padrão e aqui
 *   `rehype-raw` continua desabilitado de propósito — HTML embutido é escapado.
 *   Não habilitar sem um sanitizer.
 * - Estilização manual leve (sem @tailwindcss/typography) para manter simples.
 *
 * É um Client Component (react-markdown usa hooks); pode ser renderizado
 * a partir de Server Components normalmente (ex.: ContentCard).
 *
 * Cada sobrescrita descarta o prop `node` (injetado pelo react-markdown com
 * passNode: true) para que ele não vaze como atributo desconhecido no DOM.
 */
const components: Components = {
  h1: ({ node, className, ...props }) => {
    void node;
    return (
      <h1
        className={cn(
          "mt-4 mb-2 text-base font-semibold text-foreground first:mt-0",
          className,
        )}
        {...props}
      />
    );
  },
  h2: ({ node, className, ...props }) => {
    void node;
    return (
      <h2
        className={cn(
          "mt-4 mb-2 text-sm font-semibold text-foreground first:mt-0",
          className,
        )}
        {...props}
      />
    );
  },
  h3: ({ node, className, ...props }) => {
    void node;
    return (
      <h3
        className={cn(
          "mt-3 mb-1.5 text-sm font-medium text-foreground first:mt-0",
          className,
        )}
        {...props}
      />
    );
  },
  h4: ({ node, className, ...props }) => {
    void node;
    return (
      <h4
        className={cn(
          "mt-3 mb-1.5 text-sm font-medium text-foreground first:mt-0",
          className,
        )}
        {...props}
      />
    );
  },
  p: ({ node, className, ...props }) => {
    void node;
    return (
      <p
        className={cn("my-2 leading-relaxed first:mt-0 last:mb-0", className)}
        {...props}
      />
    );
  },
  a: ({ node, className, ...props }) => {
    void node;
    return (
      <a
        className={cn(
          "font-medium text-foreground underline underline-offset-2 decoration-muted-foreground hover:decoration-foreground",
          className,
        )}
        target="_blank"
        rel="noopener noreferrer"
        {...props}
      />
    );
  },
  strong: ({ node, className, ...props }) => {
    void node;
    return (
      <strong
        className={cn("font-semibold text-foreground", className)}
        {...props}
      />
    );
  },
  em: ({ node, className, ...props }) => {
    void node;
    return <em className={cn("italic", className)} {...props} />;
  },
  ul: ({ node, className, ...props }) => {
    void node;
    return (
      <ul
        className={cn(
          "my-2 ml-5 list-disc space-y-1 marker:text-muted-foreground",
          className,
        )}
        {...props}
      />
    );
  },
  ol: ({ node, className, ...props }) => {
    void node;
    return (
      <ol
        className={cn(
          "my-2 ml-5 list-decimal space-y-1 marker:text-muted-foreground",
          className,
        )}
        {...props}
      />
    );
  },
  li: ({ node, className, ...props }) => {
    void node;
    return <li className={cn("leading-relaxed", className)} {...props} />;
  },
  blockquote: ({ node, className, ...props }) => {
    void node;
    return (
      <blockquote
        className={cn(
          "my-2 border-l-2 border-border pl-3 text-muted-foreground italic",
          className,
        )}
        {...props}
      />
    );
  },
  hr: ({ node, className, ...props }) => {
    void node;
    return <hr className={cn("my-4 border-border", className)} {...props} />;
  },
  code: ({ node, className, ...props }) => {
    void node;
    // Inline code; blocos usam <pre><code> e são estilizados via <pre> abaixo.
    return (
      <code
        className={cn(
          "rounded bg-muted px-1 py-0.5 font-mono text-[0.85em] text-foreground",
          className,
        )}
        {...props}
      />
    );
  },
  pre: ({ node, className, ...props }) => {
    void node;
    return (
      <pre
        className={cn(
          "my-2 overflow-x-auto rounded-lg border border-border bg-muted p-3 font-mono text-xs leading-relaxed text-foreground [&_code]:bg-transparent [&_code]:p-0",
          className,
        )}
        {...props}
      />
    );
  },
  table: ({ node, className, ...props }) => {
    void node;
    return (
      <div className="my-2 w-full overflow-x-auto">
        <table
          className={cn("w-full border-collapse text-left text-xs", className)}
          {...props}
        />
      </div>
    );
  },
  thead: ({ node, className, ...props }) => {
    void node;
    return (
      <thead className={cn("border-b border-border", className)} {...props} />
    );
  },
  th: ({ node, className, ...props }) => {
    void node;
    return (
      <th
        className={cn("px-2 py-1.5 font-medium text-foreground", className)}
        {...props}
      />
    );
  },
  td: ({ node, className, ...props }) => {
    void node;
    return (
      <td
        className={cn("border-b border-border px-2 py-1.5 align-top", className)}
        {...props}
      />
    );
  },
  input: ({ node, className, ...props }) => {
    void node;
    // Checkboxes de task lists (GFM), mantidos desabilitados (read-only).
    return (
      <input
        className={cn("mr-1 align-middle accent-foreground", className)}
        {...props}
        disabled
      />
    );
  },
};

export function Markdown({
  children,
  className,
}: {
  children: string;
  className?: string;
}) {
  const source = (children ?? "").trim();
  if (!source) return null;

  return (
    <div className={cn("text-sm text-muted-foreground", className)}>
      <ReactMarkdown remarkPlugins={[remarkGfm]} components={components}>
        {source}
      </ReactMarkdown>
    </div>
  );
}
