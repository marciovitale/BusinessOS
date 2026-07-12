import type { Metadata } from "next";
import { PageView } from "@/components/page-view";

export const metadata: Metadata = {
  title: "Primeiros clientes — Validação · BusinessOS",
};

export default async function Page({
  searchParams,
}: {
  searchParams: Promise<{ view?: string }>;
}) {
  const { view } = await searchParams;
  return (
    <PageView
      pillar="validacao"
      page="primeiros-clientes"
      view={view === "list" ? "list" : "grid"}
    />
  );
}
