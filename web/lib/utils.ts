import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

// kebab-case + sem acentos + sem path traversal — usado para gerar ids de arquivo seguros.
export function slugify(value: string): string {
  return value
    .normalize("NFD")
    .replace(/\p{Diacritic}/gu, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 80)
}

// Sanitiza um nome de arquivo original (ex.: "Relatório Final (v2).pdf") para
// um nome seguro de usar num path de Storage, preservando a extensão.
export function sanitizeFileName(name: string): string {
  const dot = name.lastIndexOf(".")
  const hasExt = dot > 0 && dot < name.length - 1
  const base = hasExt ? name.slice(0, dot) : name
  const ext = hasExt ? name.slice(dot + 1) : ""
  const safeBase = slugify(base) || "arquivo"
  const safeExt = ext.toLowerCase().replace(/[^a-z0-9]/g, "").slice(0, 10)
  return safeExt ? `${safeBase}.${safeExt}` : safeBase
}
