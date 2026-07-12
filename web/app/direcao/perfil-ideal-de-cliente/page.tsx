import type { Metadata } from "next";
import { PageView } from "@/components/page-view";

export const metadata: Metadata = {
  title: "Perfil Ideal de Cliente — Direção · BusinessOS",
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
      page="perfil-ideal-de-cliente"
      view={view === "list" ? "list" : "grid"}
    />
  );
}
