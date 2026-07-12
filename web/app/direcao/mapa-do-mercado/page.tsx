import type { Metadata } from "next";
import { PageView } from "@/components/page-view";

export const metadata: Metadata = {
  title: "Mapa do Mercado — Direção · BusinessOS",
};

export default async function Page({
  searchParams,
}: {
  searchParams: Promise<{ view?: string }>;
}) {
  const { view } = await searchParams;
  return (
    <PageView
      pillar="direcao"
      page="mapa-do-mercado"
      view={view === "list" ? "list" : "grid"}
    />
  );
}
