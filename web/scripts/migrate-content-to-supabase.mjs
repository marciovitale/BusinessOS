// One-time (repeatable/idempotent) migration: reads content/**/*.md and
// agents/*.md from the filesystem and upserts them into Postgres, scoped to
// a given organization_id. Run with:
//   node scripts/migrate-content-to-supabase.mjs <organization_id>
import { promises as fs } from "node:fs";
import path from "node:path";
import matter from "gray-matter";
import { createClient } from "@supabase/supabase-js";

const orgId = process.argv[2];
if (!orgId) {
  console.error("Uso: node scripts/migrate-content-to-supabase.mjs <organization_id>");
  process.exit(1);
}

// Lê .env.local manualmente (script standalone, sem depender do dotenv nem
// do carregamento de env do Next.js).
async function loadEnvLocal() {
  const raw = await fs.readFile(path.join(process.cwd(), ".env.local"), "utf8");
  for (const line of raw.split("\n")) {
    const match = line.match(/^([A-Z0-9_]+)=(.*)$/);
    if (match && !process.env[match[1]]) {
      process.env[match[1]] = match[2].trim();
    }
  }
}
await loadEnvLocal();

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
if (!supabaseUrl || !serviceRoleKey) {
  console.error("Faltam NEXT_PUBLIC_SUPABASE_URL / SUPABASE_SERVICE_ROLE_KEY no ambiente.");
  process.exit(1);
}

const supabase = createClient(supabaseUrl, serviceRoleKey);

const CONTENT_ROOT = path.join(process.cwd(), "content");
const AGENTS_ROOT = path.join(process.cwd(), "agents");

async function isDir(p) {
  try {
    return (await fs.stat(p)).isDirectory();
  } catch {
    return false;
  }
}

async function migrateCards() {
  const rows = [];
  const pillars = await fs.readdir(CONTENT_ROOT);
  for (const pillar of pillars) {
    const pillarDir = path.join(CONTENT_ROOT, pillar);
    if (!(await isDir(pillarDir))) continue;
    const pages = await fs.readdir(pillarDir);
    for (const page of pages) {
      const pageDir = path.join(pillarDir, page);
      if (!(await isDir(pageDir))) continue;
      const files = (await fs.readdir(pageDir)).filter((f) => f.endsWith(".md"));
      for (const file of files) {
        const raw = await fs.readFile(path.join(pageDir, file), "utf8");
        const { data, content } = matter(raw);
        const id = data.id ?? file.replace(/\.md$/, "");
        const updated =
          data.updated instanceof Date
            ? data.updated.toISOString().slice(0, 10)
            : (data.updated ?? new Date().toISOString().slice(0, 10));
        rows.push({
          organization_id: orgId,
          id,
          pillar,
          page,
          title: data.title,
          status: data.status ?? "empty",
          tags: data.tags ?? [],
          order: Number.isFinite(data.order) ? data.order : 0,
          body: content.trim(),
          updated,
        });
      }
    }
  }

  if (rows.length === 0) return;
  const { error } = await supabase
    .from("cards")
    .upsert(rows, { onConflict: "organization_id,pillar,page,id" });
  if (error) throw new Error(`cards upsert falhou: ${error.message}`);
  console.log(`Migrados ${rows.length} cards para a organização ${orgId}.`);
}

async function migrateAgents() {
  const files = (await fs.readdir(AGENTS_ROOT)).filter((f) => f.endsWith(".md"));
  const rows = [];
  for (const file of files) {
    const raw = await fs.readFile(path.join(AGENTS_ROOT, file), "utf8");
    const { data, content } = matter(raw);
    const id = data.id ?? file.replace(/\.md$/, "");
    const pages = data.pages ?? (data.page ? [data.page] : []);
    rows.push({
      organization_id: orgId,
      id,
      title: data.title,
      description: data.description ?? null,
      system: content.trim(),
      scope: data.scope ?? null,
      pillar: data.pillar ?? null,
      pages,
    });
  }

  if (rows.length === 0) return;
  const { error } = await supabase
    .from("agents")
    .upsert(rows, { onConflict: "organization_id,id" });
  if (error) throw new Error(`agents upsert falhou: ${error.message}`);
  console.log(`Migrados ${rows.length} agents para a organização ${orgId}.`);
}

await migrateCards();
await migrateAgents();
console.log("Migração concluída.");
