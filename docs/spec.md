# BusinessOS — Especificação Técnica (Arquitetura de Engenharia)

> Documento de arquitetura de engenharia do MVP do **BusinessOS**. É a fonte da verdade técnica para o scaffold e a implementação. Outros agentes devem seguir este documento **exatamente**. Nomes de arquivos, comandos, tipos e código estão em inglês/técnico por convenção; a prosa está em PT-BR.

## 0. Contexto e princípios de engenharia

**O que é:** BusinessOS é um web app single-user (MVP) que funciona como camada de inteligência/decisão de um negócio para um founder solo. O founder edita e salva informações na UI; agentes de IA também consomem esse conteúdo. Cada unidade de conteúdo é um arquivo **Markdown com frontmatter YAML** (um "Card"), servindo simultaneamente como campo editável na UI e como *chunk* de contexto estruturado para IA.

**Restrições do MVP:**

- **Sem login, sem banco de dados.** Persistência = arquivos `.md` no filesystem.
- **Leitura** dos `.md` acontece em **Server Components** (Node runtime), via `gray-matter`.
- **Escrita** acontece via **Server Actions** que gravam no filesystem (válido em dev/local; ver seção 9 para a ressalva sobre serverless na Vercel).
- **Supabase** entra só numa fase futura (auth + persistência). Não é usado no MVP.

**Princípios:**

1. A pasta `content/` **É** o repositório de contexto compartilhado com a IA. Nada de duplicar conteúdo em outro lugar.
2. Server Components por padrão; Client Components só onde há interatividade (toggle de visualização, formulário de edição).
3. Frontmatter é um contrato: sempre validado com `zod` na fronteira de leitura. Arquivo inválido não derruba a página — é degradado com aviso.
4. Design dark-first, editorial e monocromático, com espaço negativo generoso, títulos amplos, cards arredondados e controles em cápsula. Nada de cor cromática (ver seção 7).

---

## 1. Stack e versões

Alvo: Next.js **App Router**, TypeScript estrito, Tailwind, shadcn/ui, Storybook. Versões "latest" no momento do scaffold — os intervalos abaixo são os alvos; use o que o `create-next-app@latest` / `shadcn@latest` resolverem, respeitando os majors indicados.

### Dependências principais (runtime)

| Pacote | Versão-alvo | Papel |
| --- | --- | --- |
| `next` | ^15 (App Router) | Framework, roteamento, Server Components, Server Actions |
| `react` / `react-dom` | ^19 | Runtime de UI (par com Next 15) |
| `typescript` | ^5.4+ | Tipagem estática (modo `strict`) |
| `tailwindcss` | ^4 | Estilização utilitária (config CSS-first via `@theme`/`globals.css`) |
| `gray-matter` | ^4.0.3 | Parse de frontmatter YAML dos `.md` |
| `zod` | ^3.23+ | Validação/coerção do frontmatter e dos inputs das Server Actions |
| `class-variance-authority` | ^0.7 | Variantes de componentes (trazido pelo shadcn) |
| `clsx` + `tailwind-merge` | latest | Helper `cn()` (trazido pelo shadcn) |
| `lucide-react` | latest | Ícones (P&B, stroke fino) — trazido pelo shadcn |
| `next` `font` (`next/font/google`) | (parte do `next`) | Fonte **Inter** self-hosted, sem request externo |

### Dependências de desenvolvimento

| Pacote | Papel |
| --- | --- |
| `@types/node`, `@types/react`, `@types/react-dom` | Tipos |
| `eslint`, `eslint-config-next` | Lint |
| `storybook` + `@storybook/nextjs` (^8) | Storybook com framework Next.js |
| `@storybook/addon-essentials`, `@storybook/addon-a11y` | Addons (controls, docs, acessibilidade) |
| `prettier` + `prettier-plugin-tailwindcss` (opcional) | Formatação e ordenação de classes |

> **Nota sobre Tailwind v4:** o `create-next-app@latest` scaffolda Tailwind v4 (config CSS-first, sem `tailwind.config.ts` obrigatório; tema declarado em `globals.css` via `@theme` e CSS variables). O shadcn/ui já suporta v4 (estilo `new-york`, cores em `oklch`). Este documento assume v4. Se o ambiente resolver Tailwind v3, o mapeamento equivalente é: mover os tokens de `@theme`/`:root` para `tailwind.config.ts` (`theme.extend`) — os valores de CSS variables da seção 7 permanecem idênticos.

### `.nvmrc` / engines

- Node **20.x LTS** ou superior (Next 15 exige Node >= 18.18; usar 20 LTS).

---

## 2. Estrutura de pastas / árvore do projeto

**Decisão-chave (ver também seção 13):** o app do BusinessOS vive na subpasta **`web/`** dentro da base do projeto, **irmã** de `portfolio/` e `docs/`. Justificativa: (a) já existe `portfolio/` (site estático) e `docs/` na raiz — a raiz é um "monorepo leve" de artefatos, não um projeto Next; (b) nomear a subpasta `app/` colidiria conceitualmente com o diretório `app/` do App Router (confuso); `web/` é inequívoco e é o *root* do projeto Next (é o que a Vercel builda e o que `process.cwd()` retorna).

```text
BusinessOS/                          # base do projeto (NÃO é um projeto Next)
├── docs/
│   └── spec.md                      # este documento
├── portfolio/                       # site estático irmão (já existe)
└── web/                             # >>> projeto Next.js (root do app) <<<
    ├── app/                         # App Router
    │   ├── layout.tsx               # layout raiz: <html>, fonte Inter, AppSidebar persistente
    │   ├── globals.css              # Tailwind + tema (CSS variables P&B) + @theme
    │   ├── page.tsx                 # "/" — Visão geral (home)
    │   ├── founder/
    │   │   ├── objetivo/page.tsx
    │   │   └── estilo-de-vida/page.tsx
    │   ├── direcao/
    │   │   ├── mapa-do-mercado/page.tsx
    │   │   ├── ima-de-problemas/page.tsx
    │   │   ├── perfil-ideal-de-cliente/page.tsx
    │   │   ├── tese-de-valor/page.tsx
    │   │   └── oferta/page.tsx
    │   ├── validacao/
    │   │   ├── oferta/page.tsx
    │   │   └── primeiros-clientes/page.tsx
    │   └── caixa/
    │       ├── fluxo-de-caixa/page.tsx
    │       └── erp/page.tsx
    ├── actions/
    │   └── cards.ts                 # "use server" — Server Actions de escrita (saveCard, ...)
    ├── components/
    │   ├── app-sidebar.tsx          # AppSidebar (navegação persistente pelos 4 pilares)
    │   ├── nav-group.tsx            # NavGroup / PillarNav (um grupo do pilar)
    │   ├── page-header.tsx          # PageHeader (título da página + ações + ViewToggle)
    │   ├── content-card.tsx         # ContentCard (renderiza um Card)
    │   ├── card-grid.tsx            # CardGrid (lista de cards em modo grid|list)
    │   ├── view-toggle.tsx          # ViewToggle (Select Grid/Lista) — client
    │   ├── status-badge.tsx         # StatusBadge (badge P&B por status)
    │   ├── empty-state.tsx          # EmptyState (estado vazio)
    │   ├── card-editor.tsx          # CardEditor (form de edição) — client
    │   ├── page-view.tsx            # PageView (composição reusável usada por cada page.tsx)
    │   └── ui/                      # componentes shadcn/ui (gerados)
    │       ├── button.tsx
    │       ├── card.tsx
    │       ├── select.tsx
    │       ├── badge.tsx
    │       ├── input.tsx
    │       ├── textarea.tsx
    │       ├── separator.tsx
    │       ├── scroll-area.tsx
    │       ├── label.tsx
    │       ├── sonner.tsx           # toasts (feedback de save)
    │       └── dropdown-menu.tsx
    ├── lib/
    │   ├── content.ts               # content loader (getCards, getAllCards, getPillars, ...)
    │   ├── schema.ts                # zod schemas do frontmatter + coerção
    │   ├── types.ts                 # tipos TS (Card, Pillar, Page, Status, ...)
    │   ├── pillars.ts               # config estática dos 4 pilares e páginas (navegação + labels)
    │   └── utils.ts                 # cn() e utilitários
    ├── content/                     # >>> repositório de contexto (fonte da verdade) <<<
    │   ├── founder/
    │   │   ├── objetivo/*.md
    │   │   └── estilo-de-vida/*.md
    │   ├── direcao/
    │   │   ├── mapa-do-mercado/*.md
    │   │   ├── ima-de-problemas/*.md
    │   │   ├── perfil-ideal-de-cliente/*.md
    │   │   ├── tese-de-valor/*.md
    │   │   └── oferta/*.md
    │   ├── validacao/
    │   │   ├── oferta/*.md
    │   │   └── primeiros-clientes/*.md
    │   └── caixa/
    │       ├── fluxo-de-caixa/*.md
    │       └── erp/*.md
    ├── stories/                     # stories do Storybook (ver seção 10)
    │   ├── ContentCard.stories.tsx
    │   ├── CardGrid.stories.tsx
    │   ├── StatusBadge.stories.tsx
    │   ├── ViewToggle.stories.tsx
    │   ├── PageHeader.stories.tsx
    │   ├── EmptyState.stories.tsx
    │   ├── AppSidebar.stories.tsx
    │   └── CardEditor.stories.tsx
    ├── .storybook/
    │   ├── main.ts
    │   └── preview.ts               # importa globals.css; decorator de tema P&B + fonte
    ├── public/
    ├── components.json              # config do shadcn/ui
    ├── next.config.ts
    ├── tsconfig.json                # paths: "@/*" -> "./*"
    ├── postcss.config.mjs
    ├── eslint.config.mjs
    ├── package.json
    └── .nvmrc
```

> `content/` fica **dentro de `web/`** de propósito: o loader lê via `path.join(process.cwd(), 'content', ...)`, e `process.cwd()` é o root do projeto Next (`web/`). Assim o conteúdo é empacotado no build e disponível em runtime de leitura tanto local quanto na Vercel.

---

## 3. Roteamento (App Router)

### Abordagem recomendada: **pastas explícitas por página** (não rota dinâmica)

Cada uma das 11 páginas de conteúdo tem sua própria pasta e `page.tsx` explícito, espelhando exatamente as rotas exigidas (kebab-case, namespace por pilar). A home é `app/page.tsx`.

**Por que explícito e não `app/[pillar]/[page]/page.tsx` dinâmico:**

- **Simplicidade e legibilidade:** o mapa de rotas é o próprio sistema de arquivos; um dev encontra a página pelo caminho.
- **Type-safety e metadata por página:** cada `page.tsx` pode exportar `metadata` (title/description) própria e customizações pontuais sem `if/switch` por slug.
- **Erros previsíveis:** rota dinâmica exigiria `generateStaticParams` + validação de slug para evitar 404/500 em combinações inválidas (ex.: `/caixa/oferta` não existe). Com pastas explícitas, combinações inválidas simplesmente não existem.
- **Custo baixo de duplicação:** cada `page.tsx` é um *thin wrapper* de ~3 linhas que delega para `<PageView pillar="..." page="..." />`. Toda a lógica de leitura/render mora em `PageView` e no loader — sem duplicação real.

Exemplo de `page.tsx` (todas seguem este padrão):

```tsx
// web/app/direcao/oferta/page.tsx
import { PageView } from "@/components/page-view";

export const metadata = { title: "Oferta — Direção · BusinessOS" };

export default function Page() {
  return <PageView pillar="direcao" page="oferta" />;
}
```

> **Observação sobre `validacao/oferta` vs `direcao/oferta`:** "Oferta" aparece em dois pilares. São páginas distintas (pilares diferentes ⇒ pastas de conteúdo diferentes: `content/direcao/oferta/` e `content/validacao/oferta/`). O par `(pillar, page)` é sempre a chave; o slug sozinho nunca é.

### Layout raiz e sidebar persistente

`app/layout.tsx` é o único layout. Ele:

- Define `<html lang="pt-BR">` e aplica a classe da fonte Inter (seção 7).
- Renderiza um shell de duas colunas: **`<AppSidebar />`** (fixa, ~256px, `border-r`) + `<main>` com o `children`.
- A sidebar é um Server Component que lê a config estática de `lib/pillars.ts` (labels/rotas) — opcionalmente enriquecida com contagem/`status` agregado por página via loader. O highlight do item ativo é feito por um Client Component leve que usa `usePathname()`.

```tsx
// web/app/layout.tsx (esqueleto)
import "./globals.css";
import { inter } from "@/lib/fonts"; // ou definido inline aqui
import { AppSidebar } from "@/components/app-sidebar";

export const metadata = { title: "BusinessOS", description: "Camada de inteligência do seu negócio" };

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt-BR" className={inter.variable}>
      <body className="min-h-screen bg-background text-foreground antialiased font-sans">
        <div className="flex min-h-screen">
          <AppSidebar />
          <main className="flex-1 min-w-0">{children}</main>
        </div>
      </body>
    </html>
  );
}
```

> **Route groups:** não são necessários no MVP (só há um shell de layout, no root). Se no futuro surgir uma área sem sidebar (ex.: `/print`, `/export`), usar um route group `(app)/` para a área com sidebar e outro grupo para a área sem — sem alterar URLs.

---

## 4. Camada de conteúdo (content loader)

Leitura em **Server Components** (Node runtime), síncrona conceitualmente mas com API `async` para permitir migração a I/O assíncrono/Supabase depois. Usa `node:fs/promises`, `node:path` e `gray-matter`.

### Responsabilidades

1. Resolver o diretório `content/<pillar>/<page>/`.
2. Listar arquivos `*.md`, ler cada um, separar frontmatter/corpo com `gray-matter`.
3. Validar/coagir o frontmatter com `zod` (seção 5). Preencher defaults (`id` a partir do nome do arquivo, `updated` etc.) quando faltarem.
4. Retornar `Card[]` ordenado por `order` (asc), depois `title`.
5. Nunca lançar por causa de 1 arquivo inválido: logar `console.warn` e pular/degradar (status `empty`).

### Funções do loader (`lib/content.ts`)

```ts
// Assinaturas públicas
export async function getCards(pillar: PillarSlug, page: PageSlug): Promise<Card[]>;
export async function getCard(pillar: PillarSlug, page: PageSlug, id: string): Promise<Card | null>;
export async function getAllCards(): Promise<Card[]>;            // agrega TODOS os .md (base do "export de contexto" p/ IA)
export async function getPillars(): Promise<PillarSummary[]>;    // 4 pilares + páginas + contagens/status agregado
export async function getPageSummary(pillar: PillarSlug, page: PageSlug): Promise<PageSummary>;
```

- `getCards` / `getCard`: leitura de uma página / um card específico.
- `getAllCards`: varre `content/**/*.md` e retorna todos os cards planos — é a fundação do futuro **export de contexto** (agregar todos os MD num único payload para agentes).
- `getPillars`: constrói a navegação a partir de `lib/pillars.ts` (config estática) + agrega dados de leitura (nº de cards, status predominante) para a sidebar/home.
- Caching: as funções de leitura podem usar `React.cache()` para memoização por request; em produção o conteúdo é estático no build, então revalidação é irrelevante no MVP.

### Esboço de implementação

```ts
// web/lib/content.ts
import { promises as fs } from "node:fs";
import path from "node:path";
import matter from "gray-matter";
import { cache } from "react";
import { frontmatterSchema } from "@/lib/schema";
import type { Card, PillarSlug, PageSlug } from "@/lib/types";

const CONTENT_ROOT = path.join(process.cwd(), "content");

export const getCards = cache(async (pillar: PillarSlug, page: PageSlug): Promise<Card[]> => {
  const dir = path.join(CONTENT_ROOT, pillar, page);
  let files: string[] = [];
  try {
    files = (await fs.readdir(dir)).filter((f) => f.endsWith(".md"));
  } catch {
    return []; // pasta ainda não existe -> página vazia
  }

  const cards = await Promise.all(
    files.map(async (file) => {
      const raw = await fs.readFile(path.join(dir, file), "utf8");
      const { data, content } = matter(raw);
      const id = (data.id as string) ?? file.replace(/\.md$/, "");
      const parsed = frontmatterSchema.safeParse({ ...data, id, pillar, page });
      if (!parsed.success) {
        console.warn(`[content] frontmatter inválido em ${pillar}/${page}/${file}:`, parsed.error.flatten());
        return null;
      }
      return { ...parsed.data, body: content.trim() } satisfies Card;
    }),
  );

  return (cards.filter(Boolean) as Card[]).sort(
    (a, b) => a.order - b.order || a.title.localeCompare(b.title),
  );
});
```

> `getAllCards` reusa `getCards` iterando sobre `lib/pillars.ts`. Manter o parse do body como Markdown cru (`body: string`) no MVP; renderização para HTML fica na UI (pode ser texto simples/`<pre>` ou, futuramente, `react-markdown`). O corpo cru é exatamente o que a IA consome.

---

## 5. Esquema / Tipos TypeScript (frontmatter + modelos)

Frontmatter obrigatório por card: `id`, `pillar`, `page`, `title`, `status`, `tags`, `order`, `updated`. O corpo do `.md` vira `body`.

```ts
// web/lib/types.ts

export type PillarSlug = "founder" | "direcao" | "validacao" | "caixa";

export type Status = "empty" | "draft" | "in-progress" | "review" | "done";

// Slugs de página válidos por pilar (para type-safety no roteamento e no loader)
export type PageSlug =
  | "objetivo" | "estilo-de-vida"                                             // founder
  | "mapa-do-mercado" | "ima-de-problemas" | "perfil-ideal-de-cliente"        // direcao
  | "tese-de-valor" | "oferta"                                                // direcao
  | "primeiros-clientes";                                                     // validacao (+ "oferta" reusado)
// Obs.: "oferta" pertence a direcao E validacao; "fluxo-de-caixa" e "erp" a caixa.

export interface Frontmatter {
  id: string;
  pillar: PillarSlug;
  page: PageSlug;
  title: string;
  status: Status;
  tags: string[];
  order: number;
  updated: string; // "YYYY-MM-DD"
}

// Card = frontmatter + corpo do markdown (conteúdo do founder)
export interface Card extends Frontmatter {
  body: string;
}

// Config estática de navegação
export interface PageDef {
  slug: PageSlug | string; // string p/ acomodar "oferta" duplicada por pilar
  title: string;           // label na UI (PT-BR)
  route: string;           // ex.: "/direcao/oferta"
}

export interface PillarDef {
  slug: PillarSlug;
  title: string;           // "Founder" | "Direção" | "Validação" | "Caixa"
  pages: PageDef[];
}

// Resumos agregados (sidebar / home)
export interface PageSummary extends PageDef {
  count: number;
  status: Status; // status agregado/representativo da página
}

export interface PillarSummary extends PillarDef {
  pages: PageSummary[];
}
```

### Schema zod (`lib/schema.ts`)

```ts
// web/lib/schema.ts
import { z } from "zod";

export const pillarEnum = z.enum(["founder", "direcao", "validacao", "caixa"]);
export const statusEnum = z.enum(["empty", "draft", "in-progress", "review", "done"]);

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

// Input validado da Server Action de edição (seção 9)
export const saveCardInput = z.object({
  pillar: pillarEnum,
  page: z.string().min(1),
  id: z.string().min(1),
  title: z.string().min(1),
  status: statusEnum,
  tags: z.array(z.string()).default([]),
  body: z.string().default(""),
});
export type SaveCardInput = z.infer<typeof saveCardInput>;
```

> **Nota:** `page` é validado como `string` no schema (o loader recebe `pillar`/`page` do próprio caminho, então já são confiáveis). Os tipos `PageSlug` do TS servem para o roteamento e chamadas do loader; o zod garante robustez contra frontmatter escrito à mão.

### Config estática de pilares (`lib/pillars.ts`)

```ts
// web/lib/pillars.ts
import type { PillarDef } from "@/lib/types";

export const PILLARS: PillarDef[] = [
  {
    slug: "founder",
    title: "Founder",
    pages: [
      { slug: "objetivo",        title: "Objetivo",        route: "/founder/objetivo" },
      { slug: "estilo-de-vida",  title: "Estilo de vida",  route: "/founder/estilo-de-vida" },
    ],
  },
  {
    slug: "direcao",
    title: "Direção",
    pages: [
      { slug: "mapa-do-mercado",          title: "Mapa do Mercado",         route: "/direcao/mapa-do-mercado" },
      { slug: "ima-de-problemas",         title: "Ímã de Problemas",        route: "/direcao/ima-de-problemas" },
      { slug: "perfil-ideal-de-cliente",  title: "Perfil Ideal de Cliente", route: "/direcao/perfil-ideal-de-cliente" },
      { slug: "tese-de-valor",            title: "Tese de Valor",           route: "/direcao/tese-de-valor" },
      { slug: "oferta",                   title: "Oferta",                  route: "/direcao/oferta" },
    ],
  },
  {
    slug: "validacao",
    title: "Validação",
    pages: [
      { slug: "oferta",              title: "Oferta",             route: "/validacao/oferta" },
      { slug: "primeiros-clientes",  title: "Primeiros clientes", route: "/validacao/primeiros-clientes" },
    ],
  },
  {
    slug: "caixa",
    title: "Caixa",
    pages: [
      { slug: "fluxo-de-caixa",  title: "Fluxo de Caixa",  route: "/caixa/fluxo-de-caixa" },
      { slug: "erp",             title: "ERP",             route: "/caixa/erp" },
    ],
  },
];
```

### Exemplo de arquivo de conteúdo (`content/direcao/oferta/oferta-principal.md`)

```markdown
---
id: oferta-principal
pillar: direcao
page: oferta
title: Oferta principal
status: draft
tags: [pricing, mvp]
order: 1
updated: 2026-07-11
---

Descrição da oferta escrita pelo founder. Este corpo em Markdown é
tanto o conteúdo editável na UI quanto o chunk de contexto para a IA.
```

---

## 6. Arquitetura de componentes

### Componentes shadcn/ui a instalar (`components/ui/`)

`button`, `card`, `select`, `badge`, `input`, `textarea`, `separator`, `scroll-area`, `label`, `dropdown-menu`, `sonner` (toasts). Estilo: **new-york**, base color **neutral** (depois forçada a chroma 0 — seção 7).

### Componentes customizados (`components/`)

| Componente | Tipo | Props principais | Descrição |
| --- | --- | --- | --- |
| `AppSidebar` | Server (+ item ativo em client) | `pillars?: PillarSummary[]` | Navegação lateral persistente agrupada pelos 4 pilares. Logo/nome no topo, link "Visão geral" para `/`, depois um `NavGroup` por pilar. Envolto em `ScrollArea`. |
| `NavGroup` (`PillarNav`) | Client | `pillar: PillarDef \| PillarSummary`, `activePath: string` | Um grupo de pilar com label editorial em caixa alta. Links são cápsulas; o estado ativo usa contraste invertido (`bg-foreground text-background`). |
| `PageHeader` | Server | `title: string`, `description?: string`, `count?: number`, `actions?: ReactNode` | Cabeçalho editorial com título em caixa alta e escala responsiva, contador no formato `(00)`, subtítulo e linha divisória; ações ficam alinhadas à direita/base. |
| `ContentCard` | Server | `card: Card`, `view: "grid" \| "list"`, `onEdit?` | Renderiza um Card: `title`, `StatusBadge`, `tags`, `updated`, preview do `body`. Layout muda por `view`. Usa `Card`/`CardHeader`/`CardContent` do shadcn. Clique abre edição. |
| `CardGrid` | Server | `cards: Card[]`, `view: "grid" \| "list"` | Renderiza a coleção. `grid` ⇒ CSS grid responsivo (`grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4`). `list` ⇒ `flex flex-col gap-2` (linhas densas). Se `cards.length === 0` ⇒ `EmptyState`. |
| `ViewToggle` | Client | `value: "grid" \| "list"`, `onChange` **ou** baseado em query param | `Select` do shadcn com opções **Grid** / **Lista**. Controla o modo de visualização (seção 8). |
| `StatusBadge` | Server | `status: Status` | `Badge` P&B; diferencia status por preenchimento/contorno/opacidade (não por cor). Mapa: `empty`→outline muted, `draft`→outline, `in-progress`→secondary, `review`→secondary forte, `done`→solid (foreground). Label PT-BR: Vazio, Rascunho, Em progresso, Revisão, Concluído. |
| `EmptyState` | Server | `title: string`, `description?: string`, `action?: ReactNode` | Estado vazio centralizado (ícone `lucide` fino, texto muted, CTA "Criar primeiro card"). |
| `CardEditor` | Client | `card?: Card`, `pillar`, `page`, `action: saveCard` | Formulário de edição: `Input` (title), `Select` (status), `Input` de tags (CSV), `Textarea` (body/markdown). Submete via Server Action (seção 9); feedback via `sonner`. Em dialog/sheet ou página inline. |
| `PageView` | Server | `pillar: PillarSlug`, `page: PageSlug` | Composição reusável usada por cada `page.tsx`: chama `getCards`, resolve o label/route de `lib/pillars.ts`, renderiza `PageHeader` + `CardGrid`. Lê a preferência de `view` (query param, seção 8). |

**Hierarquia de composição típica de uma página de conteúdo:**

```text
PageView (server)
├── PageHeader (server)
│   └── actions: ViewToggle (client) + Button "Novo card"
└── CardGrid (server)
    └── ContentCard[] (server)   → StatusBadge, tags, body preview
        └── (ao editar) CardEditor (client) em Dialog/Sheet
```

A **home** (`app/page.tsx`) usa `getPillars()` e mostra 4 seções (uma por pilar) com um resumo/atalhos das páginas e status agregado — reaproveitando `ContentCard`/`Card` no estilo "cards no lugar de tabelas".

---

## 7. Design tokens e look & feel (dark-first editorial)

### Princípios visuais

- Tema escuro fixo no produto; `#020202` é a referência perceptual do fundo.
- Paleta estritamente monocromática. Estados são comunicados por preenchimento, contorno, peso e opacidade, nunca por matiz.
- Títulos de página usam caixa alta, peso regular, line-height compacto e tracking negativo (`text-4xl` até `text-7xl`).
- Labels e metadados usam caixa alta, tamanhos entre 9–10px e tracking aberto.
- Cards usam `rounded-2xl`, fundo translúcido, borda branca de baixa opacidade e nenhuma sombra.
- Botões, badges, marca e itens ativos usam `rounded-full`.
- Microinterações duram cerca de 180ms; cards podem subir no máximo 2px. Respeitar `prefers-reduced-motion`.
- Referência visual: Redstone Software. Usar os princípios de contraste, ritmo e tipografia; não copiar logotipo, imagens, textos ou estrutura promocional.

### Fonte — Inter via `next/font`

```ts
// web/lib/fonts.ts
import { Inter } from "next/font/google";

export const inter = Inter({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-sans", // exposto como CSS var; Tailwind mapeia font-sans -> var(--font-sans)
});
```

Aplicar `inter.variable` no `<html>` (seção 3) e mapear `--font-sans` no tema. Sem request externo em runtime (self-hosted pelo `next/font`), coerente com o CSP restritivo e privacidade.

### CSS variables (shadcn) — estritamente monocromático e dark-first

Todos os tons têm **chroma 0** (neutros puros). Valores em `oklch` (padrão shadcn v4). Declarar em `globals.css`:

```css
/* web/app/globals.css */
@import "tailwindcss";

@custom-variant dark (&:is(.dark *));

:root {
  --radius: 1rem;                    /* cards rounded-2xl; controles rounded-full */

  --background:            oklch(0.115 0 0);    /* quase preto */
  --foreground:            oklch(0.985 0 0);    /* quase branco */

  --card:                  oklch(0.15 0 0);
  --card-foreground:       oklch(0.985 0 0);
  --popover:               oklch(0.16 0 0);
  --popover-foreground:    oklch(0.985 0 0);

  --primary:               oklch(0.985 0 0);    /* branco: ações e estados fortes */
  --primary-foreground:    oklch(0.115 0 0);

  --secondary:             oklch(0.21 0 0);
  --secondary-foreground:  oklch(0.985 0 0);

  --muted:                 oklch(0.19 0 0);
  --muted-foreground:      oklch(0.69 0 0);

  --accent:                oklch(0.97 0 0);
  --accent-foreground:     oklch(0.205 0 0);

  --destructive:           oklch(0.45 0 0);     /* mantido neutro (P&B); usar ícone/label p/ semântica */
  --destructive-foreground: oklch(0.985 0 0);

  --border:                oklch(1 0 0 / 14%);  /* linhas finas translúcidas */
  --input:                 oklch(1 0 0 / 18%);
  --ring:                  oklch(0.708 0 0);    /* foco cinza */
}

.dark { /* variante escura compatível; mantida para componentes shadcn */
  --background:            oklch(0.145 0 0);    /* quase preto */
  --foreground:            oklch(0.985 0 0);

  --card:                  oklch(0.205 0 0);
  --card-foreground:       oklch(0.985 0 0);
  --popover:               oklch(0.205 0 0);
  --popover-foreground:    oklch(0.985 0 0);

  --primary:               oklch(0.985 0 0);    /* invertido: claro vira "primary" */
  --primary-foreground:    oklch(0.205 0 0);

  --secondary:             oklch(0.269 0 0);
  --secondary-foreground:  oklch(0.985 0 0);

  --muted:                 oklch(0.269 0 0);
  --muted-foreground:      oklch(0.708 0 0);

  --accent:                oklch(0.269 0 0);
  --accent-foreground:     oklch(0.985 0 0);

  --destructive:           oklch(0.704 0 0);
  --destructive-foreground: oklch(0.145 0 0);

  --border:                oklch(1 0 0 / 10%);
  --input:                 oklch(1 0 0 / 15%);
  --ring:                  oklch(0.556 0 0);
}

/* Mapeamento tema Tailwind v4 (tokens -> utilitários) */
@theme inline {
  --color-background: var(--background);
  --color-foreground: var(--foreground);
  --color-card: var(--card);
  --color-card-foreground: var(--card-foreground);
  --color-popover: var(--popover);
  --color-popover-foreground: var(--popover-foreground);
  --color-primary: var(--primary);
  --color-primary-foreground: var(--primary-foreground);
  --color-secondary: var(--secondary);
  --color-secondary-foreground: var(--secondary-foreground);
  --color-muted: var(--muted);
  --color-muted-foreground: var(--muted-foreground);
  --color-accent: var(--accent);
  --color-accent-foreground: var(--accent-foreground);
  --color-destructive: var(--destructive);
  --color-border: var(--border);
  --color-input: var(--input);
  --color-ring: var(--ring);

  --font-sans: var(--font-sans);   /* Inter (next/font) */

  --radius-sm: calc(var(--radius) - 4px);
  --radius-md: calc(var(--radius) - 2px);
  --radius-lg: var(--radius);
  --radius-xl: calc(var(--radius) + 4px);
}

@layer base {
  * { @apply border-border; }
  body { @apply bg-background text-foreground; }
}
```

**Tokens de radius:** base `--radius: 1rem`; cards usam `rounded-2xl`, enquanto botões, badges e itens de navegação ativos usam `rounded-full`. Containers usam `p-5` até `p-10`, com grids de `gap-3` e separação maior entre blocos editoriais.

> **Modo de tema:** o produto usa tema escuro fixo nesta fase. Não exibir toggle sem que exista uma especificação completa para uma variante clara equivalente.

> **Regra de "sem cor":** status, seleção e destaque são comunicados por **peso, contorno, preenchimento e opacidade** — nunca por matiz. Ícones `lucide-react` com `stroke-width` fino reforçam a estética.

---

## 8. Alternância Grid / Lista

**Decisão: estado via query param (`?view=grid|list`), com default `grid`.** O `ViewToggle` é o único Client Component envolvido; o `CardGrid`/`PageView` permanecem Server Components e leem `searchParams`.

**Por que query param e não `useState`:**

- Preserva o `CardGrid` e o `ContentCard` como Server Components (menos JS no cliente, alinhado ao padrão App Router).
- Preferência **compartilhável e persistente** por URL (refresh mantém o modo).
- Sem "hydration flash" de layout.

Fluxo:

```tsx
// PageView lê searchParams (Server Component)
export async function PageView({ pillar, page, view }: { pillar: PillarSlug; page: PageSlug; view?: "grid" | "list" }) {
  const mode = view === "list" ? "list" : "grid";
  const cards = await getCards(pillar, page);
  return (
    <div className="p-6 md:p-8">
      <PageHeader title={/* label de lib/pillars */} count={cards.length}
        actions={<ViewToggle value={mode} />} />
      <CardGrid cards={cards} view={mode} />
    </div>
  );
}
```

```tsx
// page.tsx repassa searchParams
export default async function Page({ searchParams }: { searchParams: Promise<{ view?: string }> }) {
  const { view } = await searchParams;
  return <PageView pillar="direcao" page="oferta" view={view === "list" ? "list" : "grid"} />;
}
```

```tsx
// ViewToggle (client) — atualiza a URL sem reload total
"use client";
import { useRouter, usePathname, useSearchParams } from "next/navigation";
import { Select, /* ...trigger/content/item */ } from "@/components/ui/select";

export function ViewToggle({ value }: { value: "grid" | "list" }) {
  const router = useRouter(); const pathname = usePathname(); const sp = useSearchParams();
  function set(v: string) {
    const params = new URLSearchParams(sp); params.set("view", v);
    router.replace(`${pathname}?${params}`, { scroll: false });
  }
  return (
    <Select value={value} onValueChange={set}>
      {/* SelectItem "grid" -> "Grid", "list" -> "Lista" */}
    </Select>
  );
}
```

**Render dos dois modos no `CardGrid`:**

```tsx
export function CardGrid({ cards, view }: { cards: Card[]; view: "grid" | "list" }) {
  if (cards.length === 0) return <EmptyState title="Nenhum card ainda" /* ... */ />;
  return (
    <div className={view === "grid"
      ? "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4"
      : "flex flex-col gap-2"}>
      {cards.map((c) => <ContentCard key={c.id} card={c} view={view} />)}
    </div>
  );
}
```

`ContentCard` ajusta densidade por `view`: em `grid` mostra título + badge + preview de 3 linhas + tags; em `list` vira uma linha compacta (título à esquerda, badge/updated à direita).

---

## 9. Edição e persistência no MVP (Server Actions)

Persistência = **gravar o `.md` de volta** no filesystem, reconstruindo frontmatter + corpo. Implementado como Server Action.

```ts
// web/actions/cards.ts
"use server";
import { promises as fs } from "node:fs";
import path from "node:path";
import matter from "gray-matter";
import { revalidatePath } from "next/cache";
import { saveCardInput, type SaveCardInput } from "@/lib/schema";

export async function saveCard(input: SaveCardInput) {
  const data = saveCardInput.parse(input); // valida/coage (zod)
  const dir = path.join(process.cwd(), "content", data.pillar, data.page);
  await fs.mkdir(dir, { recursive: true });
  const file = path.join(dir, `${data.id}.md`);

  const frontmatter = {
    id: data.id,
    pillar: data.pillar,
    page: data.page,
    title: data.title,
    status: data.status,
    tags: data.tags,
    order: 0, // preservar/derivar; ver nota
    updated: new Date().toISOString().slice(0, 10),
  };

  const fileContents = matter.stringify(data.body ?? "", frontmatter); // reconstrói o .md
  await fs.writeFile(file, fileContents, "utf8");

  revalidatePath(`/${data.pillar}/${data.page}`); // reflete na UI
  return { ok: true as const };
}

// Complementares (mesma abordagem):
// export async function createCard(...)  // gera id (slug) + arquivo vazio (status: "empty"/"draft")
// export async function deleteCard(...)  // remove o arquivo (obs.: exclusão = ação destrutiva)
```

**O que é simplificado no MVP (explícito):**

- **`order` não é recalculado** aqui; o MVP grava `0` ou preserva o valor lido. Reordenação (drag & drop) fica fora de escopo.
- **Sem concorrência/locking, sem histórico/undo.** Última escrita vence.
- **`id`/nome do arquivo** são a chave; renomear título não renomeia o arquivo.
- **Sanitização** do slug/`id` no `createCard` (kebab-case, sem path traversal) é obrigatória, mas a lógica de merge é mínima.
- **Ressalva de ambiente (importante):** em runtime **serverless da Vercel o filesystem é read-only** (exceto `/tmp`) — portanto `saveCard` funciona em **dev local** e em servidores com FS gravável, mas **não persiste em produção na Vercel**. No MVP isso é aceitável (o app é single-user, editado localmente). É exatamente esse limite que motiva a migração para Supabase (seção 11). Documentar isso na UI (ex.: banner "modo local") é opcional.

O `CardEditor` (client) chama a action:

```tsx
"use client";
import { saveCard } from "@/actions/cards";
import { toast } from "sonner";
// onSubmit: await saveCard({ pillar, page, id, title, status, tags, body });
//   -> toast.success("Card salvo") | toast.error(...)
```

---

## 10. Setup do Storybook

- **Versão:** Storybook **8.x** (latest), framework **`@storybook/nextjs`** (suporta App Router, `next/font`, `next/image`, aliases `@/*`).
- **Addons:** `@storybook/addon-essentials` (controls, actions, docs, viewport, backgrounds) + `@storybook/addon-a11y` (checagem de contraste, importante no tema P&B).
- **Tema/estilo:** `.storybook/preview.ts` importa `app/globals.css` e aplica a fonte Inter + backgrounds branco/preto para validar contraste em ambos.

```ts
// web/.storybook/preview.ts (esqueleto)
import type { Preview } from "@storybook/react";
import "../app/globals.css";

const preview: Preview = {
  parameters: {
    backgrounds: {
      default: "light",
      values: [ { name: "light", value: "#ffffff" }, { name: "dark", value: "#0a0a0a" } ],
    },
    layout: "centered",
  },
};
export default preview;
```

**Componentes com stories (`stories/`):** `StatusBadge` (todos os 5 status), `ContentCard` (grid + list, cada status), `CardGrid` (com N cards e vazio ⇒ `EmptyState`), `ViewToggle`, `PageHeader`, `EmptyState`, `AppSidebar` (com nav mockada + item ativo), `CardEditor` (novo vs. edição). Priorizar os presentacionais (não os que dependem de FS): passar `Card` mockado por props em vez de chamar o loader.

> Componentes que fazem I/O de filesystem (`PageView`, loader) **não** ganham stories diretas — Storybook não roda Node FS de produção; testar via mocks nos componentes de apresentação.

---

## 11. Plano de migração futura para Supabase (alto nível)

Objetivo: substituir a persistência em FS por **Postgres (Supabase)** + **Auth**, mantendo o modelo de Card e a pasta `content/` como *export* de contexto para IA.

**Auth:**
- Supabase Auth (email/OTP ou OAuth). Introduzir `middleware.ts` para proteger rotas e sessão via `@supabase/ssr`.
- Multi-tenant: adicionar `owner_id` (user) para transformar o app single-user em multi-usuário.

**Modelo de dados (tabela equivalente ao Card):**

```sql
create table cards (
  id          text not null,               -- slug (único por owner+pillar+page)
  owner_id    uuid not null references auth.users(id),
  pillar      text not null check (pillar in ('founder','direcao','validacao','caixa')),
  page        text not null,
  title       text not null,
  status      text not null default 'empty'
              check (status in ('empty','draft','in-progress','review','done')),
  tags        text[] not null default '{}',
  "order"     int  not null default 0,
  body        text not null default '',     -- corpo em Markdown
  updated     date not null default now(),
  created_at  timestamptz not null default now(),
  primary key (owner_id, pillar, page, id)
);
alter table cards enable row level security;
create policy "owner can crud" on cards
  for all using (auth.uid() = owner_id) with check (auth.uid() = owner_id);
```

**Camada de acesso:**
- Trocar `lib/content.ts` (FS) por um repositório Supabase com **as mesmas assinaturas** (`getCards`, `getCard`, `getAllCards`, `getPillars`) — a UI não muda. Server Actions passam a fazer `insert/update/delete` no Postgres (resolvendo a limitação de FS read-only da Vercel).
- **Export de contexto para IA:** endpoint/action que faz `select *` e serializa como `.md` agregado (frontmatter + body) — reproduz o formato da pasta `content/`. Opcionalmente, um job sincroniza `cards` ⇄ arquivos `.md` num bucket (Supabase Storage) para manter a "pasta de contexto".
- Migração de dados: script que lê os `.md` existentes (via loader atual) e faz `upsert` em `cards`.

**Ordem sugerida:** (1) adicionar client Supabase + env; (2) criar tabela + RLS; (3) implementar repositório com as mesmas assinaturas atrás de um flag; (4) migrar dados; (5) ligar Auth + middleware; (6) desativar escrita em FS.

---

## 12. Deploy (Vercel) e ambiente

- **Root Directory (Vercel):** definir **`web`** como Root Directory do projeto na Vercel (já que o repo tem `web/`, `portfolio/`, `docs/` na raiz). Framework preset: **Next.js** (autodetectado). Build: `next build`. Output: gerenciado pelo preset.
- **Node:** 20.x (definir em `.nvmrc` e/ou Project Settings).
- **Conteúdo:** `content/**/*.md` é empacotado no build ⇒ **leitura** funciona em produção. **Escrita** via Server Action **não persiste** no runtime serverless (FS read-only) — ver seção 9. Para o MVP, editar localmente e commitar os `.md`, ou aguardar Supabase.
- **Variáveis de ambiente (MVP):** nenhuma obrigatória. Reservar (futuro Supabase): `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY` (server-only).
- **`.gitignore`:** `node_modules`, `.next`, `.vercel`, `storybook-static`, `*.log`. **Não** ignorar `content/` (é a fonte da verdade).
- **CI/preview:** cada push gera preview na Vercel. Storybook pode ser publicado separadamente (`storybook build` ⇒ `storybook-static/`) em Vercel/Chromatic, opcional.

---

## 13. Sequência de comandos de scaffold

**Local do app:** subpasta **`web/`** dentro da base do BusinessOS (justificativa na seção 2: irmã de `portfolio/` e `docs/`, e `web/` evita colisão de nome com o diretório `app/` do App Router). Rodar a partir da base do projeto.

> Assumir Node 20.x ativo. Onde houver prompt interativo, as respostas recomendadas estão anotadas.

```bash
# 0) Ir para a base do projeto BusinessOS
cd "/Users/marciovitale/Library/CloudStorage/CloudMounter-Vitale-Ensinando1/TREINAMENTOS/AI - ATLAS EXTREME/BusinessOS"

# 1) Criar o app Next.js na subpasta web/ (App Router, TS, Tailwind, ESLint, alias @/*, sem src-dir)
npx create-next-app@latest web \
  --typescript \
  --tailwind \
  --eslint \
  --app \
  --no-src-dir \
  --import-alias "@/*" \
  --use-npm

# 2) Entrar no projeto
cd web

# 3) Inicializar shadcn/ui
#    Prompts recomendados: style = "new-york"; base color = "neutral"; CSS variables = yes.
npx shadcn@latest init

# 4) Adicionar os componentes shadcn usados pelo app
npx shadcn@latest add button card select badge input textarea separator scroll-area label dropdown-menu sonner

# 5) Instalar dependências de conteúdo (parse + validação)
npm install gray-matter zod

# 6) Inicializar Storybook (detecta @storybook/nextjs automaticamente)
npx storybook@latest init --yes

# 7) (Opcional) addon de acessibilidade — útil no tema P&B
npm install -D @storybook/addon-a11y

# 8) Fixar versão do Node
node -v && echo "20" > .nvmrc   # ou o major LTS em uso (>=20)

# 9) Sanidade
npm run lint
npm run build
```

**Pós-scaffold (implementação, fora do escopo de comandos):**

1. Substituir o tema em `app/globals.css` pelos tokens dark-first da seção 7 (chroma 0) e ajustar `--radius: 1rem`.
2. Criar `lib/fonts.ts` (Inter) e aplicar `inter.variable` no `<html>` de `app/layout.tsx`; montar o shell sidebar + main.
3. Criar `lib/types.ts`, `lib/schema.ts`, `lib/pillars.ts`, `lib/content.ts` (seções 4–5).
4. Criar componentes de `components/` (seção 6) e `actions/cards.ts` (seção 9).
5. Criar as 12 rotas (home + 11 páginas) como *thin wrappers* de `PageView` (seção 3).
6. Popular `content/<pilar>/<pagina>/` com pelo menos 1 `.md` de exemplo por página (seção 5).
7. Escrever as stories da seção 10.

> **Nota sobre `--no-src-dir`:** escolhido para que `app/`, `components/`, `lib/` e `content/` fiquem no root de `web/` — exatamente a árvore da seção 2. Se preferir `src/`, mover `app/components/lib` para `src/` e manter `content/` no root de `web/` (o loader usa `process.cwd()/content`, que continua sendo o root do projeto, independente de `src/`).

---

## 14. Checklist de conformidade (para o agente que fizer o scaffold)

- [ ] App em `web/` (não na raiz; não em `app/`).
- [ ] 12 rotas exatas (home + 11), kebab-case, namespace por pilar (seção 3).
- [ ] `content/<pilar>/<pagina>/*.md` com frontmatter validado por zod (seções 4–5).
- [ ] Tipos `Card`/`Pillar`/`Page`/`Status` e schema zod conforme seção 5.
- [ ] Componentes shadcn instalados + customizados criados (seção 6).
- [ ] Tema dark-first editorial e monocromático (chroma 0), Inter via `next/font`, `--radius: 1rem` (seção 7).
- [ ] Toggle Grid/Lista via query param, Server Components preservados (seção 8).
- [ ] `saveCard` Server Action escreve `.md` via `gray-matter` + `revalidatePath` (seção 9); limitação FS/Vercel documentada.
- [ ] Storybook 8 + `@storybook/nextjs` + stories dos componentes presentacionais (seção 10).
- [ ] Sem Supabase/login/DB no MVP; caminho de migração documentado (seção 11).
```
