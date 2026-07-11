// Sugestões de cards típicos por página (PRD seção 3.2). Usadas no empty state.
export const CARD_SUGGESTIONS: Record<string, string[]> = {
  "founder/objetivo": [
    "Objetivo de 12 meses",
    "Definição de sucesso",
    "Visão de longo prazo (3–5 anos)",
    "Por que este negócio",
    "Metas trimestrais",
  ],
  "founder/estilo-de-vida": [
    "Renda-alvo mensal",
    "Horas de trabalho desejadas",
    "Limites e inegociáveis",
    "Localização / modo de trabalho",
    "Tolerância a risco",
  ],
  "direcao/mapa-do-mercado": [
    "Concorrentes diretos",
    "Alternativas / substitutos",
    "Tendências do mercado",
    "Tamanho e segmentação",
    "Referências e inspirações",
  ],
  "direcao/ima-de-problemas": [
    "Lista de dores",
    "Dor prioritária",
    "Evidências / falas de clientes",
    "Gravidade x frequência",
    "Gatilhos",
  ],
  "direcao/perfil-ideal-de-cliente": [
    "Perfil demográfico/firmográfico",
    "Dores e desejos do ICP",
    "Onde encontrá-lo",
    "Critérios de bom cliente",
    "Anti-persona",
  ],
  "direcao/tese-de-valor": [
    "Proposta de valor",
    "Diferencial competitivo",
    "Ganhos para o cliente",
    "Prova / credibilidade",
    "Riscos da tese",
  ],
  "direcao/oferta": [
    "O que está sendo vendido",
    "Estrutura de preço",
    "Entregáveis e escopo",
    "Oferta irresistível",
    "Canais de venda",
  ],
  "validacao/oferta": [
    "Experimentos de oferta",
    "Resultados e métricas",
    "Feedback qualitativo",
    "Aprendizados / ajustes",
    "Decisão: pivotar ou seguir",
  ],
  "validacao/primeiros-clientes": [
    "Lista de leads/prospects",
    "Primeiras vendas",
    "Depoimentos / casos",
    "Objeções mais comuns",
    "Canais que funcionaram",
  ],
  "caixa/fluxo-de-caixa": [
    "Entradas",
    "Saídas",
    "Saldo atual",
    "Runway",
    "Ponto de equilíbrio",
  ],
  "caixa/erp": [
    "Cadastro do negócio",
    "Ferramentas e assinaturas",
    "Contas e acessos",
    "Fornecedores",
    "Obrigações e prazos",
  ],
};

export function getSuggestions(pillar: string, page: string): string[] {
  return CARD_SUGGESTIONS[`${pillar}/${page}`] ?? [];
}
