import { z } from "zod";

export const pillarEnum = z.enum(["founder", "direcao", "validacao", "caixa"]);
export const statusEnum = z.enum([
  "empty",
  "draft",
  "in-progress",
  "review",
  "done",
]);

// Frontmatter validado/coagido na fronteira de leitura (loader).
export const frontmatterSchema = z.object({
  id: z.string().min(1),
  pillar: pillarEnum,
  page: z.string().min(1), // slug de página (kebab-case)
  title: z.string().min(1),
  status: statusEnum.default("empty"),
  tags: z.array(z.string()).default([]),
  order: z.coerce.number().int().nonnegative().default(0),
  // aceita Date (YAML pode parsear datas) ou string; normaliza p/ "YYYY-MM-DD"
  updated: z
    .union([z.string(), z.date()])
    .transform((v) => (v instanceof Date ? v.toISOString().slice(0, 10) : v))
    .pipe(z.string().regex(/^\d{4}-\d{2}-\d{2}$/))
    .default(new Date().toISOString().slice(0, 10)),
});

export type FrontmatterInput = z.input<typeof frontmatterSchema>;
export type FrontmatterOutput = z.output<typeof frontmatterSchema>;

// Input validado da Server Action de edição (seção 9).
export const saveCardInput = z.object({
  pillar: pillarEnum,
  page: z.string().min(1),
  id: z.string().min(1),
  title: z.string().min(1),
  status: statusEnum,
  tags: z.array(z.string()).default([]),
  body: z.string().default(""),
  order: z.coerce.number().int().nonnegative().default(0),
});
export type SaveCardInput = z.infer<typeof saveCardInput>;

// Input validado da Server Action de criação (seção 9).
// `id`/`order` NÃO vêm do cliente: o `id` (slug) é derivado do título e
// deduplicado no servidor; `order` é calculado (maior+1) na pasta da página.
export const createCardInput = z.object({
  pillar: pillarEnum,
  page: z.string().min(1),
  title: z.string().min(1),
  status: statusEnum.default("draft"),
  tags: z.array(z.string()).default([]),
  body: z.string().default(""),
});
export type CreateCardInput = z.infer<typeof createCardInput>;

// Input validado da Server Action de exclusão (ação destrutiva).
export const deleteCardInput = z.object({
  pillar: pillarEnum,
  page: z.string().min(1),
  id: z.string().min(1),
});
export type DeleteCardInput = z.infer<typeof deleteCardInput>;
