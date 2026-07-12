import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { STATUS_LABELS, type Status } from "@/lib/types";

// Estilo estritamente P&B: os status se diferenciam por PESO, CONTORNO,
// PREENCHIMENTO e OPACIDADE — nunca por matiz (spec seção 7).
const STATUS_CLASS: Record<Status, string> = {
  // Vazio: contorno tênue, texto muted, tracejado (menor ênfase).
  empty:
    "border-dashed border-border text-muted-foreground bg-transparent font-normal opacity-70",
  // Rascunho: contorno sólido, texto muted.
  draft: "border-border text-muted-foreground bg-transparent font-normal",
  // Em progresso: preenchimento suave (secondary).
  "in-progress":
    "border-transparent bg-secondary text-secondary-foreground font-medium",
  // Revisão: preenchimento mais forte (muted escuro) + contorno.
  review:
    "border-foreground/20 bg-muted text-foreground font-medium ring-1 ring-inset ring-border",
  // Concluído: sólido (primary), máximo contraste/peso.
  done: "border-transparent bg-primary text-primary-foreground font-semibold",
};

export function StatusBadge({
  status,
  className,
}: {
  status: Status;
  className?: string;
}) {
  return (
    <Badge
      variant="outline"
      className={cn("rounded-full px-2.5 py-1 text-[9px] uppercase tracking-[0.13em]", STATUS_CLASS[status], className)}
      aria-label={`Status: ${STATUS_LABELS[status]}`}
    >
      {STATUS_LABELS[status]}
    </Badge>
  );
}
