import type { Metadata } from "next";
import { PageView } from "@/components/page-view";

export const metadata: Metadata = { title: "Objetivo — Founder · AI2 - Business OS" };

export default async function Page({
  searchParams,
}: {
  searchParams: Promise<{ view?: string }>;
}) {
  const { view } = await searchParams;
  return (
    <PageView
      pillar="founder"
      page="objetivo"
      view={view === "list" ? "list" : "grid"}
    />
  );
}
