import type { Metadata } from "next";
import { PageView } from "@/components/page-view";

export const metadata: Metadata = { title: "ERP — Caixa · AI2 - Business OS" };

export default async function Page({
  searchParams,
}: {
  searchParams: Promise<{ view?: string }>;
}) {
  const { view } = await searchParams;
  return (
    <PageView
      pillar="caixa"
      page="erp"
      view={view === "list" ? "list" : "grid"}
    />
  );
}
