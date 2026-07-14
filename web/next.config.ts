import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  experimental: {
    serverActions: {
      // Upload de arquivos do repositório (RAG) passa por Server Action como
      // FormData binário — o limite default (1mb) é baixo demais para PDFs e
      // arquivos de texto maiores. 25mb cobre o MVP sem exagerar.
      bodySizeLimit: "25mb",
    },
  },
};

export default nextConfig;
